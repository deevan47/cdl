import { UsersService } from '../users/users.service';
export declare class AuthService {
    private usersService;
    private jwtSecret;
    private readonly logger;
    constructor(usersService: UsersService);
    login(email: string, password: string): Promise<{
        accessToken: any;
        user: {
            id: string;
            email: string;
            name: string;
            role: import("../users/entities/user.entity").UserRole;
        };
        assignedProjects: any[];
    }>;
    register(userData: any): Promise<any>;
}
