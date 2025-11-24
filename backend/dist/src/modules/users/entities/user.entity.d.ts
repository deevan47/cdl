import { Project } from '../../projects/entities/project.entity';
import { ProjectStage } from '../../projects/entities/project-stage.entity';
import { Task } from '../../tasks/entities/task.entity';
export declare enum UserRole {
    ADMIN = "admin",
    PROJECT_MANAGER = "project_manager",
    RESEARCH_ASSOCIATE = "research_associate",
    ANIMATOR_SPECIALIST = "animator_Specialist",
    EDITOR = "editor",
    ANIMATOR = "animator",
    ASSISTANT_ADMINISTRATOR = "assistant_administrator"
}
export declare class User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    avatar: string;
    password?: string;
    isActive: boolean;
    managedProjects: Project[];
    assignedStages: ProjectStage[];
    assignedTasks: Task[];
    createdAt: Date;
    updatedAt: Date;
}
