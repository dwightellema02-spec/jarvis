import {
  AgentDefinition,
  AgentExecutionContext,
  AgentExecutionResult,
  IAgent,
} from '../agents/agent.interface.js';
import { MultiAgentManager } from './multi-agent-manager.js';
import { PermissionLevel, ResourceType } from '../security/types.js';

export class CollaborationAgent implements IAgent {
  public readonly definition: AgentDefinition = {
    id: 'collaboration-agent',
    name: 'Multi-Agent Collaboration Agent',
    description: 'Choreographs multi-agent teamwork, parallel pipelines, consensus verification, and shared blackboards across specialized agents',
    version: '0.25.0-phase25',
    capabilities: [
      'orchestrate_teams',
      'dispatch_missions',
      'manage_blackboard',
      'agent_messaging',
      'peer_review',
    ],
    requiredPermissions: [
      { resource: ResourceType.SYSTEM, action: 'read', level: PermissionLevel.READ },
      { resource: ResourceType.SYSTEM, action: 'write', level: PermissionLevel.WRITE },
      { resource: ResourceType.PROJECTS, action: 'read', level: PermissionLevel.READ },
    ],
    inputSchema: {
      type: 'object',
      properties: {
        action: {
          type: 'string',
          enum: ['create_mission', 'run_mission', 'list_missions', 'get_status', 'peer_review'],
        },
        missionId: { type: 'string' },
        title: { type: 'string' },
        objective: { type: 'string' },
        topology: { type: 'string', enum: ['pipeline', 'parallel', 'hierarchical', 'consensus'] },
      },
      required: ['action'],
    },
    outputSchema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'object' },
      },
    },
    status: 'implemented',
  };

  private manager: MultiAgentManager;

  constructor(manager: MultiAgentManager) {
    this.manager = manager;
  }

  public async execute(
    input: unknown,
    context: AgentExecutionContext
  ): Promise<AgentExecutionResult> {
    const startTime = Date.now();
    const payload = (input as Record<string, any>) || {};
    const action = payload.action || 'list_missions';
    const user = context.userId || 'dwight';

    try {
      switch (action) {
        case 'create_mission': {
          const mission = this.manager.createMission(
            {
              title: payload.title || 'Untitled Team Mission',
              objective: payload.objective || 'Coordinate multi-agent teamwork',
              topology: payload.topology || 'pipeline',
              leadAgentId: payload.leadAgentId,
              participatingAgentIds: payload.participatingAgentIds,
              steps: payload.steps,
            },
            user
          );
          return {
            success: true,
            agentId: this.definition.id,
            data: mission,
            executionTimeMs: Date.now() - startTime,
          };
        }

        case 'run_mission': {
          if (!payload.missionId) throw new Error('Field "missionId" is required for run_mission.');
          const mission = await this.manager.runMission(payload.missionId, user);
          return {
            success: true,
            agentId: this.definition.id,
            data: mission,
            executionTimeMs: Date.now() - startTime,
          };
        }

        case 'get_status': {
          if (!payload.missionId) throw new Error('Field "missionId" is required for get_status.');
          const mission = this.manager.getMission(payload.missionId, user);
          return {
            success: true,
            agentId: this.definition.id,
            data: mission,
            executionTimeMs: Date.now() - startTime,
          };
        }

        case 'peer_review': {
          if (!payload.missionId || !payload.targetStepId || !payload.reviewerAgentId) {
            throw new Error('Fields "missionId", "targetStepId", and "reviewerAgentId" are required.');
          }
          const review = await this.manager.performPeerReview(
            payload.missionId,
            payload.reviewerAgentId,
            payload.targetStepId,
            payload.critique,
            user
          );
          return {
            success: true,
            agentId: this.definition.id,
            data: review,
            executionTimeMs: Date.now() - startTime,
          };
        }

        case 'list_missions':
        default: {
          const list = this.manager.listMissions(payload.statusFilter, user);
          return {
            success: true,
            agentId: this.definition.id,
            data: { missions: list, total: list.length },
            executionTimeMs: Date.now() - startTime,
          };
        }
      }
    } catch (err: any) {
      return {
        success: false,
        agentId: this.definition.id,
        error: err.message,
        executionTimeMs: Date.now() - startTime,
      };
    }
  }
}
