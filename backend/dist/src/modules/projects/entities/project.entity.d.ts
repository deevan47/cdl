import { User } from '../../users/entities/user.entity';
import { ProjectStage } from './project-stage.entity';
import { Comment } from '../../comments/entities/comment.entity';
export declare enum ProjectPlatform {
    FLAME = "flame",
    SWAYAM = "swayam"
}
export declare enum ProjectStatus {
    SETUP = "setup",
    IN_PROGRESS = "in_progress",
    AT_RISK = "at_risk",
    LAGGING = "lagging",
    COMPLETED = "completed",
    ARCHIVED = "archived"
}
export declare class Project {
    id: string;
    name: string;
    platform: ProjectPlatform;
    scenario: string;
    status: ProjectStatus;
    overallProgress: number;
    projectManager: User;
    stages: ProjectStage[];
    comments: Comment[];
    deadline: Date;
    archived: boolean;
    createdAt: Date;
    updatedAt: Date;
}
