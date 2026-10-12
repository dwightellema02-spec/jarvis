/**
 * JARVIS Phase 12 - Tuklas REST API Routes
 */

import { Router, Request, Response } from 'express';
import { TuklasManager } from '../../tuklas/tuklas-manager.js';

export function createTuklasRouter(tuklasManager: TuklasManager): Router {
  const router = Router();

  // 1. Status
  router.get('/tuklas/status', (req: Request, res: Response) => {
    try {
      const status = tuklasManager.getStatus();
      res.json({ success: true, data: status });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 2. Search Lessons
  router.get('/tuklas/lessons/search', async (req: Request, res: Response) => {
    try {
      const userId = (req.headers['x-user-id'] as string) || 'default_user';
      const filter = {
        query: req.query.q as string,
        subject: req.query.subject as string,
        gradeLevel: req.query.gradeLevel as string,
        competencyCode: req.query.competencyCode as string,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
      };

      const lessons = await tuklasManager.searchLessons(filter, userId);
      res.json({ success: true, data: { lessons, count: lessons.length } });
    } catch (err: any) {
      res.status(err.message.includes('Permission Denied') ? 403 : 400).json({
        success: false,
        error: err.message,
      });
    }
  });

  // 3. Get Lesson by ID
  router.get('/tuklas/lessons/:id', async (req: Request, res: Response) => {
    try {
      const userId = (req.headers['x-user-id'] as string) || 'default_user';
      const lesson = await tuklasManager.getLessonById(req.params.id, userId);
      if (!lesson) {
        res.status(404).json({ success: false, error: `Lesson "${req.params.id}" not found.` });
        return;
      }
      res.json({ success: true, data: lesson });
    } catch (err: any) {
      res.status(err.message.includes('Permission Denied') ? 403 : 400).json({
        success: false,
        error: err.message,
      });
    }
  });

  // 4. Create Lesson (Teacher Function)
  router.post('/tuklas/lessons', async (req: Request, res: Response) => {
    try {
      const userId = (req.headers['x-user-id'] as string) || 'default_user';
      const { title, subject, gradeLevel, competencyCode, summary, objectives, prerequisiteCompetencies, contentMarkdown, estimatedMinutes, tags, author } = req.body;

      if (!title || !subject || !competencyCode) {
        res.status(400).json({ success: false, error: 'Fields "title", "subject", and "competencyCode" are required.' });
        return;
      }

      const lesson = await tuklasManager.createLesson(
        {
          title,
          subject,
          gradeLevel: gradeLevel || 'Grade 8',
          competencyCode,
          summary: summary || '',
          objectives: objectives || [],
          prerequisiteCompetencies: prerequisiteCompetencies || [],
          contentMarkdown: contentMarkdown || `# ${title}`,
          estimatedMinutes: estimatedMinutes || 30,
          tags: tags || [],
          author: author || userId,
        },
        userId
      );

      res.status(201).json({ success: true, data: lesson });
    } catch (err: any) {
      res.status(err.message.includes('Permission Denied') ? 403 : 400).json({
        success: false,
        error: err.message,
      });
    }
  });

  // 5. Check Student Progress
  router.get('/tuklas/students/:id/progress', async (req: Request, res: Response) => {
    try {
      const userId = (req.headers['x-user-id'] as string) || 'default_user';
      const progress = await tuklasManager.getStudentProgress(req.params.id, userId);
      if (!progress) {
        res.status(404).json({ success: false, error: `Student "${req.params.id}" not found.` });
        return;
      }
      res.json({ success: true, data: progress });
    } catch (err: any) {
      res.status(err.message.includes('Permission Denied') ? 403 : 400).json({
        success: false,
        error: err.message,
      });
    }
  });

  // 6. Generate Practice Set
  router.post('/tuklas/practice/generate', async (req: Request, res: Response) => {
    try {
      const userId = (req.headers['x-user-id'] as string) || 'default_user';
      const { competencyCode, difficulty, count, subject } = req.body;

      const practice = await tuklasManager.generatePractice(
        { competencyCode, difficulty, count, subject },
        userId
      );
      res.json({ success: true, data: practice });
    } catch (err: any) {
      res.status(err.message.includes('Permission Denied') ? 403 : 400).json({
        success: false,
        error: err.message,
      });
    }
  });

  // 7. Evaluate Assessment
  router.post('/tuklas/assessments/evaluate', async (req: Request, res: Response) => {
    try {
      const userId = (req.headers['x-user-id'] as string) || 'default_user';
      const { assessmentId, studentId, answers } = req.body;

      if (!assessmentId || !studentId || !answers) {
        res.status(400).json({
          success: false,
          error: 'Fields "assessmentId", "studentId", and "answers" are required.',
        });
        return;
      }

      const result = await tuklasManager.evaluateAssessment(
        { assessmentId, studentId, answers },
        userId
      );
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(err.message.includes('Permission Denied') ? 403 : 400).json({
        success: false,
        error: err.message,
      });
    }
  });

  // 8. Analyze Mistake
  router.post('/tuklas/diagnostics/analyze-mistakes', async (req: Request, res: Response) => {
    try {
      const userId = (req.headers['x-user-id'] as string) || 'default_user';
      const { competencyCode, wrongAnswer, correctAnswer, question, studentId } = req.body;

      if (!competencyCode || !wrongAnswer || !correctAnswer) {
        res.status(400).json({
          success: false,
          error: 'Fields "competencyCode", "wrongAnswer", and "correctAnswer" are required.',
        });
        return;
      }

      const result = await tuklasManager.analyzeMistake(
        { competencyCode, wrongAnswer, correctAnswer, question, studentId },
        userId
      );
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(err.message.includes('Permission Denied') ? 403 : 400).json({
        success: false,
        error: err.message,
      });
    }
  });

  // 9. Cohort Research Data
  router.get('/tuklas/research/cohort-data', async (req: Request, res: Response) => {
    try {
      const userId = (req.headers['x-user-id'] as string) || 'default_user';
      const cohortId = (req.query.cohortId as string) || undefined;

      const data = await tuklasManager.getCohortResearchData(cohortId, userId);
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(err.message.includes('Permission Denied') ? 403 : 400).json({
        success: false,
        error: err.message,
      });
    }
  });

  // 10. Create Teacher Assignment
  router.post('/tuklas/assignments', async (req: Request, res: Response) => {
    try {
      const userId = (req.headers['x-user-id'] as string) || 'default_user';
      const { classId, title, competencyCode, dueDate, lessonId, instructions } = req.body;

      if (!classId || !title || !competencyCode || !dueDate) {
        res.status(400).json({
          success: false,
          error: 'Fields "classId", "title", "competencyCode", and "dueDate" are required.',
        });
        return;
      }

      const assignment = await tuklasManager.createAssignment(
        { classId, title, competencyCode, dueDate, lessonId, instructions },
        userId
      );
      res.status(201).json({ success: true, data: assignment });
    } catch (err: any) {
      res.status(err.message.includes('Permission Denied') ? 403 : 400).json({
        success: false,
        error: err.message,
      });
    }
  });

  // 11. List Teacher Assignments
  router.get('/tuklas/assignments', async (req: Request, res: Response) => {
    try {
      const userId = (req.headers['x-user-id'] as string) || 'default_user';
      const classId = (req.query.classId as string) || undefined;

      const assignments = await tuklasManager.listAssignments(classId, userId);
      res.json({ success: true, data: { assignments, count: assignments.length } });
    } catch (err: any) {
      res.status(err.message.includes('Permission Denied') ? 403 : 400).json({
        success: false,
        error: err.message,
      });
    }
  });

  return router;
}
