import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/server/app.js';
import { MockAIProvider } from '../../src/providers/mock-provider.js';
import { ResourceType, PermissionLevel } from '../../src/security/types.js';

describe('Phase 5 Second Brain API Integration Tests', () => {
  let app: any;
  let core: any;

  beforeEach(() => {
    const mockProvider = new MockAIProvider({ defaultResponse: 'Second-brain informed response' });
    const instance = createApp({ aiProvider: mockProvider });
    app = instance.app;
    core = instance.core;

    core.getPermissionManager().grantPermission({
      userId: 'default_user',
      resource: ResourceType.DATABASES,
      level: PermissionLevel.WRITE,
      allowedActions: ['read', 'write', 'modify', 'delete'],
      grantedBy: 'system',
    });
  });

  it('GET /api/jarvis/second-brain/tree returns the complete hierarchical tree rooted in YOU', async () => {
    const res = await request(app).get('/api/jarvis/second-brain/tree?userId=default_user');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.tree).toBeDefined();
    expect(res.body.tree.root).toBe('YOU');
    expect(res.body.tree.study.mathematics.length).toBeGreaterThanOrEqual(1);
    expect(res.body.tree.study.let.length).toBeGreaterThanOrEqual(1);
    expect(res.body.tree.projects.tuklas.length).toBeGreaterThanOrEqual(1);
    expect(res.body.tree.projects.jarvis.length).toBeGreaterThanOrEqual(1);
    expect(res.body.tree.totalNodes).toBeGreaterThanOrEqual(10);
  });

  it('GET /api/jarvis/second-brain/nodes lists nodes and supports domain filtering', async () => {
    const res = await request(app).get('/api/jarvis/second-brain/nodes?domain=study&userId=default_user');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.nodes.length).toBeGreaterThanOrEqual(3);
    expect(res.body.nodes.every((n: any) => n.domain === 'study')).toBe(true);
  });

  it('POST, GET, PUT, and DELETE /api/jarvis/second-brain/nodes handles node lifecycle', async () => {
    // 1. Create Node
    const createRes = await request(app)
      .post('/api/jarvis/second-brain/nodes')
      .send({
        userId: 'default_user',
        domain: 'study',
        category: 'mathematics',
        title: 'Fourier Analysis & Orthogonal Series',
        content: 'Fourier series, Dirichlet conditions, Fourier transforms, and orthogonal polynomial bases.',
        tags: ['fourier', 'analysis', 'orthogonal_polynomials'],
      });

    expect(createRes.status).toBe(201);
    expect(createRes.body.status).toBe('success');
    const nodeId = createRes.body.node.id;

    // 2. Get Node
    const getRes = await request(app).get(`/api/jarvis/second-brain/nodes/${nodeId}?userId=default_user`);
    expect(getRes.status).toBe(200);
    expect(getRes.body.node.title).toContain('Fourier');

    // 3. Update Node
    const updateRes = await request(app)
      .put(`/api/jarvis/second-brain/nodes/${nodeId}`)
      .send({
        userId: 'default_user',
        content: 'Updated Fourier analysis notes with fast Fourier transform (FFT) algorithms.',
      });
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.node.content).toContain('FFT');

    // 4. Delete Node
    const delRes = await request(app).delete(`/api/jarvis/second-brain/nodes/${nodeId}?userId=default_user`);
    expect(delRes.status).toBe(200);
    expect(delRes.body.deleted).toBe(true);
  });

  it('POST /api/jarvis/second-brain/nodes/:id/relate connects relationship edges', async () => {
    const res = await request(app)
      .post('/api/jarvis/second-brain/nodes/node_math_calc/relate')
      .send({
        userId: 'default_user',
        targetNodeId: 'node_know_pedagogy',
        relation: 'exemplifies',
      });

    expect(res.status).toBe(200);
    expect(res.body.connected).toBe(true);
  });

  it('GET /api/jarvis/second-brain/search performs semantic search and ranking', async () => {
    const res = await request(app).get('/api/jarvis/second-brain/search?q=calculus+derivatives&userId=default_user');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.results.length).toBeGreaterThanOrEqual(1);
    expect(res.body.results[0].node.title).toContain('Calculus');
    expect(res.body.results[0].matchSnippet).toBeDefined();
  });

  it('GET /api/jarvis/second-brain/context returns formatted prompt knowledge context', async () => {
    const res = await request(app).get('/api/jarvis/second-brain/context?q=Tuklas+educational+platform&userId=default_user');

    expect(res.status).toBe(200);
    expect(res.body.promptContext).toContain('[SECOND BRAIN KNOWLEDGE RETRIEVED FROM LONG-TERM REPOSITORY]');
    expect(res.body.promptContext).toContain('Tuklas');
  });
});
