import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Notification {
    id: string;
    title: string;
    message: string;
    isRead: boolean;
    type?: string;
    link?: string;
    created_at: Date;
}

import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class NotificationsService {
    private apiUrl = `${environment.backendUrl}/notifications`;

    constructor(private http: HttpClient) { }

    getMyNotifications(): Observable<Notification[]> {
        return this.http.get<Notification[]>(`${this.apiUrl}/my`);
    }

    toggleReadStatus(id: string): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/${id}/toggle`, {});
    }
}
