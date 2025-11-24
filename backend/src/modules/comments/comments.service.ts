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
        const comment = this.commentsRepository.create({
            ...createCommentDto,
            user,
            project: { id: createCommentDto.projectId } as any
        });
        return this.commentsRepository.save(comment);
    }

    async findByProject(projectId: string) {
        return this.commentsRepository.find({
            where: { project: { id: projectId } },
            order: { createdAt: 'DESC' },
            relations: ['user']
        });
    }
}
