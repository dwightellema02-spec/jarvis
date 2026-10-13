export type NotificationSeverity = 'info' | 'low' | 'medium' | 'high' | 'critical';

export type NotificationType =
  | 'deadline_alert'
  | 'task_suggestion'
  | 'project_stalled'
  | 'study_due'
  | 'system_health'
  | 'morning_briefing'
  | 'evening_summary';

export type NotificationStatus = 'unread' | 'read' | 'dismissed' | 'snoozed' | 'acted_upon';

export interface ProactiveNotification {
  id: string;
  type: NotificationType;
  severity: NotificationSeverity;
  title: string;
  message: string;
  context: {
    projectId?: string;
    goalId?: string;
    taskId?: string;
    topicId?: string;
    deadlineDate?: string;
    actionPayload?: Record<string, unknown>;
  };
  suggestedAction?: {
    label: string;
    action: string;
    params?: Record<string, unknown>;
  };
  status: NotificationStatus;
  createdAt: string;
  expiresAt?: string;
  snoozedUntil?: string;
}

export interface MonitoringPreferences {
  enabled: boolean;
  monitoredProjectIds: string[];
  monitoredTaskCategories: string[];
  deadlineThresholdHours: number;
  stalledTaskThresholdHours: number;
  enableSpacedRepetitionAlerts: boolean;
  enableSystemHealthAlerts: boolean;
  enableMorningBriefing: boolean;
  enableEveningSummary: boolean;
  quietHours: {
    enabled: boolean;
    start: string; // HH:MM
    end: string;   // HH:MM
  };
  maxNotificationsPerHour: number;
  channels: {
    hud: boolean;
    audioSpeech: boolean;
    systemLog: boolean;
  };
}

export interface ProactiveCycleResult {
  timestamp: string;
  monitoredProjectsCount: number;
  deadlinesScanned: number;
  stalledTasksFound: number;
  studyTopicsDue: number;
  notificationsGenerated: ProactiveNotification[];
  quietHoursActive: boolean;
  durationMs: number;
}

export interface NextActionSuggestion {
  id: string;
  taskId?: string;
  title: string;
  rationale: string;
  urgency: 'critical' | 'high' | 'medium' | 'low';
  estimatedMinutes: number;
  suggestedDelegate: string;
  actionType: 'execute_code' | 'study_review' | 'git_commit' | 'planning' | 'break';
  impactScore: number;
}

export interface DailyBriefing {
  type: 'morning' | 'evening';
  date: string;
  greeting: string;
  focusGoal: string;
  topTasks: Array<{ id: string; title: string; priority: string; quadrant: string }>;
  imminentDeadlines: Array<{ title: string; dueDate: string; hoursRemaining: number }>;
  studyQueueCount: number;
  systemHealth: {
    cpuPercent: number;
    ramPercent: number;
    guardianStatus: string;
  };
  inspirationalNote: string;
}
