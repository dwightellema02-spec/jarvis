export enum MemoryType {
  WORKING = 'WORKING',
  EPISODIC = 'EPISODIC',
  SEMANTIC = 'SEMANTIC',
  PREFERENCE = 'PREFERENCE',
  GOAL = 'GOAL',
  PROJECT = 'PROJECT',
  DOCUMENT = 'DOCUMENT',
}

export interface MemoryRecord {
  id: string;
  type: MemoryType;
  key: string;
  value: unknown;
  userId: string;
  confidence: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  metadata?: Record<string, unknown>;
}

export interface MemoryQueryFilter {
  type?: MemoryType;
  userId?: string;
  keyPrefix?: string;
  tags?: string[];
  limit?: number;
}

export interface IMemoryManager {
  store(record: Omit<MemoryRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<MemoryRecord>;
  retrieve(id: string): Promise<MemoryRecord | null>;
  query(filter: MemoryQueryFilter): Promise<MemoryRecord[]>;
  update(id: string, updates: Partial<MemoryRecord>): Promise<MemoryRecord | null>;
  delete(id: string): Promise<boolean>;
}
