/**
 * JARVIS Phase 11 - Safe Git Integration Manager
 */

import { TerminalExecutor } from './terminal-executor.js';
import {
  GitBranchInfo,
  GitFileStatus,
  GitLogEntry,
  GitStatusResult,
} from './devenv.interface.js';
import { logger } from '../utils/logger.js';

export class GitManager {
  private terminalExecutor: TerminalExecutor;

  constructor(terminalExecutor: TerminalExecutor) {
    this.terminalExecutor = terminalExecutor;
  }

  /**
   * Parse git status --porcelain -b output
   */
  public async getStatus(cwd?: string): Promise<GitStatusResult> {
    const res = await this.terminalExecutor.executeCommand({
      command: 'git status --porcelain -b',
      cwd,
    });

    if (res.exitCode !== 0) {
      return {
        isGitRepo: false,
        currentBranch: 'none',
        isClean: true,
        ahead: 0,
        behind: 0,
        files: [],
        summary: { stagedCount: 0, unstagedCount: 0, untrackedCount: 0 },
      };
    }

    const lines = res.stdout.split('\n').filter((l) => l.trim().length > 0);
    let currentBranch = 'unknown';
    let trackingBranch: string | undefined;
    let ahead = 0;
    let behind = 0;
    const files: GitFileStatus[] = [];

    let stagedCount = 0;
    let unstagedCount = 0;
    let untrackedCount = 0;

    for (const line of lines) {
      if (line.startsWith('## ')) {
        // Branch header line: ## master...origin/master [ahead 1, behind 2]
        const branchPart = line.substring(3).trim();
        const mainBranchMatch = branchPart.match(/^([^.\s]+)(?:\.\.\.([^\s[]+))?(?:\s+\[(?:ahead\s+(\d+))?(?:,\s*)?(?:behind\s+(\d+))?\])?/);
        if (mainBranchMatch) {
          currentBranch = mainBranchMatch[1] || 'unknown';
          trackingBranch = mainBranchMatch[2];
          ahead = mainBranchMatch[3] ? parseInt(mainBranchMatch[3], 10) : 0;
          behind = mainBranchMatch[4] ? parseInt(mainBranchMatch[4], 10) : 0;
        } else {
          currentBranch = branchPart.split('...')[0] || 'unknown';
        }
        continue;
      }

      if (line.length >= 3) {
        const x = line[0];
        const y = line[1];
        const filePath = line.substring(3).trim();

        if (x === '?' && y === '?') {
          untrackedCount++;
          files.push({ path: filePath, status: 'untracked', staged: false });
        } else {
          if (x !== ' ' && x !== '?') {
            stagedCount++;
            files.push({
              path: filePath,
              status: x === 'A' ? 'added' : x === 'D' ? 'deleted' : x === 'R' ? 'renamed' : 'modified',
              staged: true,
            });
          }
          if (y !== ' ' && y !== '?') {
            unstagedCount++;
            files.push({
              path: filePath,
              status: y === 'D' ? 'deleted' : 'modified',
              staged: false,
            });
          }
        }
      }
    }

    return {
      isGitRepo: true,
      currentBranch,
      trackingBranch,
      isClean: files.length === 0,
      ahead,
      behind,
      files,
      summary: { stagedCount, unstagedCount, untrackedCount },
    };
  }

  /**
   * Retrieve diff of staged or working tree
   */
  public async getDiff(staged: boolean = false, cwd?: string): Promise<string> {
    const cmd = staged ? 'git diff --cached' : 'git diff';
    const res = await this.terminalExecutor.executeCommand({ command: cmd, cwd });
    return res.stdout || res.stderr || 'No differences.';
  }

  /**
   * Retrieve structured commit history
   */
  public async getLog(limit: number = 10, cwd?: string): Promise<GitLogEntry[]> {
    const format = '%H|%h|%an|%ad|%s';
    const cmd = `git log -n ${Math.min(limit, 50)} --date=iso --pretty=format:"${format}"`;
    const res = await this.terminalExecutor.executeCommand({ command: cmd, cwd });

    if (res.exitCode !== 0 || !res.stdout) {
      return [];
    }

    const entries: GitLogEntry[] = [];
    const lines = res.stdout.split('\n');

    for (const rawLine of lines) {
      const line = rawLine.trim().replace(/^"/, '').replace(/"$/, '');
      if (!line) continue;
      const parts = line.split('|');
      if (parts.length >= 5) {
        entries.push({
          hash: parts[0],
          shortHash: parts[1],
          author: parts[2],
          date: parts[3],
          message: parts.slice(4).join('|'),
        });
      }
    }

    return entries;
  }

  /**
   * List local git branches
   */
  public async getBranches(cwd?: string): Promise<GitBranchInfo[]> {
    const res = await this.terminalExecutor.executeCommand({ command: 'git branch -v', cwd });
    if (res.exitCode !== 0 || !res.stdout) {
      return [];
    }

    const branches: GitBranchInfo[] = [];
    const lines = res.stdout.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      const isCurrent = line.startsWith('*');
      const parts = trimmed.replace(/^\*\s*/, '').split(/\s+/);
      const name = parts[0];
      const commitHash = parts[1] || '';

      if (name) {
        branches.push({ name, isCurrent, commitHash });
      }
    }

    return branches;
  }

  /**
   * Stage and commit changes with message
   */
  public async commit(
    message: string,
    confirmed: boolean = false,
    cwd?: string
  ): Promise<{ success: boolean; output: string; requiresConfirmation?: boolean }> {
    if (!message || !message.trim()) {
      return { success: false, output: 'Commit message is required.' };
    }

    if (!confirmed) {
      return {
        success: false,
        output: `Action required: Committing changes with message "${message}" is categorized as HIGH risk. User confirmation is required.`,
        requiresConfirmation: true,
      };
    }

    // Escape double quotes in message
    const sanitizedMsg = message.replace(/"/g, '\\"');
    const res = await this.terminalExecutor.executeCommand(
      {
        command: `git commit -m "${sanitizedMsg}"`,
        cwd,
        confirmed: true,
      },
      true
    );

    logger.info(`Git commit executed: "${message}" -> Exit code: ${res.exitCode}`);
    return {
      success: res.exitCode === 0,
      output: res.stdout || res.stderr,
    };
  }
}
