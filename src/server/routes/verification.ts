import { Router, Request, Response } from 'express';
import { VerificationSuiteManager } from '../../verification/verification-suite-manager.js';

export function createVerificationRouter(manager: VerificationSuiteManager): Router {
  const router = Router();

  const getUser = (req: Request): string => {
    return (req.headers['x-user-id'] as string) || 'dwight';
  };

  // POST /api/jarvis/verification/verify - Run multi-check verification suite
  router.post('/verify', (req: Request, res: Response) => {
    try {
      const user = getUser(req);
      const { actionName, checks, runtimePayload } = req.body;
      if (!actionName || !checks) {
        return res.status(400).json({ success: false, error: 'Fields "actionName" and "checks" are required.' });
      }
      const attestation = manager.verifyAction(actionName, checks, runtimePayload, user);
      return res.json({ success: true, data: attestation });
    } catch (err: any) {
      return res.status(403).json({ success: false, error: err.message });
    }
  });

  // POST /api/jarvis/verification/evidence - Collect single evidence item
  router.post('/evidence', (req: Request, res: Response) => {
    try {
      const user = getUser(req);
      const { check, runtimePayload } = req.body;
      if (!check) {
        return res.status(400).json({ success: false, error: 'Field "check" is required.' });
      }
      const evidence = manager.collectSingleEvidence(check, runtimePayload, user);
      return res.json({ success: true, data: evidence });
    } catch (err: any) {
      return res.status(403).json({ success: false, error: err.message });
    }
  });

  // POST /api/jarvis/verification/hallucination-audit - Run anti-hallucination ground truth check
  router.post('/hallucination-audit', (req: Request, res: Response) => {
    try {
      const user = getUser(req);
      const { claimText, groundingSources, strictness } = req.body;
      if (!claimText) {
        return res.status(400).json({ success: false, error: 'Field "claimText" is required.' });
      }
      const audit = manager.auditHallucination(
        {
          claimText,
          groundingSources: groundingSources || [],
          strictness: strictness || 'standard',
        },
        user
      );
      return res.json({ success: true, data: audit });
    } catch (err: any) {
      return res.status(403).json({ success: false, error: err.message });
    }
  });

  // POST /api/jarvis/verification/diagnose - Diagnose failure and return remedy
  router.post('/diagnose', (req: Request, res: Response) => {
    try {
      const { failedChecks, actionName } = req.body;
      if (!failedChecks || !Array.isArray(failedChecks)) {
        return res.status(400).json({ success: false, error: 'Field "failedChecks" array is required.' });
      }
      const diagnosis = manager.diagnoseFailure(failedChecks, actionName || 'unspecified_action');
      return res.json({ success: true, data: diagnosis });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // POST /api/jarvis/verification/retry-loop - Run auto-retry loop with verification
  router.post('/retry-loop', async (req: Request, res: Response) => {
    try {
      const user = getUser(req);
      const { actionName, checks, maxAttempts, simulatedSuccessOnAttempt } = req.body;
      if (!actionName || !checks) {
        return res.status(400).json({ success: false, error: 'Fields "actionName" and "checks" are required.' });
      }

      const loop = await manager.executeAutoRetryLoop(
        actionName,
        async (attempt) => {
          // If simulatedSuccessOnAttempt is specified, only succeed on that attempt
          if (simulatedSuccessOnAttempt !== undefined) {
            const pass = attempt >= simulatedSuccessOnAttempt;
            return pass
              ? { attempt, passed: true, status: 'SUCCESS' }
              : { attempt, status: 'DIVERGED' };
          }
          return { attempt, status: 'SUCCESS' };
        },
        checks,
        maxAttempts || 3,
        user
      );
      return res.json({ success: true, data: loop });
    } catch (err: any) {
      return res.status(403).json({ success: false, error: err.message });
    }
  });

  // GET /api/jarvis/verification/attestations - List historical verification attestations
  router.get('/attestations', (req: Request, res: Response) => {
    try {
      const user = getUser(req);
      const passedFilter = req.query.passed !== undefined ? req.query.passed === 'true' : undefined;
      const actionFilter = req.query.action as string | undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;

      const list = manager.listAttestations(
        { passed: passedFilter, actionName: actionFilter, limit },
        user
      );
      return res.json({ success: true, count: list.length, data: list });
    } catch (err: any) {
      return res.status(403).json({ success: false, error: err.message });
    }
  });

  // GET /api/jarvis/verification/attestations/:id - Retrieve specific attestation
  router.get('/attestations/:id', (req: Request, res: Response) => {
    try {
      const user = getUser(req);
      const attestation = manager.getAttestation(req.params.id, user);
      return res.json({ success: true, data: attestation });
    } catch (err: any) {
      return res.status(404).json({ success: false, error: err.message });
    }
  });

  // GET /api/jarvis/verification/report - Retrieve compliance & anti-hallucination report
  router.get('/report', (req: Request, res: Response) => {
    try {
      const user = getUser(req);
      const report = manager.generateAuditReport(user);
      return res.json({ success: true, data: report });
    } catch (err: any) {
      return res.status(403).json({ success: false, error: err.message });
    }
  });

  return router;
}
