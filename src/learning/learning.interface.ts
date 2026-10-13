export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';

export type HeuristicCategory =
  | 'parameter_constraint'
  | 'precondition_check'
  | 'prompt_guardrail'
  | 'fallback_strategy'
  | 'execution_timeout'
  | 'boundary_validation';

export type RuleStatus = 'active' | 'probation' | 'deprecated';

export interface FailureIncident {
  id: string;
  actionName: string;
  context: Record<string, unknown>;
  errorType: string;
  errorMessage: string;
  rootCauseCategory: string;
  severity: IncidentSeverity;
  timestamp: string;
  resolved: boolean;
  resolutionNotes?: string;
  associatedRuleIds: string[];
}

export interface LearnedRule {
  id: string;
  incidentId?: string;
  title: string;
  category: HeuristicCategory;
  pattern: string;
  directive: string;
  targetActions: string[];
  confidence: number; // 0.0 to 1.0
  timesApplied: number;
  timesSucceeded: number;
  status: RuleStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CorrectionPlan {
  incidentId: string;
  actionName: string;
  originalParams: Record<string, unknown>;
  adjustedParams: Record<string, unknown>;
  appliedRules: LearnedRule[];
  reasoning: string;
  preventedFault: string;
}

export interface GuardrailMatchResult {
  actionName: string;
  matchedRules: LearnedRule[];
  injectedDirectives: string[];
  parameterAdjustments: Record<string, unknown>;
  safeToProceed: boolean;
  warnings: string[];
}

export interface LearningEvolutionReport {
  timestamp: string;
  totalIncidents: number;
  resolvedIncidents: number;
  unresolvedIncidents: number;
  totalLearnedRules: number;
  activeRules: number;
  probationRules: number;
  deprecatedRules: number;
  ruleApplicationCount: number;
  preventedFailuresCount: number;
  averageConfidencePercent: number;
  learningVelocityScore: number; // e.g. rules learned / incidents
  recurrenceRatePercent: number; // target: 0%
  topFailingCategories: Record<string, number>;
  activeDirectiveSummary: string[];
}
