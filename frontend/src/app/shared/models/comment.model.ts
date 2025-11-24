import { User } from './user.model';

export interface Comment {
    id: string;
    content: string;
    createdAt: Date;
    user: User;
    projectId: string;
}
