/**
 * JARVIS Phase 15 - Innovation Tool Definitions
 * 8 Registered Tools for Market Research, User Personas, Feature Prioritization,
 * UX Journeys, Technical Blueprints, Sprint Roadmaps, and Viability Scoring.
 */

import { ITool, ToolDefinition, ToolExecutionContext, ToolExecutionResult } from '../tools/tool.interface.js';
import { InnovationManager } from './innovation-manager.js';
import { ResourceType, PermissionLevel } from '../security/types.js';

/**
 * 1. InnovationResearchMarketTool: innovation.research_market
 */
export class InnovationResearchMarketTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'innovation.research_market',
    name: 'Research Market Opportunity',
    description: 'Calculates TAM/SAM/SOM market sizing, analyzes competitors, and discovers customer pain points.',
    version: '1.0.0',
    requiredPermissions: [
      { resource: ResourceType.INNOVATION, action: 'read', level: PermissionLevel.READ },
    ],
    parametersSchema: {
      type: 'object',
      properties: {
        idea: { type: 'string' },
        category: { type: 'string' },
      },
      required: ['idea'],
    },
    status: 'implemented',
  };

  constructor(private readonly manager: InnovationManager) {}

  public async execute(params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const p = (params || {}) as any;
      const result = await this.manager.researchMarket(p.idea, p.category, context.userId);
      return {
        success: true,
        toolId: this.definition.id,
        data: result,
        verified: true,
        executionTimeMs: Date.now() - startTime,
      };
    } catch (err: any) {
      return {
        success: false,
        toolId: this.definition.id,
        error: err.message || 'Market research failed',
        verified: false,
        executionTimeMs: Date.now() - startTime,
      };
    }
  }
}

/**
 * 2. InnovationDefineUserPersonaTool: innovation.define_user_persona
 */
export class InnovationDefineUserPersonaTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'innovation.define_user_persona',
    name: 'Define User Personas',
    description: 'Generates detailed target user personas (ICP) with demographics, goals, Jobs-to-be-Done, and pain points.',
    version: '1.0.0',
    requiredPermissions: [
      { resource: ResourceType.INNOVATION, action: 'read', level: PermissionLevel.READ },
    ],
    parametersSchema: {
      type: 'object',
      properties: {
        idea: { type: 'string' },
        count: { type: 'number' },
      },
      required: ['idea'],
    },
    status: 'implemented',
  };

  constructor(private readonly manager: InnovationManager) {}

  public async execute(params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const p = (params || {}) as any;
      const personas = await this.manager.defineUserPersonas(p.idea, p.count || 3, context.userId);
      return {
        success: true,
        toolId: this.definition.id,
        data: { personas, count: personas.length },
        verified: true,
        executionTimeMs: Date.now() - startTime,
      };
    } catch (err: any) {
      return {
        success: false,
        toolId: this.definition.id,
        error: err.message || 'Defining user personas failed',
        verified: false,
        executionTimeMs: Date.now() - startTime,
      };
    }
  }
}

/**
 * 3. InnovationPrioritizeFeaturesTool: innovation.prioritize_features
 */
export class InnovationPrioritizeFeaturesTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'innovation.prioritize_features',
    name: 'Prioritize Product Features',
    description: 'Scores product features with RICE (Reach, Impact, Confidence, Effort) and classifies via MoSCoW.',
    version: '1.0.0',
    requiredPermissions: [
      { resource: ResourceType.INNOVATION, action: 'write', level: PermissionLevel.WRITE },
    ],
    parametersSchema: {
      type: 'object',
      properties: {
        features: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              description: { type: 'string' },
              reach: { type: 'number' },
              impact: { type: 'number' },
              confidence: { type: 'number' },
              effort: { type: 'number' },
            },
            required: ['name', 'description'],
          },
        },
      },
      required: ['features'],
    },
    status: 'implemented',
  };

  constructor(private readonly manager: InnovationManager) {}

  public async execute(params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const p = (params || {}) as any;
      const features = await this.manager.prioritizeFeatures(p.features || [], context.userId);
      return {
        success: true,
        toolId: this.definition.id,
        data: { features, count: features.length },
        verified: true,
        executionTimeMs: Date.now() - startTime,
      };
    } catch (err: any) {
      return {
        success: false,
        toolId: this.definition.id,
        error: err.message || 'Feature prioritization failed',
        verified: false,
        executionTimeMs: Date.now() - startTime,
      };
    }
  }
}

/**
 * 4. InnovationDesignUxJourneyTool: innovation.design_ux_journey
 */
export class InnovationDesignUxJourneyTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'innovation.design_ux_journey',
    name: 'Design UX Journey',
    description: 'Maps the 5-stage customer experience journey with emotional states and UI wireframe cues.',
    version: '1.0.0',
    requiredPermissions: [
      { resource: ResourceType.INNOVATION, action: 'read', level: PermissionLevel.READ },
    ],
    parametersSchema: {
      type: 'object',
      properties: {
        idea: { type: 'string' },
      },
      required: ['idea'],
    },
    status: 'implemented',
  };

  constructor(private readonly manager: InnovationManager) {}

  public async execute(params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const p = (params || {}) as any;
      const journey = await this.manager.designUxJourney(p.idea, context.userId);
      return {
        success: true,
        toolId: this.definition.id,
        data: { journey, stepsCount: journey.length },
        verified: true,
        executionTimeMs: Date.now() - startTime,
      };
    } catch (err: any) {
      return {
        success: false,
        toolId: this.definition.id,
        error: err.message || 'Designing UX journey failed',
        verified: false,
        executionTimeMs: Date.now() - startTime,
      };
    }
  }
}

/**
 * 5. InnovationGenerateTechBlueprintTool: innovation.generate_tech_blueprint
 */
export class InnovationGenerateTechBlueprintTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'innovation.generate_tech_blueprint',
    name: 'Generate Technical Blueprint',
    description: 'Designs full-stack technical architecture, data models, RESTful endpoints, and security specifications.',
    version: '1.0.0',
    requiredPermissions: [
      { resource: ResourceType.INNOVATION, action: 'read', level: PermissionLevel.READ },
    ],
    parametersSchema: {
      type: 'object',
      properties: {
        idea: { type: 'string' },
        scaleTier: { type: 'string', enum: ['starter', 'growth', 'enterprise'] },
      },
      required: ['idea'],
    },
    status: 'implemented',
  };

  constructor(private readonly manager: InnovationManager) {}

  public async execute(params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const p = (params || {}) as any;
      const blueprint = await this.manager.generateTechBlueprint(p.idea, p.scaleTier || 'starter', context.userId);
      return {
        success: true,
        toolId: this.definition.id,
        data: blueprint,
        verified: true,
        executionTimeMs: Date.now() - startTime,
      };
    } catch (err: any) {
      return {
        success: false,
        toolId: this.definition.id,
        error: err.message || 'Generating technical blueprint failed',
        verified: false,
        executionTimeMs: Date.now() - startTime,
      };
    }
  }
}

/**
 * 6. InnovationPlanSprintRoadmapTool: innovation.plan_sprint_roadmap
 */
export class InnovationPlanSprintRoadmapTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'innovation.plan_sprint_roadmap',
    name: 'Plan Sprint Roadmap',
    description: 'Creates a milestone-driven agile sprint roadmap with deliverables, risk grading, and launch checklist.',
    version: '1.0.0',
    requiredPermissions: [
      { resource: ResourceType.INNOVATION, action: 'read', level: PermissionLevel.READ },
    ],
    parametersSchema: {
      type: 'object',
      properties: {
        productTitle: { type: 'string' },
        features: { type: 'array' },
      },
      required: ['productTitle'],
    },
    status: 'implemented',
  };

  constructor(private readonly manager: InnovationManager) {}

  public async execute(params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const p = (params || {}) as any;
      const roadmap = await this.manager.planSprintRoadmap(p.productTitle, p.features || [], context.userId);
      return {
        success: true,
        toolId: this.definition.id,
        data: roadmap,
        verified: true,
        executionTimeMs: Date.now() - startTime,
      };
    } catch (err: any) {
      return {
        success: false,
        toolId: this.definition.id,
        error: err.message || 'Planning sprint roadmap failed',
        verified: false,
        executionTimeMs: Date.now() - startTime,
      };
    }
  }
}

/**
 * 7. InnovationCreateProductBlueprintTool: innovation.create_product_blueprint
 */
export class InnovationCreateProductBlueprintTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'innovation.create_product_blueprint',
    name: 'Create Full Product Blueprint',
    description: 'Executes the end-to-end 12-stage venture pipeline to synthesize an all-in-one product blueprint.',
    version: '1.0.0',
    requiredPermissions: [
      { resource: ResourceType.INNOVATION, action: 'write', level: PermissionLevel.WRITE },
    ],
    parametersSchema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        tagline: { type: 'string' },
        idea: { type: 'string' },
        category: { type: 'string' },
        scaleTier: { type: 'string', enum: ['starter', 'growth', 'enterprise'] },
      },
      required: ['title', 'idea'],
    },
    status: 'implemented',
  };

  constructor(private readonly manager: InnovationManager) {}

  public async execute(params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const p = (params || {}) as any;
      const blueprint = await this.manager.createProductBlueprint(
        {
          title: p.title,
          tagline: p.tagline,
          idea: p.idea,
          category: p.category,
          scaleTier: p.scaleTier,
        },
        context.userId
      );
      return {
        success: true,
        toolId: this.definition.id,
        data: blueprint,
        verified: true,
        executionTimeMs: Date.now() - startTime,
      };
    } catch (err: any) {
      return {
        success: false,
        toolId: this.definition.id,
        error: err.message || 'Creating product blueprint failed',
        verified: false,
        executionTimeMs: Date.now() - startTime,
      };
    }
  }
}

/**
 * 8. InnovationEvaluateViabilityTool: innovation.evaluate_viability
 */
export class InnovationEvaluateViabilityTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'innovation.evaluate_viability',
    name: 'Evaluate Product Viability',
    description: 'Calculates deterministic Product-Market Fit viability scores, key strengths, and critical risk factors.',
    version: '1.0.0',
    requiredPermissions: [
      { resource: ResourceType.INNOVATION, action: 'read', level: PermissionLevel.READ },
    ],
    parametersSchema: {
      type: 'object',
      properties: {
        idea: { type: 'string' },
      },
      required: ['idea'],
    },
    status: 'implemented',
  };

  constructor(private readonly manager: InnovationManager) {}

  public async execute(params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const p = (params || {}) as any;
      const viability = await this.manager.evaluateViability(p.idea, undefined, undefined, context.userId);
      return {
        success: true,
        toolId: this.definition.id,
        data: viability,
        verified: true,
        executionTimeMs: Date.now() - startTime,
      };
    } catch (err: any) {
      return {
        success: false,
        toolId: this.definition.id,
        error: err.message || 'Evaluating viability failed',
        verified: false,
        executionTimeMs: Date.now() - startTime,
      };
    }
  }
}

export function createInnovationTools(manager: InnovationManager): ITool[] {
  return [
    new InnovationResearchMarketTool(manager),
    new InnovationDefineUserPersonaTool(manager),
    new InnovationPrioritizeFeaturesTool(manager),
    new InnovationDesignUxJourneyTool(manager),
    new InnovationGenerateTechBlueprintTool(manager),
    new InnovationPlanSprintRoadmapTool(manager),
    new InnovationCreateProductBlueprintTool(manager),
    new InnovationEvaluateViabilityTool(manager),
  ];
}
