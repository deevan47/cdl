import { Component, Input, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

interface Comment {
    id: string;
    text: string;
    type: 'normal' | 'important' | 'emergency';
    user: { name: string; avatar: string };
    createdAt: string;
}

@Component({
    selector: 'app-comments',
    templateUrl: './comments.component.html',
    styleUrls: ['./comments.component.css']
})
export class CommentsComponent implements OnInit {
    @Input() projectId!: string;
    comments: Comment[] = [];
    newCommentText = '';
    newCommentType: 'on_track' | 'caution' | 'urgent' = 'on_track';
    currentUser: any;

    constructor(private http: HttpClient, private authService: AuthService) {
        this.authService.currentUser.subscribe(user => this.currentUser = user);
    }

    ngOnInit() {
        console.log('CommentsComponent initialized with projectId:', this.projectId);
        this.loadComments();
    }

    loadComments() {
        this.http.get<Comment[]>(`http://localhost:3000/comments/project/${this.projectId}`)
            .subscribe({
                next: (comments) => {
                    console.log('Loaded comments:', comments.length);
                    this.comments = comments;
                },
                error: (err) => console.error('Error loading comments:', err)
            });
    }

    addComment() {
        if (!this.newCommentText.trim()) return;

        if (!this.currentUser) {
            console.error('Cannot add comment: No current user');
            return;
        }

        const payload = {
            text: this.newCommentText,
            type: this.newCommentType,
            projectId: this.projectId,
            userId: this.currentUser.id
        };

        console.log('Sending comment payload:', payload);

        this.http.post<Comment>('http://localhost:3000/comments', payload)
            .subscribe({
                next: (comment) => {
                    console.log('Comment added successfully:', comment);
                    // Ensure the user object is attached for display
                    const commentWithUser = { ...comment, user: this.currentUser };
                    this.comments.unshift(commentWithUser);
                    this.newCommentText = '';
                    this.newCommentType = 'on_track';
                },
                error: (err) => console.error('Error adding comment:', err)
            });
    }

    getTypeClass(type: string): string {
        switch (type) {
            case 'on_track': return 'bg-green-100 border-green-500 text-green-800';
            case 'caution': return 'bg-yellow-100 border-yellow-500 text-yellow-800';
            case 'urgent': return 'bg-red-100 border-red-500 text-red-800';
            default: return 'bg-gray-100 border-gray-500 text-gray-800';
        }
    }
}
