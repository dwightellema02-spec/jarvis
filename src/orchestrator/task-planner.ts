import { ResourceType, PermissionAction, PermissionLevel } from '../security/types.js';
import { ExecutionPlan, TaskStep, RiskLevel, SystemLimitation } from './types.js';
import { RiskEvaluator } from './risk-evaluator.js';
import { AgentRegistry } from '../agents/agent-registry.js';
import { ToolRegistry } from '../tools/tool-registry.js';
import { logger } from '../utils/logger.js';

export class TaskPlanner {
  private riskEvaluator: RiskEvaluator;
  private agentRegistry: AgentRegistry;
  private toolRegistry: ToolRegistry;

  constructor(agentRegistry: AgentRegistry, toolRegistry: ToolRegistry, riskEvaluator?: RiskEvaluator) {
    this.agentRegistry = agentRegistry;
    this.toolRegistry = toolRegistry;
    this.riskEvaluator = riskEvaluator || new RiskEvaluator();
  }

  /**
   * Plans an execution workflow based on a user goal.
   */
  public plan(requestId: string, goal: string, options?: { explicitSteps?: Partial<TaskStep>[] }): ExecutionPlan {
    const planId = `plan_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const steps: TaskStep[] = [];
    const limitationsDetected: SystemLimitation[] = [];

    if (options?.explicitSteps && options.explicitSteps.length > 0) {
      // Use provided structured steps, enriching them with risk and limitation evaluations
      for (let i = 0; i < options.explicitSteps.length; i++) {
        const raw = options.explicitSteps[i];
        const resource = raw.resource || ResourceType.APPLICATIONS;
        const action = raw.action || 'read';
        const target = (raw.parameters?.path || raw.parameters?.target || raw.parameters?.query || '') as string;

        const riskAssessment = this.riskEvaluator.evaluate({
          resource,
          action,
          target,
          parameters: raw.parameters,
        });

        const step: TaskStep = {
          id: raw.id || `step_${i + 1}`,
          name: raw.name || `Execute ${action} on ${resource}`,
          description: raw.description || `Step ${i + 1} for goal: ${goal}`,
          agentId: raw.agentId,
          toolId: raw.toolId,
          resource,
          action,
          requiredPermissionLevel: raw.requiredPermissionLevel || riskAssessment.minimumPermissionLevel,
          riskLevel: raw.riskLevel || riskAssessment.riskLevel,
          parameters: raw.parameters || {},
          dependencies: raw.dependencies || [],
          status: 'PENDING',
        };

        this.checkStepLimitations(step, limitationsDetected);
        steps.push(step);
      }
    } else {
      // Decompose natural language goal into appropriate task steps
      this.decomposeGoal(goal, steps, limitationsDetected);
    }

    const overallRisk = this.riskEvaluator.computeOverallRisk(steps);
    const requiresHumanConfirmation = steps.some((s) => s.riskLevel === RiskLevel.HIGH || s.riskLevel === RiskLevel.CRITICAL);

    const plan: ExecutionPlan = {
      id: planId,
      requestId,
      goal,
      steps,
      overallRisk,
      requiresHumanConfirmation,
      limitationsDetected,
      createdAt: new Date().toISOString(),
    };

    logger.info(`Task plan generated: ${planId}`, {
      goal,
      stepCount: steps.length,
      overallRisk,
      limitationsCount: limitationsDetected.length,
    });

    return plan;
  }

  private decomposeGoal(goal: string, steps: TaskStep[], limitations: SystemLimitation[]): void {
    const lower = goal.toLowerCase();

    // 1. Detect Intent: Physical Camera / Hardware
    if (lower.includes('camera') || lower.includes('photo') || lower.includes('webcam')) {
      const step: TaskStep = {
        id: 'step_camera_1',
        name: 'Access Camera Stream',
        description: 'Attempt to capture frame from video hardware',
        agentId: 'device-agent',
        toolId: 'camera.capture',
        resource: ResourceType.CAMERA,
        action: 'read',
        requiredPermissionLevel: PermissionLevel.ADMIN,
        riskLevel: RiskLevel.HIGH,
        parameters: {},
        status: 'PENDING',
      };
      this.checkStepLimitations(step, limitations);
      steps.push(step);
      return;
    }

    // 2. Detect Intent: Financial Execution
    if (lower.includes('transfer') || lower.includes('buy bitcoin') || lower.includes('trade')) {
      const step: TaskStep = {
        id: 'step_finance_1',
        name: 'Execute Financial Transaction',
        description: 'Direct capital transfer or automated market order',
        agentId: 'financial-research-agent',
        resource: ResourceType.FINANCIAL_SERVICES,
        action: 'transfer',
        requiredPermissionLevel: PermissionLevel.ADMIN,
        riskLevel: RiskLevel.CRITICAL,
        parameters: { goal },
        status: 'PENDING',
      };
      this.checkStepLimitations(step, limitations);
      steps.push(step);
      return;
    }

    // 3. Detect Intent: Coding / File Operations
    if (lower.includes('create file') || lower.includes('write file') || lower.includes('modify code')) {
      const step: TaskStep = {
        id: 'step_file_write_1',
        name: 'Write Project File',
        description: 'Generate or modify target file within workspace',
        agentId: 'coding-agent',
        toolId: 'files.write',
        resource: ResourceType.FILES,
        action: 'write',
        requiredPermissionLevel: PermissionLevel.WRITE,
        riskLevel: RiskLevel.MEDIUM,
        parameters: { goal },
        status: 'PENDING',
      };
      this.checkStepLimitations(step, limitations);
      steps.push(step);
      return;
    }

    // 4. Detect Intent: Terminal Command
    if (lower.includes('run command') || lower.includes('terminal') || lower.includes('build project')) {
      const step: TaskStep = {
        id: 'step_cmd_1',
        name: 'Execute Terminal Command',
        description: 'Run build, test, or workspace command',
        agentId: 'coding-agent',
        toolId: 'terminal.execute',
        resource: ResourceType.APPLICATIONS,
        action: 'execute',
        requiredPermissionLevel: PermissionLevel.EXECUTE,
        riskLevel: RiskLevel.HIGH,
        parameters: { command: 'npm test' },
        status: 'PENDING',
      };
      this.checkStepLimitations(step, limitations);
      steps.push(step);
      return;
    }

    // 5. Detect Intent: Mathematics
    if (lower.includes('solve') || lower.includes('calculate') || lower.includes('integral') || lower.includes('algebra')) {
      steps.push({
        id: 'step_math_1',
        name: 'Solve Mathematical Problem',
        description: 'Step-by-step mathematical reasoning and verification',
        agentId: 'mathematics-agent',
        toolId: 'calculator',
        resource: ResourceType.APIS,
        action: 'read',
        requiredPermissionLevel: PermissionLevel.READ,
        riskLevel: RiskLevel.LOW,
        parameters: { expression: goal },
        status: 'PENDING',
      });
      return;
    }

    // 6. Default: Conversational / Reasoning Query
    steps.push({
      id: 'step_assistant_1',
      name: 'Conversational Reasoning',
      description: 'Analyze request and provide structured response',
      agentId: 'personal-assistant-agent',
      resource: ResourceType.PROJECTS,
      action: 'read',
      requiredPermissionLevel: PermissionLevel.READ,
      riskLevel: RiskLevel.LOW,
      parameters: { query: goal },
      status: 'PENDING',
    });
  }

  private checkStepLimitations(step: TaskStep, limitations: SystemLimitation[]): void {
    // Check Agent Implementation Status
    if (step.agentId) {
      const agent = this.agentRegistry.get(step.agentId);
      if (!agent || agent.status === 'registered') {
        const lim: SystemLimitation = {
          subsystem: 'AgentRegistry',
          capability: step.agentId,
          reason: `Agent '${step.agentId}' is registered in architecture but not yet implemented in Phase 2`,
          targetPhase: this.getPhaseForAgent(step.agentId),
          workaround: 'Use JARVIS Core conversational assistance for conceptual reasoning',
        };
        limitations.push(lim);
        step.status = 'BLOCKED_BY_LIMITATION';
        step.limitation = lim;
      }
    }

    // Check Tool Implementation Status
    if (step.toolId) {
      const tool = this.toolRegistry.get(step.toolId);
      if (!tool || tool.status === 'registered') {
        const lim: SystemLimitation = {
          subsystem: 'ToolRegistry',
          capability: step.toolId,
          reason: `Tool '${step.toolId}' is declared in registry but not yet connected to external host runtime`,
          targetPhase: this.getPhaseForTool(step.toolId),
        };
        limitations.push(lim);
        step.status = 'BLOCKED_BY_LIMITATION';
        step.limitation = lim;
      }
    }

    // Check Prohibited Critical Capabilities
    if (step.resource === ResourceType.FINANCIAL_SERVICES && step.action === 'transfer') {
      const lim: SystemLimitation = {
        subsystem: 'FinancialSecurity',
        capability: 'automated_trading_and_transfer',
        reason: 'Automated capital transfer is prohibited by security policy (Phase 16 will introduce educational analysis only)',
        targetPhase: 16,
      };
      limitations.push(lim);
      step.status = 'BLOCKED_BY_LIMITATION';
      step.limitation = lim;
    }
  }

  private getPhaseForAgent(agentId: string): number {
    switch (agentId) {
      case 'mathematics-agent': return 7;
      case 'research-agent': return 8;
      case 'data-statistics-agent': return 9;
      case 'coding-agent': return 10;
      case 'creative-agent': return 13;
      case 'financial-research-agent': return 16;
      case 'device-agent': return 21;
      case 'threat-detection-agent': return 29;
      default: return 4;
    }
  }

  private getPhaseForTool(toolId: string): number {
    switch (toolId) {
      case 'camera.capture': return 19;
      case 'microphone.record': return 20;
      case 'device_bridge.command': return 21;
      case 'browser.open':
      case 'browser.navigate': return 17;
      case 'terminal.execute': return 11;
      case 'files.write':
      case 'files.delete': return 10;
      default: return 6;
    }
  }
}
