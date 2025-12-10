import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../shared/services/user.service';
import { ProjectService } from '../../shared/services/project.service';
import { User } from '../../shared/models/user.model';
import { Project } from '../../shared/models/project.model';
import { Location } from '@angular/common';

@Component({
    selector: 'app-user-profile',
    templateUrl: './user-profile.component.html',
    styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
    user: User | null = null;
    assignedProjects: Project[] = [];
    loading = true;

    constructor(
        private route: ActivatedRoute,
        private userService: UserService,
        private projectService: ProjectService,
        private router: Router,
        private location: Location
    ) { }

    ngOnInit() {
        this.route.params.subscribe(params => {
            const userId = params['id'];
            if (userId) {
                this.loadUser(userId);
            }
        });
    }

    loadUser(userId: string) {
        this.loading = true;
        this.userService.getUserById(userId).subscribe({
            next: (user) => {
                this.user = user;
                this.loadAssignedProjects(userId);
            },
            error: (error) => {
                console.error('Error loading user', error);
                this.loading = false;
            }
        });
    }

    loadAssignedProjects(userId: string) {
        this.projectService.getAssignedProjects(userId).subscribe({
            next: (projects) => {
                this.assignedProjects = projects;
                this.loading = false;
            },
            error: (error) => {
                console.error('Error loading projects', error);
                this.loading = false;
            }
        });
    }

    goBack() {
        this.location.back();
    }

    navigateToProject(projectId: string) {
        this.router.navigate(['/projects', projectId]);
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
}
