export type GoalPriority = 'low' | 'medium' | 'high' | 'critical';
export type GoalStatus = 'draft' | 'active' | 'in_progress' | 'completed' | 'paused' | 'abandoned';
export type GoalCategory = 'career' | 'education' | 'coding' | 'research' | 'health' | 'finance' | 'personal' | 'system';

export interface SMARTCriteria {
  specific: string;
  measurable: string;
  achievable: string;
  relevant: string;
  timeBound: string;
}

export interface Milestone {
  id: string;
  title: string;
  targetDate: string;
  targetMetric: string;
  currentMetric: string;
  completed: boolean;
  completedAt?: string;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  category: GoalCategory;
  priority: GoalPriority;
  status: GoalStatus;
  smart: SMARTCriteria;
  milestones: Milestone[];
  progressPct: number;
  linkedProjectIds: string[];
  linkedTaskIds: string[];
  targetDate: string;
  createdAt: string;
  updatedAt: string;
}

export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';
export type TaskStatus = 'pending' | 'in_progress' | 'blocked' | 'completed' | 'deferred';
export type EisenhowerQuadrant = 'do_first' | 'schedule' | 'delegate' | 'eliminate';

export interface PlanningTask {
  id: string;
  goalId?: string;
  projectId?: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  isUrgent: boolean;
  isImportant: boolean;
  quadrant: EisenhowerQuadrant;
  estimatedMinutes: number;
  actualMinutes: number;
  assignedTo: string;
  dependencies: string[];
  dueDate?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlanningProject {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'on_hold';
  rootPath?: string;
  goalIds: string[];
  taskIds: string[];
  tags: string[];
  leadAgentId?: string;
  createdAt: string;
  updatedAt: string;
}

export type TimeblockType = 'deep_work' | 'study' | 'coding' | 'review' | 'admin' | 'break';

export interface Timeblock {
  id: string;
  title: string;
  type: TimeblockType;
  startTime: string; // e.g., "09:00"
  endTime: string;   // e.g., "11:00"
  date: string;      // YYYY-MM-DD
  taskId?: string;
  goalId?: string;
  completed: boolean;
}

export interface StudyTopic {
  id: string;
  subject: string;
  topic: string;
  masteryLevel: number; // 0-100
  repetitionIntervalDays: number; // 1, 3, 7, 14, 30
  nextReviewDate: string;
  lastReviewedAt?: string;
  reviewCount: number;
  notes: string;
}

export interface StudyPlan {
  id: string;
  title: string;
  targetExamOrGoal: string;
  topics: StudyTopic[];
  dailyHoursTarget: number;
  totalStudyHours: number;
  overallMasteryPct: number;
  createdAt: string;
  updatedAt: string;
}

export interface IdeaDecomposition {
  idea: string;
  smartGoal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>;
  tasks: Array<Omit<PlanningTask, 'id' | 'createdAt' | 'updatedAt'>>;
  actionSteps: string[];
  estimatedDays: number;
  riskAssessment: string;
}

export interface GoalsAnalytics {
  totalGoals: number;
  activeGoals: number;
  completedGoals: number;
  overallProgressAverage: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  blockedTasks: number;
  eisenhowerDistribution: Record<EisenhowerQuadrant, number>;
  weeklyVelocity: number;
  focusMinutesLogged: number;
}
