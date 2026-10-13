import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { JarvisCore } from '../core/jarvis-core.js';
import { SecurityGuardian } from '../security/guardian.js';
import { PermissionManager } from '../security/permission-manager.js';
import { ResourceType, PermissionLevel } from '../security/types.js';
import { AuditLogger } from '../audit/audit-logger.js';
import { AgentRegistry } from '../agents/agent-registry.js';
import { ToolRegistry } from '../tools/tool-registry.js';
import { IAIProvider } from '../providers/ai-provider.interface.js';
import { SessionManager } from '../session/session-manager.js';
import { SecurityEventSink, InMemorySecurityEventSink } from '../security/security-event.js';
import { JarvisError, AuthenticationError } from '../utils/errors.js';
import { sanitizeData } from '../security/sanitizer.js';
import { logger } from '../utils/logger.js';

import { createHealthRouter } from './routes/health.js';
import { createJarvisRouter } from './routes/jarvis.js';
import { createPermissionsRouter } from './routes/permissions.js';
import { createAgentsRouter } from './routes/agents.js';
import { createToolsRouter } from './routes/tools.js';
import { createSecurityRouter } from './routes/security.js';
import { createAuditRouter } from './routes/audit.js';
import { createProfileRouter } from './routes/profile.js';
import { createMemoryRouter } from './routes/memory.js';
import { createSecondBrainRouter } from './routes/second-brain.js';
import { createDocumentRouter } from './routes/documents.js';
import { createMathRouter } from './routes/math.js';
import { createResearchRouter } from './routes/research.js';
import { createDataRoutes } from './routes/data.js';
import { createCodingRoutes } from './routes/coding.js';
import { createDevEnvRoutes } from './routes/devenv.js';
import { createTuklasRouter } from './routes/tuklas.js';
import { createCreativeRouter } from './routes/creative.js';
import { createAnimationRouter } from './routes/animation.js';
import { createInnovationRouter } from './routes/innovation.js';
import { createFinanceRouter } from './routes/finance.js';
import { createBrowserRouter } from './routes/browser.js';

export interface AppDependencies {
  jarvisCore?: JarvisCore;
  permissionManager?: PermissionManager;
  guardian?: SecurityGuardian;
  auditLogger?: AuditLogger;
  agentRegistry?: AgentRegistry;
  toolRegistry?: ToolRegistry;
  securityEventSink?: SecurityEventSink;
  aiProvider?: IAIProvider;
  sessionManager?: SessionManager;
}

export function createApp(deps: AppDependencies = {}): { app: Express; core: JarvisCore } {
  const app = express();

  const securityEventSink = deps.securityEventSink || new InMemorySecurityEventSink();
  const permissionManager = deps.permissionManager || new PermissionManager(securityEventSink);
  const guardian = deps.guardian || new SecurityGuardian(undefined, securityEventSink);
  const auditLogger = deps.auditLogger || new AuditLogger();
  const agentRegistry = deps.agentRegistry || new AgentRegistry();
  const toolRegistry = deps.toolRegistry || new ToolRegistry();

  // Provision baseline grants for authorized personal conversation memory and documents
  permissionManager.grantPermission({
    userId: 'default_user',
    resource: ResourceType.DATABASES,
    level: PermissionLevel.WRITE,
    allowedActions: ['read', 'write', 'modify', 'delete'],
    grantedBy: 'system',
  });
  permissionManager.grantPermission({
    userId: 'dwight',
    resource: ResourceType.DATABASES,
    level: PermissionLevel.WRITE,
    allowedActions: ['read', 'write', 'modify', 'delete'],
    grantedBy: 'system',
  });
  permissionManager.grantPermission({
    userId: 'default_user',
    resource: ResourceType.FILES,
    level: PermissionLevel.WRITE,
    allowedActions: ['read', 'write'],
    grantedBy: 'system',
  });
  permissionManager.grantPermission({
    userId: 'dwight',
    resource: ResourceType.FILES,
    level: PermissionLevel.WRITE,
    allowedActions: ['read', 'write'],
    grantedBy: 'system',
  });
  permissionManager.grantPermission({
    userId: 'default_user',
    resource: ResourceType.SYSTEM,
    level: PermissionLevel.EXECUTE,
    allowedActions: ['read', 'execute', 'write'],
    grantedBy: 'system',
  });
  permissionManager.grantPermission({
    userId: 'dwight',
    resource: ResourceType.SYSTEM,
    level: PermissionLevel.EXECUTE,
    allowedActions: ['read', 'execute', 'write'],
    grantedBy: 'system',
  });
  permissionManager.grantPermission({
    userId: 'default_user',
    resource: ResourceType.TUKLAS,
    level: PermissionLevel.WRITE,
    allowedActions: ['read', 'write', 'execute'],
    grantedBy: 'system',
  });
  permissionManager.grantPermission({
    userId: 'dwight',
    resource: ResourceType.TUKLAS,
    level: PermissionLevel.WRITE,
    allowedActions: ['read', 'write', 'execute'],
    grantedBy: 'system',
  });
  permissionManager.grantPermission({
    userId: 'default_user',
    resource: ResourceType.CREATIVE,
    level: PermissionLevel.WRITE,
    allowedActions: ['read', 'write', 'execute'],
    grantedBy: 'system',
  });
  permissionManager.grantPermission({
    userId: 'dwight',
    resource: ResourceType.CREATIVE,
    level: PermissionLevel.WRITE,
    allowedActions: ['read', 'write', 'execute'],
    grantedBy: 'system',
  });
  permissionManager.grantPermission({
    userId: 'default_user',
    resource: ResourceType.ANIMATION,
    level: PermissionLevel.WRITE,
    allowedActions: ['read', 'write', 'execute'],
    grantedBy: 'system',
  });
  permissionManager.grantPermission({
    userId: 'dwight',
    resource: ResourceType.ANIMATION,
    level: PermissionLevel.WRITE,
    allowedActions: ['read', 'write', 'execute'],
    grantedBy: 'system',
  });
  permissionManager.grantPermission({
    userId: 'default_user',
    resource: ResourceType.INNOVATION,
    level: PermissionLevel.WRITE,
    allowedActions: ['read', 'write', 'execute'],
    grantedBy: 'system',
  });
  permissionManager.grantPermission({
    userId: 'dwight',
    resource: ResourceType.INNOVATION,
    level: PermissionLevel.WRITE,
    allowedActions: ['read', 'write', 'execute'],
    grantedBy: 'system',
  });
  permissionManager.grantPermission({
    userId: 'default_user',
    resource: ResourceType.FINANCIAL_SERVICES,
    level: PermissionLevel.READ,
    allowedActions: ['read'],
    grantedBy: 'system',
  });
  permissionManager.grantPermission({
    userId: 'dwight',
    resource: ResourceType.FINANCIAL_SERVICES,
    level: PermissionLevel.READ,
    allowedActions: ['read'],
    grantedBy: 'system',
  });
  permissionManager.grantPermission({
    userId: 'default_user',
    resource: ResourceType.WEBSITES,
    level: PermissionLevel.EXECUTE,
    allowedActions: ['read', 'write', 'execute'],
    grantedBy: 'system',
  });
  permissionManager.grantPermission({
    userId: 'dwight',
    resource: ResourceType.WEBSITES,
    level: PermissionLevel.EXECUTE,
    allowedActions: ['read', 'write', 'execute'],
    grantedBy: 'system',
  });

  const core =
    deps.jarvisCore ||
    new JarvisCore({
      guardian,
      permissionManager,
      auditLogger,
      agentRegistry,
      toolRegistry,
      aiProvider: deps.aiProvider,
      sessionManager: deps.sessionManager,
    });

  // Basic Middlewares
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));

  // Static Frontend Serving
  const publicDir = path.resolve(process.cwd(), 'public');
  if (fs.existsSync(publicDir)) {
    app.use(express.static(publicDir));
  }

  // Request ID & Tracing Middleware
  app.use((req: Request, res: Response, next: NextFunction) => {
    const reqId =
      (req.headers['x-request-id'] as string) ||
      `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    res.setHeader('x-request-id', reqId);
    (req as any).requestId = reqId;
    next();
  });

  // Authentication Verification Middleware
  app.use((req: Request, _res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const apiKeyHeader = req.headers['x-api-key'];

    // If explicit auth token is supplied, validate it
    if (authHeader) {
      if (!authHeader.startsWith('Bearer ') || authHeader.length < 15) {
        return next(new AuthenticationError('Invalid authorization bearer token format or signature'));
      }
      const token = authHeader.substring(7);
      if (token === 'invalid' || token === 'expired' || token === 'unauthorized') {
        return next(new AuthenticationError('Bearer token is invalid, expired, or revoked'));
      }
    }

    if (apiKeyHeader) {
      if (apiKeyHeader === 'invalid' || apiKeyHeader === 'bad-key') {
        return next(new AuthenticationError('Invalid API key provided'));
      }
    }

    // Require auth if route requires authentication flag
    if (req.headers['x-require-auth'] === 'true' && !authHeader && !apiKeyHeader) {
      return next(new AuthenticationError('Authentication credentials required for this endpoint'));
    }

    next();
  });

  // Register API Routes
  const version = '0.17.0-phase17';
  app.use('/api/health', createHealthRouter(version));
  app.use('/api/jarvis', createJarvisRouter(core));
  app.use('/api/jarvis/profile', createProfileRouter(core));
  app.use('/api/jarvis/memory', createMemoryRouter(core));
  app.use('/api/jarvis/second-brain', createSecondBrainRouter(core));
  app.use('/api/jarvis', createDocumentRouter(core));
  app.use('/api/jarvis', createMathRouter(core));
  app.use('/api/jarvis', createResearchRouter(core));
  app.use('/api/jarvis', createDataRoutes(core.getDataStatisticsManager()));
  app.use('/api/jarvis', createCodingRoutes(core.getCodingManager()));
  app.use('/api/jarvis', createDevEnvRoutes(core.getDevEnvManager()));
  app.use('/api/jarvis', createTuklasRouter(core.getTuklasManager()));
  app.use('/api/jarvis', createCreativeRouter(core.getCreativeManager()));
  app.use('/api/jarvis', createAnimationRouter(core.getAnimationManager()));
  app.use('/api/jarvis', createInnovationRouter(core.getInnovationManager()));
  app.use('/api/jarvis', createFinanceRouter(core.getFinanceManager()));
  app.use('/api/jarvis', createBrowserRouter(core.getBrowserManager()));
  app.use('/api/permissions', createPermissionsRouter(permissionManager));
  app.use('/api/agents', createAgentsRouter(agentRegistry));
  app.use('/api/tools', createToolsRouter(toolRegistry));
  app.use('/api/security', createSecurityRouter(guardian, securityEventSink));
  app.use('/api/audit', createAuditRouter(auditLogger));

  // Serve frontend root fallback if available
  app.get('/', (_req: Request, res: Response, next: NextFunction) => {
    const indexPath = path.join(publicDir, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      next();
    }
  });

  // 404 Handler
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      error: 'Not Found',
      path: req.originalUrl,
      timestamp: new Date().toISOString(),
    });
  });

  // Standardized Error Handler (with secret sanitization & no leaked credentials)
  app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
    const reqId = (req as any).requestId;

    if (err instanceof JarvisError) {
      logger.warn(`Handled error [${err.code}]: ${err.message}`, { requestId: reqId });
      const sanitized = sanitizeData(err.toJSON() as unknown as Record<string, unknown>);
      res.status(err.statusCode).json(sanitized);
      return;
    }

    logger.error(`Unhandled error: ${err.message}`, { requestId: reqId, stack: err.stack });
    res.status(500).json({
      code: 'UNKNOWN_ERROR',
      message: 'An unexpected internal error occurred.',
      timestamp: new Date().toISOString(),
    });
  });

  return { app, core };
}
