import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { UserRole } from './entities/user.entity';
import { Project } from '../projects/entities/project.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<User> {
    return this.usersService.findOne(id);
  }

  @Get('role/:role')
  findByRole(@Param('role') role: UserRole): Promise<User[]> {
    return this.usersService.findByRole(role);
  }

  @Post()
  create(@Body() userData: Partial<User>): Promise<User> {
    return this.usersService.create(userData);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() userData: Partial<User>): Promise<User> {
    return this.usersService.update(id, userData);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.usersService.remove(id);
  }

  @Put(':id/deactivate')
  deactivate(@Param('id') id: string): Promise<User> {
    return this.usersService.update(id, { isActive: false });
  }

  @Put(':id/activate')
  activate(@Param('id') id: string): Promise<User> {
    return this.usersService.update(id, { isActive: true });
  }

  @Get('managers')
  getProjectManagers(): Promise<User[]> {
    return this.usersService.findByRole(UserRole.PROJECT_MANAGER);
  }

  // Return projects assigned to a given user (project manager or assigned member)
  @Get(':id/assigned-projects')
  getAssignedProjects(@Param('id') id: string): Promise<Project[]> {
    return this.usersService.getAssignedProjects(id);
  }
}
