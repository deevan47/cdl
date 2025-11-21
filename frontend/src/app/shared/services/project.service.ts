import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Project, ProjectPlatform, ProjectStatus } from '../models/project.model';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private apiUrl = 'http://localhost:3000/projects';

  constructor(private http: HttpClient) { }

  getAllProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(this.apiUrl);
  }

  getProjectsByPlatform(platform: ProjectPlatform): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.apiUrl}/platform/${platform}`);
  }

  getProjectById(id: string): Observable<Project> {
    return this.http.get<Project>(`${this.apiUrl}/${id}`);
  }

  createProject(project: Partial<Project>): Observable<Project> {
    return this.http.post<Project>(this.apiUrl, project);
  }

  updateProject(id: string, project: Partial<Project>): Observable<Project> {
    return this.http.put<Project>(`${this.apiUrl}/${id}`, project);
  }

  deleteProject(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  assignProjectManager(projectId: string, managerId: string): Observable<Project> {
    return this.http.put<Project>(`${this.apiUrl}/${projectId}/assign-manager/${managerId}`, {});
  }

  calculateProjectHealth(projectId: string): Observable<{ progress: number; status: ProjectStatus }> {
    return this.http.get<{ progress: number; status: ProjectStatus }>(`${this.apiUrl}/${projectId}/health`);
  }

  addTaskToStage(stageId: string, taskData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/stages/${stageId}/tasks`, taskData);
  }
  getAvailableManagers(): Observable<User[]> {
    // Now every user can be a manager, so return all users
    return this.http.get<User[]>(`http://localhost:3000/users`);
  }

  getAssignedProjects(userId: string): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.apiUrl}/user/${userId}`);
  }
}