// src/modules/projects/entities/project.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ProjectStage } from './project-stage.entity';
import { Comment } from '../../comments/entities/comment.entity';

// Enums to match your CHECK constraints
export enum ProjectPlatform {
  FLAME = 'flame',
  SWAYAM = 'swayam',
}

export enum ProjectStatus {
  SETUP = 'setup',
  IN_PROGRESS = 'in_progress',
  AT_RISK = 'at_risk',
  LAGGING = 'lagging',
  COMPLETED = 'completed',
  ARCHIVED = 'archived'
}

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: ProjectPlatform,
  })
  platform: ProjectPlatform;

  @Column({ type: 'text', nullable: true }) // scenario can be null
  scenario: string;

  @Column({
    type: 'enum',
    enum: ProjectStatus,
    default: ProjectStatus.SETUP,
  })
  status: ProjectStatus;

  @Column({
    name: 'overall_progress',
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0,
  })
  overallProgress: number;

  // --- This is the relationship to the User entity ---
  @ManyToOne(() => User, (user) => user.managedProjects, {
    nullable: true, // Corresponds to ON DELETE SET NULL
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'project_manager_id' }) // This links the foreign key
  projectManager: User;

  // --- This defines the other side of the relationship ---
  @OneToMany(() => ProjectStage, (stage) => stage.project, { cascade: true })
  stages: ProjectStage[];

  @OneToMany(() => Comment, (comment) => comment.project, { cascade: true })
  comments: Comment[];

  @Column({ type: 'date', nullable: true })
  deadline: Date;

  @Column({ name: 'archived', type: 'boolean', default: false })
  archived: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}