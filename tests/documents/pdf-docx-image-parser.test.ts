import { describe, it, expect } from 'vitest';
import zlib from 'node:zlib';
import { PdfParser } from '../../src/documents/parsers/pdf-parser.js';
import { DocxParser } from '../../src/documents/parsers/docx-parser.js';
import { ImageMetadataParser } from '../../src/documents/parsers/image-metadata-parser.js';
import { DocumentMetadata } from '../../src/documents/document.interface.js';

describe('PDF, DOCX, & Image Parsers Tests', () => {
  const mockMeta: DocumentMetadata = {
    id: 'doc_test_binary',
    filename: 'document.pdf',
    fileType: 'pdf',
    mimeType: 'application/pdf',
    sizeBytes: 512,
    checksum: 'mock_checksum',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  it('extracts digital text streams from PDF buffer', () => {
    // Construct a synthetic digital PDF stream
    const streamContent = 'BT /F1 12 Tf (JARVIS Personal Assistant Architecture) Tj ET';
    const compressed = zlib.deflateSync(Buffer.from(streamContent, 'utf-8'));

    const fakePdf = Buffer.concat([
      Buffer.from('%PDF-1.4\n1 0 obj\n<< /Type /Page >>\nendobj\n2 0 obj\n<< /Filter /FlateDecode >>\nstream\n', 'binary'),
      compressed,
      Buffer.from('\nendstream\nendobj\n%%EOF', 'binary'),
    ]);

    const parsed = PdfParser.parse(fakePdf, mockMeta);

    expect(parsed.rawText).toContain('JARVIS Personal Assistant Architecture');
    expect(parsed.isScanned).toBe(false);
    expect(parsed.sections.length).toBeGreaterThan(0);
  });

  it('detects scanned PDF without digital text and reports honest limitation', () => {
    const scannedPdf = Buffer.from('%PDF-1.4\n1 0 obj\n<< /Type /Page >>\nendobj\n%%EOF', 'binary');
    const parsed = PdfParser.parse(scannedPdf, mockMeta);

    expect(parsed.isScanned).toBe(true);
    expect(parsed.warnings).toBeDefined();
    expect(parsed.warnings?.[0]).toContain('OCR');
  });

  it('parses DOCX document XML paragraphs and tables', () => {
    const fakeDocxXml = `<?xml version="1.0" encoding="UTF-8"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p><w:pPr><w:pStyle w:val="Heading1"/></w:pPr><w:r><w:t>System Overview</w:t></w:r></w:p>
    <w:p><w:r><w:t>JARVIS is configured with multi-agent orchestration and strict security permissions.</w:t></w:r></w:p>
    <w:tbl>
      <w:tr>
        <w:tc><w:p><w:r><w:t>Component</w:t></w:r></w:p></w:tc>
        <w:tc><w:p><w:r><w:t>Status</w:t></w:r></w:p></w:tc>
      </w:tr>
      <w:tr>
        <w:tc><w:p><w:r><w:t>Core</w:t></w:r></w:p></w:tc>
        <w:tc><w:p><w:r><w:t>Active</w:t></w:r></w:p></w:tc>
      </w:tr>
    </w:tbl>
  </w:body>
</w:document>`;

    const docxMeta: DocumentMetadata = {
      ...mockMeta,
      filename: 'architecture.docx',
      fileType: 'docx',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    };

    const parsed = DocxParser.parse(Buffer.from(fakeDocxXml, 'utf-8'), docxMeta);

    expect(parsed.rawText).toContain('System Overview');
    expect(parsed.rawText).toContain('multi-agent orchestration');
    expect(parsed.tables.length).toBe(1);
    expect(parsed.tables[0].headers).toEqual(['Component', 'Status']);
    expect(parsed.tables[0].rows[0]).toEqual(['Core', 'Active']);
  });

  it('extracts image binary dimensions for PNG header', () => {
    // Construct valid 8-byte PNG signature + IHDR chunk (16-byte header: width=800, height=600)
    const pngHeader = Buffer.alloc(24);
    pngHeader[0] = 0x89;
    pngHeader[1] = 0x50; // P
    pngHeader[2] = 0x4e; // N
    pngHeader[3] = 0x47; // G
    pngHeader[4] = 0x0d;
    pngHeader[5] = 0x0a;
    pngHeader[6] = 0x1a;
    pngHeader[7] = 0x0a;
    pngHeader.writeUInt32BE(800, 16); // width
    pngHeader.writeUInt32BE(600, 20); // height

    const imgMeta: DocumentMetadata = {
      ...mockMeta,
      filename: 'diagram.png',
      fileType: 'image',
      mimeType: 'image/png',
    };

    const parsed = ImageMetadataParser.parse(pngHeader, imgMeta);

    expect(parsed.metadata.mimeType).toBe('image/png');
    expect(parsed.rawText).toContain('800x600 px');
  });
});
