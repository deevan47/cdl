import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    console.log('[AUTH_GUARD] Checking for authentication token...');
    
    // Correctly check for the 'token' key in localStorage
    const token = localStorage.getItem('token');
    
    if (token) {
      console.log('[AUTH_GUARD] Token found. Access granted.');
      return true; // User is logged in, allow access
    }
    
    // No token found, block access and redirect to login
    console.warn('[AUTH_GUARD] No token found. Access denied. Redirecting to login.');
    this.router.navigate(['/auth/login']);
    return false;
  }
}