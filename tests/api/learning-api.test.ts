import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/server/app.js';
import { Express } from 'express';

describe('Phase 27 — Self-Correction & Learning Loop REST API Tests', () => {
  let app: Express;

  beforeEach(() => {
    const created = createApp();
    app = created.app;
  });

  describe('GET /api/jarvis/learning/incidents', () => {
    it('returns 200 with list of failure incidents', async () => {
      const res = await request(app)
        .get('/api/jarvis/learning/incidents')
        .set('x-user-id', 'dwight');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBeGreaterThanOrEqual(3);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data[0]).toHaveProperty('actionName');
      expect(res.body.data[0]).toHaveProperty('errorMessage');
    });

    it('filters incidents by action', async () => {
      const res = await request(app)
        .get('/api/jarvis/learning/incidents?action=math.solve_polynomial')
        .set('x-user-id', 'dwight');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.every((i: any) => i.actionName.includes('math.solve_polynomial'))).toBe(true);
    });
  });

  describe('POST /api/jarvis/learning/incidents', () => {
    it('returns 200 and synthesizes heuristic when incident is posted', async () => {
      const res = await request(app)
        .post('/api/jarvis/learning/incidents')
        .set('x-user-id', 'dwight')
        .send({
          actionName: 'test.run_integration',
          errorMessage: 'Port 8080 already bound to PID 4120',
          errorType: 'PortCollision',
          rootCauseCategory: 'execution_fault',
          severity: 'high',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('incident');
      expect(res.body.data).toHaveProperty('rule');
      expect(res.body.data.incident.actionName).toBe('test.run_integration');
      expect(res.body.data.rule.targetActions).toContain('test.run_integration');
    });

    it('returns 400 when required fields are missing', async () => {
      const res = await request(app)
        .post('/api/jarvis/learning/incidents')
        .set('x-user-id', 'dwight')
        .send({ actionName: 'partial.action' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('errorMessage');
    });
  });

  describe('GET /api/jarvis/learning/incidents/:id', () => {
    it('returns 200 with incident details for existing incident', async () => {
      const res = await request(app)
        .get('/api/jarvis/learning/incidents/inc_seed_math_01')
        .set('x-user-id', 'dwight');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe('inc_seed_math_01');
      expect(res.body.data.actionName).toBe('math.solve_polynomial');
    });

    it('returns 404 when incident does not exist', async () => {
      const res = await request(app)
        .get('/api/jarvis/learning/incidents/inc_nonexistent_xyz')
        .set('x-user-id', 'dwight');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/jarvis/learning/rules', () => {
    it('returns 200 with list of active learned rules', async () => {
      const res = await request(app)
        .get('/api/jarvis/learning/rules')
        .set('x-user-id', 'dwight');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBeGreaterThanOrEqual(3);
      expect(res.body.data[0]).toHaveProperty('directive');
      expect(res.body.data[0]).toHaveProperty('confidence');
    });

    it('filters rules by status and targetAction', async () => {
      const res = await request(app)
        .get('/api/jarvis/learning/rules?status=active&targetAction=math.solve_polynomial')
        .set('x-user-id', 'dwight');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBeGreaterThanOrEqual(1);
      expect(res.body.data[0].id).toBe('rule_seed_math_01');
    });
  });

  describe('GET /api/jarvis/learning/rules/:id', () => {
    it('returns 200 with rule details for valid rule ID', async () => {
      const res = await request(app)
        .get('/api/jarvis/learning/rules/rule_seed_math_01')
        .set('x-user-id', 'dwight');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe('rule_seed_math_01');
      expect(res.body.data.confidence).toBeGreaterThan(0.9);
    });

    it('returns 404 for unknown rule ID', async () => {
      const res = await request(app)
        .get('/api/jarvis/learning/rules/rule_nonexistent_xyz')
        .set('x-user-id', 'dwight');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/jarvis/learning/guardrails', () => {
    it('returns 200 with matching guardrails and clamped parameters', async () => {
      const res = await request(app)
        .post('/api/jarvis/learning/guardrails')
        .set('x-user-id', 'dwight')
        .send({
          actionName: 'math.solve_polynomial',
          params: { n: 80, variable: 'x' },
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.matchedRules.length).toBeGreaterThan(0);
      expect(res.body.data.parameterAdjustments.n).toBe(50);
      expect(res.body.data.warnings.length).toBeGreaterThan(0);
    });

    it('returns 400 when actionName is missing', async () => {
      const res = await request(app)
        .post('/api/jarvis/learning/guardrails')
        .set('x-user-id', 'dwight')
        .send({ params: {} });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/jarvis/learning/correction-plan', () => {
    it('returns 200 with synthesized correction plan', async () => {
      const res = await request(app)
        .post('/api/jarvis/learning/correction-plan')
        .set('x-user-id', 'dwight')
        .send({
          incidentId: 'inc_seed_math_01',
          originalParams: { n: 75 },
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.incidentId).toBe('inc_seed_math_01');
      expect(res.body.data.adjustedParams.n).toBe(50);
      expect(res.body.data.appliedRules.length).toBeGreaterThan(0);
    });

    it('returns 400 when incidentId is missing', async () => {
      const res = await request(app)
        .post('/api/jarvis/learning/correction-plan')
        .set('x-user-id', 'dwight')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/jarvis/learning/rules/:id/feedback', () => {
    it('returns 200 and adjusts rule confidence based on feedback', async () => {
      const res = await request(app)
        .post('/api/jarvis/learning/rules/rule_seed_data_02/feedback')
        .set('x-user-id', 'dwight')
        .send({ succeeded: true });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.timesApplied).toBeGreaterThan(21);
      expect(res.body.data.timesSucceeded).toBeGreaterThan(21);
    });

    it('returns 400 when succeeded flag is omitted', async () => {
      const res = await request(app)
        .post('/api/jarvis/learning/rules/rule_seed_data_02/feedback')
        .set('x-user-id', 'dwight')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/jarvis/learning/report', () => {
    it('returns 200 with comprehensive learning evolution telemetry', async () => {
      const res = await request(app)
        .get('/api/jarvis/learning/report')
        .set('x-user-id', 'dwight');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalIncidents).toBeGreaterThanOrEqual(3);
      expect(res.body.data.activeRules).toBeGreaterThanOrEqual(3);
      expect(res.body.data.recurrenceRatePercent).toBe(0.0);
      expect(res.body.data.learningVelocityScore).toBeGreaterThan(0);
      expect(res.body.data.activeDirectiveSummary.length).toBeGreaterThan(0);
    });
  });
});
