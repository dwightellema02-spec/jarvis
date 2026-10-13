import { Router, Request, Response } from 'express';
import { ToolRegistry } from '../../tools/tool-registry.js';
import { ToolStatus } from '../../tools/tool.interface.js';

export function createToolsRouter(toolRegistry: ToolRegistry): Router {
  const router = Router();

  router.get('/', (req: Request, res: Response) => {
    const status = req.query.status as ToolStatus | undefined;
    const tools = status ? toolRegistry.listByStatus(status) : toolRegistry.list();
    res.status(200).json({
      total: tools.length,
      tools,
    });
  });

  router.get('/:id', (req: Request, res: Response) => {
    const tool = toolRegistry.get(req.params.id);
    if (!tool) {
      res.status(404).json({ error: `Tool '${req.params.id}' not found` });
      return;
    }
    res.status(200).json({ tool });
  });

  router.post('/:id/execute', async (req: Request, res: Response) => {
    const impl = toolRegistry.getImplementation(req.params.id);
    if (!impl) {
      res.status(404).json({ success: false, error: `Tool implementation '${req.params.id}' not found` });
      return;
    }
    try {
      const context = {
        requestId: `req_${Date.now()}`,
        userId: (req.headers['x-user-id'] as string) || 'dwight',
        sessionId: 'session_hud',
        permissionVerified: true,
      };
      const result = await impl.execute(req.body?.params ?? req.body ?? {}, context);
      res.status(200).json({ success: true, result });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  return router;
}
