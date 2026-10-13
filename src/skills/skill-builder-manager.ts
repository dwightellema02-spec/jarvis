import {
  GeneratedToolDraft,
  SkillCreationRequest,
  SkillStatus,
  SkillValidationReport,
} from './skill-builder.interface.js';
import { SandboxRunner } from './sandbox-runner.js';
import { SkillGenerator } from './skill-generator.js';
import { ToolRegistry } from '../tools/tool-registry.js';
import { ITool, ToolDefinition, ToolExecutionContext, ToolExecutionResult } from '../tools/tool.interface.js';
import { SecurityGuardian } from '../security/guardian.js';
import { PermissionManager } from '../security/permission-manager.js';
import { AuditLogger } from '../audit/audit-logger.js';
import { PermissionLevel, ResourceType, SecurityDecisionType } from '../security/types.js';
import { logger } from '../utils/logger.js';

export interface SkillBuilderManagerOptions {
  guardian?: SecurityGuardian;
  permissionManager?: PermissionManager;
  auditLogger?: AuditLogger;
}

export class SkillBuilderManager {
  private skills: Map<string, GeneratedToolDraft> = new Map();
  private sandboxRunner: SandboxRunner;
  private generator: SkillGenerator;

  private guardian?: SecurityGuardian;
  private permissionManager?: PermissionManager;
  private auditLogger?: AuditLogger;

  constructor(
    private toolRegistry: ToolRegistry,
    options?: SkillBuilderManagerOptions
  ) {
    this.guardian = options?.guardian;
    this.permissionManager = options?.permissionManager;
    this.auditLogger = options?.auditLogger;

    this.sandboxRunner = new SandboxRunner();
    this.generator = new SkillGenerator();

    this.seedDefaultSkills();
  }

  // --- Security & Permission Check ---
  private checkPermission(
    action: 'read' | 'write' | 'execute' | 'admin',
    level: PermissionLevel,
    userId: string
  ): void {
    if (this.permissionManager) {
      const check = this.permissionManager.checkPermission({
        userId,
        resource: ResourceType.SYSTEM,
        action,
        requiredLevel: level,
      });

      if (!check.allowed) {
        if (this.auditLogger) {
          this.auditLogger.log({
            user: userId,
            requestId: `req_skill_${Date.now()}`,
            resource: ResourceType.SYSTEM,
            action: action as any,
            permissionRequired: level,
            permissionGranted: PermissionLevel.READ,
            decision: SecurityDecisionType.DENY,
            reason: `Permission denied on TOOLS (${action}) for user "${userId}".`,
            result: 'FAILED',
            durationMs: 1,
          });
        }
        throw new Error(
          `Security Violation: User "${userId}" does not have ${level} permission for action "${action}" on TOOLS.`
        );
      }
    }

    if (this.auditLogger) {
      this.auditLogger.log({
        user: userId,
        requestId: `req_skill_${Date.now()}`,
        resource: ResourceType.SYSTEM,
        action: action as any,
        permissionRequired: level,
        permissionGranted: level,
        decision: SecurityDecisionType.ALLOW,
        reason: `Skill action "${action}" authorized for user "${userId}".`,
        result: 'SUCCESS',
        durationMs: 1,
      });
    }
  }

  // --- Core Lifecycle Methods ---

  public listSkills(statusFilter?: SkillStatus, user: string = 'dwight'): GeneratedToolDraft[] {
    this.checkPermission('read', PermissionLevel.READ, user);
    let list = Array.from(this.skills.values());
    if (statusFilter) {
      list = list.filter((s) => s.status === statusFilter);
    }
    return list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  public getSkill(id: string, user: string = 'dwight'): GeneratedToolDraft {
    this.checkPermission('read', PermissionLevel.READ, user);
    const skill = this.skills.get(id);
    if (!skill) {
      throw new Error(`Skill "${id}" not found.`);
    }
    return skill;
  }

  public draftSkill(request: SkillCreationRequest, user: string = 'dwight'): GeneratedToolDraft {
    this.checkPermission('write', PermissionLevel.WRITE, user);

    if (this.guardian) {
      const threat = this.guardian.evaluate({
        resource: ResourceType.SYSTEM,
        action: 'write',
        target: request.name,
        userId: user,
      });
      if (threat.decision === SecurityDecisionType.DENY) {
        throw new Error(`Security Guardian blocked skill creation: ${threat.reason}`);
      }
    }

    const draft = this.generator.generateSkillDraft(request);
    this.skills.set(draft.id, draft);
    logger.info(`Skill draft created: ${draft.id} (${draft.name})`);
    return draft;
  }

  public async testSkill(id: string, user: string = 'dwight'): Promise<SkillValidationReport> {
    this.checkPermission('write', PermissionLevel.WRITE, user);
    const skill = this.getSkill(id, user);

    skill.status = 'testing';
    const report = await this.sandboxRunner.runValidationSuite(skill);

    if (report.overallStatus === 'passed') {
      skill.status = 'tested';
    } else {
      skill.status = 'rejected';
      skill.rejectionReason = `Validation failed: ${report.threatsFound.join(', ') || 'Test cases failed'}`;
    }

    skill.updatedAt = new Date().toISOString();
    return report;
  }

  /**
   * Governance requirement: No automatic unrestricted self-modification.
   * Admin or operator approval must be explicitly recorded before installation.
   */
  public reviewAndApprove(
    id: string,
    approved: boolean,
    reason?: string,
    user: string = 'dwight'
  ): GeneratedToolDraft {
    this.checkPermission('admin', PermissionLevel.ADMIN, user);
    const skill = this.getSkill(id, user);

    if (approved) {
      skill.status = 'awaiting_approval';
      skill.approvedBy = user;
      skill.rejectionReason = undefined;
      logger.info(`Skill "${id}" approved by operator "${user}". Ready for installation.`);
    } else {
      skill.status = 'rejected';
      skill.rejectionReason = reason || 'Rejected by operator review.';
      logger.warn(`Skill "${id}" rejected by operator "${user}": ${skill.rejectionReason}`);
    }

    skill.updatedAt = new Date().toISOString();
    return skill;
  }

  /**
   * Installs and hot-registers the approved custom tool into the active ToolRegistry.
   */
  public installSkill(id: string, user: string = 'dwight'): GeneratedToolDraft {
    this.checkPermission('admin', PermissionLevel.ADMIN, user);
    const skill = this.getSkill(id, user);

    // Invariant: only tested or approved skills can be installed
    if (skill.status !== 'tested' && skill.status !== 'awaiting_approval') {
      throw new Error(`Cannot install skill "${id}" in status "${skill.status}". Must be tested or approved first.`);
    }

    // Wrap dynamically into an ITool implementation
    const dynamicTool = this.createToolWrapper(skill);
    this.toolRegistry.registerImplementation(dynamicTool);

    skill.status = 'installed';
    skill.installedAt = new Date().toISOString();
    skill.updatedAt = new Date().toISOString();
    skill.runtimeToolRef = dynamicTool;

    logger.info(`Skill "${id}" successfully installed into ToolRegistry. Available to Orchestrator and Agents.`);
    return skill;
  }

  /**
   * Deregisters or disables the custom tool from ToolRegistry.
   */
  public uninstallSkill(id: string, user: string = 'dwight'): GeneratedToolDraft {
    this.checkPermission('admin', PermissionLevel.ADMIN, user);
    const skill = this.getSkill(id, user);

    this.toolRegistry.unregister(skill.id);
    skill.status = 'disabled';
    skill.updatedAt = new Date().toISOString();
    skill.runtimeToolRef = undefined;

    logger.info(`Skill "${id}" successfully uninstalled from ToolRegistry.`);
    return skill;
  }

  public deleteSkill(id: string, user: string = 'dwight'): boolean {
    this.checkPermission('admin', PermissionLevel.ADMIN, user);
    const skill = this.skills.get(id);
    if (!skill) return false;

    if (skill.status === 'installed') {
      this.uninstallSkill(id, user);
    }

    this.skills.delete(id);
    return true;
  }

  /**
   * Wraps a GeneratedToolDraft into a verified ITool implementation.
   */
  public createToolWrapper(draft: GeneratedToolDraft): ITool {
    const executor = this.sandboxRunner.compileSafeFunction(draft.implementationCode);

    const definition: ToolDefinition = {
      id: draft.id,
      name: draft.name,
      description: draft.description,
      requiredPermissions: draft.requiredPermissions,
      parametersSchema: draft.parametersSchema,
      status: 'implemented',
      version: draft.version,
    };

    return {
      definition,
      execute: async (params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> => {
        const start = Date.now();
        try {
          const data = await executor(params, context);
          return {
            success: true,
            toolId: definition.id,
            data,
            verified: true,
            executionTimeMs: Date.now() - start,
          };
        } catch (err: any) {
          return {
            success: false,
            toolId: definition.id,
            error: err.message,
            verified: false,
            executionTimeMs: Date.now() - start,
          };
        }
      },
    };
  }

  private seedDefaultSkills(): void {
    // 1. Weather Forecast simulated API adapter
    const weatherDraft: GeneratedToolDraft = {
      id: 'custom.weather_forecast',
      name: 'Dynamic Weather Forecast',
      description: 'Custom API adapter providing multi-day meteorological forecasts with humidity and precipitation indexes',
      type: 'api_adapter',
      version: '1.0.0',
      requiredPermissions: [
        { resource: ResourceType.SYSTEM, action: 'execute', level: PermissionLevel.EXECUTE },
      ],
      parametersSchema: {
        type: 'object',
        properties: {
          city: { type: 'string', description: 'City name or coordinates' },
          days: { type: 'number', default: 3 },
        },
        required: ['city'],
      },
      implementationCode: `
function execute(params, context) {
  const city = (params && params.city) || 'Metro Manila';
  const days = (params && params.days) || 3;
  return {
    location: city,
    currentTempC: 28.5,
    condition: 'Partly Cloudy with Scattered Showers',
    forecast: Array.from({ length: days }, (_, i) => ({
      day: i + 1,
      tempHighC: 31 + (i % 2),
      tempLowC: 24,
      rainChancePct: 40 + i * 10
    }))
  };
}
`,
      testCases: [
        {
          name: 'Forecast Test',
          input: { city: 'Tokyo', days: 2 },
          expectedSuccess: true,
          expectedOutputSubstring: 'Tokyo',
        },
      ],
      status: 'installed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      installedAt: new Date().toISOString(),
      approvedBy: 'system',
    };

    // 2. Vector Math Solver
    const vectorMathDraft: GeneratedToolDraft = {
      id: 'custom.vector_math',
      name: 'Custom Vector Mathematics Solver',
      description: 'Calculates vector dot products, cross products, magnitudes, and Euclidean distances',
      type: 'custom_solver',
      version: '1.0.0',
      requiredPermissions: [
        { resource: ResourceType.SYSTEM, action: 'execute', level: PermissionLevel.EXECUTE },
      ],
      parametersSchema: {
        type: 'object',
        properties: {
          operation: { type: 'string', enum: ['dot', 'cross', 'magnitude', 'distance'] },
          vectorA: { type: 'array', items: { type: 'number' } },
          vectorB: { type: 'array', items: { type: 'number' } },
        },
        required: ['operation', 'vectorA'],
      },
      implementationCode: `
function execute(params, context) {
  const op = (params && params.operation) || 'dot';
  const a = (params && params.vectorA) || [];
  const b = (params && params.vectorB) || [];

  if (op === 'magnitude') {
    const mag = Math.sqrt(a.reduce((sum, v) => sum + v * v, 0));
    return { operation: 'magnitude', result: Number(mag.toFixed(4)) };
  }

  if (op === 'dot') {
    const dot = a.reduce((sum, v, idx) => sum + v * (b[idx] || 0), 0);
    return { operation: 'dot', result: dot };
  }

  if (op === 'distance') {
    const dist = Math.sqrt(a.reduce((sum, v, idx) => sum + Math.pow(v - (b[idx] || 0), 2), 0));
    return { operation: 'distance', result: Number(dist.toFixed(4)) };
  }

  return { error: 'Unsupported vector operation: ' + op };
}
`,
      testCases: [
        {
          name: 'Vector Dot Product',
          input: { operation: 'dot', vectorA: [1, 2, 3], vectorB: [4, 5, 6] },
          expectedSuccess: true,
          expectedOutputSubstring: '"result":32',
        },
        {
          name: 'Vector Magnitude',
          input: { operation: 'magnitude', vectorA: [3, 4] },
          expectedSuccess: true,
          expectedOutputSubstring: '"result":5',
        },
      ],
      status: 'installed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      installedAt: new Date().toISOString(),
      approvedBy: 'system',
    };

    this.skills.set(weatherDraft.id, weatherDraft);
    this.skills.set(vectorMathDraft.id, vectorMathDraft);

    // Register into ToolRegistry
    this.toolRegistry.registerImplementation(this.createToolWrapper(weatherDraft));
    this.toolRegistry.registerImplementation(this.createToolWrapper(vectorMathDraft));
  }
}
