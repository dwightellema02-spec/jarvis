import crypto from 'crypto';
import {
  PiiClassification,
  PiiDetectionMatch,
  RedactionResult,
  PrivacyToken,
} from './security-hardening.interface.js';

interface VaultedItem {
  token: PrivacyToken;
  originalValue: string;
}

export class PrivacyVault {
  private vault: Map<string, VaultedItem> = new Map();
  private redactionCounter: number = 0;

  // Luhn algorithm validator for credit cards
  private isValidLuhn(digits: string): boolean {
    const cleaned = digits.replace(/\D/g, '');
    if (cleaned.length < 13 || cleaned.length > 19) return false;
    let sum = 0;
    let shouldDouble = false;
    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned.charAt(i), 10);
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    return sum % 10 === 0;
  }

  /**
   * Scans and redacts credentials, PII, and Philippine statutory identifiers (RA 10173)
   */
  public redactPii(input: string): RedactionResult {
    let sanitized = input;
    const detections: PiiDetectionMatch[] = [];

    // 1. API Keys & Cloud Tokens
    const apiKeyPatterns = [
      { regex: /sk-[a-zA-Z0-9]{20,}/g, type: 'API_KEY' as PiiClassification },
      { regex: /AIza[0-9A-Za-z\-_]{35}/g, type: 'API_KEY' as PiiClassification },
      { regex: /gh[pousr]_[A-Za-z0-9_]{36,}/g, type: 'API_KEY' as PiiClassification },
      { regex: /bearer\s+[a-zA-Z0-9_\-\.]{20,}/gi, type: 'BEARER_TOKEN' as PiiClassification },
      { regex: /eyJ[a-zA-Z0-9_-]{10,}\.eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}/g, type: 'JWT' as PiiClassification },
      { regex: /-----BEGIN [A-Z ]+ PRIVATE KEY-----[a-zA-Z0-9\/\+=\r\n]+-----END [A-Z ]+ PRIVATE KEY-----/g, type: 'API_KEY' as PiiClassification },
    ];

    for (const pat of apiKeyPatterns) {
      sanitized = sanitized.replace(pat.regex, (match) => {
        detections.push({
          type: pat.type,
          originalText: match,
          maskedText: `[REDACTED_${pat.type}]`,
          startIndex: 0,
          endIndex: match.length,
          statutoryBasis: 'System Credential Protection Invariant',
        });
        return `[REDACTED_${pat.type}]`;
      });
    }

    // 2. Passwords in structured patterns
    const passwordRegex = /(password|passwd|secret|auth_token)\s*[:=]\s*["']?([^\s"',;]+)["']?/gi;
    sanitized = sanitized.replace(passwordRegex, (full, label) => {
      detections.push({
        type: 'PASSWORD',
        originalText: full,
        maskedText: `${label}: "[REDACTED_PASSWORD]"`,
        startIndex: 0,
        endIndex: full.length,
        statutoryBasis: 'Credential Protection Policy',
      });
      return `${label}: "[REDACTED_PASSWORD]"`;
    });

    // 3. Philippine Statutory Identifiers (Republic Act 10173 - Data Privacy Act of 2012)
    // PhilSys PCN (16 digits formatted 1234-5678-9012-3456)
    const philsysRegex = /\b\d{4}-\d{4}-\d{4}-\d{4}\b/g;
    sanitized = sanitized.replace(philsysRegex, (match) => {
      detections.push({
        type: 'PHILSYS_ID',
        originalText: match,
        maskedText: '[REDACTED_PHILSYS_PCN]',
        startIndex: 0,
        endIndex: match.length,
        statutoryBasis: 'Republic Act 10173 (Data Privacy Act of 2012)',
      });
      return '[REDACTED_PHILSYS_PCN]';
    });

    // SSS (Social Security System: 10 digits formatted 12-3456789-0)
    const sssRegex = /\b\d{2}-\d{7}-\d{1}\b/g;
    sanitized = sanitized.replace(sssRegex, (match) => {
      detections.push({
        type: 'SSS_NUMBER',
        originalText: match,
        maskedText: '[REDACTED_SSS_ID]',
        startIndex: 0,
        endIndex: match.length,
        statutoryBasis: 'Republic Act 10173 (Data Privacy Act of 2012)',
      });
      return '[REDACTED_SSS_ID]';
    });

    // TIN (Tax Identification Number: 9 or 12 digits formatted 123-456-789 or 123-456-789-000)
    const tinRegex = /\b\d{3}-\d{3}-\d{3}(-\d{3})?\b/g;
    sanitized = sanitized.replace(tinRegex, (match) => {
      detections.push({
        type: 'TIN_NUMBER',
        originalText: match,
        maskedText: '[REDACTED_TIN]',
        startIndex: 0,
        endIndex: match.length,
        statutoryBasis: 'Republic Act 10173 (Data Privacy Act of 2012)',
      });
      return '[REDACTED_TIN]';
    });

    // UMID (Unified Multi-Purpose ID: 12 digits formatted 1234-5678901-2)
    const umidRegex = /\b\d{4}-\d{7}-\d{1}\b/g;
    sanitized = sanitized.replace(umidRegex, (match) => {
      detections.push({
        type: 'UMID_NUMBER',
        originalText: match,
        maskedText: '[REDACTED_UMID]',
        startIndex: 0,
        endIndex: match.length,
        statutoryBasis: 'Republic Act 10173 (Data Privacy Act of 2012)',
      });
      return '[REDACTED_UMID]';
    });

    // 4. Financial & Credit Cards
    const ccRegex = /\b\d{4}[ -]?\d{4}[ -]?\d{4}[ -]?\d{4}\b|\b\d{13,19}\b/g;
    sanitized = sanitized.replace(ccRegex, (match) => {
      const digits = match.replace(/\D/g, '');
      if (this.isValidLuhn(digits)) {
        detections.push({
          type: 'CREDIT_CARD',
          originalText: match,
          maskedText: '[REDACTED_CREDIT_CARD]',
          startIndex: 0,
          endIndex: match.length,
          statutoryBasis: 'PCI-DSS Compliance / Payment Safeguard',
        });
        return '[REDACTED_CREDIT_CARD]';
      }
      return match;
    });

    // 5. Email addresses
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    sanitized = sanitized.replace(emailRegex, (match) => {
      const parts = match.split('@');
      const masked = `${parts[0].charAt(0)}***@${parts[1]}`;
      detections.push({
        type: 'EMAIL',
        originalText: match,
        maskedText: masked,
        startIndex: 0,
        endIndex: match.length,
        statutoryBasis: 'Republic Act 10173 (Data Privacy Act of 2012)',
      });
      return masked;
    });

    this.redactionCounter += detections.length;

    return {
      originalLength: input.length,
      sanitizedText: sanitized,
      matchesCount: detections.length,
      detections,
      isClean: detections.length === 0,
    };
  }

  /**
   * Tokenizes sensitive data into a reversible pseudonymized privacy token
   */
  public tokenize(value: string, classification: PiiClassification, durationMinutes: number = 60): string {
    const hash = crypto.createHash('sha256').update(value).digest('hex');
    const tokenId = `tok_${classification.toLowerCase()}_${crypto.randomBytes(8).toString('hex')}`;

    const token: PrivacyToken = {
      tokenId,
      classification,
      originalHash: hash,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + durationMinutes * 60000).toISOString(),
    };

    this.vault.set(tokenId, { token, originalValue: value });
    return tokenId;
  }

  /**
   * Detokenizes a privacy token back into its original value for authorized operations
   */
  public detokenize(tokenId: string): string {
    const item = this.vault.get(tokenId);
    if (!item) {
      throw new Error(`Privacy token ${tokenId} not found or already purged`);
    }

    if (item.token.expiresAt && new Date(item.token.expiresAt).getTime() < Date.now()) {
      this.vault.delete(tokenId);
      throw new Error(`Privacy token ${tokenId} has expired`);
    }

    return item.originalValue;
  }

  public getVaultCount(): number {
    return this.vault.size;
  }

  public getRedactionCount(): number {
    return this.redactionCounter;
  }
}
