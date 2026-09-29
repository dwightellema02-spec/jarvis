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

  return router;
}
