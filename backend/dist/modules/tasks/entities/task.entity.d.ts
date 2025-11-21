import { ProjectStage } from '../../projects/entities/project-stage.entity';
import { User } from '../../users/entities/user.entity';
export declare enum TaskStatus {
    ON_TRACK = "on_track",
    AT_RISK = "at_risk",
    OVERDUE = "overdue",
    COMPLETED = "completed"
}
export declare class Task {
    id: string;
    name: string;
    description: string;
    startDate: Date;
    endDate: Date;
    estimatedHours: number;
    status: TaskStatus;
    isCompleted: boolean;
    stage: ProjectStage;
    stageId: string;
    assignedTeamMembers: User[];
    dependencies: any;
    requiredAssets: any;
    createdAt: Date;
}
