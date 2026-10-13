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
import { Orchestrator } from '../orchestrator/orchestrator.js';
import { OrchestrationResult, TaskStep } from '../orchestrator/types.js';
import { UserProfileManager } from '../profile/profile-manager.js';
import { ConversationMemoryManager } from '../memory/conversation-memory-manager.js';
import { SecondBrainManager } from '../memory/second-brain-manager.js';
import { MemoryType } from '../memory/memory.interface.js';
import {
  DocumentIntelligenceManager,
  DocumentAgent,
  DocumentReadTool,
  DocumentSearchTool,
  DocumentSummarizeTool,
  DocumentCompareTool,
  DocumentAnalyzeTableTool,
  DocumentExtractKnowledgeTool,
} from '../documents/index.js';
import {
  MathematicsEngine,
  MathematicsAgent,
  MathSolveTool,
  MathWorkedExampleTool,
  MathAssessTool,
  MathCheckAnswerTool,
  MathLetReviewTool,
} from '../math/index.js';
import {
  ResearchManager,
  ResearchAgent,
  ResearchClassifyEpistemicTool,
  ResearchGenerateCitationTool,
  ResearchCompareSourcesTool,
  ResearchDevelopQuestionTool,
  ResearchCreateNoteTool,
  ResearchToKnowledgeTool,
} from '../research/index.js';
import {
  DataStatisticsManager,
  DataStatisticsAgent,
  DataCleanTool,
  DataDescriptiveStatsTool,
  DataCorrelationRegressionTool,
  DataHypothesisTestTool,
  DataVisualizeTool,
  DataPipelineTool,
} from '../data/index.js';
import {
  CodingManager,
  CodingAgent,
  CodeInspectRepoTool,
  CodeSearchTool,
  CodeAnalyzeTool,
  CodeReviewTool,
  CodeProposePatchTool,
  CodeApplyPatchTool,
  CodeRollbackTool,
  CodeDebugErrorTool,
} from '../coding/index.js';
import {
  DevEnvManager,
  DevEnvAgent,
  DevEnvRunCommandTool,
  DevEnvGitStatusTool,
  DevEnvGitDiffTool,
  DevEnvGitLogTool,
  DevEnvGitCommitTool,
  DevEnvAuditDependenciesTool,
  DevEnvRunBuildTool,
  DevEnvRunTestsTool,
} from '../devenv/index.js';
import {
  TuklasManager,
  TuklasAgent,
  TuklasClient,
  createTuklasTools,
} from '../tuklas/index.js';
import {
  CreativeManager,
  CreativeAgent,
  createCreativeTools,
} from '../creative/index.js';
import {
  AnimationManager,
  AnimationAgent,
  createAnimationTools,
} from '../animation/index.js';
import {
  InnovationManager,
  InnovationAgent,
  createInnovationTools,
} from '../innovation/index.js';
import {
  FinanceManager,
  FinanceAgent,
  createFinanceTools,
} from '../finance/index.js';
import {
  BrowserManager,
  BrowserAgent,
  createBrowserTools,
} from '../browser/index.js';
import {
  ApplicationManager,
  ApplicationControlAgent,
  createAppTools,
} from '../apps/index.js';
import {
  VisionManager,
  VisionAgent,
  createVisionTools,
} from '../vision/index.js';
import {
  VoiceManager,
  VoiceAgent,
  createVoiceTools,
} from '../voice/index.js';
import {
  DeviceManager,
  DeviceAgent,
  createDeviceTools,
} from '../devices/index.js';
import { logger } from '../utils/logger.js';

export interface JarvisCoreConfig {
  guardian: SecurityGuardian;
  permissionManager: PermissionManager;
  auditLogger: AuditLogger;
  agentRegistry: AgentRegistry;
  toolRegistry: ToolRegistry;
  aiProvider?: IAIProvider;
  sessionManager?: SessionManager;
  orchestrator?: Orchestrator;
  userProfileManager?: UserProfileManager;
  memoryManager?: ConversationMemoryManager;
  secondBrain?: SecondBrainManager;
  documentIntelligence?: DocumentIntelligenceManager;
  mathEngine?: MathematicsEngine;
  researchManager?: ResearchManager;
  dataStatisticsManager?: DataStatisticsManager;
  codingManager?: CodingManager;
  devEnvManager?: DevEnvManager;
  tuklasManager?: TuklasManager;
  creativeManager?: CreativeManager;
  animationManager?: AnimationManager;
  innovationManager?: InnovationManager;
  financeManager?: FinanceManager;
  browserManager?: BrowserManager;
  applicationManager?: ApplicationManager;
  visionManager?: VisionManager;
  voiceManager?: VoiceManager;
  deviceManager?: DeviceManager;
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
  user?: {
    name: string;
    preferredName: string;
    role: string;
  };
}

export class JarvisCore {
  private guardian: SecurityGuardian;
  private permissionManager: PermissionManager;
  private auditLogger: AuditLogger;
  private agentRegistry: AgentRegistry;
  private toolRegistry: ToolRegistry;
  private aiProvider: IAIProvider;
  private sessionManager: SessionManager;
  private orchestrator: Orchestrator;
  private userProfileManager: UserProfileManager;
  private memoryManager: ConversationMemoryManager;
  private secondBrain: SecondBrainManager;
  private documentIntelligence: DocumentIntelligenceManager;
  private mathEngine: MathematicsEngine;
  private researchManager: ResearchManager;
  private dataStatisticsManager: DataStatisticsManager;
  private codingManager: CodingManager;
  private devEnvManager: DevEnvManager;
  private tuklasManager: TuklasManager;
  private creativeManager: CreativeManager;
  private animationManager: AnimationManager;
  private innovationManager: InnovationManager;
  private financeManager: FinanceManager;
  private browserManager: BrowserManager;
  private applicationManager: ApplicationManager;
  private visionManager: VisionManager;
  private voiceManager: VoiceManager;
  private deviceManager: DeviceManager;

  constructor(config: JarvisCoreConfig) {
    this.guardian = config.guardian;
    this.permissionManager = config.permissionManager;
    this.auditLogger = config.auditLogger;
    this.agentRegistry = config.agentRegistry;
    this.toolRegistry = config.toolRegistry;
    this.aiProvider = config.aiProvider || createAIProvider();
    this.sessionManager = config.sessionManager || new SessionManager();
    this.orchestrator =
      config.orchestrator ||
      new Orchestrator({
        agentRegistry: this.agentRegistry,
        toolRegistry: this.toolRegistry,
        permissionManager: this.permissionManager,
        guardian: this.guardian,
        auditLogger: this.auditLogger,
      });
    this.userProfileManager =
      config.userProfileManager ||
      new UserProfileManager({
        auditLogger: this.auditLogger,
      });
    this.memoryManager =
      config.memoryManager ||
      new ConversationMemoryManager({
        permissionManager: this.permissionManager,
        auditLogger: this.auditLogger,
        initialMemories: [
          {
            id: 'mem_tuklas_init',
            type: MemoryType.PROJECT,
            key: 'Tuklas Educational Platform',
            value: 'Tuklas is an educational mathematics platform designed for Philippine students and teachers.',
            userId: 'default_user',
            confidence: 1.0,
            tags: ['tuklas', 'education', 'math', 'project'],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 'mem_let_init',
            type: MemoryType.GOAL,
            key: 'LET Licensure Examination',
            value: 'Targeting mastery in Philippine LET Licensure Exam for Teachers (General & Professional Ed, Math Specialization).',
            userId: 'default_user',
            confidence: 1.0,
            tags: ['let', 'exam', 'review', 'goal'],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
      });
    this.secondBrain =
      config.secondBrain ||
      new SecondBrainManager({
        permissionManager: this.permissionManager,
        auditLogger: this.auditLogger,
      });
    this.documentIntelligence =
      config.documentIntelligence ||
      new DocumentIntelligenceManager(this.permissionManager, this.guardian, this.auditLogger);

    // Register implemented Document Agent
    const documentAgent = new DocumentAgent(this.documentIntelligence, this.secondBrain);
    this.agentRegistry.registerImplementation(documentAgent);

    // Register implemented Document Tools
    this.toolRegistry.registerImplementation(new DocumentReadTool(this.documentIntelligence));
    this.toolRegistry.registerImplementation(new DocumentSearchTool(this.documentIntelligence));
    this.toolRegistry.registerImplementation(new DocumentSummarizeTool(this.documentIntelligence));
    this.toolRegistry.registerImplementation(new DocumentCompareTool(this.documentIntelligence));
    this.toolRegistry.registerImplementation(new DocumentAnalyzeTableTool(this.documentIntelligence));
    this.toolRegistry.registerImplementation(
      new DocumentExtractKnowledgeTool(this.documentIntelligence, this.secondBrain)
    );

    // Register implemented Mathematics Engine, Agent, and Tools
    this.mathEngine = config.mathEngine || new MathematicsEngine();
    const mathAgent = new MathematicsAgent(this.mathEngine);
    this.agentRegistry.registerImplementation(mathAgent);

    this.toolRegistry.registerImplementation(new MathSolveTool(this.mathEngine));
    this.toolRegistry.registerImplementation(new MathWorkedExampleTool(this.mathEngine));
    this.toolRegistry.registerImplementation(new MathAssessTool(this.mathEngine));
    this.toolRegistry.registerImplementation(new MathCheckAnswerTool(this.mathEngine));
    this.toolRegistry.registerImplementation(new MathLetReviewTool(this.mathEngine));

    // Register implemented Research Engine, Agent, and Tools
    this.researchManager =
      config.researchManager ||
      new ResearchManager(
        this.permissionManager,
        this.guardian,
        this.auditLogger,
        this.secondBrain
      );
    const researchAgent = new ResearchAgent(this.researchManager);
    this.agentRegistry.registerImplementation(researchAgent);

    this.toolRegistry.registerImplementation(new ResearchClassifyEpistemicTool(this.researchManager));
    this.toolRegistry.registerImplementation(new ResearchGenerateCitationTool(this.researchManager));
    this.toolRegistry.registerImplementation(new ResearchCompareSourcesTool(this.researchManager));
    this.toolRegistry.registerImplementation(new ResearchDevelopQuestionTool(this.researchManager));
    this.toolRegistry.registerImplementation(new ResearchCreateNoteTool(this.researchManager));
    this.toolRegistry.registerImplementation(new ResearchToKnowledgeTool(this.researchManager));

    // Register implemented Data & Statistics Engine, Agent, and Tools
    this.dataStatisticsManager =
      config.dataStatisticsManager ||
      new DataStatisticsManager(
        this.permissionManager,
        this.guardian,
        this.auditLogger,
        this.secondBrain
      );
    const dataAgent = new DataStatisticsAgent(this.dataStatisticsManager);
    this.agentRegistry.registerImplementation(dataAgent);

    this.toolRegistry.registerImplementation(new DataCleanTool(this.dataStatisticsManager));
    this.toolRegistry.registerImplementation(new DataDescriptiveStatsTool(this.dataStatisticsManager));
    this.toolRegistry.registerImplementation(new DataCorrelationRegressionTool(this.dataStatisticsManager));
    this.toolRegistry.registerImplementation(new DataHypothesisTestTool(this.dataStatisticsManager));
    this.toolRegistry.registerImplementation(new DataVisualizeTool(this.dataStatisticsManager));
    this.toolRegistry.registerImplementation(new DataPipelineTool(this.dataStatisticsManager));

    // Register implemented Coding Engine, Agent, and Tools
    this.codingManager =
      config.codingManager ||
      new CodingManager(this.permissionManager, this.guardian, this.auditLogger);
    const codingAgent = new CodingAgent(this.codingManager);
    this.agentRegistry.registerImplementation(codingAgent);

    this.toolRegistry.registerImplementation(new CodeInspectRepoTool(this.codingManager));
    this.toolRegistry.registerImplementation(new CodeSearchTool(this.codingManager));
    this.toolRegistry.registerImplementation(new CodeAnalyzeTool(this.codingManager));
    this.toolRegistry.registerImplementation(new CodeReviewTool(this.codingManager));
    this.toolRegistry.registerImplementation(new CodeProposePatchTool(this.codingManager));
    this.toolRegistry.registerImplementation(new CodeApplyPatchTool(this.codingManager));
    this.toolRegistry.registerImplementation(new CodeRollbackTool(this.codingManager));
    this.toolRegistry.registerImplementation(new CodeDebugErrorTool(this.codingManager));

    // Register implemented Development Environment Engine, Agent, and Tools
    this.devEnvManager =
      config.devEnvManager ||
      new DevEnvManager(this.permissionManager, this.guardian);
    const devEnvAgent = new DevEnvAgent(this.devEnvManager);
    this.agentRegistry.registerImplementation(devEnvAgent);

    this.toolRegistry.registerImplementation(new DevEnvRunCommandTool(this.devEnvManager));
    this.toolRegistry.registerImplementation(new DevEnvGitStatusTool(this.devEnvManager));
    this.toolRegistry.registerImplementation(new DevEnvGitDiffTool(this.devEnvManager));
    this.toolRegistry.registerImplementation(new DevEnvGitLogTool(this.devEnvManager));
    this.toolRegistry.registerImplementation(new DevEnvGitCommitTool(this.devEnvManager));
    this.toolRegistry.registerImplementation(new DevEnvAuditDependenciesTool(this.devEnvManager));
    this.toolRegistry.registerImplementation(new DevEnvRunBuildTool(this.devEnvManager));
    this.toolRegistry.registerImplementation(new DevEnvRunTestsTool(this.devEnvManager));

    // Register implemented Tuklas EdTech Engine, Agent, and Tools
    this.tuklasManager =
      config.tuklasManager ||
      new TuklasManager(
        new TuklasClient(),
        this.permissionManager,
        this.guardian,
        this.auditLogger
      );
    const tuklasAgent = new TuklasAgent(this.tuklasManager);
    this.agentRegistry.registerImplementation(tuklasAgent);

    for (const tool of createTuklasTools(this.tuklasManager)) {
      this.toolRegistry.registerImplementation(tool);
    }

    // Register implemented Creative Studio Engine, Agent, and Tools
    this.creativeManager =
      config.creativeManager ||
      new CreativeManager(this.permissionManager, this.guardian, this.auditLogger);
    const creativeAgent = new CreativeAgent(this.creativeManager);
    this.agentRegistry.registerImplementation(creativeAgent);

    for (const tool of createCreativeTools(this.creativeManager)) {
      this.toolRegistry.registerImplementation(tool);
    }

    // Register implemented Animation & Bring-It-Alive Engine, Agent, and Tools
    this.animationManager =
      config.animationManager ||
      new AnimationManager(this.permissionManager, this.guardian, this.auditLogger);
    const animationAgent = new AnimationAgent(this.animationManager);
    this.agentRegistry.registerImplementation(animationAgent);

    for (const tool of createAnimationTools(this.animationManager)) {
      this.toolRegistry.registerImplementation(tool);
    }

    // Register implemented Innovation & Venture Architecture Engine, Agent, and Tools
    this.innovationManager =
      config.innovationManager ||
      new InnovationManager(this.permissionManager, this.guardian, this.auditLogger);
    const innovationAgent = new InnovationAgent(this.innovationManager);
    this.agentRegistry.registerImplementation(innovationAgent);

    for (const tool of createInnovationTools(this.innovationManager)) {
      this.toolRegistry.registerImplementation(tool);
    }

    // Register implemented Financial Research Engine, Agent, and Tools
    this.financeManager =
      config.financeManager ||
      new FinanceManager(this.permissionManager, this.guardian, this.auditLogger);
    const financeAgent = new FinanceAgent(this.financeManager);
    this.agentRegistry.registerImplementation(financeAgent);

    for (const tool of createFinanceTools(this.financeManager)) {
      this.toolRegistry.registerImplementation(tool);
    }

    // Register implemented Web & Browser Engine, Agent, and Tools
    this.browserManager =
      config.browserManager ||
      new BrowserManager(this.permissionManager, this.guardian, this.auditLogger);
    const browserAgent = new BrowserAgent(this.browserManager);
    this.agentRegistry.registerImplementation(browserAgent);

    for (const tool of createBrowserTools(this.browserManager)) {
      this.toolRegistry.registerImplementation(tool);
    }

    // Register implemented Application Control Engine, Agent, and Tools
    this.applicationManager =
      config.applicationManager ||
      new ApplicationManager({
        permissionManager: this.permissionManager,
        guardian: this.guardian,
        auditLogger: this.auditLogger,
      });
    const appControlAgent = new ApplicationControlAgent(this.applicationManager);
    this.agentRegistry.registerImplementation(appControlAgent);

    for (const tool of createAppTools(this.applicationManager)) {
      this.toolRegistry.registerImplementation(tool);
    }

    // Register implemented Vision & Camera Intelligence Engine, Agent, and Tools
    this.visionManager =
      config.visionManager ||
      new VisionManager({
        permissionManager: this.permissionManager,
        guardian: this.guardian,
        auditLogger: this.auditLogger,
      });
    const visionAgent = new VisionAgent(this.visionManager);
    this.agentRegistry.registerImplementation(visionAgent);

    for (const tool of createVisionTools(this.visionManager)) {
      this.toolRegistry.registerImplementation(tool);
    }

    // Register implemented Voice & Audio Intelligence Engine, Agent, and Tools
    this.voiceManager =
      config.voiceManager ||
      new VoiceManager({
        permissionManager: this.permissionManager,
        guardian: this.guardian,
        auditLogger: this.auditLogger,
      });
    const voiceAgent = new VoiceAgent(this.voiceManager);
    this.agentRegistry.registerImplementation(voiceAgent);

    for (const tool of createVoiceTools(this.voiceManager)) {
      this.toolRegistry.registerImplementation(tool);
    }

    // Register implemented Hardware, Device & IoT Integration Engine, Agent, and Tools
    this.deviceManager =
      config.deviceManager ||
      new DeviceManager(this.permissionManager, this.guardian, this.auditLogger);
    const deviceAgent = new DeviceAgent(this.deviceManager);
    this.agentRegistry.registerImplementation(deviceAgent);

    for (const tool of createDeviceTools(this.deviceManager)) {
      this.toolRegistry.registerImplementation(tool);
    }

    logger.info('JARVIS Core initialized with Hardware & Device Agent, Voice & Audio Intelligence Agent, Vision & Camera Intelligence Agent, Application Control Agent, Web & Browser Studio, Financial Research, Innovation Studio, Animation Engine, Creative Studio, Tuklas EdTech, DevEnv, Coding, Data & Statistics, Research, Mathematics, Document Intelligence, Second Brain, Memory, Profile, Orchestrator, AI Provider, Guardian, and Registries');
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

    // 2. Fetch User Profile and Request context creation
    const userProfile = await this.userProfileManager.getProfile(userId);
    const profilePromptContext = await this.userProfileManager.getPromptContext(userId);

    const context = createRequestContext({
      userId,
      sessionId: request.sessionId,
      input: { text: request.message },
      source: 'web',
      userProfile,
      profileSummary: profilePromptContext,
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
    const memoryPromptContext = await this.memoryManager.getPromptMemoryContext(request.message, userId);
    const knowledgePromptContext = await this.secondBrain.getPromptKnowledgeContext(request.message, 3, userId);
    const systemInstruction = `${JARVIS_SYSTEM_INSTRUCTION}\n\n${profilePromptContext}\n\n${memoryPromptContext}\n\n${knowledgePromptContext}`;

    try {
      providerResponse = await this.aiProvider.generate({
        messages: aiMessages,
        systemInstruction,
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
      user: {
        name: userProfile.identity.name,
        preferredName: userProfile.identity.preferredName,
        role: userProfile.identity.role,
      },
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

  public getOrchestrator(): Orchestrator {
    return this.orchestrator;
  }

  public getUserProfileManager(): UserProfileManager {
    return this.userProfileManager;
  }

  public getMemoryManager(): ConversationMemoryManager {
    return this.memoryManager;
  }

  public getSecondBrain(): SecondBrainManager {
    return this.secondBrain;
  }

  public getDocumentIntelligence(): DocumentIntelligenceManager {
    return this.documentIntelligence;
  }

  public getMathematicsEngine(): MathematicsEngine {
    return this.mathEngine;
  }

  public getResearchManager(): ResearchManager {
    return this.researchManager;
  }

  public getDataStatisticsManager(): DataStatisticsManager {
    return this.dataStatisticsManager;
  }

  public getCodingManager(): CodingManager {
    return this.codingManager;
  }

  public getDevEnvManager(): DevEnvManager {
    return this.devEnvManager;
  }

  public getTuklasManager(): TuklasManager {
    return this.tuklasManager;
  }

  public getCreativeManager(): CreativeManager {
    return this.creativeManager;
  }

  public getAnimationManager(): AnimationManager {
    return this.animationManager;
  }

  public getInnovationManager(): InnovationManager {
    return this.innovationManager;
  }

  public getFinanceManager(): FinanceManager {
    return this.financeManager;
  }

  public getBrowserManager(): BrowserManager {
    return this.browserManager;
  }

  public getApplicationManager(): ApplicationManager {
    return this.applicationManager;
  }

  public getVisionManager(): VisionManager {
    return this.visionManager;
  }

  public getVoiceManager(): VoiceManager {
    return this.voiceManager;
  }

  public getDeviceManager(): DeviceManager {
    return this.deviceManager;
  }

  public async orchestrate(
    goal: string,
    userId = 'default_user',
    options?: {
      explicitSteps?: Partial<TaskStep>[];
      userConfirmedHighRisk?: boolean;
    }
  ): Promise<OrchestrationResult> {
    const requestId = `req_orch_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    return this.orchestrator.orchestrate(requestId, goal, userId, options);
  }
}
