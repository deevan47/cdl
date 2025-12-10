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
  viewMode: 'list' | 'grid' = 'list';
  selectedProject: Project | null = null;
  isDarkMode = false;
  availableManagers: any[] = [];

  showTaskModal = false;
  selectedStageId: string = '';
  currentSection: 'dashboard' | 'projects' | 'users' | 'settings' = 'dashboard';

  showProjectCreationModal = false;
  selectedPlatformForCreation!: ProjectPlatform;

  showUserCreationModal = false;
  isEditingUser = false;
  newUser: any = { name: '', email: '', password: '', role: 'user' };

  searchQuery = '';
  selectedStatusFilter = 'all';
  currentUser: User | null = null;

  constructor(
    private projectService: ProjectService,
    private userService: UserService,
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

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      this.isDarkMode = true;
      document.documentElement.classList.add('dark');
    } else {
      this.isDarkMode = false;
      document.documentElement.classList.remove('dark');
    }

    this.route.queryParams.subscribe(params => {
      const tab = params['tab'];
      const view = params['view'];

      if (tab) {
        this.currentSection = tab;
      } else {
        this.currentSection = 'dashboard';
      }

      if (this.currentSection === 'projects') {
        this.viewMode = 'list';
        if (view) {
          this.currentView = view;
          this.selectedPlatform = view === 'home' ? 'all' : (view as ProjectPlatform);
        } else {
          this.currentView = 'home';
          this.selectedPlatform = 'all';
        }
      } else {
        if (view) {
          this.currentView = view;
          this.viewMode = (view === 'flame' || view === 'swayam') ? 'grid' : 'list';
        } else {
          this.currentView = 'home';
          this.viewMode = 'list';
        }
      }

      this.filterProjects();
    });
  }

  loadProjects() {
    this.projectService.getAllProjects().subscribe({
      next: (projects) => {
        this.projects = projects;
        this.filterProjects();

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

    if (this.selectedPlatform !== 'all') {
      filtered = filtered.filter(p => p.platform === this.selectedPlatform);
    }

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.projectManager?.name?.toLowerCase().includes(query)
      );
    }

    if (this.selectedStatusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === this.selectedStatusFilter);
    }

    this.filteredProjects = filtered;
  }

  navigateToProject(projectId: string) {
    console.log('Navigating to project:', projectId);
    this.router.navigate(['/projects', projectId]);
  }

  navigateToProfile(userId: string, event: Event) {
    event.stopPropagation(); // Prevent triggering the project click
    console.log('Navigating to profile:', userId);
    this.router.navigate(['/profile', userId]);
  }

  logout() {
    this.authService.logout();
    this.router.navigateByUrl('/auth/login');
  }

  getSectionNavClass(section: string): string {
    const baseClass = 'w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center mb-1 font-medium';
    const activeClass = 'bg-blue-600 text-white shadow-md';
    const inactiveClass = 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200';

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
      queryParams: { tab: section, view: 'home' },
      queryParamsHandling: 'merge',
    });
  }

  navigateTo(view: 'home' | 'flame' | 'swayam') {
    this.currentView = view;
    this.currentSection = 'dashboard';

    if (view === 'home') {
      this.viewMode = 'list';
      this.selectedPlatform = 'all';
    } else {
      this.viewMode = 'grid';
      this.selectedPlatform = view as ProjectPlatform;
    }

    this.filterProjects();
    this.selectedProject = null;

    // Update URL tab
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab: 'dashboard', view: view },
      queryParamsHandling: 'merge',
    });
  }

  switchProjectView(view: 'home' | 'flame' | 'swayam') {
    this.currentView = view;

    this.viewMode = 'list';
    this.selectedPlatform = view === 'home' ? 'all' : (view as ProjectPlatform);

    this.filterProjects();
    this.selectedProject = null;

    // Update URL tab
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab: 'projects', view: view },
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

  getStats() {
    return {
      total: this.projects.length,
      completed: this.projects.filter(p => p.status === 'completed').length,
      inProgress: this.projects.filter(p => p.status === 'in_progress').length,
      lagging: this.projects.filter(p => p.status === 'lagging').length,
      atRisk: this.projects.filter(p => p.status === 'at_risk').length
    };
  }

  downloadCSV() {
    const headers = [
      'Project Name',
      'Course Coordinator',
      'Project Owner',
      'Overall Status',
      'Status-Completed (%)',
      'Pre-Production Status',
      'Production Status',
      'Post-Production Status',
      'Target Completion Date'
    ];

    const csvData = this.projects.map(p => {
      const preProd = p.stages.find(s => s.name === 'Pre-Production');
      const prod = p.stages.find(s => s.name === 'Production');
      const postProd = p.stages.find(s => s.name === 'Post-Production');

      const getStageStatus = (stage: any) => {
        if (!stage) return 'N/A';
        return stage.status === 'completed' || stage.progress === 100 ? '✓' : stage.status;
      };

      return [
        p.name,
        p.projectManager?.name || 'Unassigned',
        'CDL Admin', // Placeholder as per requirement ambiguity
        p.status,
        `${p.overallProgress}%`,
        getStageStatus(preProd),
        getStageStatus(prod),
        getStageStatus(postProd),
        p.deadline ? new Date(p.deadline).toLocaleDateString() : 'N/A'
      ].map(field => `"${field}"`).join(',');
    });

    const csvContent = [headers.join(','), ...csvData].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'project_report.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

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
    return `px-3 py-1 rounded-[0.5rem] text-xs font-medium ${classes[status as keyof typeof classes] || classes.setup}`;
  }

  formatStatus(status: string): string {
    if (!status) return '';
    const formatted = status.replace(/_/g, ' ');
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
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

  openProjectCreationModal(platform: string) {
    this.selectedPlatformForCreation = platform as ProjectPlatform;
    this.showProjectCreationModal = true;
  }

  closeProjectCreationModal() {
    this.showProjectCreationModal = false;
  }

  onProjectCreated(projectData: any) {
    this.projectService.createProject(projectData).subscribe({
      next: (newProject) => {
        console.log('Project created successfully:', newProject);
        this.projects.unshift(newProject);
        this.filterProjects();
        this.showProjectCreationModal = false;
      },
      error: (error) => {
        console.error('Error creating project:', error);
      }
    });
  }

  onProjectUpdated(project: Project) {
    this.loadProjects();
  }

  onProjectDeleted(projectId: string) {
    this.selectedProject = null;
    this.loadProjects();
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

  openUserCreationModal() {
    this.isEditingUser = false;
    this.newUser = { name: '', email: '', password: '', role: 'user' };
    this.showUserCreationModal = true;
  }

  openEditUserModal(user: any) {
    this.isEditingUser = true;
    this.newUser = { ...user, password: '' };
    this.showUserCreationModal = true;
  }

  closeUserCreationModal() {
    this.showUserCreationModal = false;
    this.newUser = { name: '', email: '', password: '', role: 'user' };
  }

  saveUser() {
    if (!this.newUser.name || !this.newUser.email) return;

    if (this.isEditingUser) {
      console.log('Update user:', this.newUser);
      this.loadAvailableManagers();
      this.closeUserCreationModal();
    } else {
      console.log('Create user:', this.newUser);
      this.loadAvailableManagers();
      this.closeUserCreationModal();
    }
  }

  deleteUser(userId: string) {
    if (confirm('Are you sure you want to delete this user?')) {
      console.log('Delete user:', userId);
      this.loadAvailableManagers();
    }
  }
}