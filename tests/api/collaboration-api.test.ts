import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/server/app.js';
import { Express } from 'express';
import { PermissionLevel, ResourceType } from '../../src/security/types.js';

describe('Phase 25 — Multi-Agent Collaboration REST API Tests', () => {
  let app: Express;

  beforeEach(() => {
    const created = createApp();
    app = created.app;
  });

  describe('GET /api/jarvis/collaboration/templates', () => {
    it('returns 200 with list of predefined collaboration templates', async () => {
      const res = await request(app)
        .get('/api/jarvis/collaboration/templates')
        .set('x-user-id', 'dwight');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(4);
      expect(res.body.data[0].id).toBeDefined();
      expect(res.body.data[0].topology).toBeDefined();
    });
  });

  describe('GET /api/jarvis/collaboration/missions', () => {
    it('returns 200 with list of missions including seeded mission', async () => {
      const res = await request(app)
        .get('/api/jarvis/collaboration/missions')
        .set('x-user-id', 'dwight');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBeGreaterThanOrEqual(1);
      expect(res.body.data[0].id).toBeDefined();
    });

    it('filters missions by status', async () => {
      const res = await request(app)
        .get('/api/jarvis/collaboration/missions?status=completed')
        .set('x-user-id', 'dwight');

      expect(res.status).toBe(200);
      expect(res.body.data.every((m: any) => m.status === 'completed')).toBe(true);
    });
  });

  describe('GET /api/jarvis/collaboration/missions/:id', () => {
    it('returns 200 with mission details for valid ID', async () => {
      const res = await request(app)
        .get('/api/jarvis/collaboration/missions/mission_seed_stem_01')
        .set('x-user-id', 'dwight');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe('mission_seed_stem_01');
      expect(res.body.data.steps.length).toBe(3);
    });

    it('returns 404 for non-existent mission', async () => {
      const res = await request(app)
        .get('/api/jarvis/collaboration/missions/non_existent_mission_id')
        .set('x-user-id', 'dwight');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/jarvis/collaboration/missions', () => {
    it('creates a new multi-agent mission successfully', async () => {
      const res = await request(app)
        .post('/api/jarvis/collaboration/missions')
        .set('x-user-id', 'dwight')
        .send({
          title: 'Full Stack Innovation Sprint',
          objective: 'Synthesize venture blueprint and scaffold architecture',
          topology: 'hierarchical',
          participatingAgentIds: ['innovation-agent', 'research-agent', 'coding-agent'],
          steps: [
            { name: 'PMF Discovery', agentId: 'innovation-agent', description: 'Analyze market' },
            { name: 'Architecture Design', agentId: 'research-agent', description: 'Define tech stack' },
            { name: 'Core API Scaffold', agentId: 'coding-agent', description: 'Scaffold endpoints' },
          ],
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBeDefined();
      expect(res.body.data.title).toBe('Full Stack Innovation Sprint');
      expect(res.body.data.status).toBe('pending');
      expect(res.body.data.steps.length).toBe(3);
    });
  });

  describe('POST /api/jarvis/collaboration/missions/:id/run', () => {
    it('executes a multi-agent mission end-to-end', async () => {
      // 1. Create mission
      const createRes = await request(app)
        .post('/api/jarvis/collaboration/missions')
        .set('x-user-id', 'dwight')
        .send({
          title: 'Math & Coding Collaborative Synthesis',
          objective: 'Derive linear regression closed form and scaffold code',
          topology: 'pipeline',
          steps: [
            { name: 'Normal Equations Derivation', agentId: 'mathematics-agent', description: 'Derive (X^T X)^{-1} X^T y' },
            { name: 'Solver Implementation', agentId: 'coding-agent', description: 'Implement TypeScript matrix solver' },
          ],
        });

      const missionId = createRes.body.data.id;

      // 2. Run mission
      const runRes = await request(app)
        .post(`/api/jarvis/collaboration/missions/${missionId}/run`)
        .set('x-user-id', 'dwight');

      expect(runRes.status).toBe(200);
      expect(runRes.body.success).toBe(true);
      expect(runRes.body.data.status).toBe('completed');
      expect(runRes.body.data.steps.every((s: any) => s.status === 'completed')).toBe(true);
      expect(runRes.body.data.completedAt).toBeDefined();
    });
  });

  describe('Blackboard: GET & POST /api/jarvis/collaboration/missions/:id/blackboard', () => {
    it('writes and reads artifacts on the shared blackboard', async () => {
      const createRes = await request(app)
        .post('/api/jarvis/collaboration/missions')
        .set('x-user-id', 'dwight')
        .send({
          title: 'Blackboard Test Mission',
          objective: 'Test blackboard read/write',
        });
      const missionId = createRes.body.data.id;

      // Write
      const writeRes = await request(app)
        .post(`/api/jarvis/collaboration/missions/${missionId}/blackboard`)
        .set('x-user-id', 'dwight')
        .send({
          key: 'benchmark.rmse',
          value: 0.042,
          author: 'data-agent',
        });

      expect(writeRes.status).toBe(200);
      expect(writeRes.body.success).toBe(true);
      expect(writeRes.body.data.key).toBe('benchmark.rmse');

      // Read
      const readRes = await request(app)
        .get(`/api/jarvis/collaboration/missions/${missionId}/blackboard?key=benchmark.rmse`)
        .set('x-user-id', 'dwight');

      expect(readRes.status).toBe(200);
      expect(readRes.body.data).toBe(0.042);
    });
  });

  describe('Inter-Agent Messaging & Peer Review', () => {
    it('transmits inter-agent messages and records peer reviews', async () => {
      const createRes = await request(app)
        .post('/api/jarvis/collaboration/missions')
        .set('x-user-id', 'dwight')
        .send({
          title: 'Review & Messaging Mission',
          objective: 'Test communication protocols',
        });
      const missionId = createRes.body.data.id;
      const stepId = createRes.body.data.steps[0].id;

      // Message
      const msgRes = await request(app)
        .post(`/api/jarvis/collaboration/missions/${missionId}/message`)
        .set('x-user-id', 'dwight')
        .send({
          fromAgentId: 'research-agent',
          toAgentId: 'coding-agent',
          type: 'clarification',
          content: 'Does the solver support 64-bit floating point precision?',
        });

      expect(msgRes.status).toBe(200);
      expect(msgRes.body.success).toBe(true);
      expect(msgRes.body.data.fromAgentId).toBe('research-agent');

      // Peer Review
      const reviewRes = await request(app)
        .post(`/api/jarvis/collaboration/missions/${missionId}/review`)
        .set('x-user-id', 'dwight')
        .send({
          reviewerAgentId: 'research-agent',
          targetStepId: stepId,
          critique: 'Methodology verified against benchmark literature.',
        });

      expect(reviewRes.status).toBe(200);
      expect(reviewRes.body.success).toBe(true);
      expect(reviewRes.body.data.approved).toBe(true);
      expect(reviewRes.body.data.score).toBe(95);
    });
  });
});
