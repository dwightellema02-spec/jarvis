import {
  DocumentSection,
  ParsedDocument,
  DocumentMetadata,
} from '../document.interface.js';
import { TextParser } from './text-parser.js';

export class ResearchPaperParser {
  private static readonly SECTION_PATTERNS: { name: string; pattern: RegExp }[] = [
    { name: 'Abstract', pattern: /^(?:\d+\.?\s*)?abstract\b/i },
    { name: 'Introduction', pattern: /^(?:\d+\.?\s*)?introduction\b/i },
    { name: 'Related Work', pattern: /^(?:\d+\.?\s*)?(?:related\s+work|literature\s+review|background)\b/i },
    { name: 'Methodology', pattern: /^(?:\d+\.?\s*)?(?:methodology|methods|system\s+design|architecture)\b/i },
    { name: 'Results', pattern: /^(?:\d+\.?\s*)?(?:results|findings|evaluation|experiments)\b/i },
    { name: 'Discussion', pattern: /^(?:\d+\.?\s*)?discussion\b/i },
    { name: 'Conclusion', pattern: /^(?:\d+\.?\s*)?(?:conclusion|concluding\s+remarks|summary)\b/i },
    { name: 'References', pattern: /^(?:\d+\.?\s*)?(?:references|bibliography|works\s+cited)\b/i },
  ];

  public static parse(content: string, metadata: DocumentMetadata): ParsedDocument {
    const rawText = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const sections = this.extractAcademicSections(rawText);
    const citations = this.extractCitations(rawText);
    const entities = TextParser.extractEntities(rawText);

    return {
      metadata: {
        ...metadata,
        fileType: 'paper',
        title: metadata.title || this.extractPaperTitle(rawText, metadata.filename),
      },
      rawText,
      sections,
      tables: [],
      citations,
      entities,
    };
  }

  private static extractPaperTitle(text: string, defaultName: string): string {
    const lines = text.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
    for (const line of lines.slice(0, 5)) {
      if (!line.toLowerCase().startsWith('abstract') && line.length > 5 && line.length < 150) {
        return line.replace(/^#\s*/, '');
      }
    }
    return defaultName;
  }

  private static extractAcademicSections(text: string): DocumentSection[] {
    const lines = text.split('\n');
    const sections: DocumentSection[] = [];

    let currentTitle = 'Header / Metadata';
    let currentContent: string[] = [];
    let sectionIdx = 1;

    for (const line of lines) {
      const trimmed = line.trim();
      const matchedPattern = this.SECTION_PATTERNS.find((p) => p.pattern.test(trimmed));

      if (matchedPattern) {
        if (currentContent.length > 0) {
          sections.push({
            id: `sec_paper_${sectionIdx++}`,
            title: currentTitle,
            content: currentContent.join('\n').trim(),
          });
          currentContent = [];
        }
        currentTitle = matchedPattern.name;
      } else {
        currentContent.push(line);
      }
    }

    if (currentContent.length > 0) {
      sections.push({
        id: `sec_paper_${sectionIdx}`,
        title: currentTitle,
        content: currentContent.join('\n').trim(),
      });
    }

    return sections;
  }

  public static extractCitations(text: string): string[] {
    const citations: Set<string> = new Set();

    // Numeric bracket citations: [1], [1, 2], [1-3]
    const bracketRegex = /\[\d+(?:[,\-–\s]+\d+)*\]/g;
    const bracketMatches = text.match(bracketRegex) || [];
    for (const match of bracketMatches) {
      citations.add(match);
    }

    // Author-Year citations: (Smith et al., 2021) or (Vaswani, 2017)
    const authorYearRegex = /\([A-Z][a-zA-Z\s]+(?:et\s+al\.)?,\s*(?:19|20)\d{2}[a-z]?\)/g;
    const authorMatches = text.match(authorYearRegex) || [];
    for (const match of authorMatches) {
      citations.add(match);
    }

    return Array.from(citations);
  }
}
