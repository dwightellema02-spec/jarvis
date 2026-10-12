import { TaskPlanner } from './task-planner.js';
import { ExecutionManager } from './execution-manager.js';
import { RiskEvaluator } from './risk-evaluator.js';
import { AgentRouter } from './agent-router.js';
import { ToolRouter } from './tool-router.js';
import { VerificationEngine } from './verification-engine.js';
import { FailureRecoveryManager } from './failure-recovery.js';
import { AgentRegistry } from '../agents/agent-registry.js';
import { ToolRegistry } from '../tools/tool-registry.js';
import { PermissionManager } from '../security/permission-manager.js';
import { SecurityGuardian } from '../security/guardian.js';
import { AuditLogger } from '../audit/audit-logger.js';
import { ExecutionPlan, OrchestrationResult, TaskStep } from './types.js';
import { logger } from '../utils/logger.js';

export interface OrchestratorConfig {
  agentRegistry: AgentRegistry;
  toolRegistry: ToolRegistry;
  permissionManager: PermissionManager;
  guardian: SecurityGuardian;
  auditLogger: AuditLogger;
  riskEvaluator?: RiskEvaluator;
  verificationEngine?: VerificationEngine;
  failureRecovery?: FailureRecoveryManager;
}

export class Orchestrator {
  private planner: TaskPlanner;
  private executionManager: ExecutionManager;
  private riskEvaluator: RiskEvaluator;
  private agentRouter: AgentRouter;
  private toolRouter: ToolRouter;
  private verificationEngine: VerificationEngine;
  private failureRecovery: FailureRecoveryManager;

  constructor(config: OrchestratorConfig) {
    this.riskEvaluator = config.riskEvaluator || new RiskEvaluator();
    this.verificationEngine = config.verificationEngine || new VerificationEngine();
    this.failureRecovery = config.failureRecovery || new FailureRecoveryManager();

    this.agentRouter = new AgentRouter(config.agentRegistry);
    this.toolRouter = new ToolRouter(config.toolRegistry);

    this.planner = new TaskPlanner(config.agentRegistry, config.toolRegistry, this.riskEvaluator);

    this.executionManager = new ExecutionManager({
      permissionManager: config.permissionManager,
      guardian: config.guardian,
      auditLogger: config.auditLogger,
      agentRouter: this.agentRouter,
      toolRouter: this.toolRouter,
      verificationEngine: this.verificationEngine,
      failureRecovery: this.failureRecovery,
    });

    logger.info('JARVIS Orchestrator initialized (Phase 2 Architecture)');
  }

  /**
   * Plans and executes a user goal through the orchestrator pipeline:
   * Understand -> Plan -> Select Agent/Tool -> Risk Check -> Permission Check -> Execute -> Verify -> Respond
   */
  public async orchestrate(
    requestId: string,
    goal: string,
    userId = 'default_user',
    options?: {
      explicitSteps?: Partial<TaskStep>[];
      userConfirmedHighRisk?: boolean;
    }
  ): Promise<OrchestrationResult> {
    logger.info(`Orchestrator received goal: "${goal}" from user: ${userId}`);

    // 1. Plan
    const plan = this.planner.plan(requestId, goal, {
      explicitSteps: options?.explicitSteps,
    });

    // 2. Execute with risk checks, permissions, and verification
    const result = await this.executionManager.executePlan(plan, userId, {
      userConfirmedHighRisk: options?.userConfirmedHighRisk,
    });

    logger.info(`Orchestration completed for plan ${plan.id}. Success: ${result.success}`);
    return result;
  }

  public planOnly(requestId: string, goal: string, options?: { explicitSteps?: Partial<TaskStep>[] }): ExecutionPlan {
    return this.planner.plan(requestId, goal, options);
  }

  public getPlanner(): TaskPlanner {
    return this.planner;
  }

  public getExecutionManager(): ExecutionManager {
    return this.executionManager;
  }

  public getRiskEvaluator(): RiskEvaluator {
    return this.riskEvaluator;
  }

  public getVerificationEngine(): VerificationEngine {
    return this.verificationEngine;
  }

  public getFailureRecovery(): FailureRecoveryManager {
    return this.failureRecovery;
  }
}
