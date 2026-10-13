import {
  FailureIncident,
  GuardrailMatchResult,
  HeuristicCategory,
  LearnedRule,
} from './learning.interface.js';

export class HeuristicSynthesizer {
  /**
   * Analyzes a failure incident and generates a candidate LearnedRule heuristic.
   */
  public synthesizeRule(incident: FailureIncident): LearnedRule {
    const timestamp = new Date().toISOString();
    const id = `rule_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    let category: HeuristicCategory = 'precondition_check';
    let title = `Auto-Learned Rule for ${incident.actionName}`;
    let directive = `Prevent recurring fault: ${incident.errorMessage}`;
    let pattern = incident.errorType || 'general_fault';

    switch (incident.rootCauseCategory) {
      case 'tolerance_exceeded':
        category = 'parameter_constraint';
        title = `Parameter Bound for ${incident.actionName}`;
        directive = `Validate numeric parameter boundaries and apply epsilon tolerance clamp before invoking ${incident.actionName}.`;
        pattern = 'numeric_tolerance_violation';
        break;

      case 'missing_artifact':
        category = 'precondition_check';
        title = `Artifact Existence Precondition for ${incident.actionName}`;
        directive = `Verify prerequisite disk artifacts and directories exist prior to calling ${incident.actionName}.`;
        pattern = 'missing_filesystem_node';
        break;

      case 'syntax_error':
        category = 'precondition_check';
        title = `Syntax & AST Sanitization for ${incident.actionName}`;
        directive = `Perform AST dry-run parse and grammatical token verification prior to script compilation.`;
        pattern = 'syntax_parse_failure';
        break;

      case 'hallucination_detected':
        category = 'prompt_guardrail';
        title = `Ground-Truth Anchor Guardrail for ${incident.actionName}`;
        directive = `Anchor generated claims with verbatim grounding excerpts from verified knowledge base nodes.`;
        pattern = 'unsubstantiated_claims';
        break;

      case 'schema_mismatch':
        category = 'parameter_constraint';
        title = `Schema Strictness Enforcement for ${incident.actionName}`;
        directive = `Enforce mandatory schema properties and reject payloads missing mandatory interface keys.`;
        pattern = 'schema_missing_required_keys';
        break;

      case 'execution_fault':
        category = 'fallback_strategy';
        title = `Resilient Fallback Strategy for ${incident.actionName}`;
        directive = `Intercept non-zero exit codes with isolated retry and environment variable validation.`;
        pattern = 'process_abnormal_exit';
        break;

      default:
        category = 'precondition_check';
        title = `Invariant Guardrail for ${incident.actionName}`;
        directive = `Check input prerequisites before executing action: ${incident.errorMessage}`;
        pattern = 'generic_invariant';
    }

    return {
      id,
      incidentId: incident.id,
      title,
      category,
      pattern,
      directive,
      targetActions: [incident.actionName],
      confidence: 0.85,
      timesApplied: 0,
      timesSucceeded: 0,
      status: 'active',
      createdAt: timestamp,
      updatedAt: timestamp,
    };
  }

  /**
   * Evaluates planned action parameters against active heuristics and returns
   * matching guardrails, suggested parameter adjustments, and safety advisories.
   */
  public matchGuardrails(
    actionName: string,
    params: Record<string, unknown> = {},
    availableRules: LearnedRule[]
  ): GuardrailMatchResult {
    const matchedRules: LearnedRule[] = [];
    const injectedDirectives: string[] = [];
    const parameterAdjustments: Record<string, unknown> = {};
    const warnings: string[] = [];

    // Filter rules active for this action
    const candidateRules = availableRules.filter(
      (r) =>
        r.status === 'active' &&
        (r.targetActions.includes('*') || r.targetActions.includes(actionName))
    );

    for (const rule of candidateRules) {
      let matched = false;

      // Pattern 1: Quantum number bounds
      if (rule.category === 'parameter_constraint' && (params.n !== undefined || params.degree !== undefined)) {
        const val = Number(params.n ?? params.degree);
        if (val > 50) {
          matched = true;
          warnings.push(`Quantum number ${val} exceeds safe heuristic bound (max 50). Parameter clamped.`);
          parameterAdjustments['n'] = 50;
          if (params.degree !== undefined) parameterAdjustments['degree'] = 50;
        }
      }

      // Pattern 2: Delimiter check
      if (rule.category === 'precondition_check' && rule.pattern.includes('semicolon')) {
        const content = String(params.csvContent || params.text || '');
        if (content.includes(';') && (params.delimiter === ',' || !params.delimiter)) {
          matched = true;
          warnings.push('Semicolons detected in tabular content. Delimiter adjusted to semicolon.";"');
          parameterAdjustments['delimiter'] = ';';
        }
      }

      // Pattern 3: Missing path or file
      if (rule.category === 'precondition_check' && rule.pattern.includes('filesystem')) {
        if (!params.filePath && !params.path && !params.target) {
          warnings.push('Action requires explicit target path parameter according to artifact heuristic.');
        }
      }

      // If category is prompt_guardrail, always inject directive
      if (rule.category === 'prompt_guardrail') {
        matched = true;
      }

      if (matched || candidateRules.length <= 2) {
        matchedRules.push(rule);
        injectedDirectives.push(`[${rule.category.toUpperCase()}] ${rule.directive}`);
      }
    }

    const safeToProceed = warnings.filter((w) => w.toLowerCase().includes('critical')).length === 0;

    return {
      actionName,
      matchedRules,
      injectedDirectives,
      parameterAdjustments,
      safeToProceed,
      warnings,
    };
  }
}
