import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/server/app.js';
import { MockAIProvider } from '../../src/providers/mock-provider.js';
import { ResourceType, PermissionLevel } from '../../src/security/types.js';

describe('Phase 6 Document Intelligence API Integration Tests', () => {
  let app: any;
  let core: any;

  beforeEach(() => {
    const mockProvider = new MockAIProvider({ defaultResponse: 'Document-grounded response' });
    const instance = createApp({ aiProvider: mockProvider });
    app = instance.app;
    core = instance.core;

    core.getPermissionManager().grantPermission({
      userId: 'default_user',
      resource: ResourceType.FILES,
      level: PermissionLevel.ADMIN,
      allowedActions: ['read', 'write', 'delete'],
      grantedBy: 'system',
    });
    core.getPermissionManager().grantPermission({
      userId: 'default_user',
      resource: ResourceType.DATABASES,
      level: PermissionLevel.WRITE,
      allowedActions: ['read', 'write', 'modify', 'delete'],
      grantedBy: 'system',
    });
  });

  it('POST /api/jarvis/documents/ingest ingests and parses a document', async () => {
    const res = await request(app)
      .post('/api/jarvis/documents/ingest')
      .set('x-user-id', 'default_user')
      .send({
        filename: 'math_review.md',
        content: '# Math Review\nCalculus and Differential Equations are key for majorship exam.',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.document).toBeDefined();
    expect(res.body.document.metadata.filename).toBe('math_review.md');
    expect(res.body.document.sections.length).toBeGreaterThan(0);
  });

  it('GET /api/jarvis/documents lists ingested documents', async () => {
    // Ingest first
    await request(app)
      .post('/api/jarvis/documents/ingest')
      .set('x-user-id', 'default_user')
      .send({
        filename: 'notes.txt',
        content: 'Review schedule: Monday, Wednesday, Friday.',
      });

    const res = await request(app).get('/api/jarvis/documents');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.count).toBeGreaterThanOrEqual(1);
    expect(res.body.documents[0].filename).toBeDefined();
  });

  it('POST /api/jarvis/documents/:id/summarize generates an executive summary', async () => {
    const ingestRes = await request(app)
      .post('/api/jarvis/documents/ingest')
      .set('x-user-id', 'default_user')
      .send({
        filename: 'pedagogy.txt',
        content: `# Constructivist Mathematics
Constructivism posits that learners construct knowledge through active reflection.
Formative assessment guides instruction.`,
      });

    const docId = ingestRes.body.document.metadata.id;

    const res = await request(app).post(`/api/jarvis/documents/${docId}/summarize`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.summary.title).toContain('Constructivist');
    expect(res.body.summary.keyPoints.length).toBeGreaterThan(0);
  });

  it('POST /api/jarvis/documents/:id/qa answers questions from document passages', async () => {
    const ingestRes = await request(app)
      .post('/api/jarvis/documents/ingest')
      .set('x-user-id', 'default_user')
      .send({
        filename: 'prc_rules.txt',
        content: `Examination Requirements:
Examinees must bring their Official Receipt, Notice of Admission, and Black Ballpen.`,
      });

    const docId = ingestRes.body.document.metadata.id;

    const res = await request(app)
      .post(`/api/jarvis/documents/${docId}/qa`)
      .send({ question: 'What ballpen must examinees bring?' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.qa.answer.toLowerCase()).toContain('black ballpen');
    expect(res.body.qa.confidence).toBeGreaterThan(0.5);
  });

  it('POST /api/jarvis/documents/compare compares two documents', async () => {
    const doc1 = await request(app)
      .post('/api/jarvis/documents/ingest')
      .set('x-user-id', 'default_user')
      .send({ filename: 'a.txt', content: 'Topic A covers calculus and algebra fundamentals.' });

    const doc2 = await request(app)
      .post('/api/jarvis/documents/ingest')
      .set('x-user-id', 'default_user')
      .send({ filename: 'b.txt', content: 'Topic B covers geometry and algebra fundamentals.' });

    const res = await request(app)
      .post('/api/jarvis/documents/compare')
      .send({ docIdA: doc1.body.document.metadata.id, docIdB: doc2.body.document.metadata.id });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.comparison.similarityScore).toBeGreaterThan(0);
    expect(res.body.comparison.commonThemes).toContain('algebra');
  });

  it('POST /api/jarvis/documents/:id/analyze-table analyzes tabular data in CSV', async () => {
    const ingestRes = await request(app)
      .post('/api/jarvis/documents/ingest')
      .set('x-user-id', 'default_user')
      .send({
        filename: 'scores.csv',
        content: `student,score\nAlice,90\nBob,80\nCharlie,70`,
      });

    const docId = ingestRes.body.document.metadata.id;

    const res = await request(app)
      .post(`/api/jarvis/documents/${docId}/analyze-table`)
      .send({ tableIndex: 0 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.analysis.rowCount).toBe(3);
    expect(res.body.analysis.numericSummary['score'].mean).toBe(80);
  });

  it('POST /api/jarvis/documents/:id/to-knowledge converts document into Second Brain knowledge node', async () => {
    const ingestRes = await request(app)
      .post('/api/jarvis/documents/ingest')
      .set('x-user-id', 'default_user')
      .send({
        filename: 'thesis_takeaways.txt',
        content: `# AI in STEM Scaffolding
Key takeaway: Socratic dialogue reduces cognitive overload in mathematics.`,
      });

    const docId = ingestRes.body.document.metadata.id;

    const res = await request(app)
      .post(`/api/jarvis/documents/${docId}/to-knowledge`)
      .set('x-user-id', 'default_user')
      .send({ domain: 'study', category: 'thesis' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.result.createdNodes.length).toBeGreaterThan(0);
  });

  it('DELETE /api/jarvis/documents/:id deletes document and enforces permission checks', async () => {
    const ingestRes = await request(app)
      .post('/api/jarvis/documents/ingest')
      .set('x-user-id', 'default_user')
      .send({ filename: 'temp.txt', content: 'temporary content' });

    const docId = ingestRes.body.document.metadata.id;

    // Unauthorized delete
    const deniedRes = await request(app)
      .delete(`/api/jarvis/documents/${docId}`)
      .set('x-user-id', 'unauthorized_user');
    expect(deniedRes.status).toBe(403);

    // Authorized delete
    const okRes = await request(app)
      .delete(`/api/jarvis/documents/${docId}`)
      .set('x-user-id', 'default_user');
    expect(okRes.status).toBe(200);
    expect(okRes.body.success).toBe(true);
  });
});
