import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/server/app.js';
import { ResourceType, PermissionLevel } from '../../src/security/types.js';

describe('Phase 2 Orchestration HTTP API Tests', () => {
  const { app, core } = createApp();

  it('GET /api/jarvis/status reports Phase 2 Orchestrator and risk model', async () => {
    const res = await request(app).get('/api/jarvis/status');

    expect(res.status).toBe(200);
    expect(res.body.architecture).toContain('Phase 2 — The Orchestrator');
    expect(res.body.subsystems.orchestrator.active).toBe(true);
    expect(res.body.subsystems.orchestrator.verificationEngineActive).toBe(true);
    expect(res.body.subsystems.orchestrator.riskModel).toContain('CRITICAL');
  });

  it('POST /api/jarvis/orchestrate validates input goal', async () => {
    const res = await request(app)
      .post('/api/jarvis/orchestrate')
      .send({ goal: '' });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });

  it('POST /api/jarvis/orchestrate executes a low-risk conversational task successfully', async () => {
    core.getPermissionManager().grantPermission({
      userId: 'dwight',
      resource: ResourceType.PROJECTS,
      level: PermissionLevel.READ,
      allowedActions: ['read'],
      grantedBy: 'system',
    });

    const res = await request(app)
      .post('/api/jarvis/orchestrate')
      .send({
        goal: 'Review Tuklas learning platform objectives',
        userId: 'dwight',
      });

    expect(res.status).toBe(200);
    expect(res.body.planId).toBeDefined();
    expect(res.body.overallRisk).toBe('LOW');
    expect(res.body.success).toBe(true);
    expect(res.body.stepsExecuted).toBe(1);
  });

  it('POST /api/jarvis/orchestrate correctly flags high-risk operations', async () => {
    const res = await request(app)
      .post('/api/jarvis/orchestrate')
      .send({
        goal: 'Run test command',
        userId: 'dwight',
        explicitSteps: [
          {
            id: 'step_cmd',
            name: 'Run Shell Command',
            resource: ResourceType.APPLICATIONS,
            action: 'execute',
            parameters: { command: 'npm test' },
          },
        ],
        userConfirmedHighRisk: false,
      });

    expect(res.status).toBe(200);
    expect(res.body.overallRisk).toBe('HIGH');
    expect(res.body.success).toBe(false);
    expect(res.body.stepResults[0].status).toBe('BLOCKED_BY_RISK');
  });
});
