import { ResourcePermission } from '../security/types.js';

export type AgentStatus = 'registered' | 'implemented' | 'enabled' | 'disabled';

export interface AgentDefinition {
  id: string;
  name: string;
  description: string;
  version: string;
  capabilities: string[];
  requiredPermissions: ResourcePermission[];
  inputSchema: Record<string, unknown>;
  outputSchema: Record<string, unknown>;
  status: AgentStatus;
}

export interface AgentExecutionContext {
  requestId: string;
  userId: string;
  sessionId: string;
  grantedPermissions: ResourcePermission[];
}

export interface AgentExecutionResult<T = unknown> {
  success: boolean;
  agentId: string;
  data?: T;
  error?: string;
  executionTimeMs: number;
}

export interface IAgent {
  readonly definition: AgentDefinition;
  execute(input: unknown, context: AgentExecutionContext): Promise<AgentExecutionResult>;
}
