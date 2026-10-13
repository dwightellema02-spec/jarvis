import {
  DailyBriefing,
  MonitoringPreferences,
  NextActionSuggestion,
  NotificationSeverity,
  NotificationStatus,
  NotificationType,
  ProactiveCycleResult,
  ProactiveNotification,
} from './proactive.interface.js';
import { PreferencesManager } from './preferences-manager.js';
import { NotificationManager } from './notification-manager.js';
import { ProactiveDaemon } from './proactive-daemon.js';
import { GoalsManager } from '../goals/goals-manager.js';
import { PermissionManager } from '../security/permission-manager.js';
import { SecurityGuardian } from '../security/guardian.js';
import { AuditLogger } from '../audit/audit-logger.js';
import { PermissionLevel, ResourceType, SecurityDecisionType } from '../security/types.js';
import { logger } from '../utils/logger.js';

export interface ProactiveManagerOptions {
  permissionManager?: PermissionManager;
  guardian?: SecurityGuardian;
  auditLogger?: AuditLogger;
  preferences?: Partial<MonitoringPreferences>;
}

export class ProactiveManager {
  private preferencesManager: PreferencesManager;
  private notificationManager: NotificationManager;
  private daemon: ProactiveDaemon;

  private permissionManager?: PermissionManager;
  private guardian?: SecurityGuardian;
  private auditLogger?: AuditLogger;

  constructor(
    private goalsManager: GoalsManager,
    options?: ProactiveManagerOptions
  ) {
    this.permissionManager = options?.permissionManager;
    this.guardian = options?.guardian;
    this.auditLogger = options?.auditLogger;

    this.preferencesManager = new PreferencesManager(options?.preferences);
    this.notificationManager = new NotificationManager();
    this.daemon = new ProactiveDaemon(
      this.preferencesManager,
      this.notificationManager,
      this.goalsManager
    );
  }

  public getPreferencesManager(): PreferencesManager {
    return this.preferencesManager;
  }

  public getNotificationManager(): NotificationManager {
    return this.notificationManager;
  }

  public getDaemon(): ProactiveDaemon {
    return this.daemon;
  }

  // --- Security & Audit Helpers ---
  private checkPermission(
    action: 'read' | 'write' | 'execute' | 'admin',
    level: PermissionLevel,
    userId: string
  ): void {
    if (this.permissionManager) {
      const check = this.permissionManager.checkPermission({
        userId,
        resource: ResourceType.PROJECTS,
        action,
        requiredLevel: level,
      });

      if (!check.allowed) {
        if (this.auditLogger) {
          this.auditLogger.log({
            user: userId,
            requestId: `req_proact_${Date.now()}`,
            resource: ResourceType.PROJECTS,
            action: action as any,
            permissionRequired: level,
            permissionGranted: PermissionLevel.READ,
            decision: SecurityDecisionType.DENY,
            reason: `Access denied to PROACTIVE subsystem (${action}) for user "${userId}".`,
            result: 'FAILED',
            durationMs: 1,
          });
        }
        throw new Error(`Security Violation: User "${userId}" does not have ${level} permission to perform "${action}" on PROACTIVE subsystem.`);
      }
    }

    if (this.auditLogger) {
      this.auditLogger.log({
        user: userId,
        requestId: `req_proact_${Date.now()}`,
        resource: ResourceType.PROJECTS,
        action: action as any,
        permissionRequired: level,
        permissionGranted: level,
        decision: SecurityDecisionType.ALLOW,
        reason: `Proactive action "${action}" authorized.`,
        result: 'SUCCESS',
        durationMs: 1,
      });
    }
  }

  // --- Core Capabilities ---

  public runCycle(user: string = 'dwight', now?: Date): ProactiveCycleResult {
    this.checkPermission('execute', PermissionLevel.EXECUTE, user);
    return this.daemon.tick(now);
  }

  public listNotifications(
    filters?: { status?: NotificationStatus; severity?: NotificationSeverity; type?: NotificationType },
    user: string = 'dwight'
  ): ProactiveNotification[] {
    this.checkPermission('read', PermissionLevel.READ, user);
    return this.notificationManager.listNotifications(filters);
  }

  public dismissNotification(id: string, user: string = 'dwight'): ProactiveNotification {
    this.checkPermission('write', PermissionLevel.WRITE, user);
    return this.notificationManager.dismissNotification(id);
  }

  public markAsRead(id: string, user: string = 'dwight'): ProactiveNotification {
    this.checkPermission('write', PermissionLevel.WRITE, user);
    return this.notificationManager.markAsRead(id);
  }

  public snoozeNotification(id: string, minutes: number = 60, user: string = 'dwight'): ProactiveNotification {
    this.checkPermission('write', PermissionLevel.WRITE, user);
    return this.notificationManager.snoozeNotification(id, minutes);
  }

  public suggestNextActions(limit: number = 3, user: string = 'dwight'): NextActionSuggestion[] {
    this.checkPermission('read', PermissionLevel.READ, user);
    return this.daemon.suggestNextActions(limit);
  }

  public generateBriefing(type: 'morning' | 'evening' = 'morning', user: string = 'dwight'): DailyBriefing {
    this.checkPermission('read', PermissionLevel.READ, user);
    return this.daemon.generateBriefing(type);
  }

  public getPreferences(user: string = 'dwight'): MonitoringPreferences {
    this.checkPermission('read', PermissionLevel.READ, user);
    return this.preferencesManager.getPreferences();
  }

  public updatePreferences(updates: Partial<MonitoringPreferences>, user: string = 'dwight'): MonitoringPreferences {
    this.checkPermission('write', PermissionLevel.WRITE, user);

    if (this.guardian && updates.monitoredProjectIds) {
      for (const p of updates.monitoredProjectIds) {
        const threat = this.guardian.evaluate({
          resource: ResourceType.PROJECTS,
          action: 'write',
          target: p,
          userId: user,
        });
        if (threat.decision === SecurityDecisionType.DENY) {
          throw new Error(`Security Guardian blocked monitoring project "${p}": ${threat.reason}`);
        }
      }
    }

    return this.preferencesManager.updatePreferences(updates);
  }

  public approveProject(projectId: string, user: string = 'dwight'): MonitoringPreferences {
    this.checkPermission('write', PermissionLevel.WRITE, user);
    if (this.guardian) {
      const threat = this.guardian.evaluate({
        resource: ResourceType.PROJECTS,
        action: 'write',
        target: projectId,
        userId: user,
      });
      if (threat.decision === SecurityDecisionType.DENY) {
        throw new Error(`Security Guardian blocked monitoring project "${projectId}": ${threat.reason}`);
      }
    }
    return this.preferencesManager.approveProject(projectId);
  }

  public revokeProject(projectId: string, user: string = 'dwight'): MonitoringPreferences {
    this.checkPermission('write', PermissionLevel.WRITE, user);
    return this.preferencesManager.revokeProject(projectId);
  }
}
