import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/server/app.js';
import { Express } from 'express';

describe('Phase 22 — Goals, Tasks, Planning & Study REST API Tests', () => {
  let app: Express;
  const today = new Date().toISOString().split('T')[0];

  beforeAll(() => {
    const initialized = createApp();
    app = initialized.app;
  });

  describe('GET /api/jarvis/goals', () => {
    it('returns 200 with list of seeded goals', async () => {
      const res = await request(app)
        .get('/api/jarvis/goals')
        .set('x-user-id', 'dwight');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(2);
      expect(res.body.data.some((g: any) => g.id === 'goal_jarvis_prod')).toBe(true);
    });
  });

  describe('POST /api/jarvis/goals', () => {
    it('creates a new goal and returns 201', async () => {
      const res = await request(app)
        .post('/api/jarvis/goals')
        .set('x-user-id', 'dwight')
        .send({
          title: 'Master Quantum Algorithms',
          description: 'Study Shor and Grover algorithms with state vectors',
          category: 'education',
          priority: 'high',
          targetDate: '2026-11-20',
          milestones: [
            { title: 'Read Qiskit Documentation', targetDate: '2026-10-30', targetMetric: 'Chapters 1-5 complete' },
          ],
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Master Quantum Algorithms');
      expect(res.body.data.milestones.length).toBe(1);
    });

    it('rejects goal creation with missing required fields', async () => {
      const res = await request(app)
        .post('/api/jarvis/goals')
        .set('x-user-id', 'dwight')
        .send({ title: 'Incomplete' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/jarvis/goals/analytics', () => {
    it('returns goals velocity and distribution analytics', async () => {
      const res = await request(app)
        .get('/api/jarvis/goals/analytics')
        .set('x-user-id', 'dwight');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalGoals).toBeGreaterThanOrEqual(2);
      expect(res.body.data.weeklyVelocity).toBe(14);
      expect(res.body.data.eisenhowerDistribution).toBeDefined();
    });
  });

  describe('POST /api/jarvis/goals/decompose', () => {
    it('decomposes human idea into SMART criteria and tasks', async () => {
      const res = await request(app)
        .post('/api/jarvis/goals/decompose')
        .set('x-user-id', 'dwight')
        .send({
          idea: 'Review Modern Differential Calculus for Teacher Licensure',
          category: 'education',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.smartGoal).toBeDefined();
      expect(res.body.data.tasks.length).toBeGreaterThanOrEqual(3);
      expect(res.body.data.actionSteps.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Tasks & Eisenhower Matrix Endpoints', () => {
    let createdTaskId: string;

    it('creates a task via POST /api/jarvis/goals/tasks', async () => {
      const res = await request(app)
        .post('/api/jarvis/goals/tasks')
        .set('x-user-id', 'dwight')
        .send({
          title: 'Implement Unit Tests for Phase 22',
          isUrgent: true,
          isImportant: true,
          estimatedMinutes: 45,
          assignedTo: 'coding-agent',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.quadrant).toBe('do_first');
      createdTaskId = res.body.data.id;
    });

    it('lists tasks via GET /api/jarvis/goals/tasks/all', async () => {
      const res = await request(app)
        .get('/api/jarvis/goals/tasks/all')
        .set('x-user-id', 'dwight');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(4);
    });

    it('updates task status via PUT /api/jarvis/goals/tasks/:id', async () => {
      const res = await request(app)
        .put(`/api/jarvis/goals/tasks/${createdTaskId}`)
        .set('x-user-id', 'dwight')
        .send({ status: 'completed' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('completed');
      expect(res.body.data.completedAt).toBeDefined();
    });

    it('retrieves Eisenhower Matrix via GET /api/jarvis/goals/eisenhower', async () => {
      const res = await request(app)
        .get('/api/jarvis/goals/eisenhower')
        .set('x-user-id', 'dwight');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.do_first).toBeDefined();
      expect(res.body.data.schedule).toBeDefined();
      expect(res.body.data.delegate).toBeDefined();
      expect(res.body.data.eliminate).toBeDefined();
    });
  });

  describe('Projects Endpoints', () => {
    it('lists projects via GET /api/jarvis/goals/projects/all', async () => {
      const res = await request(app)
        .get('/api/jarvis/goals/projects/all')
        .set('x-user-id', 'dwight');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(2);
    });

    it('creates project via POST /api/jarvis/goals/projects', async () => {
      const res = await request(app)
        .post('/api/jarvis/goals/projects')
        .set('x-user-id', 'dwight')
        .send({
          name: 'Academic Research Synthesis',
          description: 'Literature collation and psychometric analytics for EdTech',
          tags: ['research', 'edtech'],
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Academic Research Synthesis');
    });
  });

  describe('Schedule & Timeblocks Endpoints', () => {
    it('lists and schedules timeblocks', async () => {
      const listRes = await request(app)
        .get('/api/jarvis/goals/schedule')
        .query({ date: today });

      expect(listRes.status).toBe(200);
      expect(listRes.body.data.length).toBeGreaterThanOrEqual(3);

      const blockRes = await request(app)
        .post('/api/jarvis/goals/schedule/block')
        .send({
          title: 'Evening Synthesis Focus',
          type: 'deep_work',
          date: today,
          startTime: '21:00',
          endTime: '22:00',
        });

      expect(blockRes.status).toBe(201);
      expect(blockRes.body.success).toBe(true);
      expect(blockRes.body.data.title).toBe('Evening Synthesis Focus');
    });

    it('suggests optimal focus slot via GET /api/jarvis/goals/schedule/suggest', async () => {
      const res = await request(app)
        .get('/api/jarvis/goals/schedule/suggest')
        .query({ date: today, duration: 60 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.recommendedStart).toBeDefined();
    });
  });

  describe('Study Plans & Spaced Repetition Endpoints', () => {
    it('lists study plans via GET /api/jarvis/goals/study/plans', async () => {
      const res = await request(app).get('/api/jarvis/goals/study/plans');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('retrieves due review queue via GET /api/jarvis/goals/study/queue', async () => {
      const res = await request(app).get('/api/jarvis/goals/study/queue');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('records study session via POST /api/jarvis/goals/study/review', async () => {
      const res = await request(app)
        .post('/api/jarvis/goals/study/review')
        .send({
          planId: 'plan_let_math_2026',
          topicId: 'topic_let_2',
          minutesSpent: 45,
          scoreOrSelfRating: 90,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.topic.reviewCount).toBeGreaterThanOrEqual(4);
    });
  });

  describe('Milestone Completion via POST /api/jarvis/goals/:id/milestones/:milestoneId/complete', () => {
    it('marks milestone complete and increments progress', async () => {
      const res = await request(app)
        .post('/api/jarvis/goals/goal_let_exam/milestones/ms_let_1/complete')
        .set('x-user-id', 'dwight');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.progressPct).toBeGreaterThanOrEqual(50);
    });
  });
});
