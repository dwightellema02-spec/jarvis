import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/server/app.js';
import { Express } from 'express';

describe('Phase 24 — Skill & Tool Builder REST API Tests', () => {
  let app: Express;

  beforeAll(() => {
    const initialized = createApp();
    app = initialized.app;
  });

  describe('GET /api/jarvis/skills', () => {
    it('returns 200 with list of seeded and installed skills', async () => {
      const res = await request(app)
        .get('/api/jarvis/skills')
        .set('x-user-id', 'dwight');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.count).toBeGreaterThanOrEqual(2);
      expect(res.body.data.some((s: any) => s.id === 'custom.weather_forecast')).toBe(true);
    });

    it('filters skills by status', async () => {
      const res = await request(app)
        .get('/api/jarvis/skills?status=installed')
        .set('x-user-id', 'dwight');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      for (const item of res.body.data) {
        expect(item.status).toBe('installed');
      }
    });
  });

  describe('GET /api/jarvis/skills/:id', () => {
    it('returns 200 with skill details', async () => {
      const res = await request(app)
        .get('/api/jarvis/skills/custom.weather_forecast')
        .set('x-user-id', 'dwight');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe('custom.weather_forecast');
      expect(res.body.data.implementationCode).toContain('execute');
    });

    it('returns 404 for unknown skill ID', async () => {
      const res = await request(app)
        .get('/api/jarvis/skills/custom.non_existent_skill_xyz')
        .set('x-user-id', 'dwight');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/jarvis/skills/draft', () => {
    it('creates a new custom skill draft', async () => {
      const res = await request(app)
        .post('/api/jarvis/skills/draft')
        .set('x-user-id', 'dwight')
        .send({
          name: 'Markdown Table Formatter',
          description: 'Formats raw records into GitHub markdown tables',
          type: 'data_transformer',
          promptOrSpec: 'Convert array of objects into markdown table',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe('custom.markdown_table_formatter');
      expect(res.body.data.status).toBe('generated');
    });
  });

  describe('Lifecycle: Test, Approve, Install, Uninstall, Delete', () => {
    let createdSkillId: string;

    beforeAll(async () => {
      const res = await request(app)
        .post('/api/jarvis/skills/draft')
        .set('x-user-id', 'dwight')
        .send({
          name: 'Polynomial Evaluator',
          description: 'Evaluates polynomial coefficients at given x',
          type: 'custom_solver',
          promptOrSpec: 'Compute polynomial',
        });
      createdSkillId = res.body.data.id;
    });

    it('runs sandboxed test suite (POST /:id/test)', async () => {
      const res = await request(app)
        .post(`/api/jarvis/skills/${createdSkillId}/test`)
        .set('x-user-id', 'dwight');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.syntaxValid).toBe(true);
      expect(res.body.data.overallStatus).toBe('passed');
    });

    it('records operator review & approval (POST /:id/approve)', async () => {
      const res = await request(app)
        .post(`/api/jarvis/skills/${createdSkillId}/approve`)
        .set('x-user-id', 'dwight')
        .send({ approved: true, reason: 'Mathematical safety verified' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('awaiting_approval');
      expect(res.body.data.approvedBy).toBe('dwight');
    });

    it('installs skill into active ToolRegistry (POST /:id/install)', async () => {
      const res = await request(app)
        .post(`/api/jarvis/skills/${createdSkillId}/install`)
        .set('x-user-id', 'dwight');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('installed');

      // Verify immediate discoverability via GET /api/tools
      const toolsRes = await request(app).get('/api/tools');
      expect(toolsRes.body.tools.some((t: any) => t.id === createdSkillId)).toBe(true);
    });

    it('uninstalls skill from ToolRegistry (POST /:id/uninstall)', async () => {
      const res = await request(app)
        .post(`/api/jarvis/skills/${createdSkillId}/uninstall`)
        .set('x-user-id', 'dwight');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('disabled');

      // Verify removed from GET /api/tools
      const toolsRes = await request(app).get('/api/tools');
      expect(toolsRes.body.tools.some((t: any) => t.id === createdSkillId)).toBe(false);
    });

    it('deletes draft skill (DELETE /:id)', async () => {
      const res = await request(app)
        .delete(`/api/jarvis/skills/${createdSkillId}`)
        .set('x-user-id', 'dwight');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.deleted).toBe(true);
    });
  });
});
