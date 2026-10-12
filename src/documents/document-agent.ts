import {
  IAgent,
  AgentDefinition,
  AgentExecutionContext,
  AgentExecutionResult,
} from '../agents/agent.interface.js';
import { PermissionLevel, ResourceType } from '../security/types.js';
import { DocumentIntelligenceManager } from './document-intelligence-manager.js';
import { SecondBrainManager } from '../memory/second-brain-manager.js';
import { TabularAnalysisQuery } from './document.interface.js';

export interface DocumentAgentInput {
  action: 'read' | 'summarize' | 'search' | 'qa' | 'compare' | 'analyze_table' | 'build_knowledge';
  content?: string;
  filename?: string;
  documentId?: string;
  documentIdB?: string;
  query?: string;
  question?: string;
  tableIndex?: number;
  tableQuery?: TabularAnalysisQuery;
  projectId?: string;
  isPaper?: boolean;
}

export class DocumentAgent implements IAgent {
  public readonly definition: AgentDefinition = {
    id: 'document-agent',
    name: 'Document Agent',
    description: 'Ingestion, search, extraction, summarization, and synthesis of PDF, DOCX, XLSX, and CSV documents',
    version: '1.0.0',
    capabilities: [
      'read_document',
      'summarize_document',
      'extract_tables',
      'compare_documents',
      'answer_question',
      'build_knowledge',
    ],
    requiredPermissions: [
      { resource: ResourceType.FILES, action: 'read', level: PermissionLevel.READ },
    ],
    inputSchema: {
      type: 'object',
      properties: {
        action: { type: 'string', enum: ['read', 'summarize', 'search', 'qa', 'compare', 'analyze_table', 'build_knowledge'] },
        content: { type: 'string' },
        filename: { type: 'string' },
        documentId: { type: 'string' },
        query: { type: 'string' },
        question: { type: 'string' },
      },
      required: ['action'],
    },
    outputSchema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        result: { type: 'object' },
      },
    },
    status: 'implemented',
  };

  constructor(
    private documentManager: DocumentIntelligenceManager,
    private secondBrain?: SecondBrainManager
  ) {}

  public async execute(
    input: unknown,
    context: AgentExecutionContext
  ): Promise<AgentExecutionResult> {
    const startTime = Date.now();
    const typedInput = input as DocumentAgentInput;

    try {
      if (!typedInput || !typedInput.action) {
        throw new Error('Document Agent requires an "action" parameter');
      }

      let data: unknown;

      switch (typedInput.action) {
        case 'read': {
          if (!typedInput.content || !typedInput.filename) {
            throw new Error('Reading a document requires "content" and "filename"');
          }
          data = await this.documentManager.parseAndIngest(
            typedInput.content,
            typedInput.filename,
            {
              userId: context.userId,
              requestId: context.requestId,
              isPaper: typedInput.isPaper,
            }
          );
          break;
        }

        case 'summarize': {
          if (!typedInput.documentId) throw new Error('Summarizing requires "documentId"');
          data = this.documentManager.summarizeDocument(typedInput.documentId);
          break;
        }

        case 'search': {
          if (!typedInput.documentId || !typedInput.query) {
            throw new Error('Search requires "documentId" and "query"');
          }
          data = this.documentManager.searchDocument(typedInput.documentId, typedInput.query);
          break;
        }

        case 'qa': {
          if (!typedInput.documentId || !typedInput.question) {
            throw new Error('Document Q&A requires "documentId" and "question"');
          }
          data = this.documentManager.answerQuestion(typedInput.documentId, typedInput.question);
          break;
        }

        case 'compare': {
          if (!typedInput.documentId || !typedInput.documentIdB) {
            throw new Error('Comparing documents requires "documentId" and "documentIdB"');
          }
          data = this.documentManager.compareDocuments(typedInput.documentId, typedInput.documentIdB);
          break;
        }

        case 'analyze_table': {
          if (!typedInput.documentId) throw new Error('Analyzing table requires "documentId"');
          data = this.documentManager.analyzeTable(
            typedInput.documentId,
            typedInput.tableIndex ?? 0,
            typedInput.tableQuery
          );
          break;
        }

        case 'build_knowledge': {
          if (!typedInput.documentId) throw new Error('Building knowledge requires "documentId"');
          if (!this.secondBrain) throw new Error('Second Brain is not available to the Document Agent');
          data = await this.documentManager.buildKnowledgeFromDocument(
            typedInput.documentId,
            this.secondBrain,
            'knowledge',
            'document',
            typedInput.projectId,
            context.userId
          );
          break;
        }

        default:
          throw new Error(`Unsupported action for Document Agent: ${(typedInput as any).action}`);
      }

      return {
        success: true,
        agentId: this.definition.id,
        data,
        executionTimeMs: Date.now() - startTime,
      };
    } catch (err) {
      return {
        success: false,
        agentId: this.definition.id,
        error: err instanceof Error ? err.message : String(err),
        executionTimeMs: Date.now() - startTime,
      };
    }
  }
}
