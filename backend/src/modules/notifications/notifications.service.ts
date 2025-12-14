import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import * as nodemailer from 'nodemailer';

@Injectable()
export class NotificationsService {
    private readonly logger = new Logger(NotificationsService.name);
    private transporter: nodemailer.Transporter;

    constructor(
        @InjectRepository(Notification)
        private readonly notificationsRepository: Repository<Notification>,
    ) {
        if (process.env.SMTP_HOST) {
            this.transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: Number(process.env.SMTP_PORT) || 587,
                secure: false,
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                },
            });
        } else {
            this.logger.warn('SMTP settings not found. Emails will be logged to console only.');
        }
    }

    async create(userId: string, title: string, message: string, type?: string, link?: string) {
        const notification = this.notificationsRepository.create({
            userId,
            title,
            message,
            type,
            link,
        });
        return this.notificationsRepository.save(notification);
    }

    async findAllForUser(userId: string) {
        return this.notificationsRepository.find({
            where: { userId },
            order: { created_at: 'DESC' },
        });
    }

    async toggleReadStatus(id: string) {
        const notification = await this.notificationsRepository.findOne({ where: { id } });
        if (notification) {
            notification.isRead = !notification.isRead;
            return this.notificationsRepository.save(notification);
        }
    }

    async sendEmail(to: string, subject: string, text: string) {
        if (this.transporter) {
            try {
                await this.transporter.sendMail({
                    from: '"CDL Project Manager" <noreply@cdl.com>',
                    to,
                    subject,
                    text,
                });
            } catch (error) {
                this.logger.error(`Failed to send email to ${to}`, error);
            }
        }
    }
}

