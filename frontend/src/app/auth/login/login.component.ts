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

  constructor(private auth: AuthService, private router: Router) { }

  ngOnInit() {
    this.email = '';
    this.password = '';
  }

  submit() {
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

    this.auth.login(this.email, this.password).subscribe({
      next: (res) => {
        if (res?.accessToken && res?.user) {
          try {
            localStorage.setItem('token', res.accessToken);
            localStorage.setItem('userInfo', JSON.stringify(res.user));
            if (res.assignedProjects) {
              localStorage.setItem('assignedProjects', JSON.stringify(res.assignedProjects));
            } else {
              localStorage.setItem('assignedProjects', JSON.stringify([]));
            }
            this.router.navigate(['/dashboard']);
            this.isLoading = false;
          } catch (e) {
            this.error = 'Failed to save login info.';
            this.isLoading = false;
          }
        } else {
          this.error = 'Login failed: Invalid response from server.';
          this.isLoading = false;
        }
      },
      error: (err) => {
        this.error = err?.error?.message || 'Login failed. Please check your credentials.';
        this.isLoading = false;
      }
    });
  }

  googleLogin() {
    this.error = '';
    this.isLoading = true;

    this.auth.loginWithGoogle().subscribe({
      next: (res) => {
        if (res?.accessToken && res?.user) {
          try {
            localStorage.setItem('token', res.accessToken);
            localStorage.setItem('userInfo', JSON.stringify(res.user));
            if (res.assignedProjects) {
              localStorage.setItem('assignedProjects', JSON.stringify(res.assignedProjects));
            } else {
              localStorage.setItem('assignedProjects', JSON.stringify([]));
            }
            this.router.navigate(['/dashboard']);
            this.isLoading = false;
          } catch (e) {
            this.error = 'Failed to save login info.';
            this.isLoading = false;
          }
        } else {
          this.error = 'Login failed: Invalid response from server.';
          this.isLoading = false;
        }
      },
      error: (err) => {
        if (err?.error?.message === 'Your account is pending approval. An email has been sent to the administrator.' ||
          err?.error?.message === 'Your account is pending approval. Please contact the administrator.') {
          this.error = err.error.message;
        } else {
          this.error = err?.error?.message || 'Google Login failed.';
        }
        this.isLoading = false;
      }
    });
  }
}