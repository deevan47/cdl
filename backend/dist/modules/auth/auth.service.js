"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("../users/users.service");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
let AuthService = AuthService_1 = class AuthService {
    constructor(usersService) {
        this.usersService = usersService;
        this.jwtSecret = process.env.JWT_SECRET || 'dev_secret_change_me';
        this.logger = new common_1.Logger(AuthService_1.name);
    }
    async login(email, password) {
        const user = await this.usersService.findUserForLogin(email);
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        if (!user.password) {
            throw new common_1.UnauthorizedException('Password not set for user');
        }
        const matches = await bcrypt.compare(password, user.password);
        if (!matches) {
            throw new common_1.UnauthorizedException('Invalid password');
        }
        const payload = { sub: user.id, email: user.email, role: user.role };
        const token = jwt.sign(payload, this.jwtSecret, { expiresIn: '7d' });
        let assignedProjects = [];
        try {
            assignedProjects = await this.usersService.getAssignedProjects(user.id);
        }
        catch (e) { }
        return {
            accessToken: token,
            user: { id: user.id, email: user.email, name: user.name, role: user.role },
            assignedProjects,
        };
    }
    async register(userData) {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(userData.password, salt);
        const created = await this.usersService.create({ ...userData, password: hash });
        const { password, ...rest } = created;
        return rest;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], AuthService);
//# sourceMappingURL=auth.service.js.map