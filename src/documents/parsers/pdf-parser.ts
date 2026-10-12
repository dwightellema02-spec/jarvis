import zlib from 'node:zlib';
import {
  DocumentSection,
  ParsedDocument,
  DocumentMetadata,
} from '../document.interface.js';
import { TextParser } from './text-parser.js';

export class PdfParser {
  /**
   * Pure Node.js digital PDF text and structure parser.
   * Extracts text streams (supporting /FlateDecode decompression via zlib),
   * decodes font operators (Tj, TJ, '), estimates page count and sections.
   * If PDF contains no text objects (scanned document), honestly flags isScanned: true.
   */
  public static parse(buffer: Buffer, metadata: DocumentMetadata): ParsedDocument {
    const rawBinary = buffer.toString('binary');

    // 1. Estimate page count from /Type /Page occurrences
    const pageMatches = rawBinary.match(/\/Type\s*\/Page\b/g) || [];
    const estimatedPages = Math.max(pageMatches.length, 1);

    // 2. Extract and decompress streams
    const extractedTextParts: string[] = [];
    const streamRegex = /stream[\r\n]+([\s\S]*?)[\r\n]+endstream/g;

    let match: RegExpExecArray | null;
    while ((match = streamRegex.exec(rawBinary)) !== null) {
      const streamDataBinary = match[1];
      const streamBuf = Buffer.from(streamDataBinary, 'binary');

      // Attempt zlib decompression for /FlateDecode streams
      let decompressed: string | null = null;
      try {
        const inflated = zlib.inflateSync(streamBuf);
        decompressed = inflated.toString('utf-8');
      } catch {
        // May be uncompressed stream or non-deflate
        decompressed = streamBuf.toString('utf-8');
      }

      if (decompressed && (decompressed.includes('BT') || decompressed.includes('Tj') || decompressed.includes('TJ'))) {
        const textFromStream = this.extractTextFromPdfStream(decompressed);
        if (textFromStream.trim().length > 0) {
          extractedTextParts.push(textFromStream);
        }
      }
    }

    // Fallback: If no streams had text operators, inspect literal text in binary
    if (extractedTextParts.length === 0) {
      const literalMatches = rawBinary.match(/\(([^()]{3,})\)\s*Tj/g);
      if (literalMatches && literalMatches.length > 0) {
        for (const lit of literalMatches) {
          const clean = lit.replace(/^\(/, '').replace(/\)\s*Tj$/, '');
          extractedTextParts.push(clean);
        }
      }
    }

    const fullText = extractedTextParts.join('\n\n').trim();
    const isScanned = fullText.length === 0;

    const warnings: string[] = [];
    if (isScanned) {
      warnings.push('Scanned PDF detected without digital text streams. Full text extraction requires an OCR engine.');
    }

    const sections: DocumentSection[] = isScanned
      ? [
          {
            id: 'sec_1',
            title: 'Scanned Document Notice',
            content: 'This document contains raster image pages without digital text streams. OCR is required for textual parsing.',
          },
        ]
      : this.segmentIntoSections(fullText);

    const entities = TextParser.extractEntities(fullText);

    return {
      metadata: {
        ...metadata,
        fileType: 'pdf',
        pageCount: estimatedPages,
        title: metadata.title || this.extractPdfTitle(rawBinary, metadata.filename),
      },
      rawText: fullText,
      sections,
      tables: [],
      entities,
      isScanned,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  private static extractPdfTitle(rawBinary: string, defaultName: string): string {
    const titleMatch = rawBinary.match(/\/Title\s*\(([^)]+)\)/i);
    if (titleMatch && titleMatch[1]) {
      return titleMatch[1].trim();
    }
    return defaultName.replace(/\.pdf$/i, '');
  }

  private static extractTextFromPdfStream(streamContent: string): string {
    const lines: string[] = [];
    // Match BT ... ET blocks
    const btRegex = /BT[\s\S]*?ET/g;
    let btMatch: RegExpExecArray | null;

    while ((btMatch = btRegex.exec(streamContent)) !== null) {
      const block = btMatch[0];

      // Match (text) Tj
      const tjRegex = /\(([^)]*)\)\s*Tj/g;
      let tjMatch: RegExpExecArray | null;
      while ((tjMatch = tjRegex.exec(block)) !== null) {
        lines.push(this.decodePdfString(tjMatch[1]));
      }

      // Match [(text) -100 (more text)] TJ
      const tjArrayRegex = /\[([\s\S]*?)\]\s*TJ/g;
      let arrayMatch: RegExpExecArray | null;
      while ((arrayMatch = tjArrayRegex.exec(block)) !== null) {
        const inner = arrayMatch[1];
        const innerStrings = inner.match(/\(([^)]*)\)/g) || [];
        const combined = innerStrings.map((s) => this.decodePdfString(s.slice(1, -1))).join('');
        if (combined.trim()) {
          lines.push(combined);
        }
      }
    }

    return lines.join(' ');
  }

  private static decodePdfString(str: string): string {
    return str
      .replace(/\\n/g, '\n')
      .replace(/\\r/g, '\r')
      .replace(/\\t/g, '\t')
      .replace(/\\\(/g, '(')
      .replace(/\\\)/g, ')')
      .replace(/\\\\/g, '\\');
  }

  private static segmentIntoSections(text: string): DocumentSection[] {
    const paragraphs = text.split(/\n{2,}/);
    const sections: DocumentSection[] = [];

    let currentTitle = 'Section 1';
    let currentContent: string[] = [];
    let secIdx = 1;

    for (const p of paragraphs) {
      const trimmed = p.trim();
      if (!trimmed) continue;

      if (trimmed.length < 80 && /^[A-Z0-9\s:_-]{3,80}$/.test(trimmed)) {
        if (currentContent.length > 0) {
          sections.push({
            id: `sec_${secIdx++}`,
            title: currentTitle,
            content: currentContent.join('\n\n'),
          });
          currentContent = [];
        }
        currentTitle = trimmed;
      } else {
        currentContent.push(trimmed);
      }
    }

    if (currentContent.length > 0 || sections.length === 0) {
      sections.push({
        id: `sec_${secIdx}`,
        title: currentTitle,
        content: currentContent.join('\n\n'),
      });
    }

    return sections;
  }
}
