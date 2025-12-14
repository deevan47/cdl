import { Injectable, NotFoundException, Logger, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { Project } from '../projects/entities/project.entity';
import * as bcrypt from 'bcryptjs';
import * as admin from 'firebase-admin';

import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly notificationsService: NotificationsService,
  ) { }

  // --- LOGIN HELPER (Fixes the password issue) ---
  async findUserForLogin(email: string): Promise<User | null> {
    this.logger.debug(`findUserForLogin: Fetching ${email}`);
    // Use QueryBuilder to explicitly add the hidden password column
    return this.usersRepository.createQueryBuilder('user')
      .where('user.email = :email', { email })
      .addSelect('user.password')
      .getOne();
  }

  // --- STANDARD METHODS ---

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }

  // FIX 1: Added missing findAllRaw method
  async findAllRaw(): Promise<User[]> {
    return this.usersRepository.find({
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  // FIX 2: Added missing findByRole method
  async findByRole(role: UserRole): Promise<User[]> {
    return this.usersRepository.find({
      where: { role, isActive: true },
      order: { name: 'ASC' },
    });
  }

  async create(userData: Partial<User>): Promise<User> {
    this.logger.log(`create: creating user email=${userData?.email}`);

    if (userData.email) {
      const existingUser = await this.findByEmail(userData.email);
      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }
    }

    const rawPassword = userData.password; // Capture raw password for Firebase

    // 1. Create in Firebase (if Admin SDK is initialized)
    if (admin.apps.length && rawPassword && userData.email) {
      try {
        await admin.auth().createUser({
          email: userData.email,
          password: rawPassword,
          displayName: userData.name,
        });
        this.logger.log(`Created Firebase user: ${userData.email}`);
      } catch (error) {
        this.logger.error(`Failed to create Firebase user: ${error.message}`);
        // We continue to create in DB, but log the error. 
        // In a strict mode, we might want to throw here.
      }
    }

    // 2. Create in DB
    if (userData.password) {
      const salt = await bcrypt.genSalt(10);
      userData.password = await bcrypt.hash(userData.password, salt);
    }
    const user = this.usersRepository.create(userData);
    const savedUser = await this.usersRepository.save(user);

    // Send Welcome Email if created manually (has password)
    if (userData.password && userData.email) {
      try {
        await this.notificationsService.sendEmail(
          userData.email,
          'Welcome to CDL Project Management System',
          `Welcome to CDL!\n\nYour account has been created.\n\nLogin Email: ${userData.email}\nPassword: ${rawPassword}\n\nYou can also login with Google if your email matches.\n\nBest regards,\nCDL Team`
        );
        this.logger.log(`Sent welcome email to ${userData.email}`);
      } catch (e) {
        this.logger.error(`Failed to send welcome email to ${userData.email}`, e);
      }
    }

    return savedUser;
  }

  async getAssignedProjects(userId: string): Promise<Project[]> {
    const projectRepo = this.usersRepository.manager.getRepository(Project);
    return projectRepo.createQueryBuilder('project')
      .leftJoinAndSelect('project.stages', 'stage')
      .leftJoinAndSelect('stage.assignedTeamMembers', 'member')
      .leftJoinAndSelect('project.projectManager', 'manager')
      .where('manager.id = :userId', { userId })
      .orWhere('member.id = :userId', { userId })
      .orderBy('project.created_at', 'DESC')
      .getMany();
  }

  async update(id: string, userData: Partial<User>): Promise<User> {
    await this.usersRepository.update(id, userData);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['managedProjects', 'assignedStages', 'assignedTasks', 'comments']
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // 1. Remove from Firebase
    if (admin.apps.length && user.email) {
      try {
        const firebaseUser = await admin.auth().getUserByEmail(user.email);
        await admin.auth().deleteUser(firebaseUser.uid);
        this.logger.log(`Deleted Firebase user: ${user.email}`);
      } catch (error) {
        this.logger.warn(`Failed to delete Firebase user: ${error.message}`);
      }
    }

    // 2. Remove from DB with Transaction
    const queryRunner = this.usersRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Clear Managed Projects (Set Null) - handled by DB constraint but good to be explicit or if constraint missing
      if (user.managedProjects?.length) {
        for (const project of user.managedProjects) {
          project.projectManager = null;
          await queryRunner.manager.save(project);
        }
      }

      // Remove from Assigned Stages (ManyToMany)
      if (user.assignedStages?.length) {
        user.assignedStages = [];
        await queryRunner.manager.save(user);
      }

      // Remove from Assigned Tasks (ManyToMany)
      if (user.assignedTasks?.length) {
        user.assignedTasks = [];
        await queryRunner.manager.save(user);
      }

      // Comments are CASCADE, so they will be deleted automatically.

      // Finally delete the user
      await queryRunner.manager.remove(user);

      await queryRunner.commitTransaction();
      this.logger.log(`Successfully deleted user ${id} from database`);
    } catch (err) {
      this.logger.error(`Failed to delete user ${id} from database`, err);
      await queryRunner.rollbackTransaction();
      throw new ConflictException(`Could not delete user: ${err.message}`);
    } finally {
      await queryRunner.release();
    }
  }
}