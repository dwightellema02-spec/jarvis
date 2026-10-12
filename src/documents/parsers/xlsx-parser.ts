import zlib from 'node:zlib';
import {
  ParsedDocument,
  DocumentMetadata,
  ParsedTable,
} from '../document.interface.js';
import { CsvParser } from './csv-parser.js';

export class XlsxParser {
  /**
   * Pure Node.js XLSX OpenXML spreadsheet parser.
   * Extracts sheet1.xml and sharedStrings.xml from the PKZIP container.
   */
  public static parse(buffer: Buffer, metadata: DocumentMetadata): ParsedDocument {
    const sharedStringsXml = this.extractZipEntry(buffer, 'xl/sharedStrings.xml');
    const sheetXml = this.extractZipEntry(buffer, 'xl/worksheets/sheet1.xml');

    if (!sheetXml) {
      // Fallback: check if the buffer is a CSV or TSV spreadsheet text
      const rawText = buffer.toString('utf-8');
      const table = CsvParser.parse(rawText, { tableName: metadata.filename });
      return {
        metadata: {
          ...metadata,
          fileType: 'xlsx',
          rowCount: table.rowCount,
          columnCount: table.columnCount,
        },
        rawText,
        sections: [
          {
            id: 'sec_1',
            title: table.name || 'Sheet 1',
            content: `Spreadsheet table containing ${table.rowCount} rows and ${table.columnCount} columns.`,
          },
        ],
        tables: [table],
        entities: { dates: [], numbers: [], emails: [], urls: [], keyTerms: [] },
      };
    }

    const sharedStrings = sharedStringsXml ? this.parseSharedStrings(sharedStringsXml) : [];
    const table = this.parseWorksheetXml(sheetXml, sharedStrings, metadata.filename);

    const summaryText = `Spreadsheet ${metadata.filename}: ${table.rowCount} rows, ${table.columnCount} columns (${table.headers.join(', ')}).`;

    return {
      metadata: {
        ...metadata,
        fileType: 'xlsx',
        rowCount: table.rowCount,
        columnCount: table.columnCount,
      },
      rawText: summaryText,
      sections: [
        {
          id: 'sec_sheet1',
          title: 'Sheet 1',
          content: summaryText,
        },
      ],
      tables: [table],
      entities: { dates: [], numbers: [], emails: [], urls: [], keyTerms: [] },
    };
  }

  private static parseSharedStrings(xml: string): string[] {
    const strings: string[] = [];
    const siRegex = /<si[\s\S]*?<\/si>/g;
    let match: RegExpExecArray | null;

    while ((match = siRegex.exec(xml)) !== null) {
      const siContent = match[0];
      const tRegex = /<t(?:\s+[^>]*)?>([\s\S]*?)<\/t>/g;
      const textParts: string[] = [];
      let tMatch: RegExpExecArray | null;

      while ((tMatch = tRegex.exec(siContent)) !== null) {
        textParts.push(this.decodeXmlEntities(tMatch[1]));
      }

      strings.push(textParts.join(''));
    }

    return strings;
  }

  private static parseWorksheetXml(
    xml: string,
    sharedStrings: string[],
    tableName: string
  ): ParsedTable {
    const rowRegex = /<row\b[^>]*>([\s\S]*?)<\/row>/g;
    const grid: string[][] = [];
    let rMatch: RegExpExecArray | null;

    while ((rMatch = rowRegex.exec(xml)) !== null) {
      const rowContent = rMatch[1];
      const cellRegex = /<c\b([^>]*)>([\s\S]*?)<\/c>/g;
      const cells: string[] = [];
      let cMatch: RegExpExecArray | null;

      while ((cMatch = cellRegex.exec(rowContent)) !== null) {
        const cellAttrs = cMatch[1];
        const cellBody = cMatch[2];

        const isSharedString = /t="s"/i.test(cellAttrs);
        const valMatch = cellBody.match(/<v>([\s\S]*?)<\/v>/);

        if (valMatch) {
          const val = valMatch[1].trim();
          if (isSharedString) {
            const strIdx = parseInt(val, 10);
            cells.push(sharedStrings[strIdx] ?? '');
          } else {
            cells.push(val);
          }
        } else {
          cells.push('');
        }
      }

      if (cells.length > 0) {
        grid.push(cells);
      }
    }

    if (grid.length === 0) {
      return {
        id: `tbl_${Date.now()}`,
        name: tableName,
        headers: [],
        rows: [],
        rowCount: 0,
        columnCount: 0,
        columnTypes: {},
      };
    }

    const csvContent = grid
      .map((row) => row.map((c) => `"${c.replace(/"/g, '""')}"`).join(','))
      .join('\n');

    return CsvParser.parse(csvContent, { tableName });
  }

  private static decodeXmlEntities(str: string): string {
    return str
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'");
  }

  private static extractZipEntry(buffer: Buffer, targetEntryName: string): string | null {
    let offset = 0;

    while (offset < buffer.length - 4) {
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
              const decompressed = zlib.inflateRawSync(compressedData);
              return decompressed.toString('utf-8');
            } else if (compressionMethod === 0) {
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
