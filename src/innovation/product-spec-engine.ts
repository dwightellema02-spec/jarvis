/**
 * JARVIS Phase 15 - Product Spec Engine
 * Generates User Personas (ICP & JTBD) and performs RICE scoring and MoSCoW prioritization.
 */

import { UserPersona, ProductFeature } from './innovation.interface.js';

export class ProductSpecEngine {
  /**
   * Generates target user personas based on the product concept.
   */
  public generatePersonas(idea: string, count: number = 3): UserPersona[] {
    const text = idea.toLowerCase();
    const personas: UserPersona[] = [];

    // Persona 1: The Core Builder / Practitioner
    personas.push({
      name: 'Alex Rivera',
      role: 'Staff Engineer & Venture Builder',
      archetype: 'The Visionary Builder',
      demographics: 'Age 28-38, Tech Hubs / Remote, 8+ years experience building web/cloud systems',
      goals: [
        'Rapidly prototype and validate production-ready software architectures without boilerplate',
        'Maintain rock-solid security postures and verifiable audit trails out of the box',
        'Multiply solo output to rival full engineering teams',
      ],
      jobsToBeDone: [
        'When I conceive a new venture or architectural service, I want to generate a full technical specification and sprint roadmap immediately, so I can start executing without days of manual documentation.',
        'When running automated agents, I want strict permission boundaries so that no unauthorized file writes or external leaks occur.',
      ],
      painPoints: [
        'Endless repetitive setup for database models, API scaffolding, and CI/CD pipelines',
        'AI coding tools that hallucinate invalid architectures or unvetted external dependencies',
        'Lack of end-to-end coherence between product specs, wireframes, and code implementation',
      ],
      willingnessToPay: 'high',
      quote: `"I don't just want code completion—I need an autonomous partner that understands the complete venture architecture from Day 1."`,
    });

    if (count > 1) {
      // Persona 2: The Decision Maker / Technical Lead
      personas.push({
        name: 'Sarah Chen',
        role: 'VP of Engineering / Fractional CTO',
        archetype: 'The Pragmatic Scaler',
        demographics: 'Age 36-48, Seed to Series-B Tech Startups, manages 5-25 engineers',
        goals: [
          'Accelerate time-to-market for MVP deliverables by 3x-5x',
          'Ensure strict compliance, rate limiting, and RBAC across all engineering initiatives',
          'Accurately forecast engineering sprint velocity and reduce technical debt',
        ],
        jobsToBeDone: [
          'When evaluating new product initiatives, I want deterministic RICE scores and sprint risk matrices, so I can allocate budget and headcount with total confidence.',
          'When onboarding junior developers or agents, I want standardized architectural blueprints so team standards remain pristine.',
        ],
        painPoints: [
          'Uncontrolled feature creep and vague sprint roadmaps draining developer bandwidth',
          'Security vulnerabilities introduced by unvetted open-source libraries and ad-hoc scripts',
          'Difficulties quantifying the ROI of emerging AI tooling across the engineering org',
        ],
        willingnessToPay: 'high',
        quote: `"Speed without verifiable architecture is just technical bankruptcy. Give me verifiable roadmaps with strict security bounds."`,
      });
    }

    if (count > 2) {
      // Persona 3: The Product Strategist / Growth Founder
      personas.push({
        name: 'Marcus Vance',
        role: 'Product Strategy Lead / Bootstrapped Founder',
        archetype: 'The Market Innovator',
        demographics: 'Age 26-42, Digital Nomad / Indie Hacker, focused on rapid PMF discovery',
        goals: [
          'De-risk product ideas with structured market sizing and competitive moat analysis',
          'Map customer journey touchpoints with high emotional resonance and seamless onboarding',
          'Achieve sustainable unit economics and rapid product-market fit',
        ],
        jobsToBeDone: [
          'When brainstorming market opportunities, I want instant TAM/SAM/SOM breakdowns and competitor matrices, so I can spot market gaps before writing a line of code.',
          'When designing user flows, I want wireframe cues and journey states to guide the design sprint.',
        ],
        painPoints: [
          'Spending weeks on market research that becomes obsolete before launch',
          "Building features that customers don't actually need or pay for",
          'High agency costs for UI/UX wireframing and product discovery workshops',
        ],
        willingnessToPay: 'medium',
        quote: `"Great products fail when founders build in the dark. I want structured clarity on who pays, why now, and what to build first."`,
      });
    }

    return personas.slice(0, count);
  }

  /**
   * Calculates RICE scores and categorizes features using MoSCoW.
   */
  public prioritizeFeatures(
    rawFeatures: Array<{
      id?: string;
      name: string;
      description: string;
      reach?: number;
      impact?: number;
      confidence?: number;
      effort?: number;
      category?: 'must' | 'should' | 'could' | 'wont';
    }>
  ): ProductFeature[] {
    const scoredFeatures = rawFeatures.map((f, index) => {
      const id = f.id || `feat-${Date.now().toString(36)}-${index + 1}`;
      const reach = Math.min(10, Math.max(1, f.reach ?? 7));
      const impact = Math.min(5, Math.max(1, f.impact ?? 3));
      const confidence = Math.min(1.0, Math.max(0.1, f.confidence ?? 0.8));
      const effort = Math.min(10, Math.max(1, f.effort ?? 4));

      // RICE formula: (Reach * Impact * Confidence) / Effort
      const rawScore = (reach * impact * confidence) / effort;
      const score = Math.round(rawScore * 10) / 10;

      let complexity: 'low' | 'medium' | 'high' = 'medium';
      if (effort <= 3) complexity = 'low';
      else if (effort >= 7) complexity = 'high';

      return {
        id,
        name: f.name,
        description: f.description,
        rice: {
          reach,
          impact,
          confidence,
          effort,
          score,
        },
        complexity,
        category: f.category || ('should' as const),
      };
    });

    // Sort descending by RICE score
    scoredFeatures.sort((a, b) => b.rice.score - a.rice.score);

    // Assign MoSCoW categories dynamically if not explicitly specified
    const total = scoredFeatures.length;
    return scoredFeatures.map((feat, index) => {
      if (feat.category && feat.category !== 'should') {
        return feat;
      }
      let category: 'must' | 'should' | 'could' | 'wont';
      if (index < Math.ceil(total * 0.35)) {
        category = 'must';
      } else if (index < Math.ceil(total * 0.7)) {
        category = 'should';
      } else if (index < total - 1) {
        category = 'could';
      } else {
        category = 'wont';
      }

      return {
        ...feat,
        category,
      };
    });
  }

  /**
   * Synthesizes a standard 6-feature suite tailored to the idea.
   */
  public synthesizeFeatures(idea: string): ProductFeature[] {
    const rawList = [
      {
        name: 'Core Automated Execution Engine',
        description: `Primary end-to-end workflow runner for ${idea.substring(0, 35)} with real-time feedback and state persistence.`,
        reach: 9,
        impact: 5,
        confidence: 0.9,
        effort: 5,
      },
      {
        name: 'Default-Deny Security Guardian & RBAC',
        description: 'Multi-tenant authorization, audit logging, and automated threat modeling for all write operations.',
        reach: 8,
        impact: 4,
        confidence: 0.85,
        effort: 4,
      },
      {
        name: 'Interactive Studio & Live Dashboard',
        description: 'Intuitive web console with real-time metrics, telemetry graphs, and quick-action configuration controls.',
        reach: 8,
        impact: 4,
        confidence: 0.8,
        effort: 4,
      },
      {
        name: 'RESTful API & Webhook Dispatcher',
        description: 'Developer-first programmatic endpoints for seamless CI/CD integration and external automation triggers.',
        reach: 7,
        impact: 3,
        confidence: 0.8,
        effort: 3,
      },
      {
        name: 'Automated Insight & Analytics Generator',
        description: 'Periodic performance analysis, anomaly detection, and automated executive summary exports.',
        reach: 6,
        impact: 3,
        confidence: 0.75,
        effort: 4,
      },
      {
        name: 'Legacy Cloud Import/Export Bridge',
        description: 'Compatibility adapter for legacy CSV/JSON formats and external 3rd-party SaaS systems.',
        reach: 4,
        impact: 2,
        confidence: 0.6,
        effort: 6,
      },
    ];

    return this.prioritizeFeatures(rawList);
  }
}
