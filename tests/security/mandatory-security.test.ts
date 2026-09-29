import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/server/app.js';
import { PermissionManager } from '../../src/security/permission-manager.js';
import { PermissionLevel, ResourceType } from '../../src/security/types.js';
import { InMemorySecurityEventSink, SecurityEventType } from '../../src/security/security-event.js';
import { sanitizeData, isSensitiveKey, REDACTED_PLACEHOLDER } from '../../src/security/sanitizer.js';

describe('Phase 0 Mandatory Security Test Cases (Section 33)', () => {
  let permissionManager: PermissionManager;
  let eventSink: InMemorySecurityEventSink;

  beforeEach(() => {
    eventSink = new InMemorySecurityEventSink();
    permissionManager = new PermissionManager(eventSink);
  });

  /**
   * Test 1: Unauthorized action
   * Permission = DENIED
   * Action = EXECUTE
   * Expected = BLOCK / DENY
   */
  it('Test 1: Unauthorized action: Permission = DENIED, Action = EXECUTE -> Expected = BLOCK', () => {
    // User 'alice' has NO grant for APPLICATIONS
    const check = permissionManager.checkPermission({
      userId: 'alice',
      resource: ResourceType.APPLICATIONS,
      action: 'execute',
      requiredLevel: PermissionLevel.EXECUTE,
    });

    expect(check.allowed).toBe(false);
    expect(check.decision).toBe('DENY');
    expect(check.reason).toContain('Default Deny');
  });

  /**
   * Test 2: Authorized action
   * Permission = EXECUTE
   * Action = EXECUTE
   * Expected = ALLOW
   */
  it('Test 2: Authorized action: Permission = EXECUTE, Action = EXECUTE -> Expected = ALLOW', () => {
    // Explicitly grant EXECUTE permission on APPLICATIONS to user 'bob'
    permissionManager.grantPermission({
      userId: 'bob',
      resource: ResourceType.APPLICATIONS,
      level: PermissionLevel.EXECUTE,
      allowedActions: ['execute'],
      grantedBy: 'admin_root',
    });

    const check = permissionManager.checkPermission({
      userId: 'bob',
      resource: ResourceType.APPLICATIONS,
      action: 'execute',
      requiredLevel: PermissionLevel.EXECUTE,
    });

    expect(check.allowed).toBe(true);
    expect(check.decision).toBe('ALLOW');
    expect(check.grantedLevel).toBe(PermissionLevel.EXECUTE);
  });

  /**
   * Test 3: Unknown permission
   * Permission = UNKNOWN
   * Expected = DENY
   */
  it('Test 3: Unknown permission: Permission = UNKNOWN -> Expected = DENY', async () => {
    const check = permissionManager.checkPermission({
      userId: 'carol',
      resource: ResourceType.FILES,
      action: 'read',
      requiredLevel: 'UNKNOWN_PERM_LEVEL' as any,
    });

    expect(check.allowed).toBe(false);
    expect(check.decision).toBe('DENY');
    expect(check.reason).toContain('Invalid or unknown permission level');

    const secEvents = await eventSink.query();
    const failureEvent = secEvents.find((e) => e.type === SecurityEventType.AUTHORIZATION_FAILURE);
    expect(failureEvent).toBeDefined();
  });

  /**
   * Test 4: Sensitive resource without authorization
   * Expected = DENY
   */
  it('Test 4: Sensitive resource without authorization -> Expected = DENY', () => {
    const sensitiveResources = [
      ResourceType.CAMERA,
      ResourceType.MICROPHONE,
      ResourceType.FINANCIAL_SERVICES,
      ResourceType.EXTERNAL_ACCOUNTS,
      ResourceType.DEVICES,
    ];

    for (const resource of sensitiveResources) {
      const check = permissionManager.checkPermission({
        userId: 'unauthorized_user',
        resource,
        action: 'read',
        requiredLevel: PermissionLevel.READ,
      });

      expect(check.allowed).toBe(false);
      expect(check.decision).toBe('DENY');
      expect(check.reason).toContain('Default Deny');
    }
  });

  /**
   * Test 5: Invalid authentication
   * Expected = AUTHENTICATION_ERROR
   */
  it('Test 5: Invalid authentication -> Expected = AUTHENTICATION_ERROR (401)', async () => {
    const { app } = createApp();

    // 1. Send request with bad bearer token
    const res1 = await request(app)
      .get('/api/jarvis/status')
      .set('Authorization', 'Bearer invalid');

    expect(res1.status).toBe(401);
    expect(res1.body.code).toBe('AUTHENTICATION_ERROR');

    // 2. Send request to endpoint requiring auth without header
    const res2 = await request(app)
      .get('/api/jarvis/status')
      .set('x-require-auth', 'true');

    expect(res2.status).toBe(401);
    expect(res2.body.code).toBe('AUTHENTICATION_ERROR');
  });

  /**
   * Test 6: Permission escalation attempt
   * Expected = BLOCK
   */
  it('Test 6: Permission escalation attempt: user with READ trying EXECUTE -> Expected = BLOCK', () => {
    // User 'dave' is only granted READ permission on FILES
    permissionManager.grantPermission({
      userId: 'dave',
      resource: ResourceType.FILES,
      level: PermissionLevel.READ,
      allowedActions: ['read'],
      grantedBy: 'system',
    });

    // Dave attempts to execute an action requiring EXECUTE permission
    const check = permissionManager.checkPermission({
      userId: 'dave',
      resource: ResourceType.FILES,
      action: 'execute',
      requiredLevel: PermissionLevel.EXECUTE,
    });

    expect(check.allowed).toBe(false);
    expect(check.decision).toBe('DENY');
    expect(check.reason).toContain('highest granted level is');
    expect(check.grantedLevel).toBe(PermissionLevel.READ);
    expect(check.requiredLevel).toBe(PermissionLevel.EXECUTE);
  });

  /**
   * Test 7: Secret exposure
   * Ensure API keys and credentials do not appear in normal logs or API responses.
   */
  it('Test 7: Secret exposure: credentials and API keys are redacted and never leaked', async () => {
    // 1. Sanitizer unit test
    expect(isSensitiveKey('apiKey')).toBe(true);
    expect(isSensitiveKey('api_key')).toBe(true);
    expect(isSensitiveKey('password')).toBe(true);
    expect(isSensitiveKey('secretToken')).toBe(true);

    const payloadWithSecrets = {
      user: 'alice',
      apiKey: 'sk-1234567890abcdef1234567890',
      password: 'SuperSecretPassword!',
      nested: {
        authorization: 'Bearer secret_token_xyz_987654321',
        publicNote: 'This is public',
      },
      list: ['safe_item', 'Bearer secret_value_1234567890'],
    };

    const sanitized = sanitizeData(payloadWithSecrets);

    expect(sanitized.apiKey).toBe(REDACTED_PLACEHOLDER);
    expect(sanitized.password).toBe(REDACTED_PLACEHOLDER);
    expect(sanitized.nested.authorization).toBe(REDACTED_PLACEHOLDER);
    expect(sanitized.nested.publicNote).toBe('This is public');
    expect(sanitized.list[1]).toBe(REDACTED_PLACEHOLDER);

    // 2. API Health check verification: verify no secrets leaked
    const { app } = createApp();
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    const bodyStr = JSON.stringify(res.body);
    expect(bodyStr).not.toContain('API_KEY');
    expect(bodyStr).not.toContain('sk-');
    expect(bodyStr).not.toContain('password');
  });
});
