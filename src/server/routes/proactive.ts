import { Router, Request, Response } from 'express';
import { ProactiveManager } from '../../proactive/proactive-manager.js';

export function createProactiveRouter(proactiveManager: ProactiveManager): Router {
  const router = Router();

  const getUser = (req: Request): string => {
    return (req.headers['x-user-id'] as string) || 'dwight';
  };

  // GET /api/jarvis/proactive/notifications - List active proactive notifications
  router.get('/notifications', (req: Request, res: Response) => {
    try {
      const user = getUser(req);
      const { status, severity, type } = req.query;
      const notifs = proactiveManager.listNotifications(
        {
          status: status as any,
          severity: severity as any,
          type: type as any,
        },
        user
      );
      const unreadCount = notifs.filter((n) => n.status === 'unread').length;
      return res.json({ success: true, count: notifs.length, unreadCount, data: notifs });
    } catch (err: any) {
      return res.status(403).json({ success: false, error: err.message });
    }
  });

  // POST /api/jarvis/proactive/notifications/:id/read - Mark notification as read
  router.post('/notifications/:id/read', (req: Request, res: Response) => {
    try {
      const user = getUser(req);
      const updated = proactiveManager.markAsRead(req.params.id, user);
      return res.json({ success: true, data: updated });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  });

  // POST /api/jarvis/proactive/notifications/:id/dismiss - Dismiss notification
  router.post('/notifications/:id/dismiss', (req: Request, res: Response) => {
    try {
      const user = getUser(req);
      const updated = proactiveManager.dismissNotification(req.params.id, user);
      return res.json({ success: true, data: updated });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  });

  // POST /api/jarvis/proactive/notifications/:id/snooze - Snooze notification
  router.post('/notifications/:id/snooze', (req: Request, res: Response) => {
    try {
      const user = getUser(req);
      const minutes = Number(req.body.minutes) || 60;
      const updated = proactiveManager.snoozeNotification(req.params.id, minutes, user);
      return res.json({ success: true, data: updated });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  });

  // POST /api/jarvis/proactive/cycle - Manually trigger proactive evaluation cycle
  router.post('/cycle', (req: Request, res: Response) => {
    try {
      const user = getUser(req);
      const result = proactiveManager.runCycle(user);
      return res.json({ success: true, data: result });
    } catch (err: any) {
      return res.status(403).json({ success: false, error: err.message });
    }
  });

  // GET /api/jarvis/proactive/suggestions - Get recommended next actions
  router.get('/suggestions', (req: Request, res: Response) => {
    try {
      const user = getUser(req);
      const limit = Number(req.query.limit) || 3;
      const suggestions = proactiveManager.suggestNextActions(limit, user);
      return res.json({ success: true, count: suggestions.length, data: suggestions });
    } catch (err: any) {
      return res.status(403).json({ success: false, error: err.message });
    }
  });

  // GET /api/jarvis/proactive/briefing - Generate daily briefing
  router.get('/briefing', (req: Request, res: Response) => {
    try {
      const user = getUser(req);
      const type = (req.query.type as 'morning' | 'evening') || 'morning';
      const briefing = proactiveManager.generateBriefing(type, user);
      return res.json({ success: true, data: briefing });
    } catch (err: any) {
      return res.status(403).json({ success: false, error: err.message });
    }
  });

  // GET /api/jarvis/proactive/preferences - Get monitoring preferences
  router.get('/preferences', (req: Request, res: Response) => {
    try {
      const user = getUser(req);
      const prefs = proactiveManager.getPreferences(user);
      return res.json({ success: true, data: prefs });
    } catch (err: any) {
      return res.status(403).json({ success: false, error: err.message });
    }
  });

  // PUT /api/jarvis/proactive/preferences - Update monitoring preferences
  router.put('/preferences', (req: Request, res: Response) => {
    try {
      const user = getUser(req);
      const updated = proactiveManager.updatePreferences(req.body, user);
      return res.json({ success: true, data: updated });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  });

  // POST /api/jarvis/proactive/monitored-projects - Approve a project for proactive monitoring
  router.post('/monitored-projects', (req: Request, res: Response) => {
    try {
      const user = getUser(req);
      const { projectId } = req.body;
      if (!projectId) {
        return res.status(400).json({ success: false, error: 'projectId is required' });
      }
      const updated = proactiveManager.approveProject(projectId, user);
      return res.json({ success: true, data: updated });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  });

  // DELETE /api/jarvis/proactive/monitored-projects/:id - Revoke project monitoring
  router.delete('/monitored-projects/:id', (req: Request, res: Response) => {
    try {
      const user = getUser(req);
      const updated = proactiveManager.revokeProject(req.params.id, user);
      return res.json({ success: true, data: updated });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  });

  return router;
}
