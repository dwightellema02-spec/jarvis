/**
 * JARVIS Phase 15 - Product Innovation Agent Implementation
 * Autonomous agent executing the 12-stage venture architecture pipeline.
 */

import {
  IAgent,
  AgentDefinition,
  AgentExecutionContext,
  AgentExecutionResult,
} from '../agents/agent.interface.js';
import { InnovationManager } from './innovation-manager.js';
import { ResourceType, PermissionLevel } from '../security/types.js';

export interface InnovationAgentInput {
  action:
    | 'create_product_blueprint'
    | 'research_market'
    | 'define_user_persona'
    | 'prioritize_features'
    | 'design_ux_journey'
    | 'generate_tech_blueprint'
    | 'plan_sprint_roadmap'
    | 'evaluate_viability';
  title?: string;
  tagline?: string;
  idea?: string;
  category?: string;
  scaleTier?: 'starter' | 'growth' | 'enterprise';
  count?: number;
  features?: Array<{
    name: string;
    description: string;
    reach?: number;
    impact?: number;
    confidence?: number;
    effort?: number;
    category?: any;
  }>;
}

export class InnovationAgent implements IAgent {
  public readonly definition: AgentDefinition = {
    id: 'innovation-agent',
    name: 'JARVIS Product Innovation Agent',
    description:
      'Autonomous venture architect executing the 12-stage pipeline: market research, ICP personas, RICE prioritization, UX flows, technical architecture, and sprint roadmaps.',
    version: '1.0.0',
    capabilities: [
      'create_product_blueprint',
      'research_market',
      'define_user_persona',
      'prioritize_features',
      'design_ux_journey',
      'generate_tech_blueprint',
      'plan_sprint_roadmap',
      'evaluate_viability',
    ],
    requiredPermissions: [
      {
        resource: ResourceType.INNOVATION,
        action: 'write',
        level: PermissionLevel.WRITE,
      },
    ],
    inputSchema: {
      action: 'string',
      title: 'string?',
      idea: 'string?',
      tagline: 'string?',
      category: 'string?',
      scaleTier: 'string?',
      count: 'number?',
      features: 'array?',
    },
    outputSchema: {
      success: 'boolean',
      data: 'any',
    },
    status: 'implemented',
  };

  private manager: InnovationManager;

  constructor(manager: InnovationManager) {
    this.manager = manager;
  }

  public async execute(
    rawInput: unknown,
    context: AgentExecutionContext
  ): Promise<AgentExecutionResult> {
    const startTime = Date.now();
    const input = (rawInput || {}) as InnovationAgentInput;
    const userId = context.userId || 'default_user';

    try {
      switch (input.action) {
        case 'create_product_blueprint': {
          if (!input.title || !input.idea) {
            return {
              success: false,
              agentId: this.definition.id,
              error: 'Both "title" and "idea" are required to create a full product blueprint.',
              executionTimeMs: Date.now() - startTime,
            };
          }
          const blueprint = await this.manager.createProductBlueprint(
            {
              title: input.title,
              tagline: input.tagline,
              idea: input.idea,
              category: input.category,
              scaleTier: input.scaleTier,
            },
            userId
          );
          return {
            success: true,
            agentId: this.definition.id,
            data: blueprint,
            executionTimeMs: Date.now() - startTime,
          };
        }

        case 'research_market': {
          if (!input.idea) {
            return {
              success: false,
              agentId: this.definition.id,
              error: '"idea" is required for market research.',
              executionTimeMs: Date.now() - startTime,
            };
          }
          const research = await this.manager.researchMarket(input.idea, input.category, userId);
          return {
            success: true,
            agentId: this.definition.id,
            data: research,
            executionTimeMs: Date.now() - startTime,
          };
        }

        case 'define_user_persona': {
          if (!input.idea) {
            return {
              success: false,
              agentId: this.definition.id,
              error: '"idea" is required to define personas.',
              executionTimeMs: Date.now() - startTime,
            };
          }
          const personas = await this.manager.defineUserPersonas(input.idea, input.count || 3, userId);
          return {
            success: true,
            agentId: this.definition.id,
            data: personas,
            executionTimeMs: Date.now() - startTime,
          };
        }

        case 'prioritize_features': {
          const raw = input.features || [];
          if (raw.length === 0 && !input.idea) {
            return {
              success: false,
              agentId: this.definition.id,
              error: 'Either "features" array or "idea" is required.',
              executionTimeMs: Date.now() - startTime,
            };
          }
          let features;
          if (raw.length > 0) {
            features = await this.manager.prioritizeFeatures(raw, userId);
          } else {
            const bp = await this.manager.createProductBlueprint(
              { title: input.title || 'Product Concept', idea: input.idea! },
              userId
            );
            features = bp.features;
          }
          return {
            success: true,
            agentId: this.definition.id,
            data: features,
            executionTimeMs: Date.now() - startTime,
          };
        }

        case 'design_ux_journey': {
          if (!input.idea) {
            return {
              success: false,
              agentId: this.definition.id,
              error: '"idea" is required to design user journey.',
              executionTimeMs: Date.now() - startTime,
            };
          }
          const journey = await this.manager.designUxJourney(input.idea, userId);
          return {
            success: true,
            agentId: this.definition.id,
            data: journey,
            executionTimeMs: Date.now() - startTime,
          };
        }

        case 'generate_tech_blueprint': {
          if (!input.idea) {
            return {
              success: false,
              agentId: this.definition.id,
              error: '"idea" is required to generate technical blueprint.',
              executionTimeMs: Date.now() - startTime,
            };
          }
          const techBp = await this.manager.generateTechBlueprint(
            input.idea,
            input.scaleTier || 'starter',
            userId
          );
          return {
            success: true,
            agentId: this.definition.id,
            data: techBp,
            executionTimeMs: Date.now() - startTime,
          };
        }

        case 'plan_sprint_roadmap': {
          const title = input.title || 'Product Venture';
          const roadmap = await this.manager.planSprintRoadmap(title, (input.features as any) || [], userId);
          return {
            success: true,
            agentId: this.definition.id,
            data: roadmap,
            executionTimeMs: Date.now() - startTime,
          };
        }

        case 'evaluate_viability': {
          if (!input.idea) {
            return {
              success: false,
              agentId: this.definition.id,
              error: '"idea" is required to evaluate viability.',
              executionTimeMs: Date.now() - startTime,
            };
          }
          const viability = await this.manager.evaluateViability(input.idea, undefined, undefined, userId);
          return {
            success: true,
            agentId: this.definition.id,
            data: viability,
            executionTimeMs: Date.now() - startTime,
          };
        }

        default:
          return {
            success: false,
            agentId: this.definition.id,
            error: `Unsupported innovation action: "${input.action}".`,
            executionTimeMs: Date.now() - startTime,
          };
      }
    } catch (err: any) {
      return {
        success: false,
        agentId: this.definition.id,
        error: err.message || 'Innovation agent execution failed.',
        executionTimeMs: Date.now() - startTime,
      };
    }
  }
}
