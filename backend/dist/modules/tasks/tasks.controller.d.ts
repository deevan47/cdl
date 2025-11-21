import { TasksService } from './tasks.service';
export declare class TasksController {
    private readonly tasksService;
    constructor(tasksService: TasksService);
    findTasksByUserId(userId: string): Promise<import("./entities/task.entity").Task[]>;
    create(createTaskDto: any): Promise<import("./entities/task.entity").Task[]>;
    findAll(): Promise<import("./entities/task.entity").Task[]>;
    findOne(id: string): Promise<import("./entities/task.entity").Task>;
    update(id: string, updateTaskDto: any): Promise<import("./entities/task.entity").Task>;
    remove(id: string): Promise<{
        deleted: boolean;
    }>;
}
