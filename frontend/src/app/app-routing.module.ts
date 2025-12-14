import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { DashboardWrapperComponent } from './dashboard-wrapper/dashboard-wrapper.component';
import { ProjectPageComponent } from './user/project-page/project-page.component';
import { UserProfileComponent } from './user/user-profile/user-profile.component';
import { AuthGuard } from './shared/guards/auth.guard';
import { RoleGuard } from './shared/guards/role.guard';
import { NotificationsComponent } from './shared/components/notifications/notifications.component';

const routes: Routes = [
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  { path: 'auth/login', component: LoginComponent },
  { path: 'auth/register', component: RegisterComponent },

  // Unified Dashboard Route
  {
    path: 'dashboard/:section',
    component: DashboardWrapperComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'dashboard',
    component: DashboardWrapperComponent,
    canActivate: [AuthGuard]
  },

  // Legacy Redirects (Optional, but good for safety)
  { path: 'admin', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'user', redirectTo: 'dashboard', pathMatch: 'full' },

  {
    path: 'projects/:id',
    component: ProjectPageComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'profile/:id',
    component: UserProfileComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'notifications',
    component: NotificationsComponent,
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }