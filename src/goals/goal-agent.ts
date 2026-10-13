import { IAgent, AgentDefinition, AgentExecutionContext, AgentExecutionResult } from '../agents/agent.interface.js';
import { GoalsManager } from './goals-manager.js';
import { PermissionLevel, ResourceType } from '../security/types.js';

export class GoalAgent implements IAgent {
  public readonly definition: AgentDefinition = {
    id: 'goal-agent',
    name: 'Goal Agent',
    description: 'Goal decomposition, milestone tracking, and priority scheduling',
    version: '0.22.0-phase22',
    capabilities: ['decompose_goal', 'track_milestone', 'optimize_priorities', 'eisenhower_matrix'],
    requiredPermissions: [{ resource: ResourceType.PROJECTS, action: 'read', level: PermissionLevel.READ }],
    inputSchema: {
      type: 'object',
      properties: {
        action: { type: 'string', enum: ['decompose', 'list_goals', 'get_matrix', 'track_milestone'] },
        idea: { type: 'string' },
        goalId: { type: 'string' },
        milestoneId: { type: 'string' },
      },
    },
    outputSchema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        result: { type: 'object' },
      },
    },
    status: 'implemented',
  };

  constructor(private goalsManager: GoalsManager) {}

  public async execute(input: unknown, context: AgentExecutionContext): Promise<AgentExecutionResult> {
    const startTime = Date.now();
    const payload = (input || {}) as Record<string, any>;
    const action = payload.action || 'list_goals';

    try {
      let data: any;

      switch (action) {
        case 'decompose':
          if (!payload.idea) {
            throw new Error('Action "decompose" requires an "idea" string parameter');
          }
          data = this.goalsManager.decomposeIdea(
            payload.idea,
            payload.category || 'education',
            payload.autoCreate || false,
            context.userId
          );
          break;

        case 'list_goals':
          data = this.goalsManager.listGoals(context.userId);
          break;

        case 'get_matrix':
          data = this.goalsManager.getEisenhowerMatrix(context.userId);
          break;

        case 'track_milestone':
          if (!payload.goalId || !payload.milestoneId) {
            throw new Error('Action "track_milestone" requires goalId and milestoneId');
          }
          data = this.goalsManager.completeMilestone(payload.goalId, payload.milestoneId, context.userId);
          break;

        default:
          throw new Error(`Unknown action "${action}" for GoalAgent`);
      }

      return {
        success: true,
        agentId: this.definition.id,
        data,
        executionTimeMs: Date.now() - startTime,
      };
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
