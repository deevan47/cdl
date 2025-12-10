import { Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { User } from '../users/entities/user.entity';
export declare class TasksService {
    private readonly taskRepository;
    private readonly userRepository;
    constructor(taskRepository: Repository<Task>, userRepository: Repository<User>);
    findTasksByUserId(userId: string): Promise<Task[]>;
    create(createTaskDto: Partial<Task>): Promise<Task[]>;
    findAll(): Promise<Task[]>;
    findOne(id: string): Promise<Task>;
    update(id: string, updateTaskDto: Partial<Task>): Promise<Task>;
    remove(id: string): Promise<{
        deleted: boolean;
    }>;
    assignUserToTask(taskId: string, userId: string): Promise<Task>;
}
