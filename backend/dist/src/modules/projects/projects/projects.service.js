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
var ProjectsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const project_entity_1 = require("../entities/project.entity");
const project_stage_entity_1 = require("../entities/project-stage.entity");
const task_entity_1 = require("../../tasks/entities/task.entity");
const user_entity_1 = require("../../users/entities/user.entity");
let ProjectsService = ProjectsService_1 = class ProjectsService {
    async assignUsersToStage(stageId, userIds) {
        const stage = await this.stagesRepository.findOne({ where: { id: stageId }, relations: ['assignedTeamMembers'] });
        if (!stage)
            throw new common_1.NotFoundException(`Stage with ID ${stageId} not found`);
        const users = await this.usersRepository.find({ where: userIds.map(id => ({ id })) });
        stage.assignedTeamMembers = users;
        return this.stagesRepository.save(stage);
    }
    async assignUsersToTask(taskId, userIds) {
        const task = await this.tasksRepository.findOne({ where: { id: taskId }, relations: ['assignedTeamMembers'] });
        if (!task)
            throw new common_1.NotFoundException(`Task with ID ${taskId} not found`);
        const users = await this.usersRepository.find({ where: userIds.map(id => ({ id })) });
        task.assignedTeamMembers = users;
        return this.tasksRepository.save(task);
    }
    constructor(projectsRepository, stagesRepository, tasksRepository, usersRepository) {
        this.projectsRepository = projectsRepository;
        this.stagesRepository = stagesRepository;
        this.tasksRepository = tasksRepository;
        this.usersRepository = usersRepository;
        this.logger = new common_1.Logger(ProjectsService_1.name);
    }
    async findAll() {
        this.logger.debug('findAll: Fetching all projects');
        const projects = await this.projectsRepository.find({
            relations: [
                'stages',
                'stages.tasks',
                'stages.tasks.assignedTeamMembers',
                'stages.assignedTeamMembers',
                'projectManager'
            ],
            order: {
                createdAt: 'DESC'
            }
        });
        this.logger.log(`findAll: Found ${projects.length} projects`);
        return projects;
    }
    async findOne(id) {
        const project = await this.projectsRepository.findOne({
            where: { id },
            relations: [
                'stages',
                'stages.tasks',
                'stages.tasks.assignedTeamMembers',
                'stages.assignedTeamMembers',
                'projectManager'
            ],
        });
        if (!project) {
            throw new common_1.NotFoundException(`Project with ID ${id} not found`);
        }
        return project;
    }
    async findByPlatform(platform) {
        return this.projectsRepository.find({
            where: { platform },
            relations: [
                'stages',
                'stages.tasks',
                'stages.assignedTeamMembers',
                'projectManager'
            ],
            order: {
                createdAt: 'DESC'
            }
        });
    }
    async create(createProjectDto) {
        this.logger.log(`create: Finding manager with ID ${createProjectDto.projectManagerId}`);
        let manager = null;
        if (createProjectDto.projectManagerId) {
            manager = await this.usersRepository.findOne({ where: { id: createProjectDto.projectManagerId } });
            if (!manager) {
                this.logger.warn(`create: Project manager with ID ${createProjectDto.projectManagerId} not found`);
                throw new common_1.NotFoundException(`Project manager not found`);
            }
            this.logger.log(`create: Found manager ${manager.name}`);
        }
        else {
            this.logger.log('create: No project manager ID provided');
        }
        const project = this.projectsRepository.create({
            name: createProjectDto.name,
            platform: createProjectDto.platform,
            scenario: createProjectDto.scenario || 'New Project',
            deadline: new Date(createProjectDto.deadline),
            projectManager: manager || null,
        });
        const savedProject = await this.projectsRepository.save(project);
        this.logger.log(`create: Project saved with ID ${savedProject.id}, Manager: ${savedProject.projectManager?.id}`);
        const stages = this.createDefaultStages(savedProject, savedProject.platform);
        await this.stagesRepository.save(stages);
        return this.findOne(savedProject.id);
    }
    createDefaultStages(project, platform) {
        let stageNames = [];
        if (platform === project_entity_1.ProjectPlatform.FLAME) {
            stageNames = [project_stage_entity_1.StageName.PRE_PRODUCTION, project_stage_entity_1.StageName.PRODUCTION, project_stage_entity_1.StageName.POST_PRODUCTION];
        }
        else if (platform === project_entity_1.ProjectPlatform.SWAYAM) {
            stageNames = [project_stage_entity_1.StageName.PRODUCTION, project_stage_entity_1.StageName.POST_PRODUCTION];
        }
        else {
            stageNames = [project_stage_entity_1.StageName.PRODUCTION, project_stage_entity_1.StageName.POST_PRODUCTION];
        }
        return stageNames.map((name) => {
            return this.stagesRepository.create({
                name,
                project: project,
                isOpen: true,
                progress: 0,
                status: project_stage_entity_1.StageStatus.ON_TRACK,
                tasks: [],
                assignedTeamMembers: [],
            });
        });
    }
    async update(id, updateProjectDto) {
        const project = await this.findOne(id);
        Object.assign(project, updateProjectDto);
        return this.projectsRepository.save(project);
    }
    async remove(id) {
        const result = await this.projectsRepository.delete(id);
        if (result.affected === 0) {
            throw new common_1.NotFoundException(`Project with ID ${id} not found`);
        }
    }
    async assignProjectManager(projectId, managerId) {
        const project = await this.findOne(projectId);
        const manager = await this.usersRepository.findOne({ where: { id: managerId } });
        if (!manager) {
            throw new common_1.NotFoundException(`User with ID ${managerId} not found`);
        }
        project.projectManager = manager;
        project.status = project_entity_1.ProjectStatus.IN_PROGRESS;
        return this.projectsRepository.save(project);
    }
    async calculateProjectHealth(projectId) {
        const project = await this.findOne(projectId);
        if (!project.stages || project.stages.length === 0) {
            return { progress: 0, status: project_entity_1.ProjectStatus.SETUP };
        }
        for (const stage of project.stages) {
            await this.calculateStageHealth(stage);
        }
        let totalProgress = 0;
        let totalWeight = 0;
        if (project.platform === project_entity_1.ProjectPlatform.SWAYAM) {
            for (const stage of project.stages) {
                if (stage.name === project_stage_entity_1.StageName.PRODUCTION) {
                    totalProgress += stage.progress * 0.4;
                    totalWeight += 0.4;
                }
                else if (stage.name === project_stage_entity_1.StageName.POST_PRODUCTION) {
                    totalProgress += stage.progress * 0.6;
                    totalWeight += 0.6;
                }
            }
        }
        else if (project.platform === project_entity_1.ProjectPlatform.FLAME) {
            for (const stage of project.stages) {
                if (stage.name === project_stage_entity_1.StageName.PRE_PRODUCTION) {
                    totalProgress += stage.progress * 0.3;
                    totalWeight += 0.3;
                }
                else if (stage.name === project_stage_entity_1.StageName.PRODUCTION) {
                    totalProgress += stage.progress * 0.3;
                    totalWeight += 0.3;
                }
                else if (stage.name === project_stage_entity_1.StageName.POST_PRODUCTION) {
                    totalProgress += stage.progress * 0.4;
                    totalWeight += 0.4;
                }
            }
        }
        else {
            const weight = 1 / project.stages.length;
            for (const stage of project.stages) {
                totalProgress += stage.progress * weight;
                totalWeight += weight;
            }
        }
        const finalProgress = totalWeight > 0 ? (totalProgress / totalWeight) : 0;
        let status = project_entity_1.ProjectStatus.IN_PROGRESS;
        if (finalProgress >= 100) {
            status = project_entity_1.ProjectStatus.COMPLETED;
        }
        else if (project.stages.some(stage => stage.status === project_stage_entity_1.StageStatus.OVERDUE)) {
            status = project_entity_1.ProjectStatus.LAGGING;
        }
        else if (project.stages.some(stage => stage.status === project_stage_entity_1.StageStatus.AT_RISK)) {
            status = project_entity_1.ProjectStatus.AT_RISK;
        }
        project.overallProgress = parseFloat(finalProgress.toFixed(2));
        project.status = status;
        await this.projectsRepository.save(project);
        return { progress: project.overallProgress, status };
    }
    async calculateStageHealth(stage) {
        if (!stage.tasks || stage.tasks.length === 0) {
            stage.progress = 0;
            stage.status = project_stage_entity_1.StageStatus.ON_TRACK;
            return;
        }
        const completedTasks = stage.tasks.filter(task => task.isCompleted).length;
        const progress = (completedTasks / stage.tasks.length) * 100;
        stage.progress = progress;
        const today = new Date();
        let hasOverdue = false;
        let hasAtRisk = false;
        for (const task of stage.tasks) {
            if (!task.isCompleted) {
                const endDate = new Date(task.endDate);
                const timeDiff = endDate.getTime() - today.getTime();
                const daysDiff = timeDiff / (1000 * 3600 * 24);
                if (daysDiff < 0) {
                    hasOverdue = true;
                    task.status = task_entity_1.TaskStatus.OVERDUE;
                }
                else if (daysDiff <= 7) {
                    hasAtRisk = true;
                    task.status = task_entity_1.TaskStatus.AT_RISK;
                }
                else {
                    task.status = task_entity_1.TaskStatus.ON_TRACK;
                }
            }
            else {
                task.status = task_entity_1.TaskStatus.COMPLETED;
            }
        }
        if (hasOverdue) {
            stage.status = project_stage_entity_1.StageStatus.OVERDUE;
        }
        else if (hasAtRisk) {
            stage.status = project_stage_entity_1.StageStatus.AT_RISK;
        }
        else if (progress === 100) {
            stage.status = project_stage_entity_1.StageStatus.COMPLETED;
        }
        else {
            stage.status = project_stage_entity_1.StageStatus.ON_TRACK;
        }
        await this.stagesRepository.save(stage);
    }
    async getProjectManagers() {
        return this.usersRepository.find({
            where: { isActive: true }
        });
    }
    async getAssignedProjects(userId) {
        this.logger.debug(`getAssignedProjects: Fetching projects for userId=${userId}`);
        try {
            const projects = await this.projectsRepository
                .createQueryBuilder('project')
                .leftJoinAndSelect('project.stages', 'stage')
                .leftJoinAndSelect('stage.tasks', 'task')
                .leftJoinAndSelect('task.assignedTeamMembers', 'taskMember')
                .leftJoinAndSelect('stage.assignedTeamMembers', 'member')
                .leftJoinAndSelect('project.projectManager', 'manager')
                .where('manager.id = :userId', { userId })
                .orWhere('member.id = :userId', { userId })
                .orWhere('taskMember.id = :userId', { userId })
                .orderBy('project.createdAt', 'DESC')
                .getMany();
            this.logger.log(`getAssignedProjects: Found ${projects.length} projects for userId=${userId}`);
            projects.forEach(p => this.logger.debug(`Found project: ${p.id}, Manager: ${p.projectManager?.id}`));
            return projects;
        }
        catch (err) {
            this.logger.error(`getAssignedProjects: Error fetching projects for userId=${userId}`, err?.stack || err?.message || err);
            return [];
        }
    }
    async addTaskToStage(stageId, taskData) {
        const stage = await this.stagesRepository.findOne({
            where: { id: stageId },
            relations: ['tasks']
        });
        if (!stage) {
            throw new common_1.NotFoundException(`Stage with ID ${stageId} not found`);
        }
        const task = this.tasksRepository.create({
            ...taskData,
            stage: { id: stageId },
        });
        const savedTask = await this.tasksRepository.save(task);
        await this.calculateStageHealth(stage);
        return savedTask;
    }
};
exports.ProjectsService = ProjectsService;
exports.ProjectsService = ProjectsService = ProjectsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(project_entity_1.Project)),
    __param(1, (0, typeorm_1.InjectRepository)(project_stage_entity_1.ProjectStage)),
    __param(2, (0, typeorm_1.InjectRepository)(task_entity_1.Task)),
    __param(3, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ProjectsService);
//# sourceMappingURL=projects.service.js.map