import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/server/app.js';
import { SessionManager } from '../../src/session/session-manager.js';
import { MockAIProvider } from '../../src/providers/mock-provider.js';

describe('Reality Audit & Functionality Repair Regression Suite', () => {
  let app: any;

  beforeEach(() => {
    const created = createApp({ aiProvider: new MockAIProvider() });
    app = created.app;
  });

  describe('Session Manager Continuity', () => {
    it('preserves caller-supplied sessionId when creating a new session', () => {
      const sessionManager = new SessionManager();
      const customId = 'sess_dwight_test_123';
      const session = sessionManager.getOrCreateSession(customId, 'dwight');

      expect(session.id).toBe(customId);
      expect(session.userId).toBe('dwight');

      // Subsequent call retrieves the exact same session
      const retrieved = sessionManager.getOrCreateSession(customId, 'dwight');
      expect(retrieved.id).toBe(customId);
    });
  });

  describe('Rule 4: Conversational Workflow & Capability Honesty', () => {
    it('answers greeting honestly in Local Sovereign Mode', async () => {
      const res = await request(app)
        .post('/api/jarvis/chat')
        .send({ message: 'Hello, JARVIS.' })
        .expect(200);

      expect(res.body.status).toBe('success');
      expect(res.body.response).toContain('Local Sovereign Mode');
      expect(res.body.response).toContain('Dwight');
    });

    it('returns an honest capability accounting when asked what it can do', async () => {
      const res = await request(app)
        .post('/api/jarvis/chat')
        .send({ message: 'What can you actually do right now?' })
        .expect(200);

      expect(res.body.status).toBe('success');
      expect(res.body.response).toContain('Exact Mathematics Engine');
      expect(res.body.response).toContain('Security Hardening & PII Sanitizer');
      expect(res.body.response).toContain('Local Sovereign Deterministic Mode');
    });

    it('correctly recalls name across multi-turn session history', async () => {
      const sessionRes = await request(app)
        .post('/api/jarvis/session')
        .send({ userId: 'dwight' })
        .expect(201);

      const sessionId = sessionRes.body.sessionId;
      expect(sessionId).toBeDefined();

      // Turn 1: Introduce name
      await request(app)
        .post('/api/jarvis/chat')
        .send({ message: 'My name is Dwight.', sessionId })
        .expect(200);

      // Turn 2: Ask for name within same session
      const turn2Res = await request(app)
        .post('/api/jarvis/chat')
        .send({ message: 'What is my name?', sessionId })
        .expect(200);

      expect(turn2Res.body.response).toContain('Your name is Dwight');
    });

    it('rejects empty messages with HTTP 400 Bad Request', async () => {
      await request(app)
        .post('/api/jarvis/chat')
        .send({ message: '   ' })
        .expect(400);
    });
  });

  describe('Rule 5: Telemetry and Data Integrity', () => {
    it('reports real memory counts and honest LLM statuses from /api/jarvis/dashboard', async () => {
      const res = await request(app)
        .get('/api/jarvis/dashboard')
        .expect(200);

      const data = res.body.data;
      expect(data).toBeDefined();
      expect(data.systemStatus).toBe('OPTIMAL');

      // Memories count is real (not the hard-coded 3,380)
      expect(data.aiCore.memoriesStored).toBeGreaterThanOrEqual(10);
      expect(data.aiCore.memoriesStored).toBeLessThan(100);

      // External LLMs are reported honestly as 0 when no API keys are present
      expect(data.aiCore.connectedLlmsCount).toBe(0);
      expect(data.aiCore.status).toBe('Active (Local Sovereign)');

      // LLM provider list contains explicit non-configured statuses
      const gemini = data.llmProviders.find((p: any) => p.name.includes('Gemini'));
      expect(gemini.status).toContain('Not Configured');

      // Intelligence feed contains honest local system status
      expect(data.intelligenceFeed.length).toBeGreaterThan(0);
      expect(data.intelligenceFeed[0].title).not.toContain('Design review with the product team');
    });
  });
});
