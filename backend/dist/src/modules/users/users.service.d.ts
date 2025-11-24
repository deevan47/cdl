import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { Project } from '../projects/entities/project.entity';
export declare class UsersService {
    private readonly usersRepository;
    private readonly logger;
    constructor(usersRepository: Repository<User>);
    findUserForLogin(email: string): Promise<User | null>;
    findAll(): Promise<User[]>;
    findAllRaw(): Promise<User[]>;
    findOne(id: string): Promise<User>;
    findByEmail(email: string): Promise<User | null>;
    findByRole(role: UserRole): Promise<User[]>;
    create(userData: Partial<User>): Promise<User>;
    getAssignedProjects(userId: string): Promise<Project[]>;
    update(id: string, userData: Partial<User>): Promise<User>;
    remove(id: string): Promise<void>;
}
