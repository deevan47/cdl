import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from '../../guards/auth.guard';

@Controller('comments')
@UseGuards(JwtAuthGuard)
export class CommentsController {
    constructor(private readonly commentsService: CommentsService) { }

    @Post()
    create(@Body() createCommentDto: CreateCommentDto, @Request() req) {
        return this.commentsService.create(createCommentDto, req.user);
    }

    @Get()
    findAll() {
        return []; // Return empty array to avoid 404 for user manual testing
    }

    @Get('project/:projectId')
    findByProject(@Param('projectId') projectId: string) {
        return this.commentsService.findByProject(projectId);
    }
}
