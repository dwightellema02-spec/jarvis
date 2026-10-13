/**
 * JARVIS Phase 18 - Application Control REST API Routes
 */

import { Router, Request, Response } from 'express';
import { ApplicationManager } from '../../apps/application-manager.js';
import { AppAuthorizationStatus } from '../../apps/app.interface.js';

export function createAppRoutes(applicationManager: ApplicationManager): Router {
  const router = Router();

  const isPermError = (msg: string) =>
    /permission denied|security block|prohibited|threat detected|not authorized|confirmation required/i.test(
      msg
    );

  // 1. List Installed Applications Catalog
  router.get('/apps/catalog', (req: Request, res: Response) => {
    try {
      const userId = (req.headers['x-user-id'] as string) || 'default_user';
      const apps = applicationManager.listInstalledApps(userId);
      res.json({ success: true, count: apps.length, data: apps });
    } catch (err: any) {
      res.status(isPermError(err.message) ? 403 : 400).json({
        success: false,
        error: err.message,
      });
    }
  });

  // 2. Discover Running Processes
  router.get('/apps/processes', async (req: Request, res: Response) => {
    try {
      const userId = (req.headers['x-user-id'] as string) || 'default_user';
      const processes = await applicationManager.getRunningProcesses(userId);
      res.json({ success: true, count: processes.length, data: processes });
    } catch (err: any) {
      res.status(isPermError(err.message) ? 403 : 400).json({
        success: false,
        error: err.message,
      });
    }
  });

  // 3. Launch Application
  router.post('/apps/launch', async (req: Request, res: Response) => {
    try {
      const userId = (req.headers['x-user-id'] as string) || 'default_user';
      const { appId, args, simulate = true } = req.body;
      if (!appId) {
        res.status(400).json({ success: false, error: 'Field "appId" is required.' });
        return;
      }
      const result = await applicationManager.launchApp(appId, args || [], simulate, userId);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(isPermError(err.message) ? 403 : 400).json({
        success: false,
        error: err.message,
      });
    }
  });

  // 4. Close Running Application
  router.post('/apps/close', async (req: Request, res: Response) => {
    try {
      const userId = (req.headers['x-user-id'] as string) || 'default_user';
      const { appId, pid, simulate = true } = req.body;
      if (!appId) {
        res.status(400).json({ success: false, error: 'Field "appId" is required.' });
        return;
      }
      const result = await applicationManager.closeApp(appId, pid, simulate, userId);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(isPermError(err.message) ? 403 : 400).json({
        success: false,
        error: err.message,
      });
    }
  });

  // 5. Focus Window (UI Automation)
  router.post('/apps/focus', async (req: Request, res: Response) => {
    try {
      const userId = (req.headers['x-user-id'] as string) || 'default_user';
      const { appId, windowTitleFilter, simulate = true } = req.body;
      if (!appId) {
        res.status(400).json({ success: false, error: 'Field "appId" is required.' });
        return;
      }
      const result = await applicationManager.focusWindow(appId, windowTitleFilter, simulate, userId);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(isPermError(err.message) ? 403 : 400).json({
        success: false,
        error: err.message,
      });
    }
  });

  // 6. Deep Link URI Dispatch
  router.post('/apps/uri', async (req: Request, res: Response) => {
    try {
      const userId = (req.headers['x-user-id'] as string) || 'default_user';
      const { appId, uri, simulate = true } = req.body;
      if (!appId || !uri) {
        res.status(400).json({ success: false, error: 'Fields "appId" and "uri" are required.' });
        return;
      }
      const result = await applicationManager.dispatchUri(appId, uri, simulate, userId);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(isPermError(err.message) ? 403 : 400).json({
        success: false,
        error: err.message,
      });
    }
  });

  // 7. Send Local API Command
  router.post('/apps/command', async (req: Request, res: Response) => {
    try {
      const userId = (req.headers['x-user-id'] as string) || 'default_user';
      const { appId, endpoint, payload = {}, authToken, simulate = true } = req.body;
      if (!appId || !endpoint) {
        res.status(400).json({ success: false, error: 'Fields "appId" and "endpoint" are required.' });
        return;
      }
      const result = await applicationManager.sendApiCommand(
        appId,
        endpoint,
        payload,
        authToken,
        simulate,
        userId
      );
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(isPermError(err.message) ? 403 : 400).json({
        success: false,
        error: err.message,
      });
    }
  });

  // 8. Set App Authorization Status
  router.post('/apps/authorize', (req: Request, res: Response) => {
    try {
      const userId = (req.headers['x-user-id'] as string) || 'default_user';
      const { appId, status } = req.body as { appId: string; status: AppAuthorizationStatus };
      if (!appId || !status) {
        res.status(400).json({ success: false, error: 'Fields "appId" and "status" are required.' });
        return;
      }
      const updated = applicationManager.setAppAuthorization(appId, status, userId);
      res.json({ success: true, data: updated });
    } catch (err: any) {
      res.status(isPermError(err.message) ? 403 : 400).json({
        success: false,
        error: err.message,
      });
    }
  });

  // 9. Authorization Audit Summary
  router.get('/apps/audit', (req: Request, res: Response) => {
    try {
      const userId = (req.headers['x-user-id'] as string) || 'default_user';
      const audit = applicationManager.getAuditSummary(userId);
      res.json({ success: true, data: audit });
    } catch (err: any) {
      res.status(isPermError(err.message) ? 403 : 400).json({
        success: false,
        error: err.message,
      });
    }
  });

  return router;
}
