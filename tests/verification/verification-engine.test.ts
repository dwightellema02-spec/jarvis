import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import {
  EvidenceCollector,
  AntiHallucinationAuditor,
  VerificationSuiteManager,
  VerificationAgent,
  createVerificationTools,
  VerifyActionTool,
  CollectEvidenceTool,
  AuditHallucinationTool,
  DiagnoseFailureTool,
  ExecuteRecoveryLoopTool,
  GetAttestationTool,
  ListAttestationsTool,
  GenerateAuditReportTool,
} from '../../src/verification/index.js';
import { AgentRegistry } from '../../src/agents/agent-registry.js';
import { ToolRegistry } from '../../src/tools/tool-registry.js';
import { PermissionManager } from '../../src/security/permission-manager.js';
import { SecurityGuardian } from '../../src/security/guardian.js';
import { AuditLogger } from '../../src/audit/audit-logger.js';
import { PermissionLevel, ResourceType } from '../../src/security/types.js';

describe('Phase 26: Verification Engine & Anti-Hallucination Gate', () => {
  const testDir = path.resolve(process.cwd(), 'tests', 'fixtures', 'verification_sandbox');
  const sampleFilePath = path.join(testDir, 'verified_sample.txt');

  beforeEach(() => {
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
    fs.writeFileSync(sampleFilePath, 'JARVIS VERIFIED ARTIFACT: E=mc^2 and H|psi>=E|psi>', 'utf-8');
  });

  afterEach(() => {
    if (fs.existsSync(sampleFilePath)) {
      fs.unlinkSync(sampleFilePath);
    }
    if (fs.existsSync(testDir)) {
      fs.rmdirSync(testDir, { recursive: true });
    }
  });

  describe('1. EvidenceCollector (Multi-Modal Observations)', () => {
    const collector = new EvidenceCollector();

    it('collects filesystem existence, size, and content evidence', () => {
      const existEv = collector.collectEvidence({ type: 'file_exists', target: sampleFilePath });
      expect(existEv.passed).toBe(true);
      expect(existEv.actual).toBe(true);

      const sizeEv = collector.collectEvidence({
        type: 'file_size',
        target: sampleFilePath,
        expected: 10,
      });
      expect(sizeEv.passed).toBe(true);

      const contentEv = collector.collectEvidence({
        type: 'file_content',
        target: sampleFilePath,
        expected: ['JARVIS VERIFIED ARTIFACT', 'E=mc^2'],
      });
      expect(contentEv.passed).toBe(true);

      const missingContentEv = collector.collectEvidence({
        type: 'file_content',
        target: sampleFilePath,
        expected: 'NON_EXISTENT_PATTERN',
      });
      expect(missingContentEv.passed).toBe(false);
    });

    it('collects process exit code, stdout, and clean stderr evidence', () => {
      const exitEv = collector.collectEvidence(
        { type: 'exit_code_zero', expected: 0 },
        { exitCode: 0 }
      );
      expect(exitEv.passed).toBe(true);

      const failedExitEv = collector.collectEvidence(
        { type: 'exit_code_zero', expected: 0 },
        { exitCode: 1 }
      );
      expect(failedExitEv.passed).toBe(false);

      const stdoutEv = collector.collectEvidence(
        { type: 'stdout_match', expected: 'BUILD_SUCCESS' },
        { stdout: 'Compiling module... BUILD_SUCCESS in 23ms' }
      );
      expect(stdoutEv.passed).toBe(true);

      const cleanStderrEv = collector.collectEvidence(
        { type: 'stderr_clean' },
        { stderr: 'Notice: cache hit' }
      );
      expect(cleanStderrEv.passed).toBe(true);

      const fatalStderrEv = collector.collectEvidence(
        { type: 'stderr_clean' },
        { stderr: 'FATAL: Memory buffer overflow!' }
      );
      expect(fatalStderrEv.passed).toBe(false);
    });

    it('collects schema, type integrity, and numeric bounds evidence', () => {
      const payload = {
        name: 'QuantumSimulator',
        score: 95.5,
        passed: true,
        metrics: [1, 2, 3],
      };

      const schemaEv = collector.collectEvidence(
        { type: 'schema_valid', expected: ['name', 'score', 'passed'] },
        payload
      );
      expect(schemaEv.passed).toBe(true);

      const missingFieldEv = collector.collectEvidence(
        { type: 'schema_valid', expected: ['name', 'missingField'] },
        payload
      );
      expect(missingFieldEv.passed).toBe(false);

      const typeEv = collector.collectEvidence(
        {
          type: 'type_integrity',
          options: { fieldTypes: { name: 'string', score: 'number', passed: 'boolean', metrics: 'array' } },
        },
        payload
      );
      expect(typeEv.passed).toBe(true);

      const boundsEv = collector.collectEvidence(
        { type: 'range_bounds', options: { field: 'score', min: 0, max: 100 } },
        payload
      );
      expect(boundsEv.passed).toBe(true);

      const outOfBoundsEv = collector.collectEvidence(
        { type: 'range_bounds', options: { field: 'score', min: 100, max: 200 } },
        payload
      );
      expect(outOfBoundsEv.passed).toBe(false);
    });

    it('collects computation tolerance and code syntax evidence', () => {
      const mathEv = collector.collectEvidence(
        { type: 'computation_verified', expected: 3.14159, options: { tolerance: 0.001 } },
        3.141592
      );
      expect(mathEv.passed).toBe(true);

      const divergedMathEv = collector.collectEvidence(
        { type: 'computation_verified', expected: 10.0, options: { tolerance: 0.001 } },
        9.5
      );
      expect(divergedMathEv.passed).toBe(false);

      const syntaxEv = collector.collectEvidence(
        { type: 'code_syntax_valid', target: 'sample.js' },
        'function solve(x) { return x * 2; }'
      );
      expect(syntaxEv.passed).toBe(true);

      const invalidSyntaxEv = collector.collectEvidence(
        { type: 'code_syntax_valid', target: 'broken.js' },
        'function broken(x) { return ;;; unexpected %%% syntax'
      );
      expect(invalidSyntaxEv.passed).toBe(false);
    });

    it('computes deterministic cryptographic SHA-256 evidence fingerprint', () => {
      const ev1 = collector.collectEvidence({ type: 'file_exists', target: sampleFilePath });
      const fp1 = collector.generateFingerprint([ev1], 'action_1');
      const fp2 = collector.generateFingerprint([ev1], 'action_1');
      expect(fp1).toBe(fp2);
      expect(fp1).toHaveLength(64);
    });
  });

  describe('2. AntiHallucinationAuditor (Ground Truth Assertion)', () => {
    const auditor = new AntiHallucinationAuditor();

    const groundingSources = [
      'The Philippine Licensure Examination for Teachers (LET) is administered by the Professional Regulation Commission (PRC).',
      'The passing general average rating requirement is at least 75 percent with no grade below 50 percent in any subject.',
      'Hermite polynomials satisfy the recurrence relation H_{n+1}(x) = 2x H_n(x) - 2n H_{n-1}(x).',
    ];

    it('approves grounded claims with low hallucination risk', () => {
      const claimText =
        'The Philippine Licensure Examination for Teachers is conducted by the Professional Regulation Commission. Passing requires a 75 percent general average rating.';
      const result = auditor.audit({
        claimText,
        groundingSources,
        strictness: 'standard',
      });

      expect(result.passed).toBe(true);
      expect(result.hallucinationRisk).toBeLessThanOrEqual(0.30);
      expect(result.groundedClaimsCount).toBeGreaterThanOrEqual(1);
      expect(result.citationMatches.length).toBeGreaterThan(0);
    });

    it('rejects ungrounded, hallucinated claims with high hallucination risk', () => {
      const hallucinatedClaim =
        'The examination takes place on Mars and requires candidates to pilot a supersonic fighter jet while reciting ancient Mayan calendar glyphs backwards.';
      const result = auditor.audit({
        claimText: hallucinatedClaim,
        groundingSources,
        strictness: 'standard',
      });

      expect(result.passed).toBe(false);
      expect(result.hallucinationRisk).toBeGreaterThan(0.30);
      expect(result.unsupportedClaims.length).toBeGreaterThan(0);
    });

    it('respects strictness mode thresholds', () => {
      const partialClaim = 'The Philippine Licensure Examination for Teachers requires 75 percent. An extra untested assumption exists here.';
      const strictResult = auditor.audit({
        claimText: partialClaim,
        groundingSources,
        strictness: 'strict',
      });
      const lenientResult = auditor.audit({
        claimText: partialClaim,
        groundingSources,
        strictness: 'lenient',
      });

      expect(strictResult.hallucinationRisk).toBeGreaterThanOrEqual(0);
      expect(lenientResult.passed).toBe(true);
    });
  });

  describe('3. VerificationSuiteManager & Self-Healing Auto-Retry Loop', () => {
    let permManager: PermissionManager;
    let guardian: SecurityGuardian;
    let auditLogger: AuditLogger;
    let suiteManager: VerificationSuiteManager;

    beforeEach(() => {
      permManager = new PermissionManager();
      guardian = new SecurityGuardian();
      auditLogger = new AuditLogger();

      permManager.grantPermission({
        userId: 'dwight',
        resource: ResourceType.SYSTEM,
        level: PermissionLevel.WRITE,
        allowedActions: ['read', 'write', 'execute'],
        grantedBy: 'system',
      });

      suiteManager = new VerificationSuiteManager({
        permissionManager: permManager,
        guardian,
        auditLogger,
      });
    });

    it('verifies multi-check plans and generates signed attestations', () => {
      const attestation = suiteManager.verifyAction(
        'coding.compiler_pass',
        [
          { type: 'file_exists', target: sampleFilePath },
          { type: 'exit_code_zero', expected: 0 },
          { type: 'computation_verified', expected: 100, options: { tolerance: 0.1 } },
        ],
        { exitCode: 0, result: 100.0 },
        'dwight'
      );

      expect(attestation.passed).toBe(true);
      expect(attestation.totalChecks).toBe(3);
      expect(attestation.passedChecks).toBe(3);
      expect(attestation.failedChecks).toBe(0);
      expect(attestation.fingerprint).toBeDefined();
      expect(attestation.diagnosis).toBeUndefined();
    });

    it('diagnoses failure when checks fail and categorizes root cause', () => {
      const attestation = suiteManager.verifyAction(
        'io.save_missing_file',
        [
          { type: 'file_exists', target: path.join(testDir, 'non_existent_file.bin') },
          { type: 'exit_code_zero', expected: 0 },
        ],
        { exitCode: 1 },
        'dwight'
      );

      expect(attestation.passed).toBe(false);
      expect(attestation.failedChecks).toBe(2);
      expect(attestation.diagnosis).toBeDefined();
      expect(attestation.diagnosis?.rootCauseCategory).toBe('missing_artifact');
      expect(attestation.diagnosis?.suggestedRemediation).toContain('Ensure required artifact path');
    });

    it('executes self-healing auto-retry loop until verification passes', async () => {
      let callCount = 0;
      const loop = await suiteManager.executeAutoRetryLoop(
        'data.adaptive_pipeline',
        async (attempt) => {
          callCount++;
          // Fails on attempt 1, passes on attempt 2
          if (attempt === 1) {
            return { processed: 50, valid: false };
          }
          return { processed: 100, valid: true };
        },
        [
          { type: 'range_bounds', options: { field: 'processed', min: 100 } },
          { type: 'schema_valid', expected: ['processed', 'valid'] },
        ],
        3,
        'dwight'
      );

      expect(loop.finalPassed).toBe(true);
      expect(loop.attemptsUsed).toBe(2);
      expect(callCount).toBe(2);
      expect(loop.attestations.length).toBe(2);
      expect(loop.diagnoses.length).toBe(1);
      expect(loop.recoveryLog.length).toBeGreaterThan(0);
    });

    it('manages attestation queries and generates compliance audit report', () => {
      const list = suiteManager.listAttestations(undefined, 'dwight');
      expect(list.length).toBeGreaterThanOrEqual(1);

      const firstId = list[0].attestationId;
      const single = suiteManager.getAttestation(firstId, 'dwight');
      expect(single.attestationId).toBe(firstId);

      const report = suiteManager.generateAuditReport('dwight');
      expect(report.totalAttestations).toBeGreaterThanOrEqual(1);
      expect(report.passRatePercent).toBeDefined();
      expect(report.complianceStatus).toBeDefined();
    });
  });

  describe('4. VerificationAgent & 8 Verification Tools', () => {
    let permManager: PermissionManager;
    let guardian: SecurityGuardian;
    let auditLogger: AuditLogger;
    let suiteManager: VerificationSuiteManager;
    let agent: VerificationAgent;
    let tools: ReturnType<typeof createVerificationTools>;

    beforeEach(() => {
      permManager = new PermissionManager();
      guardian = new SecurityGuardian();
      auditLogger = new AuditLogger();

      permManager.grantPermission({
        userId: 'dwight',
        resource: ResourceType.SYSTEM,
        level: PermissionLevel.WRITE,
        allowedActions: ['read', 'write', 'execute'],
        grantedBy: 'system',
      });

      suiteManager = new VerificationSuiteManager({
        permissionManager: permManager,
        guardian,
        auditLogger,
      });

      agent = new VerificationAgent(suiteManager);
      tools = createVerificationTools(suiteManager);
    });

    it('verifies agent executes actions and queries ledger', async () => {
      const res = await agent.execute(
        {
          action: 'verify_action',
          actionName: 'unit_test_run',
          checks: [{ type: 'file_exists', target: sampleFilePath }],
        },
        { requestId: 'req_1', userId: 'dwight', sessionId: 'sess_1' }
      );

      expect(res.success).toBe(true);
      expect(res.data).toBeDefined();
    });

    it('registers and executes all 8 verification tools', async () => {
      expect(tools.length).toBe(8);

      const ctx = {
        requestId: 'req_tool',
        userId: 'dwight',
        sessionId: 'sess_tool',
        permissionVerified: true,
      };

      // 1. CollectEvidenceTool
      const collectTool = tools.find((t) => t.definition.id === 'verification.collect_evidence')!;
      const collectRes = await collectTool.execute(
        { check: { type: 'file_exists', target: sampleFilePath } },
        ctx
      );
      expect(collectRes.success).toBe(true);
      expect(collectRes.verified).toBe(true);

      // 2. VerifyActionTool
      const verifyTool = tools.find((t) => t.definition.id === 'verification.verify_action')!;
      const verifyRes = await verifyTool.execute(
        {
          actionName: 'test.tool_verify',
          checks: [{ type: 'exit_code_zero', expected: 0 }],
          runtimePayload: { exitCode: 0 },
        },
        ctx
      );
      expect(verifyRes.success).toBe(true);
      expect(verifyRes.verified).toBe(true);

      // 3. AuditHallucinationTool
      const hallTool = tools.find((t) => t.definition.id === 'verification.audit_hallucination')!;
      const hallRes = await hallTool.execute(
        {
          claimText: 'PRC administers the LET examination in the Philippines.',
          groundingSources: ['PRC administers the LET examination in the Philippines with high standards.'],
        },
        ctx
      );
      expect(hallRes.success).toBe(true);
      expect(hallRes.verified).toBe(true);

      // 4. DiagnoseFailureTool
      const diagTool = tools.find((t) => t.definition.id === 'verification.diagnose_failure')!;
      const diagRes = await diagTool.execute(
        {
          failedChecks: [
            {
              checkType: 'file_exists',
              target: 'missing.txt',
              expected: true,
              actual: false,
              passed: false,
              message: 'Missing',
              timestamp: new Date().toISOString(),
            },
          ],
        },
        ctx
      );
      expect(diagRes.success).toBe(true);

      // 5. ExecuteRecoveryLoopTool
      const loopTool = tools.find((t) => t.definition.id === 'verification.execute_recovery_loop')!;
      const loopRes = await loopTool.execute(
        {
          actionName: 'resilient_action',
          checks: [{ type: 'schema_valid', expected: ['attempt', 'status'] }],
          maxAttempts: 2,
        },
        ctx
      );
      expect(loopRes.success).toBe(true);

      // 6. ListAttestationsTool
      const listTool = tools.find((t) => t.definition.id === 'verification.list_attestations')!;
      const listRes = await listTool.execute({}, ctx);
      expect(listRes.success).toBe(true);

      // 7. GetAttestationTool
      const getTool = tools.find((t) => t.definition.id === 'verification.get_attestation')!;
      const getRes = await getTool.execute(
        { attestationId: 'attest_bootstrap_kernel_01' },
        ctx
      );
      expect(getRes.success).toBe(true);

      // 8. GenerateAuditReportTool
      const reportTool = tools.find((t) => t.definition.id === 'verification.generate_audit_report')!;
      const reportRes = await reportTool.execute({}, ctx);
      expect(reportRes.success).toBe(true);
      expect(reportRes.data).toBeDefined();
    });
  });
});
