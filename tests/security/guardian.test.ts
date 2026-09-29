import { describe, it, expect, beforeEach } from 'vitest';
import { SecurityGuardian } from '../../src/security/guardian.js';
import { InMemorySecurityEventSink, SecurityEventType } from '../../src/security/security-event.js';
import { ResourceType, SecurityDecisionType } from '../../src/security/types.js';
import { ThreatCategory } from '../../src/security/threat-model.js';

describe('Security Guardian & Threat Model Tests', () => {
  let guardian: SecurityGuardian;
  let eventSink: InMemorySecurityEventSink;

  beforeEach(() => {
    eventSink = new InMemorySecurityEventSink();
    guardian = new SecurityGuardian(undefined, eventSink);
  });

  it('blocks attempted unauthorized system bypass or credential dumping', async () => {
    const decision = guardian.evaluate({
      resource: ResourceType.APPLICATIONS,
      action: 'execute',
      target: 'cat /etc/shadow && dump_passwords',
      userId: 'test_user',
    });

    expect(decision.decision).toBe(SecurityDecisionType.DENY);
    expect(decision.threatsDetected).toContain(ThreatCategory.UNAUTHORIZED_ACCESS);

    const events = await eventSink.query();
    expect(events.some((e) => e.type === SecurityEventType.ACTION_BLOCKED)).toBe(true);
  });

  it('blocks privilege escalation exploits', () => {
    const decision = guardian.evaluate({
      resource: ResourceType.APPLICATIONS,
      action: 'execute',
      target: 'sudo su root; exploit_priv',
      userId: 'attacker',
    });

    expect(decision.decision).toBe(SecurityDecisionType.DENY);
    expect(decision.threatsDetected).toContain(ThreatCategory.PRIVILEGE_ESCALATION);
  });

  it('blocks direct automated financial transactions', () => {
    const decision = guardian.evaluate({
      resource: ResourceType.FINANCIAL_SERVICES,
      action: 'transfer',
      target: 'Transfer $5000 to external_wallet',
      userId: 'test_user',
    });

    expect(decision.decision).toBe(SecurityDecisionType.DENY);
    expect(decision.threatsDetected).toContain(ThreatCategory.UNAUTHORIZED_FINANCIAL_ACTION);
  });

  it('detects and blocks known phishing and fraudulent websites', () => {
    const decisionPhishing = guardian.evaluate({
      resource: ResourceType.WEBSITES,
      action: 'open',
      target: 'https://login-steal.phishing-example.com',
      userId: 'test_user',
    });

    expect(decisionPhishing.decision).toBe(SecurityDecisionType.DENY);
    expect(decisionPhishing.threatsDetected).toContain(ThreatCategory.PHISHING);

    const decisionScam = guardian.evaluate({
      resource: ResourceType.WEBSITES,
      action: 'open',
      target: 'https://free-crypto-giveaway-scam.net',
      userId: 'test_user',
    });

    expect(decisionScam.decision).toBe(SecurityDecisionType.DENY);
    expect(decisionScam.threatsDetected).toContain(ThreatCategory.SCAM_WEBSITE);
  });

  it('requires confirmation on unverified suspicious links or redirects', () => {
    const decision = guardian.evaluate({
      resource: ResourceType.WEBSITES,
      action: 'open',
      target: 'https://bit.ly/unverified-redirect',
      userId: 'test_user',
    });

    expect(decision.decision).toBe(SecurityDecisionType.REQUIRE_CONFIRMATION);
    expect(decision.threatsDetected).toContain(ThreatCategory.SUSPICIOUS_LINK);
  });

  it('allows safe, legitimate operations without threats', () => {
    const decision = guardian.evaluate({
      resource: ResourceType.WEBSITES,
      action: 'read',
      target: 'https://en.wikipedia.org/wiki/Mathematics',
      userId: 'student_user',
    });

    expect(decision.decision).toBe(SecurityDecisionType.ALLOW);
    expect(decision.threatsDetected).toBeUndefined();
  });
});
