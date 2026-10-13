export type FocusMode =
  | 'deep_work'
  | 'study_review'
  | 'coding'
  | 'creative_design'
  | 'research'
  | 'idle';

export type CognitiveLoadLevel = 'low' | 'optimal' | 'high' | 'overload';

export interface CognitiveState {
  level: CognitiveLoadLevel;
  score: number; // 0.0 (idle/rested) to 1.0 (overloaded)
  factors: string[];
  recommendation: string;
}

export interface FocusSession {
  id: string;
  mode: FocusMode;
  goal: string;
  project?: string;
  startedAt: string;
  targetDurationMinutes: number;
  active: boolean;
  notes?: string;
}

export interface EnvironmentalConstraints {
  deviceType: string;
  batteryLevelPercent?: number;
  isCharging?: boolean;
  networkStatus: 'online' | 'offline' | 'metered';
  audioOutputState: 'speakers' | 'headphones' | 'muted';
  quietHoursActive: boolean;
}

export type ActivityCategory =
  | 'chat'
  | 'code'
  | 'math'
  | 'research'
  | 'goal'
  | 'system'
  | 'verification'
  | 'learning';

export interface ActivityItem {
  id: string;
  timestamp: string;
  userId: string;
  category: ActivityCategory;
  action: string;
  summary: string;
  metadata?: Record<string, unknown>;
}

export interface PersonalContextSnapshot {
  timestamp: string;
  userId: string;
  userName: string;
  focusSession?: FocusSession;
  cognitiveState: CognitiveState;
  environment: EnvironmentalConstraints;
  activeGoalsCount: number;
  topActiveGoals: string[];
  recentActivityCount: number;
  recentActivities: ActivityItem[];
  relevantKnowledgeNodes: string[];
  contextFingerprint: string; // SHA-256 hash of context state
}

export interface ContextQuery {
  actionOrGoal: string;
  includeProfile?: boolean;
  includeGoals?: boolean;
  includeMemories?: boolean;
  includeKnowledgeNodes?: boolean;
  maxItemsPerCategory?: number;
}

export interface ContextQueryResult {
  query: string;
  matchedProfileDirectives: string[];
  matchedGoals: Array<{ id: string; title: string; priority: string }>;
  matchedMemories: Array<{ id: string; content: string; relevance: number }>;
  matchedKnowledge: Array<{ id: string; title: string; tags: string[] }>;
  compositeContextString: string;
}

export interface ContextInsight {
  id: string;
  timestamp: string;
  type: 'productivity' | 'learning' | 'health' | 'security';
  title: string;
  message: string;
  actionableSuggestion?: string;
  priority: 'low' | 'medium' | 'high';
}

export interface UnifiedDashboardOverview {
  timestamp: string;
  version: string;
  systemStatus: 'optimal' | 'degraded' | 'maintenance';
  uptimeSeconds: number;
  totalEnginesOnline: number;
  engineStatuses: Record<string, 'online' | 'standby' | 'error'>;
  totalAgentsRegistered: number;
  totalToolsRegistered: number;
  activeFocusMode: FocusMode;
  cognitiveLoadScore: number;
  recentActivityCount24h: number;
  verificationPassRatePercent: number;
  zeroRecurrenceInvariantVerified: boolean;
}
