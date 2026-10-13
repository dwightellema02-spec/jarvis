import { Router, Request, Response } from 'express';
import { MultiAgentManager } from '../../collaboration/multi-agent-manager.js';

export function createCollaborationRouter(manager: MultiAgentManager): Router {
  const router = Router();

  const getUser = (req: Request): string => {
    return (req.headers['x-user-id'] as string) || 'dwight';
  };

  // GET /api/jarvis/collaboration/templates - List predefined collaboration templates
  router.get('/templates', (req: Request, res: Response) => {
    try {
      const templates = manager.listTemplates();
      return res.json({ success: true, count: templates.length, data: templates });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // GET /api/jarvis/collaboration/missions - List all missions
  router.get('/missions', (req: Request, res: Response) => {
    try {
      const user = getUser(req);
      const statusFilter = req.query.status as any;
      const missions = manager.listMissions(statusFilter, user);
      return res.json({ success: true, count: missions.length, data: missions });
    } catch (err: any) {
      return res.status(403).json({ success: false, error: err.message });
    }
  });

  // GET /api/jarvis/collaboration/missions/:id - Get mission details
  router.get('/missions/:id', (req: Request, res: Response) => {
    try {
      const user = getUser(req);
      const mission = manager.getMission(req.params.id, user);
      return res.json({ success: true, data: mission });
    } catch (err: any) {
      return res.status(404).json({ success: false, error: err.message });
    }
  });

  // POST /api/jarvis/collaboration/missions - Create a new mission
  router.post('/missions', (req: Request, res: Response) => {
    try {
      const user = getUser(req);
      const mission = manager.createMission(req.body, user);
      return res.status(201).json({ success: true, data: mission });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  });

  // POST /api/jarvis/collaboration/missions/:id/run - Execute a mission
  router.post('/missions/:id/run', async (req: Request, res: Response) => {
    try {
      const user = getUser(req);
      const mission = await manager.runMission(req.params.id, user);
      return res.json({ success: true, data: mission });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  });

  // GET /api/jarvis/collaboration/missions/:id/blackboard - Read blackboard
  router.get('/missions/:id/blackboard', (req: Request, res: Response) => {
    try {
      const user = getUser(req);
      const key = req.query.key as string | undefined;
      const data = manager.readBlackboard(req.params.id, key, user);
      return res.json({ success: true, data });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  });

  // POST /api/jarvis/collaboration/missions/:id/blackboard - Write to blackboard
  router.post('/missions/:id/blackboard', (req: Request, res: Response) => {
    try {
      const user = getUser(req);
      const { key, value, author } = req.body;
      if (!key || value === undefined) {
        return res.status(400).json({ success: false, error: 'Fields "key" and "value" are required.' });
      }
      const entry = manager.writeBlackboard(req.params.id, key, value, author, user);
      return res.json({ success: true, data: entry });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  });

  // POST /api/jarvis/collaboration/missions/:id/message - Send inter-agent message
  router.post('/missions/:id/message', (req: Request, res: Response) => {
    try {
      const user = getUser(req);
      const { fromAgentId, toAgentId, type, content, payload } = req.body;
      if (!fromAgentId || !toAgentId || !content) {
        return res.status(400).json({ success: false, error: 'Fields "fromAgentId", "toAgentId", and "content" are required.' });
      }
      const msg = manager.sendAgentMessage(req.params.id, fromAgentId, toAgentId, type, content, payload, user);
      return res.json({ success: true, data: msg });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  });

  // POST /api/jarvis/collaboration/missions/:id/review - Conduct peer review
  router.post('/missions/:id/review', async (req: Request, res: Response) => {
    try {
      const user = getUser(req);
      const { reviewerAgentId, targetStepId, critique } = req.body;
      if (!reviewerAgentId || !targetStepId) {
        return res.status(400).json({ success: false, error: 'Fields "reviewerAgentId" and "targetStepId" are required.' });
      }
      const review = await manager.performPeerReview(req.params.id, reviewerAgentId, targetStepId, critique, user);
      return res.json({ success: true, data: review });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  });

  return router;
}
