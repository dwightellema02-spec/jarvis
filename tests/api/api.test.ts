import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/server/app.js';
import { ResourceType, PermissionLevel } from '../../src/security/types.js';

describe('JARVIS HTTP API Endpoints Tests', () => {
  const { app } = createApp();

  it('GET /api/health returns operational status without leaking secrets', async () => {
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('jarvis');
    expect(res.body.architecture.guardianActive).toBe(true);
    expect(res.body.architecture.permissionManagerActive).toBe(true);

    const stringified = JSON.stringify(res.body);
    expect(stringified).not.toContain('API_KEY');
    expect(stringified).not.toContain('password');
  });

  it('GET /api/jarvis/status returns system architecture and subsystem metrics', async () => {
    const res = await request(app).get('/api/jarvis/status');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('operational');
    expect(res.body.subsystems.agentRegistry.registeredAgentsCount).toBe(21);
    expect(res.body.subsystems.toolRegistry.registeredToolsCount).toBeGreaterThan(15);
  });

  it('GET /api/agents returns modular agent definitions', async () => {
    const res = await request(app).get('/api/agents');

    expect(res.status).toBe(200);
    expect(res.body.total).toBe(21);
    expect(res.body.agents).toBeInstanceOf(Array);
  });

  it('GET /api/tools returns tools with required permission declarations', async () => {
    const res = await request(app).get('/api/tools');

    expect(res.status).toBe(200);
    expect(res.body.total).toBeGreaterThan(15);
    const terminalTool = res.body.tools.find((t: any) => t.id === 'terminal.execute');
    expect(terminalTool).toBeDefined();
    expect(terminalTool.requiredPermissions[0].level).toBe('EXECUTE');
  });

  it('handles permission check and grant workflow over HTTP', async () => {
    // 1. Initial check (unauthorized user on FILES) -> 403 Forbidden
    const check1 = await request(app)
      .post('/api/permissions/check')
      .send({
        userId: 'student_42',
        resource: ResourceType.FILES,
        action: 'write',
        requiredLevel: PermissionLevel.WRITE,
      });

    expect(check1.status).toBe(403);
    expect(check1.body.allowed).toBe(false);

    // 2. Grant permission
    const grantRes = await request(app)
      .post('/api/permissions/grant')
      .send({
        userId: 'student_42',
        resource: ResourceType.FILES,
        level: PermissionLevel.WRITE,
        allowedActions: ['write'],
        grantedBy: 'administrator',
      });

    expect(grantRes.status).toBe(201);
    expect(grantRes.body.grant.id).toBeDefined();

    // 3. Check again -> 200 Allowed
    const check2 = await request(app)
      .post('/api/permissions/check')
      .send({
        userId: 'student_42',
        resource: ResourceType.FILES,
        action: 'write',
        requiredLevel: PermissionLevel.WRITE,
      });

    expect(check2.status).toBe(200);
    expect(check2.body.allowed).toBe(true);
  });

  it('POST /api/jarvis/process rejects requests missing input text', async () => {
    const res = await request(app)
      .post('/api/jarvis/process')
      .send({
        userId: 'user_1',
      });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });

  it('POST /api/jarvis/process processes a safe request successfully', async () => {
    const res = await request(app)
      .post('/api/jarvis/process')
      .send({
        userId: 'user_1',
        input: { text: 'What is the current system architecture?' },
      });

    expect(res.status).toBe(200);
    expect(res.body.requestId).toBeDefined();
    expect(res.body.verificationResult.verified).toBe(true);
  });
});
