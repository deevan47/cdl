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
exports.ProjectStage = exports.StageStatus = exports.StageName = void 0;
const typeorm_1 = require("typeorm");
const project_entity_1 = require("./project.entity");
const task_entity_1 = require("../../tasks/entities/task.entity");
const user_entity_1 = require("../../users/entities/user.entity");
var StageName;
(function (StageName) {
    StageName["PRE_PRODUCTION"] = "Pre-Production";
    StageName["PRODUCTION"] = "Production";
    StageName["POST_PRODUCTION"] = "Post-Production";
})(StageName || (exports.StageName = StageName = {}));
var StageStatus;
(function (StageStatus) {
    StageStatus["ON_TRACK"] = "on_track";
    StageStatus["AT_RISK"] = "at_risk";
    StageStatus["OVERDUE"] = "overdue";
    StageStatus["COMPLETED"] = "completed";
})(StageStatus || (exports.StageStatus = StageStatus = {}));
let ProjectStage = class ProjectStage {
    constructor(partial) {
        Object.assign(this, partial);
    }
};
exports.ProjectStage = ProjectStage;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ProjectStage.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: StageName }),
    __metadata("design:type", String)
], ProjectStage.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: StageStatus, default: StageStatus.ON_TRACK }),
    __metadata("design:type", String)
], ProjectStage.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], ProjectStage.prototype, "progress", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_open', default: true }),
    __metadata("design:type", Boolean)
], ProjectStage.prototype, "isOpen", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => project_entity_1.Project, project => project.stages, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'project_id' }),
    __metadata("design:type", project_entity_1.Project)
], ProjectStage.prototype, "project", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'project_id', insert: false, update: false }),
    __metadata("design:type", String)
], ProjectStage.prototype, "projectId", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => task_entity_1.Task, task => task.stage, { cascade: true, eager: true }),
    __metadata("design:type", Array)
], ProjectStage.prototype, "tasks", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => user_entity_1.User, user => user.assignedStages, { eager: true }),
    (0, typeorm_1.JoinTable)(),
    __metadata("design:type", Array)
], ProjectStage.prototype, "assignedTeamMembers", void 0);
exports.ProjectStage = ProjectStage = __decorate([
    (0, typeorm_1.Entity)('project_stages'),
    __metadata("design:paramtypes", [Object])
], ProjectStage);
//# sourceMappingURL=project-stage.entity.js.map