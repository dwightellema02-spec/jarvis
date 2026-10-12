/**
 * JARVIS Phase 11 - Development Environment REST Routes
 */

import { Router, Request, Response } from 'express';
import { DevEnvManager } from '../../devenv/devenv-manager.js';
import { logger } from '../../utils/logger.js';

export function createDevEnvRoutes(devEnvManager: DevEnvManager): Router {
  const router = Router();

  // 1. Terminal: Execute command
  router.post('/devenv/terminal/execute', async (req: Request, res: Response) => {
    try {
      const { command, cwd, confirmed, timeoutMs } = req.body;
      const userId = (req.headers['x-user-id'] as string) || req.body.userId || 'default_user';

      if (!command) {
        res.status(400).json({ success: false, error: 'Field "command" is required.' });
        return;
      }

      const result = await devEnvManager.executeCommand(
        { command, cwd, confirmed: Boolean(confirmed), timeoutMs },
        userId
      );

      res.json({
        success: !result.blocked && result.exitCode === 0,
        data: result,
      });
    } catch (err: any) {
      logger.warn('Terminal command execution error', { error: err.message });
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // 2. Terminal: Analyze command risk
  router.post('/devenv/terminal/analyze', (req: Request, res: Response) => {
    try {
      const { command } = req.body;
      if (!command) {
        res.status(400).json({ success: false, error: 'Field "command" is required.' });
        return;
      }

      const analysis = devEnvManager.analyzeCommand(command);
      res.json({ success: true, data: analysis });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // 3. Git: Status
  router.get('/devenv/git/status', async (req: Request, res: Response) => {
    try {
      const cwd = (req.query.cwd as string) || undefined;
      const userId = (req.headers['x-user-id'] as string) || 'default_user';

      const status = await devEnvManager.getGitStatus(cwd, userId);
      res.json({ success: true, data: status });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // 4. Git: Diff
  router.get('/devenv/git/diff', async (req: Request, res: Response) => {
    try {
      const cwd = (req.query.cwd as string) || undefined;
      const staged = req.query.staged === 'true';
      const userId = (req.headers['x-user-id'] as string) || 'default_user';

      const diff = await devEnvManager.getGitDiff(staged, cwd, userId);
      res.json({ success: true, data: { diff } });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // 5. Git: Log
  router.get('/devenv/git/log', async (req: Request, res: Response) => {
    try {
      const cwd = (req.query.cwd as string) || undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const userId = (req.headers['x-user-id'] as string) || 'default_user';

      const log = await devEnvManager.getGitLog(limit, cwd, userId);
      res.json({ success: true, data: { entries: log, count: log.length } });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // 6. Git: Branches
  router.get('/devenv/git/branches', async (req: Request, res: Response) => {
    try {
      const cwd = (req.query.cwd as string) || undefined;
      const userId = (req.headers['x-user-id'] as string) || 'default_user';

      const branches = await devEnvManager.getGitBranches(cwd, userId);
      res.json({ success: true, data: { branches } });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // 7. Git: Commit
  router.post('/devenv/git/commit', async (req: Request, res: Response) => {
    try {
      const { message, confirmed, cwd } = req.body;
      const userId = (req.headers['x-user-id'] as string) || req.body.userId || 'default_user';

      if (!message) {
        res.status(400).json({ success: false, error: 'Field "message" is required.' });
        return;
      }

      const result = await devEnvManager.commitGit(message, Boolean(confirmed), cwd, userId);
      res.json({ success: result.success, data: result });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // 8. Dependencies: Overview
  router.get('/devenv/dependencies', (req: Request, res: Response) => {
    try {
      const cwd = (req.query.cwd as string) || undefined;
      const userId = (req.headers['x-user-id'] as string) || 'default_user';

      const overview = devEnvManager.getPackageOverview(cwd, userId);
      res.json({ success: true, data: overview });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // 9. Dependencies: Audit
  router.get('/devenv/dependencies/audit', async (req: Request, res: Response) => {
    try {
      const cwd = (req.query.cwd as string) || undefined;
      const userId = (req.headers['x-user-id'] as string) || 'default_user';

      const report = await devEnvManager.auditDependencies(cwd, userId);
      res.json({ success: true, data: report });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // 10. Build: Run build
  router.post('/devenv/build', async (req: Request, res: Response) => {
    try {
      const { cwd } = req.body;
      const userId = (req.headers['x-user-id'] as string) || req.body.userId || 'default_user';

      const result = await devEnvManager.runBuild(cwd, userId);
      res.json({ success: result.success, data: result });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // 11. Typecheck: Run typecheck
  router.post('/devenv/typecheck', async (req: Request, res: Response) => {
    try {
      const { cwd } = req.body;
      const userId = (req.headers['x-user-id'] as string) || req.body.userId || 'default_user';

      const result = await devEnvManager.runTypecheck(cwd, userId);
      res.json({ success: result.success, data: result });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // 12. Test: Run tests
  router.post('/devenv/test', async (req: Request, res: Response) => {
    try {
      const { cwd, filter } = req.body;
      const userId = (req.headers['x-user-id'] as string) || req.body.userId || 'default_user';

      const result = await devEnvManager.runTests(cwd, filter, userId);
      res.json({ success: result.success, data: result });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  return router;
}
