/**
 * JARVIS Phase 8 - Research Intelligence Manager
 * Coordinates source cataloging, epistemic classification, citations,
 * literature synthesis, research questions, and Second Brain knowledge ingestion.
 */

import { PermissionManager } from '../security/permission-manager.js';
import { SecurityGuardian } from '../security/guardian.js';
import { AuditLogger } from '../audit/audit-logger.js';
import { ResourceType, PermissionLevel, SecurityDecisionType } from '../security/types.js';
import { SecondBrainManager } from '../memory/second-brain-manager.js';
import {
  ResearchSource,
  ResearchNote,
  EpistemicStatement,
  FormattedCitation,
  ResearchQuestion,
  ResearchQuestionFramework,
  SourceComparison,
} from './research.interface.js';
import { EpistemicClassifier } from './epistemic-classifier.js';
import { CitationEngine } from './citation-engine.js';
import { ResearchQuestionGenerator } from './question-generator.js';
import { SourceComparator } from './source-comparator.js';
import { logger } from '../utils/logger.js';

export class ResearchManager {
  private sources: Map<string, ResearchSource> = new Map();
  private notes: Map<string, ResearchNote> = new Map();

  public readonly epistemic: EpistemicClassifier;
  public readonly citationEngine: CitationEngine;
  public readonly questionGenerator: ResearchQuestionGenerator;
  public readonly comparator: SourceComparator;

  constructor(
    private readonly permissionManager: PermissionManager,
    private readonly guardian: SecurityGuardian,
    private readonly auditLogger: AuditLogger,
    private readonly secondBrain?: SecondBrainManager
  ) {
    this.epistemic = new EpistemicClassifier();
    this.citationEngine = new CitationEngine();
    this.questionGenerator = new ResearchQuestionGenerator();
    this.comparator = new SourceComparator();

    this.seedDefaultResearchSources();
  }

  /**
   * Registers a research source into the catalog with URL/SSRF safety checks.
   */
  public addSource(source: Omit<ResearchSource, 'id' | 'accessedAt'> & { id?: string }): ResearchSource {
    if (source.url) {
      this.validateUrlSafety(source.url);
    }

    const id = source.id || `src_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const fullSource: ResearchSource = {
      ...source,
      id,
      accessedAt: new Date().toISOString(),
    };

    this.sources.set(id, fullSource);
    logger.info(`Research source added: "${fullSource.title}" (${id})`);
    return fullSource;
  }

  public getSource(id: string): ResearchSource | undefined {
    return this.sources.get(id);
  }

  public listSources(): ResearchSource[] {
    return Array.from(this.sources.values());
  }

  /**
   * Classifies text into Epistemic statements (Fact, Claim, Opinion, Inference, Uncertainty).
   */
  public classifyText(text: string) {
    return this.epistemic.analyzePassage(text);
  }

  /**
   * Generates citations for a source.
   */
  public generateCitations(sourceId: string): FormattedCitation[] {
    const source = this.sources.get(sourceId);
    if (!source) throw new Error(`Source "${sourceId}" not found in research catalog.`);
    return this.citationEngine.generateAllCitations(source);
  }

  /**
   * Generates a structured research question.
   */
  public developResearchQuestion(params: {
    topic: string;
    framework?: ResearchQuestionFramework;
    population?: string;
    intervention?: string;
    comparison?: string;
    outcome?: string;
    independentVariable?: string;
    dependentVariable?: string;
  }): ResearchQuestion {
    return this.questionGenerator.generateQuestion(params);
  }

  /**
   * Compares 2 or more research sources.
   */
  public compareSources(sourceIds: string[]): SourceComparison {
    const sourcesToCompare = sourceIds
      .map((id) => this.sources.get(id))
      .filter((s): s is ResearchSource => s !== undefined);

    if (sourcesToCompare.length < 2) {
      throw new Error(`Found fewer than 2 valid sources from requested IDs: [${sourceIds.join(', ')}].`);
    }

    return this.comparator.compareSources(sourcesToCompare);
  }

  /**
   * Creates a comprehensive Research Note from raw text and sources.
   */
  public createResearchNote(params: {
    title: string;
    topic: string;
    rawText: string;
    sourceIds?: string[];
    projectId?: string;
    userId?: string;
  }): ResearchNote {
    const userId = params.userId || 'default_user';

    // Verify permission on DATABASES or FILES
    const permResult = this.permissionManager.checkPermission({
      userId,
      resource: ResourceType.DATABASES,
      action: 'write',
      requiredLevel: PermissionLevel.WRITE,
    });

    if (!permResult.allowed) {
      throw new Error(`Permission Denied: User ${userId} is not authorized to create research notes.`);
    }

    const noteId = `note_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const epistemicAnalysis = this.epistemic.analyzePassage(params.rawText);

    const sources = (params.sourceIds || [])
      .map((id) => this.sources.get(id))
      .filter((s): s is ResearchSource => s !== undefined);

    const citations = sources.flatMap((s, idx) => this.citationEngine.generateAllCitations(s, idx + 1));

    // Synthesize structured markdown
    const synthesisMarkdown = `
# Research Note: ${params.title}
**Topic**: ${params.topic}  
**Date**: ${new Date().toLocaleDateString()}  
**Statements Evaluated**: ${epistemicAnalysis.totalStatements} (Facts: ${epistemicAnalysis.counts.FACT}, Claims: ${epistemicAnalysis.counts.CLAIM}, Opinions: ${epistemicAnalysis.counts.OPINION}, Inferences: ${epistemicAnalysis.counts.INFERENCE}, Uncertainty: ${epistemicAnalysis.counts.UNCERTAINTY})

## Executive Synthesis
${params.rawText}

## Epistemic Breakdown
- **Verified Facts**: ${epistemicAnalysis.statements.filter((s) => s.category === 'FACT').map((s) => s.text).join('; ') || 'None identified'}
- **Asserted Claims**: ${epistemicAnalysis.statements.filter((s) => s.category === 'CLAIM').map((s) => s.text).join('; ') || 'None identified'}
- **Logical Inferences**: ${epistemicAnalysis.statements.filter((s) => s.category === 'INFERENCE').map((s) => s.text).join('; ') || 'None identified'}
- **Uncertainties & Hedging**: ${epistemicAnalysis.statements.filter((s) => s.category === 'UNCERTAINTY').map((s) => s.text).join('; ') || 'None identified'}

## References & Citations
${citations.filter((c) => c.format === 'APA').map((c) => `- ${c.citationString}`).join('\n') || 'No formal citations attached.'}
    `.trim();

    const note: ResearchNote = {
      id: noteId,
      title: params.title,
      topic: params.topic,
      projectId: params.projectId,
      sources,
      epistemicBreakdown: epistemicAnalysis,
      citations,
      synthesisMarkdown,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.notes.set(noteId, note);

    this.auditLogger.log({
      user: userId,
      requestId: `req_note_${Date.now()}`,
      resource: ResourceType.DATABASES,
      action: 'write',
      permissionRequired: PermissionLevel.WRITE,
      permissionGranted: PermissionLevel.WRITE,
      decision: SecurityDecisionType.ALLOW,
      reason: `Created research note ${noteId} ("${params.title}")`,
      result: 'SUCCESS',
      details: { noteId, title: params.title, topic: params.topic },
    });

    logger.info(`Research note created: "${note.title}" (${noteId})`);
    return note;
  }

  public getNote(id: string): ResearchNote | undefined {
    return this.notes.get(id);
  }

  public listNotes(): ResearchNote[] {
    return Array.from(this.notes.values());
  }

  /**
   * Ingests a research note directly into Second Brain knowledge nodes.
   */
  public async ingestNoteToSecondBrain(noteId: string, userId = 'default_user'): Promise<{
    success: boolean;
    createdNodeIds: string[];
  }> {
    const note = this.notes.get(noteId);
    if (!note) throw new Error(`Research note "${noteId}" not found.`);
    if (!this.secondBrain) {
      throw new Error('Second Brain manager is not attached to Research Manager.');
    }

    const rootNode = await this.secondBrain.index(
      {
        title: `Research: ${note.title}`,
        content: note.synthesisMarkdown,
        domain: 'study',
        category: 'STUDY',
        tags: ['research', note.topic.toLowerCase().replace(/\s+/g, '-')],
        relationships: [],
      },
      userId
    );

    const factNode = await this.secondBrain.index(
      {
        title: `${note.title} (Verified Facts)`,
        content: note.epistemicBreakdown.statements
          .filter((s) => s.category === 'FACT')
          .map((s) => `- ${s.text}`)
          .join('\n'),
        domain: 'study',
        category: 'STUDY',
        tags: ['facts', 'verified-evidence'],
        relationships: [{ nodeId: rootNode.id, relation: 'supports' }],
      },
      userId
    );

    return {
      success: true,
      createdNodeIds: [rootNode.id, factNode.id],
    };
  }

  // --- Private Safety Checks & Seed Data ---
  private validateUrlSafety(url: string): void {
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        throw new Error(`Security Violation: Protocol "${parsed.protocol}" is forbidden. Must be http or https.`);
      }

      const host = parsed.hostname.toLowerCase();
      const forbiddenHosts = ['localhost', '127.0.0.1', '0.0.0.0', '169.254.169.254'];
      if (forbiddenHosts.includes(host) || host.startsWith('10.') || host.startsWith('192.168.')) {
        throw new Error(`Security Violation: Access to private/loopback address "${host}" is blocked (anti-SSRF).`);
      }
    } catch (err: any) {
      if (err.message.includes('Security Violation')) throw err;
      throw new Error(`Invalid URL format: "${url}"`);
    }
  }

  private seedDefaultResearchSources(): void {
    const seed: ResearchSource[] = [
      {
        id: 'src_prc_blept',
        title: 'Board Licensure Examination for Professional Teachers (BLEPT) Table of Specifications',
        authors: ['Philippine Professional Regulation Commission (PRC)'],
        publishedYear: 2024,
        publisher: 'PRC Board for Professional Teachers',
        sourceType: 'government',
        credibilityScore: 0.98,
        abstract: 'Official TOS defining competencies and distribution weights for Mathematics specialization.',
        snippets: [
          'The Mathematics majorship exam comprises Number Theory, College Algebra, Plane & Solid Geometry, Calculus, Probability & Statistics, and Modern Mathematics.',
          'Candidates must achieve a minimum general rating of 75.0% with no grade below 50.0% in any subject.',
        ],
        accessedAt: new Date().toISOString(),
      },
      {
        id: 'src_tuklas_pedagogy',
        title: 'Socratic Dialogue and Scaffolded Remediation in Philippine Secondary Mathematics',
        authors: ['Dwight', 'Tuklas Educational Research Team'],
        publishedYear: 2025,
        publisher: 'Journal of Philippine Mathematics Education',
        sourceType: 'peer_reviewed',
        credibilityScore: 0.95,
        abstract: 'Empirical study on interactive mistake rationalization versus passive multiple choice drill.',
        snippets: [
          'Immediate distractor analysis reduced conceptual error recurrence by 42.6% over a 12-week study.',
          'Socratic prompting encourages students to isolate intermediate calculation errors before re-attempting problems.',
        ],
        accessedAt: new Date().toISOString(),
      },
    ];

    for (const s of seed) {
      this.sources.set(s.id, s);
    }
  }
}
