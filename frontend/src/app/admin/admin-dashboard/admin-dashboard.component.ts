import { Component, OnInit } from '@angular/core';
import { ProjectService } from '../../shared/services/project.service';
import { UserService } from '../../shared/services/user.service';
import { Project, ProjectPlatform, ProjectStatus } from '../../shared/models/project.model';
import { User } from '../../shared/models/user.model';
import { AuthService } from '../../shared/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  projects: Project[] = [];
  filteredProjects: Project[] = [];
  selectedPlatform: ProjectPlatform | 'all' = 'all';
  currentView: 'home' | 'flame' | 'swayam' = 'home';
  selectedProject: Project | null = null;
  isDarkMode = false;
  availableManagers: any[] = [];
  showTaskModal = false;
  selectedStageId: string = '';
  currentSection: 'dashboard' | 'projects' | 'users' | 'settings' = 'dashboard';
  showProjectCreationModal = false;
  selectedPlatformForCreation!: ProjectPlatform;

  constructor(
    private projectService: ProjectService,
    private userService: UserService,
    private authService: AuthService, // Added
    private router: Router // Added
  ) { }

  navigateToProject(projectId: string) {
    console.log('Navigating to project:', projectId);
    this.router.navigate(['/projects', projectId]);
  }

  logout() {
    this.authService.logout();
    this.router.navigateByUrl('/auth/login');
  }

  ngOnInit() {
    this.loadProjects();
    this.loadAvailableManagers();
    this.detectColorScheme();
  }

  loadProjects() {
    this.projectService.getAllProjects().subscribe({
      next: (projects) => {
        this.projects = projects;
        this.filterProjects();
      },
      error: (error) => console.error('Error loading projects:', error)
    });
  }

  loadAvailableManagers() {
    this.projectService.getAvailableManagers().subscribe({
      next: (users) => {
        // Every user can be a manager
        this.availableManagers = users;
      },
      error: (error) => {
        console.error('Error loading managers:', error);
        this.availableManagers = [];
      }
    });
  }

  filterProjects() {
    if (this.selectedPlatform === 'all') {
      this.filteredProjects = this.projects;
    } else {
      this.filteredProjects = this.projects.filter(p => p.platform === this.selectedPlatform);
    }
  }

  navigateTo(view: 'home' | 'flame' | 'swayam') {
    this.currentView = view;
    if (view === 'home') {
      this.selectedPlatform = 'all';
    } else {
      this.selectedPlatform = view as ProjectPlatform;
    }
    this.filterProjects();
    this.selectedProject = null;
  }

  navigateToSection(section: 'dashboard' | 'projects' | 'users' | 'settings') {
    this.currentSection = section;
  }

  selectProject(project: Project) {
    this.selectedProject = project;
  }

  openProjectCreationModal(platform: ProjectPlatform) {
    this.selectedPlatformForCreation = platform;
    this.showProjectCreationModal = true;
  }

  closeProjectCreationModal() {
    this.showProjectCreationModal = false;
    this.selectedPlatformForCreation = null!;
  }

  onProjectCreated(projectData: any) {
    console.log('onProjectCreated called with data:', projectData);
    this.projectService.createProject(projectData).subscribe({
      next: (project) => {
        console.log('Project created successfully:', project);
        this.projects.unshift(project);
        this.selectedProject = project;
        this.filterProjects();
        this.closeProjectCreationModal();
      },
      error: (error) => {
        console.error('Error creating project:', error);
        alert('Failed to create project: ' + (error.error?.message || error.message));
      }
    });
  }

  createNewProject(platform: ProjectPlatform | 'home') {
    if (platform === 'home') {
      this.openProjectCreationModal(ProjectPlatform.SWAYAM);
    } else {
      this.openProjectCreationModal(platform);
    }
  }

  deleteProject(projectId: string) {
    if (confirm('Are you sure you want to delete this project?')) {
      this.projectService.deleteProject(projectId).subscribe({
        next: () => {
          this.projects = this.projects.filter(p => p.id !== projectId);
          if (this.selectedProject?.id === projectId) {
            this.selectedProject = null;
          }
          this.filterProjects();
        },
        error: (error) => console.error('Error deleting project:', error)
      });
    }
  }

  assignProjectManager(projectId: string, managerId: string) {
    if (managerId) {
      this.projectService.assignProjectManager(projectId, managerId).subscribe({
        next: (updatedProject) => {
          const index = this.projects.findIndex(p => p.id === projectId);
          if (index !== -1) {
            this.projects[index] = updatedProject;
          }
          if (this.selectedProject?.id === projectId) {
            this.selectedProject = updatedProject;
          }
        },
        error: (error) => console.error('Error assigning manager:', error)
      });
    }
  }

  getStatusColor(status: ProjectStatus): string {
    const colors = {
      [ProjectStatus.SETUP]: 'blue',
      [ProjectStatus.IN_PROGRESS]: 'blue',
      [ProjectStatus.AT_RISK]: 'yellow',
      [ProjectStatus.LAGGING]: 'red',
      [ProjectStatus.COMPLETED]: 'green'
    };
    return colors[status] || 'gray';
  }

  getStats() {
    const total = this.projects.length;
    const completed = this.projects.filter(p => p.status === ProjectStatus.COMPLETED).length;
    const inProgress = this.projects.filter(p =>
      [ProjectStatus.IN_PROGRESS, ProjectStatus.AT_RISK].includes(p.status)
    ).length;
    const lagging = this.projects.filter(p => p.status === ProjectStatus.LAGGING).length;

    return { total, completed, inProgress, lagging };
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    if (this.isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  openTaskModal(stageId: string) {
    this.selectedStageId = stageId;
    this.showTaskModal = true;
  }

  closeTaskModal() {
    this.showTaskModal = false;
    this.selectedStageId = '';
  }

  onTaskCreated() {
    this.closeTaskModal();
    this.loadProjects();
  }

  onProjectUpdated(updatedProject: Project) {
    const index = this.projects.findIndex(p => p.id === updatedProject.id);
    if (index !== -1) {
      this.projects[index] = updatedProject;
    }
    if (this.selectedProject?.id === updatedProject.id) {
      this.selectedProject = updatedProject;
    }
    this.filterProjects();
  }

  onProjectDeleted(projectId: string) {
    this.projects = this.projects.filter(p => p.id !== projectId);
    if (this.selectedProject?.id === projectId) {
      this.selectedProject = null;
    }
    this.filterProjects();
  }

  private detectColorScheme() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      this.isDarkMode = true;
      document.documentElement.classList.add('dark');
    }
  }

  getNavClass(view: string): string {
    const baseClasses = "w-full text-left px-4 py-2 rounded-md transition-colors duration-200";
    const activeClasses = this.currentView === view
      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700';
    return `${baseClasses} ${activeClasses}`;
  }

  getSectionNavClass(section: string): string {
    const baseClasses = "w-full text-left px-4 py-2 rounded-md transition-colors duration-200";
    const activeClasses = this.currentSection === section
      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700';
    return `${baseClasses} ${activeClasses}`;
  }

  getPlatformDotClass(platform: ProjectPlatform): string {
    return `w-3 h-3 rounded-full ${platform === ProjectPlatform.FLAME ? 'bg-orange-500' : 'bg-blue-500'}`;
  }

  getStatusBadgeClass(status: ProjectStatus): string {
    const colors = {
      [ProjectStatus.SETUP]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      [ProjectStatus.IN_PROGRESS]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      [ProjectStatus.AT_RISK]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      [ProjectStatus.LAGGING]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      [ProjectStatus.COMPLETED]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    };
    return `px-2.5 py-0.5 text-xs font-medium rounded-full ${colors[status]}`;
  }

  getProgressBarClass(status: ProjectStatus): string {
    const colors = {
      [ProjectStatus.SETUP]: 'bg-blue-500',
      [ProjectStatus.IN_PROGRESS]: 'bg-blue-500',
      [ProjectStatus.AT_RISK]: 'bg-yellow-500',
      [ProjectStatus.LAGGING]: 'bg-red-500',
      [ProjectStatus.COMPLETED]: 'bg-green-500'
    };
    return `h-2 rounded-full transition-all duration-500 ${colors[status]}`;
  }

  getPlatformTextClass(platform: ProjectPlatform): string {
    return platform === ProjectPlatform.FLAME ? 'text-orange-500' : 'text-blue-500';
  }

  getProjectItemClass(project: Project): string {
    const baseClasses = "p-4 border-b dark:border-gray-700 cursor-pointer transition-colors";
    const selectedClasses = this.selectedProject?.id === project.id
      ? (project.platform === ProjectPlatform.FLAME ? 'bg-orange-500/10' : 'bg-blue-500/10')
      : 'hover:bg-gray-100 dark:hover:bg-gray-800/50';
    return `${baseClasses} ${selectedClasses}`;
  }
  // --- User Management ---
  showUserCreationModal = false;
  isEditingUser = false;
  editingUserId: string | null = null;
  newUser = { name: '', email: '', password: '', role: 'user' };

  loadAvailableUsers() {
    this.projectService.getAvailableManagers().subscribe({
      next: (users) => {
        // Sort: Project Managers first, then Users
        this.availableManagers = users.sort((a, b) => {
          if (a.role === 'project_manager' && b.role !== 'project_manager') return -1;
          if (a.role !== 'project_manager' && b.role === 'project_manager') return 1;
          return 0;
        });
      },
      error: (err) => console.error('Failed to load users', err)
    });
  }

  openUserCreationModal() {
    this.showUserCreationModal = true;
    this.isEditingUser = false;
    this.editingUserId = null;
    this.newUser = { name: '', email: '', password: '', role: 'user' };
  }

  openEditUserModal(user: User) {
    this.showUserCreationModal = true;
    this.isEditingUser = true;
    this.editingUserId = user.id;
    this.newUser = {
      name: user.name,
      email: user.email,
      password: '', // Don't show password
      role: user.role
    };
  }

  closeUserCreationModal() {
    this.showUserCreationModal = false;
    this.isEditingUser = false;
    this.editingUserId = null;
  }

  saveUser() {
    if (this.isEditingUser) {
      this.updateUser();
    } else {
      this.createUser();
    }
  }

  createUser() {
    if (!this.newUser.name || !this.newUser.email || !this.newUser.password) return;

    this.userService.createUser(this.newUser as any).subscribe({
      next: (user) => {
        console.log('User created:', user);
        this.loadAvailableUsers(); // Reload to sort
        this.closeUserCreationModal();
      },
      error: (err) => console.error('Error creating user:', err)
    });
  }

  updateUser() {
    if (!this.editingUserId || !this.newUser.name || !this.newUser.email) return;

    const updateData: any = { ...this.newUser };
    if (!updateData.password) delete updateData.password; // Don't update password if empty

    this.userService.updateUser(this.editingUserId, updateData).subscribe({
      next: (user) => {
        console.log('User updated:', user);
        this.loadAvailableUsers();
        this.closeUserCreationModal();
      },
      error: (err) => console.error('Error updating user:', err)
    });
  }

  deleteUser(userId: string) {
    if (confirm('Are you sure you want to delete this user?')) {
      this.userService.deleteUser(userId).subscribe({
        next: () => {
          console.log('User deleted');
          this.loadAvailableUsers();
        },
        error: (err) => console.error('Error deleting user:', err)
      });
    }
  }
}