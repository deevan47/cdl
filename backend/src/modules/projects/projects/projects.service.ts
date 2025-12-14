// ...existing code...
import { Injectable, NotFoundException, Logger, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project, ProjectPlatform, ProjectStatus } from '../entities/project.entity';
import { ProjectStage, StageName, StageStatus } from '../entities/project-stage.entity';
import { Task, TaskStatus } from '../../tasks/entities/task.entity';
import { User, UserRole } from '../../users/entities/user.entity';
import { CreateProjectDto } from './dto/create-project-dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
/**
 * Service for handling project business logic including creation, progress calculation, and assignments.
 */
export class ProjectsService {
  async assignUsersToStage(stageId: string, userIds: string[]): Promise<ProjectStage> {
    const stage = await this.stagesRepository.findOne({ where: { id: stageId }, relations: ['assignedTeamMembers'] });
    if (!stage) throw new NotFoundException(`Stage with ID ${stageId} not found`);
    const users = await this.usersRepository.find({ where: userIds.map(id => ({ id })) });
    stage.assignedTeamMembers = users;
    return this.stagesRepository.save(stage);
  }

  async assignUsersToTask(taskId: string, userIds: string[]): Promise<Task> {
    const task = await this.tasksRepository.findOne({ where: { id: taskId }, relations: ['assignedTeamMembers'] });
    if (!task) throw new NotFoundException(`Task with ID ${taskId} not found`);
    const users = await this.usersRepository.find({ where: userIds.map(id => ({ id })) });
    task.assignedTeamMembers = users;
    return this.tasksRepository.save(task);
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
      if (!manager) {
        this.logger.warn(`create: Project manager with ID ${createProjectDto.projectManagerId} not found`);
        throw new NotFoundException(`Project manager not found`);
      }
    }

    const project = this.projectsRepository.create({
      name: createProjectDto.name,
      platform: createProjectDto.platform,
      scenario: createProjectDto.scenario || 'New Project',
      startDate: createProjectDto.startDate ? new Date(createProjectDto.startDate) : undefined,
      endDate: createProjectDto.endDate ? new Date(createProjectDto.endDate) : undefined,
      deadline: new Date(createProjectDto.deadline),
      projectManager: manager || null,
    });
    const savedProject = await this.projectsRepository.save(project);

    const stages = this.createDefaultStages(savedProject, savedProject.platform);
    await this.stagesRepository.save(stages);
    return this.findOne(savedProject.id);
  }

  private createDefaultStages(project: Project, platform: ProjectPlatform): ProjectStage[] {
    let stageNames: StageName[] = [];
    if (platform === ProjectPlatform.FLAME) {
      stageNames = [StageName.PRE_PRODUCTION, StageName.PRODUCTION, StageName.POST_PRODUCTION];
    } else if (platform === ProjectPlatform.SWAYAM) {
      stageNames = [StageName.PRODUCTION, StageName.POST_PRODUCTION];
    } else {
      stageNames = [StageName.PRODUCTION, StageName.POST_PRODUCTION];
    }

    return stageNames.map((name) => {
      return this.stagesRepository.create({
        name,
        project: project,
        isOpen: true,
        progress: 0,
        status: StageStatus.ON_TRACK,
        tasks: [],
        assignedTeamMembers: [],
      });
    });
  }

  async update(id: string, updateProjectDto: UpdateProjectDto, user?: any): Promise<Project> {
    const project = await this.findOne(id);

    // Check if deadline is being changed
    if (updateProjectDto.deadline) {
      const newDeadline = new Date(updateProjectDto.deadline);
      const currentDeadline = project.deadline ? new Date(project.deadline) : null;

      // If there is an existing deadline and it's different from the new one
      if (currentDeadline && newDeadline.getTime() !== currentDeadline.getTime()) {
        // Enforce Admin only
        if (user && user.role !== UserRole.ADMIN) {
          throw new ForbiddenException('Only Administrators can change the project deadline once it has been set.');
        }
      }
    }

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

    let totalProgress = 0;
    let totalWeight = 0;

    if (project.platform === ProjectPlatform.SWAYAM) {
      for (const stage of project.stages) {
        if (stage.name === StageName.PRODUCTION) {
          totalProgress += stage.progress * 0.4;
          totalWeight += 0.4;
        } else if (stage.name === StageName.POST_PRODUCTION) {
          totalProgress += stage.progress * 0.6;
          totalWeight += 0.6;
        }
      }
    } else if (project.platform === ProjectPlatform.FLAME) {
      for (const stage of project.stages) {
        if (stage.name === StageName.PRE_PRODUCTION) {
          totalProgress += stage.progress * 0.3;
          totalWeight += 0.3;
        } else if (stage.name === StageName.PRODUCTION) {
          totalProgress += stage.progress * 0.3;
          totalWeight += 0.3;
        } else if (stage.name === StageName.POST_PRODUCTION) {
          totalProgress += stage.progress * 0.4;
          totalWeight += 0.4;
        }
      }
    } else {
      const weight = 1 / project.stages.length;
      for (const stage of project.stages) {
        totalProgress += stage.progress * weight;
        totalWeight += weight;
      }
    }

    const finalProgress = totalWeight > 0 ? (totalProgress / totalWeight) : 0;

    let status = ProjectStatus.SETUP;
    const today = new Date();
    const deadline = project.deadline ? new Date(project.deadline) : null;

    if (finalProgress >= 100) {
      status = ProjectStatus.COMPLETED;
    } else if (deadline && today > deadline) {
      status = ProjectStatus.LAGGING;
    } else if (deadline && (deadline.getTime() - today.getTime()) / (1000 * 3600 * 24) <= 14) {
      status = ProjectStatus.AT_RISK;
    } else if (finalProgress > 0) {
      status = ProjectStatus.IN_PROGRESS;
    } else {
      status = ProjectStatus.SETUP;
    }

    project.overallProgress = parseFloat(finalProgress.toFixed(2));
    project.status = status;

    await this.projectsRepository.save(project);

    return { progress: project.overallProgress, status };
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
        } else if (daysDiff <= 14) {
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