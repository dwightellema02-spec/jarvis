import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/server/app.js';
import { Express } from 'express';

describe('Phase 17 - Web & Browser REST API Endpoints', () => {
  let app: Express;

  beforeAll(() => {
    const created = createApp();
    app = created.app;
  });

  describe('POST /api/jarvis/browser/search', () => {
    it('returns ranked web search results for authorized user', async () => {
      const res = await request(app)
        .post('/api/jarvis/browser/search')
        .set('x-user-id', 'dwight')
        .send({ query: 'autonomous ai agents' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.query).toBe('autonomous ai agents');
      expect(res.body.data.results.length).toBeGreaterThan(0);
      expect(res.body.data.safeSearchActive).toBe(true);
    });

    it('returns 400 when query is omitted', async () => {
      const res = await request(app)
        .post('/api/jarvis/browser/search')
        .set('x-user-id', 'dwight')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/jarvis/browser/open', () => {
    it('navigates browser session to a valid web URL', async () => {
      const res = await request(app)
        .post('/api/jarvis/browser/open')
        .set('x-user-id', 'dwight')
        .send({ url: 'https://docs.jarvis-ai.dev/overview' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.currentUrl).toBe('https://docs.jarvis-ai.dev/overview');
    });

    it('blocks navigation to phishing domains with 403 Forbidden', async () => {
      const res = await request(app)
        .post('/api/jarvis/browser/open')
        .set('x-user-id', 'dwight')
        .send({ url: 'https://phishing-bank-login.com' });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toMatch(/phishing|Guardian Security Block/i);
    });

    it('blocks navigation to private IP addresses with Anti-SSRF error', async () => {
      const res = await request(app)
        .post('/api/jarvis/browser/open')
        .set('x-user-id', 'dwight')
        .send({ url: 'http://127.0.0.1:8080/admin' });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Anti-SSRF Block');
    });
  });

  describe('POST /api/jarvis/browser/read', () => {
    it('reads and parses page content into clean markdown', async () => {
      const res = await request(app)
        .post('/api/jarvis/browser/read')
        .set('x-user-id', 'dwight')
        .send({ url: 'https://docs.jarvis-ai.dev/overview' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBeDefined();
      expect(res.body.data.markdownContent).toBeDefined();
      expect(res.body.data.wordCount).toBeGreaterThan(0);
    });
  });

  describe('POST /api/jarvis/browser/forms/inspect', () => {
    it('inspects forms and inputs on target page', async () => {
      const res = await request(app)
        .post('/api/jarvis/browser/forms/inspect')
        .set('x-user-id', 'dwight')
        .send({ url: 'https://docs.jarvis-ai.dev/overview' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.forms).toBeDefined();
    });
  });

  describe('POST /api/jarvis/browser/forms/fill', () => {
    it('fills and submits form with valid fields', async () => {
      const res = await request(app)
        .post('/api/jarvis/browser/forms/fill')
        .set('x-user-id', 'dwight')
        .send({
          url: 'https://docs.jarvis-ai.dev/overview',
          formId: 'feedback-form',
          fields: {
            fullName: 'Dwight Developer',
            userEmail: 'dwight@example.com',
            comments: 'Excellent autonomous browser capabilities.',
          },
          submit: true,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.formId).toBe('feedback-form');
      expect(res.body.data.submitted).toBe(true);
    });
  });

  describe('POST /api/jarvis/browser/download', () => {
    it('downloads permitted non-executable files', async () => {
      const res = await request(app)
        .post('/api/jarvis/browser/download')
        .set('x-user-id', 'dwight')
        .send({
          url: 'https://docs.jarvis-ai.dev/guide.pdf',
          destinationFilename: 'guide.pdf',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.fileName).toBe('guide.pdf');
      expect(res.body.data.verifiedSafe).toBe(true);
    });

    it('blocks dangerous executable downloads', async () => {
      const res = await request(app)
        .post('/api/jarvis/browser/download')
        .set('x-user-id', 'dwight')
        .send({
          url: 'https://docs.jarvis-ai.dev/installer.exe',
          destinationFilename: 'installer.exe',
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toMatch(/SUSPICIOUS_DOWNLOAD|executable/i);
    });
  });

  describe('POST /api/jarvis/browser/workflow', () => {
    it('executes automated multi-step browser workflow', async () => {
      const res = await request(app)
        .post('/api/jarvis/browser/workflow')
        .set('x-user-id', 'dwight')
        .send({
          workflowName: 'Documentation Search & Extraction',
          steps: [
            { type: 'search', target: 'clean architecture' },
            { type: 'navigate', target: 'https://typescript-patterns.io/clean-architecture' },
            { type: 'read', target: 'https://typescript-patterns.io/clean-architecture' },
          ],
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.workflowName).toBe('Documentation Search & Extraction');
      expect(res.body.data.stepsExecuted).toBe(3);
    });
  });

  describe('GET /api/jarvis/browser/session', () => {
    it('retrieves active session metrics and history', async () => {
      const res = await request(app)
        .get('/api/jarvis/browser/session')
        .set('x-user-id', 'dwight');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.sessionId).toBeDefined();
      expect(res.body.data.history.length).toBeGreaterThan(0);
    });
  });

  describe('Security Permissions on Web & Browser', () => {
    it('denies access to unauthorized user lacking WEBSITES permission', async () => {
      const res = await request(app)
        .post('/api/jarvis/browser/search')
        .set('x-user-id', 'unauthorized_wanderer')
        .send({ query: 'secret info' });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Permission Denied on WEBSITES');
    });
  });
});
