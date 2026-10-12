/**
 * JARVIS Phase 8 - Research Engine Interfaces
 * Defines types for epistemic classification, sources, citations, literature organization,
 * research questions, and evidence synthesis.
 */

export type EpistemicCategory = 'FACT' | 'CLAIM' | 'OPINION' | 'INFERENCE' | 'UNCERTAINTY';

export type SourceType =
  | 'peer_reviewed'
  | 'pre_print'
  | 'academic_institution'
  | 'government'
  | 'news'
  | 'blog'
  | 'unknown';

export interface ResearchSource {
  id: string;
  url?: string;
  title: string;
  authors: string[];
  publishedYear?: number;
  publisher?: string;
  doi?: string;
  sourceType: SourceType;
  credibilityScore: number; // 0.0 to 1.0
  abstract?: string;
  snippets: string[];
  accessedAt: string;
}

export interface EpistemicStatement {
  id: string;
  text: string;
  category: EpistemicCategory;
  confidence: number; // 0.0 to 1.0
  evidenceSources?: string[];
  hedgingIndicators?: string[];
  rationale: string;
}

export type CitationFormat = 'APA' | 'IEEE' | 'CHICAGO' | 'HARVARD' | 'BIBTEX';

export interface FormattedCitation {
  sourceId: string;
  format: CitationFormat;
  citationString: string;
}

export type ResearchQuestionFramework = 'PICO' | 'FINER' | 'STANDARD';

export interface ResearchQuestion {
  id: string;
  framework: ResearchQuestionFramework;
  primaryQuestion: string;
  subQuestions: string[];
  variables: {
    independent?: string;
    dependent?: string;
    moderating?: string[];
  };
  picoBreakdown?: {
    population: string;
    intervention: string;
    comparison: string;
    outcome: string;
  };
  hypotheses: {
    nullHypothesis: string;
    alternativeHypothesis: string;
  };
  finerAssessment: {
    feasible: boolean;
    interesting: boolean;
    novel: boolean;
    ethical: boolean;
    relevant: boolean;
    notes: string;
  };
}

export interface SourceComparison {
  sourceIds: string[];
  pointsOfAgreement: string[];
  pointsOfContradiction: string[];
  uniquePerspectives: Record<string, string[]>;
  consensusLevel: 'STRONG_CONSENSUS' | 'MODERATE_CONSENSUS' | 'CONTESTED' | 'NO_CONSENSUS';
  summary: string;
}

export interface ResearchNote {
  id: string;
  title: string;
  topic: string;
  projectId?: string;
  sources: ResearchSource[];
  epistemicBreakdown: {
    totalStatements: number;
    counts: Record<EpistemicCategory, number>;
    statements: EpistemicStatement[];
  };
  citations: FormattedCitation[];
  synthesisMarkdown: string;
  createdAt: string;
  updatedAt: string;
}
