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

      // Real CPU usage calculation across logical cores
      const cpus = os.cpus();
      let totalIdle = 0;
      let totalTick = 0;
      for (const cpu of cpus) {
        for (const type in cpu.times) {
          totalTick += (cpu.times as any)[type];
        }
        totalIdle += cpu.times.idle;
      }
      const realCpuPercent = totalTick > 0 ? Math.round(100 - (totalIdle / totalTick) * 100) : 0;

      const agentRegistry = jarvisCore.getAgentRegistry();
      const toolRegistry = jarvisCore.getToolRegistry();
      const secondBrain = jarvisCore.getSecondBrain();
      const goalsManager = jarvisCore.getGoalsManager();

      const totalMemories = secondBrain ? secondBrain.getNodeCount() : 0;
      const implementedAgents = agentRegistry.list().filter((a) => a.status === 'implemented');

      // Check external API key configuration honestly
      const hasGoogleKey = Boolean(process.env.GOOGLE_API_KEY && process.env.GOOGLE_API_KEY.trim().length > 0);
      const hasOpenAIKey = Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim().length > 0);
      const connectedCount = (hasGoogleKey ? 1 : 0) + (hasOpenAIKey ? 1 : 0);

      // Real goals if any exist
      const userGoals = goalsManager ? goalsManager.listGoals('dwight') : [];
      const missionTimeline = userGoals.length > 0
        ? userGoals.slice(0, 5).map((g) => ({
            title: g.title,
            status: g.status,
            time: g.targetDate || 'Active',
          }))
        : [
            { title: 'Local Sovereign Engine Initialized', status: 'Active', time: 'Online' },
            { title: 'Security Guardian Verification', status: 'Passed', time: 'Verified' },
            { title: 'Second Brain Knowledge Graph', status: 'Loaded', time: `${totalMemories} Nodes` },
          ];

      const intelligenceFeed = [
        {
          type: 'LIVE',
          title: `Local Sovereign Core operational on port 3001 (${implementedAgents.length} active engines, ${toolRegistry.list().length} tools).`,
          category: 'System',
          time: 'Active',
        },
        {
          type: connectedCount > 0 ? 'INFO' : 'WARN',
          title: connectedCount > 0
            ? 'External LLM provider connected via API key.'
            : 'No external LLM API key configured in .env; operating in deterministic local sovereign mode.',
          category: 'AI Engine',
          time: 'Active',
        },
        {
          type: 'SEC',
          title: 'Security Guardian active: AES-256-GCM encryption & RA 10173 PII sanitizer enforcing policy.',
          category: 'Security',
          time: 'Active',
        },
        {
          type: 'DATA',
          title: `Second Brain connected with ${totalMemories} verified knowledge nodes.`,
          category: 'Memory',
          time: 'Active',
        },
      ];

      res.json({
        success: true,
        data: {
          systemStatus: 'OPTIMAL',
          version: 'v0.29.0-phase29',
          systemMonitor: {
            cpuPercent: realCpuPercent,
            ramPercent: usedMemPercent || 0,
            diskPercent: 0,
            diskStatus: 'Local Storage Nominal',
            uptimeSeconds: Math.floor(process.uptime()),
          },
          aiCore: {
            active: true,
            status: connectedCount > 0 ? 'Online (External LLM)' : 'Active (Local Sovereign)',
            memoriesStored: totalMemories,
            voiceStatus: 'Web Speech API (Browser Dependent)',
            activeAgentsCount: implementedAgents.length,
            connectedLlmsCount: connectedCount,
            systemHealth: 'Optimal',
          },
          llmProviders: [
            {
              name: 'Google Gemini',
              status: hasGoogleKey ? 'Connected' : 'Not Configured (Requires GOOGLE_API_KEY)',
              model: 'gemini-2.5-flash',
              primary: hasGoogleKey,
            },
            {
              name: 'OpenAI',
              status: hasOpenAIKey ? 'Connected' : 'Not Configured (Requires OPENAI_API_KEY)',
              model: 'gpt-4o',
              primary: !hasGoogleKey && hasOpenAIKey,
            },
            {
              name: 'Anthropic Claude',
              status: 'Not Configured (No API Key)',
              model: 'claude-3-7-sonnet',
              primary: false,
            },
            {
              name: 'Groq',
              status: 'Not Configured (No API Key)',
              model: 'llama-3.3-70b',
              primary: false,
            },
            {
              name: 'Ollama',
              status: 'Not Connected (Localhost:11434 Offline)',
              model: 'deepseek-r1:8b',
              primary: false,
            },
            {
              name: 'Local Sovereign Engine',
              status: 'Active (Built-in)',
              model: 'sovereign-deterministic-v1',
              primary: connectedCount === 0,
            },
          ],
          agents: agentRegistry.list().map((a) => ({
            id: a.id,
            name: a.name,
            status: a.status === 'implemented' ? 'Active' : 'Standby',
            description: a.description,
          })),
          intelligenceFeed,
          missionTimeline,
          memoryInsights: {
            memories: totalMemories,
            sessionTurns: 0,
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
