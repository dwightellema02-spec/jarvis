import { MonitoringPreferences } from './proactive.interface.js';

export class PreferencesManager {
  private preferences: MonitoringPreferences;
  private notificationTimestamps: number[] = [];

  constructor(initial?: Partial<MonitoringPreferences>) {
    this.preferences = {
      enabled: true,
      monitoredProjectIds: ['proj_jarvis', 'proj_tuklas'],
      monitoredTaskCategories: ['coding', 'education', 'research'],
      deadlineThresholdHours: 24,
      stalledTaskThresholdHours: 48,
      enableSpacedRepetitionAlerts: true,
      enableSystemHealthAlerts: true,
      enableMorningBriefing: true,
      enableEveningSummary: true,
      quietHours: {
        enabled: true,
        start: '22:30',
        end: '07:00',
      },
      maxNotificationsPerHour: 10,
      channels: {
        hud: true,
        audioSpeech: false,
        systemLog: true,
      },
      ...initial,
    };
  }

  public getPreferences(): MonitoringPreferences {
    return {
      ...this.preferences,
      monitoredProjectIds: [...this.preferences.monitoredProjectIds],
      monitoredTaskCategories: [...this.preferences.monitoredTaskCategories],
      quietHours: { ...this.preferences.quietHours },
      channels: { ...this.preferences.channels },
    };
  }

  public updatePreferences(updates: Partial<MonitoringPreferences>): MonitoringPreferences {
    if (updates.deadlineThresholdHours !== undefined && updates.deadlineThresholdHours <= 0) {
      throw new Error('deadlineThresholdHours must be greater than 0');
    }
    if (updates.maxNotificationsPerHour !== undefined && updates.maxNotificationsPerHour <= 0) {
      throw new Error('maxNotificationsPerHour must be greater than 0');
    }

    this.preferences = {
      ...this.preferences,
      ...updates,
      quietHours: {
        ...this.preferences.quietHours,
        ...(updates.quietHours || {}),
      },
      channels: {
        ...this.preferences.channels,
        ...(updates.channels || {}),
      },
    };

    return this.getPreferences();
  }

  /**
   * Invariant: User strictly controls what projects JARVIS is allowed to monitor.
   */
  public isProjectApproved(projectId: string): boolean {
    if (!this.preferences.enabled) return false;
    return this.preferences.monitoredProjectIds.includes(projectId);
  }

  public approveProject(projectId: string): MonitoringPreferences {
    if (!this.preferences.monitoredProjectIds.includes(projectId)) {
      this.preferences.monitoredProjectIds.push(projectId);
    }
    return this.getPreferences();
  }

  public revokeProject(projectId: string): MonitoringPreferences {
    this.preferences.monitoredProjectIds = this.preferences.monitoredProjectIds.filter(
      (id) => id !== projectId
    );
    return this.getPreferences();
  }

  /**
   * Evaluates if current local time falls into quiet hours window.
   */
  public isQuietHoursActive(now: Date = new Date()): boolean {
    if (!this.preferences.quietHours.enabled) return false;

    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const [startH, startM] = this.preferences.quietHours.start.split(':').map(Number);
    const [endH, endM] = this.preferences.quietHours.end.split(':').map(Number);

    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    if (startMinutes > endMinutes) {
      // Overnight window (e.g., 22:30 to 07:00)
      return currentMinutes >= startMinutes || currentMinutes < endMinutes;
    } else {
      // Daytime window
      return currentMinutes >= startMinutes && currentMinutes < endMinutes;
    }
  }

  /**
   * Enforces operator rate limiting to prevent proactive notification fatigue.
   */
  public canSendNotification(now: number = Date.now()): boolean {
    if (!this.preferences.enabled) return false;

    const oneHourAgo = now - 60 * 60 * 1000;
    this.notificationTimestamps = this.notificationTimestamps.filter((ts) => ts > oneHourAgo);

    if (this.notificationTimestamps.length >= this.preferences.maxNotificationsPerHour) {
      return false;
    }

    this.notificationTimestamps.push(now);
    return true;
  }
}
