import {
  AntiHallucinationAuditResult,
  AntiHallucinationCheckRequest,
} from './verification.interface.js';

export class AntiHallucinationAuditor {
  /**
   * Evaluates claim text against ground-truth reference sources to detect
   * hallucinated facts, invented statistics, or unsubstantiated assertions.
   */
  public audit(request: AntiHallucinationCheckRequest): AntiHallucinationAuditResult {
    const { claimText, groundingSources, strictness = 'standard' } = request;

    if (!claimText || claimText.trim().length === 0) {
      return {
        passed: true,
        hallucinationRisk: 0.0,
        groundedClaimsCount: 0,
        unsupportedClaimsCount: 0,
        unsupportedClaims: [],
        citationMatches: [],
        auditNotes: 'Empty claim text passed verification by default.',
      };
    }

    if (!groundingSources || groundingSources.length === 0) {
      return {
        passed: false,
        hallucinationRisk: 1.0,
        groundedClaimsCount: 0,
        unsupportedClaimsCount: 1,
        unsupportedClaims: [claimText.slice(0, 120)],
        citationMatches: [],
        auditNotes: 'Verification failed: Zero grounding sources provided for verification gate.',
      };
    }

    // Split text into individual sentences/claims
    const rawSentences = claimText
      .split(/(?<=[.?!])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 10);

    const sentences = rawSentences.length > 0 ? rawSentences : [claimText.trim()];

    const concatenatedSources = groundingSources.join(' ').toLowerCase();
    const sourceTokens = new Set(this.tokenize(concatenatedSources));

    const unsupportedClaims: string[] = [];
    const citationMatches: Array<{ claim: string; sourceSnippet: string; score: number }> = [];

    const threshold = strictness === 'strict' ? 0.65 : strictness === 'lenient' ? 0.35 : 0.50;

    for (const sentence of sentences) {
      const sentenceTokens = this.tokenize(sentence.toLowerCase());
      if (sentenceTokens.length === 0) continue;

      // Calculate token grounding ratio
      let groundedTokenCount = 0;
      for (const t of sentenceTokens) {
        if (sourceTokens.has(t)) {
          groundedTokenCount++;
        }
      }

      const score = groundedTokenCount / sentenceTokens.length;

      // Extract best matching source snippet
      const bestSnippet = this.findBestSnippet(sentenceTokens, groundingSources);

      if (score >= threshold) {
        citationMatches.push({
          claim: sentence,
          sourceSnippet: bestSnippet,
          score: Math.round(score * 100) / 100,
        });
      } else {
        unsupportedClaims.push(sentence);
      }
    }

    const totalEvaluated = sentences.length;
    const groundedCount = citationMatches.length;
    const unsupportedCount = unsupportedClaims.length;

    const hallucinationRisk = totalEvaluated > 0
      ? Math.round((unsupportedCount / totalEvaluated) * 100) / 100
      : 0.0;

    const maxRiskAllowed = strictness === 'strict' ? 0.15 : strictness === 'lenient' ? 0.55 : 0.30;
    const passed = hallucinationRisk <= maxRiskAllowed;

    const auditNotes = passed
      ? `Audit PASSED: Hallucination risk ${hallucinationRisk * 100}% is within allowed threshold (${maxRiskAllowed * 100}%). ${groundedCount}/${totalEvaluated} claims verified.`
      : `Audit FAILED: High hallucination risk ${hallucinationRisk * 100}% exceeds allowed threshold (${maxRiskAllowed * 100}%). ${unsupportedCount} claims lack grounding evidence.`;

    return {
      passed,
      hallucinationRisk,
      groundedClaimsCount: groundedCount,
      unsupportedClaimsCount: unsupportedCount,
      unsupportedClaims,
      citationMatches,
      auditNotes,
    };
  }

  private tokenize(text: string): string[] {
    const stopWords = new Set([
      'the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'in', 'of', 'for', 'with', 'to', 'by', 'as', 'it', 'this', 'that', 'from', 'are', 'was', 'were', 'be', 'been', 'has', 'have', 'had'
    ]);
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2 && !stopWords.has(w));
  }

  private findBestSnippet(tokens: string[], sources: string[]): string {
    let bestSnippet = '';
    let maxOverlap = -1;

    for (const src of sources) {
      const srcLower = src.toLowerCase();
      let matchCount = 0;
      for (const t of tokens) {
        if (srcLower.includes(t)) {
          matchCount++;
        }
      }
      if (matchCount > maxOverlap) {
        maxOverlap = matchCount;
        bestSnippet = src.slice(0, 160) + (src.length > 160 ? '...' : '');
      }
    }

    return bestSnippet || 'No direct snippet match';
  }
}
