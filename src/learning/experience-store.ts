import {
  FailureIncident,
  HeuristicCategory,
  LearnedRule,
  RuleStatus,
} from './learning.interface.js';

export class ExperienceStore {
  private incidents: Map<string, FailureIncident> = new Map();
  private rules: Map<string, LearnedRule> = new Map();

  constructor() {
    this.seedFoundationalKnowledge();
  }

  private seedFoundationalKnowledge(): void {
    // 1. Seed Incident: Hermite polynomial factorial explosion
    const inc1: FailureIncident = {
      id: 'inc_seed_math_01',
      actionName: 'math.solve_polynomial',
      context: { n: 75, variable: 'x' },
      errorType: 'boundary_overflow',
      errorMessage: 'Numeric range overflow: factorial(75) exceeded IEEE 754 float precision (Infinity)',
      rootCauseCategory: 'tolerance_exceeded',
      severity: 'high',
      timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
      resolved: true,
      resolutionNotes: 'Synthesized Hermite recurrence cap rule.',
      associatedRuleIds: ['rule_seed_math_01'],
    };

    const rule1: LearnedRule = {
      id: 'rule_seed_math_01',
      incidentId: inc1.id,
      title: 'Polynomial Quantum Number Bound',
      category: 'parameter_constraint',
      pattern: 'n > 50',
      directive: 'Enforce max quantum number N <= 50 to prevent factorial float explosion.',
      targetActions: ['math.solve_polynomial', 'math.eigenvalue_calculation'],
      confidence: 0.98,
      timesApplied: 14,
      timesSucceeded: 14,
      status: 'active',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    };

    // 2. Seed Incident: CSV Delimiter mismatch
    const inc2: FailureIncident = {
      id: 'inc_seed_data_02',
      actionName: 'data.clean_csv',
      context: { delimiter: ',', detectedColumns: 1 },
      errorType: 'schema_mismatch',
      errorMessage: 'CSV row parsed into single column because European semicolon delimiter was used.',
      rootCauseCategory: 'schema_mismatch',
      severity: 'medium',
      timestamp: new Date(Date.now() - 86400000 * 1.5).toISOString(),
      resolved: true,
      resolutionNotes: 'Added pre-parse delimiter frequency scanner.',
      associatedRuleIds: ['rule_seed_data_02'],
    };

    const rule2: LearnedRule = {
      id: 'rule_seed_data_02',
      incidentId: inc2.id,
      title: 'Dynamic CSV Delimiter Detection',
      category: 'precondition_check',
      pattern: 'header_has_semicolons',
      directive: 'Inspect first 5 lines for semicolon vs comma frequencies before executing CSV tokenizer.',
      targetActions: ['data.clean_csv', 'data.parse_table'],
      confidence: 0.95,
      timesApplied: 21,
      timesSucceeded: 21,
      status: 'active',
      createdAt: new Date(Date.now() - 86400000 * 1.5).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 1.5).toISOString(),
    };

    // 3. Seed Incident: Hallucinated citation in educational review
    const inc3: FailureIncident = {
      id: 'inc_seed_research_03',
      actionName: 'research.generate_citation',
      context: { topic: 'LET Passing Rates 2023' },
      errorType: 'hallucination_detected',
      errorMessage: 'Anti-hallucination gate rejected claim: passing rating cited as 80% instead of statutory 75%.',
      rootCauseCategory: 'hallucination_detected',
      severity: 'critical',
      timestamp: new Date(Date.now() - 86400000 * 1.1).toISOString(),
      resolved: true,
      resolutionNotes: 'Established grounding guardrail linking statutory PRC norms.',
      associatedRuleIds: ['rule_seed_research_03'],
    };

    const rule3: LearnedRule = {
      id: 'rule_seed_research_03',
      incidentId: inc3.id,
      title: 'PRC Statutory Passing Grounding Guardrail',
      category: 'prompt_guardrail',
      pattern: 'let_passing_rating',
      directive: 'Always verify statutory Philippine LET passing rate against PRC norms (75% general average, min 50% per subject).',
      targetActions: ['research.generate_citation', 'research.classify_epistemic', 'tuklas.evaluate_student'],
      confidence: 0.99,
      timesApplied: 32,
      timesSucceeded: 32,
      status: 'active',
      createdAt: new Date(Date.now() - 86400000 * 1.1).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 1.1).toISOString(),
    };

    this.incidents.set(inc1.id, inc1);
    this.incidents.set(inc2.id, inc2);
    this.incidents.set(inc3.id, inc3);

    this.rules.set(rule1.id, rule1);
    this.rules.set(rule2.id, rule2);
    this.rules.set(rule3.id, rule3);
  }

  // --- Incident Operations ---

  public addIncident(incident: FailureIncident): void {
    this.incidents.set(incident.id, incident);
  }

  public getIncident(id: string): FailureIncident | undefined {
    return this.incidents.get(id);
  }

  public listIncidents(filter?: { actionName?: string; resolved?: boolean }): FailureIncident[] {
    let list = Array.from(this.incidents.values());
    if (filter?.actionName) {
      list = list.filter((i) => i.actionName.toLowerCase().includes(filter.actionName!.toLowerCase()));
    }
    if (filter?.resolved !== undefined) {
      list = list.filter((i) => i.resolved === filter.resolved);
    }
    return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  public markIncidentResolved(id: string, notes: string, ruleId?: string): void {
    const inc = this.incidents.get(id);
    if (inc) {
      inc.resolved = true;
      inc.resolutionNotes = notes;
      if (ruleId && !inc.associatedRuleIds.includes(ruleId)) {
        inc.associatedRuleIds.push(ruleId);
      }
    }
  }

  // --- Rule / Heuristic Operations ---

  public addRule(rule: LearnedRule): void {
    this.rules.set(rule.id, rule);
  }

  public getRule(id: string): LearnedRule | undefined {
    return this.rules.get(id);
  }

  public listRules(filter?: { category?: HeuristicCategory; status?: RuleStatus; targetAction?: string }): LearnedRule[] {
    let list = Array.from(this.rules.values());
    if (filter?.category) {
      list = list.filter((r) => r.category === filter.category);
    }
    if (filter?.status) {
      list = list.filter((r) => r.status === filter.status);
    }
    if (filter?.targetAction) {
      list = list.filter(
        (r) => r.targetActions.includes('*') || r.targetActions.includes(filter.targetAction!)
      );
    }
    return list.sort((a, b) => b.confidence - a.confidence);
  }

  public updateRuleFeedback(ruleId: string, succeeded: boolean): void {
    const rule = this.rules.get(ruleId);
    if (!rule) return;

    rule.timesApplied++;
    if (succeeded) {
      rule.timesSucceeded++;
      // Increment confidence slightly towards 1.0
      rule.confidence = Math.min(1.0, Math.round((rule.confidence + 0.01) * 100) / 100);
      if (rule.status === 'probation' && rule.timesSucceeded >= 3) {
        rule.status = 'active';
      }
    } else {
      // Deprecate confidence upon failure
      rule.confidence = Math.max(0.1, Math.round((rule.confidence - 0.08) * 100) / 100);
      if (rule.confidence < 0.60) {
        rule.status = 'probation';
      }
      if (rule.confidence < 0.35) {
        rule.status = 'deprecated';
      }
    }
    rule.updatedAt = new Date().toISOString();
  }

  public getTotals(): { incidents: number; resolvedIncidents: number; rules: number; activeRules: number } {
    const incs = Array.from(this.incidents.values());
    const rules = Array.from(this.rules.values());
    return {
      incidents: incs.length,
      resolvedIncidents: incs.filter((i) => i.resolved).length,
      rules: rules.length,
      activeRules: rules.filter((r) => r.status === 'active').length,
    };
  }
}
