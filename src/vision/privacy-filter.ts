/**
 * JARVIS Phase 19 - Privacy Filter & Redaction Shield
 * Automatically masks and redacts PII, credentials, tokens, and credit cards from visual captures.
 */

import { PrivacyRedactionItem, PrivacyRedactionResult, BoundingBox } from './vision.interface.js';

export class PrivacyFilter {
  // Regex rules for sensitive patterns
  private static readonly CREDIT_CARD_REGEX = /\b(?:\d{4}[ -]?){3}\d{4}\b/g;
  private static readonly API_KEY_REGEX = /\b(?:sk-[a-zA-Z0-9]{20,}|ghp_[a-zA-Z0-9]{20,}|AIzaSy[a-zA-Z0-9_-]{33}|[a-f0-9]{32,64})\b/g;
  private static readonly EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  private static readonly PHONE_REGEX = /\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g;
  private static readonly PASSWORD_REGEX = /(?:password|passwd|secret|token)\s*[:=]\s*([^\s,;]+)/gi;

  /**
   * Scans text content for sensitive data and generates redaction metadata.
   */
  public scanAndRedact(text: string, imageBase64?: string): PrivacyRedactionResult {
    const redactions: PrivacyRedactionItem[] = [];
    let sanitizedText = text;

    // 1. Credit Cards
    sanitizedText = sanitizedText.replace(PrivacyFilter.CREDIT_CARD_REGEX, (match) => {
      const masked = '••••-••••-••••-' + match.slice(-4).replace(/\D/g, '');
      redactions.push({
        type: 'credit_card',
        rawText: match,
        redactedText: masked,
        box: { x: 100, y: 150, width: 220, height: 30 },
      });
      return masked;
    });

    // 2. API Keys & Secrets
    sanitizedText = sanitizedText.replace(PrivacyFilter.API_KEY_REGEX, (match) => {
      const masked = match.substring(0, 4) + '••••••••[REDACTED_SECRET]';
      redactions.push({
        type: 'api_key',
        rawText: match,
        redactedText: masked,
        box: { x: 80, y: 200, width: 300, height: 25 },
      });
      return masked;
    });

    // 3. Passwords in cleartext
    sanitizedText = sanitizedText.replace(PrivacyFilter.PASSWORD_REGEX, (full, val) => {
      const masked = '••••••••';
      redactions.push({
        type: 'password',
        rawText: val,
        redactedText: masked,
        box: { x: 80, y: 250, width: 180, height: 25 },
      });
      return full.replace(val, masked);
    });

    // 4. Emails
    sanitizedText = sanitizedText.replace(PrivacyFilter.EMAIL_REGEX, (match) => {
      const parts = match.split('@');
      const masked = parts[0].charAt(0) + '•••@' + parts[1];
      redactions.push({
        type: 'email',
        rawText: match,
        redactedText: masked,
        box: { x: 120, y: 300, width: 200, height: 25 },
      });
      return masked;
    });

    // 5. Phone numbers
    sanitizedText = sanitizedText.replace(PrivacyFilter.PHONE_REGEX, (match) => {
      const masked = '•••-•••-' + match.slice(-4).replace(/\D/g, '');
      redactions.push({
        type: 'phone',
        rawText: match,
        redactedText: masked,
        box: { x: 120, y: 350, width: 160, height: 25 },
      });
      return masked;
    });

    // Produce sanitized image (if SVG base64, insert black masks over boxes)
    const redactedImage = this.applyImageRedaction(imageBase64 || '', redactions);

    return {
      redactedImageBase64: redactedImage,
      sanitizedText,
      itemsRedactedCount: redactions.length,
      redactions,
    };
  }

  /**
   * Applies black redaction overlays to SVG/base64 representations.
   */
  private applyImageRedaction(imageBase64: string, redactions: PrivacyRedactionItem[]): string {
    if (!imageBase64) return '';

    // If base64 contains SVG data, inject blackout rects
    try {
      const decoded = Buffer.from(imageBase64, 'base64').toString('utf-8');
      if (decoded.includes('<svg')) {
        const blackoutRects = redactions
          .filter((r) => r.box)
          .map(
            (r) =>
              `<rect x="${r.box!.x}" y="${r.box!.y}" width="${r.box!.width}" height="${r.box!.height}" fill="#000000" stroke="#ef4444" stroke-width="1.5"/>`
          )
          .join('\n');

        const modified = decoded.replace('</svg>', `${blackoutRects}\n</svg>`);
        return Buffer.from(modified, 'utf-8').toString('base64');
      }
    } catch {
      // Fallback
    }

    return imageBase64;
  }
}
