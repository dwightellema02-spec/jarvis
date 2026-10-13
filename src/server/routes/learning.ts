import { Router, Request, Response } from 'express';
import { SelfCorrectionManager } from '../../learning/self-correction-manager.js';

export function createLearningRouter(manager: SelfCorrectionManager): Router {
  const router = Router();

  const getUser = (req: Request): string => {
    return (req.headers['x-user-id'] as string) || 'dwight';
  };

  // GET /api/jarvis/learning/incidents - List failure incidents
  router.get('/incidents', (req: Request, res: Response) => {
    try {
      const user = getUser(req);
      const actionName = req.query.action as string | undefined;
      const resolved = req.query.resolved !== undefined ? req.query.resolved === 'true' : undefined;
      const incidents = manager.listIncidents({ actionName, resolved }, user);
      return res.json({ success: true, count: incidents.length, data: incidents });
    } catch (err: any) {
      return res.status(403).json({ success: false, error: err.message });
    }
  });

  // POST /api/jarvis/learning/incidents - Record a failure incident
  router.post('/incidents', (req: Request, res: Response) => {
    try {
      const user = getUser(req);
      const { actionName, errorMessage, errorType, context, rootCauseCategory, severity } = req.body;
      if (!actionName || !errorMessage) {
        return res.status(400).json({ success: false, error: 'Fields "actionName" and "errorMessage" are required.' });
      }
      const recorded = manager.recordFailure(
        { actionName, errorMessage, errorType, context, rootCauseCategory, severity },
        user
      );
      return res.json({ success: true, data: recorded });
    } catch (err: any) {
      return res.status(403).json({ success: false, error: err.message });
    }
  });

  // GET /api/jarvis/learning/incidents/:id - Get incident details
  router.get('/incidents/:id', (req: Request, res: Response) => {
    try {
      const user = getUser(req);
      const incident = manager.getIncident(req.params.id, user);
      return res.json({ success: true, data: incident });
    } catch (err: any) {
      return res.status(404).json({ success: false, error: err.message });
    }
  });

  // GET /api/jarvis/learning/rules - List learned rules/heuristics
  router.get('/rules', (req: Request, res: Response) => {
    try {
      const user = getUser(req);
      const category = req.query.category as any;
      const status = req.query.status as any;
      const targetAction = req.query.targetAction as string | undefined;
      const rules = manager.listRules({ category, status, targetAction }, user);
      return res.json({ success: true, count: rules.length, data: rules });
    } catch (err: any) {
      return res.status(403).json({ success: false, error: err.message });
    }
  });

  // GET /api/jarvis/learning/rules/:id - Get specific rule
  router.get('/rules/:id', (req: Request, res: Response) => {
    try {
      const user = getUser(req);
      const rule = manager.getRule(req.params.id, user);
      return res.json({ success: true, data: rule });
    } catch (err: any) {
      return res.status(404).json({ success: false, error: err.message });
    }
  });

  // POST /api/jarvis/learning/guardrails - Query matching guardrails before execution
  router.post('/guardrails', (req: Request, res: Response) => {
    try {
      const user = getUser(req);
      const { actionName, params } = req.body;
      if (!actionName) {
        return res.status(400).json({ success: false, error: 'Field "actionName" is required.' });
      }
      const match = manager.getRelevantGuardrails(actionName, params || {}, user);
      return res.json({ success: true, data: match });
    } catch (err: any) {
      return res.status(403).json({ success: false, error: err.message });
    }
  });

  // POST /api/jarvis/learning/correction-plan - Generate adapted parameters plan
  router.post('/correction-plan', (req: Request, res: Response) => {
    try {
      const user = getUser(req);
      const { incidentId, originalParams } = req.body;
      if (!incidentId) {
        return res.status(400).json({ success: false, error: 'Field "incidentId" is required.' });
      }
      const plan = manager.generateCorrectionPlan(incidentId, originalParams || {}, user);
      return res.json({ success: true, data: plan });
    } catch (err: any) {
      return res.status(403).json({ success: false, error: err.message });
    }
  });

  // POST /api/jarvis/learning/rules/:id/feedback - Record feedback on rule application
  router.post('/rules/:id/feedback', (req: Request, res: Response) => {
    try {
      const user = getUser(req);
      const { succeeded } = req.body;
      if (succeeded === undefined) {
        return res.status(400).json({ success: false, error: 'Field "succeeded" is required.' });
      }
      const rule = manager.recordRuleFeedback(req.params.id, Boolean(succeeded), user);
      return res.json({ success: true, data: rule });
    } catch (err: any) {
      return res.status(403).json({ success: false, error: err.message });
    }
  });

  // GET /api/jarvis/learning/report - Learning evolution report
  router.get('/report', (req: Request, res: Response) => {
    try {
      const user = getUser(req);
      const report = manager.generateEvolutionReport(user);
      return res.json({ success: true, data: report });
    } catch (err: any) {
      return res.status(403).json({ success: false, error: err.message });
    }
  });

  return router;
}
