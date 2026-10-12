import { PermissionGrant, ResourceType, PermissionAction, SecurityDecision } from '../security/types.js';
import { UserProfile } from '../profile/types.js';

export type InputSource = 'web' | 'voice' | 'camera' | 'files' | 'terminal' | 'api';

export interface UserInput {
  text?: string;
  voiceSampleUri?: string;
  imageUris?: string[];
  filePaths?: string[];
  metadata?: Record<string, unknown>;
}

export interface SecurityContext {
  ipAddress?: string;
  userAgent?: string;
  authenticatedUserId: string;
  userRole: 'user' | 'admin' | 'guest';
}


export interface RequestContext {
  requestId: string;
  userId: string;
  sessionId: string;
  timestamp: string;
  input: UserInput;
  source: InputSource;
  permissions: PermissionGrant[];
  availableAgents: string[];
  availableTools: string[];
  securityContext: SecurityContext;
  userProfile?: UserProfile;
  profileSummary?: string;
}

export interface ActionPlanItem {
  id: string;
  agentId?: string;
  toolId?: string;
  resource: ResourceType;
  action: PermissionAction;
  target?: string;
  parameters?: Record<string, unknown>;
  verified?: boolean;
}

export interface JarvisResponse {
  requestId: string;
  timestamp: string;
  content: string;
  actionsExecuted: ActionPlanItem[];
  securityDecisions: SecurityDecision[];
  verificationResult?: {
    verified: boolean;
    reason: string;
  };
  durationMs: number;
}
