import { User } from '../../users/entities/user.entity';
import { Project } from '../../projects/entities/project.entity';
export declare class Comment {
    id: string;
    content: string;
    createdAt: Date;
    user: User;
    project: Project;
}
