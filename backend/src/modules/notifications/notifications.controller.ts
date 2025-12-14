import { Controller, Get, Post, Param, Body, UseGuards, Request } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

import { JwtAuthGuard } from '../../guards/auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    @Get('my')
    async getMyNotifications(@Request() req) {
        // Assuming AuthGuard attaches user to req.user
        // For now, we might need to pass userId in query or body if AuthGuard isn't fully set up globally
        // But let's assume standard JWT flow
        return this.notificationsService.findAllForUser(req.user.id);
    }

    @Get('user/:userId')
    async getUserNotifications(@Param('userId') userId: string) {
        return this.notificationsService.findAllForUser(userId);
    }

    @Post(':id/toggle')
    async toggleReadStatus(@Param('id') id: string) {
        return this.notificationsService.toggleReadStatus(id);
    }
}
