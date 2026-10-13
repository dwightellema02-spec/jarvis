import fs from 'fs';
import crypto from 'crypto';
import {
  EvidenceItem,
  VerificationCheckSpec,
  VerificationCheckType,
} from './verification.interface.js';
import { logger } from '../utils/logger.js';

export class EvidenceCollector {
  /**
   * Executes a single verification check spec against live runtime state
   * and returns an EvidenceItem with full observation details.
   */
  public collectEvidence(check: VerificationCheckSpec, runtimePayload?: any): EvidenceItem {
    const timestamp = new Date().toISOString();
    const target = check.target || (check.options?.filePath as string) || 'runtime_payload';

    try {
      switch (check.type) {
        case 'file_exists':
          return this.checkFileExists(target, timestamp);

        case 'file_size':
          return this.checkFileSize(target, check.expected as number, timestamp);

        case 'file_content':
          return this.checkFileContent(
            target,
            check.expected as string | string[],
            timestamp
          );

        case 'file_hash':
          return this.checkFileHash(target, check.expected as string, timestamp);

        case 'exit_code_zero':
          return this.checkExitCode(runtimePayload, check.expected as number, timestamp);

        case 'stdout_match':
          return this.checkStdout(runtimePayload, check.expected as string, timestamp);

        case 'stderr_clean':
          return this.checkStderr(runtimePayload, check.expected as string[], timestamp);

        case 'schema_valid':
          return this.checkSchema(
            runtimePayload,
            (check.expected as string[]) || (check.options?.requiredFields as string[]) || [],
            timestamp
          );

        case 'type_integrity':
          return this.checkTypeIntegrity(
            runtimePayload,
            check.options?.fieldTypes as Record<string, string>,
            timestamp
          );

        case 'range_bounds':
          return this.checkRangeBounds(
            runtimePayload,
            check.options as { field: string; min?: number; max?: number },
            timestamp
          );

        case 'computation_verified':
        case 'tolerance_diff':
          return this.checkComputation(
            runtimePayload,
            check.expected as number,
            (check.options?.tolerance as number) ?? 0.0001,
            timestamp
          );

        case 'code_syntax_valid':
          return this.checkCodeSyntax(runtimePayload, target, timestamp);

        default:
          return {
            checkType: check.type,
            target,
            expected: check.expected,
            actual: runtimePayload,
            passed: Boolean(runtimePayload),
            message: `Evaluated generic check ${check.type}`,
            timestamp,
          };
      }
    } catch (err: any) {
      return {
        checkType: check.type,
        target,
        expected: check.expected,
        actual: `Exception: ${err.message}`,
        passed: false,
        message: `Check execution faulted: ${err.message}`,
        timestamp,
      };
    }
  }

  // --- Specific Evidence Collectors ---

  private checkFileExists(filePath: string, timestamp: string): EvidenceItem {
    const exists = fs.existsSync(filePath);
    return {
      checkType: 'file_exists',
      target: filePath,
      expected: true,
      actual: exists,
      passed: exists,
      message: exists
        ? `Verified: File exists at path "${filePath}"`
        : `Failed: File does not exist at path "${filePath}"`,
      timestamp,
    };
  }

  private checkFileSize(filePath: string, minBytes: number, timestamp: string): EvidenceItem {
    if (!fs.existsSync(filePath)) {
      return {
        checkType: 'file_size',
        target: filePath,
        expected: `>= ${minBytes} bytes`,
        actual: 0,
        passed: false,
        message: `File does not exist: "${filePath}"`,
        timestamp,
      };
    }
    const stat = fs.statSync(filePath);
    const passed = stat.size >= (minBytes || 1);
    return {
      checkType: 'file_size',
      target: filePath,
      expected: `>= ${minBytes} bytes`,
      actual: `${stat.size} bytes`,
      passed,
      message: passed
        ? `Verified: File size ${stat.size} bytes satisfies threshold ${minBytes} bytes.`
        : `Failed: File size ${stat.size} bytes is below expected ${minBytes} bytes.`,
      timestamp,
    };
  }

  private checkFileContent(
    filePath: string,
    expectedPatterns: string | string[],
    timestamp: string
  ): EvidenceItem {
    if (!fs.existsSync(filePath)) {
      return {
        checkType: 'file_content',
        target: filePath,
        expected: expectedPatterns,
        actual: null,
        passed: false,
        message: `File does not exist: "${filePath}"`,
        timestamp,
      };
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    const patterns = Array.isArray(expectedPatterns) ? expectedPatterns : [expectedPatterns];
    const missing = patterns.filter((p) => !content.includes(p));
    const passed = missing.length === 0;

    return {
      checkType: 'file_content',
      target: filePath,
      expected: patterns,
      actual: passed ? 'All patterns present' : `Missing: ${missing.join(', ')}`,
      passed,
      message: passed
        ? `Verified: File contains all ${patterns.length} expected content patterns.`
        : `Failed: Missing expected content: [${missing.join(', ')}]`,
      timestamp,
    };
  }

  private checkFileHash(filePath: string, expectedHash: string, timestamp: string): EvidenceItem {
    if (!fs.existsSync(filePath)) {
      return {
        checkType: 'file_hash',
        target: filePath,
        expected: expectedHash,
        actual: null,
        passed: false,
        message: `File does not exist: "${filePath}"`,
        timestamp,
      };
    }
    const buffer = fs.readFileSync(filePath);
    const hash = crypto.createHash('sha256').update(buffer).digest('hex');
    const passed = expectedHash ? hash.toLowerCase() === expectedHash.toLowerCase() : true;

    return {
      checkType: 'file_hash',
      target: filePath,
      expected: expectedHash || 'computed_hash',
      actual: hash,
      passed,
      message: passed
        ? `Verified: File SHA-256 matches: ${hash.slice(0, 16)}...`
        : `Failed: File hash ${hash.slice(0, 16)} does not match expected ${expectedHash.slice(0, 16)}`,
      timestamp,
    };
  }

  private checkExitCode(payload: any, expectedCode: number = 0, timestamp: string): EvidenceItem {
    const actualCode = payload?.exitCode ?? payload?.status ?? (payload === 0 ? 0 : -1);
    const passed = actualCode === (expectedCode ?? 0);
    return {
      checkType: 'exit_code_zero',
      target: 'process.exitCode',
      expected: expectedCode ?? 0,
      actual: actualCode,
      passed,
      message: passed
        ? `Verified: Process completed with exit code ${actualCode}`
        : `Failed: Non-zero exit code detected: ${actualCode}`,
      timestamp,
    };
  }

  private checkStdout(payload: any, pattern: string, timestamp: string): EvidenceItem {
    const stdout = String(payload?.stdout ?? payload ?? '');
    const passed = stdout.includes(pattern);
    return {
      checkType: 'stdout_match',
      target: 'process.stdout',
      expected: pattern,
      actual: stdout.slice(0, 200),
      passed,
      message: passed
        ? `Verified: stdout matched expected pattern: "${pattern}"`
        : `Failed: stdout missing expected pattern: "${pattern}"`,
      timestamp,
    };
  }

  private checkStderr(payload: any, forbiddenPatterns: string[] = [], timestamp: string): EvidenceItem {
    const stderr = String(payload?.stderr ?? '');
    const patterns = forbiddenPatterns.length > 0 ? forbiddenPatterns : ['FATAL', 'PANIC', 'ERR_UNCAUGHT'];
    const matches = patterns.filter((p) => stderr.toLowerCase().includes(p.toLowerCase()));
    const passed = matches.length === 0;

    return {
      checkType: 'stderr_clean',
      target: 'process.stderr',
      expected: 'No fatal error patterns in stderr',
      actual: passed ? 'CLEAN' : `Found forbidden: ${matches.join(', ')}`,
      passed,
      message: passed
        ? `Verified: stderr is clean without fatal error markers.`
        : `Failed: stderr contains fatal patterns: [${matches.join(', ')}]`,
      timestamp,
    };
  }

  private checkSchema(payload: any, requiredFields: string[], timestamp: string): EvidenceItem {
    if (!payload || typeof payload !== 'object') {
      return {
        checkType: 'schema_valid',
        target: 'payload',
        expected: requiredFields,
        actual: typeof payload,
        passed: false,
        message: 'Payload is null or non-object.',
        timestamp,
      };
    }
    const missing = requiredFields.filter((f) => payload[f] === undefined || payload[f] === null);
    const passed = missing.length === 0;

    return {
      checkType: 'schema_valid',
      target: 'payload.schema',
      expected: requiredFields,
      actual: passed ? 'All fields present' : `Missing: ${missing.join(', ')}`,
      passed,
      message: passed
        ? `Verified: Schema contains all required fields [${requiredFields.join(', ')}].`
        : `Failed: Missing required schema fields: [${missing.join(', ')}]`,
      timestamp,
    };
  }

  private checkTypeIntegrity(
    payload: any,
    fieldTypes: Record<string, string> = {},
    timestamp: string
  ): EvidenceItem {
    if (!payload || typeof payload !== 'object') {
      return {
        checkType: 'type_integrity',
        target: 'payload.types',
        expected: fieldTypes,
        actual: null,
        passed: false,
        message: 'Payload is not an object.',
        timestamp,
      };
    }
    const mismatches: string[] = [];
    for (const [field, expectedType] of Object.entries(fieldTypes)) {
      const val = payload[field];
      const actualType = Array.isArray(val) ? 'array' : typeof val;
      if (actualType !== expectedType) {
        mismatches.push(`${field}: expected ${expectedType}, got ${actualType}`);
      }
    }
    const passed = mismatches.length === 0;

    return {
      checkType: 'type_integrity',
      target: 'payload.types',
      expected: fieldTypes,
      actual: passed ? 'Types match' : mismatches.join('; '),
      passed,
      message: passed
        ? 'Verified: All field types match specification.'
        : `Failed: Type integrity mismatches: ${mismatches.join('; ')}`,
      timestamp,
    };
  }

  private checkRangeBounds(
    payload: any,
    options: { field: string; min?: number; max?: number } = { field: 'value' },
    timestamp: string
  ): EvidenceItem {
    const val = Number(payload?.[options.field] ?? payload);
    const minPass = options.min !== undefined ? val >= options.min : true;
    const maxPass = options.max !== undefined ? val <= options.max : true;
    const passed = !isNaN(val) && minPass && maxPass;

    return {
      checkType: 'range_bounds',
      target: options.field,
      expected: `[${options.min ?? '-∞'}, ${options.max ?? '+∞'}]`,
      actual: isNaN(val) ? 'NaN' : val,
      passed,
      message: passed
        ? `Verified: Field "${options.field}" value ${val} is within bounds.`
        : `Failed: Value ${val} out of bounds [${options.min ?? '-∞'}, ${options.max ?? '+∞'}].`,
      timestamp,
    };
  }

  private checkComputation(
    payload: any,
    expected: number,
    tolerance: number,
    timestamp: string
  ): EvidenceItem {
    const actual = typeof payload === 'number' ? payload : Number(payload?.result ?? payload?.value ?? 0);
    const diff = Math.abs(actual - expected);
    const passed = !isNaN(actual) && diff <= tolerance;

    return {
      checkType: 'computation_verified',
      target: 'computation.value',
      expected,
      actual,
      passed,
      message: passed
        ? `Verified: Computation matches expected value ${expected} within tolerance ${tolerance} (diff: ${diff.toFixed(6)}).`
        : `Failed: Computation value ${actual} diverges from expected ${expected} (diff: ${diff.toFixed(6)} > ${tolerance}).`,
      timestamp,
    };
  }

  private checkCodeSyntax(payload: any, target: string, timestamp: string): EvidenceItem {
    const code = typeof payload === 'string' ? payload : String(payload?.code ?? payload?.content ?? '');
    try {
      // Basic JavaScript syntax check via Function constructor validation
      new Function(code);
      return {
        checkType: 'code_syntax_valid',
        target,
        expected: 'Valid JS/TS Syntax',
        actual: 'PARSE_OK',
        passed: true,
        message: 'Verified: Code syntax parsed successfully without grammatical errors.',
        timestamp,
      };
    } catch (err: any) {
      return {
        checkType: 'code_syntax_valid',
        target,
        expected: 'Valid JS/TS Syntax',
        actual: err.message,
        passed: false,
        message: `Failed: Syntax validation error: ${err.message}`,
        timestamp,
      };
    }
  }

  /**
   * Generates a cryptographic SHA-256 fingerprint for a collection of evidence items.
   */
  public generateFingerprint(evidenceList: EvidenceItem[], actionName: string): string {
    const serialized = JSON.stringify({
      actionName,
      items: evidenceList.map((e) => ({
        type: e.checkType,
        target: e.target,
        passed: e.passed,
        actual: e.actual,
        ts: e.timestamp,
      })),
    });
    return crypto.createHash('sha256').update(serialized).digest('hex');
  }
}
