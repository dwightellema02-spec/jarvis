import { describe, it, expect, beforeEach } from 'vitest';
import {
  ExperienceStore,
  HeuristicSynthesizer,
  SelfCorrectionManager,
  SelfCorrectionAgent,
  createLearningTools,
  RecordIncidentTool,
  ExtractHeuristicTool,
  GetGuardrailsTool,
  CreateCorrectionPlanTool,
  RecordRuleFeedbackTool,
  ListRulesTool,
  ListIncidentsTool,
  GenerateEvolutionReportTool,
} from '../../src/learning/index.js';
import { PermissionManager } from '../../src/security/permission-manager.js';
import { SecurityGuardian } from '../../src/security/guardian.js';
import { AuditLogger } from '../../src/audit/audit-logger.js';
import { PermissionLevel, ResourceType } from '../../src/security/types.js';

describe('Phase 27: Self-Correction & Learning Loop Engine', () => {
  let store: ExperienceStore;
  let synthesizer: HeuristicSynthesizer;
  let manager: SelfCorrectionManager;
  let permissionManager: PermissionManager;
  let guardian: SecurityGuardian;
  let auditLogger: AuditLogger;

  beforeEach(() => {
    store = new ExperienceStore();
    synthesizer = new HeuristicSynthesizer();
    permissionManager = new PermissionManager();
    guardian = new SecurityGuardian();
    auditLogger = new AuditLogger();

    // Grant user dwight full permissions
    permissionManager.grantPermission({
      userId: 'dwight',
      resource: ResourceType.SYSTEM,
      level: PermissionLevel.ADMIN,
      allowedActions: ['read', 'write', 'execute', 'admin'],
      grantedBy: 'system',
    });

    manager = new SelfCorrectionManager({
      permissionManager,
      guardian,
      auditLogger,
    });
  });

  describe('1. ExperienceStore (Incident & Heuristic Ledger)', () => {
    it('initializes with seed incidents and heuristics', () => {
      const incidents = store.listIncidents();
      const rules = store.listRules();

      expect(incidents.length).toBeGreaterThanOrEqual(3);
      expect(rules.length).toBeGreaterThanOrEqual(3);

      const mathRule = rules.find((r) => r.id === 'rule_seed_math_01');
      expect(mathRule).toBeDefined();
      expect(mathRule?.targetActions).toContain('math.solve_polynomial');
      expect(mathRule?.confidence).toBe(0.98);

      const researchRule = rules.find((r) => r.id === 'rule_seed_research_03');
      expect(researchRule).toBeDefined();
      expect(researchRule?.targetActions).toContain('research.generate_citation');
    });

    it('records and retrieves new incidents', () => {
      const incId = `inc_custom_${Date.now()}`;
      store.addIncident({
        id: incId,
        actionName: 'fs.read_file',
        errorMessage: 'ENOENT: no such file or directory, open /tmp/ghost.json',
        errorType: 'FileNotFoundError',
        context: { path: '/tmp/ghost.json' },
        rootCauseCategory: 'missing_artifact',
        severity: 'medium',
        timestamp: new Date().toISOString(),
        resolved: false,
        associatedRuleIds: [],
      });

      const retrieved = store.getIncident(incId);
      expect(retrieved).toBeDefined();
      expect(retrieved?.actionName).toBe('fs.read_file');
      expect(retrieved?.resolved).toBe(false);

      const filtered = store.listIncidents({ actionName: 'fs.read_file' });
      expect(filtered.some((i) => i.id === incId)).toBe(true);
    });

    it('saves and updates learned rules with feedback', () => {
      const ruleId = `rule_custom_${Date.now()}`;
      store.addRule({
        id: ruleId,
        title: 'Ensure destination directory exists',
        category: 'precondition_check',
        pattern: 'missing_filesystem_node',
        directive: 'Check target folder with fs.stat before copying',
        targetActions: ['fs.copy_file'],
        confidence: 0.8,
        timesApplied: 0,
        timesSucceeded: 0,
        status: 'probation',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      const rule = store.getRule(ruleId);
      expect(rule).toBeDefined();
      expect(rule?.targetActions).toContain('fs.copy_file');

      // Record positive feedback 3 times to graduate from probation to active
      store.updateRuleFeedback(ruleId, true);
      store.updateRuleFeedback(ruleId, true);
      store.updateRuleFeedback(ruleId, true);

      const updated = store.getRule(ruleId);
      expect(updated?.timesApplied).toBe(3);
      expect(updated?.timesSucceeded).toBe(3);
      expect(updated?.confidence).toBeGreaterThan(0.8);
      expect(updated?.status).toBe('active');

      // Record negative feedback repeatedly to trigger deprecation
      for (let i = 0; i < 7; i++) {
        store.updateRuleFeedback(ruleId, false);
      }
      const lowered = store.getRule(ruleId);
      expect(lowered?.confidence).toBeLessThan(0.4);
      expect(lowered?.status).toBe('deprecated');
    });

    it('calculates accurate ledger totals', () => {
      const totals = store.getTotals();
      expect(totals.incidents).toBeGreaterThanOrEqual(3);
      expect(totals.resolvedIncidents).toBeGreaterThanOrEqual(3);
      expect(totals.rules).toBeGreaterThanOrEqual(3);
      expect(totals.activeRules).toBeGreaterThanOrEqual(3);
    });
  });

  describe('2. HeuristicSynthesizer (Rule Derivation & Guardrails)', () => {
    it('synthesizes new rules from failure incidents', () => {
      const incident = {
        id: 'inc_test_poly',
        timestamp: new Date().toISOString(),
        actionName: 'math.solve_polynomial',
        errorMessage: 'Numeric range overflow: degree 95 exceeds float range',
        errorType: 'boundary_overflow',
        context: { degree: 95 },
        rootCauseCategory: 'tolerance_exceeded',
        severity: 'high' as const,
        resolved: false,
        associatedRuleIds: [],
      };

      const rule = synthesizer.synthesizeRule(incident);
      expect(rule.id).toMatch(/^rule_/);
      expect(rule.targetActions).toContain('math.solve_polynomial');
      expect(rule.category).toBe('parameter_constraint');
      expect(rule.confidence).toBeGreaterThanOrEqual(0.85);
    });

    it('matches guardrails against proposed actions and clamps parameters', () => {
      const rules = store.listRules();
      const match = synthesizer.matchGuardrails(
        'math.solve_polynomial',
        { n: 75, variable: 'x' },
        rules
      );

      expect(match.matchedRules.length).toBeGreaterThan(0);
      expect(match.parameterAdjustments).toHaveProperty('n');
      expect(match.parameterAdjustments['n']).toBe(50);
      expect(match.warnings.length).toBeGreaterThan(0);
    });

    it('detects semicolon CSV delimiters via heuristics', () => {
      const rules = store.listRules();
      const match = synthesizer.matchGuardrails(
        'data.clean_csv',
        { csvContent: 'Name;Score;Status\nAlice;90;Pass', delimiter: ',' },
        rules
      );

      expect(match.matchedRules.length).toBeGreaterThan(0);
      expect(match.parameterAdjustments).toHaveProperty('delimiter');
      expect(match.parameterAdjustments['delimiter']).toBe(';');
    });
  });

  describe('3. SelfCorrectionManager (End-to-End Orchestration)', () => {
    it('records failures, persists incidents, and synthesizes rules automatically', () => {
      const result = manager.recordFailure(
        {
          actionName: 'database.connect',
          errorMessage: 'Connection pool exhausted (max 10 clients reached)',
          errorType: 'PoolExhaustedError',
          rootCauseCategory: 'execution_fault',
          severity: 'critical',
        },
        'dwight'
      );

      expect(result.incident.id).toBeDefined();
      expect(result.rule).toBeDefined();
      expect(result.rule.targetActions).toContain('database.connect');

      // Verify incident is in store
      const incident = manager.getIncident(result.incident.id, 'dwight');
      expect(incident).toBeDefined();
      expect(incident.actionName).toBe('database.connect');
      expect(incident.resolved).toBe(true);
    });

    it('finds guardrails and generates correction plans', () => {
      const guardrail = manager.getRelevantGuardrails(
        'math.solve_polynomial',
        { n: 75 },
        'dwight'
      );

      expect(guardrail.matchedRules.length).toBeGreaterThan(0);
      expect(guardrail.parameterAdjustments).toHaveProperty('n');
      expect(guardrail.parameterAdjustments['n']).toBe(50);

      const incidents = manager.listIncidents({ actionName: 'math.solve_polynomial' }, 'dwight');
      expect(incidents.length).toBeGreaterThan(0);

      const plan = manager.generateCorrectionPlan(incidents[0].id, { n: 75 }, 'dwight');
      expect(plan.incidentId).toBe(incidents[0].id);
      expect(plan.adjustedParams['n']).toBe(50);
      expect(plan.appliedRules.length).toBeGreaterThan(0);
    });

    it('records feedback for applied rules and updates rule confidence', () => {
      const rule = manager.listRules({}, 'dwight')[0];
      const initialSuccess = rule.timesSucceeded;

      const updated = manager.recordRuleFeedback(rule.id, true, 'dwight');
      expect(updated.timesSucceeded).toBe(initialSuccess + 1);
    });

    it('generates a comprehensive learning evolution report', () => {
      const report = manager.generateEvolutionReport('dwight');

      expect(report.totalIncidents).toBeGreaterThanOrEqual(3);
      expect(report.activeRules).toBeGreaterThanOrEqual(3);
      expect(report.averageConfidencePercent).toBeGreaterThan(50);
      expect(report.recurrenceRatePercent).toBe(0);
      expect(report.topFailingCategories).toBeDefined();
      expect(report.activeDirectiveSummary.length).toBeGreaterThan(0);
    });

    it('enforces permission security for unpermitted users', () => {
      expect(() => {
        manager.recordFailure(
          { actionName: 'hack.root', errorMessage: 'denied' },
          'unauthorized_user'
        );
      }).toThrow(/Permission denied/);
    });
  });

  describe('4. SelfCorrectionAgent (Agent Contract & Capabilities)', () => {
    let agent: SelfCorrectionAgent;

    beforeEach(() => {
      agent = new SelfCorrectionAgent(manager);
    });

    it('has valid metadata and capabilities', () => {
      expect(agent.definition.id).toBe('self-correction-agent');
      expect(agent.definition.name).toContain('Self-Correction');
      expect(agent.definition.version).toBe('0.27.0-phase27');
      expect(agent.definition.capabilities).toContain('failure_analysis');
      expect(agent.definition.capabilities).toContain('heuristic_synthesis');
      expect(agent.definition.capabilities).toContain('guardrail_retrieval');
    });

    it('handles query for guardrails via agent execute()', async () => {
      const response = await agent.execute(
        {
          action: 'get_guardrails',
          actionName: 'math.solve_polynomial',
          params: { n: 75 },
        },
        { userId: 'dwight', sessionId: 'sess_1', requestId: 'req_1' }
      );

      expect(response.success).toBe(true);
      expect(response.data).toHaveProperty('matchedRules');
      expect(response.data.parameterAdjustments['n']).toBe(50);
    });

    it('handles query for learning evolution report via agent execute()', async () => {
      const response = await agent.execute(
        {
          action: 'get_report',
        },
        { userId: 'dwight', sessionId: 'sess_1', requestId: 'req_2' }
      );

      expect(response.success).toBe(true);
      expect(response.data).toHaveProperty('activeRules');
      expect(response.data.activeRules).toBeGreaterThanOrEqual(3);
    });
  });

  describe('5. LearningTools Suite (8 Registered ITool Implementations)', () => {
    const tools = createLearningTools(manager);

    it('instantiates exactly 8 specialized tools', () => {
      expect(tools.length).toBe(8);
      const ids = tools.map((t) => t.definition.id);
      expect(ids).toEqual([
        'learning.record_incident',
        'learning.extract_heuristic',
        'learning.get_guardrails',
        'learning.create_correction_plan',
        'learning.record_rule_feedback',
        'learning.list_rules',
        'learning.list_incidents',
        'learning.generate_evolution_report',
      ]);
    });

    it('executes RecordIncidentTool successfully', async () => {
      const tool = new RecordIncidentTool(manager);
      const res = await tool.execute({
        actionName: 'compiler.build',
        errorMessage: 'TS2304: Cannot find name "process"',
        errorType: 'CompileError',
        rootCauseCategory: 'syntax_error',
        severity: 'high',
      });

      expect(res.success).toBe(true);
      expect(res.verified).toBe(true);
      expect(res.data).toHaveProperty('incident');
      expect(res.data).toHaveProperty('rule');
    });

    it('executes ExtractHeuristicTool successfully', async () => {
      const tool = new ExtractHeuristicTool(manager);
      const incidents = manager.listIncidents({}, 'dwight');
      const res = await tool.execute({
        incidentId: incidents[0].id,
      });

      expect(res.success).toBe(true);
      expect(res.verified).toBe(true);
      expect(res.data).toHaveProperty('id');
      expect(res.data).toHaveProperty('directive');
    });

    it('executes GetGuardrailsTool successfully', async () => {
      const tool = new GetGuardrailsTool(manager);
      const res = await tool.execute({
        actionName: 'math.solve_polynomial',
        params: { n: 75 },
      });

      expect(res.success).toBe(true);
      expect(res.verified).toBe(true);
      expect(res.data).toHaveProperty('matchedRules');
    });

    it('executes CreateCorrectionPlanTool successfully', async () => {
      const tool = new CreateCorrectionPlanTool(manager);
      const incidents = manager.listIncidents({}, 'dwight');
      const res = await tool.execute({
        incidentId: incidents[0].id,
        originalParams: { n: 75 },
      });

      expect(res.success).toBe(true);
      expect(res.verified).toBe(true);
      expect(res.data).toHaveProperty('adjustedParams');
    });

    it('executes RecordRuleFeedbackTool successfully', async () => {
      const tool = new RecordRuleFeedbackTool(manager);
      const rules = manager.listRules({}, 'dwight');
      const res = await tool.execute({
        ruleId: rules[0].id,
        succeeded: true,
      });

      expect(res.success).toBe(true);
      expect(res.verified).toBe(true);
      expect(res.data).toHaveProperty('timesApplied');
    });

    it('executes ListRulesTool successfully', async () => {
      const tool = new ListRulesTool(manager);
      const res = await tool.execute({});

      expect(res.success).toBe(true);
      expect(res.verified).toBe(true);
      expect(res.data).toHaveProperty('rules');
      expect(Array.isArray(res.data.rules)).toBe(true);
    });

    it('executes ListIncidentsTool successfully', async () => {
      const tool = new ListIncidentsTool(manager);
      const res = await tool.execute({});

      expect(res.success).toBe(true);
      expect(res.verified).toBe(true);
      expect(res.data).toHaveProperty('incidents');
      expect(Array.isArray(res.data.incidents)).toBe(true);
    });

    it('executes GenerateEvolutionReportTool successfully', async () => {
      const tool = new GenerateEvolutionReportTool(manager);
      const res = await tool.execute({});

      expect(res.success).toBe(true);
      expect(res.verified).toBe(true);
      expect(res.data).toHaveProperty('totalIncidents');
      expect(res.data.activeRules).toBeGreaterThan(0);
    });
  });
});
