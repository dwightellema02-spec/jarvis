import { describe, it, expect } from 'vitest';
import { TextParser } from '../../src/documents/parsers/text-parser.js';
import { ResearchPaperParser } from '../../src/documents/parsers/research-paper-parser.js';
import { DocumentMetadata } from '../../src/documents/document.interface.js';

describe('Text & Research Paper Parsers Tests', () => {
  const mockMetadata: DocumentMetadata = {
    id: 'doc_test_1',
    filename: 'let_study_notes.md',
    fileType: 'txt',
    mimeType: 'text/markdown',
    sizeBytes: 1024,
    checksum: 'mock_checksum',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  it('parses structured markdown notes with sections and inline tables', () => {
    const markdown = `# LET Licensure Review Notes

## Professional Education
Foundations of education include behaviorism, cognitivism, and constructivism. Key principles date back to 2024-03-15.
Contact tutor at dwight.reviewer@example.com for questions or see https://prc.gov.ph for schedules.

## Specialization: Mathematics
Advanced calculus and differential equations require rigorous proof techniques.

| Subject | Weight | Status |
|---|---|---|
| General Ed | 20% | Reviewing |
| Professional Ed | 40% | Mastered |
| Majorship Math | 40% | In Progress |
`;

    const parsed = TextParser.parse(markdown, mockMetadata);

    expect(parsed.metadata.title).toBe('LET Licensure Review Notes');
    expect(parsed.sections.length).toBeGreaterThanOrEqual(2);
    expect(parsed.sections.some((s) => s.title.includes('Professional Education'))).toBe(true);

    // Check entity extraction
    expect(parsed.entities.emails).toContain('dwight.reviewer@example.com');
    expect(parsed.entities.urls).toContain('https://prc.gov.ph');
    expect(parsed.entities.dates.length).toBeGreaterThan(0);

    // Check embedded table extraction
    expect(parsed.tables.length).toBe(1);
    expect(parsed.tables[0].headers).toEqual(['Subject', 'Weight', 'Status']);
    expect(parsed.tables[0].rowCount).toBe(3);
  });

  it('parses academic research papers, identifies standard IMRaD sections and extracts citations', () => {
    const paperText = `# Adaptive Pedagogical Framework for Philippine STEM Education

Abstract
This research investigates personalized learning algorithms in mathematics education. As shown by previous studies [1], adaptive mastery yields substantial gains [2, 3].

Introduction
Traditional classroom methods often struggle with differentiated learning paces (Vaswani et al., 2017).

Methodology
We evaluated 250 students across three cohorts using Socratic prompt trees and real-time step verification.

Results
Average student diagnostic scores increased by 28.5% over the 12-week intervention.

Conclusion
Personalized educational scaffolding significantly accelerates mathematical problem solving.

References
[1] Bloom, B. S. (1984). The 2 Sigma Problem.
[2] Brown, J. S. et al. (2020). Intelligent Tutoring Systems.
`;

    const paperMeta: DocumentMetadata = {
      ...mockMetadata,
      filename: 'thesis_draft.txt',
      fileType: 'paper',
    };

    const parsed = ResearchPaperParser.parse(paperText, paperMeta);

    expect(parsed.metadata.title).toBe('Adaptive Pedagogical Framework for Philippine STEM Education');
    expect(parsed.sections.some((s) => s.title === 'Abstract')).toBe(true);
    expect(parsed.sections.some((s) => s.title === 'Introduction')).toBe(true);
    expect(parsed.sections.some((s) => s.title === 'Methodology')).toBe(true);
    expect(parsed.sections.some((s) => s.title === 'Results')).toBe(true);
    expect(parsed.sections.some((s) => s.title === 'Conclusion')).toBe(true);

    // Check extracted citations
    expect(parsed.citations).toContain('[1]');
    expect(parsed.citations).toContain('[2, 3]');
    expect(parsed.citations).toContain('(Vaswani et al., 2017)');
  });
});
