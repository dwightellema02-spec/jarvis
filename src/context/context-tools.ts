import {
  ITool,
  ToolDefinition,
  ToolExecutionContext,
  ToolExecutionResult,
} from '../tools/tool.interface.js';
import { PersonalContextManager } from './context-manager.js';
import { PermissionLevel, ResourceType } from '../security/types.js';

export class GetContextSnapshotTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'context.get_snapshot',
    name: 'Get Unified Personal Context Snapshot',
    description: 'Synthesizes real-time personal context across user identity, active goals, cognitive state, environment, and recent activity',
    version: '0.28.0-phase28',
    requiredPermissions: [{ resource: ResourceType.SYSTEM, action: 'read', level: PermissionLevel.READ }],
    parametersSchema: {
      type: 'object',
      properties: {},
    },
    status: 'implemented',
  };

  constructor(private manager: PersonalContextManager) {}

  public async execute(_params: any, context?: ToolExecutionContext): Promise<ToolExecutionResult> {
    const start = Date.now();
    try {
      const user = context?.userId || 'dwight';
      const snapshot = await this.manager.getSnapshot(user);
      return {
        success: true,
        toolId: this.definition.id,
        data: snapshot,
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

export class SetFocusSessionTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'context.set_focus_session',
    name: 'Activate Focus Session & Work Mode',
    description: 'Sets or updates the active work session mode, goal, project association, and expected duration',
    version: '0.28.0-phase28',
    requiredPermissions: [{ resource: ResourceType.SYSTEM, action: 'write', level: PermissionLevel.WRITE }],
    parametersSchema: {
      type: 'object',
      properties: {
        mode: {
          type: 'string',
          enum: ['deep_work', 'study_review', 'coding', 'creative_design', 'research', 'idle'],
        },
        goal: { type: 'string', description: 'Primary objective of the session' },
        project: { type: 'string', description: 'Associated workspace project' },
        durationMinutes: { type: 'number', description: 'Target session length in minutes' },
        notes: { type: 'string', description: 'Optional session context notes' },
      },
      required: ['goal'],
    },
    status: 'implemented',
  };

  constructor(private manager: PersonalContextManager) {}

  public async execute(params: any, context?: ToolExecutionContext): Promise<ToolExecutionResult> {
    const start = Date.now();
    try {
      const user = context?.userId || 'dwight';
      const session = this.manager.setFocusSession(
        {
          mode: params.mode || 'deep_work',
          goal: params.goal,
          project: params.project,
          targetDurationMinutes: params.durationMinutes,
          notes: params.notes,
        },
        user
      );
      return {
        success: true,
        toolId: this.definition.id,
        data: session,
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

export class QueryRelevantContextTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'context.query_relevant_context',
    name: 'Query Relevance-Ranked Personal Context',
    description: 'Retrieves unified context blend (identity + active goals + relevant memories + second brain) for a specific action or query',
    version: '0.28.0-phase28',
    requiredPermissions: [{ resource: ResourceType.SYSTEM, action: 'read', level: PermissionLevel.READ }],
    parametersSchema: {
      type: 'object',
      properties: {
        actionOrGoal: { type: 'string', description: 'Target action, prompt, or goal' },
        includeProfile: { type: 'boolean' },
        includeGoals: { type: 'boolean' },
        includeMemories: { type: 'boolean' },
        includeKnowledgeNodes: { type: 'boolean' },
      },
      required: ['actionOrGoal'],
    },
    status: 'implemented',
  };

  constructor(private manager: PersonalContextManager) {}

  public async execute(params: any, context?: ToolExecutionContext): Promise<ToolExecutionResult> {
    const start = Date.now();
    try {
      const user = context?.userId || 'dwight';
      const result = await this.manager.queryContext(params, user);
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

export class LogActivityTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'context.log_activity',
    name: 'Log Unified Timeline Activity Event',
    description: 'Records an operational activity event onto the system-wide personal context timeline',
    version: '0.28.0-phase28',
    requiredPermissions: [{ resource: ResourceType.SYSTEM, action: 'write', level: PermissionLevel.WRITE }],
    parametersSchema: {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          enum: ['chat', 'code', 'math', 'research', 'goal', 'system', 'verification', 'learning'],
        },
        action: { type: 'string', description: 'Action descriptor' },
        summary: { type: 'string', description: 'Human-readable summary of activity' },
        metadata: { type: 'object' },
      },
      required: ['category', 'action', 'summary'],
    },
    status: 'implemented',
  };

  constructor(private manager: PersonalContextManager) {}

  public async execute(params: any, context?: ToolExecutionContext): Promise<ToolExecutionResult> {
    const start = Date.now();
    try {
      const user = context?.userId || 'dwight';
      const item = this.manager.logActivity({
        userId: user,
        category: params.category,
        action: params.action,
        summary: params.summary,
        metadata: params.metadata,
      });
      return {
        success: true,
        toolId: this.definition.id,
        data: item,
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

export class ListActivitiesTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'context.list_activities',
    name: 'List Timeline Activities',
    description: 'Enumerates recent personal context activity stream entries with optional category filtering',
    version: '0.28.0-phase28',
    requiredPermissions: [{ resource: ResourceType.SYSTEM, action: 'read', level: PermissionLevel.READ }],
    parametersSchema: {
      type: 'object',
      properties: {
        category: { type: 'string' },
        limit: { type: 'number' },
      },
    },
    status: 'implemented',
  };

  constructor(private manager: PersonalContextManager) {}

  public async execute(params: any, context?: ToolExecutionContext): Promise<ToolExecutionResult> {
    const start = Date.now();
    try {
      const user = context?.userId || 'dwight';
      const items = this.manager.listActivities(params, user);
      return {
        success: true,
        toolId: this.definition.id,
        data: { activities: items, count: items.length },
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

export class AssessCognitiveLoadTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'context.assess_cognitive_load',
    name: 'Assess User Cognitive Load',
    description: 'Evaluates current workload index, deadline fatigue factors, and actionable pacing recommendations',
    version: '0.28.0-phase28',
    requiredPermissions: [{ resource: ResourceType.SYSTEM, action: 'read', level: PermissionLevel.READ }],
    parametersSchema: {
      type: 'object',
      properties: {},
    },
    status: 'implemented',
  };

  constructor(private manager: PersonalContextManager) {}

  public async execute(_params: any, context?: ToolExecutionContext): Promise<ToolExecutionResult> {
    const start = Date.now();
    try {
      const user = context?.userId || 'dwight';
      const cognitive = this.manager.assessCognitiveLoad(user);
      return {
        success: true,
        toolId: this.definition.id,
        data: cognitive,
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

export class GetDashboardOverviewTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'context.get_dashboard_overview',
    name: 'Get Unified Dashboard Overview',
    description: 'Generates comprehensive multi-engine status matrix, active focus mode, uptime, and system KPIs',
    version: '0.28.0-phase28',
    requiredPermissions: [{ resource: ResourceType.SYSTEM, action: 'read', level: PermissionLevel.READ }],
    parametersSchema: {
      type: 'object',
      properties: {},
    },
    status: 'implemented',
  };

  constructor(private manager: PersonalContextManager) {}

  public async execute(_params: any, context?: ToolExecutionContext): Promise<ToolExecutionResult> {
    const start = Date.now();
    try {
      const user = context?.userId || 'dwight';
      const overview = await this.manager.getDashboardOverview(user);
      return {
        success: true,
        toolId: this.definition.id,
        data: overview,
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

export class GenerateInsightsTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'context.generate_insights',
    name: 'Generate Contextual Recommendations & Insights',
    description: 'Synthesizes cross-system proactive insights across focus targets, cognitive workload, and invariant compliance',
    version: '0.28.0-phase28',
    requiredPermissions: [{ resource: ResourceType.SYSTEM, action: 'read', level: PermissionLevel.READ }],
    parametersSchema: {
      type: 'object',
      properties: {},
    },
    status: 'implemented',
  };

  constructor(private manager: PersonalContextManager) {}

  public async execute(_params: any, context?: ToolExecutionContext): Promise<ToolExecutionResult> {
    const start = Date.now();
    try {
      const user = context?.userId || 'dwight';
      const insights = await this.manager.generateInsights(user);
      return {
        success: true,
        toolId: this.definition.id,
        data: { insights, count: insights.length },
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

export function createContextTools(manager: PersonalContextManager): ITool[] {
  return [
    new GetContextSnapshotTool(manager),
    new SetFocusSessionTool(manager),
    new QueryRelevantContextTool(manager),
    new LogActivityTool(manager),
    new ListActivitiesTool(manager),
    new AssessCognitiveLoadTool(manager),
    new GetDashboardOverviewTool(manager),
    new GenerateInsightsTool(manager),
  ];
}
