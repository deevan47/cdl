import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Router, ActivatedRoute } from '@angular/router';
import { ProjectService } from '../../shared/services/project.service';
import { Project, ProjectStatus } from '../../shared/models/project.model';
import { User } from '../../shared/models/user.model';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-user-dashboard',
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.css']
})
/**
 * Main dashboard component for regular users and project managers.
 * Handles project viewing, task management, and assignment.
 */
export class UserDashboardComponent implements OnInit {
  isDarkMode = false;
  searchQuery = '';
  selectedManagedStatusFilter = 'all';
  selectedAssignedStatusFilter = 'all';
  currentView: 'home' | 'flame' | 'swayam' | 'profile' | 'settings' | 'notifications' | 'messages' | 'project_details' = 'home';

  // ... (lines 22-327 remain unchanged)

  getManagedProjects(): Project[] {
    let projects = this.managedProjects;

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      projects = projects.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.projectManager?.name.toLowerCase().includes(query)
      );
    }

    if (this.selectedManagedStatusFilter !== 'all') {
      projects = projects.filter(p => p.status === this.selectedManagedStatusFilter);
    }

    return projects;
  }

  getAssignedProjects(): Project[] {
    let projects = this.assignedProjects;

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      projects = projects.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.projectManager?.name.toLowerCase().includes(query)
      );
    }

    if (this.selectedAssignedStatusFilter !== 'all') {
      projects = projects.filter(p => p.status === this.selectedAssignedStatusFilter);
    }

    return projects;
  }

  getOtherProjects(): Project[] {
    let projects = this.otherProjects;

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      projects = projects.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.projectManager?.name.toLowerCase().includes(query)
      );
    }

    return projects;
  }

  currentUser: User | null = null;
  allProjects: Project[] = [];
  managedProjects: Project[] = [];
  assignedProjects: Project[] = [];
  otherProjects: Project[] = [];
  selectedProject: Project | null = null;

  availableUsers: User[] = [];
  showAssignmentModal = false;
  selectedStageForAssignment: any = null;
  selectedUsersForAssignment: string[] = [];

  private ICONS_SVG: { [key: string]: string } = {
    home: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>`,
    user: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`,
    settings: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06-.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`,
    bell: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>`,
    message: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`,
    logout: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>`,
    sun: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`,
    moon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`,
    chevronLeft: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6 text-gray-600 dark:text-gray-300"><polyline points="15 18 9 12 15 6"></polyline></svg>`,
    chevronRight: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6 text-gray-600 dark:text-gray-300"><polyline points="9 18 15 12 9 6"></polyline></svg>`,
    chevronDown: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 text-gray-500"><polyline points="6 9 12 15 18 9"></polyline></svg>`,
    arrowLeft: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>`
  };

  constructor(
    private sanitizer: DomSanitizer,
    private projectService: ProjectService,
    private router: Router,
    private authService: AuthService,
    private route: ActivatedRoute
  ) { }

  logout() {
    this.authService.logout();
    this.router.navigateByUrl('/auth/login');
  }

  ngOnInit() {
    this.loadUser();
    this.loadAvailableUsers();

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      this.isDarkMode = true;
      document.documentElement.classList.add('dark');
    } else {
      this.isDarkMode = false;
      document.documentElement.classList.remove('dark');
    }
    this.route.params.subscribe(params => {
      const section = params['section'];
      if (section && ['home', 'flame', 'swayam', 'profile', 'settings', 'notifications', 'messages'].includes(section)) {
        this.currentView = section;
      } else {
        this.currentView = 'home';
      }
    });
  }

  loadUser() {
    this.authService.currentUser.subscribe(user => {
      if (user) {
        this.currentUser = user.user ? user.user : user;
        this.loadProjects();
      } else {
        this.router.navigate(['/auth/login']);
      }
    });
  }

  loadProjects() {
    if (!this.currentUser) return;

    this.projectService.getAllProjectsForDashboard().subscribe({
      next: (projects) => {
        console.log('Dashboard: Loaded all projects:', projects);
        this.allProjects = projects;
        this.managedProjects = projects.filter(p => p.projectManager?.id === this.currentUser?.id);

        this.assignedProjects = projects.filter(p => p.projectManager?.id !== this.currentUser?.id && this.isAssignedToProject(p));

        this.otherProjects = projects.filter(p => p.projectManager?.id !== this.currentUser?.id && !this.isAssignedToProject(p));

        this.calculateAllProjectsHealth();
      },
      error: (err) => console.error('Error loading projects:', err)
    });
  }

  isAssignedToProject(project: Project): boolean {
    if (!this.currentUser) return false;
    // Check if user is assigned to any stage or task
    // Note: The backend might return assigned projects directly, but since we fetch ALL projects, we need to check manually if the user is involved.
    // However, `assignedProjects` in the previous code was just `!manager`. 
    // The user request implies "Assigned Projects" (My Projects) vs "Other Projects".
    // "My Projects" = Assigned as member OR Manager (but Manager is separate).
    // So "My Projects" (Assigned) = User is in `assignedTeamMembers` of any stage/task.

    // Let's check stages for assignment
    if (project.stages) {
      for (const stage of project.stages) {
        if (stage.assignedTeamMembers?.some(u => u.id === this.currentUser?.id)) return true;
        if (stage.tasks) {
          for (const task of stage.tasks) {
            if (task.assignedTeamMembers?.some(u => u.id === this.currentUser?.id)) return true;
          }
        }
      }
    }
    return false;
  }

  loadAvailableUsers() {
    this.projectService.getAvailableManagers().subscribe({
      next: (users) => {
        this.availableUsers = users;
        console.log('Loaded available users for assignment:', this.availableUsers.length);
      },
      error: (err) => console.error('Failed to load users', err)
    });
  }

  splitProjects() {
    if (!this.currentUser) {
      return;
    }

    this.managedProjects = this.allProjects.filter(p => {
      const isManager = p.projectManager?.id === this.currentUser?.id;
      return isManager;
    });

    this.assignedProjects = this.allProjects.filter(p => {
      return p.projectManager?.id !== this.currentUser?.id;
    });
  }



  getIcon(name: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(this.ICONS_SVG[name] || '');
  }

  getSectionNavClass(view: string): string {
    const baseClass = 'w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center mb-1 font-medium cursor-pointer';
    const activeClass = 'bg-blue-600 text-white shadow-md';
    const inactiveClass = 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200';

    return `${baseClass} ${this.currentView === view ? activeClass : inactiveClass}`;
  }



  navigateTo(view: string, projectId?: string) {
    if (projectId) {
      this.router.navigate(['/projects', projectId]);
      return;
    }
    this.router.navigate(['/dashboard', view]);
  }

  goBack() {
    this.selectedProject = null;
    this.router.navigate(['/dashboard', 'home']);
  }

  selectProject(project: Project) {
    this.router.navigate(['/projects', project.id]);
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    if (this.isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }


  showTaskCreationModal = false;
  selectedStageForTask: any = null;
  newTaskName = '';
  newTaskStartDate = '';
  newTaskEndDate = '';

  openTaskCreationModal(stageOrId: any) {
    if (typeof stageOrId === 'string') {
      this.selectedStageForTask = this.selectedProject?.stages?.find(s => s.id === stageOrId);
    } else {
      this.selectedStageForTask = stageOrId;
    }

    if (!this.selectedStageForTask) {
      console.error('Could not find stage for task creation');
      return;
    }

    this.newTaskName = '';
    this.newTaskStartDate = '';
    this.newTaskEndDate = '';
    this.showTaskCreationModal = true;
  }

  closeTaskCreationModal() {
    this.showTaskCreationModal = false;
    this.selectedStageForTask = null;
  }

  createTask() {
    console.log('Creating task...', {
      stage: this.selectedStageForTask,
      name: this.newTaskName,
      start: this.newTaskStartDate,
      end: this.newTaskEndDate
    });

    if (!this.selectedStageForTask || !this.selectedStageForTask.id || !this.newTaskName || !this.newTaskStartDate || !this.newTaskEndDate) {
      console.error('Task creation failed: Missing required fields');
      return;
    }

    const taskData = {
      name: this.newTaskName,
      startDate: new Date(this.newTaskStartDate),
      endDate: new Date(this.newTaskEndDate),
      isCompleted: false
    };

    this.projectService.addTaskToStage(this.selectedStageForTask.id, taskData).subscribe({
      next: (task) => {
        // Refresh project
        this.loadProjects();
        this.closeTaskCreationModal();
      },
      error: (err) => console.error('Failed to create task', err)
    });
  }



  toggleTask(task: any) {
    if (!this.canToggleTask(task)) return;

    const updates = { isCompleted: !task.isCompleted };
    this.projectService.updateTask(task.id, updates).subscribe({
      next: (updatedTask) => {
        task.isCompleted = updatedTask.isCompleted;
        this.calculateAllProjectsHealth();
      },
      error: (err) => {
        console.error('Failed to update task', err);
        // Revert if failed
        task.isCompleted = !task.isCompleted;
      }
    });
  }

  canToggleTask(task: any): boolean {
    if (this.selectedProject?.projectManager?.id === this.currentUser?.id) return true;

    const stage = this.selectedProject?.stages?.find(s => s.id === task.stageId);
    if (!stage) return false;

    if (this.isStageLocked(stage)) return false;

    return stage.assignedTeamMembers?.some((u: User) => u.id === this.currentUser?.id);
  }

  toggleStageSection(stage: any) {
    if (this.isStageLocked(stage)) return;
    stage.isOpen = !stage.isOpen;
  }

  isStageLocked(stage: any): boolean {
    if (!this.selectedProject || !this.selectedProject.stages) return false;

    const index = this.selectedProject.stages.findIndex(s => s.id === stage.id);
    if (index <= 0) return false;

    const prevStage = this.selectedProject.stages[index - 1];

    if ((prevStage as any)['status']?.label === 'Completed') return false;

    if (!prevStage.tasks || prevStage.tasks.length === 0) return false;

    const allCompleted = prevStage.tasks.every((t: any) => t.isCompleted);
    return !allCompleted;
  }

  getFilteredProjects(platform: string): Project[] {
    if (!this.allProjects) return [];

    let filtered = this.allProjects;

    if (platform) {
      filtered = filtered.filter(p => p.platform && p.platform.toLowerCase() === platform.toLowerCase());
    }

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.projectManager?.name.toLowerCase().includes(query)
      );
    }

    return filtered;
  }



  getStats() {
    return {
      total: this.allProjects.length,
      completed: this.allProjects.filter(p => p.status === ProjectStatus.COMPLETED).length,
      inProgress: this.allProjects.filter(p => p.status === ProjectStatus.IN_PROGRESS).length,
      lagging: this.allProjects.filter(p => p.status === ProjectStatus.LAGGING).length
    };
  }



  openAssignmentModal(stage: any) {
    this.selectedStageForAssignment = stage;
    this.selectedUsersForAssignment = stage.assignedTeamMembers?.map((u: User) => u.id) || [];
    this.showAssignmentModal = true;
  }

  closeAssignmentModal() {
    this.showAssignmentModal = false;
    this.selectedStageForAssignment = null;
    this.selectedUsersForAssignment = [];
  }

  toggleUserSelection(userId: string) {
    const index = this.selectedUsersForAssignment.indexOf(userId);
    if (index > -1) {
      this.selectedUsersForAssignment.splice(index, 1);
    } else {
      this.selectedUsersForAssignment.push(userId);
    }
  }

  saveAssignments() {
    if (!this.selectedStageForAssignment) return;

    this.projectService.assignUsersToStage(this.selectedStageForAssignment.id, this.selectedUsersForAssignment).subscribe({
      next: (updatedStage) => {
        // Update local state
        const stageIndex = this.selectedProject?.stages?.findIndex(s => s.id === updatedStage.id);
        if (this.selectedProject && stageIndex !== undefined && stageIndex > -1) {
          this.loadProjects();
        }
        this.closeAssignmentModal();
      },
      error: (err) => console.error('Failed to assign users', err)
    });
  }

  isUserAssigned(userId: string): boolean {
    return this.selectedUsersForAssignment.includes(userId);
  }

  canEditStage(stage: any): boolean {
    if (!this.currentUser) return false;
    // PM can always edit
    if (this.selectedProject?.projectManager?.id === this.currentUser.id) return true;
    return false; // Only PM can edit structure (add tasks, assign users)
  }



  getTaskStatus(task: any) {
    const endDate = new Date(task.endDate);
    const today = new Date();
    if (task.isCompleted) return { label: 'Completed', color: 'green' };
    if (endDate < today) return { label: 'Overdue', color: 'red' };

    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(today.getDate() + 7);

    if (endDate <= sevenDaysFromNow) return { label: 'At-Risk', color: 'yellow' };
    return { label: 'On Track', color: 'green' };
  }

  calculateAllProjectsHealth() {
    // Use backend values if available, or calculate locally
    // For now, relying on backend 'overallProgress' and 'status'
    this.allProjects.forEach(p => {
      // Map backend status to UI colors
      let color = 'blue';
      if (p.status === ProjectStatus.COMPLETED) color = 'green';
      if (p.status === ProjectStatus.LAGGING) color = 'red';
      if (p.status === ProjectStatus.AT_RISK) color = 'yellow';

      (p as any)['overallStatus'] = { label: p.status, color };

      (p as any)['overallStatus'] = { label: p.status, color };

      p.stages?.forEach(stage => {
        let sColor = 'blue';

        if (stage.tasks && stage.tasks.length > 0) {
          const allDone = stage.tasks.every((t: any) => t.isCompleted);
          const completedCount = stage.tasks.filter((t: any) => t.isCompleted).length;
          (stage as any)['progress'] = stage.tasks.length > 0 ? (completedCount / stage.tasks.length) * 100 : 0;

          if (allDone && stage.tasks.length > 0) {
            (stage as any)['status'] = { label: 'Completed', color: 'green' };
          } else {
            (stage as any)['status'] = { label: 'In Progress', color: 'blue' };
          }
        } else {
          (stage as any)['status'] = { label: 'Pending', color: 'gray' };
          (stage as any)['progress'] = 0;
        }
      });
    });
  }

  getStatusBadgeClass(color: string | undefined): string {
    const classes: { [key: string]: string } = {
      green: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      red: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      gray: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    };
    return `px-3 py-1 rounded-[0.5rem] text-xs font-medium ${classes[color || 'blue']}`;
  }

  formatStatus(status: string): string {
    if (!status) return '';
    const formatted = status.replace(/_/g, ' ');
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  }

  getProgressBarColorClass(color: string | undefined): string {
    const classes: { [key: string]: string } = {
      green: 'bg-green-500',
      yellow: 'bg-yellow-500',
      red: 'bg-red-500',
      blue: 'bg-blue-500',
      gray: 'bg-gray-500'
    };
    return classes[color || 'blue'];
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

  getUserAvatar(user: User | undefined): string {
    return user?.avatar || 'assets/default-avatar.png';
  }

  getUserName(user: User | undefined): string {
    return user?.name || 'Unknown';
  }
}