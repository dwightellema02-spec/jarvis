/**
 * Tests for Phase 15 Product Innovation - Architecture, Roadmap, Manager, and Agent
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { UxArchitectureDesigner } from '../../src/innovation/ux-architecture-designer.js';
import { SprintRoadmapPlanner } from '../../src/innovation/sprint-roadmap-planner.js';
import { InnovationManager } from '../../src/innovation/innovation-manager.js';
import { InnovationAgent } from '../../src/innovation/innovation-agent.js';
import { PermissionManager } from '../../src/security/permission-manager.js';
import { SecurityGuardian } from '../../src/security/guardian.js';
import { AuditLogger } from '../../src/audit/audit-logger.js';
import { ResourceType, PermissionLevel } from '../../src/security/types.js';

describe('Phase 15: UX & Technical Architecture Designer', () => {
  const designer = new UxArchitectureDesigner();

  it('generates 5-stage user journey with emotional states and wireframe cues', () => {
    const journey = designer.generateUserJourney('Automated Venture Architect');

    expect(journey.length).toBe(5);
    expect(journey[0].stage).toBe('Discovery');
    expect(journey[0].emotionalState).toBe('curious');
    expect(journey[0].wireframeCue).toContain('Split hero layout');

    expect(journey[1].stage).toBe('Onboarding');
    expect(journey[2].stage).toBe('Core Task');
    expect(journey[3].stage).toBe('Value Realization');
    expect(journey[4].stage).toBe('Retention');
  });

  it('generates technical architecture blueprint with data models and endpoints', () => {
    const bp = designer.generateTechnicalBlueprint('Automated Venture Architect', 'starter');

    expect(bp.techStack.frontend).toContain('Next.js');
    expect(bp.techStack.backend).toContain('Node.js');
    expect(bp.techStack.database).toContain('PostgreSQL');
    expect(bp.architectureType).toBe('modular_monolith');
    expect(bp.dataModels.length).toBeGreaterThanOrEqual(4);
    expect(bp.apiEndpoints.length).toBeGreaterThanOrEqual(6);
    expect(bp.securityRequirements.length).toBeGreaterThanOrEqual(3);
  });
});

describe('Phase 15: Sprint Roadmap & Viability Planner', () => {
  const planner = new SprintRoadmapPlanner();

  it('plans a 5-sprint roadmap with deliverables and risk grading', () => {
    const roadmap = planner.planSprintRoadmap('Automated Venture Architect');

    expect(roadmap.sprints.length).toBe(5);
    expect(roadmap.totalEstimatedWeeks).toBe(9);
    expect(roadmap.sprints[0].riskLevel).toBe('LOW');
    expect(roadmap.sprints[1].riskLevel).toBe('MEDIUM');
    expect(roadmap.sprints[3].riskLevel).toBe('HIGH');
    expect(roadmap.mvpSuccessMetrics.length).toBeGreaterThanOrEqual(3);
    expect(roadmap.launchChecklist.length).toBeGreaterThanOrEqual(3);
  });

  it('computes deterministic viability and PMF score', () => {
    const market = {
      ideaSummary: 'AI Venture Architect',
      problemStatement: 'Problem',
      tamSamSom: { tam: '$180 Billion', sam: '$34 Billion', som: '$1.8 Billion' },
      competitors: [{ name: 'Comp1', strengths: 'S', weaknesses: 'W', differentiation: 'D' }, { name: 'Comp2', strengths: 'S', weaknesses: 'W', differentiation: 'D' }],
      customerPainPoints: ['p1', 'p2', 'p3', 'p4'],
      whyNow: 'Advancements in multi-agent orchestration and security gating; Enterprise adoption accelerating',
    };
    const features: any[] = [
      { name: 'Core Engine', complexity: 'low' },
      { name: 'Security Guardian RBAC', complexity: 'medium' },
      { name: 'Dashboard', complexity: 'low' },
    ];

    const score = planner.evaluateViability('AI Venture Architect', market, features);

    expect(score.overallScorePercent).toBeGreaterThanOrEqual(75);
    expect(score.marketOpportunityScore).toBeGreaterThanOrEqual(80);
    expect(score.technicalFeasibilityScore).toBeGreaterThanOrEqual(80);
    expect(score.competitiveDefensibilityScore).toBeGreaterThanOrEqual(75);
    expect(score.keyStrengths.length).toBeGreaterThanOrEqual(3);
    expect(score.criticalRisks.length).toBeGreaterThanOrEqual(2);
  });
});

describe('Phase 15: Innovation Manager & Security Gating', () => {
  let permManager: PermissionManager;
  let guardian: SecurityGuardian;
  let auditLogger: AuditLogger;
  let manager: InnovationManager;

  beforeEach(() => {
    permManager = new PermissionManager();
    guardian = new SecurityGuardian();
    auditLogger = new AuditLogger();
    manager = new InnovationManager(permManager, guardian, auditLogger);
  });

  it('blocks unauthorized users with default-deny on INNOVATION resource', async () => {
    await expect(
      manager.createProductBlueprint(
        { title: 'Venture Test', idea: 'Autonomous AI Platform' },
        'unauthorized_user'
      )
    ).rejects.toThrow(/Permission Denied on INNOVATION/);
  });

  it('synthesizes FullProductBlueprint when authorized', async () => {
    permManager.grantPermission({
      userId: 'test_founder',
      resource: ResourceType.INNOVATION,
      level: PermissionLevel.WRITE,
      allowedActions: ['read', 'write', 'execute'],
      grantedBy: 'system',
    });

    const blueprint = await manager.createProductBlueprint(
      {
        title: 'Nexus Venture',
        idea: 'Autonomous developer tools and venture architecture pipeline',
        category: 'ai_devtools',
      },
      'test_founder'
    );

    expect(blueprint.id).toBeDefined();
    expect(blueprint.productName).toBe('Nexus Venture');
    expect(blueprint.marketResearch.tamSamSom.tam).toContain('$180 Billion');
    expect(blueprint.targetPersonas.length).toBe(3);
    expect(blueprint.features.length).toBe(6);
    expect(blueprint.userJourney.length).toBe(5);
    expect(blueprint.technicalBlueprint.dataModels.length).toBeGreaterThanOrEqual(4);
    expect(blueprint.roadmap.sprints.length).toBe(5);
    expect(blueprint.viability.overallScorePercent).toBeGreaterThanOrEqual(70);

    // Verify system status
    const status = manager.getSystemStatus();
    expect(status.totalBlueprintsGenerated).toBe(1);
    expect(status.totalFeaturesScored).toBe(6);
    expect(status.totalPersonasSynthesized).toBe(3);
  });

  it('executes via InnovationAgent successfully', async () => {
    permManager.grantPermission({
      userId: 'agent_user',
      resource: ResourceType.INNOVATION,
      level: PermissionLevel.WRITE,
      allowedActions: ['read', 'write', 'execute'],
      grantedBy: 'system',
    });

    const agent = new InnovationAgent(manager);
    const result = await agent.execute(
      {
        action: 'create_product_blueprint',
        title: 'Agentic FinTech',
        idea: 'Algorithmic financial risk analyzer',
        category: 'fintech',
      },
      {
        userId: 'agent_user',
        sessionId: 'sess_1',
        contextId: 'ctx_1',
      } as any
    );

    expect(result.success).toBe(true);
    expect(result.agentId).toBe('innovation-agent');
    expect((result.data as any).productName).toBe('Agentic FinTech');
  });
});
