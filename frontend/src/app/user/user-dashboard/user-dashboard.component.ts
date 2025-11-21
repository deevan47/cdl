import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

// Interfaces to match your prototype data structure
interface Task {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isCompleted: boolean;
}

interface Stage {
  id: string;
  name: string;
  isOpen: boolean;
  assignedTeamMemberIds: string[];
  tasks: Task[];
  // Computed properties
  progress?: number;
  status?: { label: string; color: string };
}

interface Project {
  id: string;
  name: string;
  platform: 'flame' | 'swayam';
  scenario: string;
  projectManagerId: string;
  updates: any[];
  stages: Stage[];
  // Computed properties
  overallProgress?: number;
  overallStatus?: { label: string; color: string };
}

interface User {
  id: string;
  name: string;
  role: string;
  avatar: string;
}

@Component({
  selector: 'app-user-dashboard',
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.css']
})
export class UserDashboardComponent implements OnInit {
  // State variables
  isDarkMode = false;
  isSidebarCollapsed = false;
  currentView: 'home' | 'flame' | 'swayam' | 'profile' | 'settings' | 'notifications' | 'messages' = 'home';
  
  // Data
  currentUser: User | null = null;
  projects: Project[] = [];
  userProjects: Project[] = []; // Filtered projects relevant to user
  selectedProject: Project | null = null;

  // Mock Constants
  readonly TEAM_MEMBERS: User[] = [
    { id: 'u1', name: 'Varsha Kumar', role: 'Lead Designer', avatar: 'https://i.pravatar.cc/150?u=varsha' },
    { id: 'u2', name: 'Praharshini Kumar', role: 'Project Manager', avatar: 'https://i.pravatar.cc/150?u=praharshini' },
    { id: 'u3', name: 'Siddhant Salve', role: 'Lead Developer', avatar: 'https://i.pravatar.cc/150?u=siddhant' },
    { id: 'u4', name: 'Dipraj More', role: 'QA Engineer', avatar: 'https://i.pravatar.cc/150?u=dipraj' },
    { id: 'u5', name: 'Shweta Kumari', role: 'Content Strategist', avatar: 'https://i.pravatar.cc/150?u=shweta' },
    { id: 'u6', name: 'Aryan Sharma', role: 'Jr. Developer', avatar: 'https://i.pravatar.cc/150?u=aryan' },
  ];

  readonly CURRENT_USER_ID = 'u3'; // Simulating Siddhant Salve logged in
  readonly TODAY = new Date('2025-10-06T00:00:00');

  // Icons from your prototype
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
    chevronDown: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 text-gray-500"><polyline points="6 9 12 15 18 9"></polyline></svg>`
  };

  constructor(private sanitizer: DomSanitizer) { }

  ngOnInit() {
    // 1. Simulate Login
    this.currentUser = this.TEAM_MEMBERS.find(u => u.id === this.CURRENT_USER_ID) || null;
    
    // 2. Load Mock Data (Same as your prototype)
    this.projects = [
        {id:'p1',name:'Project Phoenix',platform:'flame',scenario:'3D From Scratch',projectManagerId:'u2',updates:[{id:'up1',authorId:'u2',timestamp:'2025-10-01T10:00:00Z',message:'Initial kickoff complete. All systems go.',urgency:'green'},{id:'up2',authorId:'u3',timestamp:'2025-10-04T14:30:00Z',message:'Development environment for render farm is set up.',urgency:'green'},],stages:[{id:'s1-1',name:'Pre-Production',isOpen:true, assignedTeamMemberIds:['u1','u5'],tasks:[{id:'t1-1-1',name:'Research & Moodboarding',startDate:'2025-09-15',endDate:'2025-09-25',isCompleted:true},{id:'t1-1-2',name:'Concept Art',startDate:'2025-09-26',endDate:'2025-10-05',isCompleted:true},{id:'t1-1-3',name:'Finalize Scripts',startDate:'2025-10-06',endDate:'2025-10-15',isCompleted:false},]},{id:'s1-2',name:'Production',isOpen:true, assignedTeamMemberIds:['u3'],tasks:[{id:'t1-2-1',name:'3D Modeling',startDate:'2025-10-16',endDate:'2025-10-30',isCompleted:false},{id:'t1-2-2',name:'Texturing & Shading',startDate:'2025-11-01',endDate:'2025-11-10',isCompleted:false},]},{id:'s1-3',name:'Post-Production',isOpen:true, assignedTeamMemberIds:['u4'],tasks:[{id:'t1-3-1',name:'Rendering',startDate:'2025-11-11',endDate:'2025-11-20',isCompleted:false},{id:'t1-3-2',name:'Compositing & VFX',startDate:'2025-11-21',endDate:'2025-11-30',isCompleted:false},{id:'t1-3-3',name:'Final Review',startDate:'2025-12-01',endDate:'2025-12-05',isCompleted:false},]},]},
        {id:'p2',name:'Crimson Cascade',platform:'flame',scenario:'Animated Short',projectManagerId:'u2',updates:[],stages:[{id:'s2-1',name:'Pre-Production',isOpen:true, assignedTeamMemberIds:['u5'],tasks:[{id:'t2-1-1',name:'Storyboarding',startDate:'2025-09-01',endDate:'2025-09-10',isCompleted:true},{id:'t2-1-2',name:'Animatic',startDate:'2025-09-11',endDate:'2025-09-20',isCompleted:true},]},{id:'s2-2',name:'Production',isOpen:true, assignedTeamMemberIds:['u1','u3'],tasks:[{id:'t2-2-1',name:'Character Animation',startDate:'2025-09-21',endDate:'2025-10-04',isCompleted:true},]},{id:'s2-3',name:'Post-Production',isOpen:true, assignedTeamMemberIds:[],tasks:[{id:'t2-3-1',name:'Sound Design',startDate:'2025-10-15',endDate:'2025-10-25',isCompleted:false},]},]},
        {id:'p3',name:'Quantum Computing Fundamentals',platform:'swayam',scenario:'Expert Led Course',projectManagerId:'u2',updates:[{id:'up3',authorId:'u4',timestamp:'2025-10-02T18:00:00Z',message:'Initial module review passed QA.',urgency:'green'},],stages:[{id:'s3-1',name:'Production',isOpen:true, assignedTeamMemberIds:['u3','u5'],tasks:[{id:'t3-1-1',name:'Module 1: Filming',startDate:'2025-09-20',endDate:'2025-09-30',isCompleted:true},{id:'t3-1-2',name:'Module 2: Filming',startDate:'2025-10-01',endDate:'2025-10-10',isCompleted:false},]},{id:'s3-2',name:'Post-Production',isOpen:true, assignedTeamMemberIds:['u4'],tasks:[{id:'t3-2-1',name:'Module 1: Editing & Graphics',startDate:'2025-10-01',endDate:'2025-10-15',isCompleted:false},{id:'t3-2-2',name:'Module 2: Editing & Graphics',startDate:'2025-10-16',endDate:'2025-10-30',isCompleted:false},{id:'t3-2-3',name:'Final QA Pass',startDate:'2025-11-01',endDate:'2025-11-05',isCompleted:false},]},]},
        {id:'p4',name:'Advanced AI Architectures',platform:'swayam',scenario:'University Collaboration',projectManagerId:'u2',updates:[],stages:[{id:'s4-1',name:'Production',isOpen:true, assignedTeamMemberIds:['u3'],tasks:[{id:'t4-1-1',name:'Curriculum Finalization',startDate:'2025-08-01',endDate:'2025-08-15',isCompleted:true},{id:'t4-1-2',name:'Guest Speaker Filming',startDate:'2025-08-16',endDate:'2025-08-30',isCompleted:true},]},{id:'s4-2',name:'Post-Production',isOpen:true, assignedTeamMemberIds:[],tasks:[{id:'t4-2-1',name:'Transcription & Subtitles',startDate:'2025-09-01',endDate:'2025-09-15',isCompleted:true},{id:'t4-2-2',name:'Platform Integration',startDate:'2025-09-16',endDate:'2025-09-25',isCompleted:true},]},]},
        {id:'p5',name:'Mobile App UX/UI Design',platform:'swayam',scenario:'Beginner Workshop',projectManagerId:'u2',updates:[],stages:[{id:'s5-1',name:'Production',isOpen:true, assignedTeamMemberIds:['u1'],tasks:[{id:'t5-1-1',name:'Design Asset Creation',startDate:'2025-11-01',endDate:'2025-11-20',isCompleted:false},{id:'t5-1-2',name:'Interactive Prototype Build',startDate:'2025-11-21',endDate:'2025-12-10',isCompleted:false},]},{id:'s5-2',name:'Post-Production',isOpen:true, assignedTeamMemberIds:['u6'],tasks:[{id:'t5-2-1',name:'User Testing Sessions',startDate:'2025-12-11',endDate:'2025-12-20',isCompleted:false},]},]}
    ];

    // 3. Calculate Health (This runs your Prototype logic)
    this.calculateAllProjectsHealth();
    
    // 4. Filter for current user (Simulating backend filter)
    this.userProjects = this.projects.filter(p => p.stages.some(s => s.assignedTeamMemberIds.includes(this.CURRENT_USER_ID)));
    
    console.log('Initialized Dashboard with', this.userProjects.length, 'projects');
  }

  // --- LOGIC FROM PROTOTYPE TRANSFERRED TO ANGULAR ---

  getIcon(name: string): SafeHtml {
    // This bypasses the security warning so your icons show up
    return this.sanitizer.bypassSecurityTrustHtml(this.ICONS_SVG[name] || '');
  }

  navigateTo(page: any, projectId: string | null = null) {
    this.currentView = page;
    if (projectId) {
        this.selectedProject = this.projects.find(p => p.id === projectId) || null;
    } else {
        // If navigating to a platform page, auto-select the first project if none selected
        if (page === 'flame' || page === 'swayam') {
            const platformProjects = this.userProjects.filter(p => p.platform === page);
            if (platformProjects.length > 0 && (!this.selectedProject || this.selectedProject.platform !== page)) {
                this.selectedProject = platformProjects[0];
            }
        } else {
            this.selectedProject = null;
        }
    }
  }

  selectProject(project: Project) {
    this.selectedProject = project;
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    if (this.isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  toggleTask(task: Task) {
    task.isCompleted = !task.isCompleted;
    this.calculateAllProjectsHealth(); // Recalculate bars
  }

  toggleStageSection(stage: Stage) {
    stage.isOpen = !stage.isOpen;
  }

  getFilteredProjects(platform: string): Project[] {
    return this.userProjects.filter(p => p.platform === platform);
  }

  getStats() {
    return {
        total: this.userProjects.length,
        completed: this.userProjects.filter(p => p.overallStatus?.label === 'Completed').length,
        inProgress: this.userProjects.filter(p => ['In Progress', 'At-Risk'].includes(p.overallStatus?.label || '')).length,
        lagging: this.userProjects.filter(p => p.overallStatus?.label === 'Lagging').length
    };
  }

  // --- HELPERS FOR DATA CALCULATION ---
  
  getTaskStatus(task: Task) {
    const endDate = new Date(task.endDate + 'T23:59:59');
    if (task.isCompleted) return { label: 'Completed', color: 'green' };
    if (endDate < this.TODAY) return { label: 'Overdue', color: 'red' };
    const sevenDaysFromNow = new Date(this.TODAY);
    sevenDaysFromNow.setDate(this.TODAY.getDate() + 7);
    if (endDate <= sevenDaysFromNow) return { label: 'At-Risk', color: 'yellow' };
    return { label: 'On Track', color: 'green' };
  }

  calculateAllProjectsHealth() {
    const stageOrder = ['Pre-Production', 'Production', 'Post-Production'];
    
    this.projects.forEach(p => {
        let hasLaggingStage = false;
        let projectCompleted = true;

        p.stages.sort((a, b) => stageOrder.indexOf(a.name) - stageOrder.indexOf(b.name));

        p.stages.forEach(stage => {
            // Calculate Stage Health
            let completedTasks = stage.tasks.filter(t => t.isCompleted).length;
            let totalTasks = stage.tasks.length;
            let progress = totalTasks === 0 ? 100 : (completedTasks / totalTasks) * 100;
            
            let incompleteTasks = stage.tasks.filter(t => !t.isCompleted);
            let isOverdue = false;
            let isAtRisk = false;

            if (progress < 100) {
                projectCompleted = false;
                incompleteTasks.forEach(task => {
                    const status = this.getTaskStatus(task);
                    if (status.label === 'Overdue') isOverdue = true;
                    if (status.label === 'At-Risk') isAtRisk = true;
                });
            }

            let status = { label: 'On Track', color: 'green' };
            if (isOverdue) status = { label: 'Overdue', color: 'red' };
            else if (isAtRisk) status = { label: 'At-Risk', color: 'yellow' };
            else if (progress === 100) status = { label: 'Completed', color: 'green' };

            if (hasLaggingStage && progress < 100) status = { label: 'Lagging', color: 'red' };
            else if (status.label === 'Overdue') hasLaggingStage = true;

            // Assign to stage
            stage.progress = progress;
            stage.status = status;
        });

        // Calculate Overall Project
        const totalStageProgress = p.stages.reduce((acc, s) => acc + (s.progress || 0), 0);
        p.overallProgress = p.stages.length ? totalStageProgress / p.stages.length : 0;
        
        let overallStatus = { label: 'In Progress', color: 'blue' };
        if (projectCompleted) overallStatus = { label: 'Completed', color: 'green' };
        else if (hasLaggingStage || p.stages.some(s => s.status?.label === 'Overdue')) overallStatus = { label: 'Lagging', color: 'red' };
        else if (p.stages.some(s => s.status?.label === 'At-Risk')) overallStatus = { label: 'At-Risk', color: 'yellow' };

        p.overallStatus = overallStatus;
    });
  }

  // --- UI CLASS HELPERS ---
  
  getStatusBadgeClass(color: string | undefined): string {
    const classes: {[key: string]: string} = { 
        green: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300', 
        yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300', 
        red: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300', 
        blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' 
    };
    return `px-2.5 py-0.5 text-xs font-medium rounded-full ${classes[color || 'blue']}`;
  }

  getProgressBarColorClass(color: string | undefined): string {
    const classes: {[key: string]: string} = { 
        green: 'bg-green-500', 
        yellow: 'bg-yellow-500', 
        red: 'bg-red-500', 
        blue: 'bg-blue-500' 
    };
    return classes[color || 'blue'];
  }
  
  getUserAvatar(userId: string): string {
      const u = this.TEAM_MEMBERS.find(x => x.id === userId);
      return u ? u.avatar : '';
  }
  
  getUserName(userId: string): string {
    const u = this.TEAM_MEMBERS.find(x => x.id === userId);
    return u ? u.name : '';
  }
  
  getProjectManager(project: Project): User | undefined {
      return this.TEAM_MEMBERS.find(u => u.id === project.projectManagerId);
  }
}