/**
 * JARVIS Phase 7 - Mathematics & Learning Engine API Routes
 * Exposes endpoints for solving, Socratic pedagogy, diagnostic assessments,
 * and Philippine BLEPT LET Mathematics review.
 */

import { Router, Request, Response } from 'express';
import { JarvisCore } from '../../core/jarvis-core.js';
import { MathDomain } from '../../math/math.interface.js';
import { logger } from '../../utils/logger.js';

export function createMathRouter(jarvisCore: JarvisCore): Router {
  const router = Router();
  const mathEngine = jarvisCore.getMathematicsEngine();

  // 1. Solve mathematical problem
  router.post('/math/solve', (req: Request, res: Response) => {
    try {
      const {
        domain,
        expression,
        linear,
        quadratic,
        system2x2,
        derivative,
        integral,
        geometry,
        statistics,
        setLogic,
      } = req.body;

      if (!domain) {
        res.status(400).json({ success: false, error: 'Field "domain" is required.' });
        return;
      }

      const solution = mathEngine.solve({
        domain: domain as MathDomain,
        expression,
        linear,
        quadratic,
        system2x2,
        derivative,
        integral,
        geometry,
        statistics,
        setLogic,
      });

      res.json({
        success: true,
        data: solution,
      });
    } catch (err: any) {
      logger.warn('Math solve error', { error: err.message });
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // 2. Worked example
  router.get('/math/worked-example', (req: Request, res: Response) => {
    try {
      const domain = req.query.domain as MathDomain;
      const topic = req.query.topic as string | undefined;

      if (!domain) {
        res.status(400).json({ success: false, error: 'Query param "domain" is required.' });
        return;
      }

      const workedExample = mathEngine.getWorkedExample(domain, topic);
      res.json({ success: true, data: workedExample });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // 3. Generate diagnostic assessment
  router.post('/math/assess', (req: Request, res: Response) => {
    try {
      const { domain } = req.body;
      const userId = (req.headers['x-user-id'] as string) || req.body.userId || 'default_user';

      if (!domain) {
        res.status(400).json({ success: false, error: 'Field "domain" is required.' });
        return;
      }

      const assessment = mathEngine.generateAssessment(userId, domain as MathDomain);
      res.json({ success: true, data: assessment });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // 4. Diagnose assessment submissions
  router.post('/math/diagnose', (req: Request, res: Response) => {
    try {
      const { domain, submissions } = req.body;
      const userId = (req.headers['x-user-id'] as string) || req.body.userId || 'default_user';

      if (!domain || !Array.isArray(submissions)) {
        res.status(400).json({ success: false, error: 'Fields "domain" and "submissions" array are required.' });
        return;
      }

      const diagnosis = mathEngine.diagnoseAssessment(userId, domain as MathDomain, submissions);
      res.json({ success: true, data: diagnosis });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // 5. Teach prerequisite concept
  router.get('/math/prerequisite', (req: Request, res: Response) => {
    try {
      const topic = req.query.topic as string;
      if (!topic) {
        res.status(400).json({ success: false, error: 'Query param "topic" is required.' });
        return;
      }

      const teaching = mathEngine.teachPrerequisite(topic);
      res.json({ success: true, data: teaching });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // 6. Check student answer
  router.post('/math/check-answer', (req: Request, res: Response) => {
    try {
      const { domain, studentAnswer, expectedAnswer, topic } = req.body;
      const userId = (req.headers['x-user-id'] as string) || req.body.userId || 'default_user';

      if (!domain || studentAnswer === undefined || expectedAnswer === undefined) {
        res.status(400).json({
          success: false,
          error: 'Fields "domain", "studentAnswer", and "expectedAnswer" are required.',
        });
        return;
      }

      const evaluation = mathEngine.checkPracticeAnswer(
        userId,
        domain as MathDomain,
        studentAnswer,
        expectedAnswer,
        topic
      );

      res.json({ success: true, data: evaluation });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // 7. Get user mastery in domain
  router.get('/math/user-mastery', (req: Request, res: Response) => {
    try {
      const domain = req.query.domain as MathDomain;
      const userId = (req.headers['x-user-id'] as string) || (req.query.userId as string) || 'default_user';

      if (!domain) {
        res.status(400).json({ success: false, error: 'Query param "domain" is required.' });
        return;
      }

      const mastery = mathEngine.getUserMastery(userId, domain);
      res.json({ success: true, data: mastery });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // 8. LET competencies
  router.get('/math/let/competencies', (_req: Request, res: Response) => {
    try {
      const comps = mathEngine.getLetCompetencies();
      res.json({ success: true, count: comps.length, data: comps });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 9. LET mock exam
  router.get('/math/let/mock-exam', (req: Request, res: Response) => {
    try {
      const competencyCode = req.query.competencyCode as string | undefined;
      const count = req.query.count ? parseInt(req.query.count as string, 10) : undefined;

      const exam = mathEngine.generateLetMockExam({ competencyCode, count });
      res.json({ success: true, data: exam });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // 10. LET evaluate submission
  router.post('/math/let/evaluate', (req: Request, res: Response) => {
    try {
      const { answers } = req.body;
      if (!answers || typeof answers !== 'object') {
        res.status(400).json({ success: false, error: 'Field "answers" object is required.' });
        return;
      }

      const result = mathEngine.evaluateLetExam(answers);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  return router;
}
