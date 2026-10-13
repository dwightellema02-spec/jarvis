import { ResourceType, PermissionAction, PermissionLevel } from '../types.js';

export interface EncryptedEnvelope {
  keyId: string;
  algorithm: 'aes-256-gcm';
  ciphertext: string; // Base64
  iv: string; // Base64 (12 bytes)
  authTag: string; // Base64 (16 bytes)
  hmac: string; // Hex
  encryptedAt: string;
  version: number;
}

export interface KeyRotationRecord {
  keyId: string;
  version: number;
  createdAt: string;
  status: 'active' | 'retired' | 'revoked';
  algorithm: string;
}

export type PiiClassification =
  | 'CREDIT_CARD'
  | 'API_KEY'
  | 'PASSWORD'
  | 'BEARER_TOKEN'
  | 'JWT'
  | 'EMAIL'
  | 'PHONE_NUMBER'
  | 'PHILSYS_ID'
  | 'SSS_NUMBER'
  | 'TIN_NUMBER'
  | 'UMID_NUMBER';

export interface PiiDetectionMatch {
  type: PiiClassification;
  originalText: string;
  maskedText: string;
  startIndex: number;
  endIndex: number;
  statutoryBasis?: string; // e.g. "RA 10173 (Data Privacy Act of 2012)"
}

export interface RedactionResult {
  originalLength: number;
  sanitizedText: string;
  matchesCount: number;
  detections: PiiDetectionMatch[];
  isClean: boolean;
}

export interface PrivacyToken {
  tokenId: string;
  classification: PiiClassification;
  originalHash: string;
  createdAt: string;
  expiresAt?: string;
}

export interface PermissionDelegation {
  id: string;
  delegatorId: string;
  delegateeId: string;
  resource: ResourceType;
  action: PermissionAction;
  level: PermissionLevel;
  reason: string;
  createdAt: string;
  expiresAt: string;
  active: boolean;
  delegationToken: string;
}

export type ThreatAttackType =
  | 'PROTOTYPE_POLLUTION'
  | 'PROMPT_INJECTION'
  | 'DIRECTORY_TRAVERSAL'
  | 'SQL_REGEX_INJECTION'
  | 'COMMAND_INJECTION'
  | 'TIMING_ATTACK';

export interface VulnerabilityFinding {
  type: ThreatAttackType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: string;
  location?: string;
  remediation: string;
}

export interface PayloadAuditReport {
  safe: boolean;
  riskScore: number; // 0 (immaculate) to 100 (critical hazard)
  threatsDetectedCount: number;
  findings: VulnerabilityFinding[];
  recommendedAction: 'ALLOW' | 'BLOCK' | 'QUARANTINE';
  inspectedLength: number;
  auditTimestamp: string;
}

export interface SecurityPostureOverview {
  timestamp: string;
  postureScore: number; // 0 - 100
  rating: 'GRADE_A_CITADEL' | 'GRADE_B_SECURE' | 'GRADE_C_VULNERABLE';
  activeKeysCount: number;
  activeDelegationsCount: number;
  vaultedTokensCount: number;
  piiRedactions24h: number;
  threatsInterceptedCount: number;
  statutoryCompliance: {
    ra10173Compliant: boolean;
    defaultDenyEnforced: boolean;
    envelopeEncryptionActive: boolean;
    zeroRecurrenceGuaranteed: boolean;
  };
  subsystemDefenses: Record<string, 'active' | 'hardened' | 'monitoring'>;
}
