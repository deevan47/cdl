import { Repository } from 'typeorm';
import { Task } from './entities/task.entity';
export declare class TasksService {
    private readonly taskRepository;
    constructor(taskRepository: Repository<Task>);
    findTasksByUserId(userId: string): Promise<Task[]>;
    create(createTaskDto: Partial<Task>): Promise<Task[]>;
    findAll(): Promise<Task[]>;
    findOne(id: string): Promise<Task>;
    update(id: string, updateTaskDto: Partial<Task>): Promise<Task>;
    remove(id: string): Promise<{
        deleted: boolean;
    }>;
}
