import {
  AgentDefinition,
  AgentExecutionContext,
  AgentExecutionResult,
  IAgent,
} from '../agents/agent.interface.js';
import { SelfCorrectionManager } from './self-correction-manager.js';
import { PermissionLevel, ResourceType } from '../security/types.js';

export class SelfCorrectionAgent implements IAgent {
  public readonly definition: AgentDefinition = {
    id: 'self-correction-agent',
    name: 'Self-Correction & Learning Agent',
    description: 'Autonomous learning loop that records failure incidents, synthesizes actionable heuristics, injects pre-execution guardrails, and prevents mistake recurrence',
    version: '0.27.0-phase27',
    capabilities: [
      'failure_analysis',
      'heuristic_synthesis',
      'guardrail_retrieval',
      'strategy_adaptation',
      'learning_telemetry',
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
            'record_failure',
            'get_guardrails',
            'correction_plan',
            'record_feedback',
            'list_incidents',
            'list_rules',
            'get_report',
          ],
        },
        actionName: { type: 'string' },
        params: { type: 'object' },
        errorMessage: { type: 'string' },
        errorType: { type: 'string' },
        incidentId: { type: 'string' },
        ruleId: { type: 'string' },
        succeeded: { type: 'boolean' },
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

  private manager: SelfCorrectionManager;

  constructor(manager: SelfCorrectionManager) {
    this.manager = manager;
  }

  public async execute(
    input: unknown,
    context: AgentExecutionContext
  ): Promise<AgentExecutionResult> {
    const startTime = Date.now();
    const payload = (input as Record<string, any>) || {};
    const action = payload.action || 'get_report';
    const user = context?.userId || 'dwight';

    try {
      switch (action) {
        case 'record_failure': {
          if (!payload.actionName || !payload.errorMessage) {
            throw new Error('Fields "actionName" and "errorMessage" are required.');
          }
          const recorded = this.manager.recordFailure(
            {
              actionName: payload.actionName,
              errorMessage: payload.errorMessage,
              errorType: payload.errorType,
              context: payload.context,
              severity: payload.severity,
            },
            user
          );
          return {
            success: true,
            agentId: this.definition.id,
            data: recorded,
            executionTimeMs: Date.now() - startTime,
          };
        }

        case 'get_guardrails': {
          if (!payload.actionName) throw new Error('Field "actionName" is required.');
          const match = this.manager.getRelevantGuardrails(payload.actionName, payload.params || {}, user);
          return {
            success: true,
            agentId: this.definition.id,
            data: match,
            executionTimeMs: Date.now() - startTime,
          };
        }

        case 'correction_plan': {
          if (!payload.incidentId) throw new Error('Field "incidentId" is required.');
          const plan = this.manager.generateCorrectionPlan(payload.incidentId, payload.params || {}, user);
          return {
            success: true,
            agentId: this.definition.id,
            data: plan,
            executionTimeMs: Date.now() - startTime,
          };
        }

        case 'record_feedback': {
          if (!payload.ruleId || payload.succeeded === undefined) {
            throw new Error('Fields "ruleId" and "succeeded" are required.');
          }
          const rule = this.manager.recordRuleFeedback(payload.ruleId, Boolean(payload.succeeded), user);
          return {
            success: true,
            agentId: this.definition.id,
            data: rule,
            executionTimeMs: Date.now() - startTime,
          };
        }

        case 'list_incidents': {
          const list = this.manager.listIncidents(
            { actionName: payload.actionName, resolved: payload.resolved },
            user
          );
          return {
            success: true,
            agentId: this.definition.id,
            data: { incidents: list, total: list.length },
            executionTimeMs: Date.now() - startTime,
          };
        }

        case 'list_rules': {
          const list = this.manager.listRules(
            { category: payload.category, status: payload.status, targetAction: payload.targetAction },
            user
          );
          return {
            success: true,
            agentId: this.definition.id,
            data: { rules: list, total: list.length },
            executionTimeMs: Date.now() - startTime,
          };
        }

        case 'get_report': {
          const report = this.manager.generateEvolutionReport(user);
          return {
            success: true,
            agentId: this.definition.id,
            data: report,
            executionTimeMs: Date.now() - startTime,
          };
        }

        default:
          throw new Error(`Unknown self-correction action "${action}".`);
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
