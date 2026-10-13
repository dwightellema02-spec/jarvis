import {
  VulnerabilityFinding,
  PayloadAuditReport,
} from './security-hardening.interface.js';

export class SecurityScanner {
  private threatsInterceptedCounter: number = 0;

  /**
   * Scans text or structured payload for prototype pollution, prompt injection,
   * directory traversal, and injection vectors
   */
  public auditPayload(payload: string | Record<string, unknown>): PayloadAuditReport {
    const findings: VulnerabilityFinding[] = [];
    const textToScan = typeof payload === 'string' ? payload : JSON.stringify(payload);

    // 1. Prototype Pollution Check
    let protoPollutionFound = false;
    if (typeof payload === 'object' && payload !== null) {
      const proto = Object.getPrototypeOf(payload);
      if (proto !== Object.prototype && proto !== null && proto !== Array.prototype) {
        protoPollutionFound = true;
      }
      if (Object.prototype.hasOwnProperty.call(payload, '__proto__') ||
          Object.prototype.hasOwnProperty.call(payload, 'constructor') ||
          Object.prototype.hasOwnProperty.call(payload, 'prototype')) {
        protoPollutionFound = true;
      }
    }

    const protoPollutionPatterns = [
      /__proto__/i,
      /constructor\s*\.\s*prototype/i,
      /prototype\s*\.\s*__defineGetter__/i,
      /prototype\s*\.\s*__defineSetter__/i,
    ];

    for (const pat of protoPollutionPatterns) {
      if (pat.test(textToScan)) {
        protoPollutionFound = true;
      }
    }

    if (protoPollutionFound) {
      findings.push({
        type: 'PROTOTYPE_POLLUTION',
        severity: 'critical',
        details: 'Attempted object prototype pollution vector detected in payload.',
        remediation: 'Sanitize object keys and enforce Object.freeze or null-prototype dictionary patterns.',
      });
    }

    // 2. Prompt Injection & Jailbreak Heuristics
    const promptInjectionPatterns = [
      /ignore\s+(all\s+)?(previous|prior)\s+instructions/i,
      /disregard\s+(all\s+)?(prior|system)\s+prompts/i,
      /dan\s+mode\s+enabled/i,
      /you\s+are\s+now\s+in\s+developer\s+mode/i,
      /reveal\s+(your\s+)?(system\s+prompt|base\s+instructions)/i,
      /print\s+everything\s+above\s+this\s+line/i,
      /bypass\s+(all\s+)?(security\s+guardrails?|guardian)/i,
      /you\s+are\s+an\s+uncensored\s+ai/i,
    ];

    for (const pat of promptInjectionPatterns) {
      if (pat.test(textToScan)) {
        findings.push({
          type: 'PROMPT_INJECTION',
          severity: 'high',
          details: `Prompt injection attack pattern detected: "${textToScan.match(pat)?.[0]}"`,
          remediation: 'Quarantine user query and verify against SecurityGuardian grounding rules.',
        });
      }
    }

    // 3. Directory Traversal Checks
    const traversalPatterns = [
      /\.\.[\/\\]/g,
      /%2e%2e[\/\\]/gi,
      /%252e%252e[\/\\]/gi,
      /\0/g,
      /%00/gi,
      /\/etc\/passwd/i,
      /c:\\windows\\system32\\config\\sam/i,
    ];

    for (const pat of traversalPatterns) {
      if (pat.test(textToScan)) {
        findings.push({
          type: 'DIRECTORY_TRAVERSAL',
          severity: 'critical',
          details: 'Path traversal attempt detected attempting to breach project boundaries.',
          remediation: 'Resolve absolute paths and verify against authorized project workspace root.',
        });
      }
    }

    // 4. Command Injection Vectors
    const cmdInjectionPatterns = [
      /[;&|`]\s*(rm\s+-rf|del\s+\/[fq]|format\s+[a-z]:)/i,
      /powershell\s+(-enc|-encodedcommand)/i,
      /invoke-expression/i,
      /\|\s*bash\b/i,
      /\|\s*sh\b/i,
    ];

    for (const pat of cmdInjectionPatterns) {
      if (pat.test(textToScan)) {
        findings.push({
          type: 'COMMAND_INJECTION',
          severity: 'critical',
          details: 'Dangerous shell execution chaining or destructive command pattern detected.',
          remediation: 'Command rejected. All terminal executions require explicit EXECUTE permission.',
        });
      }
    }

    // 5. SQL & ReDoS Regex Injection
    const sqlRegexPatterns = [
      /('\s*OR\s*['"]?1['"]?\s*=\s*['"]?1)/i,
      /UNION\s+SELECT/i,
      /DROP\s+TABLE/i,
      /\([a-zA-Z0-9_\-]+\+\)\+\$/i, // Catastrophic backtracking signature
    ];

    for (const pat of sqlRegexPatterns) {
      if (pat.test(textToScan)) {
        findings.push({
          type: 'SQL_REGEX_INJECTION',
          severity: 'high',
          details: 'SQL injection or Catastrophic Backtracking (ReDoS) vulnerability pattern found.',
          remediation: 'Use parameterized queries and clamp regex repetitions with atomic boundaries.',
        });
      }
    }

    // Compute composite risk score
    let riskScore = 0;
    for (const f of findings) {
      if (f.severity === 'critical') riskScore += 40;
      else if (f.severity === 'high') riskScore += 25;
      else if (f.severity === 'medium') riskScore += 15;
      else riskScore += 5;
    }
    riskScore = Math.min(100, riskScore);

    if (findings.length > 0) {
      this.threatsInterceptedCounter += findings.length;
    }

    const safe = findings.length === 0;
    const recommendedAction = riskScore >= 50 ? 'BLOCK' : riskScore > 0 ? 'QUARANTINE' : 'ALLOW';

    return {
      safe,
      riskScore,
      threatsDetectedCount: findings.length,
      findings,
      recommendedAction,
      inspectedLength: textToScan.length,
      auditTimestamp: new Date().toISOString(),
    };
  }

  public getThreatsInterceptedCount(): number {
    return this.threatsInterceptedCounter;
  }
}
