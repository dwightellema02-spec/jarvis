import { describe, it, expect, beforeEach } from 'vitest';
import { Orchestrator } from '../../src/orchestrator/orchestrator.js';
import { AgentRegistry } from '../../src/agents/agent-registry.js';
import { ToolRegistry } from '../../src/tools/tool-registry.js';
import { PermissionManager } from '../../src/security/permission-manager.js';
import { SecurityGuardian } from '../../src/security/guardian.js';
import { AuditLogger } from '../../src/audit/audit-logger.js';
import { InMemorySecurityEventSink } from '../../src/security/security-event.js';
import { ResourceType, PermissionLevel } from '../../src/security/types.js';
import { ITool, ToolDefinition } from '../../src/tools/tool.interface.js';
import { RiskLevel } from '../../src/orchestrator/types.js';

describe('Phase 2 Orchestrator End-to-End Tests', () => {
  let orchestrator: Orchestrator;
  let agentRegistry: AgentRegistry;
  let toolRegistry: ToolRegistry;
  let permissionManager: PermissionManager;
  let guardian: SecurityGuardian;
  let auditLogger: AuditLogger;

  beforeEach(() => {
    const eventSink = new InMemorySecurityEventSink();
    permissionManager = new PermissionManager(eventSink);
    guardian = new SecurityGuardian(undefined, eventSink);
    auditLogger = new AuditLogger();
    agentRegistry = new AgentRegistry();
    toolRegistry = new ToolRegistry();

    orchestrator = new Orchestrator({
      agentRegistry,
      toolRegistry,
      permissionManager,
      guardian,
      auditLogger,
    });
  });

  it('orchestrates a safe, low-risk query successfully with verification', async () => {
    // User 'alice' has read permission on projects
    permissionManager.grantPermission({
      userId: 'alice',
      resource: ResourceType.PROJECTS,
      level: PermissionLevel.READ,
      allowedActions: ['read'],
      grantedBy: 'system',
    });

    const result = await orchestrator.orchestrate('req_orch_1', 'Review project roadmap', 'alice');

    expect(result.success).toBe(true);
    expect(result.overallRisk).toBe(RiskLevel.LOW);
    expect(result.stepsExecuted).toBe(1);
    expect(result.stepResults[0].status).toBe('COMPLETED');
    expect(result.stepResults[0].verification?.verified).toBe(true);
  });

  it('blocks step with BLOCKED_BY_PERMISSION when authorization is absent', async () => {
    // User 'bob' has NO write permission
    const result = await orchestrator.orchestrate('req_orch_2', 'Create file in project', 'bob', {
      explicitSteps: [
        {
          id: 'step_write',
          name: 'Write File',
          resource: ResourceType.FILES,
          action: 'write',
          requiredPermissionLevel: PermissionLevel.WRITE,
          parameters: { path: 'test.txt' },
        },
      ],
    });

    expect(result.success).toBe(false);
    expect(result.stepResults[0].status).toBe('BLOCKED_BY_PERMISSION');
    expect(result.stepResults[0].error).toContain('Default Deny');
  });

  it('gates HIGH risk actions unless user explicit confirmation is provided', async () => {
    // User 'charlie' has EXECUTE permission on APPLICATIONS
    permissionManager.grantPermission({
      userId: 'charlie',
      resource: ResourceType.APPLICATIONS,
      level: PermissionLevel.EXECUTE,
      allowedActions: ['execute'],
      grantedBy: 'admin',
    });

    // 1. Without confirmation -> BLOCKED_BY_RISK
    const unconfirmedResult = await orchestrator.orchestrate('req_orch_3', 'Execute test suite', 'charlie', {
      explicitSteps: [
        {
          id: 'step_exec',
          name: 'Run Test Command',
          resource: ResourceType.APPLICATIONS,
          action: 'execute',
          riskLevel: RiskLevel.HIGH,
          requiredPermissionLevel: PermissionLevel.EXECUTE,
          parameters: { command: 'npm test' },
        },
      ],
      userConfirmedHighRisk: false, // NOT confirmed
    });

    expect(unconfirmedResult.success).toBe(false);
    expect(unconfirmedResult.stepResults[0].status).toBe('BLOCKED_BY_RISK');
    expect(unconfirmedResult.stepResults[0].error).toContain('requires explicit user confirmation');
  });

  it('executes and verifies an authorized tool when implemented and confirmed', async () => {
    // Register a real implemented tool for test verification
    const testToolDef: ToolDefinition = {
      id: 'calculator.verified',
      name: 'Verified Math Tool',
      description: 'Calculates values and verifies accuracy',
      requiredPermissions: [{ resource: ResourceType.APIS, action: 'read', level: PermissionLevel.READ }],
      parametersSchema: {},
      status: 'implemented',
      version: '1.0.0',
    };

    const mockTool: ITool = {
      definition: testToolDef,
      execute: async () => ({
        success: true,
        toolId: 'calculator.verified',
        verified: true,
        data: { answer: 42 },
        executionTimeMs: 2,
      }),
    };

    toolRegistry.registerImplementation(mockTool);

    // Grant permission
    permissionManager.grantPermission({
      userId: 'dave',
      resource: ResourceType.APIS,
      level: PermissionLevel.READ,
      allowedActions: ['read'],
      grantedBy: 'system',
    });

    const result = await orchestrator.orchestrate('req_orch_4', 'Compute formula', 'dave', {
      explicitSteps: [
        {
          id: 'step_calc',
          name: 'Calculate Answer',
          toolId: 'calculator.verified',
          resource: ResourceType.APIS,
          action: 'read',
          riskLevel: RiskLevel.LOW,
          requiredPermissionLevel: PermissionLevel.READ,
          parameters: { expr: '6 * 7' },
        },
      ],
    });

    expect(result.success).toBe(true);
    expect(result.stepResults[0].status).toBe('COMPLETED');
    expect(result.stepResults[0].verification?.verified).toBe(true);
    expect((result.stepResults[0].result as any).answer).toBe(42);
  });

  it('honestly blocks un-implemented capabilities with BLOCKED_BY_LIMITATION (No Fake Done)', async () => {
    const result = await orchestrator.orchestrate('req_orch_5', 'Access physical camera stream', 'user_1');

    expect(result.success).toBe(false);
    expect(result.stepResults[0].status).toBe('BLOCKED_BY_LIMITATION');
    expect(result.limitationsReported.length).toBeGreaterThan(0);
    expect(result.limitationsReported[0].capability).toBe('device-agent');
  });

  it('enforces CRITICAL risk blocking on financial actions', async () => {
    const result = await orchestrator.orchestrate('req_orch_6', 'Transfer $1,000 to bank account', 'user_2');

    expect(result.success).toBe(false);
    expect(result.overallRisk).toBe(RiskLevel.CRITICAL);
    expect(result.stepResults[0].status).toBe('BLOCKED_BY_LIMITATION');
  });
});
