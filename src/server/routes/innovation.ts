/**
 * JARVIS Phase 15 - Innovation & Venture Architecture REST API Routes
 */

import { Router, Request, Response } from 'express';
import { InnovationManager } from '../../innovation/innovation-manager.js';

export function createInnovationRouter(innovationManager: InnovationManager): Router {
  const router = Router();

  const isPermError = (msg: string) => /permission denied/i.test(msg);

  // 1. Get Innovation System Status
  router.get('/innovation/status', async (_req: Request, res: Response) => {
    try {
      const status = innovationManager.getSystemStatus();
      res.json({ success: true, data: status });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 2. Synthesize Full Product Blueprint
  router.post('/innovation/blueprint', async (req: Request, res: Response) => {
    try {
      const userId = (req.headers['x-user-id'] as string) || 'default_user';
      const { title, tagline, idea, category, scaleTier } = req.body;
      if (!title || !idea) {
        res.status(400).json({ success: false, error: 'Fields "title" and "idea" are required.' });
        return;
      }
      const blueprint = await innovationManager.createProductBlueprint(
        { title, tagline, idea, category, scaleTier },
        userId
      );
      res.json({ success: true, data: blueprint });
    } catch (err: any) {
      res.status(isPermError(err.message) ? 403 : 400).json({
        success: false,
        error: err.message,
      });
    }
  });

  // 3. Get Blueprint by ID
  router.get('/innovation/blueprint/:id', async (req: Request, res: Response) => {
    try {
      const userId = (req.headers['x-user-id'] as string) || 'default_user';
      const bp = innovationManager.getBlueprint(req.params.id, userId);
      if (!bp) {
        res.status(404).json({ success: false, error: 'Product blueprint not found.' });
        return;
      }
      res.json({ success: true, data: bp });
    } catch (err: any) {
      res.status(isPermError(err.message) ? 403 : 500).json({
        success: false,
        error: err.message,
      });
    }
  });

  // 4. List all Blueprints
  router.get('/innovation/blueprints', async (req: Request, res: Response) => {
    try {
      const userId = (req.headers['x-user-id'] as string) || 'default_user';
      const list = innovationManager.listBlueprints(userId);
      res.json({ success: true, data: list, count: list.length });
    } catch (err: any) {
      res.status(isPermError(err.message) ? 403 : 500).json({
        success: false,
        error: err.message,
      });
    }
  });

  // 5. Research Market
  router.post('/innovation/research', async (req: Request, res: Response) => {
    try {
      const userId = (req.headers['x-user-id'] as string) || 'default_user';
      const { idea, category } = req.body;
      if (!idea) {
        res.status(400).json({ success: false, error: 'Field "idea" is required.' });
        return;
      }
      const research = await innovationManager.researchMarket(idea, category, userId);
      res.json({ success: true, data: research });
    } catch (err: any) {
      res.status(isPermError(err.message) ? 403 : 400).json({
        success: false,
        error: err.message,
      });
    }
  });

  // 6. Define User Personas
  router.post('/innovation/personas', async (req: Request, res: Response) => {
    try {
      const userId = (req.headers['x-user-id'] as string) || 'default_user';
      const { idea, count } = req.body;
      if (!idea) {
        res.status(400).json({ success: false, error: 'Field "idea" is required.' });
        return;
      }
      const personas = await innovationManager.defineUserPersonas(idea, count || 3, userId);
      res.json({ success: true, data: personas, count: personas.length });
    } catch (err: any) {
      res.status(isPermError(err.message) ? 403 : 400).json({
        success: false,
        error: err.message,
      });
    }
  });

  // 7. Prioritize Features
  router.post('/innovation/features', async (req: Request, res: Response) => {
    try {
      const userId = (req.headers['x-user-id'] as string) || 'default_user';
      const { features } = req.body;
      if (!features || !Array.isArray(features)) {
        res.status(400).json({ success: false, error: 'Field "features" array is required.' });
        return;
      }
      const prioritized = await innovationManager.prioritizeFeatures(features, userId);
      res.json({ success: true, data: prioritized, count: prioritized.length });
    } catch (err: any) {
      res.status(isPermError(err.message) ? 403 : 400).json({
        success: false,
        error: err.message,
      });
    }
  });

  // 8. Design UX Journey
  router.post('/innovation/journey', async (req: Request, res: Response) => {
    try {
      const userId = (req.headers['x-user-id'] as string) || 'default_user';
      const { idea } = req.body;
      if (!idea) {
        res.status(400).json({ success: false, error: 'Field "idea" is required.' });
        return;
      }
      const journey = await innovationManager.designUxJourney(idea, userId);
      res.json({ success: true, data: journey, stepsCount: journey.length });
    } catch (err: any) {
      res.status(isPermError(err.message) ? 403 : 400).json({
        success: false,
        error: err.message,
      });
    }
  });

  // 9. Generate Technical Architecture Blueprint
  router.post('/innovation/technical', async (req: Request, res: Response) => {
    try {
      const userId = (req.headers['x-user-id'] as string) || 'default_user';
      const { idea, scaleTier } = req.body;
      if (!idea) {
        res.status(400).json({ success: false, error: 'Field "idea" is required.' });
        return;
      }
      const blueprint = await innovationManager.generateTechBlueprint(idea, scaleTier || 'starter', userId);
      res.json({ success: true, data: blueprint });
    } catch (err: any) {
      res.status(isPermError(err.message) ? 403 : 400).json({
        success: false,
        error: err.message,
      });
    }
  });

  // 10. Plan Sprint Roadmap
  router.post('/innovation/roadmap', async (req: Request, res: Response) => {
    try {
      const userId = (req.headers['x-user-id'] as string) || 'default_user';
      const { title, features } = req.body;
      if (!title) {
        res.status(400).json({ success: false, error: 'Field "title" is required.' });
        return;
      }
      const roadmap = await innovationManager.planSprintRoadmap(title, features || [], userId);
      res.json({ success: true, data: roadmap });
    } catch (err: any) {
      res.status(isPermError(err.message) ? 403 : 400).json({
        success: false,
        error: err.message,
      });
    }
  });

  // 11. Evaluate Product Viability
  router.post('/innovation/viability', async (req: Request, res: Response) => {
    try {
      const userId = (req.headers['x-user-id'] as string) || 'default_user';
      const { idea } = req.body;
      if (!idea) {
        res.status(400).json({ success: false, error: 'Field "idea" is required.' });
        return;
      }
      const viability = await innovationManager.evaluateViability(idea, undefined, undefined, userId);
      res.json({ success: true, data: viability });
    } catch (err: any) {
      res.status(isPermError(err.message) ? 403 : 400).json({
        success: false,
        error: err.message,
      });
    }
  });

  return router;
}
