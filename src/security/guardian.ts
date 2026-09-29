import {
  SecurityDecision,
  SecurityDecisionType,
  ResourceType,
  PermissionAction,
} from './types.js';
import {
  ThreatCategory,
  ThreatEvaluation,
  SecurityPolicy,
  DEFAULT_SECURITY_POLICY,
  PHASE_0_SECURITY_DISCLAIMER,
} from './threat-model.js';
import { SecurityEventType, SecurityEventSink } from './security-event.js';
import { logger } from '../utils/logger.js';
import { sanitizeData } from './sanitizer.js';

export interface SecurityEvaluationTarget {
  resource: ResourceType;
  action: PermissionAction;
  target?: string;
  metadata?: Record<string, unknown>;
  userId?: string;
}

export class SecurityGuardian {
  private policy: SecurityPolicy;
  private eventSink?: SecurityEventSink;

  constructor(policy: SecurityPolicy = DEFAULT_SECURITY_POLICY, eventSink?: SecurityEventSink) {
    this.policy = policy;
    this.eventSink = eventSink;
    logger.info(`Security Guardian initialized under policy: ${policy.name}`);
  }

  public getDisclaimer(): string {
    return PHASE_0_SECURITY_DISCLAIMER;
  }

  public getPolicy(): SecurityPolicy {
    return { ...this.policy };
  }

  /**
   * Analyzes an intended action/target against security threat models.
   * Decisions:
   *  - ALLOW
   *  - DENY
   *  - WARN
   *  - REQUIRE_CONFIRMATION
   */
  public evaluate(target: SecurityEvaluationTarget): SecurityDecision {
    const threats: ThreatEvaluation[] = [];

    // 1. Prohibited Actions & Malicious Operations Checks
    this.checkUnauthorizedOperations(target, threats);

    // 2. Resource-specific security checks
    this.checkResourceSpecificThreats(target, threats);

    // 3. Evaluate threats against current Security Policy
    const criticalOrHighThreats = threats.filter((t) => t.severity === 'critical' || t.severity === 'high');
    const blockedThreats = threats.filter((t) => this.policy.blockedCategories.includes(t.category));
    const confirmThreats = threats.filter((t) => this.policy.requireConfirmationCategories.includes(t.category));

    const timestamp = new Date().toISOString();

    if (blockedThreats.length > 0 || criticalOrHighThreats.length > 0) {
      const reasons = threats.map((t) => `[${t.category}] ${t.description}`).join('; ');

      this.recordSecurityEvent(SecurityEventType.ACTION_BLOCKED, 'high', {
        decision: SecurityDecisionType.DENY,
        threats: threats.map((t) => t.category),
        target: target.target,
        resource: target.resource,
        action: target.action,
      });

      return {
        decision: SecurityDecisionType.DENY,
        reason: `Guardian Security Block: ${reasons}`,
        resource: target.resource,
        action: target.action,
        threatsDetected: threats.map((t) => t.category),
        timestamp,
      };
    }

    if (confirmThreats.length > 0) {
      const reasons = confirmThreats.map((t) => `[${t.category}] ${t.description}`).join('; ');

      this.recordSecurityEvent(SecurityEventType.SECURITY_WARNING, 'medium', {
        decision: SecurityDecisionType.REQUIRE_CONFIRMATION,
        threats: confirmThreats.map((t) => t.category),
        target: target.target,
      });

      return {
        decision: SecurityDecisionType.REQUIRE_CONFIRMATION,
        reason: `Requires explicit confirmation: ${reasons}`,
        resource: target.resource,
        action: target.action,
        threatsDetected: confirmThreats.map((t) => t.category),
        timestamp,
      };
    }

    // Default Allow if no threat detected
    return {
      decision: SecurityDecisionType.ALLOW,
      reason: 'No security threats detected by current Guardian policy',
      resource: target.resource,
      action: target.action,
      timestamp,
    };
  }

  private checkUnauthorizedOperations(target: SecurityEvaluationTarget, threats: ThreatEvaluation[]): void {
    const rawTarget = String(target.target || '').toLowerCase();
    const action = String(target.action).toLowerCase();

    // Check for credential harvesting / hacking patterns
    if (
      rawTarget.includes('bypass_auth') ||
      rawTarget.includes('dump_passwords') ||
      rawTarget.includes('hack_account') ||
      rawTarget.includes('steal_credentials') ||
      rawTarget.includes('/etc/shadow') ||
      rawTarget.includes('sam_dump')
    ) {
      threats.push({
        category: ThreatCategory.UNAUTHORIZED_ACCESS,
        severity: 'critical',
        description: 'Attempted unauthorized system bypass, credential theft, or hacking command detected',
        source: 'SecurityGuardian:unauthorized_operations',
        indicators: ['bypass_auth', 'credential_access'],
      });
    }

    // Check for unauthorized privilege escalation
    if (
      rawTarget.includes('sudo su') ||
      rawTarget.includes('privilege_escalation') ||
      rawTarget.includes('exploit_priv')
    ) {
      threats.push({
        category: ThreatCategory.PRIVILEGE_ESCALATION,
        severity: 'critical',
        description: 'Unauthorized privilege escalation sequence detected',
        source: 'SecurityGuardian:privilege_escalation',
        indicators: ['privilege_escalation'],
      });
    }

    // Financial actions must be strictly guarded
    if (
      target.resource === ResourceType.FINANCIAL_SERVICES &&
      (action === 'execute' || action === 'transfer' || action === 'write')
    ) {
      threats.push({
        category: ThreatCategory.UNAUTHORIZED_FINANCIAL_ACTION,
        severity: 'critical',
        description:
          'Direct automated financial execution is prohibited. Financial actions require out-of-band authorization.',
        source: 'SecurityGuardian:financial_protection',
        indicators: ['financial_transaction'],
      });
    }
  }

  private checkResourceSpecificThreats(target: SecurityEvaluationTarget, threats: ThreatEvaluation[]): void {
    const rawTarget = String(target.target || '').toLowerCase();

    // URL & Web Checks
    if (target.resource === ResourceType.WEBSITES) {
      if (rawTarget.includes('phishing') || rawTarget.includes('login-steal') || rawTarget.includes('fake-bank')) {
        threats.push({
          category: ThreatCategory.PHISHING,
          severity: 'critical',
          description: 'Destination flagged as suspicious phishing domain',
          source: 'SecurityGuardian:web_reputation',
          indicators: [rawTarget],
        });
      }

      if (rawTarget.includes('scam') || rawTarget.includes('free-crypto-giveaway') || rawTarget.includes('double-bitcoin')) {
        threats.push({
          category: ThreatCategory.SCAM_WEBSITE,
          severity: 'high',
          description: 'Destination flagged as potential scam or fraudulent promotion',
          source: 'SecurityGuardian:scam_detection',
          indicators: [rawTarget],
        });
      }

      if (rawTarget.includes('suspicious-link') || rawTarget.includes('bit.ly/unverified')) {
        threats.push({
          category: ThreatCategory.SUSPICIOUS_LINK,
          severity: 'medium',
          description: 'Unverified shortlink or redirect detected',
          source: 'SecurityGuardian:link_analyzer',
          indicators: [rawTarget],
        });
      }
    }

    // File Download Checks
    if (target.resource === ResourceType.FILES && target.action === 'write') {
      const suspiciousExtensions = ['.exe', '.scr', '.vbs', '.bat', '.cmd', '.ps1'];
      if (suspiciousExtensions.some((ext) => rawTarget.endsWith(ext))) {
        threats.push({
          category: ThreatCategory.SUSPICIOUS_DOWNLOAD,
          severity: 'high',
          description: 'Attempted write of executable or script file from unverified source',
          source: 'SecurityGuardian:file_scanner',
          indicators: [rawTarget],
        });
      }
    }
  }

  private recordSecurityEvent(
    type: SecurityEventType,
    severity: 'low' | 'medium' | 'high' | 'critical',
    details: Record<string, unknown>
  ): void {
    if (this.eventSink) {
      this.eventSink.record({
        id: `sec_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        type,
        timestamp: new Date().toISOString(),
        severity,
        details: sanitizeData(details) as Record<string, unknown>,
      });
    }
  }
}
