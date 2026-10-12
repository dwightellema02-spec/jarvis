import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/server/app.js';
import { Express } from 'express';

describe('Phase 11 - Development Environment REST API Endpoints', () => {
  let app: Express;

  beforeAll(() => {
    const created = createApp();
    app = created.app;
  });

  describe('POST /api/jarvis/devenv/terminal/analyze', () => {
    it('should analyze command safety and risk classification', async () => {
      const res = await request(app)
        .post('/api/jarvis/devenv/terminal/analyze')
        .send({ command: 'rm -rf /' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.risk).toBe('CRITICAL');
      expect(res.body.data.isAllowed).toBe(false);
    });
  });

  describe('POST /api/jarvis/devenv/terminal/execute', () => {
    it('should execute a safe low-risk command', async () => {
      const res = await request(app)
        .post('/api/jarvis/devenv/terminal/execute')
        .set('x-user-id', 'dwight')
        .send({ command: 'node -e "console.log(\'api-dev-test\')"' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.stdout).toContain('api-dev-test');
    });

    it('should block a destructive command', async () => {
      const res = await request(app)
        .post('/api/jarvis/devenv/terminal/execute')
        .set('x-user-id', 'dwight')
        .send({ command: 'format c:' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(false);
      expect(res.body.data.blocked).toBe(true);
    });
  });

  describe('GET /api/jarvis/devenv/git/status', () => {
    it('should return repository git status and clean flag', async () => {
      const res = await request(app)
        .get('/api/jarvis/devenv/git/status')
        .set('x-user-id', 'dwight');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.isGitRepo).toBe(true);
      expect(res.body.data.currentBranch).toBeDefined();
    });
  });

  describe('GET /api/jarvis/devenv/git/log', () => {
    it('should return recent git commits', async () => {
      const res = await request(app)
        .get('/api/jarvis/devenv/git/log?limit=5')
        .set('x-user-id', 'dwight');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.entries.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/jarvis/devenv/dependencies', () => {
    it('should return project dependencies and scripts', async () => {
      const res = await request(app)
        .get('/api/jarvis/devenv/dependencies')
        .set('x-user-id', 'dwight');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('jarvis-core');
      expect(res.body.data.totalDependencies).toBeGreaterThan(0);
    });
  });

  describe('GET /api/jarvis/devenv/dependencies/audit', () => {
    it('should return vulnerability audit summary', async () => {
      const res = await request(app)
        .get('/api/jarvis/devenv/dependencies/audit')
        .set('x-user-id', 'dwight');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.severityCounts).toBeDefined();
    }, 20000);
  });
});
