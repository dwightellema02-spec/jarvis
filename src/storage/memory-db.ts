import { IDatabaseConnection, IRepository } from './database.interface.js';
import { logger } from '../utils/logger.js';

export class InMemoryRepository<T extends { id: string }> implements IRepository<T> {
  protected items: Map<string, T> = new Map();

  public async create(item: Omit<T, 'id'>): Promise<T> {
    const id = `item_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const fullItem = { ...item, id } as unknown as T;
    this.items.set(id, fullItem);
    return fullItem;
  }

  public async findById(id: string): Promise<T | null> {
    return this.items.get(id) || null;
  }

  public async findAll(filter?: Partial<T>): Promise<T[]> {
    const list = Array.from(this.items.values());
    if (!filter) {
      return list;
    }
    return list.filter((item) => {
      for (const [k, v] of Object.entries(filter)) {
        if (item[k as keyof T] !== v) {
          return false;
        }
      }
      return true;
    });
  }

  public async update(id: string, updates: Partial<T>): Promise<T | null> {
    const existing = this.items.get(id);
    if (!existing) {
      return null;
    }
    const updated = { ...existing, ...updates };
    this.items.set(id, updated);
    return updated;
  }

  public async delete(id: string): Promise<boolean> {
    return this.items.delete(id);
  }

  public clear(): void {
    this.items.clear();
  }
}

export class JarvisDatabaseConnection implements IDatabaseConnection {
  private connected = false;

  public async connect(): Promise<void> {
    this.connected = true;
    logger.info('JARVIS Database storage layer initialized');
  }

  public async disconnect(): Promise<void> {
    this.connected = false;
    logger.info('JARVIS Database storage layer disconnected');
  }

  public isConnected(): boolean {
    return this.connected;
  }

  public async healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; latencyMs: number }> {
    const start = Date.now();
    return {
      status: this.connected ? 'healthy' : 'unhealthy',
      latencyMs: Date.now() - start,
    };
  }
}
