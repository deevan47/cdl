import { Component, Input, OnInit } from '@angular/core';
import { CommentService } from '../../services/comment.service';
import { AuthService } from '../../services/auth.service';
import { Comment } from '../../models/comment.model';
import { User } from '../../models/user.model';

@Component({
    selector: 'app-comments',
    templateUrl: './comments.component.html',
    styleUrls: ['./comments.component.css']
})
export class CommentsComponent implements OnInit {
    @Input() projectId: string = '';
    comments: Comment[] = [];
    newCommentContent = '';
    currentUser: User | null = null;
    loading = false;

    constructor(
        private commentService: CommentService,
        private authService: AuthService
    ) { }

    ngOnInit() {
        this.authService.currentUser.subscribe(user => {
            this.currentUser = user ? (user.user || user) : null;
        });
        if (this.projectId) {
            this.loadComments();
        }
    }

    loadComments() {
        this.loading = true;
        this.commentService.getComments(this.projectId).subscribe({
            next: (comments) => {
                this.comments = comments;
                this.loading = false;
            },
            error: (err) => {
                console.error('Error loading comments:', err);
                this.loading = false;
            }
        });
    }

    addComment() {
        if (!this.newCommentContent.trim()) return;

        this.commentService.createComment(this.projectId, this.newCommentContent).subscribe({
            next: (comment) => {
                this.comments.unshift(comment); // Add to top
                this.newCommentContent = '';
            },
            error: (err) => console.error('Error adding comment:', err)
        });
    }
}
