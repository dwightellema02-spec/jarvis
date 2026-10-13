import { describe, it, expect, beforeEach } from 'vitest';
import {
  PreferencesManager,
  NotificationManager,
  ProactiveDaemon,
  ProactiveManager,
  ProactiveAgent,
  createProactiveTools,
  RunCycleTool,
  ListNotificationsTool,
  DismissNotificationTool,
  SuggestNextActionTool,
  ScanDeadlinesTool,
  GenerateBriefingTool,
  GetPreferencesTool,
  UpdatePreferencesTool,
} from '../../src/proactive/index.js';
import { GoalsManager } from '../../src/goals/index.js';
import { PermissionManager } from '../../src/security/permission-manager.js';
import { SecurityGuardian } from '../../src/security/guardian.js';
import { AuditLogger } from '../../src/audit/audit-logger.js';
import { PermissionLevel, ResourceType } from '../../src/security/types.js';

describe('Phase 23 — Proactive Intelligence Unit Tests', () => {
  let permissionManager: PermissionManager;
  let guardian: SecurityGuardian;
  let auditLogger: AuditLogger;
  let goalsManager: GoalsManager;
  let proactiveManager: ProactiveManager;

  beforeEach(() => {
    permissionManager = new PermissionManager();
    guardian = new SecurityGuardian();
    auditLogger = new AuditLogger();

    // Grant dwight admin and execute on PROJECTS
    permissionManager.grantPermission({
      userId: 'dwight',
      resource: ResourceType.PROJECTS,
      level: PermissionLevel.ADMIN,
      allowedActions: ['read', 'write', 'execute', 'modify', 'delete', 'admin'],
      grantedBy: 'system',
    });

    goalsManager = new GoalsManager({
      permissionManager,
      guardian,
      auditLogger,
    });

    proactiveManager = new ProactiveManager(goalsManager, {
      permissionManager,
      guardian,
      auditLogger,
    });
  });

  describe('PreferencesManager', () => {
    it('initializes with production defaults and monitored projects', () => {
      const pm = new PreferencesManager();
      const prefs = pm.getPreferences();

      expect(prefs.enabled).toBe(true);
      expect(prefs.monitoredProjectIds).toContain('proj_jarvis');
      expect(prefs.monitoredProjectIds).toContain('proj_tuklas');
      expect(prefs.quietHours.enabled).toBe(true);
      expect(prefs.quietHours.start).toBe('22:30');
      expect(prefs.quietHours.end).toBe('07:00');
      expect(prefs.maxNotificationsPerHour).toBe(10);
      expect(prefs.enableSpacedRepetitionAlerts).toBe(true);
    });

    it('validates project monitoring boundaries', () => {
      const pm = new PreferencesManager();
      expect(pm.isProjectApproved('proj_jarvis')).toBe(true);
      expect(pm.isProjectApproved('proj_tuklas')).toBe(true);
      expect(pm.isProjectApproved('unauthorized_crypto_mine')).toBe(false);

      pm.approveProject('proj_custom');
      expect(pm.isProjectApproved('proj_custom')).toBe(true);

      pm.revokeProject('proj_custom');
      expect(pm.isProjectApproved('proj_custom')).toBe(false);
    });

    it('evaluates quiet hours boundary accurately', () => {
      const pmAlwaysQuiet = new PreferencesManager({
        quietHours: { enabled: true, start: '00:00', end: '23:59' },
      });
      expect(pmAlwaysQuiet.isQuietHoursActive()).toBe(true);

      const pmDisabled = new PreferencesManager({
        quietHours: { enabled: false, start: '00:00', end: '23:59' },
      });
      expect(pmDisabled.isQuietHoursActive()).toBe(false);
    });

    it('enforces notification rate limiting (max 10 per hour)', () => {
      const pm = new PreferencesManager({ maxNotificationsPerHour: 3 });

      expect(pm.canSendNotification()).toBe(true);
      expect(pm.canSendNotification()).toBe(true);
      expect(pm.canSendNotification()).toBe(true);

      // 4th notification in same hour is blocked
      expect(pm.canSendNotification()).toBe(false);
    });

    it('updates preferences cleanly', () => {
      const pm = new PreferencesManager();
      const updated = pm.updatePreferences({
        maxNotificationsPerHour: 15,
        deadlineThresholdHours: 36,
        enableSpacedRepetitionAlerts: false,
      });

      expect(updated.maxNotificationsPerHour).toBe(15);
      expect(updated.deadlineThresholdHours).toBe(36);
      expect(updated.enableSpacedRepetitionAlerts).toBe(false);
    });
  });

  describe('NotificationManager', () => {
    it('initializes with seeded actionable notifications', () => {
      const nm = new NotificationManager();
      const notifs = nm.listNotifications();
      expect(notifs.length).toBeGreaterThanOrEqual(2);
      expect(notifs.some((n) => n.context.projectId === 'proj_jarvis')).toBe(true);
    });

    it('adds new notifications with deduplication', () => {
      const nm = new NotificationManager();
      const notif1 = nm.addNotification({
        type: 'deadline_alert',
        severity: 'high',
        title: 'Task Overdue',
        message: 'Security Audit task is pending',
        context: { taskId: 'task_audit_1', projectId: 'proj_jarvis' },
      });

      expect(notif1).not.toBeNull();
      expect(notif1?.id).toBeDefined();
      expect(notif1?.status).toBe('unread');

      // Attempt duplicate with same title, task, and project
      const notif2 = nm.addNotification({
        type: 'deadline_alert',
        severity: 'high',
        title: 'Task Overdue',
        message: 'Security Audit task is pending duplicate',
        context: { taskId: 'task_audit_1', projectId: 'proj_jarvis' },
      });

      expect(notif2).toBeNull(); // Suppressed duplicate
    });

    it('marks notification as read, dismissed, and snoozed', () => {
      const nm = new NotificationManager();
      const n = nm.addNotification({
        type: 'task_suggestion',
        severity: 'info',
        title: 'Meeting in 15 mins',
        message: 'Standup with Tuklas team',
        context: {},
      });

      expect(n).not.toBeNull();
      const id = n!.id;

      const read = nm.markAsRead(id);
      expect(read.status).toBe('read');

      const snoozed = nm.snoozeNotification(id, 30);
      expect(snoozed.status).toBe('snoozed');
      expect(snoozed.snoozedUntil).toBeDefined();

      const dismissed = nm.dismissNotification(id);
      expect(dismissed.status).toBe('dismissed');
    });

    it('filters list by status, severity, and type', () => {
      const nm = new NotificationManager();
      nm.addNotification({
        type: 'system_health',
        severity: 'critical',
        title: 'Critical Bug Found',
        message: 'Stack trace in dev pipeline',
        context: {},
      });

      const criticalOnly = nm.listNotifications({ severity: 'critical' });
      expect(criticalOnly.every((n) => n.severity === 'critical')).toBe(true);

      const unreadOnly = nm.listNotifications({ status: 'unread' });
      expect(unreadOnly.every((n) => n.status === 'unread')).toBe(true);
    });
  });

  describe('ProactiveDaemon', () => {
    let daemon: ProactiveDaemon;
    let pm: PreferencesManager;
    let nm: NotificationManager;

    beforeEach(() => {
      pm = new PreferencesManager();
      nm = new NotificationManager();
      daemon = new ProactiveDaemon(pm, nm, goalsManager);
    });

    it('executes tick and returns complete cycle result', () => {
      const result = daemon.tick();
      expect(result.timestamp).toBeDefined();
      expect(result.monitoredProjectsCount).toBeGreaterThanOrEqual(1);
      expect(result.deadlinesScanned).toBeGreaterThanOrEqual(1);
      expect(Array.isArray(result.notificationsGenerated)).toBe(true);
      expect(typeof result.quietHoursActive).toBe('boolean');
      expect(typeof result.durationMs).toBe('number');
    });

    it('suggests prioritized next actions', () => {
      const suggestions = daemon.suggestNextActions(5);
      expect(Array.isArray(suggestions)).toBe(true);
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions[0].impactScore).toBeGreaterThanOrEqual(suggestions[suggestions.length - 1].impactScore);
      expect(suggestions[0].title).toBeDefined();
      expect(suggestions[0].actionType).toBeDefined();
    });

    it('generates rich daily briefing (morning & evening)', () => {
      const morningBriefing = daemon.generateBriefing('morning');
      expect(morningBriefing.type).toBe('morning');
      expect(morningBriefing.focusGoal).toBeDefined();
      expect(Array.isArray(morningBriefing.topTasks)).toBe(true);
      expect(morningBriefing.systemHealth.guardianStatus).toContain('ENFORCED');

      const eveningBriefing = daemon.generateBriefing('evening');
      expect(eveningBriefing.type).toBe('evening');
      expect(eveningBriefing.greeting).toContain('evening');
    });
  });

  describe('ProactiveManager', () => {
    it('runs cycle and records audit trail for authorized user', () => {
      const result = proactiveManager.runCycle('dwight');
      expect(result).toBeDefined();
      expect(result.monitoredProjectsCount).toBeGreaterThan(0);
    });

    it('denies execution when user lacks permissions', () => {
      expect(() => {
        proactiveManager.runCycle('guest_without_perms');
      }).toThrow();
    });

    it('lists and mutates notifications via ProactiveManager', () => {
      const notifs = proactiveManager.listNotifications({}, 'dwight');
      expect(Array.isArray(notifs)).toBe(true);
      expect(notifs.length).toBeGreaterThan(0);

      const firstId = notifs[0].id;
      const read = proactiveManager.markAsRead(firstId, 'dwight');
      expect(read.status).toBe('read');

      const dismissed = proactiveManager.dismissNotification(firstId, 'dwight');
      expect(dismissed.status).toBe('dismissed');
    });

    it('manages operator monitoring boundaries and preferences', () => {
      const prefs = proactiveManager.getPreferences('dwight');
      expect(prefs.enabled).toBe(true);

      const updated = proactiveManager.updatePreferences({ maxNotificationsPerHour: 12 }, 'dwight');
      expect(updated.maxNotificationsPerHour).toBe(12);

      const approved = proactiveManager.approveProject('proj_new_lab', 'dwight');
      expect(approved.monitoredProjectIds).toContain('proj_new_lab');

      const revoked = proactiveManager.revokeProject('proj_new_lab', 'dwight');
      expect(revoked.monitoredProjectIds).not.toContain('proj_new_lab');
    });

    it('generates briefing and next action suggestions', () => {
      const suggestions = proactiveManager.suggestNextActions(3, 'dwight');
      expect(suggestions.length).toBeGreaterThan(0);

      const briefing = proactiveManager.generateBriefing('morning', 'dwight');
      expect(briefing.type).toBe('morning');
      expect(briefing.focusGoal).toBeDefined();
    });
  });

  describe('ProactiveAgent', () => {
    let agent: ProactiveAgent;
    const agentCtx = {
      requestId: 'req_ag_1',
      userId: 'dwight',
      sessionId: 'sess_1',
      grantedPermissions: [],
    };

    beforeEach(() => {
      agent = new ProactiveAgent(proactiveManager);
    });

    it('verifies agent contract and metadata', () => {
      expect(agent.definition.id).toBe('proactive-agent');
      expect(agent.definition.name).toBe('Proactive Intelligence Agent');
      expect(agent.definition.version).toBe('0.23.0-phase23');
      expect(agent.definition.capabilities).toContain('scan_deadlines');
      expect(agent.definition.capabilities).toContain('suggest_next_actions');
      expect(agent.definition.capabilities).toContain('generate_briefings');
    });

    it('executes proactive cycle via agent', async () => {
      const res = await agent.execute({ action: 'run_cycle' }, agentCtx);

      expect(res.success).toBe(true);
      expect(res.agentId).toBe('proactive-agent');
      expect((res.data as any).monitoredProjectsCount).toBeGreaterThan(0);
    });

    it('executes suggestions via agent', async () => {
      const res = await agent.execute({ action: 'suggest_actions', limit: 2 }, agentCtx);

      expect(res.success).toBe(true);
      expect(res.agentId).toBe('proactive-agent');
      expect(Array.isArray(res.data)).toBe(true);
      expect((res.data as any[]).length).toBeGreaterThan(0);
    });

    it('executes briefing via agent', async () => {
      const res = await agent.execute({ action: 'generate_briefing', briefingType: 'morning' }, agentCtx);

      expect(res.success).toBe(true);
      expect(res.agentId).toBe('proactive-agent');
      expect((res.data as any).type).toBe('morning');
      expect((res.data as any).focusGoal).toBeDefined();
    });
  });

  describe('Proactive Tools', () => {
    const toolCtx = {
      requestId: 'req_tool_1',
      userId: 'dwight',
      sessionId: 'sess_1',
      permissionVerified: true,
    };

    it('creates all 8 proactive tools with createProactiveTools', () => {
      const tools = createProactiveTools(proactiveManager);
      expect(tools.length).toBe(8);
      const ids = tools.map((t) => t.definition.id);
      expect(ids).toContain('proactive.run_cycle');
      expect(ids).toContain('proactive.list_notifications');
      expect(ids).toContain('proactive.dismiss_notification');
      expect(ids).toContain('proactive.suggest_next_action');
      expect(ids).toContain('proactive.scan_deadlines');
      expect(ids).toContain('proactive.generate_briefing');
      expect(ids).toContain('proactive.get_preferences');
      expect(ids).toContain('proactive.update_preferences');
    });

    it('executes RunCycleTool', async () => {
      const tool = new RunCycleTool(proactiveManager);
      const res = await tool.execute({}, toolCtx);
      expect(res.success).toBe(true);
      expect(res.toolId).toBe('proactive.run_cycle');
      expect((res.data as any).monitoredProjectsCount).toBeGreaterThan(0);
    });

    it('executes ListNotificationsTool', async () => {
      const tool = new ListNotificationsTool(proactiveManager);
      const res = await tool.execute({}, toolCtx);
      expect(res.success).toBe(true);
      expect(res.toolId).toBe('proactive.list_notifications');
      expect(Array.isArray(res.data)).toBe(true);
    });

    it('executes DismissNotificationTool', async () => {
      const tool = new DismissNotificationTool(proactiveManager);
      const notifs = proactiveManager.listNotifications({}, 'dwight');
      const targetId = notifs[0].id;

      const res = await tool.execute({ notificationId: targetId }, toolCtx);
      expect(res.success).toBe(true);
      expect((res.data as any).status).toBe('dismissed');
    });

    it('executes SuggestNextActionTool', async () => {
      const tool = new SuggestNextActionTool(proactiveManager);
      const res = await tool.execute({ limit: 3 }, toolCtx);
      expect(res.success).toBe(true);
      expect(Array.isArray(res.data)).toBe(true);
      expect((res.data as any[]).length).toBeGreaterThan(0);
    });

    it('executes ScanDeadlinesTool', async () => {
      const tool = new ScanDeadlinesTool(proactiveManager);
      const res = await tool.execute({}, toolCtx);
      expect(res.success).toBe(true);
      expect(typeof (res.data as any).deadlinesScanned).toBe('number');
    });

    it('executes GenerateBriefingTool', async () => {
      const tool = new GenerateBriefingTool(proactiveManager);
      const res = await tool.execute({ type: 'morning' }, toolCtx);
      expect(res.success).toBe(true);
      expect((res.data as any).type).toBe('morning');
      expect((res.data as any).focusGoal).toBeDefined();
    });

    it('executes GetPreferencesTool and UpdatePreferencesTool', async () => {
      const getTool = new GetPreferencesTool(proactiveManager);
      const updateTool = new UpdatePreferencesTool(proactiveManager);

      const getRes = await getTool.execute({}, toolCtx);
      expect(getRes.success).toBe(true);
      expect((getRes.data as any).enabled).toBe(true);

      const updateRes = await updateTool.execute(
        { updates: { maxNotificationsPerHour: 18 } },
        toolCtx
      );
      expect(updateRes.success).toBe(true);
      expect((updateRes.data as any).maxNotificationsPerHour).toBe(18);
    });
  });
});
