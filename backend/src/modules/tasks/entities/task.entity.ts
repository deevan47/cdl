import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { ProjectStage } from '../../projects/entities/project-stage.entity';
import { User } from '../../users/entities/user.entity';

export enum TaskStatus {
  ON_TRACK = 'on_track',
  AT_RISK = 'at_risk',
  OVERDUE = 'overdue',
  COMPLETED = 'completed',
}

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'start_date', type: 'date' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'date' })
  endDate: Date;

  @Column({ name: 'estimated_hours', nullable: true })
  estimatedHours: number;

  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.ON_TRACK,
  })
  status: TaskStatus;

  @Column({ name: 'is_completed', default: false })
  isCompleted: boolean;

  // Relationship to ProjectStage
  @ManyToOne(() => ProjectStage, (stage) => stage.tasks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'stage_id' })
  stage: ProjectStage;

  @Column({ name: 'stage_id' })
  stageId: string;

  // --- THIS IS THE CRITICAL FIX ---
  // ManyToMany relationship with Users, defining the junction table
  @ManyToMany(() => User, (user) => user.assignedTasks)
  @JoinTable({
    name: 'task_assignments', // Name of the junction table in your database
    joinColumn: {
      name: 'task_id', // Foreign key for the Task entity
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'user_id', // Foreign key for the User entity
      referencedColumnName: 'id',
    },
  })
  assignedTeamMembers: User[];

  @Column({ type: 'jsonb', nullable: true })
  dependencies: any;

  @Column({ name: 'required_assets', type: 'jsonb', nullable: true })
  requiredAssets: any;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
} 