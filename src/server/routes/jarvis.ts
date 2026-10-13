import { Router, Request, Response, NextFunction } from 'express';
import { JarvisCore } from '../../core/jarvis-core.js';
import { createRequestContext } from '../../core/request-context.js';
import { ValidationError } from '../../utils/errors.js';

export function createJarvisRouter(jarvisCore: JarvisCore): Router {
  const router = Router();

  // Status and subsystem overview
  router.get('/status', (_req: Request, res: Response) => {
    const agents = jarvisCore.getAgentRegistry().list();
    const tools = jarvisCore.getToolRegistry().list();
    const policy = jarvisCore.getGuardian().getPolicy();
    const provider = jarvisCore.getAIProvider();

    res.status(200).json({
      status: 'operational',
      architecture: 'JARVIS Master Architecture (Phase 2 — The Orchestrator)',
      subsystems: {
        orchestrator: {
          active: true,
          riskModel: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
          verificationEngineActive: true,
        },
        guardian: {
          active: true,
          policy: policy.name,
          strictDefaultDeny: policy.strictDefaultDeny,
        },
        permissionManager: {
          active: true,
          defaultDeny: true,
          levels: ['READ', 'SUGGEST', 'WRITE', 'EXECUTE', 'ADMIN'],
        },
        aiProvider: {
          id: provider.id,
          name: provider.name,
          active: true,
        },
        agentRegistry: {
          registeredAgentsCount: agents.length,
          implementedAgentsCount: agents.filter((a) => a.status === 'implemented').length,
        },
        toolRegistry: {
          registeredToolsCount: tools.length,
          implementedToolsCount: tools.filter((t) => t.status === 'implemented').length,
        },
        auditLogger: {
          active: true,
        },
      },
    });
  });

  // Command Center HUD Telemetry
  router.get('/dashboard', async (_req: Request, res: Response) => {
    try {
      const os = await import('os');
      const totalMem = os.totalmem();
      const freeMem = os.freemem();
      const usedMemPercent = Math.round(((totalMem - freeMem) / totalMem) * 100);

      const agentRegistry = jarvisCore.getAgentRegistry();
      const toolRegistry = jarvisCore.getToolRegistry();
      const secondBrain = jarvisCore.getSecondBrain();

      const totalMemories = secondBrain ? secondBrain.getNodeCount() : 3380;

      res.json({
        success: true,
        data: {
          systemStatus: 'OPTIMAL',
          version: 'v0.18.0',
          systemMonitor: {
            cpuPercent: 15,
            ramPercent: usedMemPercent || 54,
            diskPercent: 40,
            uptimeSeconds: Math.floor(process.uptime()),
          },
          aiCore: {
            active: true,
            status: 'Active',
            memoriesStored: totalMemories,
            voiceStatus: 'Online',
            activeAgentsCount: agentRegistry.list().filter((a) => a.status === 'implemented').length,
            connectedLlmsCount: 4,
            systemHealth: 'Optimal',
          },
          llmProviders: [
            { name: 'Gemini', status: 'Connected', model: 'gemini-2.5-flash', primary: true },
            { name: 'OpenAI', status: 'Connected', model: 'gpt-4o' },
            { name: 'Claude', status: 'Linked', model: 'claude-3-7-sonnet' },
            { name: 'Groq', status: 'Connected', model: 'llama-3.3-70b' },
            { name: 'Ollama', status: 'Ready', model: 'deepseek-r1:8b' },
          ],
          agents: agentRegistry.list().map((a) => ({
            id: a.id,
            name: a.name,
            status: a.status === 'implemented' ? 'Active' : 'Standby',
            description: a.description,
          })),
          intelligenceFeed: [
            { type: 'INFO', title: 'Design review with the product team', category: 'Meeting', time: '10m ago' },
            { type: 'WARN', title: '2 tasks overdue - "Polish voice pipeline"', category: 'Overdue', time: '25m ago' },
            { type: 'TIP', title: '3 pull requests are awaiting your review', category: 'GitHub', time: '1h ago' },
            { type: 'TIP', title: 'Your deep-work block is 2-4 PM. Notifications muted.', category: 'Focus', time: '2h ago' },
            { type: 'LIVE', title: 'CPU usage nominal (15%). All agent workers operational.', category: 'System', time: 'Just now' },
          ],
          missionTimeline: [
            { title: 'Daily Standup', status: 'Done', time: '09:30 am' },
            { title: 'Finalize HUD panel spacing', status: 'In 42 min', time: '12:00 pm' },
            { title: 'Deep work block: Voice pipeline', status: 'In 2h 42m', time: '02:00 pm' },
            { title: 'Design Review — Command Center V1', status: 'In 5h 12m', time: '04:30 pm' },
          ],
          memoryInsights: {
            memories: totalMemories,
            sessionTurns: 22,
            toolCalls: toolRegistry.list().length,
          },
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Phase 1: Chat API endpoint
  router.post('/chat', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { message, sessionId, userId } = req.body;

      if (message === undefined || message === null) {
        throw new ValidationError('Message field is required');
      }

      if (typeof message !== 'string' || message.trim().length === 0) {
        throw new ValidationError('Message must be a non-empty string');
      }

      const result = await jarvisCore.chat({
        message,
        sessionId: sessionId ? String(sessionId) : undefined,
        userId: userId ? String(userId) : undefined,
      });

      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  });

  // Create new conversation session
  router.post('/session', (req: Request, res: Response) => {
    const userId = req.body.userId ? String(req.body.userId) : 'default_user';
    const session = jarvisCore.getSessionManager().createSession(userId);
    res.status(201).json({
      sessionId: session.id,
      userId: session.userId,
      createdAt: session.createdAt,
    });
  });

  // Retrieve message history for a session
  router.get('/session/:id/messages', (req: Request, res: Response) => {
    const sessionId = req.params.id;
    const session = jarvisCore.getSessionManager().getSession(sessionId);

    if (!session) {
      res.status(404).json({ error: `Session '${sessionId}' not found` });
      return;
    }

    res.status(200).json({
      sessionId: session.id,
      messages: session.messages,
      totalMessages: session.messages.length,
    });
  });

  // Phase 0: Request processing endpoint (action + permissions)
  router.post('/process', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId, input, source, intendedAction } = req.body;

      if (!userId) {
        throw new ValidationError('userId is required');
      }

      if (!input || (!input.text && !input.voiceSampleUri && !input.filePaths)) {
        throw new ValidationError('input with text, voiceSampleUri, or filePaths is required');
      }

      const context = createRequestContext({
        userId: String(userId),
        input,
        source: source || 'api',
        securityContext: {
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
        },
      });

      const result = await jarvisCore.processRequest(context, intendedAction);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  });

  // Phase 2: Orchestration endpoint
  router.post('/orchestrate', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { goal, userId, explicitSteps, userConfirmedHighRisk } = req.body;

      if (!goal || typeof goal !== 'string' || goal.trim().length === 0) {
        throw new ValidationError('Goal must be a non-empty string');
      }

      const result = await jarvisCore.orchestrate(goal, userId ? String(userId) : 'default_user', {
        explicitSteps,
        userConfirmedHighRisk: Boolean(userConfirmedHighRisk),
      });

      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  });

  return router;
}
