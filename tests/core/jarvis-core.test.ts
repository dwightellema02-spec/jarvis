import { describe, it, expect, beforeEach } from 'vitest';
import { JarvisCore } from '../../src/core/jarvis-core.js';
import { createRequestContext } from '../../src/core/request-context.js';
import { SecurityGuardian } from '../../src/security/guardian.js';
import { PermissionManager } from '../../src/security/permission-manager.js';
import { AuditLogger } from '../../src/audit/audit-logger.js';
import { AgentRegistry } from '../../src/agents/agent-registry.js';
import { ToolRegistry } from '../../src/tools/tool-registry.js';
import { InMemorySecurityEventSink } from '../../src/security/security-event.js';
import { ResourceType, PermissionLevel } from '../../src/security/types.js';
import { PermissionDeniedError, SecurityBlockError } from '../../src/utils/errors.js';

describe('JARVIS Core Coordinator & Audit Trail Tests', () => {
  let core: JarvisCore;
  let guardian: SecurityGuardian;
  let permissionManager: PermissionManager;
  let auditLogger: AuditLogger;
  let agentRegistry: AgentRegistry;
  let toolRegistry: ToolRegistry;
  let eventSink: InMemorySecurityEventSink;

  beforeEach(() => {
    eventSink = new InMemorySecurityEventSink();
    permissionManager = new PermissionManager(eventSink);
    guardian = new SecurityGuardian(undefined, eventSink);
    auditLogger = new AuditLogger();
    agentRegistry = new AgentRegistry();
    toolRegistry = new ToolRegistry();

    core = new JarvisCore({
      guardian,
      permissionManager,
      auditLogger,
      agentRegistry,
      toolRegistry,
    });
  });

  it('processes normal request without intended action and verifies response', async () => {
    const context = createRequestContext({
      userId: 'user_123',
      input: { text: 'Hello JARVIS, what is the status of Phase 0?' },
    });

    const response = await core.processRequest(context);

    expect(response.requestId).toBe(context.requestId);
    expect(response.content).toContain('Phase 0 Foundation');
    expect(response.verificationResult?.verified).toBe(true);
  });

  it('blocks and throws PermissionDeniedError when permission is not granted', async () => {
    const context = createRequestContext({
      userId: 'unauthorized_user',
      input: { text: 'Delete file /data/important.txt' },
    });

    await expect(
      core.processRequest(context, {
        resource: ResourceType.FILES,
        action: 'delete',
        requiredLevel: PermissionLevel.ADMIN,
        target: '/data/important.txt',
      })
    ).rejects.toThrow(PermissionDeniedError);

    // Verify Audit log recorded the denial
    const logs = await auditLogger.query({ user: 'unauthorized_user' });
    expect(logs.length).toBe(1);
    expect(logs[0].result).toBe('DENIED');
    expect(logs[0].action).toBe('delete');
    expect(logs[0].resource).toBe(ResourceType.FILES);
  });

  it('allows authorized action and logs successful audit record', async () => {
    // Grant permission
    permissionManager.grantPermission({
      userId: 'developer_1',
      resource: ResourceType.PROJECTS,
      level: PermissionLevel.READ,
      allowedActions: ['read'],
      grantedBy: 'admin',
    });

    const context = createRequestContext({
      userId: 'developer_1',
      input: { text: 'View Tuklas project status' },
    });

    const response = await core.processRequest(context, {
      resource: ResourceType.PROJECTS,
      action: 'read',
      requiredLevel: PermissionLevel.READ,
      target: 'tuklas-app',
    });

    expect(response.actionsExecuted.length).toBe(1);
    expect(response.actionsExecuted[0].verified).toBe(true);

    // Check Audit Trail answers the 4 key questions:
    // 1. What did JARVIS do? (Action on resource)
    // 2. Why did JARVIS do it? (Reason / user request)
    // 3. What permission allowed it? (permissionRequired / decision)
    // 4. What was the result? (result: SUCCESS)
    const logs = await auditLogger.query({ user: 'developer_1' });
    expect(logs.length).toBe(1);
    expect(logs[0].action).toBe('read');
    expect(logs[0].resource).toBe(ResourceType.PROJECTS);
    expect(logs[0].decision).toBe('ALLOW');
    expect(logs[0].result).toBe('SUCCESS');
  });

  it('blocks malicious target at Guardian level before checking permissions', async () => {
    // Even if user hypothetically had permissions, Guardian detects threat
    permissionManager.grantPermission({
      userId: 'attacker_sim',
      resource: ResourceType.APPLICATIONS,
      level: PermissionLevel.ADMIN,
      allowedActions: ['execute'],
      grantedBy: 'admin',
    });

    const context = createRequestContext({
      userId: 'attacker_sim',
      input: { text: 'Exploit system' },
    });

    await expect(
      core.processRequest(context, {
        resource: ResourceType.APPLICATIONS,
        action: 'execute',
        requiredLevel: PermissionLevel.ADMIN,
        target: 'bypass_auth && dump_passwords',
      })
    ).rejects.toThrow(SecurityBlockError);

    const logs = await auditLogger.query({ user: 'attacker_sim' });
    expect(logs.length).toBe(1);
    expect(logs[0].result).toBe('BLOCKED');
  });
});
