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
var ProjectsController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectsController = exports.AssignUsersDto = void 0;
const common_1 = require("@nestjs/common");
const class_validator_1 = require("class-validator");
const projects_service_1 = require("./projects.service");
const project_entity_1 = require("../entities/project.entity");
const create_project_dto_1 = require("./dto/create-project-dto");
const update_project_dto_1 = require("./dto/update-project.dto");
class AssignUsersDto {
}
exports.AssignUsersDto = AssignUsersDto;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsUUID)('all', { each: true }),
    __metadata("design:type", Array)
], AssignUsersDto.prototype, "userIds", void 0);
let ProjectsController = ProjectsController_1 = class ProjectsController {
    constructor(projectsService) {
        this.projectsService = projectsService;
        this.logger = new common_1.Logger(ProjectsController_1.name);
    }
    async assignUsersToStage(stageId, body) {
        return this.projectsService.assignUsersToStage(stageId, body.userIds);
    }
    async assignUsersToTask(taskId, body) {
        return this.projectsService.assignUsersToTask(taskId, body.userIds);
    }
    findAll() {
        return this.projectsService.findAll();
    }
    async getAssignedProjects(userId) {
        this.logger.log(`getAssignedProjects: userId=${userId}`);
        return this.projectsService.getAssignedProjects(userId);
    }
    findByPlatform(platform) {
        return this.projectsService.findByPlatform(platform);
    }
    findOne(id) {
        return this.projectsService.findOne(id);
    }
    create(createProjectDto) {
        this.logger.log(`create: Creating project name=${createProjectDto.name}`);
        return this.projectsService.create(createProjectDto);
    }
    update(id, updateProjectDto) {
        return this.projectsService.update(id, updateProjectDto);
    }
    remove(id) {
        return this.projectsService.remove(id);
    }
    assignProjectManager(id, managerId) {
        return this.projectsService.assignProjectManager(id, managerId);
    }
    calculateHealth(id) {
        return this.projectsService.calculateProjectHealth(id);
    }
    getAvailableManagers() {
        return this.projectsService.getProjectManagers();
    }
    addTaskToStage(stageId, taskData) {
        return this.projectsService.addTaskToStage(stageId, taskData);
    }
};
exports.ProjectsController = ProjectsController;
__decorate([
    (0, common_1.Put)('stages/:stageId/assign-users'),
    __param(0, (0, common_1.Param)('stageId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, AssignUsersDto]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "assignUsersToStage", null);
__decorate([
    (0, common_1.Put)('tasks/:taskId/assign-users'),
    __param(0, (0, common_1.Param)('taskId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, AssignUsersDto]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "assignUsersToTask", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('user/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "getAssignedProjects", null);
__decorate([
    (0, common_1.Get)('platform/:platform'),
    __param(0, (0, common_1.Param)('platform')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "findByPlatform", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_project_dto_1.CreateProjectDto]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_project_dto_1.UpdateProjectDto]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "remove", null);
__decorate([
    (0, common_1.Put)(':id/assign-manager/:managerId'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('managerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "assignProjectManager", null);
__decorate([
    (0, common_1.Get)(':id/health'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "calculateHealth", null);
__decorate([
    (0, common_1.Get)('managers/available'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "getAvailableManagers", null);
__decorate([
    (0, common_1.Post)('stages/:stageId/tasks'),
    __param(0, (0, common_1.Param)('stageId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "addTaskToStage", null);
exports.ProjectsController = ProjectsController = ProjectsController_1 = __decorate([
    (0, common_1.Controller)('projects'),
    __metadata("design:paramtypes", [projects_service_1.ProjectsService])
], ProjectsController);
//# sourceMappingURL=projects.controller.js.map