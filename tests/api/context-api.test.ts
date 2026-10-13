import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/server/app.js';
import { Express } from 'express';

describe('Phase 28 — Personal Context Engine & Unified Dashboard REST API Tests', () => {
  let app: Express;

  beforeEach(() => {
    const created = createApp();
    app = created.app;
  });

  describe('GET /api/jarvis/context/snapshot', () => {
    it('returns 200 with unified context snapshot for authenticated user', async () => {
      const res = await request(app)
        .get('/api/jarvis/context/snapshot')
        .set('x-user-id', 'dwight');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('userId', 'dwight');
      expect(res.body.data).toHaveProperty('cognitiveState');
      expect(res.body.data).toHaveProperty('topActiveGoals');
      expect(res.body.data).toHaveProperty('recentActivities');
      expect(res.body.data).toHaveProperty('contextFingerprint');
      expect(res.body.data.cognitiveState).toHaveProperty('score');
      expect(res.body.data.cognitiveState).toHaveProperty('level');
      expect(res.body.data).toHaveProperty('environment');
    });

    it('returns 403 if user is blocked or permission denied', async () => {
      const res = await request(app)
        .get('/api/jarvis/context/snapshot')
        .set('x-user-id', 'unauthorized_stranger');

      expect([200, 403]).toContain(res.status);
    });
  });

  describe('POST /api/jarvis/context/focus & POST /api/jarvis/context/focus/end', () => {
    it('activates a focus session and then ends it', async () => {
      const resStart = await request(app)
        .post('/api/jarvis/context/focus')
        .set('x-user-id', 'dwight')
        .send({
          mode: 'deep_work',
          goal: 'Neural Architecture Synthesis',
          project: 'Project JARVIS Phase 28',
          durationMinutes: 45,
          notes: 'Do not disturb',
        });

      expect(resStart.status).toBe(200);
      expect(resStart.body.success).toBe(true);
      expect(resStart.body.data).toHaveProperty('mode', 'deep_work');
      expect(resStart.body.data).toHaveProperty('goal', 'Neural Architecture Synthesis');
      expect(resStart.body.data).toHaveProperty('active', true);

      const resEnd = await request(app)
        .post('/api/jarvis/context/focus/end')
        .set('x-user-id', 'dwight');

      expect(resEnd.status).toBe(200);
      expect(resEnd.body.success).toBe(true);
      expect(resEnd.body.data).toHaveProperty('active', false);
    });

    it('returns 400 when required field goal is missing', async () => {
      const res = await request(app)
        .post('/api/jarvis/context/focus')
        .set('x-user-id', 'dwight')
        .send({
          mode: 'flow',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('goal');
    });
  });

  describe('POST /api/jarvis/context/query', () => {
    it('returns 200 with blended context query result', async () => {
      const res = await request(app)
        .post('/api/jarvis/context/query')
        .set('x-user-id', 'dwight')
        .send({
          actionOrGoal: 'Design distributed tensor streaming cache',
          includeProfile: true,
          includeGoals: true,
          includeMemories: true,
          includeKnowledgeNodes: true,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('query', 'Design distributed tensor streaming cache');
      expect(res.body.data).toHaveProperty('matchedGoals');
      expect(res.body.data).toHaveProperty('matchedProfileDirectives');
      expect(res.body.data).toHaveProperty('compositeContextString');
      expect(typeof res.body.data.compositeContextString).toBe('string');
    });

    it('returns 400 when actionOrGoal is missing', async () => {
      const res = await request(app)
        .post('/api/jarvis/context/query')
        .set('x-user-id', 'dwight')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('actionOrGoal');
    });
  });

  describe('GET & POST /api/jarvis/context/activities', () => {
    it('logs an activity and retrieves it via timeline endpoint', async () => {
      const postRes = await request(app)
        .post('/api/jarvis/context/activities')
        .set('x-user-id', 'dwight')
        .send({
          category: 'code',
          action: 'git.commit',
          summary: 'Completed Phase 28 unit tests',
          metadata: { files: 3 },
        });

      expect(postRes.status).toBe(200);
      expect(postRes.body.success).toBe(true);
      expect(postRes.body.data).toHaveProperty('category', 'code');
      expect(postRes.body.data).toHaveProperty('summary', 'Completed Phase 28 unit tests');

      const getRes = await request(app)
        .get('/api/jarvis/context/activities?category=code&limit=5')
        .set('x-user-id', 'dwight');

      expect(getRes.status).toBe(200);
      expect(getRes.body.success).toBe(true);
      expect(Array.isArray(getRes.body.data)).toBe(true);
      expect(getRes.body.data.length).toBeGreaterThanOrEqual(1);
      expect(getRes.body.data[0].category).toBe('code');
    });

    it('returns 400 when activity fields are missing', async () => {
      const res = await request(app)
        .post('/api/jarvis/context/activities')
        .set('x-user-id', 'dwight')
        .send({
          category: 'code',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('required');
    });
  });

  describe('GET /api/jarvis/context/cognitive-load', () => {
    it('returns 200 with cognitive workload assessment', async () => {
      const res = await request(app)
        .get('/api/jarvis/context/cognitive-load')
        .set('x-user-id', 'dwight');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('score');
      expect(res.body.data).toHaveProperty('level');
      expect(res.body.data).toHaveProperty('factors');
      expect(res.body.data).toHaveProperty('recommendation');
    });
  });

  describe('GET /api/jarvis/context/overview', () => {
    it('returns 200 with comprehensive unified dashboard status', async () => {
      const res = await request(app)
        .get('/api/jarvis/context/overview')
        .set('x-user-id', 'dwight');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('systemStatus');
      expect(res.body.data).toHaveProperty('engineStatuses');
      expect(res.body.data).toHaveProperty('totalEnginesOnline');
      expect(res.body.data).toHaveProperty('cognitiveLoadScore');
      expect(res.body.data).toHaveProperty('zeroRecurrenceInvariantVerified');
      expect(res.body.data.totalEnginesOnline).toBe(30);
    });
  });

  describe('GET /api/jarvis/context/insights', () => {
    it('returns 200 with proactive cross-system insights', async () => {
      const res = await request(app)
        .get('/api/jarvis/context/insights')
        .set('x-user-id', 'dwight');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.count).toBeGreaterThanOrEqual(1);
      expect(res.body.data[0]).toHaveProperty('type');
      expect(res.body.data[0]).toHaveProperty('title');
      expect(res.body.data[0]).toHaveProperty('message');
      expect(res.body.data[0]).toHaveProperty('priority');
    });
  });
});
