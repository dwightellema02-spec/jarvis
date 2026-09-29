import { Router, Request, Response } from 'express';
import { SecurityGuardian } from '../../security/guardian.js';
import { SecurityEventSink } from '../../security/security-event.js';
import { ResourceType, PermissionAction } from '../../security/types.js';
import { ValidationError } from '../../utils/errors.js';

export function createSecurityRouter(guardian: SecurityGuardian, eventSink: SecurityEventSink): Router {
  const router = Router();

  // Inspect security policy
  router.get('/policy', (_req: Request, res: Response) => {
    res.status(200).json({
      policy: guardian.getPolicy(),
      disclaimer: guardian.getDisclaimer(),
    });
  });

  // Query security events
  router.get('/events', async (req: Request, res: Response) => {
    const type = req.query.type as string | undefined;
    const severity = req.query.severity as string | undefined;

    const filter: Record<string, unknown> = {};
    if (type) filter.type = type;
    if (severity) filter.severity = severity;

    const events = await eventSink.query(filter);
    res.status(200).json({
      total: events.length,
      events,
    });
  });

  // Evaluate target against Guardian threat models
  router.post('/evaluate', (req: Request, res: Response) => {
    const { resource, action, target, userId } = req.body;

    if (!resource || !action) {
      throw new ValidationError('resource and action are required for security evaluation');
    }

    const decision = guardian.evaluate({
      resource: resource as ResourceType,
      action: action as PermissionAction,
      target: target ? String(target) : undefined,
      userId: userId ? String(userId) : undefined,
    });

    res.status(200).json({ decision });
  });

  return router;
}
