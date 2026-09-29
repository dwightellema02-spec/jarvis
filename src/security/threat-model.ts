export enum ThreatCategory {
  MALWARE = 'MALWARE',
  VIRUS = 'VIRUS',
  SUSPICIOUS_DOWNLOAD = 'SUSPICIOUS_DOWNLOAD',
  SCAM_WEBSITE = 'SCAM_WEBSITE',
  PHISHING = 'PHISHING',
  MALICIOUS_ADVERTISEMENT = 'MALICIOUS_ADVERTISEMENT',
  DANGEROUS_PROMOTION = 'DANGEROUS_PROMOTION',
  GAMBLING = 'GAMBLING',
  ADULT_CONTENT = 'ADULT_CONTENT',
  SUSPICIOUS_LINK = 'SUSPICIOUS_LINK',
  HARMFUL_FILE = 'HARMFUL_FILE',
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  CREDENTIAL_THEFT = 'CREDENTIAL_THEFT',
  PRIVILEGE_ESCALATION = 'PRIVILEGE_ESCALATION',
  UNAUTHORIZED_FINANCIAL_ACTION = 'UNAUTHORIZED_FINANCIAL_ACTION',
}

export interface ThreatEvaluation {
  category: ThreatCategory;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  source: string;
  indicators: string[];
}

export interface SecurityPolicy {
  id: string;
  name: string;
  description: string;
  blockedCategories: ThreatCategory[];
  requireConfirmationCategories: ThreatCategory[];
  strictDefaultDeny: boolean;
}

export const DEFAULT_SECURITY_POLICY: SecurityPolicy = {
  id: 'jarvis-default-security-policy',
  name: 'Default JARVIS Guardian Policy',
  description: 'Default-deny for sensitive capabilities and full blocking of known threat patterns',
  blockedCategories: [
    ThreatCategory.MALWARE,
    ThreatCategory.VIRUS,
    ThreatCategory.SUSPICIOUS_DOWNLOAD,
    ThreatCategory.SCAM_WEBSITE,
    ThreatCategory.PHISHING,
    ThreatCategory.HARMFUL_FILE,
    ThreatCategory.UNAUTHORIZED_ACCESS,
    ThreatCategory.CREDENTIAL_THEFT,
    ThreatCategory.PRIVILEGE_ESCALATION,
    ThreatCategory.UNAUTHORIZED_FINANCIAL_ACTION,
  ],
  requireConfirmationCategories: [
    ThreatCategory.SUSPICIOUS_LINK,
    ThreatCategory.MALICIOUS_ADVERTISEMENT,
    ThreatCategory.DANGEROUS_PROMOTION,
    ThreatCategory.GAMBLING,
    ThreatCategory.ADULT_CONTENT,
  ],
  strictDefaultDeny: true,
};

/**
 * Architectural Notice:
 * Phase 0 establishes the threat taxonomy, security evaluation contract, policy interfaces,
 * and blocking decision logic. It provides deterministic policy checks against known malicious
 * patterns and unauthorized operations.
 *
 * NOTE: Phase 0 does NOT claim to provide low-level OS antivirus or kernel packet filtering.
 * Actual deep runtime scanning, network telemetry, and sandboxed analysis will be integrated
 * in subsequent security hardening phases.
 */
export const PHASE_0_SECURITY_DISCLAIMER =
  'Phase 0 establishes the Guardian Policy Architecture and Security Contracts. It does not replace OS-level endpoint protection.';
