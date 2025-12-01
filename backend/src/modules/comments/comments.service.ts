import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class CommentsService {
    constructor(
        @InjectRepository(Comment)
        private commentsRepository: Repository<Comment>,
    ) { }

    async create(createCommentDto: CreateCommentDto, user: User) {
        console.log('CommentsService.create called with:', { createCommentDto, userId: user?.id });
        try {
            const comment = this.commentsRepository.create({
                content: createCommentDto.content,
                user,
                project: { id: createCommentDto.projectId } as any
            });
            return await this.commentsRepository.save(comment);
        } catch (error) {
            console.error('Error creating comment:', error);
            throw new Error(`Failed to create comment: ${error.message}`);
        }
    }

    async findByProject(projectId: string) {
        return this.commentsRepository.find({
            where: { project: { id: projectId } },
            order: { createdAt: 'DESC' },
            relations: ['user']
        });
    }
}
