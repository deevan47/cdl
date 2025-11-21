// ...existing code...
import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project, ProjectPlatform, ProjectStatus } from '../entities/project.entity';
import { ProjectStage, StageName, StageStatus } from '../entities/project-stage.entity';
import { Task, TaskStatus } from '../../tasks/entities/task.entity';
import { User, UserRole } from '../../users/entities/user.entity';
import { CreateProjectDto } from './dto/create-project-dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  async assignUsersToStage(stageId: string, userIds: string[]): Promise<ProjectStage> {
    const stage = await this.stagesRepository.findOne({ where: { id: stageId }, relations: ['assignedTeamMembers'] });
    if (!stage) throw new NotFoundException(`Stage with ID ${stageId} not found`);
    const users = await this.usersRepository.find({ where: userIds.map(id => ({ id })) });
    stage.assignedTeamMembers = users;
    return this.stagesRepository.save(stage);
  }
  private readonly logger = new Logger(ProjectsService.name);

  constructor(
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
    @InjectRepository(ProjectStage)
    private stagesRepository: Repository<ProjectStage>,
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) { }

  async findAll(): Promise<Project[]> {
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

  async findOne(id: string): Promise<Project> {
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
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    return project;
  }

  async findByPlatform(platform: ProjectPlatform): Promise<Project[]> {
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

  async create(createProjectDto: CreateProjectDto): Promise<Project> {
    // Find manager if provided
    let manager: User | null = null;
    if (createProjectDto.projectManagerId) {
      manager = await this.usersRepository.findOne({ where: { id: createProjectDto.projectManagerId } });
      if (!manager) throw new NotFoundException(`Project manager not found`);
    }
    // If no manager, manager stays null (allowed by DB and entity)
    const project = this.projectsRepository.create({
      name: createProjectDto.name,
      platform: createProjectDto.platform,
      scenario: createProjectDto.scenario || 'New Project',
      deadline: new Date(createProjectDto.deadline),
      projectManager: manager || null,
    });
    const savedProject = await this.projectsRepository.save(project);

    // Create default stages based on project platform
    const stages = this.createDefaultStages(savedProject.id, savedProject.platform);
    await this.stagesRepository.save(stages);
    return this.findOne(savedProject.id);
  }

  private createDefaultStages(projectId: string, platform: ProjectPlatform): ProjectStage[] {
    // Platform-specific templates
    let stageNames: StageName[] = [];
    if (platform === ProjectPlatform.FLAME) {
      stageNames = [StageName.PRE_PRODUCTION, StageName.PRODUCTION, StageName.POST_PRODUCTION];
    } else if (platform === ProjectPlatform.SWAYAM) {
      stageNames = [StageName.PRODUCTION, StageName.POST_PRODUCTION];
    } else {
      // fallback to a safe default
      stageNames = [StageName.PRODUCTION, StageName.POST_PRODUCTION];
    }

    return stageNames.map((name) => {
      return new ProjectStage({
        name,
        project: { id: projectId } as Project,
        isOpen: true,
        progress: 0,
        status: StageStatus.ON_TRACK,
        tasks: [],
        assignedTeamMembers: [], // Project manager will assign users later
      });
    });
  }

  async update(id: string, updateProjectDto: UpdateProjectDto): Promise<Project> {
    const project = await this.findOne(id);
    Object.assign(project, updateProjectDto);
    return this.projectsRepository.save(project);
  }

  async remove(id: string): Promise<void> {
    const result = await this.projectsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
  }

  async assignProjectManager(projectId: string, managerId: string): Promise<Project> {
    const project = await this.findOne(projectId);
    const manager = await this.usersRepository.findOne({ where: { id: managerId } });

    if (!manager) {
      throw new NotFoundException(`User with ID ${managerId} not found`);
    }

    project.projectManager = manager as any;
    project.status = ProjectStatus.IN_PROGRESS;

    return this.projectsRepository.save(project);
  }

  async calculateProjectHealth(projectId: string): Promise<{ progress: number; status: ProjectStatus }> {
    const project = await this.findOne(projectId);

    if (!project.stages || project.stages.length === 0) {
      return { progress: 0, status: ProjectStatus.SETUP };
    }

    // Calculate stage progress based on tasks
    for (const stage of project.stages) {
      await this.calculateStageHealth(stage);
    }

    const totalProgress = project.stages.reduce((sum, stage) => sum + stage.progress, 0);
    const averageProgress = totalProgress / project.stages.length;

    let status = ProjectStatus.IN_PROGRESS;
    if (averageProgress >= 100) {
      status = ProjectStatus.COMPLETED;
    } else if (project.stages.some(stage => stage.status === StageStatus.OVERDUE)) {
      status = ProjectStatus.LAGGING;
    } else if (project.stages.some(stage => stage.status === StageStatus.AT_RISK)) {
      status = ProjectStatus.AT_RISK;
    }

    project.overallProgress = averageProgress;
    project.status = status;

    await this.projectsRepository.save(project);

    return { progress: averageProgress, status };
  }

  private async calculateStageHealth(stage: ProjectStage): Promise<void> {
    if (!stage.tasks || stage.tasks.length === 0) {
      stage.progress = 0;
      stage.status = StageStatus.ON_TRACK;
      return;
    }

    const completedTasks = stage.tasks.filter(task => task.isCompleted).length;
    const progress = (completedTasks / stage.tasks.length) * 100;

    stage.progress = progress;

    // Determine stage status
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
          task.status = TaskStatus.OVERDUE;
        } else if (daysDiff <= 7) {
          hasAtRisk = true;
          task.status = TaskStatus.AT_RISK;
        } else {
          task.status = TaskStatus.ON_TRACK;
        }
      } else {
        task.status = TaskStatus.COMPLETED;
      }
    }

    if (hasOverdue) {
      stage.status = StageStatus.OVERDUE;
    } else if (hasAtRisk) {
      stage.status = StageStatus.AT_RISK;
    } else if (progress === 100) {
      stage.status = StageStatus.COMPLETED;
    } else {
      stage.status = StageStatus.ON_TRACK;
    }

    await this.stagesRepository.save(stage);
  }

  async getProjectManagers(): Promise<User[]> {
    return this.usersRepository.find({
      where: { isActive: true }
    });
  }

  async getAssignedProjects(userId: string): Promise<Project[]> {
    this.logger.debug(`getAssignedProjects: Fetching projects for userId=${userId}`);
    try {
      const projects = await this.projectsRepository
        .createQueryBuilder('project')
        .leftJoinAndSelect('project.stages', 'stage')
        .leftJoinAndSelect('stage.assignedTeamMembers', 'member')
        .leftJoinAndSelect('project.projectManager', 'manager')
        .where('manager.id = :userId', { userId })
        .orWhere('member.id = :userId', { userId })
        .orderBy('project.createdAt', 'DESC')
        .getMany();

      this.logger.log(`getAssignedProjects: Found ${projects.length} projects for userId=${userId}`);
      return projects;
    } catch (err) {
      this.logger.error(`getAssignedProjects: Error fetching projects for userId=${userId}`, err?.stack || err?.message || err);
      return [];
    }
  }

  async addTaskToStage(stageId: string, taskData: Partial<Task>): Promise<Task> {
    const stage = await this.stagesRepository.findOne({
      where: { id: stageId },
      relations: ['tasks']
    });

    if (!stage) {
      throw new NotFoundException(`Stage with ID ${stageId} not found`);
    }

    const task = this.tasksRepository.create({
      ...taskData,
      stage: { id: stageId } as ProjectStage,
    } as any);

    const savedTask = await this.tasksRepository.save(task);
    await this.calculateStageHealth(stage);

    return savedTask as any;
  }
}