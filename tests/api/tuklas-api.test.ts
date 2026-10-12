/**
 * JARVIS Phase 12 - Tuklas REST API Integration Tests
 */

import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/server/app.js';
import { Express } from 'express';

describe('Phase 12 - Tuklas REST API Endpoints', () => {
  let app: Express;

  beforeAll(() => {
    const created = createApp();
    app = created.app;
  });

  describe('GET /api/jarvis/tuklas/status', () => {
    it('should return system status with mode and counts', async () => {
      const res = await request(app).get('/api/jarvis/tuklas/status');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.mode).toBe('local');
      expect(res.body.data.totalLessons).toBeGreaterThan(0);
      expect(res.body.data.totalStudents).toBeGreaterThan(0);
    });
  });

  describe('GET /api/jarvis/tuklas/lessons/search', () => {
    it('should search lessons by query and subject', async () => {
      const res = await request(app)
        .get('/api/jarvis/tuklas/lessons/search?q=algebra')
        .set('x-user-id', 'dwight');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.lessons.length).toBeGreaterThan(0);
    });

    it('should filter lessons by competency code', async () => {
      const res = await request(app)
        .get('/api/jarvis/tuklas/lessons/search?competencyCode=M7AL-IIa-1')
        .set('x-user-id', 'dwight');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.lessons.length).toBe(1);
    });
  });

  describe('GET /api/jarvis/tuklas/lessons/:id', () => {
    it('should return lesson details with content markdown', async () => {
      const res = await request(app)
        .get('/api/jarvis/tuklas/lessons/lesson_alg_01')
        .set('x-user-id', 'dwight');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toContain('Evaluating Algebraic Expressions');
      expect(res.body.data.contentMarkdown).toBeDefined();
    });

    it('should return 404 for unknown lesson ID', async () => {
      const res = await request(app)
        .get('/api/jarvis/tuklas/lessons/nonexistent_lesson')
        .set('x-user-id', 'dwight');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/jarvis/tuklas/lessons', () => {
    it('should create new lesson when authorized', async () => {
      const res = await request(app)
        .post('/api/jarvis/tuklas/lessons')
        .set('x-user-id', 'dwight')
        .send({
          title: 'Direct and Inverse Variation',
          subject: 'Mathematics',
          gradeLevel: 'Grade 9',
          competencyCode: 'M9AL-IIa-1',
          summary: 'Illustrates situations that involve direct, inverse, joint, and combined variation.',
          objectives: ['Differentiate between direct and inverse variation', 'Solve variation problems'],
          prerequisiteCompetencies: ['Linear Equations', 'Ratios and Proportions'],
          estimatedMinutes: 40,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBeDefined();
      expect(res.body.data.competencyCode).toBe('M9AL-IIa-1');
    });
  });

  describe('GET /api/jarvis/tuklas/students/:id/progress', () => {
    it('should return student mastery and activity log', async () => {
      const res = await request(app)
        .get('/api/jarvis/tuklas/students/student_dwight/progress')
        .set('x-user-id', 'dwight');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.overallMasteryPercent).toBe(94);
      expect(res.body.data.streakDays).toBe(14);
    });
  });

  describe('POST /api/jarvis/tuklas/practice/generate', () => {
    it('should generate adaptive practice set', async () => {
      const res = await request(app)
        .post('/api/jarvis/tuklas/practice/generate')
        .set('x-user-id', 'dwight')
        .send({ competencyCode: 'M8AL-Ia-b-1', count: 2 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('POST /api/jarvis/tuklas/assessments/evaluate', () => {
    it('should evaluate answers and calculate passing result', async () => {
      const res = await request(app)
        .post('/api/jarvis/tuklas/assessments/evaluate')
        .set('x-user-id', 'dwight')
        .send({
          assessmentId: 'assess_math_g8',
          studentId: 'student_dwight',
          answers: { item_alg_01: 'C', item_poly_02: 'B', item_poly_03: 'B' },
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.passed).toBe(true);
      expect(res.body.data.score).toBe(3);
    });
  });

  describe('POST /api/jarvis/tuklas/diagnostics/analyze-mistakes', () => {
    it('should diagnose misconception and recommend remedial lesson', async () => {
      const res = await request(app)
        .post('/api/jarvis/tuklas/diagnostics/analyze-mistakes')
        .set('x-user-id', 'dwight')
        .send({
          competencyCode: 'M8AL-Ia-b-1',
          question: 'Factor 25x² - 64y²',
          wrongAnswer: '(5x + 8y)²',
          correctAnswer: '(5x - 8y)(5x + 8y)',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.errorType).toBe('conceptual');
      expect(res.body.data.recommendedLessonId).toBe('lesson_poly_02');
    });
  });

  describe('GET /api/jarvis/tuklas/research/cohort-data', () => {
    it('should return cohort research data with anonymized student records', async () => {
      const res = await request(app)
        .get('/api/jarvis/tuklas/research/cohort-data')
        .set('x-user-id', 'dwight');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.cohortId).toBe('cohort_let_math_2025');
      expect(res.body.data.records[0].anonymizedId).toMatch(/^anon_/);
    });
  });

  describe('POST & GET /api/jarvis/tuklas/assignments', () => {
    it('should create teacher assignment and retrieve list', async () => {
      const createRes = await request(app)
        .post('/api/jarvis/tuklas/assignments')
        .set('x-user-id', 'dwight')
        .send({
          classId: 'class_section_descartes',
          title: 'Coordinate Geometry Diagnostic',
          competencyCode: 'M10GE-IIa-1',
          dueDate: '2025-04-15T23:59:59.000Z',
        });

      expect(createRes.status).toBe(201);
      expect(createRes.body.success).toBe(true);
      expect(createRes.body.data.id).toBeDefined();

      const listRes = await request(app)
        .get('/api/jarvis/tuklas/assignments?classId=class_section_descartes')
        .set('x-user-id', 'dwight');

      expect(listRes.status).toBe(200);
      expect(listRes.body.success).toBe(true);
      expect(listRes.body.data.assignments.length).toBe(1);
    });
  });
});
