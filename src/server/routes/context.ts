import { Router, Request, Response } from 'express';
import { PersonalContextManager } from '../../context/context-manager.js';

export function createContextRouter(manager: PersonalContextManager): Router {
  const router = Router();

  const getUser = (req: Request): string => {
    return (req.headers['x-user-id'] as string) || 'dwight';
  };

  // GET /api/jarvis/context/snapshot - Retrieve unified context snapshot
  router.get('/snapshot', async (req: Request, res: Response) => {
    try {
      const user = getUser(req);
      const snapshot = await manager.getSnapshot(user);
      return res.json({ success: true, data: snapshot });
    } catch (err: any) {
      return res.status(403).json({ success: false, error: err.message });
    }
  });

  // POST /api/jarvis/context/focus - Activate or update focus session
  router.post('/focus', (req: Request, res: Response) => {
    try {
      const user = getUser(req);
      const { mode, goal, project, durationMinutes, notes } = req.body;
      if (!goal) {
        return res.status(400).json({ success: false, error: 'Field "goal" is required.' });
      }
      const session = manager.setFocusSession(
        { mode: mode || 'deep_work', goal, project, targetDurationMinutes: durationMinutes, notes },
        user
      );
      return res.json({ success: true, data: session });
    } catch (err: any) {
      return res.status(403).json({ success: false, error: err.message });
    }
  });

  // POST /api/jarvis/context/focus/end - End active focus session
  router.post('/focus/end', (req: Request, res: Response) => {
    try {
      const user = getUser(req);
      const session = manager.endFocusSession(user);
      return res.json({ success: true, data: session || { message: 'No active session' } });
    } catch (err: any) {
      return res.status(403).json({ success: false, error: err.message });
    }
  });

  // POST /api/jarvis/context/query - Query relevant context blend
  router.post('/query', async (req: Request, res: Response) => {
    try {
      const user = getUser(req);
      const { actionOrGoal, includeProfile, includeGoals, includeMemories, includeKnowledgeNodes } = req.body;
      if (!actionOrGoal) {
        return res.status(400).json({ success: false, error: 'Field "actionOrGoal" is required.' });
      }
      const result = await manager.queryContext(
        { actionOrGoal, includeProfile, includeGoals, includeMemories, includeKnowledgeNodes },
        user
      );
      return res.json({ success: true, data: result });
    } catch (err: any) {
      return res.status(403).json({ success: false, error: err.message });
    }
  });

  // GET /api/jarvis/context/activities - List activity timeline
  router.get('/activities', (req: Request, res: Response) => {
    try {
      const user = getUser(req);
      const category = req.query.category as any;
      const limit = req.query.limit ? Number(req.query.limit) : undefined;
      const activities = manager.listActivities({ category, limit }, user);
      return res.json({ success: true, count: activities.length, data: activities });
    } catch (err: any) {
      return res.status(403).json({ success: false, error: err.message });
    }
  });

  // POST /api/jarvis/context/activities - Log new activity
  router.post('/activities', (req: Request, res: Response) => {
    try {
      const user = getUser(req);
      const { category, action, summary, metadata } = req.body;
      if (!category || !action || !summary) {
        return res.status(400).json({ success: false, error: 'Fields "category", "action", and "summary" are required.' });
      }
      const item = manager.logActivity({ userId: user, category, action, summary, metadata });
      return res.json({ success: true, data: item });
    } catch (err: any) {
      return res.status(403).json({ success: false, error: err.message });
    }
  });

  // GET /api/jarvis/context/cognitive-load - Assess cognitive load
  router.get('/cognitive-load', (req: Request, res: Response) => {
    try {
      const user = getUser(req);
      const cognitive = manager.assessCognitiveLoad(user);
      return res.json({ success: true, data: cognitive });
    } catch (err: any) {
      return res.status(403).json({ success: false, error: err.message });
    }
  });

  // GET /api/jarvis/context/overview - Unified dashboard overview
  router.get('/overview', async (req: Request, res: Response) => {
    try {
      const user = getUser(req);
      const overview = await manager.getDashboardOverview(user);
      return res.json({ success: true, data: overview });
    } catch (err: any) {
      return res.status(403).json({ success: false, error: err.message });
    }
  });

  // GET /api/jarvis/context/insights - Cross-system contextual insights
  router.get('/insights', async (req: Request, res: Response) => {
    try {
      const user = getUser(req);
      const insights = await manager.generateInsights(user);
      return res.json({ success: true, count: insights.length, data: insights });
    } catch (err: any) {
      return res.status(403).json({ success: false, error: err.message });
    }
  });

  return router;
}
