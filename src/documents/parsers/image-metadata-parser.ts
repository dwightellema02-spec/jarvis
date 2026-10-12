import {
  ParsedDocument,
  DocumentMetadata,
} from '../document.interface.js';

export class ImageMetadataParser {
  public static parse(buffer: Buffer, metadata: DocumentMetadata): ParsedDocument {
    const dimensions = this.extractImageDimensions(buffer);
    const mimeType = this.detectImageMime(buffer) || metadata.mimeType || 'image/png';

    const desc = `Image Asset: ${metadata.filename} (${mimeType}, ${buffer.length} bytes${
      dimensions ? `, ${dimensions.width}x${dimensions.height} px` : ''
    })`;

    return {
      metadata: {
        ...metadata,
        fileType: 'image',
        mimeType,
        title: metadata.title || metadata.filename,
      },
      rawText: desc,
      sections: [
        {
          id: 'sec_image_info',
          title: 'Image Metadata',
          content: desc,
        },
      ],
      tables: [],
      entities: { dates: [], numbers: [], emails: [], urls: [], keyTerms: [] },
    };
  }

  private static detectImageMime(buf: Buffer): string | null {
    if (buf.length >= 8 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) {
      return 'image/png';
    }
    if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
      return 'image/jpeg';
    }
    if (buf.length >= 6 && buf.toString('ascii', 0, 3) === 'GIF') {
      return 'image/gif';
    }
    if (buf.length >= 12 && buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') {
      return 'image/webp';
    }
    const startStr = buf.toString('utf-8', 0, Math.min(buf.length, 100)).trim();
    if (startStr.startsWith('<svg') || startStr.startsWith('<?xml') && startStr.includes('<svg')) {
      return 'image/svg+xml';
    }
    return null;
  }

  private static extractImageDimensions(buf: Buffer): { width: number; height: number } | null {
    try {
      // PNG
      if (buf.length >= 24 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) {
        const width = buf.readUInt32BE(16);
        const height = buf.readUInt32BE(20);
        return { width, height };
      }

      // GIF
      if (buf.length >= 10 && buf.toString('ascii', 0, 3) === 'GIF') {
        const width = buf.readUInt16LE(6);
        const height = buf.readUInt16LE(8);
        return { width, height };
      }

      // JPEG
      if (buf.length >= 4 && buf[0] === 0xff && buf[1] === 0xd8) {
        let offset = 2;
        while (offset < buf.length - 8) {
          if (buf[offset] !== 0xff) break;
          const marker = buf[offset + 1];
          if (marker === 0xc0 || marker === 0xc2) {
            // SOF0 or SOF2
            const height = buf.readUInt16BE(offset + 5);
            const width = buf.readUInt16BE(offset + 7);
            return { width, height };
          }
          const length = buf.readUInt16BE(offset + 2);
          offset += 2 + length;
        }
      }
    } catch {
      return null;
    }

    return null;
  }
}
