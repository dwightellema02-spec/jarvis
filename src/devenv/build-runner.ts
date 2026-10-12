/**
 * JARVIS Phase 11 - Build, Typecheck & Test Runner
 */

import { TerminalExecutor } from './terminal-executor.js';
import { BuildTestRunResult } from './devenv.interface.js';
import { logger } from '../utils/logger.js';

export class BuildRunner {
  private terminalExecutor: TerminalExecutor;

  constructor(terminalExecutor: TerminalExecutor) {
    this.terminalExecutor = terminalExecutor;
  }

  /**
   * Run production build
   */
  public async runBuild(cwd?: string): Promise<BuildTestRunResult> {
    const cmd = 'npm run build';
    const res = await this.terminalExecutor.executeCommand({
      command: cmd,
      cwd,
      timeoutMs: 60000,
    });

    const success = res.exitCode === 0;
    const output = (res.stdout + '\n' + res.stderr).trim();
    const summary = success
      ? `Build completed successfully in ${(res.durationMs / 1000).toFixed(2)}s.`
      : `Build failed with exit code ${res.exitCode}: ${res.stderr.slice(0, 300) || res.stdout.slice(0, 300)}`;

    logger.info(`BuildRunner: ${summary}`);

    return {
      target: 'build',
      command: cmd,
      success,
      durationMs: res.durationMs,
      outputPreview: output.slice(0, 2000),
      summary,
      rawStdout: res.stdout,
      rawStderr: res.stderr,
    };
  }

  /**
   * Run TypeScript compiler typecheck
   */
  public async runTypecheck(cwd?: string): Promise<BuildTestRunResult> {
    const cmd = 'npm run typecheck';
    const res = await this.terminalExecutor.executeCommand({
      command: cmd,
      cwd,
      timeoutMs: 40000,
    });

    const success = res.exitCode === 0;
    const output = (res.stdout + '\n' + res.stderr).trim();
    const summary = success
      ? `Typecheck passed! Zero TypeScript errors detected in ${(res.durationMs / 1000).toFixed(2)}s.`
      : `Typecheck failed with exit code ${res.exitCode}. Errors detected.`;

    logger.info(`BuildRunner: ${summary}`);

    return {
      target: 'typecheck',
      command: cmd,
      success,
      durationMs: res.durationMs,
      outputPreview: output.slice(0, 2000),
      summary,
      rawStdout: res.stdout,
      rawStderr: res.stderr,
    };
  }

  /**
   * Run test suite
   */
  public async runTests(cwd?: string, filter?: string): Promise<BuildTestRunResult> {
    const cmd = filter ? `npx vitest run ${filter}` : 'npm test';
    const res = await this.terminalExecutor.executeCommand({
      command: cmd,
      cwd,
      timeoutMs: 90000,
    });

    const success = res.exitCode === 0;
    const output = (res.stdout + '\n' + res.stderr).trim();

    // Parse test counts if available
    const passedMatch = output.match(/(\d+)\s+passed/i);
    const failedMatch = output.match(/(\d+)\s+failed/i);

    let summary = '';
    if (success) {
      summary = `Test suite passed! ${passedMatch ? passedMatch[1] + ' tests passed' : 'All tests passed'} in ${(res.durationMs / 1000).toFixed(2)}s.`;
    } else {
      summary = `Tests failed: ${failedMatch ? failedMatch[1] + ' failed' : 'Non-zero exit code ' + res.exitCode}.`;
    }

    logger.info(`BuildRunner: ${summary}`);

    return {
      target: 'test',
      command: cmd,
      success,
      durationMs: res.durationMs,
      outputPreview: output.slice(0, 2000),
      summary,
      rawStdout: res.stdout,
      rawStderr: res.stderr,
    };
  }
}
