import { Router, Request, Response } from 'express';
import { SkillBuilderManager } from '../../skills/skill-builder-manager.js';

export function createSkillsRouter(manager: SkillBuilderManager): Router {
  const router = Router();

  const getUser = (req: Request): string => {
    return (req.headers['x-user-id'] as string) || 'dwight';
  };

  // GET /api/jarvis/skills - List custom skills
  router.get('/', (req: Request, res: Response) => {
    try {
      const user = getUser(req);
      const statusFilter = req.query.status as any;
      const skills = manager.listSkills(statusFilter, user);
      return res.json({ success: true, count: skills.length, data: skills });
    } catch (err: any) {
      return res.status(403).json({ success: false, error: err.message });
    }
  });

  // GET /api/jarvis/skills/:id - Get skill details
  router.get('/:id', (req: Request, res: Response) => {
    try {
      const user = getUser(req);
      const skill = manager.getSkill(req.params.id, user);
      return res.json({ success: true, data: skill });
    } catch (err: any) {
      return res.status(404).json({ success: false, error: err.message });
    }
  });

  // POST /api/jarvis/skills/draft - Draft a new custom skill
  router.post('/draft', (req: Request, res: Response) => {
    try {
      const user = getUser(req);
      const draft = manager.draftSkill(req.body, user);
      return res.status(201).json({ success: true, data: draft });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  });

  // POST /api/jarvis/skills/:id/test - Run sandboxed test harness
  router.post('/:id/test', async (req: Request, res: Response) => {
    try {
      const user = getUser(req);
      const report = await manager.testSkill(req.params.id, user);
      return res.json({ success: true, data: report });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  });

  // POST /api/jarvis/skills/:id/approve - Operator review & approval
  router.post('/:id/approve', (req: Request, res: Response) => {
    try {
      const user = getUser(req);
      const approved = req.body.approved !== false;
      const reason = req.body.reason;
      const updated = manager.reviewAndApprove(req.params.id, approved, reason, user);
      return res.json({ success: true, data: updated });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  });

  // POST /api/jarvis/skills/:id/install - Hot-register into ToolRegistry
  router.post('/:id/install', (req: Request, res: Response) => {
    try {
      const user = getUser(req);
      const installed = manager.installSkill(req.params.id, user);
      return res.json({ success: true, data: installed });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  });

  // POST /api/jarvis/skills/:id/uninstall - Deregister from ToolRegistry
  router.post('/:id/uninstall', (req: Request, res: Response) => {
    try {
      const user = getUser(req);
      const uninstalled = manager.uninstallSkill(req.params.id, user);
      return res.json({ success: true, data: uninstalled });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  });

  // DELETE /api/jarvis/skills/:id - Delete draft skill
  router.delete('/:id', (req: Request, res: Response) => {
    try {
      const user = getUser(req);
      const deleted = manager.deleteSkill(req.params.id, user);
      return res.json({ success: true, deleted });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  });

  return router;
}
