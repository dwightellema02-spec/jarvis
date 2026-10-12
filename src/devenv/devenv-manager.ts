/**
 * JARVIS Phase 11 - Development Environment Orchestration Manager
 * 
 * Enforces Permission Manager checks, Security Guardian validation,
 * and coordinates terminal execution, git operations, dependency audits,
 * and build/test runners.
 */

import { PermissionManager, PermissionLevel, ResourceType, SecurityDecisionType } from '../security/permission-manager.js';
import { SecurityGuardian } from '../security/guardian.js';
import { TerminalExecutor } from './terminal-executor.js';
import { GitManager } from './git-manager.js';
import { DependencyManager } from './dependency-manager.js';
import { BuildRunner } from './build-runner.js';
import {
  BuildTestRunResult,
  CommandSafetyAnalysis,
  DependencyAuditReport,
  GitBranchInfo,
  GitLogEntry,
  GitStatusResult,
  PackageJsonOverview,
  TerminalCommandRequest,
  TerminalCommandResult,
} from './devenv.interface.js';
import { logger } from '../utils/logger.js';

export class DevEnvManager {
  private permissionManager: PermissionManager;
  private guardian: SecurityGuardian;
  private terminalExecutor: TerminalExecutor;
  private gitManager: GitManager;
  private dependencyManager: DependencyManager;
  private buildRunner: BuildRunner;

  constructor(
    permissionManager: PermissionManager,
    guardian: SecurityGuardian,
    allowedRootDir?: string
  ) {
    this.permissionManager = permissionManager;
    this.guardian = guardian;
    this.terminalExecutor = new TerminalExecutor(allowedRootDir);
    this.gitManager = new GitManager(this.terminalExecutor);
    this.dependencyManager = new DependencyManager(this.terminalExecutor, allowedRootDir);
    this.buildRunner = new BuildRunner(this.terminalExecutor);
  }

  /**
   * Run a terminal command with security gating and permission checks
   */
  public async executeCommand(
    request: TerminalCommandRequest,
    userId: string = 'default_user'
  ): Promise<TerminalCommandResult> {
    const analysis = this.terminalExecutor.analyzeCommand(request.command);

    // 1. Permission check: EXECUTE on SYSTEM
    const permCheck = this.permissionManager.checkPermission({
      userId,
      resource: ResourceType.SYSTEM,
      action: 'execute',
      requiredLevel: PermissionLevel.EXECUTE,
    });

    if (!permCheck.allowed) {
      return {
        command: request.command,
        cwd: request.cwd || process.cwd(),
        exitCode: 1,
        stdout: '',
        stderr: `Permission Denied: User "${userId}" lacks EXECUTE permissions on SYSTEM.`,
        durationMs: 0,
        risk: analysis.risk,
        blocked: true,
        blockedReason: 'Permission Denied: Missing EXECUTE on SYSTEM',
      };
    }

    // 2. Guardian evaluation
    const guardianDecision = this.guardian.evaluate({
      resource: ResourceType.SYSTEM,
      action: 'execute',
      target: request.command,
      userId,
      metadata: { risk: analysis.risk },
    });

    if (guardianDecision.decision === SecurityDecisionType.DENY) {
      return {
        command: request.command,
        cwd: request.cwd || process.cwd(),
        exitCode: 1,
        stdout: '',
        stderr: `Security Guardian blocked command: ${guardianDecision.reason || 'Threat detected'}`,
        durationMs: 0,
        risk: analysis.risk,
        blocked: true,
        blockedReason: guardianDecision.reason,
      };
    }

    // 3. Execute
    const result = await this.terminalExecutor.executeCommand(request, true);
    return result;
  }

  /**
   * Analyze command risk without executing
   */
  public analyzeCommand(command: string): CommandSafetyAnalysis {
    return this.terminalExecutor.analyzeCommand(command);
  }

  /**
   * Safe Git status query
   */
  public async getGitStatus(cwd?: string, userId: string = 'default_user'): Promise<GitStatusResult> {
    this.assertReadPermission(userId, 'git_status');
    return this.gitManager.getStatus(cwd);
  }

  /**
   * Safe Git diff query
   */
  public async getGitDiff(
    staged: boolean = false,
    cwd?: string,
    userId: string = 'default_user'
  ): Promise<string> {
    this.assertReadPermission(userId, 'git_diff');
    return this.gitManager.getDiff(staged, cwd);
  }

  /**
   * Safe Git log query
   */
  public async getGitLog(
    limit: number = 10,
    cwd?: string,
    userId: string = 'default_user'
  ): Promise<GitLogEntry[]> {
    this.assertReadPermission(userId, 'git_log');
    return this.gitManager.getLog(limit, cwd);
  }

  /**
   * Safe Git branches query
   */
  public async getGitBranches(cwd?: string, userId: string = 'default_user'): Promise<GitBranchInfo[]> {
    this.assertReadPermission(userId, 'git_branches');
    return this.gitManager.getBranches(cwd);
  }

  /**
   * Commit changes (requires WRITE on SYSTEM and user confirmation)
   */
  public async commitGit(
    message: string,
    confirmed: boolean = false,
    cwd?: string,
    userId: string = 'default_user'
  ): Promise<{ success: boolean; output: string; requiresConfirmation?: boolean }> {
    const permCheck = this.permissionManager.checkPermission({
      userId,
      resource: ResourceType.SYSTEM,
      action: 'write',
      requiredLevel: PermissionLevel.WRITE,
    });

    if (!permCheck.allowed) {
      throw new Error(`Permission Denied: User "${userId}" lacks WRITE on SYSTEM to create git commits.`);
    }

    return this.gitManager.commit(message, confirmed, cwd);
  }

  /**
   * Inspect package.json
   */
  public getPackageOverview(cwd?: string, userId: string = 'default_user'): PackageJsonOverview {
    this.assertReadPermission(userId, 'package_json');
    return this.dependencyManager.getPackageJson(cwd);
  }

  /**
   * Audit dependencies
   */
  public async auditDependencies(
    cwd?: string,
    userId: string = 'default_user'
  ): Promise<DependencyAuditReport> {
    this.assertReadPermission(userId, 'audit_dependencies');
    return this.dependencyManager.auditDependencies(cwd);
  }

  /**
   * Run build target
   */
  public async runBuild(cwd?: string, userId: string = 'default_user'): Promise<BuildTestRunResult> {
    this.assertExecutePermission(userId, 'run_build');
    return this.buildRunner.runBuild(cwd);
  }

  /**
   * Run typecheck target
   */
  public async runTypecheck(cwd?: string, userId: string = 'default_user'): Promise<BuildTestRunResult> {
    this.assertExecutePermission(userId, 'run_typecheck');
    return this.buildRunner.runTypecheck(cwd);
  }

  /**
   * Run test target
   */
  public async runTests(
    cwd?: string,
    filter?: string,
    userId: string = 'default_user'
  ): Promise<BuildTestRunResult> {
    this.assertExecutePermission(userId, 'run_tests');
    return this.buildRunner.runTests(cwd, filter);
  }

  private assertReadPermission(userId: string, action: string): void {
    const perm1 = this.permissionManager.checkPermission({
      userId,
      resource: ResourceType.SYSTEM,
      action: 'read',
      requiredLevel: PermissionLevel.READ,
    });
    const perm2 = this.permissionManager.checkPermission({
      userId,
      resource: ResourceType.FILES,
      action: 'read',
      requiredLevel: PermissionLevel.READ,
    });

    if (!perm1.allowed && !perm2.allowed) {
      throw new Error(`Permission Denied: User "${userId}" lacks READ permissions for ${action}.`);
    }
  }

  private assertExecutePermission(userId: string, action: string): void {
    const perm = this.permissionManager.checkPermission({
      userId,
      resource: ResourceType.SYSTEM,
      action: 'execute',
      requiredLevel: PermissionLevel.EXECUTE,
    });

    if (!perm.allowed) {
      throw new Error(`Permission Denied: User "${userId}" lacks EXECUTE permissions for ${action}.`);
    }
  }
}
