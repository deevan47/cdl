import { Component, OnInit } from '@angular/core';
import { AuthService } from '../shared/services/auth.service';
import { User } from '../shared/models/user.model';

@Component({
    selector: 'app-dashboard-wrapper',
    template: `
    <app-admin-dashboard *ngIf="isAdmin"></app-admin-dashboard>
    <app-user-dashboard *ngIf="!isAdmin"></app-user-dashboard>
  `
})
export class DashboardWrapperComponent implements OnInit {
    currentUser: User | null = null;

    constructor(private authService: AuthService) { }

    ngOnInit() {
        this.authService.currentUser.subscribe(user => {
            this.currentUser = user ? (user.user || user) : null;
        });
    }

    get isAdmin(): boolean {
        return this.currentUser?.role === 'admin';
    }
}
