import { ResourceType, PermissionAction, PermissionLevel, SecurityDecisionType } from '../security/types.js';

export interface AuditEvent {
  id: string;
  timestamp: string;
  user: string;
  requestId: string;
  resource: ResourceType;
  action: PermissionAction;
  permissionRequired: PermissionLevel;
  permissionGranted?: PermissionLevel;
  decision: SecurityDecisionType;
  reason: string;
  result: 'SUCCESS' | 'BLOCKED' | 'DENIED' | 'FAILED';
  details?: Record<string, unknown>;
  ipAddress?: string;
  durationMs?: number;
}

export interface AuditFilter {
  user?: string;
  requestId?: string;
  resource?: ResourceType;
  action?: PermissionAction;
  decision?: SecurityDecisionType;
  result?: string;
  startDate?: string;
  endDate?: string;
}

export interface AuditStorage {
  record(event: AuditEvent): Promise<void> | void;
  query(filter?: AuditFilter): Promise<AuditEvent[]>;
  count(): Promise<number>;
}
