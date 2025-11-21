import { Project } from './project.entity';
import { Task } from '../../tasks/entities/task.entity';
import { User } from '../../users/entities/user.entity';
export declare enum StageName {
    PRE_PRODUCTION = "Pre-Production",
    PRODUCTION = "Production",
    POST_PRODUCTION = "Post-Production"
}
export declare enum StageStatus {
    ON_TRACK = "on_track",
    AT_RISK = "at_risk",
    OVERDUE = "overdue",
    COMPLETED = "completed"
}
export declare class ProjectStage {
    id: string;
    name: StageName;
    status: StageStatus;
    progress: number;
    isOpen: boolean;
    project: Project;
    projectId: string;
    tasks: Task[];
    assignedTeamMembers: User[];
    constructor(partial: Partial<ProjectStage>);
}
