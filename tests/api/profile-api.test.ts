import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/server/app.js';
import { MockAIProvider } from '../../src/providers/mock-provider.js';

describe('Phase 3 Profile API Integration Tests', () => {
  let app: any;

  beforeEach(() => {
    const mockProvider = new MockAIProvider({ defaultResponse: 'Personalized response' });
    const instance = createApp({ aiProvider: mockProvider });
    app = instance.app;
  });

  it('GET /api/jarvis/profile returns the default user profile for Dwight', async () => {
    const res = await request(app).get('/api/jarvis/profile?userId=default_user');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.profile).toBeDefined();
    expect(res.body.profile.identity.name).toBe('Dwight');
    expect(res.body.profile.identity.role).toContain('Lead Engineer');
    expect(res.body.profile.goals.length).toBeGreaterThanOrEqual(3);
  });

  it('PUT /api/jarvis/profile updates user identity and preferences', async () => {
    const res = await request(app)
      .put('/api/jarvis/profile')
      .send({
        userId: 'default_user',
        identity: {
          preferredName: 'Sir Dwight',
        },
        communication: {
          tone: 'academic',
        },
      });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.profile.identity.preferredName).toBe('Sir Dwight');
    expect(res.body.profile.communication.tone).toBe('academic');
  });

  it('POST, PUT, and DELETE /api/jarvis/profile/goals manages user goals', async () => {
    // 1. Create Goal
    const createRes = await request(app)
      .post('/api/jarvis/profile/goals')
      .send({
        userId: 'default_user',
        title: 'Master Number Theory for LET',
        description: 'Modular arithmetic, primes, Euclidean algorithm, Diophantine equations.',
        category: 'learning',
        priority: 'high',
      });

    expect(createRes.status).toBe(201);
    expect(createRes.body.status).toBe('success');
    const goalId = createRes.body.goal.id;
    expect(goalId).toBeDefined();

    // 2. Update Goal
    const updateRes = await request(app)
      .put(`/api/jarvis/profile/goals/${goalId}`)
      .send({
        userId: 'default_user',
        status: 'achieved',
      });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.goal.status).toBe('achieved');

    // 3. Delete Goal
    const deleteRes = await request(app)
      .delete(`/api/jarvis/profile/goals/${goalId}?userId=default_user`);

    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.deleted).toBe(true);
  });

  it('POST, PUT, and DELETE /api/jarvis/profile/projects manages user projects', async () => {
    // 1. Create Project
    const createRes = await request(app)
      .post('/api/jarvis/profile/projects')
      .send({
        userId: 'default_user',
        name: 'Math Curriculum Engine',
        description: 'Automated problem generators for Philippine LET and high-school math curricula.',
        role: 'Author',
        tags: ['Math', 'Curriculum', 'LET'],
      });

    expect(createRes.status).toBe(201);
    const projectId = createRes.body.project.id;

    // 2. Update Project
    const updateRes = await request(app)
      .put(`/api/jarvis/profile/projects/${projectId}`)
      .send({
        userId: 'default_user',
        status: 'completed',
      });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.project.status).toBe('completed');

    // 3. Delete Project
    const deleteRes = await request(app)
      .delete(`/api/jarvis/profile/projects/${projectId}?userId=default_user`);

    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.deleted).toBe(true);
  });

  it('POST, PUT, and DELETE /api/jarvis/profile/study-areas manages study tracks', async () => {
    const createRes = await request(app)
      .post('/api/jarvis/profile/study-areas')
      .send({
        userId: 'default_user',
        domain: 'mathematics',
        title: 'Topology and Abstract Algebra',
        currentTopic: 'Group Theory and Homomorphisms',
        masteryLevel: 'intermediate',
      });

    expect(createRes.status).toBe(201);
    const studyId = createRes.body.studyArea.id;

    const updateRes = await request(app)
      .put(`/api/jarvis/profile/study-areas/${studyId}`)
      .send({
        userId: 'default_user',
        masteryLevel: 'advanced',
      });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.studyArea.masteryLevel).toBe('advanced');

    const deleteRes = await request(app)
      .delete(`/api/jarvis/profile/study-areas/${studyId}?userId=default_user`);

    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.deleted).toBe(true);
  });

  it('GET /api/jarvis/profile/context returns prompt context and distinction analysis', async () => {
    const res = await request(app).get('/api/jarvis/profile/context?userId=default_user&sessionId=sess_test_1&messageCount=3');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.promptContext).toContain('[USER IDENTITY & PROFILE CONTEXT]');
    expect(res.body.promptContext).toContain('Assisting: Dwight');
    expect(res.body.distinction).toBeDefined();
    expect(res.body.distinction.temporaryConversation.sessionId).toBe('sess_test_1');
    expect(res.body.distinction.temporaryConversation.recentMessageCount).toBe(3);
    expect(res.body.distinction.persistentUserInformation.userName).toBe('Dwight');
  });

  it('POST /api/jarvis/chat returns user identity metadata in chat response', async () => {
    const res = await request(app)
      .post('/api/jarvis/chat')
      .send({
        message: 'Hello JARVIS, please confirm who I am and what we are working on.',
        userId: 'default_user',
      });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.user).toBeDefined();
    expect(res.body.user.name).toBe('Dwight');
    expect(res.body.user.role).toContain('Lead Engineer');
  });
});
