import { User } from './user.model';

export enum ProjectPlatform {
  FLAME = 'flame',
  SWAYAM = 'swayam'
}

export enum ProjectStatus {
  SETUP = 'setup',
  IN_PROGRESS = 'in_progress',
  AT_RISK = 'at_risk',
  LAGGING = 'lagging',
  COMPLETED = 'completed'
}

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

export enum TaskStatus {
  ON_TRACK = 'on_track',
  AT_RISK = 'at_risk',
  OVERDUE = 'overdue',
  COMPLETED = 'completed'
}

export interface Task {
  id: string;
  name: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  estimatedHours?: number;
  status: TaskStatus;
  isCompleted: boolean;
  assignedTeamMembers: User[];
  dependencies?: string[];
  requiredAssets?: string[];
  stageId: string;
}

export interface ProjectStage {
  id: string;
  name: StageName;
  status: StageStatus;
  progress: number;
  isOpen: boolean;
  tasks: Task[];
  assignedTeamMembers: User[];
  projectId: string;
}

export interface Project {
  id: string;
  name: string;
  platform: ProjectPlatform;
  scenario: string;
  status: ProjectStatus;
  overallProgress: number;
  projectManager: User;
  projectManagerId: string;
  stages: ProjectStage[];
  deadline: Date;
  createdAt: Date;
  updatedAt: Date;
}