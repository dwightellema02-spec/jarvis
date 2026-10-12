import path from 'node:path';
import crypto from 'node:crypto';

export class DocumentSanitizer {
  private static readonly ALLOWED_EXTENSIONS = new Set([
    '.pdf',
    '.docx',
    '.xlsx',
    '.csv',
    '.tsv',
    '.txt',
    '.md',
    '.markdown',
    '.json',
    '.png',
    '.jpg',
    '.jpeg',
    '.webp',
    '.gif',
    '.svg',
  ]);

  private static readonly DANGEROUS_PATTERNS = [
    /\.\./,
    /\0/,
    /[<>:"|?*]/,
    /^\/etc/i,
    /^\/var/i,
    /^[a-zA-Z]:\\windows/i,
    /^[a-zA-Z]:\\system32/i,
    /\.env/i,
    /id_rsa/i,
    /id_ecdsa/i,
    /id_ed25519/i,
    /shadow$/i,
    /passwd$/i,
  ];

  public static readonly MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB

  public static sanitizeFilename(filename: string): string {
    const trimmed = filename.trim();
    if (!trimmed) {
      throw new Error('Filename cannot be empty');
    }

    const basename = path.basename(trimmed);
    const cleaned = basename.replace(/[^a-zA-Z0-9_\-\.\s]/g, '_').trim();
    if (!cleaned) {
      return `document_${Date.now()}`;
    }
    return cleaned;
  }

  public static validatePath(filePath: string): void {
    const normalized = path.normalize(filePath);
    for (const pattern of this.DANGEROUS_PATTERNS) {
      if (pattern.test(normalized)) {
        throw new Error(`Security Violation: Unsafe or prohibited file path pattern detected: ${normalized}`);
      }
    }
  }

  public static isAllowedExtension(filename: string): boolean {
    const ext = path.extname(filename).toLowerCase();
    return this.ALLOWED_EXTENSIONS.has(ext);
  }

  public static computeChecksum(content: Buffer | string): string {
    const hash = crypto.createHash('sha256');
    hash.update(content);
    return hash.digest('hex');
  }

  public static inferFileType(filename: string, mimeType?: string): string {
    const ext = path.extname(filename).toLowerCase();
    switch (ext) {
      case '.pdf':
        return 'pdf';
      case '.docx':
        return 'docx';
      case '.xlsx':
        return 'xlsx';
      case '.csv':
      case '.tsv':
        return 'csv';
      case '.txt':
      case '.md':
      case '.markdown':
      case '.json':
        return 'txt';
      case '.png':
      case '.jpg':
      case '.jpeg':
      case '.webp':
      case '.gif':
      case '.svg':
        return 'image';
      default:
        if (mimeType?.startsWith('image/')) return 'image';
        if (mimeType?.includes('pdf')) return 'pdf';
        if (mimeType?.includes('csv')) return 'csv';
        return 'unknown';
    }
  }
}
