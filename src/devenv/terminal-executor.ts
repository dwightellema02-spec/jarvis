/**
 * JARVIS Phase 11 - Safe Terminal Command Executor
 * 
 * Capability does not equal permission.
 * Commands are parsed, categorized by risk, checked against Guardian blocklists,
 * and gated before execution.
 */

import { exec } from 'child_process';
import * as path from 'path';
import {
  CommandSafetyAnalysis,
  CommandSafetyRisk,
  TerminalCommandRequest,
  TerminalCommandResult,
} from './devenv.interface.js';
import { logger } from '../utils/logger.js';

export class TerminalExecutor {
  private allowedRootDir: string;

  constructor(allowedRootDir?: string) {
    this.allowedRootDir = path.resolve(allowedRootDir || process.cwd());
  }

  /**
   * Analyze command risk level and determine if it requires confirmation or is blocked.
   */
  public analyzeCommand(rawCommand: string): CommandSafetyAnalysis {
    const trimmed = rawCommand.trim();
    if (!trimmed) {
      return {
        command: rawCommand,
        binary: '',
        args: [],
        risk: 'LOW',
        isAllowed: false,
        requiresConfirmation: false,
        blockedReason: 'Empty command string',
      };
    }

    const tokens = trimmed.split(/\s+/);
    const binary = tokens[0].toLowerCase();
    const args = tokens.slice(1);
    const lowerCmd = trimmed.toLowerCase();

    // 1. CRITICAL Risk Blocklist: categorical deny
    const criticalPatterns = [
      /\brm\s+(-[a-z]*r[a-z]*f|-[a-z]*f[a-z]*r|\/s)\b/i,
      /\bdel\s+\/[a-z0-9\s]*[sq]/i,
      /\bformat\s+[a-z]:/i,
      /\bmkfs\b/i,
      /\bdd\s+if=/i,
      /:\(\)\s*\{\s*:\|:&\s*\};:/, // Fork bomb
      /\b(curl|wget)\b[^\n|]+\|\s*(sh|bash|zsh|powershell|cmd)/i,
      /\b(nc|netcat)\b.*-e\b/i,
      /\bshutdown\b/i,
      /\breboot\b/i,
      /\bpoweroff\b/i,
      /\breg\s+delete\b/i,
      /\bdrop\s+database\b/i,
      /\btruncate\s+table\b/i,
    ];

    for (const pattern of criticalPatterns) {
      if (pattern.test(lowerCmd)) {
        return {
          command: trimmed,
          binary,
          args,
          risk: 'CRITICAL',
          isAllowed: false,
          requiresConfirmation: false,
          blockedReason: `Command matches critical destructive pattern: ${pattern.toString()}`,
        };
      }
    }

    // 2. HIGH Risk: requires explicit confirmation
    const highRiskPatterns = [
      /\bnpm\s+(install|i|uninstall|remove|update)\b/i,
      /\byarn\s+(add|remove|upgrade)\b/i,
      /\bpnpm\s+(add|remove|update)\b/i,
      /\bgit\s+(push|reset\s+--hard|checkout\s+-f|clean\s+-[a-z]*f)\b/i,
      /\bgit\s+(merge|rebase)\b/i,
    ];

    for (const pattern of highRiskPatterns) {
      if (pattern.test(lowerCmd)) {
        return {
          command: trimmed,
          binary,
          args,
          risk: 'HIGH',
          isAllowed: true,
          requiresConfirmation: true,
          blockedReason: undefined,
        };
      }
    }

    // 3. MEDIUM Risk: builds, tests, compilation
    const mediumRiskPatterns = [
      /\bnpm\s+run\s+[a-z0-9_-]+/i,
      /\bnpm\s+(test|build)\b/i,
      /\bnpx\s+(tsc|vitest|prettier|eslint)\b/i,
      /\b(tsc|vitest|jest)\b/i,
    ];

    for (const pattern of mediumRiskPatterns) {
      if (pattern.test(lowerCmd)) {
        return {
          command: trimmed,
          binary,
          args,
          risk: 'MEDIUM',
          isAllowed: true,
          requiresConfirmation: false,
        };
      }
    }

    // 4. LOW Risk: read-only inspections
    const lowRiskBinaries = [
      'git',
      'node',
      'npm',
      'npx',
      'echo',
      'dir',
      'ls',
      'pwd',
      'whoami',
      'type',
      'cat',
    ];

    const isLowBinary = lowRiskBinaries.includes(binary);
    return {
      command: trimmed,
      binary,
      args,
      risk: isLowBinary ? 'LOW' : 'MEDIUM',
      isAllowed: true,
      requiresConfirmation: false,
    };
  }

  /**
   * Execute a command safely if allowed and authorized.
   */
  public async executeCommand(
    request: TerminalCommandRequest,
    isGuardianApproved: boolean = true
  ): Promise<TerminalCommandResult> {
    const analysis = this.analyzeCommand(request.command);
    const targetCwd = path.resolve(request.cwd || this.allowedRootDir);

    // Path traversal check
    if (!targetCwd.startsWith(this.allowedRootDir) && targetCwd !== this.allowedRootDir) {
      return {
        command: request.command,
        cwd: targetCwd,
        exitCode: 1,
        stdout: '',
        stderr: `Security Error: Working directory "${targetCwd}" is outside permitted workspace root "${this.allowedRootDir}".`,
        durationMs: 0,
        risk: 'HIGH',
        blocked: true,
        blockedReason: 'Directory path traversal attempt blocked by guardian.',
      };
    }

    // Guardian and analysis block check
    if (!analysis.isAllowed || !isGuardianApproved) {
      return {
        command: request.command,
        cwd: targetCwd,
        exitCode: 1,
        stdout: '',
        stderr: `Blocked: ${analysis.blockedReason || 'Command blocked by security policy'}`,
        durationMs: 0,
        risk: analysis.risk,
        blocked: true,
        blockedReason: analysis.blockedReason || 'Command blocked by security guardian',
      };
    }

    // High risk confirmation check
    if (analysis.requiresConfirmation && !request.confirmed) {
      return {
        command: request.command,
        cwd: targetCwd,
        exitCode: null,
        stdout: '',
        stderr: `Action required: Command is categorized as HIGH risk (${request.command}). Explicit user confirmation is required prior to execution.`,
        durationMs: 0,
        risk: 'HIGH',
        blocked: true,
        blockedReason: 'Requires explicit confirmation for HIGH risk modification',
      };
    }

    const startTime = Date.now();
    const timeout = request.timeoutMs || 20000;

    return new Promise<TerminalCommandResult>((resolve) => {
      exec(
        request.command,
        {
          cwd: targetCwd,
          timeout,
          maxBuffer: 10 * 1024 * 1024, // 10MB buffer
          windowsHide: true,
        },
        (error, stdout, stderr) => {
          const durationMs = Date.now() - startTime;
          const exitCode = error ? (error.code ?? 1) : 0;

          logger.info(`Terminal command executed: "${request.command}" (code: ${exitCode}) in ${durationMs}ms`);

          resolve({
            command: request.command,
            cwd: targetCwd,
            exitCode,
            stdout: stdout.toString(),
            stderr: stderr.toString(),
            durationMs,
            risk: analysis.risk,
            blocked: false,
          });
        }
      );
    });
  }
}
