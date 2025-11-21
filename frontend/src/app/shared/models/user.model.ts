export enum UserRole {
  ADMIN = 'admin',
  PROJECT_MANAGER = 'project_manager',
  LEAD_DESIGNER = 'lead_designer',
  RESEARCH_ASSOCIATE = 'research_associate',
  LEAD_DEVELOPER = 'lead_developer',
  QA_ENGINEER = 'qa_engineer',
  CONTENT_STRATEGIST = 'content_strategist',
  JR_DEVELOPER = 'jr_developer',
  EDITOR = 'editor',
  ANIMATOR = 'animator'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  isActive: boolean;
  createdAt: Date;
  lastLogin?: Date;
}