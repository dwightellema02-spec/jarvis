import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/server/app.js';
import { Express } from 'express';

describe('Phase 23 — Proactive Intelligence REST API Tests', () => {
  let app: Express;

  beforeAll(() => {
    const initialized = createApp();
    app = initialized.app;
  });

  describe('GET /api/jarvis/proactive/notifications', () => {
    it('returns 200 with list of active proactive notifications', async () => {
      const res = await request(app)
        .get('/api/jarvis/proactive/notifications')
        .set('x-user-id', 'dwight');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.count).toBeGreaterThanOrEqual(1);
      expect(typeof res.body.unreadCount).toBe('number');
    });

    it('filters notifications by status', async () => {
      const res = await request(app)
        .get('/api/jarvis/proactive/notifications?status=unread')
        .set('x-user-id', 'dwight');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      for (const item of res.body.data) {
        expect(item.status).toBe('unread');
      }
    });
  });

  describe('POST /api/jarvis/proactive/notifications/:id/read & dismiss & snooze', () => {
    it('marks notification as read', async () => {
      const listRes = await request(app)
        .get('/api/jarvis/proactive/notifications')
        .set('x-user-id', 'dwight');

      const notifId = listRes.body.data[0].id;

      const res = await request(app)
        .post(`/api/jarvis/proactive/notifications/${notifId}/read`)
        .set('x-user-id', 'dwight');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('read');
    });

    it('snoozes a notification for 45 minutes', async () => {
      const listRes = await request(app)
        .get('/api/jarvis/proactive/notifications')
        .set('x-user-id', 'dwight');

      const notifId = listRes.body.data[0].id;

      const res = await request(app)
        .post(`/api/jarvis/proactive/notifications/${notifId}/snooze`)
        .set('x-user-id', 'dwight')
        .send({ minutes: 45 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('snoozed');
      expect(res.body.data.snoozedUntil).toBeDefined();
    });

    it('dismisses a notification', async () => {
      const listRes = await request(app)
        .get('/api/jarvis/proactive/notifications')
        .set('x-user-id', 'dwight');

      const notifId = listRes.body.data[0].id;

      const res = await request(app)
        .post(`/api/jarvis/proactive/notifications/${notifId}/dismiss`)
        .set('x-user-id', 'dwight');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('dismissed');
    });
  });

  describe('POST /api/jarvis/proactive/cycle', () => {
    it('executes a proactive background scan cycle', async () => {
      const res = await request(app)
        .post('/api/jarvis/proactive/cycle')
        .set('x-user-id', 'dwight');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.timestamp).toBeDefined();
      expect(res.body.data.monitoredProjectsCount).toBeGreaterThanOrEqual(1);
      expect(Array.isArray(res.body.data.notificationsGenerated)).toBe(true);
    });
  });

  describe('GET /api/jarvis/proactive/suggestions', () => {
    it('returns scored and ranked next action suggestions', async () => {
      const res = await request(app)
        .get('/api/jarvis/proactive/suggestions?limit=4')
        .set('x-user-id', 'dwight');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0].impactScore).toBeDefined();
      expect(res.body.data[0].title).toBeDefined();
      expect(res.body.data[0].actionType).toBeDefined();
    });
  });

  describe('GET /api/jarvis/proactive/briefing', () => {
    it('generates morning daily briefing', async () => {
      const res = await request(app)
        .get('/api/jarvis/proactive/briefing?type=morning')
        .set('x-user-id', 'dwight');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.type).toBe('morning');
      expect(res.body.data.focusGoal).toBeDefined();
      expect(Array.isArray(res.body.data.topTasks)).toBe(true);
      expect(res.body.data.greeting).toContain('morning');
    });

    it('generates evening daily briefing', async () => {
      const res = await request(app)
        .get('/api/jarvis/proactive/briefing?type=evening')
        .set('x-user-id', 'dwight');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.type).toBe('evening');
      expect(res.body.data.greeting).toContain('evening');
    });
  });

  describe('GET & PUT /api/jarvis/proactive/preferences', () => {
    it('retrieves operator monitoring preferences', async () => {
      const res = await request(app)
        .get('/api/jarvis/proactive/preferences')
        .set('x-user-id', 'dwight');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.enabled).toBe(true);
      expect(Array.isArray(res.body.data.monitoredProjectIds)).toBe(true);
      expect(res.body.data.quietHours).toBeDefined();
    });

    it('updates monitoring boundaries and preferences', async () => {
      const res = await request(app)
        .put('/api/jarvis/proactive/preferences')
        .set('x-user-id', 'dwight')
        .send({
          maxNotificationsPerHour: 14,
          deadlineThresholdHours: 30,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.maxNotificationsPerHour).toBe(14);
      expect(res.body.data.deadlineThresholdHours).toBe(30);
    });
  });

  describe('POST & DELETE /api/jarvis/proactive/monitored-projects', () => {
    it('approves a project and then revokes it', async () => {
      const addRes = await request(app)
        .post('/api/jarvis/proactive/monitored-projects')
        .set('x-user-id', 'dwight')
        .send({ projectId: 'proj_ai_assistant' });

      expect(addRes.status).toBe(200);
      expect(addRes.body.success).toBe(true);
      expect(addRes.body.data.monitoredProjectIds).toContain('proj_ai_assistant');

      const delRes = await request(app)
        .delete('/api/jarvis/proactive/monitored-projects/proj_ai_assistant')
        .set('x-user-id', 'dwight');

      expect(delRes.status).toBe(200);
      expect(delRes.body.success).toBe(true);
      expect(delRes.body.data.monitoredProjectIds).not.toContain('proj_ai_assistant');
    });
  });
});
