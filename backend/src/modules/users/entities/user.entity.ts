import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Project } from '../../projects/entities/project.entity';
import { ProjectStage } from '../../projects/entities/project-stage.entity';
import { Task } from '../../tasks/entities/task.entity';
import { Comment } from '../../comments/entities/comment.entity';

export enum UserRole {
  ADMIN = 'admin',
  PROJECT_MANAGER = 'project_manager',
  RESEARCH_ASSOCIATE = 'research_associate',
  ANIMATOR_SPECIALIST = 'animator_Specialist',
  EDITOR = 'editor',
  ANIMATOR = 'animator',
  ASSISTANT_ADMINISTRATOR = 'assistant_administrator'
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ type: 'varchar', length: 50 })
  role: UserRole;

  @Column({ nullable: true })
  avatar: string;

  @Column({ type: 'text', nullable: true, select: false })
  password?: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @OneToMany(() => Project, (project) => project.projectManager)
  managedProjects: Project[];

  @ManyToMany(() => ProjectStage, (stage) => stage.assignedTeamMembers)
  assignedStages: ProjectStage[];

  @ManyToMany(() => Task, (task) => task.assignedTeamMembers)
  assignedTasks: Task[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}