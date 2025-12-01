import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Project, ProjectStage, Task, ProjectStatus } from '../../models/project.model';
import { User } from '../../models/user.model';
import { ProjectService } from '../../services/project.service';
import { AuthService } from '../../services/auth.service';
import { TaskService } from '../../services/task.service';

@Component({
  selector: 'app-project-detail',
  templateUrl: './project-detail.component.html',
  styleUrls: ['./project-detail.component.scss']
})
export class ProjectDetailComponent implements OnInit, OnChanges {
  @Input() project: Project | null = null;
  @Input() availableManagers: User[] = []; // Restored Input
  @Input() currentUser: User | null = null; // Restored Input
  @Output() projectUpdated = new EventEmitter<Project>();
  @Output() projectDeleted = new EventEmitter<string>();
  @Output() taskModalRequested = new EventEmitter<string>();

  isEditingName = false;
  editedProjectName = '';
  isEditMode = false; // Global edit mode for the project
  hasUnsavedChanges = false; // Track if changes were made
  selectedManagerId = '';

  constructor(
    private route: ActivatedRoute,
    private projectService: ProjectService,
    private authService: AuthService,
    private taskService: TaskService
  ) { }

  ngOnInit() {
    if (this.project) {
      this.editedProjectName = this.project.name;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['project'] && this.project) {
      this.editedProjectName = this.project.name;
      this.sortStages();
    }
  }

  sortStages() {
    if (!this.project || !this.project.stages) return;

    const stageOrder = ['Pre-Production', 'Production', 'Post-Production'];

    this.project.stages.sort((a, b) => {
      const indexA = stageOrder.indexOf(a.name);
      const indexB = stageOrder.indexOf(b.name);

      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return a.name.localeCompare(b.name);
    });

    // Ensure stages are open by default (fixes "cant expand" if undefined)
    this.project.stages.forEach(s => {
      if (s.isOpen === undefined) s.isOpen = true;
    });
  }

  toggleEditMode() {
    if (this.isEditMode) {
      // Saving changes
      this.saveProjectChanges();
    }
    this.isEditMode = !this.isEditMode;
  }

  saveProjectChanges() {
    if (!this.project) return;

    // Recalculate progress before saving
    this.calculateProgress();

    this.projectService.updateProject(this.project.id, this.project).subscribe({
      next: (updatedProject) => {
        this.project = updatedProject;
        this.hasUnsavedChanges = false;
        // Ensure we exit edit mode if called directly
        if (this.isEditMode) this.isEditMode = false;
      },
      error: (err) => console.error('Error saving project:', err)
    });
  }

  calculateProgress() {
    if (!this.project || !this.project.stages) return;

    let totalProgress = 0;
    const platform = this.project.platform.toLowerCase();

    // Define Weights
    let weights: { [key: string]: number } = {};
    if (platform === 'flame') {
      weights = {
        'pre-production': 30,
        'production': 40,
        'post-production': 30
      };
    } else if (platform === 'swayam') {
      weights = {
        'production': 50,
        'post-production': 50
      };
    } else {
      // Default equal weights if unknown
      const count = this.project.stages.length;
      this.project.stages.forEach(s => weights[s.name.toLowerCase()] = 100 / count);
    }

    // Calculate
    this.project.stages.forEach(stage => {
      const stageName = stage.name.toLowerCase();
      const weight = weights[stageName] || 0;

      if (stage.tasks && stage.tasks.length > 0) {
        const completedTasks = stage.tasks.filter(t => t.isCompleted).length;
        const stageProgress = (completedTasks / stage.tasks.length) * 100;

        // Update stage progress
        stage.progress = Math.round(stageProgress);

        // Add weighted contribution
        totalProgress += (stageProgress / 100) * weight;
      } else {
        // If no tasks, assume 0% for that stage (or keep existing if manual)
        stage.progress = 0;
      }
    });

    this.project.overallProgress = Math.round(totalProgress);
    this.updateProjectStatus();
  }

  updateProjectStatus() {
    if (!this.project) return;

    // Determine status based on stages/tasks
    // Hierarchy: Lagging > At Risk > In Progress > Completed

    let hasLagging = false;
    let hasAtRisk = false;
    let hasInProgress = false;

    this.project.stages.forEach(stage => {
      if (stage.tasks) {
        stage.tasks.forEach(task => {
          const status = this.getTaskStatus(task);
          if (status.label === 'Overdue') hasLagging = true;
          if (status.label === 'At-Risk') hasAtRisk = true;
          if (!task.isCompleted) hasInProgress = true;
        });
      }
    });

    if (hasLagging) {
      this.project.status = ProjectStatus.LAGGING;
    } else if (hasAtRisk) {
      this.project.status = ProjectStatus.AT_RISK;
    } else if (hasInProgress) {
      this.project.status = ProjectStatus.IN_PROGRESS;
    } else {
      this.project.status = ProjectStatus.COMPLETED;
    }
  }

  onFieldChange() {
    this.hasUnsavedChanges = true;
  }

  saveChanges() {
    console.log('Exiting edit mode');
  }

  startEditingName() {
    if (!this.canManageProject) return;
    this.isEditingName = true;
    this.editedProjectName = this.project?.name || '';
  }

  saveProjectName() {
    if (this.project && this.editedProjectName.trim() && this.editedProjectName !== this.project.name) {
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
    this.editedProjectName = this.project?.name || '';
  }

  onManagerSelected(event: any) {
    const managerId = event.target.value;
    if (managerId) {
      this.assignProjectManager(managerId);
    }
  }

  assignProjectManager(managerId: string) {
    if (!this.project) return;
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
    if (!this.project) return;
    if (confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      this.projectService.deleteProject(this.project.id)
        .subscribe({
          next: () => {
            if (this.project) this.projectDeleted.emit(this.project.id);
          },
          error: (error) => console.error('Error deleting project:', error)
        });
    }
  }

  archiveProject() {
    if (!this.project) return;
    if (confirm('Are you sure you want to archive this project?')) {
      this.projectService.updateProject(this.project.id, { archived: true } as any)
        .subscribe({
          next: (updatedProject) => {
            this.project = updatedProject;
            this.projectUpdated.emit(updatedProject);
          },
          error: (error) => console.error('Error archiving project:', error)
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
    if (!userId || !this.project) return;

    // Check for duplicates
    if (stage.assignedTeamMembers.some(u => u.id === userId)) {
      alert('User is already assigned to this stage.');
      event.target.value = ''; // Reset dropdown
      return;
    }

    const newUserIds = [...stage.assignedTeamMembers.map(u => u.id), userId];

    // Optimistic update
    const user = this.availableManagers.find(u => u.id === userId);
    if (user) {
      stage.assignedTeamMembers.push(user);
    }

    this.projectService.assignUsersToStage(stage.id, newUserIds).subscribe({
      next: () => {
        console.log('User assigned to stage');
        this.hasUnsavedChanges = true;
      },
      error: (err) => {
        console.error('Error assigning user to stage:', err);
        // Revert on error
        stage.assignedTeamMembers = stage.assignedTeamMembers.filter(u => u.id !== userId);
      }
    });

    event.target.value = ''; // Reset dropdown
  }

  removeUserFromStage(stage: ProjectStage, user: User) {
    if (!this.project) return;
    if (confirm(`Are you sure you want to remove ${user.name} from this stage?`)) {
      const newUserIds = stage.assignedTeamMembers.filter(u => u.id !== user.id).map(u => u.id);

      // Optimistic update
      const originalMembers = [...stage.assignedTeamMembers];
      stage.assignedTeamMembers = stage.assignedTeamMembers.filter(u => u.id !== user.id);

      this.projectService.assignUsersToStage(stage.id, newUserIds).subscribe({
        next: () => {
          console.log('User removed from stage');
          this.hasUnsavedChanges = true;
        },
        error: (err) => {
          console.error('Error removing user from stage:', err);
          // Revert
          stage.assignedTeamMembers = originalMembers;
        }
      });
    }
  }

  assignUserToTask(task: Task, event: any) {
    const userId = event.target.value;
    if (userId && this.project) {
      this.taskService.assignUserToTask(task.id, userId)
        .subscribe({
          next: (updatedTask) => {
            if (this.project) {
              const stage = this.project.stages.find(s => s.id === task.stageId);
              if (stage) {
                const taskIndex = stage.tasks.findIndex(t => t.id === task.id);
                if (taskIndex !== -1) stage.tasks[taskIndex] = updatedTask;

                // Auto-assign to stage if not already assigned
                const isAlreadyAssigned = stage.assignedTeamMembers.some(u => u.id === userId);
                if (!isAlreadyAssigned) {
                  const newUserIds = [...stage.assignedTeamMembers.map(u => u.id), userId];
                  this.projectService.assignUsersToStage(stage.id, newUserIds).subscribe({
                    next: (updatedStage) => {
                      // Update local stage members
                      const user = this.availableManagers.find(u => u.id === userId);
                      if (user) stage.assignedTeamMembers.push(user);
                      console.log('Auto-assigned user to stage:', user?.name);
                    },
                    error: (err) => console.error('Error auto-assigning user to stage:', err)
                  });
                }
              }
            }
            event.target.value = '';
          },
          error: (error) => console.error('Error assigning user to task:', error)
        });
    }
  }

  removeUserFromTask(task: Task, user: User) {
    if (!this.project) return;
    if (confirm(`Are you sure you want to remove ${user.name} from this task?`)) {
      this.taskService.removeUserFromTask(task.id, user.id).subscribe({
        next: (updatedTask) => {
          if (this.project) {
            const stage = this.project.stages.find(s => s.id === task.stageId);
            if (stage) {
              const taskIndex = stage.tasks.findIndex(t => t.id === task.id);
              if (taskIndex !== -1) stage.tasks[taskIndex] = updatedTask;
            }
          }
        },
        error: (err) => console.error('Error removing user from task:', err)
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
        if (this.project) {
          const stage = this.project.stages.find(s => s.id === task.stageId);
          if (stage) {
            const taskIndex = stage.tasks.findIndex(t => t.id === task.id);
            if (taskIndex !== -1) stage.tasks[taskIndex] = updatedTask;
          }
          // Recalculate locally for immediate feedback
          this.calculateProgress();
          // Also sync with backend if needed, but local calc is faster
          // this.projectService.calculateProjectHealth(this.project.id).subscribe();
        }
      },
      error: (error) => console.error('Error updating task status:', error)
    });
  }

  // New method to calculate status dynamically based on dates (from final_user.html)
  getTaskStatus(task: Task): { label: string, color: string } {
    if (task.isCompleted) return { label: 'Completed', color: 'green' };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDate = new Date(task.endDate);

    if (endDate < today) return { label: 'Overdue', color: 'red' };

    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(today.getDate() + 7);

    if (endDate <= sevenDaysFromNow) return { label: 'At-Risk', color: 'yellow' };

    return { label: 'On Track', color: 'green' };
  }

  getStatusBadgeClass(status: string | any): string {
    // If status is an object (from getTaskStatus), use it
    if (typeof status === 'object' && status.color) {
      const colors: { [key: string]: string } = {
        'green': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        'yellow': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
        'red': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
        'blue': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      };
      return `px-2.5 py-0.5 text-xs font-medium rounded-full ${colors[status.color] || 'bg-gray-100 text-gray-800'}`;
    }

    // Fallback for string status (project/stage status)
    if (!status) return 'bg-gray-100 text-gray-800';
    const normalizedStatus = status.toLowerCase().replace(' ', '_');
    const colors: { [key: string]: string } = {
      'on_track': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'at_risk': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      'overdue': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      'completed': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'setup': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'in_progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'lagging': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    };
    return `px-2.5 py-0.5 text-xs font-medium rounded-full ${colors[normalizedStatus] || 'bg-gray-100 text-gray-800'}`;
  }

  getProgressBarColorByPercentage(progress: number): string {
    if (progress <= 25) return 'bg-red-500';
    if (progress <= 50) return 'bg-orange-500';
    if (progress <= 75) return 'bg-blue-500';
    return 'bg-green-500';
  }

  getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  getProgressBarClass(status: string): string {
    const colors: { [key: string]: string } = {
      'on_track': 'bg-green-500',
      'at_risk': 'bg-orange-500',
      'overdue': 'bg-red-500',
      'completed': 'bg-green-600',
      'setup': 'bg-blue-500',
      'in_progress': 'bg-blue-500',
      'lagging': 'bg-red-600'
    };
    return `h-4 rounded-full transition-all duration-500 ${colors[status] || 'bg-gray-500'}`;
  }

  formatStatus(status: string): string {
    if (!status) return '';
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  updateTask(task: Task) {
    if (!task) return;
    this.taskService.updateTask(task.id, {
      name: task.name,
      endDate: task.endDate
    }).subscribe({
      next: (updated) => {
        console.log('Task updated:', updated);
      },
      error: (err) => console.error('Failed to update task:', err)
    });
  }

  canEditTask(task: Task): boolean {
    if (!this.currentUser || !this.project) return false;

    // Admin and PM can always edit
    if (this.currentUser.role === 'admin' || this.currentUser.id === this.project.projectManagerId) {
      return true;
    }

    // Users can edit if they are assigned to the STAGE of this task
    const stage = this.project.stages.find(s => s.id === task.stageId);
    if (stage) {
      return stage.assignedTeamMembers.some(u => u.id === this.currentUser?.id);
    }

    return false;
  }

  get canManageProject(): boolean {
    if (!this.currentUser) return false;
    return this.currentUser.role === 'admin' || this.currentUser.id === this.project?.projectManager?.id;
  }
}