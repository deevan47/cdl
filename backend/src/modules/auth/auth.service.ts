import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { NotificationsService } from '../notifications/notifications.service';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import * as admin from 'firebase-admin';

import * as path from 'path';

@Injectable()
export class AuthService {
  private jwtSecret = process.env.JWT_SECRET || 'dev_secret_change_me';
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private notificationsService: NotificationsService
  ) {
    if (!admin.apps.length) {
      try {
        const firebaseConfigEnv = process.env.FIREBASE_SERVICE_ACCOUNT;
        let serviceAccount;

        if (firebaseConfigEnv) {
          try {
            serviceAccount = JSON.parse(firebaseConfigEnv);
          } catch (e) {
            this.logger.warn('Failed to parse FIREBASE_SERVICE_ACCOUNT environment variable', e);
          }
        }

        if (!serviceAccount) {
          const serviceAccountPath = path.join(process.cwd(), 'service-account.json');
          serviceAccount = require(serviceAccountPath);
        }

        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
      } catch (error) {
        this.logger.warn('Failed to initialize Firebase Admin. Make sure FIREBASE_SERVICE_ACCOUNT env var is set or service-account.json exists.', error);
      }
    }
  }

  async login(email: string, password: string) {
    const user = await this.usersService.findUserForLogin(email);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.password) {
      throw new UnauthorizedException('Password not set for user');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Your account is pending approval. Please contact the administrator.');
    }

    const matches = await bcrypt.compare(password, user.password);
    if (!matches) {
      throw new UnauthorizedException('Invalid password');
    }

    return this.generateUserResponse(user);
  }

  async loginWithFirebase(token: string) {
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      const email = decodedToken.email;
      const name = decodedToken.name || email.split('@')[0];
      const picture = decodedToken.picture;

      if (!email) {
        throw new UnauthorizedException('Invalid Firebase Token: No email found');
      }



      let user = await this.usersService.findByEmail(email);

      if (!user) {

        user = await this.usersService.create({
          email,
          name,
          role: 'user' as any,
          isActive: false,
          avatar: picture
        });

        // Notify Admins
        try {
          const admins = await this.usersService.findByRole('admin' as any);
          const adminEmails = admins.map(a => a.email);

          for (const adminEmail of adminEmails) {
            // 1. Send Email
            await this.notificationsService.sendEmail(
              adminEmail,
              'New User Registration Request',
              `A new user has registered and is awaiting approval.\n\nName: ${name}\nEmail: ${email}\n\nPlease log in to the admin dashboard to approve this user.`
            );
          }

          // 2. Create In-App Notification for ALL Admins
          const adminUsers = await this.usersService.findByRole('admin' as any);
          for (const adminUser of adminUsers) {
            await this.notificationsService.create(
              adminUser.id,
              'New User Request',
              `${name} (${email}) has requested access.`,
              'info'
            );
          }
        } catch (e) {
          this.logger.error('Failed to notify admins', e);
        }

        throw new UnauthorizedException('Your account is pending approval. An email has been sent to the administrator.');
      }

      if (!user.isActive) {
        throw new UnauthorizedException('Your account is pending approval. Please contact the administrator.');
      }

      // Update avatar if changed
      if (picture && user.avatar !== picture) {
        await this.usersService.update(user.id, { avatar: picture });
        user.avatar = picture;
      }

      // 3. Return Session
      return this.generateUserResponse(user);

    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.error('Firebase token verification failed', error);
      throw new UnauthorizedException('Invalid Firebase Token');
    }
  }

  private async generateUserResponse(user: any) {
    // 3. Token
    const payload = { sub: user.id, email: user.email, role: user.role };
    const token = jwt.sign(payload, this.jwtSecret, { expiresIn: '7d' });

    // 4. Projects
    let assignedProjects = [];
    try {
      assignedProjects = await this.usersService.getAssignedProjects(user.id);
    } catch (e) { }

    return {
      accessToken: token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role, avatar: user.avatar },
      assignedProjects,
    };
  }

  async register(userData: any) {
    // Reuse existing register logic
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(userData.password, salt);
    const created = await this.usersService.create({ ...userData, password: hash });
    const { password, ...rest } = created as any;
    return rest;
  }
}