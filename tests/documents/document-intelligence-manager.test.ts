import { describe, it, expect, beforeEach } from 'vitest';
import { DocumentIntelligenceManager } from '../../src/documents/document-intelligence-manager.js';
import { DocumentSanitizer } from '../../src/documents/document-sanitizer.js';
import { DocumentAgent } from '../../src/documents/document-agent.js';
import { SecondBrainManager } from '../../src/memory/second-brain-manager.js';
import { PermissionManager } from '../../src/security/permission-manager.js';
import { SecurityGuardian } from '../../src/security/guardian.js';
import { AuditLogger } from '../../src/audit/audit-logger.js';
import { PermissionLevel, ResourceType } from '../../src/security/types.js';
import { KnowledgeCategory } from '../../src/memory/knowledge.interface.js';

describe('DocumentIntelligenceManager & DocumentAgent Tests', () => {
  let docManager: DocumentIntelligenceManager;
  let secondBrain: SecondBrainManager;
  let permissionManager: PermissionManager;
  let guardian: SecurityGuardian;
  let auditLogger: AuditLogger;
  let docAgent: DocumentAgent;

  beforeEach(() => {
    permissionManager = new PermissionManager();
    guardian = new SecurityGuardian();
    auditLogger = new AuditLogger();

    // Baseline grant for default_user
    permissionManager.grantPermission({
      userId: 'default_user',
      resource: ResourceType.FILES,
      level: PermissionLevel.READ,
      allowedActions: ['read'],
      grantedBy: 'system',
    });
    permissionManager.grantPermission({
      userId: 'default_user',
      resource: ResourceType.DATABASES,
      level: PermissionLevel.WRITE,
      allowedActions: ['read', 'write', 'modify', 'delete'],
      grantedBy: 'system',
    });

    secondBrain = new SecondBrainManager({ permissionManager, auditLogger });
    docManager = new DocumentIntelligenceManager(permissionManager, guardian, auditLogger);
    docAgent = new DocumentAgent(docManager, secondBrain);
  });

  it('ingests and parses documents into structured sections and metadata', async () => {
    const content = `# Linear Algebra Study Notes
Linear equations represent lines, planes, and hyperplanes.
Gaussian elimination is the fundamental technique for row reduction.
Matrix multiplication is associative but not commutative.`;

    const doc = await docManager.parseAndIngest(content, 'linear_algebra.txt', {
      userId: 'default_user',
      title: 'Linear Algebra Study Notes',
    });

    expect(doc.metadata.id).toBeDefined();
    expect(doc.metadata.filename).toBe('linear_algebra.txt');
    expect(doc.metadata.fileType).toBe('txt');
    expect(doc.sections.length).toBeGreaterThan(0);
    expect(doc.rawText).toContain('Gaussian elimination');
  });

  it('searches document passages with relevance scoring and snippets', async () => {
    const content = `Chapter 1: Differential Equations
First-order ordinary differential equations can often be solved via separation of variables.
Integrating factors are effective for linear differential equations.`;

    const doc = await docManager.parseAndIngest(content, 'ode_notes.txt');
    const hits = docManager.searchDocument(doc.metadata.id, 'integrating factors');

    expect(hits.length).toBeGreaterThan(0);
    expect(hits[0].snippet.toLowerCase()).toContain('integrating factors');
    expect(hits[0].relevanceScore).toBeGreaterThan(0);
  });

  it('generates structured document summary with key takeaways and read time', async () => {
    const content = `# Philippine LET Licensure Overview
The Licensure Examination for Teachers is conducted bi-annually by the Professional Regulation Commission.
General Education covers English, Science, Mathematics, and Filipino.
Professional Education covers Child and Adolescent Development and Curriculum Design.
Majorship covers advanced domain expertise.`;

    const doc = await docManager.parseAndIngest(content, 'let_overview.md');
    const summary = docManager.summarizeDocument(doc.metadata.id);

    expect(summary.title).toContain('LET');
    expect(summary.keyPoints.length).toBeGreaterThan(0);
    expect(summary.wordCount).toBeGreaterThan(10);
    expect(summary.estimatedReadMinutes).toBeGreaterThanOrEqual(1);
  });

  it('answers questions grounded in document text with citation snippets', async () => {
    const content = `System Architecture Guidelines:
JARVIS enforces a strict Default-Deny permission model.
Capability does not equal permission under any circumstance.`;

    const doc = await docManager.parseAndIngest(content, 'security_guidelines.txt');
    const answer = docManager.answerQuestion(doc.metadata.id, 'What permission model is enforced?');

    expect(answer.confidence).toBeGreaterThan(0.5);
    expect(answer.answer.toLowerCase()).toContain('default-deny');
    expect(answer.sourceSnippets.length).toBeGreaterThan(0);
  });

  it('compares two documents side-by-side reporting similarity and exclusive terms', async () => {
    const docAContent = `Calculus I covers limits, differentiation rules, optimization, and extremum.`;
    const docBContent = `Calculus II covers integration, Riemann sums, Taylor series, and convergence.`;

    const docA = await docManager.parseAndIngest(docAContent, 'calc1.txt');
    const docB = await docManager.parseAndIngest(docBContent, 'calc2.txt');

    const comparison = docManager.compareDocuments(docA.metadata.id, docB.metadata.id);

    expect(comparison.similarityScore).toBeGreaterThan(0);
    expect(comparison.commonThemes).toContain('calculus');
    expect(comparison.docAExclusive).toContain('differentiation');
    expect(comparison.docBExclusive).toContain('integration');
  });

  it('analyzes tabular data from CSV documents', async () => {
    const csvContent = `topic,questions,mastery
Algebra,50,90
Calculus,40,75
Statistics,30,85`;

    const doc = await docManager.parseAndIngest(csvContent, 'scores.csv');
    const analysis = docManager.analyzeTable(doc.metadata.id, 0);

    expect(analysis.rowCount).toBe(3);
    expect(analysis.columnCount).toBe(3);
    expect(analysis.headers).toEqual(['topic', 'questions', 'mastery']);
    expect(analysis.numericSummary['mastery'].mean).toBeCloseTo(83.333, 1);
  });

  it('builds Second Brain knowledge nodes from document content', async () => {
    const content = `# Educational Scaffolding in Tuklas
Tuklas integrates step-by-step Socratic inquiry for Filipino students.
Students learn through structured formative problem solving.`;

    const doc = await docManager.parseAndIngest(content, 'tuklas_scaffolding.txt');
    const result = await docManager.buildKnowledgeFromDocument(
      doc.metadata.id,
      secondBrain,
      'study',
      'pedagogy',
      undefined,
      'default_user'
    );

    expect(result.createdNodes.length).toBeGreaterThan(0);
    expect(result.summary).toContain('Second Brain knowledge nodes');

    // Verify node is queryable in Second Brain
    const createdId = result.createdNodes[0].id;
    const nodeInBrain = await secondBrain.get(createdId);
    expect(nodeInBrain).toBeDefined();
    expect(nodeInBrain?.title).toContain('Educational Scaffolding');
  });

  it('enforces permission controls and blocks unauthorized users', async () => {
    const content = `Sensitive internal memorandum.`;

    await expect(
      docManager.parseAndIngest(content, 'memo.txt', { userId: 'unauthorized_hacker' })
    ).rejects.toThrow(/Permission Denied/);
  });

  it('blocks path traversal and prohibited file paths in DocumentSanitizer', async () => {
    const maliciousPaths = [
      '../../etc/shadow',
      '..\\windows\\system32\\cmd.exe',
      '.env',
      'id_rsa',
    ];

    for (const badPath of maliciousPaths) {
      expect(() => {
        DocumentSanitizer.validatePath(badPath);
      }).toThrow(/Security Violation/);
    }
  });

  it('executes actions via DocumentAgent satisfying IAgent interface', async () => {
    const context = {
      requestId: 'req_agent_test',
      userId: 'default_user',
      sessionId: 'sess_1',
      grantedPermissions: [{ resource: ResourceType.FILES, action: 'read', level: PermissionLevel.READ }],
    };

    // 1. Agent Read Action
    const readResult = await docAgent.execute(
      {
        action: 'read',
        content: '# Math Methods\nNumerical analysis and approximations.',
        filename: 'methods.txt',
      },
      context
    );
    expect(readResult.success).toBe(true);
    const docData = readResult.data as any;

    // 2. Agent Summarize Action
    const sumResult = await docAgent.execute(
      {
        action: 'summarize',
        documentId: docData.metadata.id,
      },
      context
    );
    expect(sumResult.success).toBe(true);
  });
});
