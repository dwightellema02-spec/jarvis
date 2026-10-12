import { describe, it, expect, beforeEach } from 'vitest';
import { SecondBrainManager } from '../../src/memory/second-brain-manager.js';
import { PermissionManager } from '../../src/security/permission-manager.js';
import { AuditLogger } from '../../src/audit/audit-logger.js';
import { ResourceType, PermissionLevel } from '../../src/security/types.js';
import { ValidationError, NotFoundError, PermissionDeniedError } from '../../src/utils/errors.js';

describe('Phase 5 Second Brain & Knowledge Graph Tests', () => {
  let secondBrain: SecondBrainManager;
  let permissionManager: PermissionManager;
  let auditLogger: AuditLogger;

  beforeEach(() => {
    permissionManager = new PermissionManager();
    auditLogger = new AuditLogger();

    permissionManager.grantPermission({
      userId: 'default_user',
      resource: ResourceType.DATABASES,
      level: PermissionLevel.WRITE,
      allowedActions: ['read', 'write', 'modify', 'delete'],
      grantedBy: 'system',
    });

    secondBrain = new SecondBrainManager({
      permissionManager,
      auditLogger,
      seedWithDefaults: true,
    });
  });

  it('builds full hierarchical Second Brain Tree rooted in YOU', async () => {
    const tree = await secondBrain.getTree('default_user');

    expect(tree).toBeDefined();
    expect(tree.root).toBe('YOU');

    // Study tree
    expect(tree.study.mathematics.length).toBeGreaterThanOrEqual(2);
    expect(tree.study.let.length).toBeGreaterThanOrEqual(2);
    expect(tree.study.thesis.length).toBeGreaterThanOrEqual(1);

    // Projects tree
    expect(tree.projects.tuklas.length).toBeGreaterThanOrEqual(1);
    expect(tree.projects.jarvis.length).toBeGreaterThanOrEqual(1);

    // Goals, Schedule, and Knowledge
    expect(tree.goals.length).toBeGreaterThanOrEqual(2);
    expect(tree.schedule.length).toBeGreaterThanOrEqual(1);
    expect(tree.knowledge.length).toBeGreaterThanOrEqual(2);
    expect(tree.totalNodes).toBeGreaterThanOrEqual(10);
  });

  it('performs semantic search scoring and returns relevant snippet and related nodes', async () => {
    // 1. Math query
    const mathResults = await secondBrain.semanticSearch('differential calculus derivatives and limits', {
      domain: 'study',
    });

    expect(mathResults.length).toBeGreaterThanOrEqual(1);
    expect(mathResults[0].node.title).toContain('Calculus');
    expect(mathResults[0].score).toBeGreaterThan(1.0);
    expect(mathResults[0].matchSnippet).toBeDefined();

    // 2. LET exam query
    const letResults = await secondBrain.semanticSearch('Philippine LET teacher exam professional education curriculum', {
      domain: 'study',
    });

    expect(letResults.length).toBeGreaterThanOrEqual(1);
    expect(letResults[0].node.title).toContain('LET');

    // 3. Thesis / EdTech query
    const thesisResults = await secondBrain.semanticSearch('AI systems in mathematics pedagogy and formative feedback', {});
    expect(thesisResults.length).toBeGreaterThanOrEqual(1);
    const thesisNode = thesisResults.find((r) => r.node.category === 'thesis');
    expect(thesisNode).toBeDefined();
  });

  it('creates, updates, and traverses relationship links between knowledge nodes', async () => {
    // 1. Create a prerequisite node
    const prereq = await secondBrain.index({
      domain: 'study',
      category: 'mathematics',
      title: 'Precalculus & Functions',
      content: 'Functions, polynomial roots, exponential and logarithmic properties, and unit circle trigonometry.',
      tags: ['precalculus', 'functions', 'trigonometry'],
      relationships: [],
    });

    // 2. Link Precalculus as prerequisite of Differential Calculus
    const linked = await secondBrain.addRelationship(prereq.id, 'node_math_calc', 'prerequisite_of');
    expect(linked).toBe(true);

    const updatedPrereq = await secondBrain.get(prereq.id);
    expect(updatedPrereq?.relationships.some((r) => r.nodeId === 'node_math_calc')).toBe(true);

    // 3. Perform semantic search with related nodes resolution
    const searchRes = await secondBrain.semanticSearch('Precalculus functions and trigonometry', {
      includeRelated: true,
    });

    expect(searchRes.length).toBeGreaterThanOrEqual(1);
    const found = searchRes.find((r) => r.node.id === prereq.id);
    expect(found?.relatedNodes?.some((r) => r.id === 'node_math_calc')).toBe(true);
  });

  it('deletes knowledge node, cleans up relationships, and emits audit log', async () => {
    const node = await secondBrain.index({
      domain: 'knowledge',
      category: 'temporary',
      title: 'Temporary Research Hypothesis',
      content: 'Experimental observation on student practice latency.',
      tags: ['temp'],
      relationships: [],
    });

    const deleted = await secondBrain.delete(node.id, 'default_user');
    expect(deleted).toBe(true);

    const check = await secondBrain.get(node.id);
    expect(check).toBeNull();

    const auditLogs = await auditLogger.query({ user: 'default_user' });
    const delLog = auditLogs.find((l) => l.reason.includes('Deleted Second Brain knowledge node'));
    expect(delLog).toBeDefined();
    expect(delLog?.action).toBe('delete');
  });

  it('formats high-signal knowledge prompt block for AI injection', async () => {
    const promptBlock = await secondBrain.getPromptKnowledgeContext('Calculus and ODEs for mathematics', 3, 'default_user');

    expect(promptBlock).toContain('[SECOND BRAIN KNOWLEDGE RETRIEVED FROM LONG-TERM REPOSITORY]');
    expect(promptBlock).toContain('Differential & Integral Calculus');
    expect(promptBlock).toContain('Connected:');
  });

  it('enforces permission controls on unauthorized users (default-deny)', async () => {
    await expect(
      secondBrain.get('node_math_calc', 'unauthorized_user')
    ).rejects.toThrow(PermissionDeniedError);

    await expect(
      secondBrain.index(
        {
          domain: 'study',
          category: 'math',
          title: 'Unauthorized Node',
          content: 'Should fail',
          tags: [],
          relationships: [],
        },
        'unauthorized_user'
      )
    ).rejects.toThrow(PermissionDeniedError);
  });

  it('validates required fields on node creation', async () => {
    await expect(
      secondBrain.index({
        domain: 'study',
        category: 'math',
        title: '',
        content: 'Content with empty title',
        tags: [],
        relationships: [],
      })
    ).rejects.toThrow(ValidationError);
  });
});
