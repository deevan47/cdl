import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, ManyToMany, JoinTable, JoinColumn } from 'typeorm'; // Added JoinColumn import
import { Project } from './project.entity';
import { Task } from '../../tasks/entities/task.entity';
import { User } from '../../users/entities/user.entity';

export enum StageName {
  PRE_PRODUCTION = 'Pre-Production',
  PRODUCTION = 'Production',
  POST_PRODUCTION = 'Post-Production'
}

export enum StageStatus {
  ON_TRACK = 'on_track',
  AT_RISK = 'at_risk',
  OVERDUE = 'overdue',
  COMPLETED = 'completed'
}

@Entity('project_stages')
export class ProjectStage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: StageName })
  name: StageName;

  @Column({ type: 'enum', enum: StageStatus, default: StageStatus.ON_TRACK })
  status: StageStatus;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  progress: number;

  @Column({ name: 'is_open', default: true })
  isOpen: boolean;

  @ManyToOne(() => Project, project => project.stages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' }) // Added: explicit join column
  project: Project;

  @OneToMany(() => Task, task => task.stage, { cascade: true, eager: true })
  tasks: Task[];

  @ManyToMany(() => User, user => user.assignedStages, { eager: true })
  @JoinTable()
  assignedTeamMembers: User[];

  constructor(partial: Partial<ProjectStage>) {
    Object.assign(this, partial);
  }
}