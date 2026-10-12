/**
 * JARVIS Phase 10 - Coding Tools
 * Implements ITool instances for registration in ToolRegistry.
 */

import { ITool, ToolDefinition, ToolExecutionContext, ToolExecutionResult } from '../tools/tool.interface.js';
import { ResourceType, PermissionLevel } from '../security/types.js';
import { CodingManager } from './coding-manager.js';

/**
 * 1. CodeInspectRepoTool: code.inspect_repo
 */
export class CodeInspectRepoTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'code.inspect_repo',
    name: 'Repository Architecture Inspector',
    description: 'Inspects repository tree, computes language percentages, and identifies entry points',
    version: '1.0.0',
    requiredPermissions: [
      { resource: ResourceType.FILES, action: 'read', level: PermissionLevel.READ },
    ],
    parametersSchema: {
      type: 'object',
      properties: {
        rootPath: { type: 'string' },
      },
    },
    status: 'implemented',
  };

  constructor(private readonly manager: CodingManager) {}

  public async execute(params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const p = (params || {}) as { rootPath?: string };
      const root = p.rootPath || process.cwd();
      const res = this.manager.inspectRepository(root, context.userId);
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
 * 2. CodeSearchTool: code.search
 */
export class CodeSearchTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'code.search',
    name: 'Codebase Grep Search',
    description: 'Searches source files for text or regex patterns with surrounding context lines',
    version: '1.0.0',
    requiredPermissions: [
      { resource: ResourceType.FILES, action: 'read', level: PermissionLevel.READ },
    ],
    parametersSchema: {
      type: 'object',
      properties: {
        query: { type: 'string' },
        rootPath: { type: 'string' },
        isRegex: { type: 'boolean' },
      },
      required: ['query'],
    },
    status: 'implemented',
  };

  constructor(private readonly manager: CodingManager) {}

  public async execute(params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const p = params as any;
      const root = p.rootPath || process.cwd();
      const res = this.manager.searchCode(root, p.query, { isRegex: p.isRegex }, context.userId);
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
 * 3. CodeAnalyzeTool: code.analyze
 */
export class CodeAnalyzeTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'code.analyze',
    name: 'Source Code Symbol Analyzer',
    description: 'Extracts classes, interfaces, functions, imports, and cyclomatic complexity score',
    version: '1.0.0',
    requiredPermissions: [
      { resource: ResourceType.FILES, action: 'read', level: PermissionLevel.READ },
    ],
    parametersSchema: {
      type: 'object',
      properties: {
        filePath: { type: 'string' },
      },
      required: ['filePath'],
    },
    status: 'implemented',
  };

  constructor(private readonly manager: CodingManager) {}

  public async execute(params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const p = params as { filePath: string };
      const res = this.manager.analyzeFile(p.filePath, context.userId);
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
 * 4. CodeReviewTool: code.review
 */
export class CodeReviewTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'code.review',
    name: 'Code Reviewer & Security Auditor',
    description: 'Audits source file against security standards, eval usage, secrets, and complexity',
    version: '1.0.0',
    requiredPermissions: [
      { resource: ResourceType.FILES, action: 'read', level: PermissionLevel.READ },
    ],
    parametersSchema: {
      type: 'object',
      properties: {
        filePath: { type: 'string' },
      },
      required: ['filePath'],
    },
    status: 'implemented',
  };

  constructor(private readonly manager: CodingManager) {}

  public async execute(params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const p = params as { filePath: string };
      const res = this.manager.reviewFile(p.filePath, context.userId);
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
 * 5. CodeProposePatchTool: code.propose_patch
 */
export class CodeProposePatchTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'code.propose_patch',
    name: 'Diff Proposal Generator',
    description: 'Generates non-destructive diff proposal before modifying files',
    version: '1.0.0',
    requiredPermissions: [
      { resource: ResourceType.FILES, action: 'read', level: PermissionLevel.READ },
    ],
    parametersSchema: {
      type: 'object',
      properties: {
        filePath: { type: 'string' },
        targetContent: { type: 'string' },
        replacementContent: { type: 'string' },
        reason: { type: 'string' },
      },
      required: ['filePath', 'targetContent', 'replacementContent'],
    },
    status: 'implemented',
  };

  constructor(private readonly manager: CodingManager) {}

  public async execute(params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const p = params as any;
      const res = this.manager.proposeModification(
        p.filePath,
        p.targetContent,
        p.replacementContent,
        p.reason,
        context.userId
      );
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
 * 6. CodeApplyPatchTool: code.apply_patch
 */
export class CodeApplyPatchTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'code.apply_patch',
    name: 'Atomic Patch Applier',
    description: 'Applies diff proposal to disk with automated backup and verification',
    version: '1.0.0',
    requiredPermissions: [
      { resource: ResourceType.FILES, action: 'write', level: PermissionLevel.WRITE },
    ],
    parametersSchema: {
      type: 'object',
      properties: {
        proposal: { type: 'object' },
        confirmed: { type: 'boolean' },
      },
      required: ['proposal'],
    },
    status: 'implemented',
  };

  constructor(private readonly manager: CodingManager) {}

  public async execute(params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const p = params as any;
      const res = await this.manager.applyModification(p.proposal, p.confirmed, context.userId);
      return {
        success: res.success,
        toolId: this.definition.id,
        data: res,
        verified: res.verified,
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
 * 7. CodeRollbackTool: code.rollback
 */
export class CodeRollbackTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'code.rollback',
    name: 'Patch Rollback Tool',
    description: 'Reverts a patched file to its previous pre-modification backup',
    version: '1.0.0',
    requiredPermissions: [
      { resource: ResourceType.FILES, action: 'write', level: PermissionLevel.WRITE },
    ],
    parametersSchema: {
      type: 'object',
      properties: {
        filePath: { type: 'string' },
      },
      required: ['filePath'],
    },
    status: 'implemented',
  };

  constructor(private readonly manager: CodingManager) {}

  public async execute(params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const p = params as { filePath: string };
      const rolled = this.manager.rollbackModification(p.filePath, context.userId);
      return {
        success: rolled,
        toolId: this.definition.id,
        data: { filePath: p.filePath, rolledBack: rolled },
        verified: rolled,
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
 * 8. CodeDebugErrorTool: code.debug_error
 */
export class CodeDebugErrorTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'code.debug_error',
    name: 'Runtime Stack Trace Debugger',
    description: 'Analyzes runtime stack traces, identifies root cause, and generates suggested code fixes',
    version: '1.0.0',
    requiredPermissions: [
      { resource: ResourceType.FILES, action: 'read', level: PermissionLevel.READ },
    ],
    parametersSchema: {
      type: 'object',
      properties: {
        rawError: { type: 'string' },
        projectRoot: { type: 'string' },
      },
      required: ['rawError'],
    },
    status: 'implemented',
  };

  constructor(private readonly manager: CodingManager) {}

  public async execute(params: unknown, _context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const p = params as { rawError: string; projectRoot?: string };
      const res = this.manager.debugError(p.rawError, p.projectRoot || process.cwd());
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
