import { ITool, ToolDefinition, ToolExecutionContext, ToolExecutionResult } from '../tools/tool.interface.js';
import { GoalsManager } from './goals-manager.js';
import { PermissionLevel, ResourceType } from '../security/types.js';

export class CreateGoalTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'goals.create_goal',
    name: 'Create SMART Goal',
    description: 'Establishes a structured SMART goal with measurable milestones and target timeline',
    requiredPermissions: [{ resource: ResourceType.PROJECTS, action: 'write', level: PermissionLevel.WRITE }],
    parametersSchema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        category: { type: 'string' },
        priority: { type: 'string' },
        targetDate: { type: 'string' },
        milestones: { type: 'array' },
      },
      required: ['title', 'description', 'targetDate'],
    },
    status: 'implemented',
    version: '0.22.0',
  };

  constructor(private manager: GoalsManager) {}

  public async execute(params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const start = Date.now();
    try {
      const p = (params || {}) as any;
      const goal = this.manager.createGoal(
        {
          title: p.title,
          description: p.description,
          category: p.category || 'personal',
          priority: p.priority || 'medium',
          targetDate: p.targetDate,
          milestones: p.milestones,
        },
        context.userId
      );
      return {
        success: true,
        toolId: this.definition.id,
        data: goal,
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

export class DecomposeIdeaTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'goals.decompose_idea',
    name: 'Decompose Idea to Execution Plan',
    description: 'Executes the IDEA -> GOAL -> PLAN -> TASKS -> ACTION -> PROGRESS pipeline',
    requiredPermissions: [{ resource: ResourceType.PROJECTS, action: 'write', level: PermissionLevel.WRITE }],
    parametersSchema: {
      type: 'object',
      properties: {
        idea: { type: 'string' },
        category: { type: 'string' },
        autoCreate: { type: 'boolean' },
      },
      required: ['idea'],
    },
    status: 'implemented',
    version: '0.22.0',
  };

  constructor(private manager: GoalsManager) {}

  public async execute(params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const start = Date.now();
    try {
      const p = (params || {}) as any;
      const result = this.manager.decomposeIdea(p.idea, p.category, p.autoCreate, context.userId);
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

export class ManageTasksTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'goals.manage_tasks',
    name: 'Manage Planning Tasks',
    description: 'Creates, updates, or lists hierarchical tasks with status and priority assignments',
    requiredPermissions: [{ resource: ResourceType.PROJECTS, action: 'write', level: PermissionLevel.WRITE }],
    parametersSchema: {
      type: 'object',
      properties: {
        action: { type: 'string', enum: ['create', 'update', 'list'] },
        taskId: { type: 'string' },
        taskData: { type: 'object' },
      },
      required: ['action'],
    },
    status: 'implemented',
    version: '0.22.0',
  };

  constructor(private manager: GoalsManager) {}

  public async execute(params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const start = Date.now();
    try {
      const p = (params || {}) as any;
      let data: any;
      if (p.action === 'create') {
        data = this.manager.createTask(p.taskData, context.userId);
      } else if (p.action === 'update') {
        data = this.manager.updateTask(p.taskId, p.taskData, context.userId);
      } else {
        data = this.manager.listTasks(p.filters, context.userId);
      }
      return {
        success: true,
        toolId: this.definition.id,
        data,
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

export class TrackProgressTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'goals.track_progress',
    name: 'Track Goals Progress & Velocity',
    description: 'Calculates quantifiable completion percentages, weekly velocity, and blockage diagnostics',
    requiredPermissions: [{ resource: ResourceType.PROJECTS, action: 'read', level: PermissionLevel.READ }],
    parametersSchema: {
      type: 'object',
      properties: {},
    },
    status: 'implemented',
    version: '0.22.0',
  };

  constructor(private manager: GoalsManager) {}

  public async execute(_params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const start = Date.now();
    try {
      const analytics = this.manager.getAnalytics(context.userId);
      return {
        success: true,
        toolId: this.definition.id,
        data: analytics,
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

export class CreateStudyPlanTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'goals.create_study_plan',
    name: 'Create Study Plan & Spaced Repetition',
    description: 'Constructs a curriculum study roadmap applying Ebbinghaus spaced repetition schedules',
    requiredPermissions: [{ resource: ResourceType.PROJECTS, action: 'write', level: PermissionLevel.WRITE }],
    parametersSchema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        targetExamOrGoal: { type: 'string' },
        topics: { type: 'array' },
        dailyHoursTarget: { type: 'number' },
      },
      required: ['title', 'targetExamOrGoal', 'topics'],
    },
    status: 'implemented',
    version: '0.22.0',
  };

  constructor(private manager: GoalsManager) {}

  public async execute(params: unknown, _context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const start = Date.now();
    try {
      const p = (params || {}) as any;
      const plan = this.manager.getStudyPlanner().createPlan(
        p.title,
        p.targetExamOrGoal,
        p.topics,
        p.dailyHoursTarget || 2
      );
      return {
        success: true,
        toolId: this.definition.id,
        data: plan,
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

export class ScheduleTimeblockTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'goals.schedule_timeblock',
    name: 'Schedule Focus Timeblock',
    description: 'Allocates deep focus slots with conflict detection and circadian peak energy alignment',
    requiredPermissions: [{ resource: ResourceType.PROJECTS, action: 'write', level: PermissionLevel.WRITE }],
    parametersSchema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        type: { type: 'string' },
        date: { type: 'string' },
        startTime: { type: 'string' },
        endTime: { type: 'string' },
      },
      required: ['title', 'date', 'startTime', 'endTime'],
    },
    status: 'implemented',
    version: '0.22.0',
  };

  constructor(private manager: GoalsManager) {}

  public async execute(params: unknown, _context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const start = Date.now();
    try {
      const p = (params || {}) as any;
      const result = this.manager.getScheduler().addBlock(
        p.title,
        p.type || 'deep_work',
        p.date,
        p.startTime,
        p.endTime,
        p.taskId,
        p.goalId
      );
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

export class ManageProjectTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'goals.manage_project',
    name: 'Manage Project Workspaces',
    description: 'Coordinates multi-project workspaces, milestones, and agent leadership assignments',
    requiredPermissions: [{ resource: ResourceType.PROJECTS, action: 'write', level: PermissionLevel.WRITE }],
    parametersSchema: {
      type: 'object',
      properties: {
        action: { type: 'string', enum: ['list', 'create'] },
        name: { type: 'string' },
        description: { type: 'string' },
        rootPath: { type: 'string' },
      },
      required: ['action'],
    },
    status: 'implemented',
    version: '0.22.0',
  };

  constructor(private manager: GoalsManager) {}

  public async execute(params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const start = Date.now();
    try {
      const p = (params || {}) as any;
      let data: any;
      if (p.action === 'create') {
        data = this.manager.createProject(
          {
            name: p.name,
            description: p.description || '',
            rootPath: p.rootPath,
            tags: p.tags,
            leadAgentId: p.leadAgentId,
          },
          context.userId
        );
      } else {
        data = this.manager.listProjects(context.userId);
      }
      return {
        success: true,
        toolId: this.definition.id,
        data,
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

export class EisenhowerMatrixTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'goals.eisenhower_matrix',
    name: 'Query Eisenhower Matrix',
    description: 'Categorizes all pending and active tasks into Do First, Schedule, Delegate, and Eliminate quadrants',
    requiredPermissions: [{ resource: ResourceType.PROJECTS, action: 'read', level: PermissionLevel.READ }],
    parametersSchema: {
      type: 'object',
      properties: {},
    },
    status: 'implemented',
    version: '0.22.0',
  };

  constructor(private manager: GoalsManager) {}

  public async execute(_params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const start = Date.now();
    try {
      const matrix = this.manager.getEisenhowerMatrix(context.userId);
      return {
        success: true,
        toolId: this.definition.id,
        data: matrix,
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
