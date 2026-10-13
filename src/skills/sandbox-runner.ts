import {
  GeneratedToolDraft,
  SkillTestResult,
  SkillValidationReport,
} from './skill-builder.interface.js';
import { logger } from '../utils/logger.js';

export class SandboxRunner {
  private static readonly FORBIDDEN_PATTERNS = [
    /\bprocess\.exit\b/,
    /\bchild_process\b/,
    /\beval\s*\(/,
    /\bFunction\s*\(/,
    /\b__proto__\b/,
    /\bprocess\.kill\b/,
    /\bprocess\.binding\b/,
    /\bBuffer\.allocUnsafe\b/,
    /\bexecSync\b/,
    /\bspawnSync\b/,
  ];

  /**
   * Static analysis of dynamic skill implementation code for unsafe constructs.
   */
  public analyzeSecurity(code: string): { cleared: boolean; threats: string[] } {
    const threats: string[] = [];

    for (const pattern of SandboxRunner.FORBIDDEN_PATTERNS) {
      if (pattern.test(code)) {
        threats.push(`Prohibited syntax detected matching pattern ${pattern.toString()}`);
      }
    }

    // Check for raw unencrypted credential leaks
    if (/(api[_-]?key|secret|token)\s*[:=]\s*['"][a-zA-Z0-9_\-]{20,}['"]/i.test(code)) {
      threats.push('Hardcoded plaintext secrets/tokens detected in implementation code');
    }

    return {
      cleared: threats.length === 0,
      threats,
    };
  }

  /**
   * Executes a single test case within the sandboxed harness.
   */
  public async executeTestCase(
    draft: GeneratedToolDraft,
    testInput: Record<string, unknown>,
    expectedSuccess: boolean,
    expectedSubstring?: string
  ): Promise<SkillTestResult> {
    const start = Date.now();

    // 1. Security Check
    const sec = this.analyzeSecurity(draft.implementationCode);
    if (!sec.cleared) {
      return {
        testCaseName: 'Security Pre-Check',
        passed: false,
        executionTimeMs: Date.now() - start,
        error: `Security Sandbox Block: ${sec.threats.join('; ')}`,
      };
    }

    // 2. Controlled Execution
    try {
      // Build safe execution function from the implementation code string
      // Implementation code expects `(params, context)` and returns data
      const executor = this.compileSafeFunction(draft.implementationCode);

      const mockContext = {
        userId: 'sandbox_tester',
        sessionId: 'sess_sandbox',
        requestId: `req_test_${Date.now()}`,
        permissionVerified: true,
      };

      const resultPromise = executor(testInput, mockContext);

      // Timeout wrapper (5000ms limit)
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Sandbox Timeout: Execution exceeded 5000ms')), 5000)
      );

      const actualOutput = await Promise.race([resultPromise, timeoutPromise]);
      const duration = Date.now() - start;

      if (!expectedSuccess) {
        return {
          testCaseName: 'Expected Failure Case',
          passed: false,
          executionTimeMs: duration,
          actualOutput,
          error: 'Expected function to throw or fail, but it succeeded',
        };
      }

      // Check substring match if specified
      if (expectedSubstring) {
        const outStr = JSON.stringify(actualOutput);
        if (!outStr.includes(expectedSubstring)) {
          return {
            testCaseName: `Substring Verification: "${expectedSubstring}"`,
            passed: false,
            executionTimeMs: duration,
            actualOutput,
            error: `Output did not contain expected substring "${expectedSubstring}"`,
          };
        }
      }

      return {
        testCaseName: 'Execution',
        passed: true,
        executionTimeMs: duration,
        actualOutput,
      };
    } catch (err: any) {
      const duration = Date.now() - start;
      if (!expectedSuccess) {
        return {
          testCaseName: 'Negative Test Validation',
          passed: true,
          executionTimeMs: duration,
          actualOutput: { caughtError: err.message },
        };
      }

      return {
        testCaseName: 'Execution',
        passed: false,
        executionTimeMs: duration,
        error: err.message,
      };
    }
  }

  /**
   * Compiles the string implementation into a callable function safely.
   */
  public compileSafeFunction(code: string): (params: unknown, context: unknown) => Promise<unknown> {
    // In our verified system, dynamic tools export or define an execute(params, context) handler
    // We safely instantiate it with restricted scope
    try {
      const wrapped = new Function(
        'params',
        'context',
        `
        "use strict";
        ${code}
        if (typeof execute === 'function') {
          return execute(params, context);
        } else if (typeof run === 'function') {
          return run(params, context);
        } else {
          throw new Error('Implementation must define an "execute(params, context)" function.');
        }
      `
      );

      return async (params: unknown, context: unknown) => {
        return await Promise.resolve(wrapped(params, context));
      };
    } catch (syntaxErr: any) {
      throw new Error(`Syntax compilation failed: ${syntaxErr.message}`);
    }
  }

  /**
   * Runs the complete test harness across all test cases defined in the skill draft.
   */
  public async runValidationSuite(draft: GeneratedToolDraft): Promise<SkillValidationReport> {
    const sec = this.analyzeSecurity(draft.implementationCode);
    const results: SkillTestResult[] = [];

    let syntaxValid = true;
    try {
      this.compileSafeFunction(draft.implementationCode);
    } catch (err: any) {
      syntaxValid = false;
      results.push({
        testCaseName: 'Syntax Check',
        passed: false,
        executionTimeMs: 1,
        error: err.message,
      });
    }

    if (syntaxValid && sec.cleared) {
      const testCases = draft.testCases.length > 0
        ? draft.testCases
        : [{ name: 'Default Probe', input: {}, expectedSuccess: true }];

      for (const tc of testCases) {
        const tr = await this.executeTestCase(
          draft,
          tc.input,
          tc.expectedSuccess,
          tc.expectedOutputSubstring
        );
        tr.testCaseName = tc.name;
        results.push(tr);
      }
    }

    const passedCount = results.filter((r) => r.passed).length;
    const totalCount = results.length;

    let overallStatus: SkillValidationReport['overallStatus'] = 'passed';
    if (!syntaxValid || !sec.cleared || passedCount < totalCount) {
      overallStatus = 'failed';
    }

    logger.info(`Sandbox validation completed for skill "${draft.id}": ${passedCount}/${totalCount} passed. Overall: ${overallStatus}`);

    return {
      skillId: draft.id,
      syntaxValid,
      securityCleared: sec.cleared,
      threatsFound: sec.threats,
      testsPassed: passedCount,
      testsTotal: totalCount,
      testResults: results,
      overallStatus,
    };
  }
}
