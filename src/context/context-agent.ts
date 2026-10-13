import {
  AgentDefinition,
  AgentExecutionContext,
  AgentExecutionResult,
  IAgent,
} from '../agents/agent.interface.js';
import { PersonalContextManager } from './context-manager.js';
import { PermissionLevel, ResourceType } from '../security/types.js';

export class ContextAgent implements IAgent {
  public readonly definition: AgentDefinition = {
    id: 'context-agent',
    name: 'Personal Context & Dashboard Agent',
    description: 'Synthesizes real-time personal context across identity, goals, cognitive load, environment, activity timeline, and multi-engine dashboard status',
    version: '0.28.0-phase28',
    capabilities: [
      'personal_context_aggregation',
      'focus_session_management',
      'cognitive_load_assessment',
      'activity_timeline_tracking',
      'dashboard_telemetry',
    ],
    requiredPermissions: [
      { resource: ResourceType.SYSTEM, action: 'read', level: PermissionLevel.READ },
      { resource: ResourceType.SYSTEM, action: 'write', level: PermissionLevel.WRITE },
    ],
    inputSchema: {
      type: 'object',
      properties: {
        action: {
          type: 'string',
          enum: [
            'get_snapshot',
            'set_focus',
            'end_focus',
            'query_context',
            'log_activity',
            'list_activities',
            'assess_cognitive_load',
            'get_overview',
            'generate_insights',
          ],
        },
        mode: { type: 'string' },
        goal: { type: 'string' },
        project: { type: 'string' },
        durationMinutes: { type: 'number' },
        notes: { type: 'string' },
        query: { type: 'string' },
        activityCategory: { type: 'string' },
        activityAction: { type: 'string' },
        activitySummary: { type: 'string' },
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

  private manager: PersonalContextManager;

  constructor(manager: PersonalContextManager) {
    this.manager = manager;
  }

  public async execute(
    input: unknown,
    context?: AgentExecutionContext
  ): Promise<AgentExecutionResult> {
    const startTime = Date.now();
    const payload = (input as Record<string, any>) || {};
    const action = payload.action || 'get_snapshot';
    const user = context?.userId || 'dwight';

    try {
      switch (action) {
        case 'get_snapshot': {
          const snapshot = await this.manager.getSnapshot(user);
          return {
            success: true,
            agentId: this.definition.id,
            data: snapshot,
            executionTimeMs: Date.now() - startTime,
          };
        }

        case 'set_focus': {
          if (!payload.goal) throw new Error('Field "goal" is required to activate focus session.');
          const session = this.manager.setFocusSession(
            {
              mode: payload.mode || 'deep_work',
              goal: payload.goal,
              project: payload.project,
              targetDurationMinutes: payload.durationMinutes,
              notes: payload.notes,
            },
            user
          );
          return {
            success: true,
            agentId: this.definition.id,
            data: session,
            executionTimeMs: Date.now() - startTime,
          };
        }

        case 'end_focus': {
          const ended = this.manager.endFocusSession(user);
          return {
            success: true,
            agentId: this.definition.id,
            data: ended || { message: 'No active session was running.' },
            executionTimeMs: Date.now() - startTime,
          };
        }

        case 'query_context': {
          if (!payload.query) throw new Error('Field "query" is required to query relevant context.');
          const result = await this.manager.queryContext({ actionOrGoal: payload.query }, user);
          return {
            success: true,
            agentId: this.definition.id,
            data: result,
            executionTimeMs: Date.now() - startTime,
          };
        }

        case 'log_activity': {
          if (!payload.activityAction || !payload.activitySummary) {
            throw new Error('Fields "activityAction" and "activitySummary" are required.');
          }
          const item = this.manager.logActivity({
            userId: user,
            category: payload.activityCategory || 'system',
            action: payload.activityAction,
            summary: payload.activitySummary,
            metadata: payload.metadata,
          });
          return {
            success: true,
            agentId: this.definition.id,
            data: item,
            executionTimeMs: Date.now() - startTime,
          };
        }

        case 'list_activities': {
          const items = this.manager.listActivities({ category: payload.activityCategory }, user);
          return {
            success: true,
            agentId: this.definition.id,
            data: { activities: items, count: items.length },
            executionTimeMs: Date.now() - startTime,
          };
        }

        case 'assess_cognitive_load': {
          const cognitive = this.manager.assessCognitiveLoad(user);
          return {
            success: true,
            agentId: this.definition.id,
            data: cognitive,
            executionTimeMs: Date.now() - startTime,
          };
        }

        case 'get_overview': {
          const overview = await this.manager.getDashboardOverview(user);
          return {
            success: true,
            agentId: this.definition.id,
            data: overview,
            executionTimeMs: Date.now() - startTime,
          };
        }

        case 'generate_insights': {
          const insights = await this.manager.generateInsights(user);
          return {
            success: true,
            agentId: this.definition.id,
            data: { insights, count: insights.length },
            executionTimeMs: Date.now() - startTime,
          };
        }

        default:
          throw new Error(`Unknown context agent action "${action}".`);
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
