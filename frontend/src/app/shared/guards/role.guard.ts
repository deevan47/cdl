import { Injectable } from '@angular/core';
import { 
  CanActivate, 
  ActivatedRouteSnapshot, 
  RouterStateSnapshot, 
  Router 
} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    // 1. Retrieve the expected roles from the route data
    const expectedRoles = route.data['roles'] as Array<string>;

    if (!expectedRoles || expectedRoles.length === 0) {
      console.error('[ROLE_GUARD] Route defined without "data.roles". Access denied to prevent security leaks.');
      return false;
    }

    // 2. Retrieve current user from LocalStorage
    const userInfo = localStorage.getItem('userInfo');
    if (!userInfo) {
      console.warn('[ROLE_GUARD] No user info found. Redirecting to login.');
      this.router.navigate(['/auth/login']);
      return false;
    }

    const user = JSON.parse(userInfo);
    const userRole = user.role;

    // 3. Check if the user's role is in the allowed list
    if (expectedRoles.includes(userRole)) {
      return true; 
    } else {
      console.warn(`[ROLE_GUARD] Access Denied. User Role: '${userRole}'. Allowed: ${JSON.stringify(expectedRoles)}`);
      
      // Redirect based on actual role to prevent infinite loops
      if (userRole === 'admin') {
        this.router.navigate(['/admin']);
      } else {
        this.router.navigate(['/user']);
      }
      return false;
    }
  }
}