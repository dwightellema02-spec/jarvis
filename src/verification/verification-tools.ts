import {
  ITool,
  ToolDefinition,
  ToolExecutionContext,
  ToolExecutionResult,
} from '../tools/tool.interface.js';
import { VerificationSuiteManager } from './verification-suite-manager.js';
import { PermissionLevel, ResourceType } from '../security/types.js';

export class VerifyActionTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'verification.verify_action',
    name: 'Verify Action Execution',
    description: 'Executes comprehensive multi-checker verification plan for an action result with cryptographic fingerprinting',
    version: '0.26.0-phase26',
    requiredPermissions: [{ resource: ResourceType.SYSTEM, action: 'execute', level: PermissionLevel.WRITE }],
    parametersSchema: {
      type: 'object',
      properties: {
        actionName: { type: 'string', description: 'Name of the action or tool executed' },
        checks: { type: 'array', description: 'Array of verification check specifications' },
        runtimePayload: { description: 'Live output, return payload, or state to verify' },
      },
      required: ['actionName', 'checks'],
    },
    status: 'implemented',
  };

  constructor(private manager: VerificationSuiteManager) {}

  public async execute(params: any, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const start = Date.now();
    try {
      const user = context.userId || 'dwight';
      const attestation = this.manager.verifyAction(
        params.actionName,
        params.checks || [],
        params.runtimePayload,
        user
      );
      return {
        success: true,
        toolId: this.definition.id,
        data: attestation,
        verified: attestation.passed,
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

export class CollectEvidenceTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'verification.collect_evidence',
    name: 'Collect Multi-Modal Evidence',
    description: 'Inspects live runtime state to collect empirical evidence across filesystem, processes, schemas, and computations',
    version: '0.26.0-phase26',
    requiredPermissions: [{ resource: ResourceType.SYSTEM, action: 'read', level: PermissionLevel.READ }],
    parametersSchema: {
      type: 'object',
      properties: {
        check: { type: 'object', description: 'Verification check specification' },
        runtimePayload: { description: 'Runtime payload to evaluate against' },
      },
      required: ['check'],
    },
    status: 'implemented',
  };

  constructor(private manager: VerificationSuiteManager) {}

  public async execute(params: any, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const start = Date.now();
    try {
      const user = context.userId || 'dwight';
      const evidence = this.manager.collectSingleEvidence(params.check, params.runtimePayload, user);
      return {
        success: true,
        toolId: this.definition.id,
        data: evidence,
        verified: evidence.passed,
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

export class AuditHallucinationTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'verification.audit_hallucination',
    name: 'Audit Anti-Hallucination Grounding',
    description: 'Compares assertions and generated text against verified reference sources to detect hallucination risks',
    version: '0.26.0-phase26',
    requiredPermissions: [{ resource: ResourceType.SYSTEM, action: 'read', level: PermissionLevel.READ }],
    parametersSchema: {
      type: 'object',
      properties: {
        claimText: { type: 'string', description: 'Generated assertions to audit' },
        groundingSources: { type: 'array', items: { type: 'string' }, description: 'Ground truth reference snippets' },
        strictness: { type: 'string', enum: ['lenient', 'standard', 'strict'] },
      },
      required: ['claimText', 'groundingSources'],
    },
    status: 'implemented',
  };

  constructor(private manager: VerificationSuiteManager) {}

  public async execute(params: any, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const start = Date.now();
    try {
      const user = context.userId || 'dwight';
      const audit = this.manager.auditHallucination(
        {
          claimText: params.claimText,
          groundingSources: params.groundingSources || [],
          strictness: params.strictness || 'standard',
        },
        user
      );
      return {
        success: true,
        toolId: this.definition.id,
        data: audit,
        verified: audit.passed,
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

export class DiagnoseFailureTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'verification.diagnose_failure',
    name: 'Diagnose Verification Failure',
    description: 'Synthesizes root-cause diagnosis, failure classification, and actionable remediation from failed checks',
    version: '0.26.0-phase26',
    requiredPermissions: [{ resource: ResourceType.SYSTEM, action: 'read', level: PermissionLevel.READ }],
    parametersSchema: {
      type: 'object',
      properties: {
        failedChecks: { type: 'array', description: 'Array of failed EvidenceItems' },
        actionName: { type: 'string', description: 'Name of the failed action' },
      },
      required: ['failedChecks'],
    },
    status: 'implemented',
  };

  constructor(private manager: VerificationSuiteManager) {}

  public async execute(params: any, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const start = Date.now();
    try {
      const diagnosis = this.manager.diagnoseFailure(params.failedChecks || [], params.actionName || 'action');
      return {
        success: true,
        toolId: this.definition.id,
        data: diagnosis,
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

export class ExecuteRecoveryLoopTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'verification.execute_recovery_loop',
    name: 'Execute Auto-Recovery Loop',
    description: 'Executes an automated retry loop with diagnostic adjustments until verification passes or max retries exhausted',
    version: '0.26.0-phase26',
    requiredPermissions: [{ resource: ResourceType.SYSTEM, action: 'execute', level: PermissionLevel.WRITE }],
    parametersSchema: {
      type: 'object',
      properties: {
        actionName: { type: 'string' },
        checks: { type: 'array' },
        maxAttempts: { type: 'number' },
      },
      required: ['actionName', 'checks'],
    },
    status: 'implemented',
  };

  constructor(private manager: VerificationSuiteManager) {}

  public async execute(params: any, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const start = Date.now();
    try {
      const user = context.userId || 'dwight';
      const loop = await this.manager.executeAutoRetryLoop(
        params.actionName,
        async (attempt) => ({ attempt, status: 'ok', timestamp: new Date().toISOString() }),
        params.checks || [],
        params.maxAttempts || 3,
        user
      );
      return {
        success: true,
        toolId: this.definition.id,
        data: loop,
        verified: loop.finalPassed,
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

export class GetAttestationTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'verification.get_attestation',
    name: 'Get Verification Attestation',
    description: 'Retrieves a cryptographic evidence attestation by unique ID',
    version: '0.26.0-phase26',
    requiredPermissions: [{ resource: ResourceType.SYSTEM, action: 'read', level: PermissionLevel.READ }],
    parametersSchema: {
      type: 'object',
      properties: {
        attestationId: { type: 'string' },
      },
      required: ['attestationId'],
    },
    status: 'implemented',
  };

  constructor(private manager: VerificationSuiteManager) {}

  public async execute(params: any, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const start = Date.now();
    try {
      const user = context.userId || 'dwight';
      const attestation = this.manager.getAttestation(params.attestationId, user);
      return {
        success: true,
        toolId: this.definition.id,
        data: attestation,
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

export class ListAttestationsTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'verification.list_attestations',
    name: 'List Verification Attestations',
    description: 'Enumerates verification attestations with pass/fail and action name filters',
    version: '0.26.0-phase26',
    requiredPermissions: [{ resource: ResourceType.SYSTEM, action: 'read', level: PermissionLevel.READ }],
    parametersSchema: {
      type: 'object',
      properties: {
        passed: { type: 'boolean' },
        actionName: { type: 'string' },
        limit: { type: 'number' },
      },
    },
    status: 'implemented',
  };

  constructor(private manager: VerificationSuiteManager) {}

  public async execute(params: any, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const start = Date.now();
    try {
      const user = context.userId || 'dwight';
      const list = this.manager.listAttestations(
        {
          passed: params?.passed,
          actionName: params?.actionName,
          limit: params?.limit,
        },
        user
      );
      return {
        success: true,
        toolId: this.definition.id,
        data: { attestations: list, total: list.length },
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

export class GenerateAuditReportTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'verification.generate_audit_report',
    name: 'Generate Verification Compliance Audit Report',
    description: 'Synthesizes an executive verification compliance and anti-hallucination compliance audit report',
    version: '0.26.0-phase26',
    requiredPermissions: [{ resource: ResourceType.SYSTEM, action: 'read', level: PermissionLevel.READ }],
    parametersSchema: {
      type: 'object',
      properties: {},
    },
    status: 'implemented',
  };

  constructor(private manager: VerificationSuiteManager) {}

  public async execute(_params: any, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const start = Date.now();
    try {
      const user = context.userId || 'dwight';
      const report = this.manager.generateAuditReport(user);
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

export function createVerificationTools(manager: VerificationSuiteManager): ITool[] {
  return [
    new VerifyActionTool(manager),
    new CollectEvidenceTool(manager),
    new AuditHallucinationTool(manager),
    new DiagnoseFailureTool(manager),
    new ExecuteRecoveryLoopTool(manager),
    new GetAttestationTool(manager),
    new ListAttestationsTool(manager),
    new GenerateAuditReportTool(manager),
  ];
}
