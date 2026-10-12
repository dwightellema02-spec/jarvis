/**
 * JARVIS Phase 10 - Coding Intelligence Manager
 * Coordinates repository inspection, code search, analysis, patch proposals,
 * safe execution, rollbacks, and error debugging.
 */

import * as fs from 'fs';
import { PermissionManager } from '../security/permission-manager.js';
import { SecurityGuardian } from '../security/guardian.js';
import { AuditLogger } from '../audit/audit-logger.js';
import { ResourceType, PermissionLevel, SecurityDecisionType } from '../security/types.js';
import {
  RepositoryOverview,
  CodeSearchResult,
  CodeAnalysisResult,
  CodeReviewReport,
  CodeDiffProposal,
  CodeModificationResult,
  ErrorDiagnostic,
} from './coding.interface.js';
import { RepositoryInspector } from './repository-inspector.js';
import { CodeAnalyzer } from './code-analyzer.js';
import { CodePatcher } from './code-patcher.js';
import { ErrorDebugger } from './error-debugger.js';
import { logger } from '../utils/logger.js';

export class CodingManager {
  private inspector: RepositoryInspector;
  private analyzer: CodeAnalyzer;
  private patcher: CodePatcher;
  private debuggerEngine: ErrorDebugger;

  constructor(
    private readonly permissionManager: PermissionManager,
    private readonly guardian: SecurityGuardian,
    private readonly auditLogger: AuditLogger
  ) {
    this.inspector = new RepositoryInspector();
    this.analyzer = new CodeAnalyzer();
    this.patcher = new CodePatcher();
    this.debuggerEngine = new ErrorDebugger();
  }

  /**
   * Inspects a repository folder structure and language breakdown.
   */
  public inspectRepository(rootPath: string, userId = 'default_user'): RepositoryOverview {
    this.checkPermission(userId, PermissionLevel.READ, 'read');
    return this.inspector.inspectRepository(rootPath);
  }

  /**
   * Searches for symbols, strings, or regex patterns across the codebase.
   */
  public searchCode(
    rootPath: string,
    query: string,
    options: { isRegex?: boolean; fileExtensions?: string[]; contextLines?: number; maxMatches?: number } = {},
    userId = 'default_user'
  ): CodeSearchResult {
    this.checkPermission(userId, PermissionLevel.READ, 'read');
    return this.inspector.searchCode(rootPath, query, options);
  }

  /**
   * Analyzes an individual source code file for architectural symbols and complexity.
   */
  public analyzeFile(filePath: string, userId = 'default_user'): CodeAnalysisResult {
    this.checkPermission(userId, PermissionLevel.READ, 'read');
    if (!fs.existsSync(filePath)) {
      throw new Error(`File does not exist: ${filePath}`);
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    return this.analyzer.analyzeCode(content, filePath);
  }

  /**
   * Conducts a code review checking security rules and maintainability.
   */
  public reviewFile(filePath: string, userId = 'default_user'): CodeReviewReport {
    this.checkPermission(userId, PermissionLevel.READ, 'read');
    if (!fs.existsSync(filePath)) {
      throw new Error(`File does not exist: ${filePath}`);
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    return this.analyzer.reviewCode(content, filePath);
  }

  /**
   * Creates a formal diff proposal before any modification occurs.
   */
  public proposeModification(
    filePath: string,
    targetContent: string,
    replacementContent: string,
    reason?: string,
    userId = 'default_user'
  ): CodeDiffProposal {
    this.checkPermission(userId, PermissionLevel.READ, 'read');
    return this.patcher.proposePatch(filePath, targetContent, replacementContent, reason);
  }

  /**
   * Applies the proposed modification after verifying permissions and backups.
   */
  public async applyModification(
    proposal: CodeDiffProposal,
    confirmed = false,
    userId = 'default_user'
  ): Promise<CodeModificationResult> {
    this.checkPermission(userId, PermissionLevel.WRITE, 'write');

    const result = this.patcher.applyPatch(proposal, confirmed);

    // Audit log
    await this.auditLogger.log({
      user: userId,
      requestId: `req_patch_${Date.now()}`,
      resource: ResourceType.FILES,
      action: 'write',
      permissionRequired: PermissionLevel.WRITE,
      permissionGranted: PermissionLevel.WRITE,
      decision: SecurityDecisionType.ALLOW,
      reason: `Applied code patch to ${proposal.filePath}`,
      result: result.success ? 'SUCCESS' : 'FAILED',
      details: {
        filePath: proposal.filePath,
        linesModified: result.linesModified,
        verified: result.verified,
        backupPath: result.backupPath,
      },
    });

    if (result.success) {
      logger.info(`Successfully patched file: ${proposal.filePath} (${result.linesModified} lines modified)`);
    }

    return result;
  }

  /**
   * Reverts a file to its pre-patch state.
   */
  public rollbackModification(filePath: string, userId = 'default_user'): boolean {
    this.checkPermission(userId, PermissionLevel.WRITE, 'write');
    const rolled = this.patcher.rollback(filePath);
    if (rolled) {
      logger.info(`Rolled back file to backup: ${filePath}`);
    }
    return rolled;
  }

  /**
   * Diagnoses runtime stack traces and suggests fixes.
   */
  public debugError(rawError: string, projectRoot?: string): ErrorDiagnostic {
    return this.debuggerEngine.diagnoseError(rawError, projectRoot);
  }

  // --- Private Helpers ---

  private checkPermission(userId: string, level: PermissionLevel, action: any): void {
    const perm = this.permissionManager.checkPermission({
      userId,
      resource: ResourceType.FILES,
      action,
      requiredLevel: level,
    });

    if (!perm.allowed) {
      throw new Error(`Permission Denied: User ${userId} is not authorized for coding operation (${action}).`);
    }
  }
}
