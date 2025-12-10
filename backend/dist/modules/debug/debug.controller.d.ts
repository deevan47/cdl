import { UsersService } from '../users/users.service';
export declare class DebugController {
    private readonly usersService;
    constructor(usersService: UsersService);
    listAllUsers(): Promise<import("../users/entities/user.entity").User[]>;
}
