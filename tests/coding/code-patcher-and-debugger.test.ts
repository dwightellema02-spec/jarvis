import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { CodePatcher } from '../../src/coding/code-patcher.js';
import { ErrorDebugger } from '../../src/coding/error-debugger.js';

describe('Phase 10 - Code Patcher & Error Debugger', () => {
  const patcher = new CodePatcher();
  const errorDebugger = new ErrorDebugger();
  const testDir = path.resolve(__dirname, '../../tests/fixtures/patch_test');
  const testFile = path.join(testDir, 'sample_code.ts');

  beforeEach(() => {
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
    fs.writeFileSync(
      testFile,
      `export function greet(name: string): string {\n  return "Hello, " + name;\n}\n`,
      'utf-8'
    );
  });

  afterEach(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  it('should generate diff proposals with hunks and risk classification', () => {
    const proposal = patcher.proposePatch(
      testFile,
      'return "Hello, " + name;',
      'return `Hello, ${name.trim()}!`;',
      'Improve greeting template'
    );

    expect(proposal.filePath).toBe(testFile);
    expect(proposal.linesAdded).toBe(1);
    expect(proposal.linesRemoved).toBe(1);
    expect(proposal.diffPreview).toContain('- return "Hello, " + name;');
    expect(proposal.diffPreview).toContain('+ return `Hello, ${name.trim()}!`;');
    expect(proposal.riskLevel).toBe('LOW');
    expect(proposal.requiresConfirmation).toBe(false);
  });

  it('should create backup and apply patch atomically with rollback capability', () => {
    const proposal = patcher.proposePatch(
      testFile,
      'return "Hello, " + name;',
      'return `Mabuhay, ${name}!`;'
    );

    const result = patcher.applyPatch(proposal);
    expect(result.success).toBe(true);
    expect(result.verified).toBe(true);
    expect(result.backupPath).toBeDefined();
    expect(fs.existsSync(result.backupPath!)).toBe(true);

    // Verify modified file on disk
    const content = fs.readFileSync(testFile, 'utf-8');
    expect(content).toContain('Mabuhay');

    // Rollback
    const rolled = patcher.rollback(testFile);
    expect(rolled).toBe(true);

    const reverted = fs.readFileSync(testFile, 'utf-8');
    expect(reverted).toContain('return "Hello, " + name;');
  });

  it('should prevent path traversal outside safe boundaries', () => {
    expect(() => {
      patcher.createFile('/etc/passwd', 'malicious');
    }).toThrow(/Security Violation/);
  });

  it('should diagnose V8 runtime stack trace and classify root causes with fixes', () => {
    const rawTrace = `
TypeError: Cannot read properties of undefined (reading 'title')
    at SecondBrainManager.get (C:\\Users\\dwight\\.gemini\\antigravity\\scratch\\jarvis\\src\\memory\\second-brain-manager.ts:135:29)
    at ResearchManager.ingestNoteToSecondBrain (C:\\Users\\dwight\\.gemini\\antigravity\\scratch\\jarvis\\src\\research\\research-manager.ts:240:35)
    `.trim();

    const diagnostic = errorDebugger.diagnoseError(rawTrace);

    expect(diagnostic.errorType).toBe('TypeError');
    expect(diagnostic.errorMessage).toBe("Cannot read properties of undefined (reading 'title')");
    expect(diagnostic.stackFrames.length).toBe(2);
    expect(diagnostic.stackFrames[0].functionName).toBe('SecondBrainManager.get');
    expect(diagnostic.stackFrames[0].line).toBe(135);
    expect(diagnostic.rootCauseAnalysis).toContain('asynchronous promise was likely unawaited');
    expect(diagnostic.suggestedFixes.some((f) => f.includes('await'))).toBe(true);
  });
});
