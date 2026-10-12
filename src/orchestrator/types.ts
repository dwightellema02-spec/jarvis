import { ResourceType, PermissionAction, PermissionLevel, SecurityDecisionType } from '../security/types.js';

export enum RiskLevel {
  LOW = 'LOW',         // Read-only queries, math explanations, conversational advice
  MEDIUM = 'MEDIUM',   // Reversible sandbox writes, draft generation, local cache updates
  HIGH = 'HIGH',       // Shell commands, project modifications, build/test execution, external API mutations
  CRITICAL = 'CRITICAL'// Financial transfers, auth modifications, credential access, OS-level modifications
}

export const RISK_HIERARCHY: Record<RiskLevel, number> = {
  [RiskLevel.LOW]: 1,
  [RiskLevel.MEDIUM]: 2,
  [RiskLevel.HIGH]: 3,
  [RiskLevel.CRITICAL]: 4,
};

export interface SystemLimitation {
  subsystem: string;
  capability: string;
  reason: string;
  targetPhase: number;
  workaround?: string;
}

export type TaskStatus =
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'FAILED'
  | 'BLOCKED_BY_PERMISSION'
  | 'BLOCKED_BY_RISK'
  | 'BLOCKED_BY_LIMITATION';

export interface TaskStep {
  id: string;
  name: string;
  description: string;
  agentId?: string;
  toolId?: string;
  resource: ResourceType;
  action: PermissionAction;
  requiredPermissionLevel: PermissionLevel;
  riskLevel: RiskLevel;
  parameters: Record<string, unknown>;
  dependencies?: string[];
  status: TaskStatus;
  result?: unknown;
  verification?: VerificationResult;
  error?: string;
  limitation?: SystemLimitation;
}

export interface ExecutionPlan {
  id: string;
  requestId: string;
  goal: string;
  steps: TaskStep[];
  overallRisk: RiskLevel;
  requiresHumanConfirmation: boolean;
  limitationsDetected: SystemLimitation[];
  createdAt: string;
}

export interface VerificationResult {
  verified: boolean;
  checkType: 'file_exists' | 'content_match' | 'schema_valid' | 'exit_code_zero' | 'computation_verified' | 'manual_assertion';
  evidence: string;
  timestamp: string;
}

export interface OrchestrationResult {
  planId: string;
  goal: string;
  success: boolean;
  stepsExecuted: number;
  totalSteps: number;
  overallRisk: RiskLevel;
  stepResults: TaskStep[];
  limitationsReported: SystemLimitation[];
  summary: string;
  durationMs: number;
}
