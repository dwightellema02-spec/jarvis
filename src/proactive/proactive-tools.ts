import { ITool, ToolDefinition, ToolExecutionContext, ToolExecutionResult } from '../tools/tool.interface.js';
import { ProactiveManager } from './proactive-manager.js';
import { PermissionLevel, ResourceType } from '../security/types.js';

export class RunCycleTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'proactive.run_cycle',
    name: 'Run Proactive Inspection Cycle',
    description: 'Executes a background proactive scan across approved projects for deadlines, stalled tasks, and study alerts',
    requiredPermissions: [{ resource: ResourceType.PROJECTS, action: 'execute', level: PermissionLevel.EXECUTE }],
    parametersSchema: { type: 'object', properties: {} },
    status: 'implemented',
    version: '0.23.0',
  };

  constructor(private manager: ProactiveManager) {}

  public async execute(_params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const start = Date.now();
    try {
      const result = this.manager.runCycle(context.userId);
      return {
        success: true,
        toolId: this.definition.id,
        data: result,
        verified: true,
        executionTimeMs: Date.now() - start,
      };
    } catch (err: any) {
      return {
        success: false,
        toolId: this.definition.id,
        error: err.message,
        verified: false,
        executionTimeMs: Date.now() - start,
      };
    }
  }
}

export class ListNotificationsTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'proactive.list_notifications',
    name: 'List Proactive Notifications',
    description: 'Retrieves current active proactive notifications, alerts, and suggestions',
    requiredPermissions: [{ resource: ResourceType.PROJECTS, action: 'read', level: PermissionLevel.READ }],
    parametersSchema: {
      type: 'object',
      properties: {
        status: { type: 'string' },
        severity: { type: 'string' },
        type: { type: 'string' },
      },
    },
    status: 'implemented',
    version: '0.23.0',
  };

  constructor(private manager: ProactiveManager) {}

  public async execute(params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const start = Date.now();
    try {
      const p = (params || {}) as any;
      const notifs = this.manager.listNotifications(p, context.userId);
      return {
        success: true,
        toolId: this.definition.id,
        data: notifs,
        verified: true,
        executionTimeMs: Date.now() - start,
      };
    } catch (err: any) {
      return {
        success: false,
        toolId: this.definition.id,
        error: err.message,
        verified: false,
        executionTimeMs: Date.now() - start,
      };
    }
  }
}

export class DismissNotificationTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'proactive.dismiss_notification',
    name: 'Dismiss or Snooze Notification',
    description: 'Marks a proactive notification as dismissed or snoozed',
    requiredPermissions: [{ resource: ResourceType.PROJECTS, action: 'write', level: PermissionLevel.WRITE }],
    parametersSchema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        snoozeMinutes: { type: 'number' },
      },
      required: ['id'],
    },
    status: 'implemented',
    version: '0.23.0',
  };

  constructor(private manager: ProactiveManager) {}

  public async execute(params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const start = Date.now();
    try {
      const p = (params || {}) as any;
      const notifId = p.id || p.notificationId;
      if (!notifId) {
        throw new Error('Notification id is required');
      }
      let result: any;
      if (p.snoozeMinutes) {
        result = this.manager.snoozeNotification(notifId, p.snoozeMinutes, context.userId);
      } else {
        result = this.manager.dismissNotification(notifId, context.userId);
      }
      return {
        success: true,
        toolId: this.definition.id,
        data: result,
        verified: true,
        executionTimeMs: Date.now() - start,
      };
    } catch (err: any) {
      return {
        success: false,
        toolId: this.definition.id,
        error: err.message,
        verified: false,
        executionTimeMs: Date.now() - start,
      };
    }
  }
}

export class SuggestNextActionTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'proactive.suggest_next_action',
    name: 'Suggest Next Best Action',
    description: 'Evaluates task priority, dependencies, and deadlines to recommend top actionable next steps',
    requiredPermissions: [{ resource: ResourceType.PROJECTS, action: 'read', level: PermissionLevel.READ }],
    parametersSchema: {
      type: 'object',
      properties: { limit: { type: 'number' } },
    },
    status: 'implemented',
    version: '0.23.0',
  };

  constructor(private manager: ProactiveManager) {}

  public async execute(params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const start = Date.now();
    try {
      const p = (params || {}) as any;
      const suggestions = this.manager.suggestNextActions(p.limit || 3, context.userId);
      return {
        success: true,
        toolId: this.definition.id,
        data: suggestions,
        verified: true,
        executionTimeMs: Date.now() - start,
      };
    } catch (err: any) {
      return {
        success: false,
        toolId: this.definition.id,
        error: err.message,
        verified: false,
        executionTimeMs: Date.now() - start,
      };
    }
  }
}

export class ScanDeadlinesTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'proactive.scan_deadlines',
    name: 'Scan Imminent Deadlines',
    description: 'Inspects upcoming milestone and task due dates against the configured deadline alert threshold',
    requiredPermissions: [{ resource: ResourceType.PROJECTS, action: 'read', level: PermissionLevel.READ }],
    parametersSchema: { type: 'object', properties: {} },
    status: 'implemented',
    version: '0.23.0',
  };

  constructor(private manager: ProactiveManager) {}

  public async execute(_params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const start = Date.now();
    try {
      const result = this.manager.runCycle(context.userId);
      const deadlineAlerts = result.notificationsGenerated.filter((n) => n.type === 'deadline_alert');
      return {
        success: true,
        toolId: this.definition.id,
        data: {
          deadlinesScanned: result.deadlinesScanned,
          imminentCount: deadlineAlerts.length,
          alerts: deadlineAlerts,
        },
        verified: true,
        executionTimeMs: Date.now() - start,
      };
    } catch (err: any) {
      return {
        success: false,
        toolId: this.definition.id,
        error: err.message,
        verified: false,
        executionTimeMs: Date.now() - start,
      };
    }
  }
}

export class GenerateBriefingTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'proactive.generate_briefing',
    name: 'Generate Daily Briefing',
    description: 'Prepares an executive morning briefing or evening synthesis summary',
    requiredPermissions: [{ resource: ResourceType.PROJECTS, action: 'read', level: PermissionLevel.READ }],
    parametersSchema: {
      type: 'object',
      properties: { type: { type: 'string', enum: ['morning', 'evening'] } },
    },
    status: 'implemented',
    version: '0.23.0',
  };

  constructor(private manager: ProactiveManager) {}

  public async execute(params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const start = Date.now();
    try {
      const p = (params || {}) as any;
      const briefing = this.manager.generateBriefing(p.type || 'morning', context.userId);
      return {
        success: true,
        toolId: this.definition.id,
        data: briefing,
        verified: true,
        executionTimeMs: Date.now() - start,
      };
    } catch (err: any) {
      return {
        success: false,
        toolId: this.definition.id,
        error: err.message,
        verified: false,
        executionTimeMs: Date.now() - start,
      };
    }
  }
}

export class GetPreferencesTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'proactive.get_preferences',
    name: 'Get Proactive Preferences',
    description: 'Retrieves current monitoring boundaries, approved projects, quiet hours, and channel settings',
    requiredPermissions: [{ resource: ResourceType.PROJECTS, action: 'read', level: PermissionLevel.READ }],
    parametersSchema: { type: 'object', properties: {} },
    status: 'implemented',
    version: '0.23.0',
  };

  constructor(private manager: ProactiveManager) {}

  public async execute(_params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const start = Date.now();
    try {
      const prefs = this.manager.getPreferences(context.userId);
      return {
        success: true,
        toolId: this.definition.id,
        data: prefs,
        verified: true,
        executionTimeMs: Date.now() - start,
      };
    } catch (err: any) {
      return {
        success: false,
        toolId: this.definition.id,
        error: err.message,
        verified: false,
        executionTimeMs: Date.now() - start,
      };
    }
  }
}

export class UpdatePreferencesTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'proactive.update_preferences',
    name: 'Update Proactive Preferences',
    description: 'Modifies user monitoring boundaries, quiet hours, or notification channels',
    requiredPermissions: [{ resource: ResourceType.PROJECTS, action: 'write', level: PermissionLevel.WRITE }],
    parametersSchema: {
      type: 'object',
      properties: {
        updates: { type: 'object' },
      },
      required: ['updates'],
    },
    status: 'implemented',
    version: '0.23.0',
  };

  constructor(private manager: ProactiveManager) {}

  public async execute(params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const start = Date.now();
    try {
      const p = (params || {}) as any;
      const updated = this.manager.updatePreferences(p.updates, context.userId);
      return {
        success: true,
        toolId: this.definition.id,
        data: updated,
        verified: true,
        executionTimeMs: Date.now() - start,
      };
    } catch (err: any) {
      return {
        success: false,
        toolId: this.definition.id,
        error: err.message,
        verified: false,
        executionTimeMs: Date.now() - start,
      };
    }
  }
}

export function createProactiveTools(manager: ProactiveManager): ITool[] {
  return [
    new RunCycleTool(manager),
    new ListNotificationsTool(manager),
    new DismissNotificationTool(manager),
    new SuggestNextActionTool(manager),
    new ScanDeadlinesTool(manager),
    new GenerateBriefingTool(manager),
    new GetPreferencesTool(manager),
    new UpdatePreferencesTool(manager),
  ];
}

