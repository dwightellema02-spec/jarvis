import fs from 'fs';
import { VerificationResult } from './types.js';
import { logger } from '../utils/logger.js';

export interface FileVerificationSpec {
  filePath: string;
  expectedSubstrings?: string[];
  minimumSizeBytes?: number;
}

export interface CommandVerificationSpec {
  exitCode: number;
  stdout: string;
  stderr: string;
  forbiddenStderrPatterns?: string[];
}

export interface SchemaVerificationSpec {
  data: unknown;
  requiredFields: string[];
}

export class VerificationEngine {
  /**
   * Verifies that a file operation succeeded by inspecting the actual filesystem.
   */
  public verifyFileOperation(spec: FileVerificationSpec): VerificationResult {
    const timestamp = new Date().toISOString();

    if (!fs.existsSync(spec.filePath)) {
      logger.warn(`Verification failed: file '${spec.filePath}' does not exist on disk`);
      return {
        verified: false,
        checkType: 'file_exists',
        evidence: `File '${spec.filePath}' was not found in filesystem.`,
        timestamp,
      };
    }

    try {
      const stats = fs.statSync(spec.filePath);
      if (spec.minimumSizeBytes && stats.size < spec.minimumSizeBytes) {
        return {
          verified: false,
          checkType: 'content_match',
          evidence: `File size (${stats.size} bytes) is below expected minimum (${spec.minimumSizeBytes} bytes).`,
          timestamp,
        };
      }

      if (spec.expectedSubstrings && spec.expectedSubstrings.length > 0) {
        const content = fs.readFileSync(spec.filePath, 'utf-8');
        for (const substring of spec.expectedSubstrings) {
          if (!content.includes(substring)) {
            return {
              verified: false,
              checkType: 'content_match',
              evidence: `File content missing expected snippet: '${substring.substring(0, 40)}...'`,
              timestamp,
            };
          }
        }
      }

      return {
        verified: true,
        checkType: 'file_exists',
        evidence: `Verified file '${spec.filePath}' exists (${stats.size} bytes) with expected content.`,
        timestamp,
      };
    } catch (err: any) {
      return {
        verified: false,
        checkType: 'file_exists',
        evidence: `Filesystem read error during verification: ${err.message}`,
        timestamp,
      };
    }
  }

  /**
   * Verifies that a command execution exited with zero and no fatal errors.
   */
  public verifyCommandExecution(spec: CommandVerificationSpec): VerificationResult {
    const timestamp = new Date().toISOString();

    if (spec.exitCode !== 0) {
      return {
        verified: false,
        checkType: 'exit_code_zero',
        evidence: `Command terminated with non-zero exit code: ${spec.exitCode}. Error output: ${spec.stderr.slice(0, 150)}`,
        timestamp,
      };
    }

    if (spec.forbiddenStderrPatterns) {
      for (const pattern of spec.forbiddenStderrPatterns) {
        if (spec.stderr.includes(pattern)) {
          return {
            verified: false,
            checkType: 'exit_code_zero',
            evidence: `Command emitted forbidden error pattern in stderr: '${pattern}'`,
            timestamp,
          };
        }
      }
    }

    return {
      verified: true,
      checkType: 'exit_code_zero',
      evidence: `Command execution verified with exit code 0.`,
      timestamp,
    };
  }

  /**
   * Verifies that structured output adheres to mandatory fields.
   */
  public verifySchema(spec: SchemaVerificationSpec): VerificationResult {
    const timestamp = new Date().toISOString();

    if (!spec.data || typeof spec.data !== 'object') {
      return {
        verified: false,
        checkType: 'schema_valid',
        evidence: 'Output is null or not a valid object.',
        timestamp,
      };
    }

    const obj = spec.data as Record<string, unknown>;
    for (const field of spec.requiredFields) {
      if (obj[field] === undefined || obj[field] === null) {
        return {
          verified: false,
          checkType: 'schema_valid',
          evidence: `Missing required field: '${field}' in result payload.`,
          timestamp,
        };
      }
    }

    return {
      verified: true,
      checkType: 'schema_valid',
      evidence: `All required fields [${spec.requiredFields.join(', ')}] present and populated.`,
      timestamp,
    };
  }

  /**
   * Verifies numerical or mathematical output assertions.
   */
  public verifyComputation(actual: number, expected: number, tolerance = 0.0001): VerificationResult {
    const timestamp = new Date().toISOString();
    const diff = Math.abs(actual - expected);

    if (diff <= tolerance) {
      return {
        verified: true,
        checkType: 'computation_verified',
        evidence: `Computation verified: ${actual} matches expected ${expected} (diff: ${diff}).`,
        timestamp,
      };
    }

    return {
      verified: false,
      checkType: 'computation_verified',
      evidence: `Mathematical mismatch: actual ${actual} does not match expected ${expected}.`,
      timestamp,
    };
  }
}
