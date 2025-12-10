import { IsEnum, IsString, IsOptional, IsUUID, IsDateString } from 'class-validator';
import { ProjectPlatform } from '../../entities/project.entity';
import { Type } from 'class-transformer';

export class CreateProjectDto {
  @IsString()
  name: string;

  @IsEnum(ProjectPlatform)
  platform: ProjectPlatform;

  @IsString()
  @IsOptional()
  scenario?: string;

  @IsUUID()
  @IsOptional()
  projectManagerId?: string | null;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsDateString()
  deadline: string;
}