import { RequestContext, JarvisResponse, ActionPlanItem } from './types.js';
import { SecurityGuardian } from '../security/guardian.js';
import { PermissionManager } from '../security/permission-manager.js';
import { AuditLogger } from '../audit/audit-logger.js';
import { AgentRegistry } from '../agents/agent-registry.js';
import { ToolRegistry } from '../tools/tool-registry.js';
import { IAIProvider, ChatMessage } from '../providers/ai-provider.interface.js';
import { createAIProvider } from '../providers/provider-factory.js';
import { SessionManager } from '../session/session-manager.js';
import { JARVIS_SYSTEM_INSTRUCTION } from './personality.js';
import { createRequestContext } from './request-context.js';
import {
  SecurityDecisionType,
  ResourceType,
  PermissionAction,
  PermissionLevel,
} from '../security/types.js';
import {
  SecurityBlockError,
  PermissionDeniedError,
  ValidationError,
  AIProviderError,
} from '../utils/errors.js';
import { logger } from '../utils/logger.js';

export interface JarvisCoreConfig {
  guardian: SecurityGuardian;
  permissionManager: PermissionManager;
  auditLogger: AuditLogger;
  agentRegistry: AgentRegistry;
  toolRegistry: ToolRegistry;
  aiProvider?: IAIProvider;
  sessionManager?: SessionManager;
}

export interface JarvisChatRequest {
  message: string;
  sessionId?: string;
  userId?: string;
  stream?: boolean;
}

export interface JarvisChatResponse {
  requestId: string;
  status: 'success';
  response: string;
  sessionId: string;
  model: string;
  durationMs: number;
  timestamp: string;
}

export class JarvisCore {
  private guardian: SecurityGuardian;
  private permissionManager: PermissionManager;
  private auditLogger: AuditLogger;
  private agentRegistry: AgentRegistry;
  private toolRegistry: ToolRegistry;
  private aiProvider: IAIProvider;
  private sessionManager: SessionManager;

  constructor(config: JarvisCoreConfig) {
    this.guardian = config.guardian;
    this.permissionManager = config.permissionManager;
    this.auditLogger = config.auditLogger;
    this.agentRegistry = config.agentRegistry;
    this.toolRegistry = config.toolRegistry;
    this.aiProvider = config.aiProvider || createAIProvider();
    this.sessionManager = config.sessionManager || new SessionManager();

    logger.info('JARVIS Core initialized with AI Provider, SessionManager, Guardian, and Registries');
  }

  /**
   * Phase 1 Core Conversational Intelligence:
   * Process a real chat message with session context, system personality, and AI Provider.
   */
  public async chat(request: JarvisChatRequest): Promise<JarvisChatResponse> {
    const startTime = Date.now();

    // 1. Validation
    if (typeof request.message !== 'string' || request.message.trim().length === 0) {
      throw new ValidationError('Message must be a non-empty string');
    }

    if (request.message.length > 50000) {
      throw new ValidationError('Message exceeds maximum allowed size of 50,000 characters');
    }

    const userId = request.userId || 'default_user';

    // 2. Request context creation
    const context = createRequestContext({
      userId,
      sessionId: request.sessionId,
      input: { text: request.message },
      source: 'web',
    });

    logger.info('REQUEST_RECEIVED', {
      requestId: context.requestId,
      sessionId: context.sessionId,
      userId: context.userId,
    });

    // 3. Guardian Pre-flight Security Evaluation
    const guardianCheck = this.guardian.evaluate({
      resource: ResourceType.APPLICATIONS,
      action: 'suggest',
      target: request.message,
      userId,
    });

    if (guardianCheck.decision === SecurityDecisionType.DENY) {
      logger.warn('REQUEST_BLOCKED_BY_GUARDIAN', {
        requestId: context.requestId,
        reason: guardianCheck.reason,
      });

      await this.auditLogger.log({
        user: userId,
        requestId: context.requestId,
        resource: ResourceType.APPLICATIONS,
        action: 'suggest',
        permissionRequired: PermissionLevel.READ,
        decision: SecurityDecisionType.DENY,
        reason: guardianCheck.reason,
        result: 'BLOCKED',
        durationMs: Date.now() - startTime,
      });

      throw new SecurityBlockError(guardianCheck.reason, {
        requestId: context.requestId,
        threats: guardianCheck.threatsDetected,
      });
    }

    // 4. Session & Context Resolution
    const session = this.sessionManager.getOrCreateSession(request.sessionId, userId);
    const existingMessages = this.sessionManager.getMessages(session.id);

    // Build the AI message payload with session history
    const aiMessages: ChatMessage[] = [
      ...existingMessages,
      {
        role: 'user',
        content: request.message,
        timestamp: new Date().toISOString(),
      },
    ];

    // 5. Invoke AI Provider
    const providerStart = Date.now();
    logger.info('AI_REQUEST_STARTED', {
      requestId: context.requestId,
      provider: this.aiProvider.name,
      messageCount: aiMessages.length,
    });

    let providerResponse;
    try {
      providerResponse = await this.aiProvider.generate({
        messages: aiMessages,
        systemInstruction: JARVIS_SYSTEM_INSTRUCTION,
      });
    } catch (err: any) {
      logger.error('AI_REQUEST_FAILED', {
        requestId: context.requestId,
        error: err.message,
        durationMs: Date.now() - providerStart,
      });
      throw err;
    }

    const providerEnd = Date.now();
    logger.info('AI_REQUEST_COMPLETED', {
      requestId: context.requestId,
      provider: this.aiProvider.name,
      model: providerResponse.model,
      durationMs: providerEnd - providerStart,
    });

    // 6. Validate AI response
    if (!providerResponse || typeof providerResponse.content !== 'string' || providerResponse.content.trim().length === 0) {
      throw new AIProviderError(this.aiProvider.id, 'AI provider returned an empty or invalid response');
    }

    // 7. Update Session Context
    this.sessionManager.addMessage(session.id, {
      role: 'user',
      content: request.message,
      timestamp: new Date().toISOString(),
    });

    this.sessionManager.addMessage(session.id, {
      role: 'assistant',
      content: providerResponse.content,
      timestamp: new Date().toISOString(),
    });

    const totalDuration = Date.now() - startTime;
    logger.info('RESPONSE_GENERATED', {
      requestId: context.requestId,
      sessionId: session.id,
      totalDuration,
    });

    return {
      requestId: context.requestId,
      status: 'success',
      response: providerResponse.content,
      sessionId: session.id,
      model: providerResponse.model,
      durationMs: totalDuration,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Primary entry point for request processing (Phase 0 Foundation with permission checks).
   */
  public async processRequest(
    context: RequestContext,
    intendedAction?: {
      resource: ResourceType;
      action: PermissionAction;
      requiredLevel: PermissionLevel;
      target?: string;
    }
  ): Promise<JarvisResponse> {
    const startTime = Date.now();
    logger.info(`Processing request ${context.requestId} from user ${context.userId}`, {
      source: context.source,
      hasAction: !!intendedAction,
    });

    const securityDecisions = [];
    const actionsExecuted: ActionPlanItem[] = [];

    // 1. Guardian Security Evaluation
    if (intendedAction) {
      const securityEval = this.guardian.evaluate({
        resource: intendedAction.resource,
        action: intendedAction.action,
        target: intendedAction.target || context.input.text,
        userId: context.userId,
      });

      securityDecisions.push(securityEval);

      if (securityEval.decision === SecurityDecisionType.DENY) {
        await this.auditLogger.log({
          user: context.userId,
          requestId: context.requestId,
          resource: intendedAction.resource,
          action: intendedAction.action,
          permissionRequired: intendedAction.requiredLevel,
          decision: SecurityDecisionType.DENY,
          reason: securityEval.reason,
          result: 'BLOCKED',
          durationMs: Date.now() - startTime,
        });

        throw new SecurityBlockError(securityEval.reason, {
          requestId: context.requestId,
          threats: securityEval.threatsDetected,
        });
      }

      // 2. Permission Evaluation (Capability does NOT equal permission)
      const permResult = this.permissionManager.checkPermission({
        userId: context.userId,
        resource: intendedAction.resource,
        action: intendedAction.action,
        requiredLevel: intendedAction.requiredLevel,
        targetIdentifier: intendedAction.target,
      });

      if (!permResult.allowed) {
        await this.auditLogger.log({
          user: context.userId,
          requestId: context.requestId,
          resource: intendedAction.resource,
          action: intendedAction.action,
          permissionRequired: intendedAction.requiredLevel,
          permissionGranted: permResult.grantedLevel,
          decision: SecurityDecisionType.DENY,
          reason: permResult.reason,
          result: 'DENIED',
          durationMs: Date.now() - startTime,
        });

        throw new PermissionDeniedError(
          intendedAction.resource,
          intendedAction.action,
          intendedAction.requiredLevel,
          { requestId: context.requestId, reason: permResult.reason }
        );
      }

      // Permission Granted & Allowed
      await this.auditLogger.log({
        user: context.userId,
        requestId: context.requestId,
        resource: intendedAction.resource,
        action: intendedAction.action,
        permissionRequired: intendedAction.requiredLevel,
        permissionGranted: permResult.grantedLevel,
        decision: SecurityDecisionType.ALLOW,
        reason: permResult.reason,
        result: 'SUCCESS',
        durationMs: Date.now() - startTime,
      });

      actionsExecuted.push({
        id: `action_${Date.now()}`,
        resource: intendedAction.resource,
        action: intendedAction.action,
        target: intendedAction.target,
        verified: true,
      });
    }

    const durationMs = Date.now() - startTime;

    return {
      requestId: context.requestId,
      timestamp: new Date().toISOString(),
      content:
        'JARVIS Phase 0 Foundation: Request verified through Security Guardian and Permission Manager.',
      actionsExecuted,
      securityDecisions,
      verificationResult: {
        verified: true,
        reason: 'Phase 0 contracts and security policies successfully evaluated.',
      },
      durationMs,
    };
  }

  public getAgentRegistry(): AgentRegistry {
    return this.agentRegistry;
  }

  public getToolRegistry(): ToolRegistry {
    return this.toolRegistry;
  }

  public getPermissionManager(): PermissionManager {
    return this.permissionManager;
  }

  public getGuardian(): SecurityGuardian {
    return this.guardian;
  }

  public getAuditLogger(): AuditLogger {
    return this.auditLogger;
  }

  public getAIProvider(): IAIProvider {
    return this.aiProvider;
  }

  public setAIProvider(provider: IAIProvider): void {
    this.aiProvider = provider;
  }

  public getSessionManager(): SessionManager {
    return this.sessionManager;
  }
}
