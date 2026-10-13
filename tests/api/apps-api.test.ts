import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/server/app.js';
import { Express } from 'express';

describe('Phase 18 - Application Control REST API Endpoints', () => {
  let app: Express;

  beforeAll(() => {
    const created = createApp();
    app = created.app;
  });

  describe('GET /api/jarvis/apps/catalog', () => {
    it('returns application catalog for authorized user', async () => {
      const res = await request(app)
        .get('/api/jarvis/apps/catalog')
        .set('x-user-id', 'dwight');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBeGreaterThanOrEqual(8);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('rejects access when user is not authorized', async () => {
      const res = await request(app)
        .get('/api/jarvis/apps/catalog')
        .set('x-user-id', 'unregistered_anonymous_user');

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/jarvis/apps/processes', () => {
    it('discovers running host processes', async () => {
      const res = await request(app)
        .get('/api/jarvis/apps/processes')
        .set('x-user-id', 'dwight');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.count).toBeGreaterThan(0);
    });
  });

  describe('POST /api/jarvis/apps/launch', () => {
    it('launches authorized application in simulation mode', async () => {
      const res = await request(app)
        .post('/api/jarvis/apps/launch')
        .set('x-user-id', 'dwight')
        .send({ appId: 'calculator', simulate: true });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.success).toBe(true);
      expect(res.body.data.appId).toBe('calculator');
    });

    it('returns 400 when appId is missing', async () => {
      const res = await request(app)
        .post('/api/jarvis/apps/launch')
        .set('x-user-id', 'dwight')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/jarvis/apps/close', () => {
    it('closes application process safely', async () => {
      const res = await request(app)
        .post('/api/jarvis/apps/close')
        .set('x-user-id', 'dwight')
        .send({ appId: 'calculator', pid: 5678, simulate: true });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.appId).toBe('calculator');
    });
  });

  describe('POST /api/jarvis/apps/focus', () => {
    it('controls window focus safely', async () => {
      const res = await request(app)
        .post('/api/jarvis/apps/focus')
        .set('x-user-id', 'dwight')
        .send({ appId: 'vscode', windowTitleFilter: 'Visual Studio Code', simulate: true });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.action).toBe('focus');
    });
  });

  describe('POST /api/jarvis/apps/uri', () => {
    it('dispatches deep link URI successfully', async () => {
      const res = await request(app)
        .post('/api/jarvis/apps/uri')
        .set('x-user-id', 'dwight')
        .send({ appId: 'vscode', uri: 'vscode://file/src/server.ts', simulate: true });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.uri).toBe('vscode://file/src/server.ts');
    });
  });

  describe('POST /api/jarvis/apps/command', () => {
    it('sends authenticated local API command', async () => {
      const res = await request(app)
        .post('/api/jarvis/apps/command')
        .set('x-user-id', 'dwight')
        .send({
          appId: 'obsidian',
          endpoint: '/vault/notes.md',
          authToken: 'vault_token_abc_123',
          simulate: true,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.protocol).toBe('api');
    });
  });

  describe('POST /api/jarvis/apps/authorize', () => {
    it('updates application authorization status for admin', async () => {
      const res = await request(app)
        .post('/api/jarvis/apps/authorize')
        .set('x-user-id', 'dwight')
        .send({ appId: 'slack', status: 'blocked' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('blocked');
    });
  });

  describe('GET /api/jarvis/apps/audit', () => {
    it('retrieves application authorization audit summary', async () => {
      const res = await request(app)
        .get('/api/jarvis/apps/audit')
        .set('x-user-id', 'dwight');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalRegistered).toBeGreaterThan(0);
      expect(res.body.data.securityNotice).toBeDefined();
    });
  });
});
