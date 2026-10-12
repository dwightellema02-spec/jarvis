/**
 * JARVIS Phase 8 - Epistemic Classifier
 * Distinguishes Fact, Claim, Opinion, Inference, and Uncertainty
 * with linguistic pattern matching and evidence grading.
 */

import { EpistemicCategory, EpistemicStatement } from './research.interface.js';

export class EpistemicClassifier {
  private readonly uncertaintyHedgingWords = [
    'possibly',
    'perhaps',
    'might',
    'may',
    'it is unclear',
    'could potentially',
    'remains ambiguous',
    'further research is needed',
    'inconclusive',
    'tentatively',
    'speculative',
    'likely',
    'unlikely',
    'plausibly',
    'uncertain',
    'disputed',
    'cannot be determined',
    'approximate',
  ];

  private readonly opinionNormativeWords = [
    'best',
    'worst',
    'should',
    'ought to',
    'must be considered',
    'in my view',
    'undesirable',
    'preferable',
    'beautiful',
    'terrible',
    'superior',
    'inferior',
    'subjectively',
    'unacceptable',
    'disappointing',
    'impressive',
    'admirable',
    'immoral',
    'moral',
  ];

  private readonly inferenceLogicalWords = [
    'therefore',
    'thus',
    'consequently',
    'implies that',
    'as a result',
    'we can deduce',
    'indicates that',
    'suggests that',
    'from this we conclude',
    'hence',
    'it follows that',
    'this leads to',
    'correlates with',
    'extrapolating',
  ];

  private readonly claimAssertionWords = [
    'argue that',
    'argues that',
    'claim that',
    'claims that',
    'posit that',
    'posits that',
    'assert that',
    'asserts that',
    'purport that',
    'purports',
    'hypothesize that',
    'hypothesizes that',
    'the authors assert',
    'the authors argue',
    'the author asserts',
    'the author argues',
    'is alleged to',
    'it is believed that',
    'propose that',
    'proposes that',
    'contend that',
    'contends that',
    'states without proof',
  ];

  /**
   * Classifies a single statement into an EpistemicCategory with confidence and rationale.
   */
  public classifyStatement(text: string, id?: string): EpistemicStatement {
    const clean = text.trim();
    const lower = clean.toLowerCase();
    const stmtId = id || `stmt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    // 1. Check Uncertainty
    const hedgingFound = this.uncertaintyHedgingWords.filter((w) => lower.includes(w));
    if (hedgingFound.length > 0) {
      return {
        id: stmtId,
        text: clean,
        category: 'UNCERTAINTY',
        confidence: 0.85,
        hedgingIndicators: hedgingFound,
        rationale: `Detected epistemic hedging indicators (${hedgingFound.join(', ')}), expressing non-conclusive bounds or tentative scope.`,
      };
    }

    // 2. Check Claim (Attributions take priority over contained qualifiers)
    const claimFound = this.claimAssertionWords.filter((w) => lower.includes(w));
    if (claimFound.length > 0) {
      return {
        id: stmtId,
        text: clean,
        category: 'CLAIM',
        confidence: 0.84,
        rationale: `Presents an attribution or unproven thesis (${claimFound.join(', ')}), requiring corroboration from empirical evidence.`,
      };
    }

    // 3. Check Opinion
    const opinionFound = this.opinionNormativeWords.filter((w) => {
      const regex = new RegExp(`\\b${w}\\b`, 'i');
      return regex.test(lower);
    });
    if (opinionFound.length > 0) {
      return {
        id: stmtId,
        text: clean,
        category: 'OPINION',
        confidence: 0.88,
        rationale: `Contains normative or subjective evaluative qualifiers (${opinionFound.join(', ')}), denoting personal judgment rather than verifiable observation.`,
      };
    }

    // 4. Check Inference
    const inferenceFound = this.inferenceLogicalWords.filter((w) => lower.includes(w));
    if (inferenceFound.length > 0) {
      return {
        id: stmtId,
        text: clean,
        category: 'INFERENCE',
        confidence: 0.82,
        rationale: `Contains logical connector or deductive derivative markers (${inferenceFound.join(', ')}), deducing conclusions from underlying premise.`,
      };
    }

    // 5. Fact vs Default Claim
    // Check for empirical indicators: numbers, dates, measurements, scientific constants, citations
    const hasMeasurements = /\b\d+(?:\.\d+)?\s*(?:kg|g|m|cm|mm|km|degrees|celsius|kelvin|seconds|hours|volts|watts|hz|n)\b/i.test(clean);
    const hasYearOrDate = /\b(?:18|19|20)\d{2}\b/.test(clean);
    const hasMathematicalIdentity = /[=<>±√∫∑]/.test(clean);
    const hasExactStats = /\b\d+(?:\.\d+)?\s*%/.test(clean);

    if (hasMeasurements || hasYearOrDate || hasMathematicalIdentity || hasExactStats) {
      return {
        id: stmtId,
        text: clean,
        category: 'FACT',
        confidence: 0.92,
        rationale: 'Contains empirical measurements, verifiable historical dates, statistical values, or mathematical equality.',
      };
    }

    // If general assertion without verifiable metrics, classify as CLAIM
    return {
      id: stmtId,
      text: clean,
      category: 'CLAIM',
      confidence: 0.75,
      rationale: 'Asserts a declarative statement that requires empirical verification or citation corroboration.',
    };
  }

  /**
   * Splits a passage into sentences and returns comprehensive epistemic breakdown.
   */
  public analyzePassage(passage: string): {
    totalStatements: number;
    counts: Record<EpistemicCategory, number>;
    statements: EpistemicStatement[];
  } {
    // Regex split on punctuation followed by whitespace or line break
    const rawSentences = passage
      .split(/(?<=[.!?])\s+|\n+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 5);

    const counts: Record<EpistemicCategory, number> = {
      FACT: 0,
      CLAIM: 0,
      OPINION: 0,
      INFERENCE: 0,
      UNCERTAINTY: 0,
    };

    const statements: EpistemicStatement[] = [];

    for (let i = 0; i < rawSentences.length; i++) {
      const sentence = rawSentences[i];
      const classification = this.classifyStatement(sentence, `stmt_${i + 1}`);
      counts[classification.category]++;
      statements.push(classification);
    }

    return {
      totalStatements: statements.length,
      counts,
      statements,
    };
  }
}
