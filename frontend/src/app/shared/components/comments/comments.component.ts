import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommentService } from '../../services/comment.service';
import { AuthService } from '../../services/auth.service';
import { Comment } from '../../models/comment.model';
import { User } from '../../models/user.model';

@Component({
    selector: 'app-comments',
    templateUrl: './comments.component.html',
    styleUrls: ['./comments.component.css']
})
export class CommentsComponent implements OnInit, OnChanges {
    @Input() projectId!: string;
    comments: Comment[] = [];
    newCommentText = '';
    currentUser: User | null = null;
    loading = false;

    constructor(
        private commentService: CommentService,
        private authService: AuthService
    ) {
        const user = this.authService.currentUserValue;
        this.currentUser = user?.user ? user.user : user;
    }

    ngOnInit() {
        if (this.projectId) {
            this.loadComments();
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['projectId'] && !changes['projectId'].firstChange) {
            this.loadComments();
        }
    }

    loadComments() {
        if (!this.projectId) return;

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
        if (!this.newCommentText.trim() || !this.projectId) return;

        this.commentService.createComment(this.projectId, this.newCommentText).subscribe({
            next: (comment) => {
                // The backend returns the comment with the user relation populated
                // But just in case, we can ensure the current user is attached for immediate display
                if (!comment.user && this.currentUser) {
                    comment.user = this.currentUser;
                }
                this.comments.unshift(comment);
                this.newCommentText = '';
            },
            error: (err) => {
                console.error('Error adding comment:', err);
                alert('Failed to post comment. Please try again.');
            }
        });
    }
}
