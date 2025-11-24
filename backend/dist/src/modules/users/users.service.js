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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var UsersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("./entities/user.entity");
const project_entity_1 = require("../projects/entities/project.entity");
const bcrypt = require("bcryptjs");
let UsersService = UsersService_1 = class UsersService {
    constructor(usersRepository) {
        this.usersRepository = usersRepository;
        this.logger = new common_1.Logger(UsersService_1.name);
    }
    async findUserForLogin(email) {
        this.logger.debug(`findUserForLogin: Fetching ${email}`);
        return this.usersRepository.createQueryBuilder('user')
            .where('user.email = :email', { email })
            .addSelect('user.password')
            .getOne();
    }
    async findAll() {
        return this.usersRepository.find({
            where: { isActive: true },
            order: { name: 'ASC' },
        });
    }
    async findAllRaw() {
        return this.usersRepository.find({
            order: { name: 'ASC' },
        });
    }
    async findOne(id) {
        const user = await this.usersRepository.findOne({ where: { id } });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
        return user;
    }
    async findByEmail(email) {
        return this.usersRepository.findOne({ where: { email } });
    }
    async findByRole(role) {
        return this.usersRepository.find({
            where: { role, isActive: true },
            order: { name: 'ASC' },
        });
    }
    async create(userData) {
        this.logger.log(`create: creating user email=${userData?.email}`);
        if (userData.password) {
            const salt = await bcrypt.genSalt(10);
            userData.password = await bcrypt.hash(userData.password, salt);
        }
        const user = this.usersRepository.create(userData);
        return this.usersRepository.save(user);
    }
    async getAssignedProjects(userId) {
        const projectRepo = this.usersRepository.manager.getRepository(project_entity_1.Project);
        return projectRepo.createQueryBuilder('project')
            .leftJoinAndSelect('project.stages', 'stage')
            .leftJoinAndSelect('stage.assignedTeamMembers', 'member')
            .leftJoinAndSelect('project.projectManager', 'manager')
            .where('manager.id = :userId', { userId })
            .orWhere('member.id = :userId', { userId })
            .orderBy('project.created_at', 'DESC')
            .getMany();
    }
    async update(id, userData) {
        await this.usersRepository.update(id, userData);
        return this.findOne(id);
    }
    async remove(id) {
        const result = await this.usersRepository.delete(id);
        if (result.affected === 0) {
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = UsersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UsersService);
//# sourceMappingURL=users.service.js.map