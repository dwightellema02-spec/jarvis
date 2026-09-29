import { Router, Request, Response } from 'express';
import { AgentRegistry } from '../../agents/agent-registry.js';
import { AgentStatus } from '../../agents/agent.interface.js';

export function createAgentsRouter(agentRegistry: AgentRegistry): Router {
  const router = Router();

  router.get('/', (req: Request, res: Response) => {
    const status = req.query.status as AgentStatus | undefined;
    const agents = status ? agentRegistry.listByStatus(status) : agentRegistry.list();
    res.status(200).json({
      total: agents.length,
      agents,
    });
  });

  router.get('/:id', (req: Request, res: Response) => {
    const agent = agentRegistry.get(req.params.id);
    if (!agent) {
      res.status(404).json({ error: `Agent '${req.params.id}' not found` });
      return;
    }
    res.status(200).json({ agent });
  });

  return router;
}
