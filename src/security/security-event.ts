export enum SecurityEventType {
  PERMISSION_REQUESTED = 'PERMISSION_REQUESTED',
  PERMISSION_GRANTED = 'PERMISSION_GRANTED',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  ACTION_BLOCKED = 'ACTION_BLOCKED',
  SECURITY_WARNING = 'SECURITY_WARNING',
  THREAT_DETECTED = 'THREAT_DETECTED',
  AUTHORIZATION_FAILURE = 'AUTHORIZATION_FAILURE',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
}

export interface SecurityEvent {
  id: string;
  type: SecurityEventType;
  timestamp: string;
  requestId?: string;
  userId?: string;
  resource?: string;
  action?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: Record<string, unknown>;
  ipAddress?: string;
}

export interface SecurityEventSink {
  record(event: SecurityEvent): Promise<void> | void;
  query(filter?: Partial<SecurityEvent>): Promise<SecurityEvent[]>;
}

export class InMemorySecurityEventSink implements SecurityEventSink {
  private events: SecurityEvent[] = [];

  public record(event: SecurityEvent): void {
    this.events.push(Object.freeze({ ...event }));
  }

  public query(filter?: Partial<SecurityEvent>): Promise<SecurityEvent[]> {
    if (!filter) {
      return Promise.resolve([...this.events]);
    }

    return Promise.resolve(
      this.events.filter((ev) => {
        for (const [key, val] of Object.entries(filter)) {
          if (ev[key as keyof SecurityEvent] !== val) {
            return false;
          }
        }
        return true;
      })
    );
  }

  public clear(): void {
    this.events = [];
  }
}
