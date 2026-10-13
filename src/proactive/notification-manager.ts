import { ProactiveNotification, NotificationStatus, NotificationSeverity, NotificationType } from './proactive.interface.js';

export class NotificationManager {
  private notifications: Map<string, ProactiveNotification> = new Map();

  constructor() {
    this.seedDefaultNotifications();
  }

  public listNotifications(filters?: { status?: NotificationStatus; severity?: NotificationSeverity; type?: NotificationType }): ProactiveNotification[] {
    let list = Array.from(this.notifications.values());

    if (filters) {
      if (filters.status) list = list.filter((n) => n.status === filters.status);
      if (filters.severity) list = list.filter((n) => n.severity === filters.severity);
      if (filters.type) list = list.filter((n) => n.type === filters.type);
    }

    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getNotification(id: string): ProactiveNotification | undefined {
    return this.notifications.get(id);
  }

  public addNotification(
    data: Omit<ProactiveNotification, 'id' | 'createdAt' | 'status'>
  ): ProactiveNotification | null {
    // Check if an unread notification with identical context & type already exists (deduplication)
    const existing = Array.from(this.notifications.values()).find(
      (n) =>
        n.status === 'unread' &&
        n.type === data.type &&
        n.title === data.title &&
        n.context.taskId === data.context.taskId &&
        n.context.projectId === data.context.projectId
    );

    if (existing) {
      return null; // Suppress duplicate
    }

    const id = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const notification: ProactiveNotification = {
      id,
      type: data.type,
      severity: data.severity,
      title: data.title,
      message: data.message,
      context: data.context,
      suggestedAction: data.suggestedAction,
      status: 'unread',
      createdAt: new Date().toISOString(),
      expiresAt: data.expiresAt,
    };

    this.notifications.set(id, notification);
    return notification;
  }

  public markAsRead(id: string): ProactiveNotification {
    const notif = this.notifications.get(id);
    if (!notif) {
      throw new Error(`Notification "${id}" not found`);
    }
    notif.status = 'read';
    return notif;
  }

  public dismissNotification(id: string): ProactiveNotification {
    const notif = this.notifications.get(id);
    if (!notif) {
      throw new Error(`Notification "${id}" not found`);
    }
    notif.status = 'dismissed';
    return notif;
  }

  public snoozeNotification(id: string, minutes: number = 60): ProactiveNotification {
    const notif = this.notifications.get(id);
    if (!notif) {
      throw new Error(`Notification "${id}" not found`);
    }
    notif.status = 'snoozed';
    notif.snoozedUntil = new Date(Date.now() + minutes * 60 * 1000).toISOString();
    return notif;
  }

  public markActedUpon(id: string): ProactiveNotification {
    const notif = this.notifications.get(id);
    if (!notif) {
      throw new Error(`Notification "${id}" not found`);
    }
    notif.status = 'acted_upon';
    return notif;
  }

  public clearDismissed(): number {
    let count = 0;
    for (const [id, notif] of this.notifications.entries()) {
      if (notif.status === 'dismissed') {
        this.notifications.delete(id);
        count++;
      }
    }
    return count;
  }

  private seedDefaultNotifications(): void {
    const defaultNotifs: Array<Omit<ProactiveNotification, 'id' | 'createdAt'>> = [
      {
        type: 'deadline_alert',
        severity: 'high',
        title: 'Imminent Milestone: JARVIS Phase 23 Proactivity Suite',
        message: 'Sprint milestone deliverable due today. 4 tests pending execution in core pipeline.',
        context: {
          projectId: 'proj_jarvis',
          goalId: 'goal_jarvis_prod',
          deadlineDate: new Date().toISOString().split('T')[0],
        },
        suggestedAction: {
          label: 'Run Verification Tests',
          action: 'run_tests',
          params: { filter: 'proactive' },
        },
        status: 'unread',
      },
      {
        type: 'study_due',
        severity: 'medium',
        title: 'Spaced Repetition: BLEPT Quadratic Equations Review Due',
        message: 'Topic has reached 7-day retention interval. Review now to maintain 92% mastery curve.',
        context: {
          topicId: 'topic_let_1',
        },
        suggestedAction: {
          label: 'Start 15m Drill',
          action: 'start_study_drill',
          params: { topicId: 'topic_let_1' },
        },
        status: 'unread',
      },
      {
        type: 'task_suggestion',
        severity: 'info',
        title: 'Optimal Deep Work Slot Available',
        message: 'No calendar commitments detected between 14:00 and 16:00. Ideal for architecture synthesis.',
        context: {},
        suggestedAction: {
          label: 'Timeblock 90m Slot',
          action: 'create_timeblock',
          params: { type: 'deep_work', duration: 90 },
        },
        status: 'unread',
      },
    ];

    for (const n of defaultNotifs) {
      const id = `notif_seed_${Math.random().toString(36).substring(2, 6)}`;
      this.notifications.set(id, {
        id,
        createdAt: new Date().toISOString(),
        ...n,
      });
    }
  }
}
