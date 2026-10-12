/**
 * JARVIS Phase 8 - Research Agent
 * Implements IAgent for autonomous scientific research, epistemic statement
 * classification, source comparison, literature synthesis, and citation generation.
 */

import {
  IAgent,
  AgentDefinition,
  AgentExecutionContext,
  AgentExecutionResult,
} from '../agents/agent.interface.js';
import { PermissionLevel, ResourceType } from '../security/types.js';
import { ResearchManager } from './research-manager.js';
import { CitationFormat, ResearchQuestionFramework } from './research.interface.js';

export interface ResearchAgentInput {
  action:
    | 'classify_epistemic'
    | 'generate_citation'
    | 'compare_sources'
    | 'develop_question'
    | 'create_note'
    | 'list_sources'
    | 'ingest_to_second_brain';
  text?: string;
  sourceId?: string;
  sourceIds?: string[];
  format?: CitationFormat;
  topic?: string;
  framework?: ResearchQuestionFramework;
  population?: string;
  intervention?: string;
  comparison?: string;
  outcome?: string;
  independentVariable?: string;
  dependentVariable?: string;
  title?: string;
  rawText?: string;
  noteId?: string;
}

export class ResearchAgent implements IAgent {
  public readonly definition: AgentDefinition = {
    id: 'research-agent',
    name: 'Research Agent',
    description:
      'Performs scientific literature research, epistemic statement classification (Fact, Claim, Opinion, Inference, Uncertainty), multi-source comparison, and citation generation',
    version: '1.0.0',
    capabilities: [
      'web_research',
      'source_collection',
      'source_comparison',
      'fact_extraction',
      'research_notes',
      'literature_organization',
      'citation_support',
      'research_question_development',
      'evidence_analysis',
      'research_summaries',
      'epistemic_classification',
    ],
    requiredPermissions: [
      { resource: ResourceType.FILES, action: 'read', level: PermissionLevel.READ },
    ],
    inputSchema: {
      type: 'object',
      properties: {
        action: {
          type: 'string',
          enum: [
            'classify_epistemic',
            'generate_citation',
            'compare_sources',
            'develop_question',
            'create_note',
            'list_sources',
            'ingest_to_second_brain',
          ],
        },
        text: { type: 'string' },
        sourceId: { type: 'string' },
        sourceIds: { type: 'array' },
        topic: { type: 'string' },
        title: { type: 'string' },
        rawText: { type: 'string' },
      },
      required: ['action'],
    },
    outputSchema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'object' },
      },
    },
    status: 'enabled',
  };

  constructor(private readonly manager: ResearchManager) {}

  public async execute(
    rawInput: unknown,
    context: AgentExecutionContext
  ): Promise<AgentExecutionResult> {
    const start = Date.now();
    const input = rawInput as ResearchAgentInput;

    try {
      if (!input?.action) {
        throw new Error('Field "action" is required for ResearchAgent.');
      }

      let data: any;

      switch (input.action) {
        case 'classify_epistemic': {
          if (!input.text) throw new Error('Field "text" is required for classify_epistemic.');
          data = this.manager.classifyText(input.text);
          break;
        }

        case 'generate_citation': {
          if (!input.sourceId) throw new Error('Field "sourceId" is required for generate_citation.');
          data = this.manager.generateCitations(input.sourceId);
          break;
        }

        case 'compare_sources': {
          if (!input.sourceIds || input.sourceIds.length < 2) {
            throw new Error('At least 2 "sourceIds" are required for compare_sources.');
          }
          data = this.manager.compareSources(input.sourceIds);
          break;
        }

        case 'develop_question': {
          if (!input.topic) throw new Error('Field "topic" is required for develop_question.');
          data = this.manager.developResearchQuestion({
            topic: input.topic,
            framework: input.framework,
            population: input.population,
            intervention: input.intervention,
            comparison: input.comparison,
            outcome: input.outcome,
            independentVariable: input.independentVariable,
            dependentVariable: input.dependentVariable,
          });
          break;
        }

        case 'create_note': {
          if (!input.title || !input.topic || !input.rawText) {
            throw new Error('Fields "title", "topic", and "rawText" are required for create_note.');
          }
          data = this.manager.createResearchNote({
            title: input.title,
            topic: input.topic,
            rawText: input.rawText,
            sourceIds: input.sourceIds,
            userId: context.userId,
          });
          break;
        }

        case 'list_sources': {
          data = this.manager.listSources();
          break;
        }

        case 'ingest_to_second_brain': {
          if (!input.noteId) throw new Error('Field "noteId" is required for ingest_to_second_brain.');
          data = this.manager.ingestNoteToSecondBrain(input.noteId, context.userId);
          break;
        }

        default:
          throw new Error(`Unsupported action "${(input as any).action}" for ResearchAgent.`);
      }

      return {
        success: true,
        agentId: this.definition.id,
        data,
        executionTimeMs: Date.now() - start,
      };
    } catch (err: any) {
      return {
        success: false,
        agentId: this.definition.id,
        error: err.message,
        executionTimeMs: Date.now() - start,
      };
    }
  }
}
