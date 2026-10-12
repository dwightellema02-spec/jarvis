import {
  DocumentSection,
  ExtractedEntities,
  ParsedTable,
  ParsedDocument,
  DocumentMetadata,
} from '../document.interface.js';
import { CsvParser } from './csv-parser.js';

export class TextParser {
  public static parse(content: string, metadata: DocumentMetadata): ParsedDocument {
    const rawText = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const sections = this.extractSections(rawText);
    const tables = this.extractMarkdownTables(rawText);
    const entities = this.extractEntities(rawText);

    return {
      metadata: {
        ...metadata,
        title: metadata.title || this.extractTitle(rawText, metadata.filename),
      },
      rawText,
      sections,
      tables,
      entities,
    };
  }

  private static extractTitle(text: string, defaultName: string): string {
    const lines = text.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
    for (const line of lines.slice(0, 5)) {
      if (line.startsWith('# ')) {
        return line.substring(2).trim();
      }
      if (/^[A-Z0-9\s\-_:]{4,60}$/.test(line)) {
        return line;
      }
    }
    return defaultName.replace(/\.[^/.]+$/, '');
  }

  private static extractSections(text: string): DocumentSection[] {
    const lines = text.split('\n');
    const sections: DocumentSection[] = [];

    let currentTitle = 'Overview';
    let currentContent: string[] = [];
    let sectionIdx = 1;

    for (const line of lines) {
      const trimmed = line.trim();
      const isHeader =
        /^#{1,3}\s+(.+)$/.test(trimmed) ||
        /^[A-Z][A-Z0-9\s\-_]{3,40}:$/.test(trimmed) ||
        (currentContent.length > 0 && /^[=-]{3,}$/.test(trimmed));

      if (isHeader) {
        if (currentContent.length > 0) {
          sections.push({
            id: `sec_${sectionIdx++}`,
            title: currentTitle,
            content: currentContent.join('\n').trim(),
          });
          currentContent = [];
        }

        const match = trimmed.match(/^#{1,3}\s+(.+)$/);
        currentTitle = match ? match[1].trim() : trimmed.replace(/:$/, '').trim();
      } else {
        currentContent.push(line);
      }
    }

    if (currentContent.length > 0 || sections.length === 0) {
      sections.push({
        id: `sec_${sectionIdx}`,
        title: currentTitle,
        content: currentContent.join('\n').trim(),
      });
    }

    return sections.filter((s) => s.content.length > 0 || s.title !== 'Overview');
  }

  private static extractMarkdownTables(text: string): ParsedTable[] {
    const tables: ParsedTable[] = [];
    const lines = text.split('\n');

    let inTable = false;
    let tableLines: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        inTable = true;
        tableLines.push(trimmed);
      } else {
        if (inTable && tableLines.length >= 2) {
          const parsed = this.parseMarkdownTableLines(tableLines);
          if (parsed) tables.push(parsed);
        }
        inTable = false;
        tableLines = [];
      }
    }

    if (inTable && tableLines.length >= 2) {
      const parsed = this.parseMarkdownTableLines(tableLines);
      if (parsed) tables.push(parsed);
    }

    return tables;
  }

  private static parseMarkdownTableLines(lines: string[]): ParsedTable | null {
    // Filter out separator lines like |---|---|
    const cleanLines = lines.filter((l) => !/^\|(\s*:?-+:?\s*\|)+$/.test(l));
    if (cleanLines.length === 0) return null;

    // Convert to CSV string
    const csvRows = cleanLines.map((line) => {
      const cells = line
        .slice(1, -1)
        .split('|')
        .map((c) => `"${c.trim().replace(/"/g, '""')}"`);
      return cells.join(',');
    });

    const csvContent = csvRows.join('\n');
    return CsvParser.parse(csvContent, { tableName: 'Embedded Table' });
  }

  public static extractEntities(text: string): ExtractedEntities {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const urlRegex = /https?:\/\/[^\s$.?#].[^\s]*/gi;
    const dateRegex = /\b(\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{2,4}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2},? \d{4})\b/gi;
    const numberRegex = /\b(\d+(?:,\d{3})*(?:\.\d+)?)\s*([a-zA-Z%]+)?\b/g;

    const emails = Array.from(new Set(text.match(emailRegex) || []));
    const urls = Array.from(new Set(text.match(urlRegex) || []));
    const dates = Array.from(new Set(text.match(dateRegex) || []));

    const numbers: { value: number; unit?: string; raw: string }[] = [];
    let numMatch: RegExpExecArray | null;
    while ((numMatch = numberRegex.exec(text)) !== null) {
      const rawNum = numMatch[1].replace(/,/g, '');
      const val = Number(rawNum);
      if (!isNaN(val)) {
        numbers.push({
          value: val,
          unit: numMatch[2] || undefined,
          raw: numMatch[0],
        });
      }
      if (numbers.length >= 20) break; // Cap extraction
    }

    // Extract significant terms (capitalized multi-word phrases or frequent key concepts)
    const termRegex = /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+\b/g;
    const keyTerms = Array.from(new Set(text.match(termRegex) || [])).slice(0, 15);

    return {
      dates,
      numbers,
      emails,
      urls,
      keyTerms,
    };
  }
}
