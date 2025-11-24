import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  async findTasksByUserId(userId: string): Promise<Task[]> {
    return this.taskRepository
      .createQueryBuilder('task')
      .leftJoin('task.assignedTeamMembers', 'user')
      .leftJoinAndSelect('task.stage', 'stage')
      .leftJoinAndSelect('stage.project', 'project')
      .where('user.id = :userId', { userId })
      .orderBy('task.endDate', 'ASC')
      .getMany();
  }

  create(createTaskDto: Partial<Task>) {
    const task = this.taskRepository.create(createTaskDto as any);
    return this.taskRepository.save(task);
  }

  findAll() {
    return this.taskRepository.find({ relations: ['stage', 'assignedTeamMembers'] });
  }

  async findOne(id: string) {
    const task = await this.taskRepository.findOne({ where: { id }, relations: ['stage', 'assignedTeamMembers'] });
    if (!task) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }
    return task;
  }

  async update(id: string, updateTaskDto: Partial<Task>) {
    const task = await this.taskRepository.preload({ id, ...(updateTaskDto as any) });
    if (!task) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }
    return this.taskRepository.save(task);
  }

  async remove(id: string) {
    const task = await this.findOne(id);
    await this.taskRepository.remove(task);
    return { deleted: true };
  }

  async assignUserToTask(taskId: string, userId: string): Promise<Task> {
    const task = await this.findOne(taskId);
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException(`User with ID "${userId}" not found`);
    }

    // Initialize array if undefined
    if (!task.assignedTeamMembers) {
      task.assignedTeamMembers = [];
    }

    // Check if already assigned
    if (!task.assignedTeamMembers.some(u => u.id === userId)) {
      task.assignedTeamMembers.push(user);
    }

    return this.taskRepository.save(task);
  }
}