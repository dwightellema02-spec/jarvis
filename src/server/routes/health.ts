import { Router, Request, Response } from 'express';

export function createHealthRouter(version: string): Router {
  const router = Router();
  const startTime = Date.now();

  router.get('/', (_req: Request, res: Response) => {
    res.status(200).json({
      status: 'ok',
      service: 'jarvis',
      version,
      environment: process.env.NODE_ENV || 'development',
      uptimeSeconds: Math.floor((Date.now() - startTime) / 1000),
      timestamp: new Date().toISOString(),
      architecture: {
        phase: 'Phase 0 — Foundation, Security & Master Architecture',
        guardianActive: true,
        permissionManagerActive: true,
        auditLoggingActive: true,
      },
    });
  });

  return router;
}
