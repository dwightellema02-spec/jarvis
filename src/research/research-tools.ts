/**
 * JARVIS Phase 8 - Research Tools
 * Registered tools for ToolRegistry providing epistemic classification,
 * citation formatting, source comparison, and research question formulation.
 */

import {
  ITool,
  ToolDefinition,
  ToolExecutionContext,
  ToolExecutionResult,
} from '../tools/tool.interface.js';
import { PermissionLevel, ResourceType } from '../security/types.js';
import { ResearchManager } from './research-manager.js';
import { CitationFormat, ResearchQuestionFramework } from './research.interface.js';

/**
 * 1. ResearchClassifyEpistemicTool: research.classify_epistemic
 */
export class ResearchClassifyEpistemicTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'research.classify_epistemic',
    name: 'Epistemic Statement Classifier',
    description:
      'Rigorous epistemic evaluation distinguishing Fact, Claim, Opinion, Inference, and Uncertainty',
    version: '1.0.0',
    requiredPermissions: [
      { resource: ResourceType.FILES, action: 'read', level: PermissionLevel.READ },
    ],
    parametersSchema: {
      type: 'object',
      properties: {
        text: { type: 'string' },
      },
      required: ['text'],
    },
    status: 'implemented',
  };

  constructor(private readonly manager: ResearchManager) {}

  public async execute(params: unknown, _context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const p = params as { text: string };
      const analysis = this.manager.classifyText(p.text);
      return {
        success: true,
        toolId: this.definition.id,
        data: analysis,
        verified: true,
        executionTimeMs: Date.now() - startTime,
      };
    } catch (err: any) {
      return {
        success: false,
        toolId: this.definition.id,
        error: err.message,
        verified: false,
        executionTimeMs: Date.now() - startTime,
      };
    }
  }
}

/**
 * 2. ResearchGenerateCitationTool: research.generate_citation
 */
export class ResearchGenerateCitationTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'research.generate_citation',
    name: 'Academic Citation Generator',
    description: 'Formats academic citations in APA (7th ed), IEEE, Chicago, Harvard, and BibTeX',
    version: '1.0.0',
    requiredPermissions: [
      { resource: ResourceType.FILES, action: 'read', level: PermissionLevel.READ },
    ],
    parametersSchema: {
      type: 'object',
      properties: {
        sourceId: { type: 'string' },
        format: { type: 'string', enum: ['APA', 'IEEE', 'CHICAGO', 'HARVARD', 'BIBTEX'] },
      },
      required: ['sourceId'],
    },
    status: 'implemented',
  };

  constructor(private readonly manager: ResearchManager) {}

  public async execute(params: unknown, _context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const p = params as { sourceId: string; format?: CitationFormat };
      const citations = this.manager.generateCitations(p.sourceId);
      const filtered = p.format ? citations.filter((c) => c.format === p.format) : citations;
      return {
        success: true,
        toolId: this.definition.id,
        data: filtered,
        verified: true,
        executionTimeMs: Date.now() - startTime,
      };
    } catch (err: any) {
      return {
        success: false,
        toolId: this.definition.id,
        error: err.message,
        verified: false,
        executionTimeMs: Date.now() - startTime,
      };
    }
  }
}

/**
 * 3. ResearchCompareSourcesTool: research.compare_sources
 */
export class ResearchCompareSourcesTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'research.compare_sources',
    name: 'Multi-Source Evidence Comparator',
    description:
      'Compares multiple research sources, extracts consensus level, points of agreement, and contradictions',
    version: '1.0.0',
    requiredPermissions: [
      { resource: ResourceType.FILES, action: 'read', level: PermissionLevel.READ },
    ],
    parametersSchema: {
      type: 'object',
      properties: {
        sourceIds: { type: 'array', items: { type: 'string' } },
      },
      required: ['sourceIds'],
    },
    status: 'implemented',
  };

  constructor(private readonly manager: ResearchManager) {}

  public async execute(params: unknown, _context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const p = params as { sourceIds: string[] };
      const comparison = this.manager.compareSources(p.sourceIds);
      return {
        success: true,
        toolId: this.definition.id,
        data: comparison,
        verified: true,
        executionTimeMs: Date.now() - startTime,
      };
    } catch (err: any) {
      return {
        success: false,
        toolId: this.definition.id,
        error: err.message,
        verified: false,
        executionTimeMs: Date.now() - startTime,
      };
    }
  }
}

/**
 * 4. ResearchDevelopQuestionTool: research.develop_question
 */
export class ResearchDevelopQuestionTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'research.develop_question',
    name: 'Research Question Formulator (PICO & FINER)',
    description:
      'Develops scientific research questions with variables, null/alternative hypotheses, and FINER criteria',
    version: '1.0.0',
    requiredPermissions: [
      { resource: ResourceType.FILES, action: 'read', level: PermissionLevel.READ },
    ],
    parametersSchema: {
      type: 'object',
      properties: {
        topic: { type: 'string' },
        framework: { type: 'string', enum: ['PICO', 'FINER', 'STANDARD'] },
        population: { type: 'string' },
        intervention: { type: 'string' },
        comparison: { type: 'string' },
        outcome: { type: 'string' },
        independentVariable: { type: 'string' },
        dependentVariable: { type: 'string' },
      },
      required: ['topic'],
    },
    status: 'implemented',
  };

  constructor(private readonly manager: ResearchManager) {}

  public async execute(params: unknown, _context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const p = params as any;
      const question = this.manager.developResearchQuestion(p);
      return {
        success: true,
        toolId: this.definition.id,
        data: question,
        verified: true,
        executionTimeMs: Date.now() - startTime,
      };
    } catch (err: any) {
      return {
        success: false,
        toolId: this.definition.id,
        error: err.message,
        verified: false,
        executionTimeMs: Date.now() - startTime,
      };
    }
  }
}

/**
 * 5. ResearchCreateNoteTool: research.create_note
 */
export class ResearchCreateNoteTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'research.create_note',
    name: 'Research Note Synthesizer',
    description: 'Creates a structured research note with automated epistemic breakdown and citations',
    version: '1.0.0',
    requiredPermissions: [
      { resource: ResourceType.DATABASES, action: 'write', level: PermissionLevel.WRITE },
    ],
    parametersSchema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        topic: { type: 'string' },
        rawText: { type: 'string' },
        sourceIds: { type: 'array', items: { type: 'string' } },
      },
      required: ['title', 'topic', 'rawText'],
    },
    status: 'implemented',
  };

  constructor(private readonly manager: ResearchManager) {}

  public async execute(params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const p = params as any;
      const note = this.manager.createResearchNote({
        title: p.title,
        topic: p.topic,
        rawText: p.rawText,
        sourceIds: p.sourceIds,
        userId: context.userId,
      });
      return {
        success: true,
        toolId: this.definition.id,
        data: note,
        verified: true,
        executionTimeMs: Date.now() - startTime,
      };
    } catch (err: any) {
      return {
        success: false,
        toolId: this.definition.id,
        error: err.message,
        verified: false,
        executionTimeMs: Date.now() - startTime,
      };
    }
  }
}

/**
 * 6. ResearchToKnowledgeTool: research.to_knowledge
 */
export class ResearchToKnowledgeTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'research.to_knowledge',
    name: 'Research Knowledge Ingester',
    description: 'Ingests verified research note findings into the Second Brain knowledge graph',
    version: '1.0.0',
    requiredPermissions: [
      { resource: ResourceType.DATABASES, action: 'write', level: PermissionLevel.WRITE },
    ],
    parametersSchema: {
      type: 'object',
      properties: {
        noteId: { type: 'string' },
      },
      required: ['noteId'],
    },
    status: 'implemented',
  };

  constructor(private readonly manager: ResearchManager) {}

  public async execute(params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const p = params as { noteId: string };
      const res = await this.manager.ingestNoteToSecondBrain(p.noteId, context.userId);
      return {
        success: true,
        toolId: this.definition.id,
        data: res,
        verified: true,
        executionTimeMs: Date.now() - startTime,
      };
    } catch (err: any) {
      return {
        success: false,
        toolId: this.definition.id,
        error: err.message,
        verified: false,
        executionTimeMs: Date.now() - startTime,
      };
    }
  }
}
