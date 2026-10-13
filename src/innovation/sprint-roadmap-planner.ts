/**
 * JARVIS Phase 15 - Sprint Roadmap & Viability Planner
 * Generates milestone-driven sprint roadmaps and computes deterministic Product-Market Fit viability scores.
 */

import {
  SprintRoadmap,
  SprintMilestone,
  ProductFeature,
  MarketResearchResult,
  ProductViabilityScore,
} from './innovation.interface.js';

export class SprintRoadmapPlanner {
  /**
   * Plans an agile sprint roadmap based on prioritized product features.
   */
  public planSprintRoadmap(
    productTitle: string,
    features: ProductFeature[] = []
  ): SprintRoadmap {
    const mustFeatures = features.filter((f) => f.category === 'must').map((f) => f.name);
    const shouldFeatures = features.filter((f) => f.category === 'should').map((f) => f.name);
    const couldFeatures = features.filter((f) => f.category === 'could').map((f) => f.name);

    const sprints: SprintMilestone[] = [
      {
        sprintNumber: 1,
        title: 'Sprint 1: Architecture Core & Data Ingestion Foundation',
        durationWeeks: 2,
        goal: 'Establish modular database schema, authentication, and core API foundation.',
        deliverables: [
          'PostgreSQL schema setup with Prisma migrations and connection pooling',
          'JWT authentication with role-based permission gating',
          mustFeatures[0] || 'Core Workflow Engine foundation',
          'Baseline automated unit test harness with 80%+ coverage',
        ],
        riskLevel: 'LOW',
      },
      {
        sprintNumber: 2,
        title: 'Sprint 2: Core Execution Engine & Primary User Loop',
        durationWeeks: 2,
        goal: 'Implement primary end-to-end task runner and user workflow pipeline.',
        deliverables: [
          mustFeatures[1] || 'Primary execution pipeline and state manager',
          mustFeatures[2] || 'Real-time telemetry and progress logging',
          'Error recovery strategies and structured output validation',
          'Integration test suite verifying happy-path scenarios',
        ],
        riskLevel: 'MEDIUM',
      },
      {
        sprintNumber: 3,
        title: 'Sprint 3: Web Cockpit UX & Integration Bridges',
        durationWeeks: 2,
        goal: 'Deliver responsive frontend console, export mechanisms, and external hooks.',
        deliverables: [
          shouldFeatures[0] || 'Interactive web dashboard with visual telemetry',
          shouldFeatures[1] || 'RESTful API endpoints and webhook dispatcher',
          'Client-side error boundaries and loading skeleton states',
          couldFeatures[0] || 'JSON/Markdown export bundle generator',
        ],
        riskLevel: 'MEDIUM',
      },
      {
        sprintNumber: 4,
        title: 'Sprint 4: Security Guardian Hardening & Stress Testing',
        durationWeeks: 2,
        goal: 'Perform automated threat modeling, penetration checks, and load verification.',
        deliverables: [
          'Default-deny permission audit across all write and execute routes',
          'Rate limiting, CSRF protection, and Content Security Policy enforcement',
          'Load testing under 10x projected peak request volume',
          'Cryptographic SHA-256 audit logging verification',
        ],
        riskLevel: 'HIGH',
      },
      {
        sprintNumber: 5,
        title: 'Sprint 5: Public Beta & Analytics Telemetry Launch',
        durationWeeks: 1,
        goal: 'Deploy production environment, configure live monitoring, and launch public beta.',
        deliverables: [
          'Production deploy to Cloudflare Edge / AWS ECS containers',
          'Prometheus / Grafana metrics dashboards and PagerDuty alerting',
          'User documentation, onboarding tutorial, and feedback widget',
          'Public beta access provisioning for first cohort of users',
        ],
        riskLevel: 'LOW',
      },
    ];

    const totalEstimatedWeeks = sprints.reduce((acc, s) => acc + s.durationWeeks, 0);

    return {
      productTitle,
      totalEstimatedWeeks,
      sprints,
      mvpSuccessMetrics: [
        '85%+ Day-1 Onboarding completion rate',
        '< 2.5s time-to-first-value (TTFV) for initial core task execution',
        '0 unauthorized privilege escalations or critical security vulnerabilities',
        '40%+ 30-day cohort retention rate',
        '> 60 Net Promoter Score (NPS) from early beta participants',
      ],
      launchChecklist: [
        'Security audit and automated dependency vulnerability scans clean',
        'Load testing passed at 10x projected peak volume without degraded latency',
        'OpenAPI 3.1 documentation and typed SDK client packages published',
        'Cloudflare Edge DDoS and rate limiting rules enabled',
        'Health check probes and real-time error alerting active',
        'Legal compliance: Privacy Policy, Terms of Service, and Data Retention rules published',
      ],
    };
  }

  /**
   * Deterministically evaluates Product Viability and Product-Market Fit potential.
   */
  public evaluateViability(
    idea: string,
    market: MarketResearchResult,
    features: ProductFeature[]
  ): ProductViabilityScore {
    // 1. Market Opportunity Score (0-100)
    let marketOpportunityScore = 75;
    if (market.tamSamSom.tam.includes('Billion')) marketOpportunityScore += 7;
    if (market.customerPainPoints.length >= 4) marketOpportunityScore += 5;
    if (market.competitors.length >= 2) marketOpportunityScore += 4; // Validated market demand
    marketOpportunityScore = Math.min(95, marketOpportunityScore);

    // 2. Technical Feasibility Score (0-100)
    let technicalFeasibilityScore = 80;
    const highComplexityCount = features.filter((f) => f.complexity === 'high').length;
    const lowComplexityCount = features.filter((f) => f.complexity === 'low').length;
    if (highComplexityCount <= 2) technicalFeasibilityScore += 6;
    if (lowComplexityCount >= 2) technicalFeasibilityScore += 4;
    technicalFeasibilityScore = Math.min(92, technicalFeasibilityScore);

    // 3. Competitive Defensibility Score (0-100)
    let competitiveDefensibilityScore = 72;
    const hasSecurityFeature = features.some((f) =>
      f.name.toLowerCase().includes('security') || f.name.toLowerCase().includes('guardian')
    );
    if (hasSecurityFeature) competitiveDefensibilityScore += 10;
    if (market.whyNow.length > 50) competitiveDefensibilityScore += 6;
    competitiveDefensibilityScore = Math.min(90, competitiveDefensibilityScore);

    // Overall Score Calculation: 40% Market, 35% Tech, 25% Defensibility
    const overallScorePercent = Math.round(
      marketOpportunityScore * 0.4 +
        technicalFeasibilityScore * 0.35 +
        competitiveDefensibilityScore * 0.25
    );

    const keyStrengths = [
      `Strong market tailwinds: ${market.whyNow.split(';')[0] || 'Accelerating demand for automation'}`,
      'Architectural modularity enabling rapid 9-week MVP delivery',
      'Built-in security guardian and verification engine differentiating from loose LLM wrappers',
      'High-leverage RICE prioritization targeting high-impact user pain points first',
    ];

    const criticalRisks = [
      'Incumbent distribution advantage from platform giants (e.g. Microsoft/GitHub/OpenAI)',
      'Potential user churn if initial onboarding friction exceeds 3 minutes',
      'Model provider API latency or pricing fluctuations requiring local fallback caching',
    ];

    const recommendedPivotsOrRefinements = [
      'Focus intensely on the "Must-Have" features in Sprints 1 & 2 before expanding secondary surface area',
      'Introduce zero-setup local sandbox mode to minimize onboarding drop-off',
      'Highlight verifiable security compliance and audit logs as the primary enterprise sales wedge',
    ];

    return {
      overallScorePercent,
      marketOpportunityScore,
      technicalFeasibilityScore,
      competitiveDefensibilityScore,
      keyStrengths,
      criticalRisks,
      recommendedPivotsOrRefinements,
    };
  }
}
