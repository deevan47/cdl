import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { Project } from '../projects/entities/project.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
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
    if (userData.password) {
      const salt = await bcrypt.genSalt(10);
      userData.password = await bcrypt.hash(userData.password, salt);
    }
    const user = this.usersRepository.create(userData);
    return this.usersRepository.save(user);
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
    const result = await this.usersRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }
}