import { Controller, Get, Param, Post, Body, Patch, Delete, UseGuards } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../../guards/auth.guard';

@UseGuards(JwtAuthGuard) // Protect all task routes
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  // Get tasks assigned to a user
  @Get('user/:userId')
  findTasksByUserId(@Param('userId') userId: string) {
    return this.tasksService.findTasksByUserId(userId);
  }

  @Post()
  create(@Body() createTaskDto: any) {
    return this.tasksService.create(createTaskDto);
  }

  @Get()
  findAll() {
    return this.tasksService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tasksService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTaskDto: any) {
    return this.tasksService.update(id, updateTaskDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tasksService.remove(id);
  }
}