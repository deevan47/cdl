import { ProjectPlatform } from '../../entities/project.entity';
export declare class CreateProjectDto {
    name: string;
    platform: ProjectPlatform;
    scenario?: string;
    projectManagerId?: string | null;
    deadline: string;
}
