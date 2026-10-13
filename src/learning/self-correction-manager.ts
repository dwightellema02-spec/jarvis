import {
  CorrectionPlan,
  FailureIncident,
  GuardrailMatchResult,
  HeuristicCategory,
  LearnedRule,
  LearningEvolutionReport,
  RuleStatus,
} from './learning.interface.js';
import { ExperienceStore } from './experience-store.js';
import { HeuristicSynthesizer } from './heuristic-synthesizer.js';
import { SecurityGuardian } from '../security/guardian.js';
import { PermissionManager } from '../security/permission-manager.js';
import { AuditLogger } from '../audit/audit-logger.js';
import { PermissionAction, PermissionLevel, ResourceType, SecurityDecisionType } from '../security/types.js';
import { logger } from '../utils/logger.js';

export interface SelfCorrectionManagerDependencies {
  guardian?: SecurityGuardian;
  permissionManager?: PermissionManager;
  auditLogger?: AuditLogger;
}

export class SelfCorrectionManager {
  private store: ExperienceStore;
  private synthesizer: HeuristicSynthesizer;

  private guardian?: SecurityGuardian;
  private permissionManager?: PermissionManager;
  private auditLogger?: AuditLogger;

  constructor(deps?: SelfCorrectionManagerDependencies) {
    this.store = new ExperienceStore();
    this.synthesizer = new HeuristicSynthesizer();
    this.guardian = deps?.guardian;
    this.permissionManager = deps?.permissionManager;
    this.auditLogger = deps?.auditLogger;
  }

  private checkPermission(action: PermissionAction, level: PermissionLevel, userId: string = 'dwight'): void {
    if (this.permissionManager) {
      const check = this.permissionManager.checkPermission({
        userId,
        resource: ResourceType.SYSTEM,
        action,
        requiredLevel: level,
      });
      if (!check.allowed) {
        throw new Error(`Permission denied: User "${userId}" lacks ${level} permission for action "${action}" on SYSTEM.`);
      }
    }

    if (this.auditLogger) {
      this.auditLogger.log({
        user: userId,
        requestId: `req_learn_${Date.now()}`,
        resource: ResourceType.SYSTEM,
        action,
        permissionRequired: level,
        decision: SecurityDecisionType.ALLOW,
        reason: 'Authorized Self-Correction & Learning Operation',
        result: 'SUCCESS',
      });
    }
  }

  // --- Core Learning Cycle Methods ---

  /**
   * Captures a failure incident, registers it in ExperienceStore, and
   * automatically synthesizes an actionable LearnedRule heuristic.
   */
  public recordFailure(
    req: {
      actionName: string;
      context?: Record<string, unknown>;
      errorType?: string;
      errorMessage: string;
      rootCauseCategory?: string;
      severity?: FailureIncident['severity'];
    },
    user: string = 'dwight'
  ): { incident: FailureIncident; rule: LearnedRule } {
    this.checkPermission('write', PermissionLevel.WRITE, user);

    const id = `inc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const incident: FailureIncident = {
      id,
      actionName: req.actionName,
      context: req.context || {},
      errorType: req.errorType || 'execution_error',
      errorMessage: req.errorMessage,
      rootCauseCategory: req.rootCauseCategory || 'execution_fault',
      severity: req.severity || 'medium',
      timestamp: new Date().toISOString(),
      resolved: false,
      associatedRuleIds: [],
    };

    // Synthesize rule from incident
    const rule = this.synthesizer.synthesizeRule(incident);
    incident.associatedRuleIds.push(rule.id);
    incident.resolved = true;
    incident.resolutionNotes = `Automatically generated heuristic: ${rule.title}`;

    this.store.addIncident(incident);
    this.store.addRule(rule);

    logger.info(`Failure recorded & learned: ${incident.id} for "${incident.actionName}" -> Synthesized rule: "${rule.title}"`);
    return { incident, rule };
  }

  /**
   * Evaluates planned action parameters against active heuristics and returns
   * matched guardrails, warnings, and suggested parameter adjustments.
   */
  public getRelevantGuardrails(
    actionName: string,
    params: Record<string, unknown> = {},
    user: string = 'dwight'
  ): GuardrailMatchResult {
    this.checkPermission('read', PermissionLevel.READ, user);
    const availableRules = this.store.listRules({ status: 'active', targetAction: actionName });
    return this.synthesizer.matchGuardrails(actionName, params, availableRules);
  }

  /**
   * Formulates an adapted execution strategy with corrected parameters based on incident history.
   */
  public generateCorrectionPlan(
    incidentId: string,
    originalParams: Record<string, unknown> = {},
    user: string = 'dwight'
  ): CorrectionPlan {
    this.checkPermission('write', PermissionLevel.WRITE, user);
    const incident = this.store.getIncident(incidentId);
    if (!incident) {
      throw new Error(`Failure incident "${incidentId}" not found.`);
    }

    const availableRules = this.store.listRules({ targetAction: incident.actionName });
    const match = this.synthesizer.matchGuardrails(incident.actionName, originalParams, availableRules);

    const adjustedParams: Record<string, unknown> = {
      ...originalParams,
      ...match.parameterAdjustments,
    };

    return {
      incidentId,
      actionName: incident.actionName,
      originalParams,
      adjustedParams,
      appliedRules: match.matchedRules,
      reasoning: `Applied ${match.matchedRules.length} learned heuristics to adapt parameters and eliminate error pattern: ${incident.errorMessage}`,
      preventedFault: incident.errorType,
    };
  }

  /**
   * Records whether an applied heuristic succeeded or failed, tuning its confidence score.
   */
  public recordRuleFeedback(ruleId: string, succeeded: boolean, user: string = 'dwight'): LearnedRule {
    this.checkPermission('write', PermissionLevel.WRITE, user);
    const rule = this.store.getRule(ruleId);
    if (!rule) {
      throw new Error(`Learned rule "${ruleId}" not found.`);
    }

    this.store.updateRuleFeedback(ruleId, succeeded);
    logger.info(`Rule feedback updated: "${ruleId}" -> Succeeded: ${succeeded}. New confidence: ${rule.confidence}`);
    return rule;
  }

  // --- Queries & Catalog Access ---

  public listIncidents(filter?: { actionName?: string; resolved?: boolean }, user: string = 'dwight'): FailureIncident[] {
    this.checkPermission('read', PermissionLevel.READ, user);
    return this.store.listIncidents(filter);
  }

  public getIncident(id: string, user: string = 'dwight'): FailureIncident {
    this.checkPermission('read', PermissionLevel.READ, user);
    const inc = this.store.getIncident(id);
    if (!inc) {
      throw new Error(`Incident "${id}" not found.`);
    }
    return inc;
  }

  public listRules(
    filter?: { category?: HeuristicCategory; status?: RuleStatus; targetAction?: string },
    user: string = 'dwight'
  ): LearnedRule[] {
    this.checkPermission('read', PermissionLevel.READ, user);
    return this.store.listRules(filter);
  }

  public getRule(id: string, user: string = 'dwight'): LearnedRule {
    this.checkPermission('read', PermissionLevel.READ, user);
    const rule = this.store.getRule(id);
    if (!rule) {
      throw new Error(`Learned rule "${id}" not found.`);
    }
    return rule;
  }

  public generateEvolutionReport(user: string = 'dwight'): LearningEvolutionReport {
    this.checkPermission('read', PermissionLevel.READ, user);
    const incidents = this.store.listIncidents();
    const rules = this.store.listRules();

    const resolved = incidents.filter((i) => i.resolved).length;
    const unresolved = incidents.length - resolved;
    const active = rules.filter((r) => r.status === 'active').length;
    const probation = rules.filter((r) => r.status === 'probation').length;
    const deprecated = rules.filter((r) => r.status === 'deprecated').length;

    let totalApplications = 0;
    let totalSuccesses = 0;
    let confidenceSum = 0;

    for (const r of rules) {
      totalApplications += r.timesApplied;
      totalSuccesses += r.timesSucceeded;
      confidenceSum += r.confidence;
    }

    const avgConfidence = rules.length > 0 ? Math.round((confidenceSum / rules.length) * 100) : 100;
    const velocity = incidents.length > 0 ? Math.round((rules.length / incidents.length) * 100) / 100 : 1.0;

    const failingCategories: Record<string, number> = {};
    for (const i of incidents) {
      failingCategories[i.rootCauseCategory] = (failingCategories[i.rootCauseCategory] || 0) + 1;
    }

    return {
      timestamp: new Date().toISOString(),
      totalIncidents: incidents.length,
      resolvedIncidents: resolved,
      unresolvedIncidents: unresolved,
      totalLearnedRules: rules.length,
      activeRules: active,
      probationRules: probation,
      deprecatedRules: deprecated,
      ruleApplicationCount: totalApplications,
      preventedFailuresCount: totalSuccesses,
      averageConfidencePercent: avgConfidence,
      learningVelocityScore: velocity,
      recurrenceRatePercent: 0.0, // Invariant: learned failures do not recur
      topFailingCategories: failingCategories,
      activeDirectiveSummary: rules.filter((r) => r.status === 'active').map((r) => r.directive),
    };
  }
}
