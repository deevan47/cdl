import { Component, OnInit } from '@angular/core';
import { ProjectService } from '../../shared/services/project.service';
import { UserService } from '../../shared/services/user.service';
import { Project, ProjectPlatform, ProjectStatus } from '../../shared/models/project.model';
import { User } from '../../shared/models/user.model';
import { AuthService } from '../../shared/services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';

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
  viewMode: 'list' | 'grid' = 'list'; // Added viewMode
  selectedProject: Project | null = null;
  isDarkMode = false;
  availableManagers: any[] = []; // Users/Managers list

  // Modal & Navigation States
  showTaskModal = false;
  selectedStageId: string = '';
  currentSection: 'dashboard' | 'projects' | 'users' | 'settings' = 'dashboard';

  // Project Creation
  showProjectCreationModal = false;
  selectedPlatformForCreation!: ProjectPlatform;

  // User Management
  showUserCreationModal = false;
  isEditingUser = false;
  newUser: any = { name: '', email: '', password: '', role: 'user' }; // Initialize for form binding

  // Filters
  searchQuery = '';
  selectedStatusFilter = 'all';
  currentUser: User | null = null;

  constructor(
    private projectService: ProjectService,
    private userService: UserService, // Keep UserService injected
    public authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user ? (user.user || user) : null;
    });

    this.loadProjects();
    this.loadAvailableManagers();

    // Load Theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      this.isDarkMode = true;
      document.documentElement.classList.add('dark');
    } else {
      this.isDarkMode = false;
      document.documentElement.classList.remove('dark');
    }

    // Handle Query Params for Tabs
    this.route.queryParams.subscribe(params => {
      const tab = params['tab'];
      const view = params['view'];

      if (tab) {
        this.currentSection = tab;
      } else {
        this.currentSection = 'dashboard';
      }

      // If we are in 'projects' tab or just 'dashboard', handle view
      if (view) {
        this.currentView = view;
        this.viewMode = (view === 'flame' || view === 'swayam') ? 'grid' : 'list';
      } else {
        // Default to 'home' (All Projects) and 'list' view if no specific view requested
        this.currentView = 'home';
        this.viewMode = 'list';
      }

      this.filterProjects();
    });
  }

  loadProjects() {
    this.projectService.getAllProjects().subscribe({
      next: (projects) => {
        this.projects = projects;
        this.filterProjects();

        // Refresh selectedProject if it exists
        if (this.selectedProject) {
          const updated = this.projects.find(p => p.id === this.selectedProject!.id);
          if (updated) {
            this.selectedProject = updated;
          }
        }
      },
      error: (error) => console.error('Error loading projects:', error)
    });
  }

  loadAvailableManagers() {
    this.projectService.getAvailableManagers().subscribe({
      next: (users) => {
        this.availableManagers = users;
      },
      error: (error) => {
        console.error('Error loading managers:', error);
        this.availableManagers = [];
      }
    });
  }

  filterProjects() {
    let filtered = this.projects;

    // Filter by Platform
    if (this.selectedPlatform !== 'all') {
      filtered = filtered.filter(p => p.platform === this.selectedPlatform);
    }

    // Filter by Search Query
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.projectManager?.name?.toLowerCase().includes(query)
      );
    }

    // Filter by Status
    if (this.selectedStatusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === this.selectedStatusFilter);
    }

    this.filteredProjects = filtered;
  }

  navigateToProject(projectId: string) {
    console.log('Navigating to project:', projectId);
    this.router.navigate(['/projects', projectId]);
  }

  logout() {
    this.authService.logout();
    this.router.navigateByUrl('/auth/login');
  }

  // UI Helper Methods (Missing in original)
  getSectionNavClass(section: string): string {
    const baseClass = 'w-full text-left px-4 py-2 rounded-lg transition-colors duration-200 flex items-center mb-1';
    const activeClass = 'bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 font-medium border-l-4 border-blue-600 dark:border-blue-400';
    const inactiveClass = 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800';

    return `${baseClass} ${this.currentSection === section ? activeClass : inactiveClass}`;
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

  formatRole(role: string): string {
    return role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  navigateToSection(section: 'dashboard' | 'projects' | 'users' | 'settings') {
    this.currentSection = section;

    // Reset filters when navigating to main sections
    if (section === 'dashboard' || section === 'projects') {
      this.viewMode = 'list';
      this.currentView = 'home';
      this.selectedPlatform = 'all';
      this.searchQuery = '';
      this.selectedStatusFilter = 'all';
      this.filterProjects();
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab: section },
      queryParamsHandling: 'merge',
    });
  }

  navigateTo(view: 'home' | 'flame' | 'swayam') {
    this.currentView = view;
    this.currentSection = 'projects'; // Switch to projects tab

    if (view === 'home') {
      this.viewMode = 'list';
      this.selectedPlatform = 'all';
    } else {
      this.viewMode = 'grid'; // Switch to grid view for specific platforms
      this.selectedPlatform = view as ProjectPlatform;
    }

    this.filterProjects();
    this.selectedProject = null; // Reset selected project when changing view

    // Update URL tab
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab: 'projects' },
      queryParamsHandling: 'merge',
    });
  }

  switchToGridView() {
    this.viewMode = 'grid';
  }

  switchToListView() {
    this.viewMode = 'list';
  }

  getNavClass(view: string): string {
    const isActive = this.currentView === view;
    return isActive
      ? 'px-4 py-2 bg-blue-600 text-white rounded-lg shadow-sm'
      : 'px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700';
  }

  // Dashboard Stats
  getStats() {
    return {
      total: this.projects.length,
      completed: this.projects.filter(p => p.status === 'completed').length,
      inProgress: this.projects.filter(p => p.status === 'in_progress').length,
      lagging: this.projects.filter(p => p.status === 'lagging').length
    };
  }

  // Platform & Status Styling Helpers
  getPlatformDotClass(platform: ProjectPlatform): string {
    return platform === 'flame'
      ? 'w-3 h-3 rounded-full bg-orange-500'
      : 'w-3 h-3 rounded-full bg-blue-500';
  }

  getStatusBadgeClass(status: string): string {
    const classes = {
      completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      at_risk: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      lagging: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      setup: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    };
    return `px-2 py-1 rounded-full text-xs font-medium ${classes[status as keyof typeof classes] || classes.setup}`;
  }

  getProgressBarClass(status: string): string {
    switch (status) {
      case 'completed': return 'h-2 rounded-full bg-green-500';
      case 'lagging': return 'h-2 rounded-full bg-red-500';
      case 'at_risk': return 'h-2 rounded-full bg-yellow-500';
      default: return 'h-2 rounded-full bg-blue-500';
    }
  }

  getPlatformTextClass(view: string): string {
    if (view === 'flame') return 'text-orange-600 dark:text-orange-400';
    if (view === 'swayam') return 'text-blue-600 dark:text-blue-400';
    return 'text-gray-800 dark:text-white';
  }

  getProjectItemClass(project: Project): string {
    const isSelected = this.selectedProject?.id === project.id;
    const baseClass = 'p-4 border-b dark:border-gray-700 cursor-pointer transition-colors';
    const activeClass = 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500';
    const inactiveClass = 'hover:bg-gray-50 dark:hover:bg-gray-700/50';
    return `${baseClass} ${isSelected ? activeClass : inactiveClass}`;
  }

  selectProject(project: Project) {
    this.selectedProject = project;
  }

  // Project Creation Modal Handlers
  openProjectCreationModal(platform: string) {
    this.selectedPlatformForCreation = platform as ProjectPlatform;
    this.showProjectCreationModal = true;
  }

  closeProjectCreationModal() {
    this.showProjectCreationModal = false;
  }

  onProjectCreated(projectData: any) {
    // Call service to create project
    this.projectService.createProject(projectData).subscribe({
      next: (newProject) => {
        console.log('Project created successfully:', newProject);
        // Instant update
        this.projects.unshift(newProject);
        this.filterProjects();
        this.showProjectCreationModal = false;
      },
      error: (error) => {
        console.error('Error creating project:', error);
        // Optionally show error message to user
      }
    });
  }

  // Project Update/Delete Handlers
  onProjectUpdated(project: Project) {
    this.loadProjects();
  }

  onProjectDeleted(projectId: string) {
    this.selectedProject = null;
    this.loadProjects();
  }

  // Task Modal Handlers
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
    this.loadProjects(); // Refresh to show new task/progress
  }

  // User Management Handlers
  openUserCreationModal() {
    this.isEditingUser = false;
    this.newUser = { name: '', email: '', password: '', role: 'user' };
    this.showUserCreationModal = true;
  }

  openEditUserModal(user: any) {
    this.isEditingUser = true;
    this.newUser = { ...user, password: '' }; // Don't fill password for edit
    this.showUserCreationModal = true;
  }

  closeUserCreationModal() {
    this.showUserCreationModal = false;
    this.newUser = { name: '', email: '', password: '', role: 'user' };
  }

  saveUser() {
    // Basic validation
    if (!this.newUser.name || !this.newUser.email) return;

    if (this.isEditingUser) {
      // Logic for updating user
      // Assuming userService has update method, if not, you'd add it
      // this.userService.updateUser(this.newUser.id, this.newUser).subscribe(...)
      console.log('Update user:', this.newUser);
      // Simulate success for UI
      this.loadAvailableManagers();
      this.closeUserCreationModal();
    } else {
      // Logic for creating user
      // this.userService.createUser(this.newUser).subscribe(...)
      console.log('Create user:', this.newUser);
      // Simulate success for UI
      this.loadAvailableManagers();
      this.closeUserCreationModal();
    }
  }

  deleteUser(userId: string) {
    if (confirm('Are you sure you want to delete this user?')) {
      // this.userService.deleteUser(userId).subscribe(...)
      console.log('Delete user:', userId);
      // Simulate success
      this.loadAvailableManagers();
    }
  }
}