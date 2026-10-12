/**
 * JARVIS Phase 8 - Multi-Source Synthesis & Comparison
 * Compares two or more research sources, extracts points of agreement/contradiction,
 * detects consensus level, and computes cross-evidence summaries.
 */

import { ResearchSource, SourceComparison } from './research.interface.js';

export class SourceComparator {
  /**
   * Compares 2 or more research sources and outputs synthesis, agreements, contradictions, and consensus level.
   */
  public compareSources(sources: ResearchSource[]): SourceComparison {
    if (!sources || sources.length < 2) {
      throw new Error('At least 2 sources are required for source comparison.');
    }

    const sourceIds = sources.map((s) => s.id);
    const allSnippets = sources.flatMap((s) => s.snippets);

    // Extract word frequencies across sources to detect shared themes
    const sourceWordSets = sources.map((s) => {
      const text = `${s.title} ${s.abstract || ''} ${s.snippets.join(' ')}`.toLowerCase();
      return new Set(
        text
          .replace(/[^a-z0-9\s]/g, '')
          .split(/\s+/)
          .filter((w) => w.length > 4)
      );
    });

    // Find intersection words (common terms present in all sources)
    const commonTerms = Array.from(sourceWordSets[0]).filter((term) =>
      sourceWordSets.every((set) => set.has(term))
    );

    const pointsOfAgreement: string[] = [];
    const pointsOfContradiction: string[] = [];
    const uniquePerspectives: Record<string, string[]> = {};

    // Determine points of agreement from shared themes
    if (commonTerms.length > 0) {
      pointsOfAgreement.push(
        `All examined sources concord on foundational thematic concepts: ${commonTerms.slice(0, 5).join(', ')}.`
      );
    } else {
      pointsOfAgreement.push(
        'Sources examine adjacent aspects of the target topic with differing core terminologies.'
      );
    }

    // Check for contradictory sentiment or contrasting indicators
    const contradictionKeywords = ['however', 'contrary', 'differs', 'disputes', 'fails to replicate', 'unlike', 'in contrast'];
    const contrastingSnippets = allSnippets.filter((snip) =>
      contradictionKeywords.some((kw) => snip.toLowerCase().includes(kw))
    );

    if (contrastingSnippets.length > 0) {
      pointsOfContradiction.push(
        `Divergence detected in methodology or findings: "${contrastingSnippets[0].substring(0, 120)}..."`
      );
    } else {
      // Check year or metric differences
      const years = sources.map((s) => s.publishedYear).filter((y): y is number => y !== undefined);
      if (years.length >= 2 && Math.max(...years) - Math.min(...years) > 5) {
        pointsOfContradiction.push(
          `Temporal disparity: Sources span from ${Math.min(...years)} to ${Math.max(...years)}, reflecting evolving paradigms over time.`
        );
      }
    }

    // Extract unique perspective per source
    sources.forEach((s) => {
      uniquePerspectives[s.id] = [
        `Focuses on ${s.sourceType} evidence (Credibility Score: ${(s.credibilityScore * 100).toFixed(0)}%).`,
        s.snippets[0] ? `Key contribution: "${s.snippets[0].substring(0, 100)}..."` : `Published by ${s.publisher || 'independent literature'}.`,
      ];
    });

    // Consensus determination
    let consensusLevel: SourceComparison['consensusLevel'] = 'MODERATE_CONSENSUS';
    if (pointsOfContradiction.length === 0 && commonTerms.length >= 4) {
      consensusLevel = 'STRONG_CONSENSUS';
    } else if (contrastingSnippets.length > 1) {
      consensusLevel = 'CONTESTED';
    } else if (commonTerms.length === 0) {
      consensusLevel = 'NO_CONSENSUS';
    }

    const summary = `Synthesized ${sources.length} sources (${sources.map((s) => `"${s.title}"`).join(', ')}). Overall consensus level: ${consensusLevel.replace('_', ' ')}. Found ${pointsOfAgreement.length} point(s) of alignment and ${pointsOfContradiction.length} point(s) of divergence.`;

    return {
      sourceIds,
      pointsOfAgreement,
      pointsOfContradiction,
      uniquePerspectives,
      consensusLevel,
      summary,
    };
  }
}
