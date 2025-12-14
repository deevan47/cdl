import { Component, OnInit } from '@angular/core';
import { NotificationsService, Notification } from '../../services/notifications.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit {
  notifications: Notification[] = [];
  loading = true;

  constructor(private notificationsService: NotificationsService) { }

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications() {
    this.notificationsService.getMyNotifications().subscribe({
      next: (data) => {
        this.notifications = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading notifications:', err);
        this.loading = false;
      }
    });
  }

  onNotificationClick(notification: Notification) {
    this.notificationsService.toggleReadStatus(notification.id).subscribe({
      next: () => {
        notification.isRead = !notification.isRead;
      },
      error: (err) => console.error('Error toggling read status:', err)
    });
  }
}
