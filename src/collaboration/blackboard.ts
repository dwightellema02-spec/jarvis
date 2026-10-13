import { logger } from '../utils/logger.js';

export interface BlackboardEntry {
  key: string;
  value: unknown;
  writtenBy: string; // agentId or 'system'
  updatedAt: string;
  version: number;
}

export class SharedBlackboard {
  private state: Map<string, BlackboardEntry> = new Map();

  constructor(initialData?: Record<string, unknown>, author: string = 'system') {
    if (initialData) {
      for (const [key, value] of Object.entries(initialData)) {
        this.set(key, value, author);
      }
    }
  }

  public get<T = unknown>(key: string): T | undefined {
    const entry = this.state.get(key);
    return entry ? (entry.value as T) : undefined;
  }

  public getEntry(key: string): BlackboardEntry | undefined {
    return this.state.get(key);
  }

  public set(key: string, value: unknown, writtenBy: string): BlackboardEntry {
    const existing = this.state.get(key);
    const entry: BlackboardEntry = {
      key,
      value,
      writtenBy,
      updatedAt: new Date().toISOString(),
      version: existing ? existing.version + 1 : 1,
    };
    this.state.set(key, entry);
    logger.debug(`[Blackboard] Key "${key}" updated by "${writtenBy}" (v${entry.version})`);
    return entry;
  }

  public delete(key: string): boolean {
    return this.state.delete(key);
  }

  public has(key: string): boolean {
    return this.state.has(key);
  }

  public toRecord(): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const [key, entry] of this.state.entries()) {
      result[key] = entry.value;
    }
    return result;
  }

  public getDetailedSnapshot(): Record<string, BlackboardEntry> {
    const result: Record<string, BlackboardEntry> = {};
    for (const [key, entry] of this.state.entries()) {
      result[key] = entry;
    }
    return result;
  }

  public keys(): string[] {
    return Array.from(this.state.keys());
  }

  public clear(): void {
    this.state.clear();
  }
}
