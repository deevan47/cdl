import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  private jwtSecret = process.env.JWT_SECRET || 'dev_secret_change_me';
  private readonly logger = new Logger(AuthService.name);

  constructor(private usersService: UsersService) {}

  async login(email: string, password: string) {
    // 1. Get User WITH password
    const user = await this.usersService.findUserForLogin(email);
    
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.password) {
      // If this happens now, it means the DB column is literally NULL
      throw new UnauthorizedException('Password not set for user');
    }

    // 2. Compare
    const matches = await bcrypt.compare(password, user.password);
    if (!matches) {
      throw new UnauthorizedException('Invalid password');
    }

    // 3. Token
    const payload = { sub: user.id, email: user.email, role: user.role };
    const token = jwt.sign(payload, this.jwtSecret, { expiresIn: '7d' });

    // 4. Projects
    let assignedProjects = [];
    try {
      assignedProjects = await this.usersService.getAssignedProjects(user.id);
    } catch (e) {}

    return {
      accessToken: token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
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