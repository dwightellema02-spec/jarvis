import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/server/app.js';
import { Express } from 'express';

describe('Phase 9 - Data & Statistics REST API Endpoints', () => {
  let app: Express;

  const sampleCsv = `
study_hours,practice_exams,let_score
10,2,82
15,3,86
20,5,91
25,6,95
30,8,98
  `.trim();

  beforeAll(() => {
    const created = createApp();
    app = created.app;
  });

  describe('POST /api/jarvis/data/clean', () => {
    it('should clean and profile tabular CSV data', async () => {
      const res = await request(app)
        .post('/api/jarvis/data/clean')
        .send({
          csvContent: sampleCsv,
          cleaningOptions: { deduplicate: true },
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.headers).toEqual(['study_hours', 'practice_exams', 'let_score']);
      expect(res.body.data.cleanedRowCount).toBe(5);
      expect(res.body.data.columnProfiles.let_score.type).toBe('numeric');
    });
  });

  describe('POST /api/jarvis/data/descriptive', () => {
    it('should compute descriptive summary statistics on a selected column', async () => {
      const res = await request(app)
        .post('/api/jarvis/data/descriptive')
        .send({
          csvContent: sampleCsv,
          column: 'let_score',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.count).toBe(5);
      expect(res.body.data.mean).toBeCloseTo(90.4, 1);
      expect(res.body.data.min).toBe(82);
      expect(res.body.data.max).toBe(98);
      expect(res.body.data.range).toBe(16);
    });
  });

  describe('POST /api/jarvis/data/correlation', () => {
    it('should compute Pearson and Spearman correlation between two columns', async () => {
      const res = await request(app)
        .post('/api/jarvis/data/correlation')
        .send({
          csvContent: sampleCsv,
          xColumn: 'study_hours',
          yColumn: 'let_score',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.pearsonR).toBeGreaterThan(0.9);
      expect(res.body.data.direction).toBe('positive');
      expect(res.body.data.strength).toBe('very_strong');
    });
  });

  describe('POST /api/jarvis/data/regression', () => {
    it('should fit linear regression model y = mx + b', async () => {
      const res = await request(app)
        .post('/api/jarvis/data/regression')
        .send({
          csvContent: sampleCsv,
          xColumn: 'study_hours',
          yColumn: 'let_score',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.slope).toBeGreaterThan(0);
      expect(res.body.data.equation).toContain('let_score =');
      expect(res.body.data.r2).toBeGreaterThan(0.9);
      expect(res.body.data.predictions.length).toBe(5);
    });
  });

  describe('POST /api/jarvis/data/t-test', () => {
    it('should evaluate one-sample t-test against passing threshold', async () => {
      const res = await request(app)
        .post('/api/jarvis/data/t-test')
        .send({
          csvContent: sampleCsv,
          type: 'one_sample',
          column1: 'let_score',
          hypothesizedMean: 75.0, // Official LET pass mark
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.sample1Stats.mean).toBeCloseTo(90.4, 1);
      expect(res.body.data.isSignificant).toBe(true);
      expect(res.body.data.conclusion).toContain('Reject H₀');
    });
  });

  describe('POST /api/jarvis/data/visualize', () => {
    it('should render SVG bar chart and ASCII representation', async () => {
      const res = await request(app)
        .post('/api/jarvis/data/visualize')
        .send({
          csvContent: sampleCsv,
          chartConfig: {
            type: 'bar',
            title: 'Study Hours vs LET Score',
            xColumn: 'study_hours',
            yColumn: 'let_score',
          },
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.svg).toContain('<svg');
      expect(res.body.data.ascii).toBeDefined();
    });
  });

  describe('POST /api/jarvis/data/pipeline and /data/to-knowledge', () => {
    it('should run end-to-end analytics pipeline and ingest findings to Second Brain', async () => {
      const pipeRes = await request(app)
        .post('/api/jarvis/data/pipeline')
        .send({
          csvContent: sampleCsv,
          cleaningOptions: { deduplicate: true },
          descriptiveColumns: ['study_hours', 'let_score'],
          correlationPairs: [{ x: 'study_hours', y: 'let_score' }],
          regressionPairs: [{ x: 'study_hours', y: 'let_score' }],
          hypothesisTests: [
            { type: 'one_sample', column1: 'let_score', hypothesizedMean: 75 },
          ],
        });

      expect(pipeRes.status).toBe(200);
      expect(pipeRes.body.success).toBe(true);
      expect(pipeRes.body.data.dataset.cleanedRowCount).toBe(5);
      expect(pipeRes.body.data.correlations.length).toBe(1);
      expect(pipeRes.body.data.regressions.length).toBe(1);
      expect(pipeRes.body.data.narrativeReport).toContain('Executive Statistical Report');

      // Ingest to Second Brain
      const ingestRes = await request(app)
        .post('/api/jarvis/data/to-knowledge')
        .set('x-user-id', 'default_user')
        .send({
          title: 'Study Hours Empirical Synthesis',
          pipelineResult: pipeRes.body.data,
        });

      expect(ingestRes.status).toBe(200);
      expect(ingestRes.body.success).toBe(true);
      expect(ingestRes.body.data.nodeId).toBeDefined();
    });
  });
});
