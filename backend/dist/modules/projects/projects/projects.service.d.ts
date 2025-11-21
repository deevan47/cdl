import { Repository } from 'typeorm';
import { Project, ProjectPlatform, ProjectStatus } from '../entities/project.entity';
import { ProjectStage } from '../entities/project-stage.entity';
import { Task } from '../../tasks/entities/task.entity';
import { User } from '../../users/entities/user.entity';
import { CreateProjectDto } from './dto/create-project-dto';
import { UpdateProjectDto } from './dto/update-project.dto';
export declare class ProjectsService {
    private projectsRepository;
    private stagesRepository;
    private tasksRepository;
    private usersRepository;
    assignUsersToStage(stageId: string, userIds: string[]): Promise<ProjectStage>;
    private readonly logger;
    constructor(projectsRepository: Repository<Project>, stagesRepository: Repository<ProjectStage>, tasksRepository: Repository<Task>, usersRepository: Repository<User>);
    findAll(): Promise<Project[]>;
    findOne(id: string): Promise<Project>;
    findByPlatform(platform: ProjectPlatform): Promise<Project[]>;
    create(createProjectDto: CreateProjectDto): Promise<Project>;
    private createDefaultStages;
    update(id: string, updateProjectDto: UpdateProjectDto): Promise<Project>;
    remove(id: string): Promise<void>;
    assignProjectManager(projectId: string, managerId: string): Promise<Project>;
    calculateProjectHealth(projectId: string): Promise<{
        progress: number;
        status: ProjectStatus;
    }>;
    private calculateStageHealth;
    getProjectManagers(): Promise<User[]>;
    getAssignedProjects(userId: string): Promise<Project[]>;
    addTaskToStage(stageId: string, taskData: Partial<Task>): Promise<Task>;
}
