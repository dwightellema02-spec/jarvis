import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/server/app.js';
import { Express } from 'express';

describe('Phase 8 - Research Engine REST API Endpoints', () => {
  let app: Express;

  beforeAll(() => {
    const created = createApp();
    app = created.app;
  });

  describe('GET /api/jarvis/research/sources', () => {
    it('should return catalog of research sources', async () => {
      const res = await request(app).get('/api/jarvis/research/sources');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBeGreaterThanOrEqual(2);
    });
  });

  describe('POST /api/jarvis/research/sources', () => {
    it('should add a research source with valid public URL', async () => {
      const res = await request(app)
        .post('/api/jarvis/research/sources')
        .send({
          title: 'Quantum Computing and Cryptography',
          authors: ['Alice Smith', 'Bob Jones'],
          publishedYear: 2025,
          publisher: 'Academic Press',
          url: 'https://academic.example.org/paper.pdf',
          sourceType: 'peer_reviewed',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBeDefined();
    });

    it('should reject source with SSRF localhost URL', async () => {
      const res = await request(app)
        .post('/api/jarvis/research/sources')
        .send({
          title: 'Exploit Source',
          authors: ['Attacker'],
          url: 'http://127.0.0.1:3000/internal',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Security Violation');
    });
  });

  describe('POST /api/jarvis/research/classify', () => {
    it('should classify epistemic text into categories with counts', async () => {
      const res = await request(app)
        .post('/api/jarvis/research/classify')
        .send({
          text: 'In 2024, 1200 examinees completed the test. The authors argue that this model is superior. It is possibly an anomaly.',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalStatements).toBe(3);
      expect(res.body.data.counts.FACT).toBeGreaterThanOrEqual(1);
      expect(res.body.data.counts.CLAIM).toBeGreaterThanOrEqual(1);
      expect(res.body.data.counts.UNCERTAINTY).toBeGreaterThanOrEqual(1);
    });
  });

  describe('GET /api/jarvis/research/citations/:sourceId', () => {
    it('should generate multi-format citations for existing source', async () => {
      const res = await request(app).get('/api/jarvis/research/citations/src_prc_blept');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(5); // APA, IEEE, Chicago, Harvard, BibTeX
      expect(res.body.data.find((c: any) => c.format === 'APA')).toBeDefined();
    });
  });

  describe('POST /api/jarvis/research/compare', () => {
    it('should compare two sources and output consensus summary', async () => {
      const res = await request(app)
        .post('/api/jarvis/research/compare')
        .send({
          sourceIds: ['src_prc_blept', 'src_tuklas_pedagogy'],
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.consensusLevel).toBeDefined();
      expect(res.body.data.pointsOfAgreement.length).toBeGreaterThan(0);
    });
  });

  describe('POST /api/jarvis/research/questions', () => {
    it('should generate PICO research question with hypotheses', async () => {
      const res = await request(app)
        .post('/api/jarvis/research/questions')
        .send({
          topic: 'Calculus Learning',
          population: 'First-year Engineering Students',
          intervention: 'Visual Geometric Simulation',
          comparison: 'Standard Symbolic Drill',
          outcome: 'Derivative Formulation Accuracy',
          framework: 'PICO',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.primaryQuestion).toContain('Visual Geometric Simulation');
      expect(res.body.data.hypotheses.nullHypothesis).toBeDefined();
    });
  });

  describe('POST /api/jarvis/research/notes & Ingestion to Second Brain', () => {
    it('should create research note and ingest into Second Brain', async () => {
      const noteRes = await request(app)
        .post('/api/jarvis/research/notes')
        .set('x-user-id', 'dwight')
        .send({
          title: 'Philippine EdTech Research Overview',
          topic: 'EdTech and Teacher Review',
          rawText: 'In 2025, 450 students participated. The method accelerates mastery. Therefore scores increase.',
          sourceIds: ['src_prc_blept'],
        });

      expect(noteRes.status).toBe(201);
      expect(noteRes.body.success).toBe(true);
      const noteId = noteRes.body.data.id;

      // Ingest note to Second Brain
      const ingestRes = await request(app)
        .post(`/api/jarvis/research/notes/${noteId}/to-knowledge`)
        .set('x-user-id', 'dwight');

      expect(ingestRes.status).toBe(200);
      expect(ingestRes.body.success).toBe(true);
      expect(ingestRes.body.data.createdNodeIds.length).toBe(2);
    });
  });
});
