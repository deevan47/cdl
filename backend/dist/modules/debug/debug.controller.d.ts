import { UsersService } from '../users/user.service';
export declare class DebugController {
    private readonly usersService;
    constructor(usersService: UsersService);
    listAllUsers(): Promise<import("../users/entities/user.entity").User[]>;
}
