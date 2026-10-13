import {
  ITool,
  ToolDefinition,
  ToolExecutionContext,
  ToolExecutionResult,
} from '../tools/tool.interface.js';
import { SelfCorrectionManager } from './self-correction-manager.js';
import { PermissionLevel, ResourceType } from '../security/types.js';

export class RecordIncidentTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'learning.record_incident',
    name: 'Record Failure Incident & Synthesize Heuristic',
    description: 'Captures a runtime failure or verification fault, stores it in ExperienceStore, and automatically synthesizes an actionable LearnedRule',
    version: '0.27.0-phase27',
    requiredPermissions: [{ resource: ResourceType.SYSTEM, action: 'write', level: PermissionLevel.WRITE }],
    parametersSchema: {
      type: 'object',
      properties: {
        actionName: { type: 'string', description: 'Action that suffered the fault' },
        errorMessage: { type: 'string', description: 'Error message or verification failure reason' },
        errorType: { type: 'string', description: 'Classification of the error' },
        context: { type: 'object', description: 'Runtime parameter context' },
        severity: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
      },
      required: ['actionName', 'errorMessage'],
    },
    status: 'implemented',
  };

  constructor(private manager: SelfCorrectionManager) {}

  public async execute(params: any, context?: ToolExecutionContext): Promise<ToolExecutionResult> {
    const start = Date.now();
    try {
      const user = context?.userId || 'dwight';
      const result = this.manager.recordFailure(params, user);
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

export class ExtractHeuristicTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'learning.extract_heuristic',
    name: 'Extract Heuristic from Incident',
    description: 'Synthesizes an updated or specialized learned heuristic rule from an existing failure incident record',
    version: '0.27.0-phase27',
    requiredPermissions: [{ resource: ResourceType.SYSTEM, action: 'write', level: PermissionLevel.WRITE }],
    parametersSchema: {
      type: 'object',
      properties: {
        incidentId: { type: 'string', description: 'ID of the failure incident' },
      },
      required: ['incidentId'],
    },
    status: 'implemented',
  };

  constructor(private manager: SelfCorrectionManager) {}

  public async execute(params: any, context?: ToolExecutionContext): Promise<ToolExecutionResult> {
    const start = Date.now();
    try {
      const user = context?.userId || 'dwight';
      const incident = this.manager.getIncident(params.incidentId, user);
      const res = this.manager.recordFailure(
        {
          actionName: incident.actionName,
          errorMessage: incident.errorMessage,
          errorType: incident.errorType,
          context: incident.context,
          severity: incident.severity,
        },
        user
      );
      return {
        success: true,
        toolId: this.definition.id,
        data: res.rule,
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

export class GetGuardrailsTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'learning.get_guardrails',
    name: 'Get Relevant Action Guardrails',
    description: 'Retrieves active heuristics, parameter bounds, and pre-execution warnings for a target action before execution',
    version: '0.27.0-phase27',
    requiredPermissions: [{ resource: ResourceType.SYSTEM, action: 'read', level: PermissionLevel.READ }],
    parametersSchema: {
      type: 'object',
      properties: {
        actionName: { type: 'string', description: 'Action name to inspect' },
        params: { type: 'object', description: 'Candidate execution parameters' },
      },
      required: ['actionName'],
    },
    status: 'implemented',
  };

  constructor(private manager: SelfCorrectionManager) {}

  public async execute(params: any, context?: ToolExecutionContext): Promise<ToolExecutionResult> {
    const start = Date.now();
    try {
      const user = context?.userId || 'dwight';
      const guardrails = this.manager.getRelevantGuardrails(params.actionName, params.params || {}, user);
      return {
        success: true,
        toolId: this.definition.id,
        data: guardrails,
        verified: guardrails.safeToProceed,
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

export class CreateCorrectionPlanTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'learning.create_correction_plan',
    name: 'Create Self-Correction Plan',
    description: 'Synthesizes an adapted execution plan with corrected parameters based on incident history and learned heuristics',
    version: '0.27.0-phase27',
    requiredPermissions: [{ resource: ResourceType.SYSTEM, action: 'write', level: PermissionLevel.WRITE }],
    parametersSchema: {
      type: 'object',
      properties: {
        incidentId: { type: 'string', description: 'Failure incident ID' },
        originalParams: { type: 'object', description: 'Parameters that caused the divergence' },
      },
      required: ['incidentId'],
    },
    status: 'implemented',
  };

  constructor(private manager: SelfCorrectionManager) {}

  public async execute(params: any, context?: ToolExecutionContext): Promise<ToolExecutionResult> {
    const start = Date.now();
    try {
      const user = context?.userId || 'dwight';
      const plan = this.manager.generateCorrectionPlan(params.incidentId, params.originalParams || {}, user);
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

export class RecordRuleFeedbackTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'learning.record_rule_feedback',
    name: 'Record Heuristic Application Feedback',
    description: 'Updates confidence and success metrics of a learned heuristic following real-world execution',
    version: '0.27.0-phase27',
    requiredPermissions: [{ resource: ResourceType.SYSTEM, action: 'write', level: PermissionLevel.WRITE }],
    parametersSchema: {
      type: 'object',
      properties: {
        ruleId: { type: 'string', description: 'ID of the applied learned rule' },
        succeeded: { type: 'boolean', description: 'Whether the action succeeded with this rule applied' },
      },
      required: ['ruleId', 'succeeded'],
    },
    status: 'implemented',
  };

  constructor(private manager: SelfCorrectionManager) {}

  public async execute(params: any, context?: ToolExecutionContext): Promise<ToolExecutionResult> {
    const start = Date.now();
    try {
      const user = context?.userId || 'dwight';
      const rule = this.manager.recordRuleFeedback(params.ruleId, Boolean(params.succeeded), user);
      return {
        success: true,
        toolId: this.definition.id,
        data: rule,
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

export class ListRulesTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'learning.list_rules',
    name: 'List Learned Heuristics',
    description: 'Enumerates learned rules and heuristics with category, status, and target action filters',
    version: '0.27.0-phase27',
    requiredPermissions: [{ resource: ResourceType.SYSTEM, action: 'read', level: PermissionLevel.READ }],
    parametersSchema: {
      type: 'object',
      properties: {
        category: { type: 'string' },
        status: { type: 'string', enum: ['active', 'probation', 'deprecated'] },
        targetAction: { type: 'string' },
      },
    },
    status: 'implemented',
  };

  constructor(private manager: SelfCorrectionManager) {}

  public async execute(params: any, context?: ToolExecutionContext): Promise<ToolExecutionResult> {
    const start = Date.now();
    try {
      const user = context?.userId || 'dwight';
      const rules = this.manager.listRules(
        { category: params?.category, status: params?.status, targetAction: params?.targetAction },
        user
      );
      return {
        success: true,
        toolId: this.definition.id,
        data: { rules, total: rules.length },
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

export class ListIncidentsTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'learning.list_incidents',
    name: 'List Failure Incidents',
    description: 'Enumerates captured failure and verification fault incidents with status and action filters',
    version: '0.27.0-phase27',
    requiredPermissions: [{ resource: ResourceType.SYSTEM, action: 'read', level: PermissionLevel.READ }],
    parametersSchema: {
      type: 'object',
      properties: {
        actionName: { type: 'string' },
        resolved: { type: 'boolean' },
      },
    },
    status: 'implemented',
  };

  constructor(private manager: SelfCorrectionManager) {}

  public async execute(params: any, context?: ToolExecutionContext): Promise<ToolExecutionResult> {
    const start = Date.now();
    try {
      const user = context?.userId || 'dwight';
      const incidents = this.manager.listIncidents(
        { actionName: params?.actionName, resolved: params?.resolved },
        user
      );
      return {
        success: true,
        toolId: this.definition.id,
        data: { incidents, total: incidents.length },
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

export class GenerateEvolutionReportTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'learning.generate_evolution_report',
    name: 'Generate Learning Evolution Report',
    description: 'Synthesizes executive learning velocity, mistake recurrence rate, and active guardrail analytics',
    version: '0.27.0-phase27',
    requiredPermissions: [{ resource: ResourceType.SYSTEM, action: 'read', level: PermissionLevel.READ }],
    parametersSchema: {
      type: 'object',
      properties: {},
    },
    status: 'implemented',
  };

  constructor(private manager: SelfCorrectionManager) {}

  public async execute(_params: any, context?: ToolExecutionContext): Promise<ToolExecutionResult> {
    const start = Date.now();
    try {
      const user = context?.userId || 'dwight';
      const report = this.manager.generateEvolutionReport(user);
      return {
        success: true,
        toolId: this.definition.id,
        data: report,
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

export function createLearningTools(manager: SelfCorrectionManager): ITool[] {
  return [
    new RecordIncidentTool(manager),
    new ExtractHeuristicTool(manager),
    new GetGuardrailsTool(manager),
    new CreateCorrectionPlanTool(manager),
    new RecordRuleFeedbackTool(manager),
    new ListRulesTool(manager),
    new ListIncidentsTool(manager),
    new GenerateEvolutionReportTool(manager),
  ];
}
