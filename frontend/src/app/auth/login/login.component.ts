import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';
  isLoading = false;

  constructor(private auth: AuthService, private router: Router) {
    console.log('[LOGIN_COMPONENT_INIT] LoginComponent initialized');
  }

  ngOnInit() {
    this.email = '';
    this.password = '';
  }

  submit() {
    console.log('[LOGIN_SUBMIT_START]', { email: this.email });

    if (!this.email || !this.email.includes('@')) {
      this.error = 'Please enter a valid email address';
      return;
    }

    if (!this.password || this.password.length < 6) {
      this.error = 'Password must be at least 6 characters';
      return;
    }

    this.error = '';
    this.isLoading = true;

    console.log('[LOGIN_API_CALL] Sending login request', { email: this.email, passwordLength: this.password.length });

    this.auth.login(this.email, this.password).subscribe({
      next: (res) => {
        console.log('[LOGIN_API_SUCCESS] Received response', {
          hasToken: !!res?.accessToken,
          userRole: res?.user?.role,
        });

        if (res?.accessToken && res?.user) {
          try {
            // Save auth token and user info to localStorage
            localStorage.setItem('token', res.accessToken);
            localStorage.setItem('userInfo', JSON.stringify(res.user));
            // Save assigned projects (if provided by backend) so guards and UI can use them
            if (res.assignedProjects) {
              localStorage.setItem('assignedProjects', JSON.stringify(res.assignedProjects));
            } else {
              // ensure key exists for downstream checks
              localStorage.setItem('assignedProjects', JSON.stringify([]));
            }
            console.log('[LOGIN_STORAGE] assignedProjects count:', ((res.assignedProjects && res.assignedProjects.length) || 0));
            console.log('[LOGIN_STORAGE] Token and user info saved to localStorage');

            // --- ROLE-BASED NAVIGATION ---
            // Check the user's role and navigate to the appropriate dashboard
            const userRole = res.user.role;
            // Determine if the user should be treated as a project manager for routing
            const assignedProjects = JSON.parse(localStorage.getItem('assignedProjects') || '[]');
            const isPmOnSomeProject = Array.isArray(assignedProjects) && assignedProjects.some((p: any) => p?.projectManager?.id === res.user.id);

            if (userRole === 'admin') {
              console.log(`[LOGIN_NAVIGATE] Role is '${userRole}'. Navigating to admin dashboard.`);
              this.router.navigate(['/admin']);
            } else if (userRole === 'project_manager' || isPmOnSomeProject) {
              console.log(`[LOGIN_NAVIGATE] User is project manager (role or assigned). Navigating to PM/projects view.`);
              this.router.navigate(['/user']);
            } else {
              console.log(`[LOGIN_NAVIGATE] Role is '${userRole}'. Navigating to user dashboard.`);
              this.router.navigate(['/user']);
            }

            this.isLoading = false;

          } catch (e) {
            console.error('[LOGIN_STORAGE_ERROR] Failed to save login info to localStorage', e);
            this.error = 'Failed to save login info. Check browser console.';
            this.isLoading = false;
          }
        } else {
          this.error = 'Login failed: Invalid response from server.';
          console.error('[LOGIN_ERROR] Response missing accessToken or user object', res);
          this.isLoading = false;
        }
      },
      error: (err) => {
        console.error('[LOGIN_API_ERROR] Login API error', err);
        this.error = err?.error?.message || 'Login failed. Please check your credentials.';
        this.isLoading = false;
      }
    });
  }
}