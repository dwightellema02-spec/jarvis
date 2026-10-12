export enum PermissionLevel {
  READ = 'READ',
  SUGGEST = 'SUGGEST',
  WRITE = 'WRITE',
  EXECUTE = 'EXECUTE',
  ADMIN = 'ADMIN',
}

export const PERMISSION_HIERARCHY: Record<PermissionLevel, number> = {
  [PermissionLevel.READ]: 1,
  [PermissionLevel.SUGGEST]: 2,
  [PermissionLevel.WRITE]: 3,
  [PermissionLevel.EXECUTE]: 4,
  [PermissionLevel.ADMIN]: 5,
};

export enum ResourceType {
  FILES = 'FILES',
  FOLDERS = 'FOLDERS',
  PROJECTS = 'PROJECTS',
  WEBSITES = 'WEBSITES',
  APPLICATIONS = 'APPLICATIONS',
  DEVICES = 'DEVICES',
  CAMERA = 'CAMERA',
  MICROPHONE = 'MICROPHONE',
  APIS = 'APIS',
  DATABASES = 'DATABASES',
  FINANCIAL_SERVICES = 'FINANCIAL_SERVICES',
  EXTERNAL_ACCOUNTS = 'EXTERNAL_ACCOUNTS',
  SECURITY = 'SECURITY',
  SYSTEM = 'SYSTEM',
}

export type PermissionAction =
  | 'read'
  | 'write'
  | 'execute'
  | 'suggest'
  | 'modify'
  | 'delete'
  | 'admin'
  | 'connect'
  | 'transfer'
  | 'open';

export interface ResourcePermission {
  resource: ResourceType;
  action: PermissionAction;
  level: PermissionLevel;
  pathOrIdentifier?: string;
}

export interface PermissionGrant {
  id: string;
  userId: string;
  resource: ResourceType;
  level: PermissionLevel;
  allowedActions: PermissionAction[];
  grantedAt: string;
  expiresAt?: string;
  grantedBy: string;
  scope?: string; // e.g. path or domain restriction
}

export enum SecurityDecisionType {
  ALLOW = 'ALLOW',
  DENY = 'DENY',
  WARN = 'WARN',
  REQUIRE_CONFIRMATION = 'REQUIRE_CONFIRMATION',
}

export interface SecurityDecision {
  decision: SecurityDecisionType;
  reason: string;
  resource?: ResourceType;
  action?: PermissionAction;
  threatsDetected?: string[];
  requiresElevation?: boolean;
  timestamp: string;
}

export interface PermissionCheckRequest {
  userId: string;
  resource: ResourceType;
  action: PermissionAction;
  requiredLevel: PermissionLevel;
  targetIdentifier?: string;
  reason?: string;
  userRole?: string;
}

export interface PermissionCheckResult {
  allowed: boolean;
  decision: SecurityDecisionType;
  reason: string;
  grantId?: string;
  grantedLevel?: PermissionLevel;
  requiredLevel: PermissionLevel;
}
