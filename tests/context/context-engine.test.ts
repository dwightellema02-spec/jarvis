import { describe, it, expect, beforeEach } from 'vitest';
import {
  ContextAggregator,
  PersonalContextManager,
  ContextAgent,
  createContextTools,
  GetContextSnapshotTool,
  SetFocusSessionTool,
  QueryRelevantContextTool,
  LogActivityTool,
  ListActivitiesTool,
  AssessCognitiveLoadTool,
  GetDashboardOverviewTool,
  GenerateInsightsTool,
} from '../../src/context/index.js';
import { PermissionManager } from '../../src/security/permission-manager.js';
import { SecurityGuardian } from '../../src/security/guardian.js';
import { AuditLogger } from '../../src/audit/audit-logger.js';
import { PermissionLevel, ResourceType } from '../../src/security/types.js';

describe('Phase 28: Personal Context Engine & Unified Dashboard', () => {
  let aggregator: ContextAggregator;
  let manager: PersonalContextManager;
  let permissionManager: PermissionManager;
  let guardian: SecurityGuardian;
  let auditLogger: AuditLogger;

  beforeEach(() => {
    aggregator = new ContextAggregator();
    permissionManager = new PermissionManager();
    guardian = new SecurityGuardian();
    auditLogger = new AuditLogger();

    // Grant user dwight full admin permissions
    permissionManager.grantPermission({
      userId: 'dwight',
      resource: ResourceType.SYSTEM,
      level: PermissionLevel.ADMIN,
      allowedActions: ['read', 'write', 'execute', 'admin'],
      grantedBy: 'system',
    });

    manager = new PersonalContextManager({
      permissionManager,
      guardian,
      auditLogger,
    });
  });

  describe('1. ContextAggregator (Multi-Engine Synthesis & State Metrics)', () => {
    it('computes accurate cognitive state based on workload factors', () => {
      const lowState = aggregator.computeCognitiveState('dwight', 0, undefined, 0);
      expect(lowState.score).toBeLessThanOrEqual(0.35);
      expect(lowState.level).toBe('low');

      const deepWorkSession = {
        id: 'f1',
        mode: 'deep_work' as const,
        goal: 'Quantum Kernel Optimization',
        startedAt: new Date().toISOString(),
        targetDurationMinutes: 90,
        active: true,
      };
      const heavyState = aggregator.computeCognitiveState('dwight', 6, deepWorkSession, 20);
      expect(heavyState.score).toBeGreaterThan(0.7);
      expect(['high', 'overload']).toContain(heavyState.level);
      expect(heavyState.factors.length).toBeGreaterThanOrEqual(3);
    });

    it('retrieves environmental constraints and detects device parameters', () => {
      const env = aggregator.getEnvironmentalConstraints('dwight');
      expect(env.deviceType).toBeDefined();
      expect(env.networkStatus).toBe('online');
      expect(typeof env.quietHoursActive).toBe('boolean');
    });

    it('aggregates unified snapshot and computes cryptographic fingerprint', async () => {
      const snapshot = await aggregator.aggregateSnapshot('dwight');
      expect(snapshot.userId).toBe('dwight');
      expect(snapshot.userName).toBeDefined();
      expect(snapshot.cognitiveState).toBeDefined();
      expect(snapshot.contextFingerprint).toHaveLength(64);
    });

    it('queries relevance-ranked context and constructs composite prompt string', async () => {
      const result = await aggregator.queryRelevantContext(
        {
          actionOrGoal: 'Solve differential equation for Filipino physics learners',
          includeProfile: true,
          includeGoals: true,
        },
        'dwight'
      );

      expect(result.query).toContain('differential equation');
      expect(result.compositeContextString).toBeDefined();
      expect(typeof result.compositeContextString).toBe('string');
    });
  });

  describe('2. PersonalContextManager (Sessions, Timeline & Dashboard)', () => {
    it('activates, retrieves, and ends focus sessions', () => {
      const session = manager.setFocusSession(
        {
          mode: 'study_review',
          goal: 'Philippine LET Math Licensure Review',
          project: 'LET-2026',
          targetDurationMinutes: 60,
        },
        'dwight'
      );

      expect(session.id).toMatch(/^focus_/);
      expect(session.mode).toBe('study_review');
      expect(session.active).toBe(true);

      const active = manager.getActiveFocusSession('dwight');
      expect(active?.id).toBe(session.id);

      const ended = manager.endFocusSession('dwight');
      expect(ended?.active).toBe(false);
    });

    it('logs activity events and lists filtered timeline stream', () => {
      const item = manager.logActivity({
        userId: 'dwight',
        category: 'math',
        action: 'math.solve_hermite',
        summary: 'Solved Hermite differential equation with quantum number N=4',
      });

      expect(item.id).toMatch(/^act_/);
      expect(item.category).toBe('math');

      const all = manager.listActivities({}, 'dwight');
      expect(all.some((a) => a.id === item.id)).toBe(true);

      const mathOnly = manager.listActivities({ category: 'math' }, 'dwight');
      expect(mathOnly.every((a) => a.category === 'math')).toBe(true);
    });

    it('generates cross-system contextual insights', async () => {
      const insights = await manager.generateInsights('dwight');
      expect(insights.length).toBeGreaterThanOrEqual(2);
      expect(insights.some((i) => i.type === 'security')).toBe(true);
    });

    it('generates unified dashboard overview across all 28+ engines', async () => {
      const overview = await manager.getDashboardOverview('dwight');
      expect(overview.version).toBe('0.28.0-phase28');
      expect(overview.systemStatus).toBe('optimal');
      expect(overview.totalEnginesOnline).toBeGreaterThanOrEqual(28);
      expect(overview.engineStatuses['security-guardian']).toBe('online');
      expect(overview.engineStatuses['verification-suite']).toBe('online');
      expect(overview.engineStatuses['personal-context-engine']).toBe('online');
      expect(overview.zeroRecurrenceInvariantVerified).toBe(true);
    });

    it('enforces permission security for unpermitted users', () => {
      expect(() => {
        manager.setFocusSession({ mode: 'deep_work', goal: 'Unauthorized' }, 'unauthorized_user');
      }).toThrow(/Permission denied/);
    });
  });

  describe('3. ContextAgent (Agent Contract & Actions)', () => {
    let agent: ContextAgent;

    beforeEach(() => {
      agent = new ContextAgent(manager);
    });

    it('has valid metadata and capabilities', () => {
      expect(agent.definition.id).toBe('context-agent');
      expect(agent.definition.name).toContain('Context & Dashboard');
      expect(agent.definition.version).toBe('0.28.0-phase28');
      expect(agent.definition.capabilities).toContain('personal_context_aggregation');
      expect(agent.definition.capabilities).toContain('focus_session_management');
      expect(agent.definition.capabilities).toContain('dashboard_telemetry');
    });

    it('handles get_snapshot via agent execute()', async () => {
      const res = await agent.execute({ action: 'get_snapshot' });
      expect(res.success).toBe(true);
      expect(res.data).toHaveProperty('contextFingerprint');
      expect(res.data.userId).toBe('dwight');
    });

    it('handles set_focus and end_focus via agent execute()', async () => {
      const setRes = await agent.execute({
        action: 'set_focus',
        mode: 'coding',
        goal: 'Build Phase 28 Engine',
      });
      expect(setRes.success).toBe(true);
      expect(setRes.data.mode).toBe('coding');

      const endRes = await agent.execute({ action: 'end_focus' });
      expect(endRes.success).toBe(true);
      expect(endRes.data.active).toBe(false);
    });

    it('handles query_context via agent execute()', async () => {
      const res = await agent.execute({
        action: 'query_context',
        query: 'Tuklas Educational Pedagogy',
      });
      expect(res.success).toBe(true);
      expect(res.data).toHaveProperty('compositeContextString');
    });

    it('handles get_overview via agent execute()', async () => {
      const res = await agent.execute({ action: 'get_overview' });
      expect(res.success).toBe(true);
      expect(res.data.totalEnginesOnline).toBeGreaterThanOrEqual(28);
    });
  });

  describe('4. ContextTools Suite (8 Registered ITool Implementations)', () => {
    const tools = createContextTools(manager);

    it('instantiates exactly 8 specialized tools', () => {
      expect(tools.length).toBe(8);
      const ids = tools.map((t) => t.definition.id);
      expect(ids).toEqual([
        'context.get_snapshot',
        'context.set_focus_session',
        'context.query_relevant_context',
        'context.log_activity',
        'context.list_activities',
        'context.assess_cognitive_load',
        'context.get_dashboard_overview',
        'context.generate_insights',
      ]);
    });

    it('executes GetContextSnapshotTool successfully', async () => {
      const tool = new GetContextSnapshotTool(manager);
      const res = await tool.execute({});
      expect(res.success).toBe(true);
      expect(res.verified).toBe(true);
      expect(res.data).toHaveProperty('contextFingerprint');
    });

    it('executes SetFocusSessionTool successfully', async () => {
      const tool = new SetFocusSessionTool(manager);
      const res = await tool.execute({ mode: 'deep_work', goal: 'Autonomous Architecture' });
      expect(res.success).toBe(true);
      expect(res.verified).toBe(true);
      expect(res.data.mode).toBe('deep_work');
    });

    it('executes QueryRelevantContextTool successfully', async () => {
      const tool = new QueryRelevantContextTool(manager);
      const res = await tool.execute({ actionOrGoal: 'Verify LET Exam questions' });
      expect(res.success).toBe(true);
      expect(res.verified).toBe(true);
      expect(res.data).toHaveProperty('compositeContextString');
    });

    it('executes LogActivityTool successfully', async () => {
      const tool = new LogActivityTool(manager);
      const res = await tool.execute({
        category: 'code',
        action: 'code.refactor',
        summary: 'Refactored verification engine',
      });
      expect(res.success).toBe(true);
      expect(res.verified).toBe(true);
      expect(res.data).toHaveProperty('id');
    });

    it('executes ListActivitiesTool successfully', async () => {
      const tool = new ListActivitiesTool(manager);
      const res = await tool.execute({});
      expect(res.success).toBe(true);
      expect(res.verified).toBe(true);
      expect(res.data).toHaveProperty('activities');
    });

    it('executes AssessCognitiveLoadTool successfully', async () => {
      const tool = new AssessCognitiveLoadTool(manager);
      const res = await tool.execute({});
      expect(res.success).toBe(true);
      expect(res.verified).toBe(true);
      expect(res.data).toHaveProperty('level');
      expect(res.data).toHaveProperty('score');
    });

    it('executes GetDashboardOverviewTool successfully', async () => {
      const tool = new GetDashboardOverviewTool(manager);
      const res = await tool.execute({});
      expect(res.success).toBe(true);
      expect(res.verified).toBe(true);
      expect(res.data).toHaveProperty('totalEnginesOnline');
      expect(res.data.totalEnginesOnline).toBeGreaterThanOrEqual(28);
    });

    it('executes GenerateInsightsTool successfully', async () => {
      const tool = new GenerateInsightsTool(manager);
      const res = await tool.execute({});
      expect(res.success).toBe(true);
      expect(res.verified).toBe(true);
      expect(res.data).toHaveProperty('insights');
    });
  });
});
