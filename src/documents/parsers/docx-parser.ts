import zlib from 'node:zlib';
import {
  DocumentSection,
  ParsedDocument,
  DocumentMetadata,
  ParsedTable,
} from '../document.interface.js';
import { TextParser } from './text-parser.js';
import { CsvParser } from './csv-parser.js';

export class DocxParser {
  /**
   * Pure Node.js DOCX parser. Reads the OpenXML PKZIP structure,
   * extracts word/document.xml, and parses paragraphs, headings, runs, and tables.
   */
  public static parse(buffer: Buffer, metadata: DocumentMetadata): ParsedDocument {
    const documentXml = this.extractZipEntry(buffer, 'word/document.xml');

    if (!documentXml) {
      // Fallback: check if the buffer is raw XML or plain text
      const rawText = buffer.toString('utf-8');
      if (rawText.includes('<w:document')) {
        return this.parseDocumentXml(rawText, metadata);
      }
      return TextParser.parse(rawText, { ...metadata, fileType: 'docx' });
    }

    return this.parseDocumentXml(documentXml, metadata);
  }

  private static parseDocumentXml(xml: string, metadata: DocumentMetadata): ParsedDocument {
    const sections: DocumentSection[] = [];
    const tables: ParsedTable[] = [];

    // Extract tables first
    const tableRegex = /<w:tbl[\s\S]*?<\/w:tbl>/g;
    let tblMatch: RegExpExecArray | null;
    let tableIndex = 1;

    while ((tblMatch = tableRegex.exec(xml)) !== null) {
      const tableXml = tblMatch[0];
      const parsedTable = this.parseTableXml(tableXml, `Table ${tableIndex++}`);
      if (parsedTable) {
        tables.push(parsedTable);
      }
    }

    // Extract paragraphs and headings
    const paragraphRegex = /<w:p[\s\S]*?<\/w:p>/g;
    let pMatch: RegExpExecArray | null;

    let currentTitle = 'Introduction';
    let currentContent: string[] = [];
    let secIdx = 1;
    const fullTextParts: string[] = [];

    while ((pMatch = paragraphRegex.exec(xml)) !== null) {
      const pXml = pMatch[0];
      const text = this.extractTextFromParagraphXml(pXml).trim();
      if (!text) continue;

      fullTextParts.push(text);

      const isHeading =
        /w:pStyle\s+w:val="Heading/i.test(pXml) ||
        (/w:b\/>/.test(pXml) && text.length < 80);

      if (isHeading) {
        if (currentContent.length > 0) {
          sections.push({
            id: `sec_docx_${secIdx++}`,
            title: currentTitle,
            content: currentContent.join('\n\n'),
          });
          currentContent = [];
        }
        currentTitle = text;
      } else {
        currentContent.push(text);
      }
    }

    if (currentContent.length > 0 || sections.length === 0) {
      sections.push({
        id: `sec_docx_${secIdx}`,
        title: currentTitle,
        content: currentContent.join('\n\n'),
      });
    }

    const fullText = fullTextParts.join('\n\n');
    const entities = TextParser.extractEntities(fullText);

    return {
      metadata: {
        ...metadata,
        fileType: 'docx',
        title: metadata.title || (sections[0]?.title !== 'Introduction' ? sections[0]?.title : metadata.filename),
      },
      rawText: fullText,
      sections,
      tables,
      entities,
    };
  }

  private static extractTextFromParagraphXml(pXml: string): string {
    const textRegex = /<w:t(?:\s+[^>]*)?>([\s\S]*?)<\/w:t>/g;
    const parts: string[] = [];
    let match: RegExpExecArray | null;
    while ((match = textRegex.exec(pXml)) !== null) {
      parts.push(this.decodeXmlEntities(match[1]));
    }
    return parts.join('');
  }

  private static parseTableXml(tblXml: string, name: string): ParsedTable | null {
    const rowRegex = /<w:tr[\s\S]*?<\/w:tr>/g;
    const rawRows: string[][] = [];
    let rMatch: RegExpExecArray | null;

    while ((rMatch = rowRegex.exec(tblXml)) !== null) {
      const rowXml = rMatch[0];
      const cellRegex = /<w:tc[\s\S]*?<\/w:tc>/g;
      const cells: string[] = [];
      let cMatch: RegExpExecArray | null;

      while ((cMatch = cellRegex.exec(rowXml)) !== null) {
        const cellXml = cMatch[0];
        const cellText = this.extractTextFromParagraphXml(cellXml).trim();
        cells.push(cellText);
      }

      if (cells.length > 0) {
        rawRows.push(cells);
      }
    }

    if (rawRows.length === 0) return null;

    const csvLines = rawRows.map((row) =>
      row.map((c) => `"${c.replace(/"/g, '""')}"`).join(',')
    );

    return CsvParser.parse(csvLines.join('\n'), { tableName: name });
  }

  private static decodeXmlEntities(str: string): string {
    return str
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'");
  }

  /**
   * Minimal PKZIP entry extractor using standard node:zlib
   */
  private static extractZipEntry(buffer: Buffer, targetEntryName: string): string | null {
    let offset = 0;

    while (offset < buffer.length - 4) {
      // Check for Local File Header Signature: 0x04034b50 ('PK\x03\x04')
      if (
        buffer[offset] === 0x50 &&
        buffer[offset + 1] === 0x4b &&
        buffer[offset + 2] === 0x03 &&
        buffer[offset + 3] === 0x04
      ) {
        const compressionMethod = buffer.readUInt16LE(offset + 8);
        const compressedSize = buffer.readUInt32LE(offset + 18);
        const fileNameLength = buffer.readUInt16LE(offset + 26);
        const extraFieldLength = buffer.readUInt16LE(offset + 28);

        const fileNameStart = offset + 30;
        const fileName = buffer.toString('utf-8', fileNameStart, fileNameStart + fileNameLength);

        const dataStart = fileNameStart + fileNameLength + extraFieldLength;

        if (fileName === targetEntryName && compressedSize > 0) {
          const compressedData = buffer.subarray(dataStart, dataStart + compressedSize);
          try {
            if (compressionMethod === 8) {
              // Deflate compression
              const decompressed = zlib.inflateRawSync(compressedData);
              return decompressed.toString('utf-8');
            } else if (compressionMethod === 0) {
              // Stored (no compression)
              return compressedData.toString('utf-8');
            }
          } catch {
            return null;
          }
        }

        offset = dataStart + compressedSize;
      } else {
        offset++;
      }
    }

    return null;
  }
}
