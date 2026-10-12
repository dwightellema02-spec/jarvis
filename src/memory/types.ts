import { MemoryType, MemoryRecord } from './memory.interface.js';

export interface MemoryCorrection {
  id: string;
  memoryId: string;
  previousValue: unknown;
  newValue: unknown;
  reason: string;
  timestamp: string;
  correctedBy: string;
}

export interface MemoryRelevanceResult {
  record: MemoryRecord;
  score: number;
  matchReason: string;
}

export interface SearchRelevantOptions {
  userId: string;
  limit?: number;
  types?: MemoryType[];
  minScore?: number;
  tags?: string[];
}

export interface MemoryStoreOptions {
  key: string;
  value: unknown;
  type?: MemoryType;
  userId: string;
  confidence?: number;
  tags?: string[];
  expiresAt?: string;
  metadata?: Record<string, unknown>;
}

export interface CorrectMemoryOptions {
  memoryIdOrKey: string;
  newValue: unknown;
  reason: string;
  userId: string;
}

export interface ConversationHistoryQuery {
  userId: string;
  sessionId?: string;
  limit?: number;
  searchTerm?: string;
}
