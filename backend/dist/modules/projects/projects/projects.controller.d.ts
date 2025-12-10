import { ProjectsService } from './projects.service';
import { Project, ProjectPlatform } from '../entities/project.entity';
import { CreateProjectDto } from './dto/create-project-dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Task } from '../../tasks/entities/task.entity';
import { User } from '../../users/entities/user.entity';
export declare class AssignUsersDto {
    userIds: string[];
}
export declare class ProjectsController {
    private readonly projectsService;
    private readonly logger;
    constructor(projectsService: ProjectsService);
    assignUsersToStage(stageId: string, body: AssignUsersDto): Promise<any>;
    assignUsersToTask(taskId: string, body: AssignUsersDto): Promise<any>;
    findAll(): Promise<Project[]>;
    getAssignedProjects(userId: string): Promise<Project[]>;
    findByPlatform(platform: ProjectPlatform): Promise<Project[]>;
    findOne(id: string): Promise<Project>;
    create(createProjectDto: CreateProjectDto): Promise<Project>;
    update(id: string, updateProjectDto: UpdateProjectDto): Promise<Project>;
    remove(id: string): Promise<void>;
    assignProjectManager(id: string, managerId: string): Promise<Project>;
    calculateHealth(id: string): Promise<{
        progress: number;
        status: import("../entities/project.entity").ProjectStatus;
    }>;
    getAvailableManagers(): Promise<User[]>;
    addTaskToStage(stageId: string, taskData: Partial<Task>): Promise<Task>;
}
