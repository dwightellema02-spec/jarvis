export type VerificationCheckType =
  | 'file_exists'
  | 'file_size'
  | 'file_content'
  | 'file_hash'
  | 'exit_code_zero'
  | 'stdout_match'
  | 'stderr_clean'
  | 'schema_valid'
  | 'type_integrity'
  | 'range_bounds'
  | 'computation_verified'
  | 'tolerance_diff'
  | 'code_syntax_valid'
  | 'anti_hallucination_grounded'
  | 'custom_invariant';

export interface EvidenceItem {
  checkType: VerificationCheckType;
  target: string;
  expected: unknown;
  actual: unknown;
  passed: boolean;
  message: string;
  timestamp: string;
}

export interface VerificationCheckSpec {
  type: VerificationCheckType;
  target?: string;
  expected?: unknown;
  options?: Record<string, unknown>;
}

export interface VerificationPlan {
  id: string;
  actionName: string;
  description: string;
  checks: VerificationCheckSpec[];
}

export interface VerificationDiagnosis {
  failedChecks: EvidenceItem[];
  rootCauseCategory: 'missing_artifact' | 'syntax_error' | 'tolerance_exceeded' | 'hallucination_detected' | 'schema_mismatch' | 'execution_fault' | 'unknown';
  severity: 'low' | 'medium' | 'high' | 'critical';
  suggestedRemediation: string;
  retryable: boolean;
  recommendedParams?: Record<string, unknown>;
}

export interface VerificationAttestation {
  attestationId: string;
  actionName: string;
  passed: boolean;
  totalChecks: number;
  passedChecks: number;
  failedChecks: number;
  evidence: EvidenceItem[];
  diagnosis?: VerificationDiagnosis;
  fingerprint: string;
  verifiedAt: string;
  verifiedBy: string;
}

export interface AntiHallucinationCheckRequest {
  claimText: string;
  groundingSources: string[];
  strictness?: 'lenient' | 'standard' | 'strict';
}

export interface AntiHallucinationAuditResult {
  passed: boolean;
  hallucinationRisk: number; // 0.0 (grounded) to 1.0 (hallucinated)
  groundedClaimsCount: number;
  unsupportedClaimsCount: number;
  unsupportedClaims: string[];
  citationMatches: Array<{ claim: string; sourceSnippet: string; score: number }>;
  auditNotes: string;
}

export interface AutoRetryExecutionResult<T = unknown> {
  actionName: string;
  finalPassed: boolean;
  attemptsUsed: number;
  maxAttempts: number;
  result?: T;
  attestations: VerificationAttestation[];
  diagnoses: VerificationDiagnosis[];
  recoveryLog: string[];
}
