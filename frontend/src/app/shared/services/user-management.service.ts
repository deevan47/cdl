import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, UserRole, CreateUserDto, UpdateUserDto } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserManagementService {
  private apiUrl = 'http://localhost:3000/users';

  constructor(private http: HttpClient) { }

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  createUser(userData: CreateUserDto): Observable<User> {
    return this.http.post<User>(this.apiUrl, userData);
  }

  updateUser(id: string, userData: UpdateUserDto): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, userData);
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getUsersByRole(role: UserRole): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/role/${role}`);
  }

  deactivateUser(id: string): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}/deactivate`, {});
  }

  activateUser(id: string): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}/activate`, {});
  }

  // Get role display names
  getRoleDisplayName(role: UserRole): string {
    const roleNames = {
      [UserRole.ADMIN]: 'Administrator',
      [UserRole.PROJECT_MANAGER]: 'Project Manager',
      [UserRole.LEAD_DESIGNER]: 'Lead Designer',
      [UserRole.RESEARCH_ASSOCIATE]: 'Research Associate',
      [UserRole.LEAD_DEVELOPER]: 'Lead Developer',
      [UserRole.QA_ENGINEER]: 'QA Engineer',
      [UserRole.CONTENT_STRATEGIST]: 'Content Strategist',
      [UserRole.JR_DEVELOPER]: 'Junior Developer',
      [UserRole.EDITOR]: 'Editor',
      [UserRole.ANIMATOR]: 'Animator'
    };
    return roleNames[role] || role;
  }

  // Get all available roles
  getAllRoles(): UserRole[] {
    return Object.values(UserRole);
  }
}
