import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/server/app.js';
import { Express } from 'express';

describe('Phase 26 — Verification Engine REST API Tests', () => {
  let app: Express;

  beforeEach(() => {
    const created = createApp();
    app = created.app;
  });

  describe('POST /api/jarvis/verification/verify', () => {
    it('returns 200 with verified attestation when checks pass', async () => {
      const res = await request(app)
        .post('/api/jarvis/verification/verify')
        .set('x-user-id', 'dwight')
        .send({
          actionName: 'api_action_test',
          checks: [
            { type: 'exit_code_zero', expected: 0 },
            { type: 'schema_valid', expected: ['code', 'data'] },
          ],
          runtimePayload: { exitCode: 0, code: 200, data: 'OK' },
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.passed).toBe(true);
      expect(res.body.data.totalChecks).toBe(2);
      expect(res.body.data.passedChecks).toBe(2);
      expect(res.body.data.fingerprint).toHaveLength(64);
    });

    it('returns 200 with failure diagnosis when checks fail', async () => {
      const res = await request(app)
        .post('/api/jarvis/verification/verify')
        .set('x-user-id', 'dwight')
        .send({
          actionName: 'api_action_failure_test',
          checks: [
            { type: 'exit_code_zero', expected: 0 },
            { type: 'schema_valid', expected: ['mandatoryField'] },
          ],
          runtimePayload: { exitCode: 1, wrongField: true },
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.passed).toBe(false);
      expect(res.body.data.failedChecks).toBeGreaterThanOrEqual(1);
      expect(res.body.data.diagnosis).toBeDefined();
    });

    it('returns 400 when required fields are missing', async () => {
      const res = await request(app)
        .post('/api/jarvis/verification/verify')
        .set('x-user-id', 'dwight')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/jarvis/verification/evidence', () => {
    it('returns 200 with single collected evidence item', async () => {
      const res = await request(app)
        .post('/api/jarvis/verification/evidence')
        .set('x-user-id', 'dwight')
        .send({
          check: { type: 'exit_code_zero', expected: 0 },
          runtimePayload: { exitCode: 0 },
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.passed).toBe(true);
      expect(res.body.data.checkType).toBe('exit_code_zero');
    });
  });

  describe('POST /api/jarvis/verification/hallucination-audit', () => {
    it('returns 200 with low risk for grounded assertions', async () => {
      const res = await request(app)
        .post('/api/jarvis/verification/hallucination-audit')
        .set('x-user-id', 'dwight')
        .send({
          claimText: 'Tuklas is an innovative EdTech platform for Filipino candidates.',
          groundingSources: [
            'Tuklas is an innovative EdTech platform for Filipino candidates preparing for competitive exams.',
          ],
          strictness: 'standard',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.passed).toBe(true);
      expect(res.body.data.hallucinationRisk).toBeLessThanOrEqual(0.30);
    });

    it('returns 200 with high risk for ungrounded claims', async () => {
      const res = await request(app)
        .post('/api/jarvis/verification/hallucination-audit')
        .set('x-user-id', 'dwight')
        .send({
          claimText: 'Ancient aliens constructed the pyramids in downtown Manhattan last Tuesday.',
          groundingSources: ['The pyramids are historic monuments situated in Giza, Egypt.'],
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.passed).toBe(false);
      expect(res.body.data.hallucinationRisk).toBeGreaterThan(0.30);
    });
  });

  describe('POST /api/jarvis/verification/diagnose', () => {
    it('returns 200 with root cause diagnosis from failed evidence items', async () => {
      const res = await request(app)
        .post('/api/jarvis/verification/diagnose')
        .set('x-user-id', 'dwight')
        .send({
          actionName: 'database.persist',
          failedChecks: [
            {
              checkType: 'schema_valid',
              target: 'user.record',
              expected: ['id', 'email'],
              actual: 'Missing email',
              passed: false,
              message: 'Missing email',
              timestamp: new Date().toISOString(),
            },
          ],
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.rootCauseCategory).toBe('schema_mismatch');
      expect(res.body.data.suggestedRemediation).toBeDefined();
    });
  });

  describe('POST /api/jarvis/verification/retry-loop', () => {
    it('returns 200 with auto-recovery loop resolving after retries', async () => {
      const res = await request(app)
        .post('/api/jarvis/verification/retry-loop')
        .set('x-user-id', 'dwight')
        .send({
          actionName: 'compiler.optimize_pass',
          checks: [{ type: 'schema_valid', expected: ['attempt', 'passed'] }],
          maxAttempts: 3,
          simulatedSuccessOnAttempt: 2,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.finalPassed).toBe(true);
      expect(res.body.data.attemptsUsed).toBe(2);
      expect(res.body.data.recoveryLog.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/jarvis/verification/attestations', () => {
    it('returns 200 with list of historical attestations', async () => {
      const res = await request(app)
        .get('/api/jarvis/verification/attestations')
        .set('x-user-id', 'dwight');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('filters attestations by passed boolean flag', async () => {
      const res = await request(app)
        .get('/api/jarvis/verification/attestations?passed=true')
        .set('x-user-id', 'dwight');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.every((a: any) => a.passed === true)).toBe(true);
    });
  });

  describe('GET /api/jarvis/verification/attestations/:id', () => {
    it('returns 200 with details for existing attestation', async () => {
      const res = await request(app)
        .get('/api/jarvis/verification/attestations/attest_bootstrap_kernel_01')
        .set('x-user-id', 'dwight');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.attestationId).toBe('attest_bootstrap_kernel_01');
      expect(res.body.data.fingerprint).toBeDefined();
    });

    it('returns 404 for unknown attestation ID', async () => {
      const res = await request(app)
        .get('/api/jarvis/verification/attestations/attest_does_not_exist_999')
        .set('x-user-id', 'dwight');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/jarvis/verification/report', () => {
    it('returns 200 with compliance report', async () => {
      const res = await request(app)
        .get('/api/jarvis/verification/report')
        .set('x-user-id', 'dwight');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.passRatePercent).toBeDefined();
      expect(res.body.data.complianceStatus).toBeDefined();
      expect(res.body.data.activePolicy).toContain('Zero Fake Completions');
    });
  });
});
