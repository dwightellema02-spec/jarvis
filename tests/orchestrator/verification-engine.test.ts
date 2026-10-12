import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { VerificationEngine } from '../../src/orchestrator/verification-engine.js';

describe('Phase 2 Verification Engine Tests (No Fake "Done")', () => {
  const engine = new VerificationEngine();
  const testDir = path.resolve(process.cwd(), 'tests', 'fixtures');
  const testFile = path.join(testDir, 'verify_sample.txt');

  beforeEach(() => {
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
  });

  afterEach(() => {
    if (fs.existsSync(testFile)) {
      fs.unlinkSync(testFile);
    }
  });

  it('verifies existing file with expected content successfully', () => {
    fs.writeFileSync(testFile, 'Verified JARVIS execution token: 987654');

    const result = engine.verifyFileOperation({
      filePath: testFile,
      expectedSubstrings: ['Verified JARVIS', 'token: 987654'],
      minimumSizeBytes: 10,
    });

    expect(result.verified).toBe(true);
    expect(result.checkType).toBe('file_exists');
    expect(result.evidence).toContain('exists');
  });

  it('rejects verification if file does not actually exist on disk', () => {
    const nonExistent = path.join(testDir, 'does_not_exist.txt');

    const result = engine.verifyFileOperation({
      filePath: nonExistent,
    });

    expect(result.verified).toBe(false);
    expect(result.evidence).toContain('was not found in filesystem');
  });

  it('rejects verification if file content does not match expected substrings', () => {
    fs.writeFileSync(testFile, 'Incorrect content here');

    const result = engine.verifyFileOperation({
      filePath: testFile,
      expectedSubstrings: ['MANDATORY_PAYLOAD_STRING'],
    });

    expect(result.verified).toBe(false);
    expect(result.checkType).toBe('content_match');
    expect(result.evidence).toContain('missing expected snippet');
  });

  it('verifies command exit code 0 and catches command errors', () => {
    const successResult = engine.verifyCommandExecution({
      exitCode: 0,
      stdout: 'All 10 tests passed',
      stderr: '',
    });
    expect(successResult.verified).toBe(true);

    const failResult = engine.verifyCommandExecution({
      exitCode: 1,
      stdout: '',
      stderr: 'Fatal: command failed with error code 1',
    });
    expect(failResult.verified).toBe(false);
    expect(failResult.evidence).toContain('non-zero exit code: 1');
  });

  it('verifies schema compliance and catches missing mandatory fields', () => {
    const validData = { id: 'step_1', status: 'OK', count: 42 };
    const validCheck = engine.verifySchema({
      data: validData,
      requiredFields: ['id', 'status', 'count'],
    });
    expect(validCheck.verified).toBe(true);

    const invalidCheck = engine.verifySchema({
      data: { id: 'step_1' },
      requiredFields: ['id', 'status', 'count'],
    });
    expect(invalidCheck.verified).toBe(false);
    expect(invalidCheck.evidence).toContain('Missing required field');
  });

  it('verifies mathematical computations with numerical tolerance', () => {
    const pass = engine.verifyComputation(5.00001, 5.0, 0.001);
    expect(pass.verified).toBe(true);

    const fail = engine.verifyComputation(10.5, 5.0, 0.001);
    expect(fail.verified).toBe(false);
    expect(fail.evidence).toContain('Mathematical mismatch');
  });
});
