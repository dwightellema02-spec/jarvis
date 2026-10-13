import { ResourcePermission } from '../security/types.js';

export type CollaborationTopology = 'pipeline' | 'parallel' | 'hierarchical' | 'consensus';

export type MissionStatus = 'pending' | 'running' | 'completed' | 'failed' | 'paused';

export type StepStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped';

export type AgentMessageType = 'task' | 'result' | 'critique' | 'query' | 'clarification' | 'handoff';

export interface AgentMessage {
  id: string;
  missionId: string;
  fromAgentId: string;
  toAgentId: string;
  type: AgentMessageType;
  content: string;
  payload?: Record<string, unknown>;
  timestamp: string;
}

export interface MissionStep {
  id: string;
  name: string;
  agentId: string;
  description: string;
  status: StepStatus;
  dependsOn?: string[]; // IDs of preceding steps
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  error?: string;
  startedAt?: string;
  completedAt?: string;
  durationMs?: number;
}

export interface PeerReviewFeedback {
  reviewerAgentId: string;
  targetStepId: string;
  approved: boolean;
  score: number; // 0 to 100
  critique: string;
  recommendations: string[];
  reviewedAt: string;
}

export interface CollaborationMission {
  id: string;
  title: string;
  objective: string;
  topology: CollaborationTopology;
  leadAgentId: string;
  participatingAgentIds: string[];
  status: MissionStatus;
  steps: MissionStep[];
  blackboard: Record<string, unknown>;
  messages: AgentMessage[];
  reviews: PeerReviewFeedback[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  error?: string;
  resultSummary?: string;
}

export interface CreateMissionRequest {
  title: string;
  objective: string;
  topology?: CollaborationTopology;
  leadAgentId?: string;
  participatingAgentIds?: string[];
  steps?: Array<{
    name: string;
    agentId: string;
    description: string;
    dependsOn?: string[];
    input?: Record<string, unknown>;
  }>;
  initialBlackboard?: Record<string, unknown>;
}

export interface CollaborationTemplate {
  id: string;
  name: string;
  description: string;
  topology: CollaborationTopology;
  participatingAgentIds: string[];
  defaultSteps: Array<{
    name: string;
    agentId: string;
    description: string;
  }>;
}
