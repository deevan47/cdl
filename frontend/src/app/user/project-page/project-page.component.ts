import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectService } from '../../shared/services/project.service';
import { AuthService } from '../../shared/services/auth.service';
import { Project } from '../../shared/models/project.model';
import { User } from '../../shared/models/user.model';

@Component({
    selector: 'app-project-page',
    templateUrl: './project-page.component.html',
    styleUrls: ['./project-page.component.css']
})
export class ProjectPageComponent implements OnInit {
    project: Project | null = null;
    currentUser: User | null = null;
    availableManagers: User[] = [];
    loading = true;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private projectService: ProjectService,
        private authService: AuthService
    ) {
        const user = this.authService.currentUserValue;
        this.currentUser = user?.user ? user.user : user;
    }

    ngOnInit() {
        const projectId = this.route.snapshot.paramMap.get('id');
        if (projectId) {
            this.loadProject(projectId);
            this.loadManagers();
        }
    }

    loadProject(id: string) {
        this.projectService.getProjectById(id).subscribe({
            next: (p) => {
                this.project = p;
                this.loading = false;
            },
            error: (err) => {
                console.error(err);
                this.loading = false;
            }
        });
    }

    loadManagers() {
        this.projectService.getAvailableManagers().subscribe({
            next: (users) => {
                this.availableManagers = users;
            },
            error: (err) => console.error('Error loading managers:', err)
        });
    }

    showTaskModal = false;
    selectedStageId = '';

    goBack() {
        this.router.navigate(['/dashboard']);
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
        if (this.project) {
            this.loadProject(this.project.id);
        }
    }
}
