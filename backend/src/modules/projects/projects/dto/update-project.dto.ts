import { PartialType } from '@nestjs/mapped-types';
import { CreateProjectDto } from './create-project-dto';
import { IsNumber, IsEnum, IsBoolean, IsOptional, Max, Min } from 'class-validator';
import { ProjectStatus } from '../../entities/project.entity';

export class UpdateProjectDto extends PartialType(CreateProjectDto) {
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(100)
    overallProgress?: number;

    @IsOptional()
    @IsEnum(ProjectStatus)
    status?: ProjectStatus;

    @IsOptional()
    @IsBoolean()
    archived?: boolean;
}
