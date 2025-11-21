import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Project, ProjectStage, Task } from '../../models/project.model';
import { User } from '../../models/user.model';
import { ProjectService } from '../../services/project.service';
import { TaskService } from '../../services/task.service';

@Component({
  selector: 'app-project-detail',
  templateUrl: './project-detail.component.html',
  styleUrls: ['./project-detail.component.css']
})
export class ProjectDetailComponent implements OnInit {
  @Input() project!: Project;
  @Input() availableManagers: User[] = [];
  @Output() projectUpdated = new EventEmitter<Project>();
  @Output() projectDeleted = new EventEmitter<string>();
  @Output() taskModalRequested = new EventEmitter<string>();

  isEditingName = false;
  editedProjectName = '';
  selectedManagerId = '';

  constructor(
    private projectService: ProjectService,
    private taskService: TaskService
  ) {}

  ngOnInit() {
    this.editedProjectName = this.project.name;
  }

  startEditingName() {
    this.isEditingName = true;
    this.editedProjectName = this.project.name;
  }

  saveProjectName() {
    if (this.editedProjectName.trim() && this.editedProjectName !== this.project.name) {
      this.projectService.updateProject(this.project.id, { name: this.editedProjectName })
        .subscribe({
          next: (updatedProject) => {
            this.project = updatedProject;
            this.projectUpdated.emit(updatedProject);
            this.isEditingName = false;
          },
          error: (error) => console.error('Error updating project name:', error)
        });
    } else {
      this.isEditingName = false;
    }
  }

  cancelEditingName() {
    this.isEditingName = false;
    this.editedProjectName = this.project.name;
  }

  onManagerSelected(event: any) {
    const managerId = event.target.value;
    if (managerId) {
      this.assignProjectManager(managerId);
    }
  }

  assignProjectManager(managerId: string) {
    this.projectService.assignProjectManager(this.project.id, managerId)
      .subscribe({
        next: (updatedProject) => {
          this.project = updatedProject;
          this.projectUpdated.emit(updatedProject);
          this.selectedManagerId = '';
        },
        error: (error) => console.error('Error assigning manager:', error)
      });
  }

  deleteProject() {
    if (confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      this.projectService.deleteProject(this.project.id)
        .subscribe({
          next: () => {
            this.projectDeleted.emit(this.project.id);
          },
          error: (error) => console.error('Error deleting project:', error)
        });
    }
  }

  toggleStage(stage: ProjectStage) {
    stage.isOpen = !stage.isOpen;
  }

  openTaskModal(stageId: string) {
    this.taskModalRequested.emit(stageId);
  }

  assignUserToStage(stage: ProjectStage, event: any) {
    const userId = event.target.value;
    if (userId) {
      // Implementation for assigning user to stage
      console.log(`Assign user ${userId} to stage ${stage.id}`);
      event.target.value = '';
    }
  }

  assignUserToTask(task: Task, event: any) {
    const userId = event.target.value;
    if (userId) {
      this.taskService.assignUserToTask(task.id, userId)
        .subscribe({
          next: (updatedTask) => {
            // Update the task in the project
            const stage = this.project.stages.find(s => s.id === task.stageId);
            if (stage) {
              const taskIndex = stage.tasks.findIndex(t => t.id === task.id);
              if (taskIndex !== -1) {
                stage.tasks[taskIndex] = updatedTask;
              }
            }
            event.target.value = '';
          },
          error: (error) => console.error('Error assigning user to task:', error)
        });
    }
  }

  toggleTaskCompletion(task: Task) {
    const newStatus = !task.isCompleted;
    this.taskService.updateTaskStatus(task.id, 
      newStatus ? 'completed' : 'on_track' as any,

      newStatus
    ).subscribe({
      next: (updatedTask) => {
        // Update the task in the project
        const stage = this.project.stages.find(s => s.id === task.stageId);
        if (stage) {
          const taskIndex = stage.tasks.findIndex(t => t.id === task.id);
          if (taskIndex !== -1) {
            stage.tasks[taskIndex] = updatedTask;
          }
        }
        // Recalculate project health
        this.projectService.calculateProjectHealth(this.project.id).subscribe();
      },
      error: (error) => console.error('Error updating task status:', error)
    });
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'on_track': 'green',
      'at_risk': 'yellow',
      'overdue': 'red',
      'completed': 'green',
      'setup': 'blue',
      'in_progress': 'blue',
      'lagging': 'red'
    };
    return colors[status] || 'gray';
  }

  getStatusBadgeClass(status: string): string {
    const colors: { [key: string]: string } = {
      'on_track': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'at_risk': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      'overdue': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      'completed': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'setup': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'in_progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'lagging': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    };
    return `px-2.5 py-0.5 text-xs font-medium rounded-full ${colors[status] || 'bg-gray-100 text-gray-800'}`;
  }

  getProgressBarClass(status: string): string {
    const colors: { [key: string]: string } = {
      'on_track': 'bg-green-500',
      'at_risk': 'bg-yellow-500',
      'overdue': 'bg-red-500',
      'completed': 'bg-green-500',
      'setup': 'bg-blue-500',
      'in_progress': 'bg-blue-500',
      'lagging': 'bg-red-500'
    };
    return `h-2 rounded-full transition-all duration-500 ${colors[status] || 'bg-gray-500'}`;
  }

  formatStatus(status: string): string {
  return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}
}