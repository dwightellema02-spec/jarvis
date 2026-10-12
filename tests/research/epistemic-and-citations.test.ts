import { describe, it, expect } from 'vitest';
import {
  EpistemicClassifier,
  CitationEngine,
  ResearchQuestionGenerator,
  ResearchSource,
} from '../../src/research/index.js';

describe('Phase 8 - Epistemic Classifier & Citation Engine', () => {
  const classifier = new EpistemicClassifier();
  const citationEngine = new CitationEngine();
  const questionGen = new ResearchQuestionGenerator();

  describe('Epistemic Classification Discipline (Fact, Claim, Opinion, Inference, Uncertainty)', () => {
    it('should classify empirical measurements or historical dates as FACT', () => {
      const stmt1 = classifier.classifyStatement('The experiment measured a temperature increase of 4.5 degrees Celsius.');
      expect(stmt1.category).toBe('FACT');
      expect(stmt1.confidence).toBeGreaterThanOrEqual(0.9);

      const stmt2 = classifier.classifyStatement('In 2024, the pass rate was 78.5%.');
      expect(stmt2.category).toBe('FACT');
    });

    it('should classify unverified assertions as CLAIM', () => {
      const stmt = classifier.classifyStatement('The authors argue that online learning replaces traditional lecture halls.');
      expect(stmt.category).toBe('CLAIM');
    });

    it('should classify subjective normative statements as OPINION', () => {
      const stmt = classifier.classifyStatement('This curriculum is the best and most beautiful approach for all students.');
      expect(stmt.category).toBe('OPINION');
    });

    it('should classify logical deductions as INFERENCE', () => {
      const stmt = classifier.classifyStatement('Therefore, higher practice frequency implies that conceptual retention increases.');
      expect(stmt.category).toBe('INFERENCE');
    });

    it('should classify epistemic hedging as UNCERTAINTY', () => {
      const stmt = classifier.classifyStatement('It is possibly an artifact of small sample size, and further research is needed.');
      expect(stmt.category).toBe('UNCERTAINTY');
      expect(stmt.hedgingIndicators?.length).toBeGreaterThan(0);
    });

    it('should analyze full literature passage and output category counts', () => {
      const passage = `
        The study examined 450 students in 2024.
        The authors argue that scaffolding accelerates mastery.
        In our view, this method is the best pedagogical design.
        Therefore, higher retention implies that exam performance improves.
        However, the results are possibly tentative and further research is needed.
      `;
      const res = classifier.analyzePassage(passage);
      expect(res.totalStatements).toBe(5);
      expect(res.counts.FACT).toBeGreaterThanOrEqual(1);
      expect(res.counts.CLAIM).toBeGreaterThanOrEqual(1);
      expect(res.counts.OPINION).toBeGreaterThanOrEqual(1);
      expect(res.counts.INFERENCE).toBeGreaterThanOrEqual(1);
      expect(res.counts.UNCERTAINTY).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Citation Engine Formats', () => {
    const sampleSource: ResearchSource = {
      id: 'src_test_1',
      title: 'Adaptive Learning Dynamics in Modern Mathematics',
      authors: ['Dwight Rivera', 'Maria Santos'],
      publishedYear: 2025,
      publisher: 'University Press',
      doi: '10.1000/182',
      sourceType: 'peer_reviewed',
      credibilityScore: 0.96,
      snippets: ['Sample text'],
      accessedAt: new Date().toISOString(),
    };

    it('should format in APA 7th edition', () => {
      const apa = citationEngine.formatCitation(sampleSource, 'APA');
      expect(apa).toContain('Dwight Rivera & Maria Santos (2025)');
      expect(apa).toContain('*Adaptive Learning Dynamics in Modern Mathematics*');
      expect(apa).toContain('https://doi.org/10.1000/182');
    });

    it('should format in IEEE style', () => {
      const ieee = citationEngine.formatCitation(sampleSource, 'IEEE', 1);
      expect(ieee).toContain('[1]');
      expect(ieee).toContain('Dwight Rivera and Maria Santos');
      expect(ieee).toContain('"Adaptive Learning Dynamics in Modern Mathematics,"');
    });

    it('should format in Chicago style', () => {
      const chicago = citationEngine.formatCitation(sampleSource, 'CHICAGO');
      expect(chicago).toContain('Dwight Rivera and Maria Santos. "Adaptive Learning Dynamics in Modern Mathematics."');
    });

    it('should generate valid BibTeX entry', () => {
      const bibtex = citationEngine.formatCitation(sampleSource, 'BIBTEX');
      expect(bibtex).toContain('@misc{');
      expect(bibtex).toContain('author = {Dwight Rivera and Maria Santos}');
      expect(bibtex).toContain('year = {2025}');
    });
  });

  describe('Research Question Generator (PICO & FINER)', () => {
    it('should formulate structured PICO question with hypotheses', () => {
      const rq = questionGen.generateQuestion({
        topic: 'Mathematics Pedagogy',
        framework: 'PICO',
        population: 'Secondary Teacher Examinees',
        intervention: 'Scaffolded Distractor Feedback',
        comparison: 'Standard Text Study',
        outcome: 'BLEPT Mathematics Majorship Score',
      });

      expect(rq.framework).toBe('PICO');
      expect(rq.primaryQuestion).toContain('In Secondary Teacher Examinees');
      expect(rq.primaryQuestion).toContain('Scaffolded Distractor Feedback');
      expect(rq.hypotheses.nullHypothesis).toContain('H₀:');
      expect(rq.hypotheses.alternativeHypothesis).toContain('H₁:');
      expect(rq.finerAssessment.feasible).toBe(true);
      expect(rq.finerAssessment.novel).toBe(true);
    });
  });
});
