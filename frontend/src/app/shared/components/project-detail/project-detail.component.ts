import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Project, ProjectStage, Task } from '../../models/project.model';
import { User } from '../../models/user.model';
import { Comment } from '../../models/comment.model';
import { ProjectService } from '../../services/project.service';
import { AuthService } from '../../services/auth.service';
import { TaskService } from '../../services/task.service';
import { CommentService } from '../../services/comment.service';

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

  comments: Comment[] = [];
  newCommentContent = '';

  constructor(
    private route: ActivatedRoute,
    private projectService: ProjectService,
    private authService: AuthService,
    private taskService: TaskService,
    private commentService: CommentService
  ) { }

  ngOnInit() {
    if (this.project) {
      this.editedProjectName = this.project.name;
      this.loadComments();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['project'] && this.project) {
      this.editedProjectName = this.project.name;
      this.loadComments();
    }
  }

  loadComments() {
    if (!this.project) return;

    // Sort stages: Pre-Production -> Production -> Post-Production
    const stageOrder = {
      'Pre-Production': 1,
      'Production': 2,
      'Post-Production': 3
    };

    if (this.project.stages) {
      this.project.stages.sort((a, b) => {
        const orderA = stageOrder[a.name] || 99;
        const orderB = stageOrder[b.name] || 99;
        return orderA - orderB;
      });
    }

    this.commentService.getComments(this.project.id).subscribe({
      next: (comments) => this.comments = comments,
      error: (err) => console.error('Error loading comments:', err)
    });
  }

  postComment() {
    if (!this.project || !this.newCommentContent.trim()) return;

    this.commentService.createComment(this.project.id, this.newCommentContent).subscribe({
      next: (comment) => {
        this.loadComments();
        this.newCommentContent = '';
      },
      error: (err) => console.error('Error posting comment:', err)
    });
  }

  toggleEditMode() {
    if (this.isEditMode) {
      // Save changes
      this.saveChanges();
      this.isEditMode = false;
    } else {
      this.isEditMode = true;
      this.hasUnsavedChanges = false; // Reset on enter
    }
  }

  onFieldChange() {
    this.hasUnsavedChanges = true;
  }

  saveChanges() {
    console.log('Exiting edit mode');
  }

  startEditingName() {
    // Admins or PMs can edit project name
    if (!this.canManageProject) {
      console.log('Only admins or PMs can edit project name');
      return;
    }
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
    if (userId && this.project) {
      this.projectService.assignUsersToStage(stage.id, [userId])
        .subscribe({
          next: (updatedStage) => {
            if (this.project) {
              const stageIndex = this.project.stages.findIndex(s => s.id === stage.id);
              if (stageIndex !== -1) {
                const user = this.availableManagers.find(u => u.id === userId);
                if (user && !stage.assignedTeamMembers.find(u => u.id === userId)) {
                  stage.assignedTeamMembers.push(user);
                }
              }
            }
            event.target.value = '';
          },
          error: (error) => console.error('Error assigning user to stage:', error)
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
                if (taskIndex !== -1) {
                  stage.tasks[taskIndex] = updatedTask;
                }
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
        if (this.project) {
          const stage = this.project.stages.find(s => s.id === task.stageId);
          if (stage) {
            const taskIndex = stage.tasks.findIndex(t => t.id === task.id);
            if (taskIndex !== -1) {
              stage.tasks[taskIndex] = updatedTask;
            }
          }
          this.projectService.calculateProjectHealth(this.project.id).subscribe();
        }
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
    if (!this.currentUser) return false;
    // Admin and PM can always edit
    if (this.currentUser.role === 'admin' || this.currentUser.id === this.project?.projectManager?.id) return true;

    // Assigned users can ONLY edit if they are assigned to the task
    // The user requirement says: "if i assign a task to a user he/she can only edit that when the project manager assigned"
    // This implies they must be in the assignedTeamMembers list.
    return task.assignedTeamMembers?.some(u => u.id === this.currentUser?.id) || false;
  }

  get canManageProject(): boolean {
    if (!this.currentUser) return false;
    return this.currentUser.role === 'admin' || this.currentUser.id === this.project?.projectManager?.id;
  }
}