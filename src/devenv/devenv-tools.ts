/**
 * JARVIS Phase 11 - Development Environment Tools
 * Implements ITool instances for registration in ToolRegistry.
 */

import { ITool, ToolDefinition, ToolExecutionContext, ToolExecutionResult } from '../tools/tool.interface.js';
import { ResourceType, PermissionLevel } from '../security/types.js';
import { DevEnvManager } from './devenv-manager.js';

/**
 * 1. DevEnvRunCommandTool: devenv.run_command
 */
export class DevEnvRunCommandTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'devenv.run_command',
    name: 'Safe Terminal Command Runner',
    description: 'Executes a CLI command in the project environment with Guardian safety checks and risk gating',
    version: '1.0.0',
    requiredPermissions: [
      { resource: ResourceType.SYSTEM, action: 'execute', level: PermissionLevel.EXECUTE },
    ],
    parametersSchema: {
      type: 'object',
      properties: {
        command: { type: 'string' },
        cwd: { type: 'string' },
        confirmed: { type: 'boolean' },
        timeoutMs: { type: 'number' },
      },
      required: ['command'],
    },
    status: 'implemented',
  };

  constructor(private readonly manager: DevEnvManager) {}

  public async execute(params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const p = (params || {}) as { command: string; cwd?: string; confirmed?: boolean; timeoutMs?: number };
      const res = await this.manager.executeCommand(
        {
          command: p.command,
          cwd: p.cwd,
          confirmed: p.confirmed,
          timeoutMs: p.timeoutMs,
        },
        context.userId
      );

      return {
        success: !res.blocked && res.exitCode === 0,
        toolId: this.definition.id,
        data: res,
        verified: !res.blocked,
        executionTimeMs: Date.now() - startTime,
      };
    } catch (err: any) {
      return {
        success: false,
        toolId: this.definition.id,
        error: err.message,
        verified: false,
        executionTimeMs: Date.now() - startTime,
      };
    }
  }
}

/**
 * 2. DevEnvGitStatusTool: devenv.git_status
 */
export class DevEnvGitStatusTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'devenv.git_status',
    name: 'Git Status Inspector',
    description: 'Retrieves current git branch, commit status, modified and staged files',
    version: '1.0.0',
    requiredPermissions: [
      { resource: ResourceType.SYSTEM, action: 'read', level: PermissionLevel.READ },
    ],
    parametersSchema: {
      type: 'object',
      properties: {
        cwd: { type: 'string' },
      },
    },
    status: 'implemented',
  };

  constructor(private readonly manager: DevEnvManager) {}

  public async execute(params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const p = (params || {}) as { cwd?: string };
      const res = await this.manager.getGitStatus(p.cwd, context.userId);
      return {
        success: true,
        toolId: this.definition.id,
        data: res,
        verified: true,
        executionTimeMs: Date.now() - startTime,
      };
    } catch (err: any) {
      return {
        success: false,
        toolId: this.definition.id,
        error: err.message,
        verified: false,
        executionTimeMs: Date.now() - startTime,
      };
    }
  }
}

/**
 * 3. DevEnvGitDiffTool: devenv.git_diff
 */
export class DevEnvGitDiffTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'devenv.git_diff',
    name: 'Git Diff Inspector',
    description: 'Inspects uncommitted or staged differences across repository files',
    version: '1.0.0',
    requiredPermissions: [
      { resource: ResourceType.SYSTEM, action: 'read', level: PermissionLevel.READ },
    ],
    parametersSchema: {
      type: 'object',
      properties: {
        staged: { type: 'boolean' },
        cwd: { type: 'string' },
      },
    },
    status: 'implemented',
  };

  constructor(private readonly manager: DevEnvManager) {}

  public async execute(params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const p = (params || {}) as { staged?: boolean; cwd?: string };
      const diff = await this.manager.getGitDiff(Boolean(p.staged), p.cwd, context.userId);
      return {
        success: true,
        toolId: this.definition.id,
        data: { diff },
        verified: true,
        executionTimeMs: Date.now() - startTime,
      };
    } catch (err: any) {
      return {
        success: false,
        toolId: this.definition.id,
        error: err.message,
        verified: false,
        executionTimeMs: Date.now() - startTime,
      };
    }
  }
}

/**
 * 4. DevEnvGitLogTool: devenv.git_log
 */
export class DevEnvGitLogTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'devenv.git_log',
    name: 'Git Commit History Log',
    description: 'Fetches recent git commit history with author, date, and commit messages',
    version: '1.0.0',
    requiredPermissions: [
      { resource: ResourceType.SYSTEM, action: 'read', level: PermissionLevel.READ },
    ],
    parametersSchema: {
      type: 'object',
      properties: {
        limit: { type: 'number' },
        cwd: { type: 'string' },
      },
    },
    status: 'implemented',
  };

  constructor(private readonly manager: DevEnvManager) {}

  public async execute(params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const p = (params || {}) as { limit?: number; cwd?: string };
      const entries = await this.manager.getGitLog(p.limit || 10, p.cwd, context.userId);
      return {
        success: true,
        toolId: this.definition.id,
        data: { entries, count: entries.length },
        verified: true,
        executionTimeMs: Date.now() - startTime,
      };
    } catch (err: any) {
      return {
        success: false,
        toolId: this.definition.id,
        error: err.message,
        verified: false,
        executionTimeMs: Date.now() - startTime,
      };
    }
  }
}

/**
 * 5. DevEnvGitCommitTool: devenv.git_commit
 */
export class DevEnvGitCommitTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'devenv.git_commit',
    name: 'Git Commit Creator',
    description: 'Creates a git commit with confirmed message under WRITE SYSTEM permissions',
    version: '1.0.0',
    requiredPermissions: [
      { resource: ResourceType.SYSTEM, action: 'write', level: PermissionLevel.WRITE },
    ],
    parametersSchema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        confirmed: { type: 'boolean' },
        cwd: { type: 'string' },
      },
      required: ['message'],
    },
    status: 'implemented',
  };

  constructor(private readonly manager: DevEnvManager) {}

  public async execute(params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const p = (params || {}) as { message: string; confirmed?: boolean; cwd?: string };
      const res = await this.manager.commitGit(p.message, Boolean(p.confirmed), p.cwd, context.userId);
      return {
        success: res.success,
        toolId: this.definition.id,
        data: res,
        verified: res.success,
        executionTimeMs: Date.now() - startTime,
      };
    } catch (err: any) {
      return {
        success: false,
        toolId: this.definition.id,
        error: err.message,
        verified: false,
        executionTimeMs: Date.now() - startTime,
      };
    }
  }
}

/**
 * 6. DevEnvAuditDependenciesTool: devenv.audit_dependencies
 */
export class DevEnvAuditDependenciesTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'devenv.audit_dependencies',
    name: 'Dependency & Security Auditor',
    description: 'Audits project npm dependencies and parses security vulnerability reports',
    version: '1.0.0',
    requiredPermissions: [
      { resource: ResourceType.SYSTEM, action: 'read', level: PermissionLevel.READ },
    ],
    parametersSchema: {
      type: 'object',
      properties: {
        cwd: { type: 'string' },
      },
    },
    status: 'implemented',
  };

  constructor(private readonly manager: DevEnvManager) {}

  public async execute(params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const p = (params || {}) as { cwd?: string };
      const audit = await this.manager.auditDependencies(p.cwd, context.userId);
      return {
        success: true,
        toolId: this.definition.id,
        data: audit,
        verified: true,
        executionTimeMs: Date.now() - startTime,
      };
    } catch (err: any) {
      return {
        success: false,
        toolId: this.definition.id,
        error: err.message,
        verified: false,
        executionTimeMs: Date.now() - startTime,
      };
    }
  }
}

/**
 * 7. DevEnvRunBuildTool: devenv.run_build
 */
export class DevEnvRunBuildTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'devenv.run_build',
    name: 'Build & Compilation Runner',
    description: 'Executes npm run build and verifies output artifacts',
    version: '1.0.0',
    requiredPermissions: [
      { resource: ResourceType.SYSTEM, action: 'execute', level: PermissionLevel.EXECUTE },
    ],
    parametersSchema: {
      type: 'object',
      properties: {
        cwd: { type: 'string' },
      },
    },
    status: 'implemented',
  };

  constructor(private readonly manager: DevEnvManager) {}

  public async execute(params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const p = (params || {}) as { cwd?: string };
      const res = await this.manager.runBuild(p.cwd, context.userId);
      return {
        success: res.success,
        toolId: this.definition.id,
        data: res,
        verified: res.success,
        executionTimeMs: Date.now() - startTime,
      };
    } catch (err: any) {
      return {
        success: false,
        toolId: this.definition.id,
        error: err.message,
        verified: false,
        executionTimeMs: Date.now() - startTime,
      };
    }
  }
}

/**
 * 8. DevEnvRunTestsTool: devenv.run_tests
 */
export class DevEnvRunTestsTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'devenv.run_tests',
    name: 'Test Suite Runner',
    description: 'Executes automated tests and summarizes test counts and pass/fail status',
    version: '1.0.0',
    requiredPermissions: [
      { resource: ResourceType.SYSTEM, action: 'execute', level: PermissionLevel.EXECUTE },
    ],
    parametersSchema: {
      type: 'object',
      properties: {
        cwd: { type: 'string' },
        filter: { type: 'string' },
      },
    },
    status: 'implemented',
  };

  constructor(private readonly manager: DevEnvManager) {}

  public async execute(params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const p = (params || {}) as { cwd?: string; filter?: string };
      const res = await this.manager.runTests(p.cwd, p.filter, context.userId);
      return {
        success: res.success,
        toolId: this.definition.id,
        data: res,
        verified: res.success,
        executionTimeMs: Date.now() - startTime,
      };
    } catch (err: any) {
      return {
        success: false,
        toolId: this.definition.id,
        error: err.message,
        verified: false,
        executionTimeMs: Date.now() - startTime,
      };
    }
  }
}
