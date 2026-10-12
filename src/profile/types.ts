export type TonePreference = 'concise' | 'balanced' | 'comprehensive' | 'academic' | 'technical';
export type AddressStyle = 'formal' | 'respectful' | 'casual';
export type ProactivityLevel = 'reactive_only' | 'suggestive' | 'proactive';
export type LearningStyle = 'socratic' | 'worked_examples' | 'direct' | 'first_principles';
export type ExplanationDepth = 'fundamental' | 'applied' | 'rigorous_mathematical';
export type MathPedagogy = 'step_by_step_proofs' | 'formula_driven' | 'conceptual_visual';
export type StudyDomain = 'mathematics' | 'education_let' | 'ai_engineering' | 'thesis' | 'general';
export type MasteryLevel = 'beginner' | 'intermediate' | 'advanced' | 'mastery';
export type GoalPriority = 'low' | 'medium' | 'high' | 'critical';
export type GoalStatus = 'not_started' | 'in_progress' | 'achieved' | 'paused';
export type ProjectStatus = 'active' | 'on_hold' | 'completed' | 'archived';
export type RiskPolicyPreset = 'strict' | 'standard' | 'developer';
export type ThemeSetting = 'dark' | 'light' | 'jarvis_cyber';
export type PrivacyMode = 'standard' | 'strict_confidential';

export interface UserIdentity {
  userId: string;
  name: string;
  preferredName: string;
  role: string;
  timezone: string;
  locale: string;
}

export interface CommunicationPreferences {
  tone: TonePreference;
  addressStyle: AddressStyle;
  proactivity: ProactivityLevel;
  enableExplanations: boolean;
  confirmBeforeActions: boolean;
}

export interface LearningPreferences {
  preferredStyle: LearningStyle;
  explanationDepth: ExplanationDepth;
  preferredLanguages: string[];
  mathPedagogy: MathPedagogy;
}

export interface StudyArea {
  id: string;
  domain: StudyDomain;
  title: string;
  currentTopic: string;
  focusAreas: string[];
  masteryLevel: MasteryLevel;
  notes: string;
  targetExamOrGoal?: string;
  updatedAt: string;
}

export interface GoalMilestone {
  id: string;
  description: string;
  completed: boolean;
}

export interface UserGoal {
  id: string;
  title: string;
  description: string;
  category: 'learning' | 'project' | 'career' | 'personal';
  priority: GoalPriority;
  status: GoalStatus;
  targetDate?: string;
  milestones: GoalMilestone[];
  createdAt: string;
  updatedAt: string;
}

export interface UserProfileProject {
  id: string;
  name: string;
  description: string;
  role: string;
  tags: string[];
  workspacePath?: string;
  status: ProjectStatus;
  associatedGoals: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PermissionPreferences {
  defaultRiskPolicy: RiskPolicyPreset;
  autoApproveLowRisk: boolean;
  requireExplicitConfirmationForHighRisk: boolean;
  whitelistedDomains: string[];
  allowedDirectories: string[];
}

export interface PersonalSettings {
  theme: ThemeSetting;
  streamingEnabled: boolean;
  privacyMode: PrivacyMode;
  autoSaveSessions: boolean;
}

export interface UserProfile {
  id: string;
  identity: UserIdentity;
  communication: CommunicationPreferences;
  learning: LearningPreferences;
  studyAreas: StudyArea[];
  goals: UserGoal[];
  projects: UserProfileProject[];
  permissionPreferences: PermissionPreferences;
  settings: PersonalSettings;
  version: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Explicit contract distinguishing Temporary Session Context vs Persistent User Profile
 */
export interface ContextDistinction {
  /**
   * Ephemeral conversation details: lasts only for the duration of the session
   */
  temporaryConversation: {
    sessionId: string;
    recentMessageCount: number;
    ephemeralTopics: string[];
    scratchpadNotes?: string[];
  };
  /**
   * Long-term persistent identity and knowledge
   */
  persistentUserInformation: {
    userId: string;
    userName: string;
    preferredName: string;
    activeGoals: string[];
    activeProjects: string[];
    activeStudyTracks: string[];
    communicationStyle: string;
    learningStyle: string;
  };
}
