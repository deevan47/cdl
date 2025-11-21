import { User } from '../../users/entities/user.entity';
import { ProjectStage } from './project-stage.entity';
export declare enum ProjectPlatform {
    FLAME = "flame",
    SWAYAM = "swayam"
}
export declare enum ProjectStatus {
    SETUP = "setup",
    IN_PROGRESS = "in_progress",
    AT_RISK = "at_risk",
    LAGGING = "lagging",
    COMPLETED = "completed"
}
export declare class Project {
    id: string;
    name: string;
    platform: ProjectPlatform;
    scenario: string;
    status: ProjectStatus;
    overallProgress: number;
    projectManager: User;
    projectManagerId: string;
    stages: ProjectStage[];
    deadline: Date;
    createdAt: Date;
    updatedAt: Date;
}
