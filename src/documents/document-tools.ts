import {
  ITool,
  ToolDefinition,
  ToolExecutionContext,
  ToolExecutionResult,
} from '../tools/tool.interface.js';
import { PermissionLevel, ResourceType } from '../security/types.js';
import { DocumentIntelligenceManager } from './document-intelligence-manager.js';
import { SecondBrainManager } from '../memory/second-brain-manager.js';
import { TabularAnalysisQuery } from './document.interface.js';

export class DocumentReadTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'document.read',
    name: 'Document Reader & Parser',
    description: 'Parses and ingests PDF, DOCX, XLSX, CSV, and text documents into structured sections and tables',
    version: '1.0.0',
    requiredPermissions: [
      { resource: ResourceType.FILES, action: 'read', level: PermissionLevel.READ },
    ],
    parametersSchema: {
      type: 'object',
      properties: {
        content: { type: 'string' },
        filename: { type: 'string' },
        isPaper: { type: 'boolean' },
      },
      required: ['content', 'filename'],
    },
    status: 'implemented',
  };

  constructor(private manager: DocumentIntelligenceManager) {}

  public async execute(params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const p = params as { content: string; filename: string; isPaper?: boolean };
      const parsed = await this.manager.parseAndIngest(p.content, p.filename, {
        userId: context.userId,
        requestId: context.requestId,
        isPaper: p.isPaper,
      });

      return {
        success: true,
        toolId: this.definition.id,
        data: parsed,
        verified: true,
        executionTimeMs: Date.now() - startTime,
      };
    } catch (err) {
      return {
        success: false,
        toolId: this.definition.id,
        error: err instanceof Error ? err.message : String(err),
        verified: false,
        executionTimeMs: Date.now() - startTime,
      };
    }
  }
}

export class DocumentSearchTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'document.search',
    name: 'Document Passage Search',
    description: 'Searches for keyword and semantic passages within parsed document content',
    version: '1.0.0',
    requiredPermissions: [
      { resource: ResourceType.FILES, action: 'read', level: PermissionLevel.READ },
    ],
    parametersSchema: {
      type: 'object',
      properties: {
        documentId: { type: 'string' },
        query: { type: 'string' },
      },
      required: ['documentId', 'query'],
    },
    status: 'implemented',
  };

  constructor(private manager: DocumentIntelligenceManager) {}

  public async execute(params: unknown): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const p = params as { documentId: string; query: string };
      const results = this.manager.searchDocument(p.documentId, p.query);

      return {
        success: true,
        toolId: this.definition.id,
        data: results,
        verified: true,
        executionTimeMs: Date.now() - startTime,
      };
    } catch (err) {
      return {
        success: false,
        toolId: this.definition.id,
        error: err instanceof Error ? err.message : String(err),
        verified: false,
        executionTimeMs: Date.now() - startTime,
      };
    }
  }
}

export class DocumentSummarizeTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'document.summarize',
    name: 'Document Executive Summarizer',
    description: 'Generates structured executive summary, key points, topics, and reading metrics',
    version: '1.0.0',
    requiredPermissions: [
      { resource: ResourceType.FILES, action: 'read', level: PermissionLevel.READ },
    ],
    parametersSchema: {
      type: 'object',
      properties: {
        documentId: { type: 'string' },
      },
      required: ['documentId'],
    },
    status: 'implemented',
  };

  constructor(private manager: DocumentIntelligenceManager) {}

  public async execute(params: unknown): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const p = params as { documentId: string };
      const summary = this.manager.summarizeDocument(p.documentId);

      return {
        success: true,
        toolId: this.definition.id,
        data: summary,
        verified: true,
        executionTimeMs: Date.now() - startTime,
      };
    } catch (err) {
      return {
        success: false,
        toolId: this.definition.id,
        error: err instanceof Error ? err.message : String(err),
        verified: false,
        executionTimeMs: Date.now() - startTime,
      };
    }
  }
}

export class DocumentCompareTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'document.compare',
    name: 'Document Comparison Engine',
    description: 'Compares two documents side-by-side reporting similarity, shared themes, and divergences',
    version: '1.0.0',
    requiredPermissions: [
      { resource: ResourceType.FILES, action: 'read', level: PermissionLevel.READ },
    ],
    parametersSchema: {
      type: 'object',
      properties: {
        documentIdA: { type: 'string' },
        documentIdB: { type: 'string' },
      },
      required: ['documentIdA', 'documentIdB'],
    },
    status: 'implemented',
  };

  constructor(private manager: DocumentIntelligenceManager) {}

  public async execute(params: unknown): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const p = params as { documentIdA: string; documentIdB: string };
      const comparison = this.manager.compareDocuments(p.documentIdA, p.documentIdB);

      return {
        success: true,
        toolId: this.definition.id,
        data: comparison,
        verified: true,
        executionTimeMs: Date.now() - startTime,
      };
    } catch (err) {
      return {
        success: false,
        toolId: this.definition.id,
        error: err instanceof Error ? err.message : String(err),
        verified: false,
        executionTimeMs: Date.now() - startTime,
      };
    }
  }
}

export class DocumentAnalyzeTableTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'document.analyze_table',
    name: 'Tabular Data Analyzer',
    description: 'Computes statistics, column types, aggregations, and filtered queries on document tables',
    version: '1.0.0',
    requiredPermissions: [
      { resource: ResourceType.FILES, action: 'read', level: PermissionLevel.READ },
    ],
    parametersSchema: {
      type: 'object',
      properties: {
        documentId: { type: 'string' },
        tableIndex: { type: 'number' },
        query: { type: 'object' },
      },
      required: ['documentId'],
    },
    status: 'implemented',
  };

  constructor(private manager: DocumentIntelligenceManager) {}

  public async execute(params: unknown): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const p = params as { documentId: string; tableIndex?: number; query?: TabularAnalysisQuery };
      const analysis = this.manager.analyzeTable(p.documentId, p.tableIndex ?? 0, p.query);

      return {
        success: true,
        toolId: this.definition.id,
        data: analysis,
        verified: true,
        executionTimeMs: Date.now() - startTime,
      };
    } catch (err) {
      return {
        success: false,
        toolId: this.definition.id,
        error: err instanceof Error ? err.message : String(err),
        verified: false,
        executionTimeMs: Date.now() - startTime,
      };
    }
  }
}

export class DocumentExtractKnowledgeTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'document.extract_knowledge',
    name: 'Second Brain Document Knowledge Ingestion',
    description: 'Ingests document insights and key findings into the Second Brain knowledge graph',
    version: '1.0.0',
    requiredPermissions: [
      { resource: ResourceType.FILES, action: 'read', level: PermissionLevel.READ },
      { resource: ResourceType.DATABASES, action: 'write', level: PermissionLevel.WRITE },
    ],
    parametersSchema: {
      type: 'object',
      properties: {
        documentId: { type: 'string' },
        projectId: { type: 'string' },
      },
      required: ['documentId'],
    },
    status: 'implemented',
  };

  constructor(
    private manager: DocumentIntelligenceManager,
    private secondBrain: SecondBrainManager
  ) {}

  public async execute(params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const p = params as { documentId: string; projectId?: string };
      const res = await this.manager.buildKnowledgeFromDocument(
        p.documentId,
        this.secondBrain,
        'knowledge',
        'document',
        p.projectId,
        context.userId
      );

      return {
        success: true,
        toolId: this.definition.id,
        data: res,
        verified: true,
        executionTimeMs: Date.now() - startTime,
      };
    } catch (err) {
      return {
        success: false,
        toolId: this.definition.id,
        error: err instanceof Error ? err.message : String(err),
        verified: false,
        executionTimeMs: Date.now() - startTime,
      };
    }
  }
}
