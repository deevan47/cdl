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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Project = exports.ProjectStatus = exports.ProjectPlatform = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
const project_stage_entity_1 = require("./project-stage.entity");
var ProjectPlatform;
(function (ProjectPlatform) {
    ProjectPlatform["FLAME"] = "flame";
    ProjectPlatform["SWAYAM"] = "swayam";
})(ProjectPlatform || (exports.ProjectPlatform = ProjectPlatform = {}));
var ProjectStatus;
(function (ProjectStatus) {
    ProjectStatus["SETUP"] = "setup";
    ProjectStatus["IN_PROGRESS"] = "in_progress";
    ProjectStatus["AT_RISK"] = "at_risk";
    ProjectStatus["LAGGING"] = "lagging";
    ProjectStatus["COMPLETED"] = "completed";
})(ProjectStatus || (exports.ProjectStatus = ProjectStatus = {}));
let Project = class Project {
};
exports.Project = Project;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Project.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Project.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ProjectPlatform,
    }),
    __metadata("design:type", String)
], Project.prototype, "platform", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Project.prototype, "scenario", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ProjectStatus,
        default: ProjectStatus.SETUP,
    }),
    __metadata("design:type", String)
], Project.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'overall_progress',
        type: 'decimal',
        precision: 5,
        scale: 2,
        default: 0,
    }),
    __metadata("design:type", Number)
], Project.prototype, "overallProgress", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.managedProjects, {
        nullable: true,
        onDelete: 'SET NULL',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'project_manager_id' }),
    __metadata("design:type", user_entity_1.User)
], Project.prototype, "projectManager", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'project_manager_id', nullable: true, insert: false, update: false }),
    __metadata("design:type", String)
], Project.prototype, "projectManagerId", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => project_stage_entity_1.ProjectStage, (stage) => stage.project),
    __metadata("design:type", Array)
], Project.prototype, "stages", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Project.prototype, "deadline", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Project.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Project.prototype, "updatedAt", void 0);
exports.Project = Project = __decorate([
    (0, typeorm_1.Entity)('projects')
], Project);
//# sourceMappingURL=project.entity.js.map