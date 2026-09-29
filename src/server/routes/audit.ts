import { Router, Request, Response } from 'express';
import { AuditLogger } from '../../audit/audit-logger.js';
import { AuditFilter } from '../../audit/types.js';

export function createAuditRouter(auditLogger: AuditLogger): Router {
  const router = Router();

  router.get('/logs', async (req: Request, res: Response) => {
    const filter: AuditFilter = {};
    if (req.query.user) filter.user = String(req.query.user);
    if (req.query.requestId) filter.requestId = String(req.query.requestId);
    if (req.query.resource) filter.resource = req.query.resource as any;
    if (req.query.action) filter.action = req.query.action as any;
    if (req.query.decision) filter.decision = req.query.decision as any;
    if (req.query.result) filter.result = String(req.query.result);

    const logs = await auditLogger.query(filter);
    res.status(200).json({
      total: logs.length,
      logs,
    });
  });

  return router;
}
