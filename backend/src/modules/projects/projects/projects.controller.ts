import { Controller, Get, Post, Put, Delete, Param, Body, Logger, UsePipes, ValidationPipe } from '@nestjs/common';
import { IsArray, IsUUID } from 'class-validator';
import { ProjectsService } from './projects.service';
import { Project, ProjectPlatform } from '../entities/project.entity';
import { CreateProjectDto } from './dto/create-project-dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Task } from '../../tasks/entities/task.entity';
import { User } from '../../users/entities/user.entity';

// DTO for assigning users to a stage
export class AssignUsersDto {
  @IsArray()
  @IsUUID('all', { each: true })
  userIds: string[];
}

@Controller('projects')
export class ProjectsController {
  private readonly logger = new Logger(ProjectsController.name);

  constructor(private readonly projectsService: ProjectsService) { }

  @Put('stages/:stageId/assign-users')
  async assignUsersToStage(
    @Param('stageId') stageId: string,
    @Body() body: AssignUsersDto
  ): Promise<any> {
    return this.projectsService.assignUsersToStage(stageId, body.userIds);
  }

  @Get()
  findAll(): Promise<Project[]> {
    return this.projectsService.findAll();
  }

  @Get('user/:userId')
  async getAssignedProjects(@Param('userId') userId: string): Promise<Project[]> {
    this.logger.log(`getAssignedProjects: userId=${userId}`);
    return this.projectsService.getAssignedProjects(userId);
  }

  @Get('platform/:platform')
  findByPlatform(@Param('platform') platform: ProjectPlatform): Promise<Project[]> {
    return this.projectsService.findByPlatform(platform);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Project> {
    return this.projectsService.findOne(id);
  }

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
  create(@Body() createProjectDto: CreateProjectDto): Promise<Project> {
    this.logger.log(`create: Creating project name=${createProjectDto.name}`);
    return this.projectsService.create(createProjectDto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto): Promise<Project> {
    return this.projectsService.update(id, updateProjectDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.projectsService.remove(id);
  }

  @Put(':id/assign-manager/:managerId')
  assignProjectManager(
    @Param('id') id: string,
    @Param('managerId') managerId: string,
  ): Promise<Project> {
    return this.projectsService.assignProjectManager(id, managerId);
  }

  @Get(':id/health')
  calculateHealth(@Param('id') id: string) {
    return this.projectsService.calculateProjectHealth(id);
  }

  @Get('managers/available')
  getAvailableManagers(): Promise<User[]> {
    return this.projectsService.getProjectManagers();
  }

  @Post('stages/:stageId/tasks')
  addTaskToStage(
    @Param('stageId') stageId: string,
    @Body() taskData: Partial<Task>,
  ): Promise<Task> {
    return this.projectsService.addTaskToStage(stageId, taskData);
  }
}
