/**
 * JARVIS Phase 15 - Innovation & Venture Architecture REST API Tests
 */

import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/server/app.js';
import { Express } from 'express';
import { JarvisCore } from '../../src/core/jarvis-core.js';

describe('Phase 15 - Innovation REST API Endpoints', () => {
  let app: Express;
  let core: JarvisCore;

  beforeAll(() => {
    const created = createApp();
    app = created.app;
    core = created.core;
  });

  describe('GET /api/jarvis/innovation/status', () => {
    it('returns innovation system status and active frameworks', async () => {
      const res = await request(app).get('/api/jarvis/innovation/status');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.serviceName).toContain('Product Innovation');
      expect(res.body.data.activeFrameworks.length).toBeGreaterThanOrEqual(5);
    });
  });

  describe('POST /api/jarvis/innovation/blueprint', () => {
    it('generates full product blueprint for authorized user', async () => {
      const res = await request(app)
        .post('/api/jarvis/innovation/blueprint')
        .set('x-user-id', 'dwight')
        .send({
          title: 'JARVIS Cloud OS',
          idea: 'Decentralized autonomous AI agent workspace with verifiable security',
          category: 'ai_devtools',
          scaleTier: 'growth',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBeDefined();
      expect(res.body.data.productName).toBe('JARVIS Cloud OS');
      expect(res.body.data.marketResearch.tamSamSom.tam).toBeDefined();
      expect(res.body.data.targetPersonas.length).toBe(3);
      expect(res.body.data.features.length).toBe(6);
      expect(res.body.data.userJourney.length).toBe(5);
      expect(res.body.data.technicalBlueprint.techStack.frontend).toContain('Next.js');
      expect(res.body.data.roadmap.sprints.length).toBe(5);
      expect(res.body.data.viability.overallScorePercent).toBeGreaterThanOrEqual(70);
    });

    it('rejects creation when title or idea is missing', async () => {
      const res = await request(app)
        .post('/api/jarvis/innovation/blueprint')
        .set('x-user-id', 'dwight')
        .send({ title: 'Missing Idea' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('required');
    });

    it('returns 403 when unauthorized user attempts blueprint generation', async () => {
      const res = await request(app)
        .post('/api/jarvis/innovation/blueprint')
        .set('x-user-id', 'unauthorized_guest')
        .send({ title: 'Test', idea: 'Test Idea' });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/jarvis/innovation/blueprints', () => {
    it('lists generated blueprints', async () => {
      const res = await request(app)
        .get('/api/jarvis/innovation/blueprints')
        .set('x-user-id', 'dwight');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.count).toBeGreaterThanOrEqual(1);
    });
  });

  describe('POST /api/jarvis/innovation/research', () => {
    it('analyzes market opportunity and competitors', async () => {
      const res = await request(app)
        .post('/api/jarvis/innovation/research')
        .set('x-user-id', 'dwight')
        .send({
          idea: 'AI Agent Market Intelligence Suite',
          category: 'finance',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.tamSamSom.tam).toContain('$310 Billion');
      expect(res.body.data.competitors.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('POST /api/jarvis/innovation/personas', () => {
    it('generates target user personas', async () => {
      const res = await request(app)
        .post('/api/jarvis/innovation/personas')
        .set('x-user-id', 'dwight')
        .send({
          idea: 'NextGen Autonomous Code Compiler',
          count: 2,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(2);
      expect(res.body.data[0].jobsToBeDone.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('POST /api/jarvis/innovation/features', () => {
    it('scores features using RICE formula', async () => {
      const res = await request(app)
        .post('/api/jarvis/innovation/features')
        .set('x-user-id', 'dwight')
        .send({
          features: [
            { name: 'Feat 1', description: 'Desc 1', reach: 9, impact: 4, confidence: 0.9, effort: 3 },
            { name: 'Feat 2', description: 'Desc 2', reach: 4, impact: 2, confidence: 0.5, effort: 5 },
          ],
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(2);
      expect(res.body.data[0].rice.score).toBeGreaterThan(res.body.data[1].rice.score);
    });
  });

  describe('POST /api/jarvis/innovation/journey', () => {
    it('generates 5-stage UX journey flow', async () => {
      const res = await request(app)
        .post('/api/jarvis/innovation/journey')
        .set('x-user-id', 'dwight')
        .send({ idea: 'Voice-Driven Second Brain App' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.stepsCount).toBe(5);
    });
  });

  describe('POST /api/jarvis/innovation/technical', () => {
    it('generates technical architecture blueprint', async () => {
      const res = await request(app)
        .post('/api/jarvis/innovation/technical')
        .set('x-user-id', 'dwight')
        .send({ idea: 'High-Concurrency Agent Router', scaleTier: 'growth' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.techStack.backend).toContain('Node.js');
      expect(res.body.data.dataModels.length).toBeGreaterThanOrEqual(4);
    });
  });

  describe('POST /api/jarvis/innovation/roadmap', () => {
    it('plans agile sprint roadmap', async () => {
      const res = await request(app)
        .post('/api/jarvis/innovation/roadmap')
        .set('x-user-id', 'dwight')
        .send({ title: 'Venture 2026' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.sprints.length).toBe(5);
      expect(res.body.data.totalEstimatedWeeks).toBe(9);
    });
  });

  describe('POST /api/jarvis/innovation/viability', () => {
    it('evaluates viability and PMF score', async () => {
      const res = await request(app)
        .post('/api/jarvis/innovation/viability')
        .set('x-user-id', 'dwight')
        .send({ idea: 'Autonomous Coding Agent for Regulated Industries' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.overallScorePercent).toBeGreaterThan(60);
      expect(res.body.data.keyStrengths.length).toBeGreaterThanOrEqual(3);
    });
  });
});
