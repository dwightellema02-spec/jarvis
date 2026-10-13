/**
 * JARVIS Phase 15 - Product Innovation & Venture Architecture Interfaces
 */

export interface MarketResearchResult {
  ideaSummary: string;
  problemStatement: string;
  tamSamSom: {
    tam: string; // Total Addressable Market
    sam: string; // Serviceable Addressable Market
    som: string; // Serviceable Obtainable Market
  };
  competitors: Array<{
    name: string;
    strengths: string;
    weaknesses: string;
    differentiation: string;
  }>;
  customerPainPoints: string[];
  whyNow: string; // Market timing / catalysts
}

export interface UserPersona {
  name: string;
  role: string;
  archetype: string;
  demographics: string;
  goals: string[];
  jobsToBeDone: string[];
  painPoints: string[];
  willingnessToPay: 'low' | 'medium' | 'high';
  quote: string;
}

export interface ProductFeature {
  id: string;
  name: string;
  description: string;
  category: 'must' | 'should' | 'could' | 'wont'; // MoSCoW
  rice: {
    reach: number;      // 1-10 scale
    impact: number;     // 1-5 scale
    confidence: number; // 0-1 scale
    effort: number;     // 1-10 scale
    score: number;      // (reach * impact * confidence) / effort
  };
  complexity: 'low' | 'medium' | 'high';
}

export interface UserJourneyStep {
  stepNumber: number;
  stage: 'Discovery' | 'Onboarding' | 'Core Task' | 'Value Realization' | 'Retention';
  userAction: string;
  systemResponse: string;
  emotionalState: 'curious' | 'delighted' | 'focused' | 'relieved' | 'satisfied';
  wireframeCue: string;
}

export interface TechnicalArchitectureBlueprint {
  techStack: {
    frontend: string;
    backend: string;
    database: string;
    cacheOrMessaging?: string;
    infrastructure: string;
  };
  architectureType: 'modular_monolith' | 'event_driven_microservices' | 'serverless_edge';
  dataModels: Array<{
    name: string;
    description: string;
    fields: string[];
  }>;
  apiEndpoints: Array<{
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    path: string;
    description: string;
    authRequired: boolean;
  }>;
  scalabilityStrategy: string;
  securityRequirements: string[];
}

export interface SprintMilestone {
  sprintNumber: number;
  title: string;
  durationWeeks: number;
  goal: string;
  deliverables: string[];
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface SprintRoadmap {
  productTitle: string;
  totalEstimatedWeeks: number;
  sprints: SprintMilestone[];
  mvpSuccessMetrics: string[];
  launchChecklist: string[];
}

export interface ProductViabilityScore {
  overallScorePercent: number; // 0 to 100
  marketOpportunityScore: number;
  technicalFeasibilityScore: number;
  competitiveDefensibilityScore: number;
  keyStrengths: string[];
  criticalRisks: string[];
  recommendedPivotsOrRefinements: string[];
}

export interface FullProductBlueprint {
  id: string;
  productName: string;
  tagline: string;
  idea: string;
  marketResearch: MarketResearchResult;
  targetPersonas: UserPersona[];
  features: ProductFeature[];
  userJourney: UserJourneyStep[];
  technicalBlueprint: TechnicalArchitectureBlueprint;
  roadmap: SprintRoadmap;
  viability: ProductViabilityScore;
  createdAt: string;
}

export interface InnovationSystemStatus {
  serviceName: string;
  version: string;
  activeFrameworks: string[];
  totalBlueprintsGenerated: number;
  totalFeaturesScored: number;
  totalPersonasSynthesized: number;
}
