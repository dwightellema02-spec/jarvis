import {
  DocumentMetadata,
  ParsedDocument,
  DocumentSummary,
  DocumentSearchResult,
  DocumentComparison,
  DocumentQAResponse,
  TabularAnalysisQuery,
  TabularAnalysisResult,
  BuildKnowledgeResult,
  DocumentType,
} from './document.interface.js';
import { DocumentSanitizer } from './document-sanitizer.js';
import { TextParser } from './parsers/text-parser.js';
import { CsvParser } from './parsers/csv-parser.js';
import { TableAnalyzer } from './parsers/table-analyzer.js';
import { ResearchPaperParser } from './parsers/research-paper-parser.js';
import { PdfParser } from './parsers/pdf-parser.js';
import { DocxParser } from './parsers/docx-parser.js';
import { XlsxParser } from './parsers/xlsx-parser.js';
import { ImageMetadataParser } from './parsers/image-metadata-parser.js';
import { SecondBrainManager } from '../memory/second-brain-manager.js';
import { KnowledgeDomain } from '../memory/knowledge.interface.js';
import { PermissionManager } from '../security/permission-manager.js';
import { SecurityGuardian } from '../security/guardian.js';
import { AuditLogger } from '../audit/audit-logger.js';
import { PermissionLevel, ResourceType, SecurityDecisionType, PermissionAction } from '../security/types.js';
import { logger } from '../utils/logger.js';

export interface IngestDocumentOptions {
  userId?: string;
  requestId?: string;
  mimeType?: string;
  title?: string;
  author?: string;
  tags?: string[];
  isPaper?: boolean;
}

export class DocumentIntelligenceManager {
  private documents: Map<string, ParsedDocument> = new Map();

  constructor(
    private permissionManager?: PermissionManager,
    private guardian?: SecurityGuardian,
    private auditLogger?: AuditLogger
  ) {}

  public async parseAndIngest(
    content: string | Buffer,
    filename: string,
    options: IngestDocumentOptions = {}
  ): Promise<ParsedDocument> {
    const userId = options.userId || 'default_user';
    const requestId = options.requestId || `req_doc_${Date.now()}`;

    // 1. Permission and Guardian checks
    this.enforceFilePermission(userId, 'read', requestId);

    // 2. Validate and sanitize filename
    const safeFilename = DocumentSanitizer.sanitizeFilename(filename);
    const buffer = Buffer.isBuffer(content) ? content : Buffer.from(content, 'utf-8');

    if (buffer.length > DocumentSanitizer.MAX_FILE_SIZE_BYTES) {
      throw new Error(`File size ${buffer.length} bytes exceeds maximum limit of 50 MB`);
    }

    const checksum = DocumentSanitizer.computeChecksum(buffer);
    const inferredType = DocumentSanitizer.inferFileType(safeFilename, options.mimeType) as DocumentType;
    const now = new Date().toISOString();
    const docId = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const metadata: DocumentMetadata = {
      id: docId,
      filename: safeFilename,
      fileType: inferredType,
      mimeType: options.mimeType || this.defaultMimeForType(inferredType),
      sizeBytes: buffer.length,
      checksum,
      createdAt: now,
      updatedAt: now,
      title: options.title,
      author: options.author,
      tags: options.tags || [],
    };

    let parsedDoc: ParsedDocument;

    if (options.isPaper) {
      const textContent = buffer.toString('utf-8');
      parsedDoc = ResearchPaperParser.parse(textContent, metadata);
    } else {
      switch (inferredType) {
        case 'csv': {
          const textContent = buffer.toString('utf-8');
          const table = CsvParser.parse(textContent, { tableName: safeFilename });
          parsedDoc = {
            metadata: {
              ...metadata,
              rowCount: table.rowCount,
              columnCount: table.columnCount,
            },
            rawText: `CSV Table ${safeFilename} containing ${table.rowCount} rows.`,
            sections: [
              {
                id: 'sec_1',
                title: 'Data Summary',
                content: `CSV Dataset with columns: ${table.headers.join(', ')}. Total rows: ${table.rowCount}.`,
              },
            ],
            tables: [table],
            entities: { dates: [], numbers: [], emails: [], urls: [], keyTerms: [] },
          };
          break;
        }
        case 'pdf': {
          parsedDoc = PdfParser.parse(buffer, metadata);
          break;
        }
        case 'docx': {
          parsedDoc = DocxParser.parse(buffer, metadata);
          break;
        }
        case 'xlsx': {
          parsedDoc = XlsxParser.parse(buffer, metadata);
          break;
        }
        case 'image': {
          parsedDoc = ImageMetadataParser.parse(buffer, metadata);
          break;
        }
        case 'txt':
        default: {
          const textContent = buffer.toString('utf-8');
          parsedDoc = TextParser.parse(textContent, metadata);
          break;
        }
      }
    }

    this.documents.set(docId, parsedDoc);
    logger.info(`Parsed and stored document [${docId}] "${safeFilename}" (${parsedDoc.metadata.fileType})`);

    this.auditLogger?.log({
      user: userId,
      requestId,
      resource: ResourceType.FILES,
      action: 'read',
      permissionRequired: PermissionLevel.READ,
      permissionGranted: PermissionLevel.READ,
      decision: SecurityDecisionType.ALLOW,
      reason: `Parsed and stored document ${safeFilename}`,
      result: 'SUCCESS',
      details: { documentId: docId, filename: safeFilename, sizeBytes: buffer.length },
    });

    return parsedDoc;
  }

  public getDocument(id: string): ParsedDocument | undefined {
    return this.documents.get(id);
  }

  public listDocuments(): DocumentMetadata[] {
    return Array.from(this.documents.values()).map((d) => d.metadata);
  }

  public deleteDocument(id: string, userId: string = 'default_user'): boolean {
    this.enforceFilePermission(userId, 'delete', `req_del_${Date.now()}`, PermissionLevel.ADMIN);
    const deleted = this.documents.delete(id);
    if (deleted) {
      logger.info(`Deleted document [${id}]`);
    }
    return deleted;
  }

  public searchDocument(id: string, query: string): DocumentSearchResult[] {
    const doc = this.documents.get(id);
    if (!doc) throw new Error(`Document not found: ${id}`);

    const normalizedQuery = query.toLowerCase().trim();
    const queryTokens = normalizedQuery.split(/\s+/).filter((t) => t.length > 2);
    const results: DocumentSearchResult[] = [];

    // Search sections
    for (const sec of doc.sections) {
      const lowerContent = sec.content.toLowerCase();
      let matches = 0;
      const matchedTerms: string[] = [];

      for (const token of queryTokens) {
        const stem = token.replace(/(s|ed|ing)$/, '');
        if (lowerContent.includes(token) || (stem.length > 3 && lowerContent.includes(stem))) {
          matches++;
          matchedTerms.push(token);
        }
      }

      if (matches > 0 || lowerContent.includes(normalizedQuery)) {
        const relevanceScore = lowerContent.includes(normalizedQuery)
          ? 1.0
          : matches / Math.max(queryTokens.length, 1);

        const snippet = this.extractSnippet(sec.content, queryTokens[0] || normalizedQuery);

        results.push({
          documentId: id,
          sectionTitle: sec.title,
          pageNumber: sec.pageNumber,
          snippet,
          relevanceScore: Math.round(relevanceScore * 100) / 100,
          matchedTerms,
        });
      }
    }

    results.sort((a, b) => b.relevanceScore - a.relevanceScore);
    return results;
  }

  public summarizeDocument(id: string): DocumentSummary {
    const doc = this.documents.get(id);
    if (!doc) throw new Error(`Document not found: ${id}`);

    const words = doc.rawText.split(/\s+/).filter((w) => w.length > 0);
    const wordCount = words.length;
    const estimatedReadMinutes = Math.max(1, Math.ceil(wordCount / 200));

    // Extract key points from sections
    const keyPoints: string[] = [];
    for (const sec of doc.sections) {
      const sentences = sec.content.split(/[.!?]+/).map((s) => s.trim()).filter((s) => s.length > 20);
      if (sentences.length > 0) {
        keyPoints.push(`[${sec.title}] ${sentences[0]}.`);
      }
      if (keyPoints.length >= 6) break;
    }

    const topics: string[] = doc.entities.keyTerms.length > 0
      ? doc.entities.keyTerms.slice(0, 8)
      : doc.sections.map((s) => s.title).slice(0, 8);

    const overview =
      doc.sections[0]?.content.slice(0, 300).trim() ||
      `Document "${doc.metadata.filename}" contains ${wordCount} words across ${doc.sections.length} sections and ${doc.tables.length} tables.`;

    return {
      documentId: id,
      filename: doc.metadata.filename,
      title: doc.metadata.title || doc.metadata.filename,
      overview,
      keyPoints,
      topics,
      wordCount,
      estimatedReadMinutes,
      sectionCount: doc.sections.length,
      tableCount: doc.tables.length,
    };
  }

  public answerQuestion(id: string, question: string): DocumentQAResponse {
    const doc = this.documents.get(id);
    if (!doc) throw new Error(`Document not found: ${id}`);

    const searchHits = this.searchDocument(id, question);

    if (searchHits.length === 0) {
      return {
        documentId: id,
        question,
        answer: `I could not find information in "${doc.metadata.filename}" answering: "${question}".`,
        confidence: 0.1,
        sourceSnippets: [],
      };
    }

    const topHit = searchHits[0];
    const sourceSnippets = searchHits.slice(0, 3).map((h) => ({
      sectionTitle: h.sectionTitle,
      text: h.snippet,
      relevanceScore: h.relevanceScore,
    }));

    const answer = `Based on section "${topHit.sectionTitle || 'Document Content'}": ${topHit.snippet}`;

    return {
      documentId: id,
      question,
      answer,
      confidence: Math.min(Math.max(topHit.relevanceScore, 0.7), 0.95),
      sourceSnippets,
    };
  }

  public compareDocuments(idA: string, idB: string): DocumentComparison {
    const docA = this.documents.get(idA);
    const docB = this.documents.get(idB);

    if (!docA) throw new Error(`Document not found: ${idA}`);
    if (!docB) throw new Error(`Document not found: ${idB}`);

    const tokensA = new Set(
      docA.rawText.toLowerCase().split(/\W+/).filter((t) => t.length > 3)
    );
    const tokensB = new Set(
      docB.rawText.toLowerCase().split(/\W+/).filter((t) => t.length > 3)
    );

    const intersection = new Set([...tokensA].filter((t) => tokensB.has(t)));
    const union = new Set([...tokensA, ...tokensB]);

    const similarityScore = union.size > 0 ? Math.round((intersection.size / union.size) * 100) / 100 : 0;

    const commonThemes = Array.from(intersection).slice(0, 10);
    const docAExclusive = [...tokensA].filter((t) => !tokensB.has(t)).slice(0, 10);
    const docBExclusive = [...tokensB].filter((t) => !tokensA.has(t)).slice(0, 10);

    const contradictions: string[] = [];
    // Check if conflicting dates or numbers exist on shared entities
    for (const emailA of docA.entities.emails) {
      for (const emailB of docB.entities.emails) {
        if (emailA !== emailB && docA.metadata.author === docB.metadata.author) {
          contradictions.push(`Conflicting author emails reported: ${emailA} vs ${emailB}`);
        }
      }
    }

    return {
      docA: { id: docA.metadata.id, filename: docA.metadata.filename, title: docA.metadata.title || docA.metadata.filename },
      docB: { id: docB.metadata.id, filename: docB.metadata.filename, title: docB.metadata.title || docB.metadata.filename },
      similarityScore,
      commonThemes,
      docAExclusive,
      docBExclusive,
      contradictions,
      metricsComparison: {
        wordCountDiff: Math.abs(docA.rawText.split(/\s+/).length - docB.rawText.split(/\s+/).length),
        tableCountDiff: Math.abs(docA.tables.length - docB.tables.length),
      },
    };
  }

  public analyzeTable(id: string, tableIndex: number = 0, query?: TabularAnalysisQuery): TabularAnalysisResult {
    const doc = this.documents.get(id);
    if (!doc) throw new Error(`Document not found: ${id}`);
    if (doc.tables.length <= tableIndex) {
      throw new Error(`Table index ${tableIndex} not found in document ${id} (total tables: ${doc.tables.length})`);
    }

    const table = doc.tables[tableIndex];
    return TableAnalyzer.analyze(table, query);
  }

  public async buildKnowledgeFromDocument(
    id: string,
    secondBrain: SecondBrainManager,
    domain: KnowledgeDomain = 'knowledge',
    category: string = 'document',
    projectId?: string,
    userId: string = 'default_user'
  ): Promise<BuildKnowledgeResult> {
    const doc = this.documents.get(id);
    if (!doc) throw new Error(`Document not found: ${id}`);

    // Verify permission to write to databases
    if (this.permissionManager) {
      const grant = this.permissionManager.checkPermission({
        userId,
        resource: ResourceType.DATABASES,
        action: 'write',
        requiredLevel: PermissionLevel.WRITE,
      });
      if (!grant.allowed) {
        throw new Error(`Permission Denied: User ${userId} is not authorized to create Second Brain knowledge nodes`);
      }
    }

    const summary = this.summarizeDocument(id);
    const createdNodes: { id: string; title: string; domain?: KnowledgeDomain; category: string }[] = [];

    // 1. Create primary root node for document
    const mainNode = await secondBrain.index(
      {
        title: summary.title,
        content: `${summary.overview}\n\nKey Takeaways:\n${summary.keyPoints.join('\n')}`,
        domain,
        category,
        tags: ['document', doc.metadata.fileType, ...summary.topics],
        relationships: [],
      },
      userId
    );
    createdNodes.push({ id: mainNode.id, title: mainNode.title, domain: mainNode.domain, category: mainNode.category });

    // 2. Connect to project if requested
    if (projectId) {
      const projectNode = await secondBrain.get(projectId, userId);
      if (projectNode) {
        await secondBrain.addRelationship(
          mainNode.id,
          projectNode.id,
          'references',
          userId
        );
      }
    }

    // 3. Create sub-nodes for key sections if document is substantial
    for (const sec of doc.sections.slice(0, 3)) {
      if (sec.content.length > 50 && sec.title !== 'Overview') {
        const secNode = await secondBrain.index(
          {
            title: `${summary.title}: ${sec.title}`,
            content: sec.content,
            domain,
            category: `${category}-section`,
            tags: ['document-section', doc.metadata.fileType, ...summary.topics],
            relationships: [],
          },
          userId
        );
        createdNodes.push({ id: secNode.id, title: secNode.title, domain: secNode.domain, category: secNode.category });

        await secondBrain.addRelationship(
          mainNode.id,
          secNode.id,
          'contains',
          userId
        );
      }
    }

    return {
      documentId: id,
      createdNodes,
      summary: `Successfully created ${createdNodes.length} Second Brain knowledge nodes from "${doc.metadata.filename}".`,
    };
  }

  private enforceFilePermission(
    userId: string,
    action: PermissionAction,
    requestId: string,
    requiredLevel: PermissionLevel = PermissionLevel.READ
  ): void {
    if (this.guardian) {
      const decision = this.guardian.evaluate({
        target: `files.${action}`,
        resource: ResourceType.FILES,
        action,
        userId,
      });
      if (decision.decision === SecurityDecisionType.DENY) {
        throw new Error(`Security Guardian Blocked file operation: ${decision.reason}`);
      }
    }

    if (this.permissionManager) {
      const grant = this.permissionManager.checkPermission({
        userId,
        resource: ResourceType.FILES,
        action,
        requiredLevel,
      });
      if (!grant.allowed) {
        throw new Error(`Permission Denied: User ${userId} is not authorized to ${action} on FILES`);
      }
    }
  }

  private extractSnippet(text: string, keyword: string): string {
    const lower = text.toLowerCase();
    const idx = lower.indexOf(keyword.toLowerCase());
    if (idx === -1) {
      return text.slice(0, 200).trim() + (text.length > 200 ? '...' : '');
    }

    const start = Math.max(0, idx - 60);
    const end = Math.min(text.length, idx + 140);
    const snippet = text.slice(start, end).replace(/\n+/g, ' ').trim();
    return (start > 0 ? '...' : '') + snippet + (end < text.length ? '...' : '');
  }

  private defaultMimeForType(type: DocumentType): string {
    switch (type) {
      case 'pdf': return 'application/pdf';
      case 'docx': return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      case 'xlsx': return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      case 'csv': return 'text/csv';
      case 'image': return 'image/png';
      case 'paper':
      case 'note':
      case 'txt':
      default: return 'text/plain';
    }
  }
}
