import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/server/app.js';
import { MockAIProvider } from '../../src/providers/mock-provider.js';
import { ResourceType, PermissionLevel } from '../../src/security/types.js';

describe('Phase 4 Memory API Integration Tests', () => {
  let app: any;
  let core: any;

  beforeEach(() => {
    const mockProvider = new MockAIProvider({ defaultResponse: 'Memory-aware response' });
    const instance = createApp({ aiProvider: mockProvider });
    app = instance.app;
    core = instance.core;

    // Grant default_user WRITE permission on DATABASES
    core.getPermissionManager().grantPermission({
      userId: 'default_user',
      resource: ResourceType.DATABASES,
      level: PermissionLevel.WRITE,
      allowedActions: ['read', 'write', 'modify', 'delete'],
      grantedBy: 'system',
    });
  });

  it('POST /api/jarvis/memory stores a new conversation memory', async () => {
    const res = await request(app)
      .post('/api/jarvis/memory')
      .send({
        userId: 'default_user',
        key: 'Study Schedule',
        value: 'Daily 2 hours mathematics review and 1 hour coding',
        tags: ['study', 'math', 'schedule'],
      });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('success');
    expect(res.body.memory).toBeDefined();
    expect(res.body.memory.key).toBe('Study Schedule');
  });

  it('GET /api/jarvis/memory queries memories', async () => {
    const res = await request(app).get('/api/jarvis/memory?userId=default_user');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(Array.isArray(res.body.memories)).toBe(true);
    expect(res.body.count).toBeGreaterThanOrEqual(1);
  });

  it('GET /api/jarvis/memory/relevant returns matching memories and prompt block', async () => {
    const res = await request(app).get('/api/jarvis/memory/relevant?q=Tuklas&userId=default_user');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.results.length).toBeGreaterThanOrEqual(1);
    expect(res.body.promptContext).toContain('Tuklas');
  });

  it('POST /api/jarvis/memory/correct corrects a memory with audit trail', async () => {
    // 1. Store initial
    const storeRes = await request(app)
      .post('/api/jarvis/memory')
      .send({
        userId: 'default_user',
        key: 'Target Specialization',
        value: 'Physics',
      });
    expect(storeRes.status).toBe(201);

    // 2. Correct to Mathematics
    const corrRes = await request(app)
      .post('/api/jarvis/memory/correct')
      .send({
        userId: 'default_user',
        memoryIdOrKey: 'Target Specialization',
        newValue: 'Mathematics',
        reason: 'User confirmed LET specialization is Mathematics',
      });

    expect(corrRes.status).toBe(200);
    expect(corrRes.body.status).toBe('success');
    expect(corrRes.body.record.value).toBe('Mathematics');
    expect(corrRes.body.record.confidence).toBe(1.0);
    expect(corrRes.body.correction.previousValue).toBe('Physics');

    // 3. Inspect corrections history endpoint
    const historyRes = await request(app).get('/api/jarvis/memory/corrections?userId=default_user');
    expect(historyRes.status).toBe(200);
    expect(historyRes.body.corrections.length).toBeGreaterThanOrEqual(1);
  });

  it('DELETE /api/jarvis/memory/:id deletes memory', async () => {
    const storeRes = await request(app)
      .post('/api/jarvis/memory')
      .send({
        userId: 'default_user',
        key: 'Obsolete Note',
        value: 'Will be removed',
      });
    const memId = storeRes.body.memory.id;

    const delRes = await request(app).delete(`/api/jarvis/memory/${memId}?userId=default_user`);
    expect(delRes.status).toBe(200);
    expect(delRes.body.deleted).toBe(true);

    const getRes = await request(app).get(`/api/jarvis/memory/${memId}?userId=default_user`);
    expect(getRes.status).toBe(404);
  });
});
