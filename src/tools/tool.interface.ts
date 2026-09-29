import { ResourcePermission } from '../security/types.js';

export type ToolStatus = 'registered' | 'implemented' | 'enabled' | 'disabled';

export interface ToolDefinition {
  id: string;
  name: string;
  description: string;
  requiredPermissions: ResourcePermission[];
  parametersSchema: Record<string, unknown>;
  status: ToolStatus;
  version: string;
}

export interface ToolExecutionContext {
  requestId: string;
  userId: string;
  sessionId: string;
  permissionVerified: boolean;
}

export interface ToolExecutionResult<T = unknown> {
  success: boolean;
  toolId: string;
  data?: T;
  error?: string;
  verified: boolean;
  executionTimeMs: number;
}

export interface ITool {
  readonly definition: ToolDefinition;
  execute(params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult>;
}
