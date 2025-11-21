import { AuthService } from './auth.service';
export declare class AuthController {
    private authService;
    private readonly logger;
    constructor(authService: AuthService);
    login(body: {
        email: string;
        password: string;
    }): Promise<{
        accessToken: any;
        user: {
            id: string;
            email: string;
            name: string;
            role: import("../users/entities/user.entity").UserRole;
        };
        assignedProjects: any[];
    }>;
    register(body: any): Promise<any>;
}
