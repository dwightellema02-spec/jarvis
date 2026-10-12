import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/server/app.js';
import { Express } from 'express';

describe('Phase 7 - Mathematics & Learning REST API Endpoints', () => {
  let app: Express;

  beforeAll(() => {
    const created = createApp();
    app = created.app;
  });

  describe('POST /api/jarvis/math/solve', () => {
    it('should solve arithmetic expression with PEMDAS steps', async () => {
      const res = await request(app)
        .post('/api/jarvis/math/solve')
        .send({
          domain: 'arithmetic',
          expression: '25 + 5 * 4 - 10 / 2',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.result).toBe(40);
      expect(res.body.data.steps.length).toBeGreaterThan(0);
    });

    it('should solve quadratic equation ax^2 + bx + c = 0', async () => {
      const res = await request(app)
        .post('/api/jarvis/math/solve')
        .send({
          domain: 'algebra',
          quadratic: { a: 1, b: -7, c: 10 },
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.result.rootType).toBe('two_real');
      expect(res.body.data.result.roots[0].real).toBe(5);
      expect(res.body.data.result.roots[1].real).toBe(2);
    });

    it('should differentiate polynomials', async () => {
      const res = await request(app)
        .post('/api/jarvis/math/solve')
        .send({
          domain: 'differential_calculus',
          derivative: {
            terms: [
              { coefficient: 4, exponent: 3 },
              { coefficient: -5, exponent: 1 },
            ],
            evaluateAt: 2,
          },
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      // d/dx[4x^3 - 5x] = 12x^2 - 5; at x=2 => 12(4) - 5 = 43
      expect(res.body.data.result.derivativeAtPoint.slope).toBe(43);
    });

    it('should compute descriptive statistics on dataset', async () => {
      const res = await request(app)
        .post('/api/jarvis/math/solve')
        .send({
          domain: 'statistics',
          statistics: {
            data: [10, 20, 30, 40, 50],
          },
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.result.mean).toBe(30);
      expect(res.body.data.result.median).toBe(30);
    });
  });

  describe('Socratic Learning Endpoints', () => {
    it('GET /api/jarvis/math/worked-example should return worked example', async () => {
      const res = await request(app).get('/api/jarvis/math/worked-example?domain=algebra');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.steps.length).toBeGreaterThan(0);
      expect(res.body.data.keyTakeaways.length).toBeGreaterThan(0);
    });

    it('POST /api/jarvis/math/assess should generate diagnostic test', async () => {
      const res = await request(app)
        .post('/api/jarvis/math/assess')
        .send({ domain: 'algebra' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.problems.length).toBeGreaterThan(0);
    });

    it('POST /api/jarvis/math/check-answer should evaluate student answer', async () => {
      const res = await request(app)
        .post('/api/jarvis/math/check-answer')
        .send({
          domain: 'algebra',
          studentAnswer: '7',
          expectedAnswer: '7',
          topic: 'Linear Equations',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.isCorrect).toBe(true);
      expect(res.body.data.score).toBe(1.0);
    });
  });

  describe('LET Board Exam Endpoints', () => {
    it('GET /api/jarvis/math/let/competencies should list BLEPT competencies', async () => {
      const res = await request(app).get('/api/jarvis/math/let/competencies');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(6);
    });

    it('GET /api/jarvis/math/let/mock-exam should generate mock exam', async () => {
      const res = await request(app).get('/api/jarvis/math/let/mock-exam');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalQuestions).toBe(20);
    });

    it('POST /api/jarvis/math/let/evaluate should evaluate submitted answers', async () => {
      const res = await request(app)
        .post('/api/jarvis/math/let/evaluate')
        .send({
          answers: {
            'LET-Q01': 'C',
            'LET-Q02': 'A',
          },
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.total).toBe(20);
      expect(res.body.data.questionEvaluations.length).toBe(20);
    });
  });
});
