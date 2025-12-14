import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Comment } from '../models/comment.model';

import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class CommentService {
    private apiUrl = `${environment.backendUrl}/comments`;

    constructor(private http: HttpClient) { }

    getComments(projectId: string): Observable<Comment[]> {
        return this.http.get<Comment[]>(`${this.apiUrl}/project/${projectId}`);
    }

    createComment(projectId: string, content: string): Observable<Comment> {
        return this.http.post<Comment>(this.apiUrl, { projectId, content });
    }
}
