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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TasksService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const task_entity_1 = require("./entities/task.entity");
const user_entity_1 = require("../users/entities/user.entity");
let TasksService = class TasksService {
    constructor(taskRepository, userRepository) {
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
    }
    async findTasksByUserId(userId) {
        return this.taskRepository
            .createQueryBuilder('task')
            .leftJoin('task.assignedTeamMembers', 'user')
            .leftJoinAndSelect('task.stage', 'stage')
            .leftJoinAndSelect('stage.project', 'project')
            .where('user.id = :userId', { userId })
            .orderBy('task.endDate', 'ASC')
            .getMany();
    }
    create(createTaskDto) {
        const task = this.taskRepository.create(createTaskDto);
        return this.taskRepository.save(task);
    }
    findAll() {
        return this.taskRepository.find({ relations: ['stage', 'assignedTeamMembers'] });
    }
    async findOne(id) {
        const task = await this.taskRepository.findOne({ where: { id }, relations: ['stage', 'assignedTeamMembers'] });
        if (!task) {
            throw new common_1.NotFoundException(`Task with ID "${id}" not found`);
        }
        return task;
    }
    async update(id, updateTaskDto) {
        const task = await this.taskRepository.preload({ id, ...updateTaskDto });
        if (!task) {
            throw new common_1.NotFoundException(`Task with ID "${id}" not found`);
        }
        return this.taskRepository.save(task);
    }
    async remove(id) {
        const task = await this.findOne(id);
        await this.taskRepository.remove(task);
        return { deleted: true };
    }
    async assignUserToTask(taskId, userId) {
        const task = await this.findOne(taskId);
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID "${userId}" not found`);
        }
        if (!task.assignedTeamMembers) {
            task.assignedTeamMembers = [];
        }
        if (!task.assignedTeamMembers.some(u => u.id === userId)) {
            task.assignedTeamMembers.push(user);
        }
        return this.taskRepository.save(task);
    }
};
exports.TasksService = TasksService;
exports.TasksService = TasksService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(task_entity_1.Task)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], TasksService);
//# sourceMappingURL=tasks.service.js.map