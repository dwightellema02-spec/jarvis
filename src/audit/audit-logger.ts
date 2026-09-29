import { AuditEvent, AuditFilter, AuditStorage } from './types.js';
import { sanitizeData } from '../security/sanitizer.js';
import { logger } from '../utils/logger.js';

export class InMemoryAuditStorage implements AuditStorage {
  private events: AuditEvent[] = [];

  public record(event: AuditEvent): void {
    const sanitized = sanitizeData(event) as AuditEvent;
    this.events.push(Object.freeze(sanitized));
  }

  public query(filter?: AuditFilter): Promise<AuditEvent[]> {
    if (!filter) {
      return Promise.resolve([...this.events]);
    }

    let results = [...this.events];

    if (filter.user) {
      results = results.filter((e) => e.user === filter.user);
    }
    if (filter.requestId) {
      results = results.filter((e) => e.requestId === filter.requestId);
    }
    if (filter.resource) {
      results = results.filter((e) => e.resource === filter.resource);
    }
    if (filter.action) {
      results = results.filter((e) => e.action === filter.action);
    }
    if (filter.decision) {
      results = results.filter((e) => e.decision === filter.decision);
    }
    if (filter.result) {
      results = results.filter((e) => e.result === filter.result);
    }

    return Promise.resolve(results);
  }

  public count(): Promise<number> {
    return Promise.resolve(this.events.length);
  }

  public clear(): void {
    this.events = [];
  }
}

export class AuditLogger {
  private storage: AuditStorage;

  constructor(storage?: AuditStorage) {
    this.storage = storage || new InMemoryAuditStorage();
  }

  public async log(event: Omit<AuditEvent, 'id' | 'timestamp'>): Promise<AuditEvent> {
    const fullEvent: AuditEvent = {
      ...event,
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date().toISOString(),
      details: event.details ? (sanitizeData(event.details) as Record<string, unknown>) : undefined,
    };

    await this.storage.record(fullEvent);
    logger.info(`Audit log recorded [${fullEvent.action}] on [${fullEvent.resource}] -> ${fullEvent.result}`, {
      user: fullEvent.user,
      requestId: fullEvent.requestId,
      decision: fullEvent.decision,
    });

    return fullEvent;
  }

  public async query(filter?: AuditFilter): Promise<AuditEvent[]> {
    return this.storage.query(filter);
  }

  public async getRecentLogs(limit = 50): Promise<AuditEvent[]> {
    const all = await this.storage.query();
    return all.slice(-limit).reverse();
  }
}
