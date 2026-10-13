/**
 * JARVIS Phase 15 - Product Innovation Manager & Security Coordinator
 * Coordinates market research, personas, RICE prioritization, UX journeys,
 * technical blueprints, sprint roadmaps, and viability evaluations.
 * Enforces permissions (ResourceType.INNOVATION), Guardian checks, and audit logging.
 */

import { MarketResearcher } from './market-researcher.js';
import { ProductSpecEngine } from './product-spec-engine.js';
import { UxArchitectureDesigner } from './ux-architecture-designer.js';
import { SprintRoadmapPlanner } from './sprint-roadmap-planner.js';
import {
  MarketResearchResult,
  UserPersona,
  ProductFeature,
  UserJourneyStep,
  TechnicalArchitectureBlueprint,
  SprintRoadmap,
  ProductViabilityScore,
  FullProductBlueprint,
  InnovationSystemStatus,
} from './innovation.interface.js';
import { PermissionManager } from '../security/permission-manager.js';
import { SecurityGuardian } from '../security/guardian.js';
import { AuditLogger } from '../audit/audit-logger.js';
import {
  ResourceType,
  PermissionLevel,
  PermissionAction,
  SecurityDecisionType,
} from '../security/types.js';
import { logger } from '../utils/logger.js';

export class InnovationManager {
  private marketResearcher: MarketResearcher;
  private productSpecEngine: ProductSpecEngine;
  private uxArchitectureDesigner: UxArchitectureDesigner;
  private sprintRoadmapPlanner: SprintRoadmapPlanner;

  private permissionManager: PermissionManager;
  private guardian: SecurityGuardian;
  private auditLogger: AuditLogger;

  private blueprints: Map<string, FullProductBlueprint> = new Map();
  private totalFeaturesScored = 0;
  private totalPersonasSynthesized = 0;

  constructor(
    permissionManager: PermissionManager,
    guardian: SecurityGuardian,
    auditLogger: AuditLogger,
    marketResearcher?: MarketResearcher,
    productSpecEngine?: ProductSpecEngine,
    uxArchitectureDesigner?: UxArchitectureDesigner,
    sprintRoadmapPlanner?: SprintRoadmapPlanner
  ) {
    this.permissionManager = permissionManager;
    this.guardian = guardian;
    this.auditLogger = auditLogger;

    this.marketResearcher = marketResearcher || new MarketResearcher();
    this.productSpecEngine = productSpecEngine || new ProductSpecEngine();
    this.uxArchitectureDesigner = uxArchitectureDesigner || new UxArchitectureDesigner();
    this.sprintRoadmapPlanner = sprintRoadmapPlanner || new SprintRoadmapPlanner();
  }

  /**
   * Executes the complete 12-stage Innovation pipeline to synthesize a FullProductBlueprint.
   */
  public async createProductBlueprint(
    params: {
      title: string;
      tagline?: string;
      idea: string;
      category?: string;
      scaleTier?: 'starter' | 'growth' | 'enterprise';
    },
    userId: string = 'default_user'
  ): Promise<FullProductBlueprint> {
    this.assertPermission(userId, 'write', PermissionLevel.WRITE, 'create_product_blueprint');
    this.assertGuardian(userId, 'write', `create_product_blueprint:${params.title}`);

    logger.info(`[InnovationManager] Creating Product Blueprint "${params.title}" for user ${userId}`);

    const id = `blueprint-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const tagline = params.tagline || `Autonomous, high-velocity platform for ${params.title.toLowerCase()}`;

    // 1. Market Research
    const marketResearch = this.marketResearcher.analyzeMarket(params.idea, params.category);

    // 2. Target Personas
    const targetPersonas = this.productSpecEngine.generatePersonas(params.idea, 3);
    this.totalPersonasSynthesized += targetPersonas.length;

    // 3. Features & RICE Prioritization
    const features = this.productSpecEngine.synthesizeFeatures(params.idea);
    this.totalFeaturesScored += features.length;

    // 4. UX User Journey
    const userJourney = this.uxArchitectureDesigner.generateUserJourney(params.idea);

    // 5. Technical Blueprint
    const technicalBlueprint = this.uxArchitectureDesigner.generateTechnicalBlueprint(
      params.idea,
      params.scaleTier || 'starter'
    );

    // 6. Sprint Roadmap
    const roadmap = this.sprintRoadmapPlanner.planSprintRoadmap(params.title, features);

    // 7. Viability Score
    const viability = this.sprintRoadmapPlanner.evaluateViability(params.idea, marketResearch, features);

    const blueprint: FullProductBlueprint = {
      id,
      productName: params.title,
      tagline,
      idea: params.idea,
      marketResearch,
      targetPersonas,
      features,
      userJourney,
      technicalBlueprint,
      roadmap,
      viability,
      createdAt: new Date().toISOString(),
    };

    this.blueprints.set(id, blueprint);

    this.recordAudit(userId, 'write', PermissionLevel.WRITE, 'Generated Full Product Blueprint', {
      blueprintId: id,
      productName: params.title,
      viabilityScore: viability.overallScorePercent,
      totalSprints: roadmap.sprints.length,
      featuresCount: features.length,
    });

    return blueprint;
  }

  /**
   * Performs standalone market research.
   */
  public async researchMarket(
    idea: string,
    category?: string,
    userId: string = 'default_user'
  ): Promise<MarketResearchResult> {
    this.assertPermission(userId, 'read', PermissionLevel.READ, 'research_market');
    this.assertGuardian(userId, 'read', 'research_market');

    const result = this.marketResearcher.analyzeMarket(idea, category);

    this.recordAudit(userId, 'read', PermissionLevel.READ, 'Researched market opportunity', {
      tam: result.tamSamSom.tam,
      competitorsCount: result.competitors.length,
    });

    return result;
  }

  /**
   * Generates standalone user personas.
   */
  public async defineUserPersonas(
    idea: string,
    count: number = 3,
    userId: string = 'default_user'
  ): Promise<UserPersona[]> {
    this.assertPermission(userId, 'read', PermissionLevel.READ, 'define_user_persona');
    this.assertGuardian(userId, 'read', 'define_user_persona');

    const personas = this.productSpecEngine.generatePersonas(idea, count);
    this.totalPersonasSynthesized += personas.length;

    this.recordAudit(userId, 'read', PermissionLevel.READ, 'Defined user personas', {
      count: personas.length,
    });

    return personas;
  }

  /**
   * Prioritizes a feature list with RICE scoring.
   */
  public async prioritizeFeatures(
    rawFeatures: Array<{
      id?: string;
      name: string;
      description: string;
      reach?: number;
      impact?: number;
      confidence?: number;
      effort?: number;
      category?: 'must' | 'should' | 'could' | 'wont';
    }>,
    userId: string = 'default_user'
  ): Promise<ProductFeature[]> {
    this.assertPermission(userId, 'write', PermissionLevel.WRITE, 'prioritize_features');
    this.assertGuardian(userId, 'write', 'prioritize_features');

    const features = this.productSpecEngine.prioritizeFeatures(rawFeatures);
    this.totalFeaturesScored += features.length;

    this.recordAudit(userId, 'write', PermissionLevel.WRITE, 'Prioritized product features with RICE', {
      count: features.length,
      topScore: features[0]?.rice.score,
    });

    return features;
  }

  /**
   * Generates standalone user journey steps.
   */
  public async designUxJourney(
    idea: string,
    userId: string = 'default_user'
  ): Promise<UserJourneyStep[]> {
    this.assertPermission(userId, 'read', PermissionLevel.READ, 'design_ux_journey');
    this.assertGuardian(userId, 'read', 'design_ux_journey');

    const journey = this.uxArchitectureDesigner.generateUserJourney(idea);

    this.recordAudit(userId, 'read', PermissionLevel.READ, 'Designed user journey flow', {
      stepsCount: journey.length,
    });

    return journey;
  }

  /**
   * Generates technical architecture blueprint.
   */
  public async generateTechBlueprint(
    idea: string,
    scaleTier: 'starter' | 'growth' | 'enterprise' = 'starter',
    userId: string = 'default_user'
  ): Promise<TechnicalArchitectureBlueprint> {
    this.assertPermission(userId, 'read', PermissionLevel.READ, 'generate_tech_blueprint');
    this.assertGuardian(userId, 'read', 'generate_tech_blueprint');

    const blueprint = this.uxArchitectureDesigner.generateTechnicalBlueprint(idea, scaleTier);

    this.recordAudit(userId, 'read', PermissionLevel.READ, 'Generated technical architecture blueprint', {
      archType: blueprint.architectureType,
      endpointsCount: blueprint.apiEndpoints.length,
    });

    return blueprint;
  }

  /**
   * Plans sprint roadmap.
   */
  public async planSprintRoadmap(
    title: string,
    features: ProductFeature[] = [],
    userId: string = 'default_user'
  ): Promise<SprintRoadmap> {
    this.assertPermission(userId, 'read', PermissionLevel.READ, 'plan_sprint_roadmap');
    this.assertGuardian(userId, 'read', 'plan_sprint_roadmap');

    const roadmap = this.sprintRoadmapPlanner.planSprintRoadmap(title, features);

    this.recordAudit(userId, 'read', PermissionLevel.READ, 'Planned agile sprint roadmap', {
      title,
      totalWeeks: roadmap.totalEstimatedWeeks,
      sprintsCount: roadmap.sprints.length,
    });

    return roadmap;
  }

  /**
   * Evaluates viability and PMF score.
   */
  public async evaluateViability(
    idea: string,
    market?: MarketResearchResult,
    features?: ProductFeature[],
    userId: string = 'default_user'
  ): Promise<ProductViabilityScore> {
    this.assertPermission(userId, 'read', PermissionLevel.READ, 'evaluate_viability');
    this.assertGuardian(userId, 'read', 'evaluate_viability');

    const m = market || this.marketResearcher.analyzeMarket(idea);
    const f = features || this.productSpecEngine.synthesizeFeatures(idea);

    const score = this.sprintRoadmapPlanner.evaluateViability(idea, m, f);

    this.recordAudit(userId, 'read', PermissionLevel.READ, 'Evaluated product viability score', {
      overallScore: score.overallScorePercent,
    });

    return score;
  }

  /**
   * Retrieves a generated blueprint by ID.
   */
  public getBlueprint(id: string, userId: string = 'default_user'): FullProductBlueprint | undefined {
    this.assertPermission(userId, 'read', PermissionLevel.READ, 'get_blueprint');
    return this.blueprints.get(id);
  }

  /**
   * Lists all generated blueprints.
   */
  public listBlueprints(userId: string = 'default_user'): FullProductBlueprint[] {
    this.assertPermission(userId, 'read', PermissionLevel.READ, 'list_blueprints');
    return Array.from(this.blueprints.values());
  }

  /**
   * Retrieves system status.
   */
  public getSystemStatus(): InnovationSystemStatus {
    return {
      serviceName: 'JARVIS Product Innovation & Venture Architecture Service',
      version: '1.0.0',
      activeFrameworks: [
        '12-Stage Venture Pipeline',
        'TAM/SAM/SOM Market Modeling',
        'RICE Feature Prioritization',
        'MoSCoW Requirements Hierarchy',
        'Jobs-To-Be-Done (JTBD) User Archetyping',
        '5-Stage Emotional UX Journey Mapping',
        'Modular Clean Architecture Blueprints',
        'Agile Sprint Velocity Roadmapping',
      ],
      totalBlueprintsGenerated: this.blueprints.size,
      totalFeaturesScored: this.totalFeaturesScored,
      totalPersonasSynthesized: this.totalPersonasSynthesized,
    };
  }

  // --- Security Helpers ---

  private assertPermission(
    userId: string,
    action: 'read' | 'write' | 'execute',
    requiredLevel: PermissionLevel,
    targetIdentifier: string
  ): void {
    const permResult = this.permissionManager.checkPermission({
      userId,
      resource: ResourceType.INNOVATION,
      action,
      requiredLevel,
      targetIdentifier,
    });

    if (!permResult.allowed) {
      throw new Error(`Permission Denied on INNOVATION: User "${userId}" lacks required ${requiredLevel} permission.`);
    }
  }

  private assertGuardian(userId: string, action: 'read' | 'write' | 'execute', target: string): void {
    const decision = this.guardian.evaluate({
      resource: ResourceType.INNOVATION,
      action,
      target,
      userId,
    });

    if (decision.decision === SecurityDecisionType.DENY) {
      throw new Error(`Security Guardian blocked Innovation action: ${decision.reason || 'Threat detected'}`);
    }
  }

  private recordAudit(
    userId: string,
    action: 'read' | 'write' | 'execute',
    permissionRequired: PermissionLevel,
    reason: string,
    details?: Record<string, any>
  ): void {
    try {
      this.auditLogger.log({
        user: userId,
        requestId: `req_innov_${Date.now()}`,
        resource: ResourceType.INNOVATION,
        action,
        permissionRequired,
        decision: SecurityDecisionType.ALLOW,
        reason,
        result: 'SUCCESS',
        details,
      });
    } catch (err: any) {
      logger.warn(`[InnovationManager] Failed to record audit log: ${err.message}`);
    }
  }
}
