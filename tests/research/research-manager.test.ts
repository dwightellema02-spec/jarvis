import { describe, it, expect, beforeEach } from 'vitest';
import { ResearchManager } from '../../src/research/index.js';
import { PermissionManager } from '../../src/security/permission-manager.js';
import { SecurityGuardian } from '../../src/security/guardian.js';
import { AuditLogger } from '../../src/audit/audit-logger.js';
import { SecondBrainManager } from '../../src/memory/second-brain-manager.js';
import { ResourceType, PermissionLevel } from '../../src/security/types.js';

describe('Phase 8 - Research Intelligence Manager', () => {
  let permissionManager: PermissionManager;
  let guardian: SecurityGuardian;
  let auditLogger: AuditLogger;
  let secondBrain: SecondBrainManager;
  let manager: ResearchManager;

  beforeEach(() => {
    permissionManager = new PermissionManager();
    guardian = new SecurityGuardian();
    auditLogger = new AuditLogger();
    secondBrain = new SecondBrainManager({ permissionManager, auditLogger });

    // Grant test permissions
    permissionManager.grantPermission({
      userId: 'researcher_1',
      resource: ResourceType.DATABASES,
      level: PermissionLevel.WRITE,
      allowedActions: ['read', 'write'],
      grantedBy: 'system',
    });

    manager = new ResearchManager(permissionManager, guardian, auditLogger, secondBrain);
  });

  it('should seed default research sources on initialization', () => {
    const sources = manager.listSources();
    expect(sources.length).toBeGreaterThanOrEqual(2);
    expect(sources.find((s) => s.id === 'src_prc_blept')).toBeDefined();
    expect(sources.find((s) => s.id === 'src_tuklas_pedagogy')).toBeDefined();
  });

  it('should enforce anti-SSRF security on registered source URLs', () => {
    // Localhost or private IP should be blocked
    expect(() => {
      manager.addSource({
        title: 'Malicious Source',
        authors: ['Hacker'],
        url: 'http://127.0.0.1:8080/internal-secrets',
        sourceType: 'blog',
        credibilityScore: 0.1,
        snippets: [],
      });
    }).toThrow(/Security Violation.*anti-SSRF/);

    expect(() => {
      manager.addSource({
        title: 'Non-HTTP Protocol',
        authors: ['Hacker'],
        url: 'ftp://ftp.example.com/file.txt',
        sourceType: 'blog',
        credibilityScore: 0.1,
        snippets: [],
      });
    }).toThrow(/Protocol.*is forbidden/);

    // Valid public https URL succeeds
    const valid = manager.addSource({
      title: 'Valid Academic Repository',
      authors: ['Researcher A'],
      url: 'https://arxiv.org/abs/2301.00001',
      sourceType: 'pre_print',
      credibilityScore: 0.9,
      snippets: ['Abstract text'],
    });
    expect(valid.id).toBeDefined();
  });

  it('should compare sources and synthesize agreements and contradictions', () => {
    const comp = manager.compareSources(['src_prc_blept', 'src_tuklas_pedagogy']);
    expect(comp.sourceIds.length).toBe(2);
    expect(comp.pointsOfAgreement.length).toBeGreaterThan(0);
    expect(comp.consensusLevel).toBeDefined();
    expect(comp.summary).toContain('Synthesized 2 sources');
  });

  it('should create research note with automated epistemic breakdown and citations', () => {
    const note = manager.createResearchNote({
      title: 'Pedagogical Intervention in LET Math Majorship',
      topic: 'Mathematics Teacher Licensure',
      rawText: `
        The PRC mandates a 75.0% passing score in BLEPT.
        The Tuklas team argues that scaffolded distractor feedback reduces conceptual misconceptions.
        In our view, this is superior to rote memorization.
        Therefore, incorporating immediate rationalization implies improved candidate preparedness.
      `,
      sourceIds: ['src_prc_blept', 'src_tuklas_pedagogy'],
      userId: 'researcher_1',
    });

    expect(note.id).toBeDefined();
    expect(note.epistemicBreakdown.totalStatements).toBe(4);
    expect(note.epistemicBreakdown.counts.FACT).toBeGreaterThanOrEqual(1);
    expect(note.epistemicBreakdown.counts.CLAIM).toBeGreaterThanOrEqual(1);
    expect(note.epistemicBreakdown.counts.OPINION).toBeGreaterThanOrEqual(1);
    expect(note.epistemicBreakdown.counts.INFERENCE).toBeGreaterThanOrEqual(1);
    expect(note.citations.length).toBeGreaterThan(0);
    expect(note.synthesisMarkdown).toContain('# Research Note');
  });

  it('should prevent unauthorized users from creating research notes (default deny)', () => {
    expect(() => {
      manager.createResearchNote({
        title: 'Unauthorized Note',
        topic: 'Security',
        rawText: 'Some text',
        userId: 'unauthorized_guest',
      });
    }).toThrow(/Permission Denied/);
  });

  it('should ingest research note directly into Second Brain knowledge graph', async () => {
    const note = manager.createResearchNote({
      title: 'Second Brain Ingestion Test Note',
      topic: 'Knowledge Synthesis',
      rawText: 'In 2025, 450 participants completed the trial. The method accelerates retention.',
      userId: 'researcher_1',
    });

    const ingested = await manager.ingestNoteToSecondBrain(note.id, 'researcher_1');
    expect(ingested.success).toBe(true);
    expect(ingested.createdNodeIds.length).toBe(2);

    // Verify nodes in Second Brain
    const rootNode = await secondBrain.get(ingested.createdNodeIds[0], 'researcher_1');
    expect(rootNode).toBeDefined();
    expect(rootNode?.title).toContain('Research: Second Brain Ingestion Test Note');
  });
});
