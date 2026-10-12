/**
 * JARVIS Phase 11 - Development Environment Integration Interfaces
 */

export type CommandSafetyRisk = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface CommandSafetyAnalysis {
  command: string;
  binary: string;
  args: string[];
  risk: CommandSafetyRisk;
  isAllowed: boolean;
  requiresConfirmation: boolean;
  blockedReason?: string;
}

export interface TerminalCommandRequest {
  command: string;
  cwd?: string;
  confirmed?: boolean;
  timeoutMs?: number;
}

export interface TerminalCommandResult {
  command: string;
  cwd: string;
  exitCode: number | null;
  stdout: string;
  stderr: string;
  durationMs: number;
  risk: CommandSafetyRisk;
  blocked: boolean;
  blockedReason?: string;
}

export interface GitFileStatus {
  path: string;
  status: 'modified' | 'added' | 'deleted' | 'untracked' | 'renamed' | 'copied';
  staged: boolean;
}

export interface GitStatusResult {
  isGitRepo: boolean;
  currentBranch: string;
  trackingBranch?: string;
  isClean: boolean;
  ahead: number;
  behind: number;
  files: GitFileStatus[];
  summary: {
    stagedCount: number;
    unstagedCount: number;
    untrackedCount: number;
  };
}

export interface GitLogEntry {
  hash: string;
  shortHash: string;
  author: string;
  date: string;
  message: string;
}

export interface GitBranchInfo {
  name: string;
  isCurrent: boolean;
  commitHash: string;
}

export interface PackageDependencyInfo {
  name: string;
  version: string;
  isDev: boolean;
}

export interface PackageJsonOverview {
  name: string;
  version: string;
  description?: string;
  scripts: Record<string, string>;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  totalDependencies: number;
  totalDevDependencies: number;
}

export interface DependencyAuditVulnerability {
  name: string;
  severity: 'info' | 'low' | 'moderate' | 'high' | 'critical';
  via: string | string[];
  range: string;
}

export interface DependencyAuditReport {
  vulnerabilitiesFound: number;
  severityCounts: {
    low: number;
    moderate: number;
    high: number;
    critical: number;
  };
  details: DependencyAuditVulnerability[];
  advisorySummary: string;
}

export interface BuildTestRunResult {
  target: 'build' | 'typecheck' | 'test';
  command: string;
  success: boolean;
  durationMs: number;
  outputPreview: string;
  summary: string;
  rawStdout: string;
  rawStderr: string;
}
