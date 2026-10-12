/**
 * JARVIS Phase 10 - Coding Intelligence REST Routes
 */

import { Router, Request, Response } from 'express';
import { CodingManager } from '../../coding/coding-manager.js';
import { logger } from '../../utils/logger.js';

export function createCodingRoutes(codingManager: CodingManager): Router {
  const router = Router();

  // 1. Inspect repository
  router.get('/code/inspect', (req: Request, res: Response) => {
    try {
      const rootPath = (req.query.path as string) || process.cwd();
      const userId = (req.headers['x-user-id'] as string) || 'default_user';

      const overview = codingManager.inspectRepository(rootPath, userId);
      res.json({ success: true, data: overview });
    } catch (err: any) {
      logger.warn('Repository inspection error', { error: err.message });
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // 2. Search code
  router.post('/code/search', (req: Request, res: Response) => {
    try {
      const { query, rootPath, isRegex, fileExtensions, contextLines } = req.body;
      const userId = (req.headers['x-user-id'] as string) || req.body.userId || 'default_user';

      if (!query) {
        res.status(400).json({ success: false, error: 'Field "query" is required.' });
        return;
      }

      const results = codingManager.searchCode(
        rootPath || process.cwd(),
        query,
        { isRegex, fileExtensions, contextLines },
        userId
      );
      res.json({ success: true, data: results });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // 3. Analyze file
  router.post('/code/analyze', (req: Request, res: Response) => {
    try {
      const { filePath } = req.body;
      const userId = (req.headers['x-user-id'] as string) || req.body.userId || 'default_user';

      if (!filePath) {
        res.status(400).json({ success: false, error: 'Field "filePath" is required.' });
        return;
      }

      const analysis = codingManager.analyzeFile(filePath, userId);
      res.json({ success: true, data: analysis });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // 4. Review file
  router.post('/code/review', (req: Request, res: Response) => {
    try {
      const { filePath } = req.body;
      const userId = (req.headers['x-user-id'] as string) || req.body.userId || 'default_user';

      if (!filePath) {
        res.status(400).json({ success: false, error: 'Field "filePath" is required.' });
        return;
      }

      const review = codingManager.reviewFile(filePath, userId);
      res.json({ success: true, data: review });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // 5. Propose patch
  router.post('/code/propose', (req: Request, res: Response) => {
    try {
      const { filePath, targetContent, replacementContent, reason } = req.body;
      const userId = (req.headers['x-user-id'] as string) || req.body.userId || 'default_user';

      if (!filePath || !targetContent || replacementContent === undefined) {
        res.status(400).json({
          success: false,
          error: 'Fields "filePath", "targetContent", and "replacementContent" are required.',
        });
        return;
      }

      const proposal = codingManager.proposeModification(
        filePath,
        targetContent,
        replacementContent,
        reason,
        userId
      );
      res.json({ success: true, data: proposal });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // 6. Apply patch
  router.post('/code/apply', async (req: Request, res: Response) => {
    try {
      const { proposal, confirmed } = req.body;
      const userId = (req.headers['x-user-id'] as string) || req.body.userId || 'default_user';

      if (!proposal) {
        res.status(400).json({ success: false, error: 'Field "proposal" is required.' });
        return;
      }

      const result = await codingManager.applyModification(proposal, Boolean(confirmed), userId);
      res.json({ success: result.success, data: result });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // 7. Rollback file
  router.post('/code/rollback', (req: Request, res: Response) => {
    try {
      const { filePath } = req.body;
      const userId = (req.headers['x-user-id'] as string) || req.body.userId || 'default_user';

      if (!filePath) {
        res.status(400).json({ success: false, error: 'Field "filePath" is required.' });
        return;
      }

      const rolled = codingManager.rollbackModification(filePath, userId);
      res.json({ success: rolled, rolledBack: rolled });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // 8. Debug error
  router.post('/code/debug', (req: Request, res: Response) => {
    try {
      const { rawError, projectRoot } = req.body;
      if (!rawError) {
        res.status(400).json({ success: false, error: 'Field "rawError" is required.' });
        return;
      }

      const diagnostic = codingManager.debugError(rawError, projectRoot);
      res.json({ success: true, data: diagnostic });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  return router;
}
