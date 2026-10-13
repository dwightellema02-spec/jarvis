import { IAgent, AgentDefinition, AgentExecutionContext, AgentExecutionResult } from '../agents/agent.interface.js';
import { ProactiveManager } from './proactive-manager.js';
import { PermissionLevel, ResourceType } from '../security/types.js';

export class ProactiveAgent implements IAgent {
  public readonly definition: AgentDefinition = {
    id: 'proactive-agent',
    name: 'Proactive Intelligence Agent',
    description: 'Proactive reminder daemon, deadline watcher, unfinished task advisor, and briefing synthesizer',
    version: '0.23.0-phase23',
    capabilities: [
      'scan_deadlines',
      'detect_unfinished_tasks',
      'suggest_next_actions',
      'generate_briefings',
      'manage_proactive_notifications',
      'enforce_monitoring_boundaries',
    ],
    requiredPermissions: [{ resource: ResourceType.PROJECTS, action: 'read', level: PermissionLevel.READ }],
    inputSchema: {
      type: 'object',
      properties: {
        action: {
          type: 'string',
          enum: [
            'run_cycle',
            'list_notifications',
            'suggest_actions',
            'generate_briefing',
            'dismiss_notification',
            'get_preferences',
            'update_preferences',
          ],
        },
        notificationId: { type: 'string' },
        briefingType: { type: 'string', enum: ['morning', 'evening'] },
        preferencesUpdates: { type: 'object' },
        limit: { type: 'number' },
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

  constructor(private proactiveManager: ProactiveManager) {}

  public async execute(input: unknown, context: AgentExecutionContext): Promise<AgentExecutionResult> {
    const startTime = Date.now();
    const payload = (input || {}) as Record<string, any>;
    const action = payload.action || 'suggest_actions';

    try {
      let data: any;

      switch (action) {
        case 'run_cycle':
          data = this.proactiveManager.runCycle(context.userId);
          break;

        case 'list_notifications':
          data = this.proactiveManager.listNotifications(payload.filters, context.userId);
          break;

        case 'suggest_actions':
          data = this.proactiveManager.suggestNextActions(payload.limit || 3, context.userId);
          break;

        case 'generate_briefing':
          data = this.proactiveManager.generateBriefing(payload.briefingType || 'morning', context.userId);
          break;

        case 'dismiss_notification':
          if (!payload.notificationId) {
            throw new Error('Action "dismiss_notification" requires "notificationId"');
          }
          data = this.proactiveManager.dismissNotification(payload.notificationId, context.userId);
          break;

        case 'get_preferences':
          data = this.proactiveManager.getPreferences(context.userId);
          break;

        case 'update_preferences':
          if (!payload.preferencesUpdates) {
            throw new Error('Action "update_preferences" requires "preferencesUpdates" object');
          }
          data = this.proactiveManager.updatePreferences(payload.preferencesUpdates, context.userId);
          break;

        default:
          throw new Error(`Unknown action "${action}" for ProactiveAgent`);
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
