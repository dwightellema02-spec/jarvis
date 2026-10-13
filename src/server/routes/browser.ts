/**
 * JARVIS Phase 17 - Web & Browser REST API Routes
 */

import { Router, Request, Response } from 'express';
import { BrowserManager } from '../../browser/browser-manager.js';

export function createBrowserRouter(browserManager: BrowserManager): Router {
  const router = Router();

  const isPermError = (msg: string) =>
    /permission denied|security block|prohibited|threat detected|anti-ssrf block|confirmation required/i.test(
      msg
    );

  // 1. Web Search
  router.post('/browser/search', async (req: Request, res: Response) => {
    try {
      const userId = (req.headers['x-user-id'] as string) || 'default_user';
      const { query, domain, limit } = req.body;
      if (!query) {
        res.status(400).json({ success: false, error: 'Field "query" is required.' });
        return;
      }
      const results = await browserManager.searchWeb(query, { domain, limit }, userId);
      res.json({ success: true, data: results });
    } catch (err: any) {
      res.status(isPermError(err.message) ? 403 : 400).json({
        success: false,
        error: err.message,
      });
    }
  });

  // 2. Open / Navigate to URL
  router.post('/browser/open', async (req: Request, res: Response) => {
    try {
      const userId = (req.headers['x-user-id'] as string) || 'default_user';
      const { url } = req.body;
      if (!url) {
        res.status(400).json({ success: false, error: 'Field "url" is required.' });
        return;
      }
      const result = await browserManager.openUrl(url, userId);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(isPermError(err.message) ? 403 : 400).json({
        success: false,
        error: err.message,
      });
    }
  });

  // 3. Read Page Content
  router.post('/browser/read', async (req: Request, res: Response) => {
    try {
      const userId = (req.headers['x-user-id'] as string) || 'default_user';
      const { url, rawHtml } = req.body;
      if (!url) {
        res.status(400).json({ success: false, error: 'Field "url" is required.' });
        return;
      }
      const result = await browserManager.readPage(url, rawHtml, userId);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(isPermError(err.message) ? 403 : 400).json({
        success: false,
        error: err.message,
      });
    }
  });

  // 4. Inspect Forms
  router.post('/browser/forms/inspect', async (req: Request, res: Response) => {
    try {
      const userId = (req.headers['x-user-id'] as string) || 'default_user';
      const { url, rawHtml } = req.body;
      if (!url) {
        res.status(400).json({ success: false, error: 'Field "url" is required.' });
        return;
      }
      const forms = await browserManager.inspectForms(url, rawHtml, userId);
      res.json({ success: true, data: { url, formsCount: forms.length, forms } });
    } catch (err: any) {
      res.status(isPermError(err.message) ? 403 : 400).json({
        success: false,
        error: err.message,
      });
    }
  });

  // 5. Fill Form
  router.post('/browser/forms/fill', async (req: Request, res: Response) => {
    try {
      const userId = (req.headers['x-user-id'] as string) || 'default_user';
      const { url, formId, fields, submit } = req.body;
      if (!url || !fields) {
        res.status(400).json({ success: false, error: 'Fields "url" and "fields" are required.' });
        return;
      }
      const result = await browserManager.fillForm(
        { url, formId, fields, submit: submit !== false },
        undefined,
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

  // 6. Download Permitted File
  router.post('/browser/download', async (req: Request, res: Response) => {
    try {
      const userId = (req.headers['x-user-id'] as string) || 'default_user';
      const { url, destinationFilename, maxSizeBytes } = req.body;
      if (!url) {
        res.status(400).json({ success: false, error: 'Field "url" is required.' });
        return;
      }
      const result = await browserManager.downloadFile(
        { url, destinationFilename, maxSizeBytes },
        undefined,
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

  // 7. Execute Multi-Step Browser Workflow
  router.post('/browser/workflow', async (req: Request, res: Response) => {
    try {
      const userId = (req.headers['x-user-id'] as string) || 'default_user';
      const { workflowName, steps } = req.body;
      if (!workflowName || !steps || !Array.isArray(steps)) {
        res.status(400).json({ success: false, error: 'Fields "workflowName" and "steps" array are required.' });
        return;
      }
      const result = await browserManager.executeWorkflow(workflowName, steps, userId);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(isPermError(err.message) ? 403 : 400).json({
        success: false,
        error: err.message,
      });
    }
  });

  // 8. Retrieve Session Metrics
  router.get('/browser/session', async (req: Request, res: Response) => {
    try {
      const userId = (req.headers['x-user-id'] as string) || 'default_user';
      const state = browserManager.getSessionState(userId);
      res.json({ success: true, data: state });
    } catch (err: any) {
      res.status(isPermError(err.message) ? 403 : 500).json({
        success: false,
        error: err.message,
      });
    }
  });

  return router;
}
