export interface ProjectTask {
  id: string;
  title: string;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  assignedAgentId?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  dueDate?: string;
}

export interface ProjectGoal {
  id: string;
  description: string;
  targetMetric?: string;
  achieved: boolean;
}

export interface ProjectActivity {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  summary: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  rootPath?: string;
  files: string[];
  goals: ProjectGoal[];
  tasks: ProjectTask[];
  knowledgeNodeIds: string[];
  assignedAgentIds: string[];
  activity: ProjectActivity[];
  createdAt: string;
  updatedAt: string;
}

export interface IProjectRepository {
  create(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'activity'>): Promise<Project>;
  findById(id: string): Promise<Project | null>;
  findByName(name: string): Promise<Project | null>;
  list(): Promise<Project[]>;
  update(id: string, updates: Partial<Project>): Promise<Project | null>;
  recordActivity(projectId: string, activity: Omit<ProjectActivity, 'id' | 'timestamp'>): Promise<void>;
}
