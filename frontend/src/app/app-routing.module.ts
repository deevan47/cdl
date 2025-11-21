import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { AdminDashboardComponent } from './admin/admin-dashboard/admin-dashboard.component';
import { UserDashboardComponent } from './user/user-dashboard/user-dashboard.component';
import { AuthGuard } from './shared/guards/auth.guard';
import { RoleGuard } from './shared/guards/role.guard';

const routes: Routes = [
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  { path: 'auth/login', component: LoginComponent },
  { path: 'auth/register', component: RegisterComponent },

  // --- ADMIN PORTAL ---
  // Only 'admin' role can access this
  {
    path: 'admin',
    component: AdminDashboardComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { 
      roles: ['admin'] 
    }
  },

  // --- USER PORTAL ---
  // All other roles access this
  {
    path: 'user',
    component: UserDashboardComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { 
      roles: [
        'project_manager', 
        'research_associate', 
        'animator_Specialist', 
        'editor', 
        'animator', 
        'assistant_administrator'
      ] 
    }
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }