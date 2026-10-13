import {
  AgentDefinition,
  AgentExecutionContext,
  AgentExecutionResult,
  IAgent,
} from '../agents/agent.interface.js';
import { VerificationSuiteManager } from './verification-suite-manager.js';
import { PermissionLevel, ResourceType } from '../security/types.js';

export class VerificationAgent implements IAgent {
  public readonly definition: AgentDefinition = {
    id: 'verification-agent',
    name: 'Verification & Anti-Hallucination Agent',
    description: 'Enforces truth-assertion, multi-modal evidence collection, zero-fake-completion invariants, and automated failure diagnosis & retry loops',
    version: '0.26.0-phase26',
    capabilities: [
      'independent_verification',
      'multi_modal_evidence_collection',
      'anti_hallucination_audit',
      'failure_diagnosis',
      'auto_recovery_orchestration',
      'attestation_ledger_management',
    ],
    requiredPermissions: [
      { resource: ResourceType.SYSTEM, action: 'read', level: PermissionLevel.READ },
      { resource: ResourceType.SYSTEM, action: 'write', level: PermissionLevel.WRITE },
      { resource: ResourceType.SYSTEM, action: 'execute', level: PermissionLevel.WRITE },
    ],
    inputSchema: {
      type: 'object',
      properties: {
        action: {
          type: 'string',
          enum: [
            'verify_action',
            'collect_evidence',
            'audit_hallucination',
            'diagnose_failure',
            'retry_loop',
            'get_attestation',
            'list_attestations',
            'generate_report',
          ],
        },
        actionName: { type: 'string' },
        checks: { type: 'array' },
        runtimePayload: {},
        claimText: { type: 'string' },
        groundingSources: { type: 'array', items: { type: 'string' } },
        attestationId: { type: 'string' },
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

  private manager: VerificationSuiteManager;

  constructor(manager: VerificationSuiteManager) {
    this.manager = manager;
  }

  public async execute(
    input: unknown,
    context: AgentExecutionContext
  ): Promise<AgentExecutionResult> {
    const startTime = Date.now();
    const payload = (input as Record<string, any>) || {};
    const action = payload.action || 'list_attestations';
    const user = context.userId || 'dwight';

    try {
      switch (action) {
        case 'verify_action': {
          if (!payload.actionName) throw new Error('Field "actionName" is required for verify_action.');
          const attestation = this.manager.verifyAction(
            payload.actionName,
            payload.checks || [],
            payload.runtimePayload,
            user
          );
          return {
            success: true,
            agentId: this.definition.id,
            data: attestation,
            executionTimeMs: Date.now() - startTime,
          };
        }

        case 'collect_evidence': {
          if (!payload.check) throw new Error('Field "check" is required for collect_evidence.');
          const item = this.manager.collectSingleEvidence(payload.check, payload.runtimePayload, user);
          return {
            success: true,
            agentId: this.definition.id,
            data: item,
            executionTimeMs: Date.now() - startTime,
          };
        }

        case 'audit_hallucination': {
          if (!payload.claimText) throw new Error('Field "claimText" is required for audit_hallucination.');
          const audit = this.manager.auditHallucination(
            {
              claimText: payload.claimText,
              groundingSources: payload.groundingSources || [],
              strictness: payload.strictness || 'standard',
            },
            user
          );
          return {
            success: true,
            agentId: this.definition.id,
            data: audit,
            executionTimeMs: Date.now() - startTime,
          };
        }

        case 'diagnose_failure': {
          const diagnosis = this.manager.diagnoseFailure(
            payload.failedChecks || [],
            payload.actionName || 'unknown_action'
          );
          return {
            success: true,
            agentId: this.definition.id,
            data: diagnosis,
            executionTimeMs: Date.now() - startTime,
          };
        }

        case 'retry_loop': {
          const loopResult = await this.manager.executeAutoRetryLoop(
            payload.actionName || 'retried_action',
            async (attempt) => payload.executionHandler ? payload.executionHandler(attempt) : { attempt, ok: true },
            payload.checks || [],
            payload.maxAttempts || 3,
            user
          );
          return {
            success: true,
            agentId: this.definition.id,
            data: loopResult,
            executionTimeMs: Date.now() - startTime,
          };
        }

        case 'get_attestation': {
          if (!payload.attestationId) throw new Error('Field "attestationId" is required.');
          const attestation = this.manager.getAttestation(payload.attestationId, user);
          return {
            success: true,
            agentId: this.definition.id,
            data: attestation,
            executionTimeMs: Date.now() - startTime,
          };
        }

        case 'list_attestations': {
          const list = this.manager.listAttestations(
            {
              passed: payload.passed,
              actionName: payload.actionName,
              limit: payload.limit,
            },
            user
          );
          return {
            success: true,
            agentId: this.definition.id,
            data: { attestations: list, total: list.length },
            executionTimeMs: Date.now() - startTime,
          };
        }

        case 'generate_report': {
          const report = this.manager.generateAuditReport(user);
          return {
            success: true,
            agentId: this.definition.id,
            data: report,
            executionTimeMs: Date.now() - startTime,
          };
        }

        default:
          throw new Error(`Unknown verification action "${action}".`);
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
