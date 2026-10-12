import {
  IMemoryManager,
  MemoryRecord,
  MemoryType,
  MemoryQueryFilter,
} from './memory.interface.js';
import {
  MemoryCorrection,
  MemoryRelevanceResult,
  SearchRelevantOptions,
  MemoryStoreOptions,
  CorrectMemoryOptions,
} from './types.js';
import { scoreMemoryRelevance, formatMemoriesForPrompt } from './relevance-engine.js';
import { PermissionManager } from '../security/permission-manager.js';
import { AuditLogger } from '../audit/audit-logger.js';
import { ResourceType, PermissionLevel, SecurityDecisionType } from '../security/types.js';
import { ValidationError, NotFoundError, PermissionDeniedError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

export interface ConversationMemoryManagerConfig {
  permissionManager?: PermissionManager;
  auditLogger?: AuditLogger;
  initialMemories?: MemoryRecord[];
}

export class ConversationMemoryManager implements IMemoryManager {
  private memories: Map<string, MemoryRecord> = new Map();
  private corrections: MemoryCorrection[] = [];
  private permissionManager?: PermissionManager;
  private auditLogger?: AuditLogger;

  constructor(config: ConversationMemoryManagerConfig = {}) {
    this.permissionManager = config.permissionManager;
    this.auditLogger = config.auditLogger;

    if (config.initialMemories) {
      for (const m of config.initialMemories) {
        this.memories.set(m.id, JSON.parse(JSON.stringify(m)));
      }
    }
  }

  private checkPermission(userId: string, level: PermissionLevel, action: 'read' | 'write' | 'delete'): void {
    if (!this.permissionManager) return;

    const res = this.permissionManager.checkPermission({
      userId,
      resource: ResourceType.DATABASES,
      action,
      requiredLevel: level,
      targetIdentifier: 'conversation_memory',
    });

    if (!res.allowed) {
      throw new PermissionDeniedError(ResourceType.DATABASES, action, level, {
        userId,
        reason: res.reason,
      });
    }
  }

  /**
   * Store or update a memory record with permission checks.
   */
  public async store(record: MemoryStoreOptions): Promise<MemoryRecord> {
    if (!record.key || record.key.trim().length === 0) {
      throw new ValidationError('Memory key is required and cannot be empty');
    }

    this.checkPermission(record.userId, PermissionLevel.WRITE, 'write');

    const now = new Date().toISOString();

    // Check if memory with identical key exists for user
    const existing = Array.from(this.memories.values()).find(
      (m) => m.userId === record.userId && m.key.toLowerCase() === record.key.toLowerCase()
    );

    let finalRecord: MemoryRecord;

    if (existing) {
      finalRecord = {
        ...existing,
        value: record.value,
        type: record.type || existing.type,
        confidence: record.confidence ?? existing.confidence,
        tags: Array.from(new Set([...existing.tags, ...(record.tags || [])])),
        updatedAt: now,
        expiresAt: record.expiresAt || existing.expiresAt,
        metadata: { ...existing.metadata, ...record.metadata },
      };
      this.memories.set(existing.id, finalRecord);
      logger.info(`Updated existing memory '${finalRecord.key}' for user ${record.userId}`);
    } else {
      finalRecord = {
        id: `mem_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        type: record.type || MemoryType.EPISODIC,
        key: record.key,
        value: record.value,
        userId: record.userId,
        confidence: record.confidence ?? 0.9,
        tags: record.tags || [],
        createdAt: now,
        updatedAt: now,
        expiresAt: record.expiresAt,
        metadata: record.metadata,
      };
      this.memories.set(finalRecord.id, finalRecord);
      logger.info(`Stored new memory record [${finalRecord.id}] '${finalRecord.key}' for user ${record.userId}`);
    }

    return JSON.parse(JSON.stringify(finalRecord));
  }

  /**
   * Retrieve a memory record by ID.
   */
  public async retrieve(id: string, userId = 'default_user'): Promise<MemoryRecord | null> {
    this.checkPermission(userId, PermissionLevel.READ, 'read');
    const rec = this.memories.get(id);
    if (!rec) return null;
    return JSON.parse(JSON.stringify(rec));
  }

  /**
   * Query memories using filters.
   */
  public async query(filter: MemoryQueryFilter = {}): Promise<MemoryRecord[]> {
    const userId = filter.userId || 'default_user';
    this.checkPermission(userId, PermissionLevel.READ, 'read');

    let results = Array.from(this.memories.values());

    if (filter.userId) {
      results = results.filter((m) => m.userId === filter.userId);
    }
    if (filter.type) {
      results = results.filter((m) => m.type === filter.type);
    }
    if (filter.keyPrefix) {
      const prefix = filter.keyPrefix.toLowerCase();
      results = results.filter((m) => m.key.toLowerCase().startsWith(prefix));
    }
    if (filter.tags && filter.tags.length > 0) {
      results = results.filter((m) => filter.tags!.some((t) => m.tags.includes(t)));
    }

    // Sort newest updated first
    results.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    if (filter.limit && filter.limit > 0) {
      results = results.slice(0, filter.limit);
    }

    return results.map((r) => JSON.parse(JSON.stringify(r)));
  }

  /**
   * Search relevant memories against a natural query.
   */
  public async searchRelevant(query: string, options: SearchRelevantOptions): Promise<MemoryRelevanceResult[]> {
    this.checkPermission(options.userId, PermissionLevel.READ, 'read');

    const candidates = Array.from(this.memories.values()).filter((m) => m.userId === options.userId);
    const minScore = options.minScore ?? 0.5;
    const limit = options.limit ?? 5;

    const scored = candidates
      .map((m) => scoreMemoryRelevance(query, m))
      .filter((s) => {
        if (s.score < minScore) return false;
        if (options.types && !options.types.includes(s.record.type)) return false;
        if (options.tags && !options.tags.some((t) => s.record.tags.includes(t))) return false;
        return true;
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return scored;
  }

  /**
   * Generates formatted prompt context containing only relevant memories.
   */
  public async getPromptMemoryContext(query: string, userId = 'default_user', limit = 5): Promise<string> {
    try {
      const relevant = await this.searchRelevant(query, { userId, limit });
      return formatMemoriesForPrompt(relevant);
    } catch (err) {
      if (err instanceof PermissionDeniedError) {
        return `[CONVERSATION MEMORY: Memory access restricted for user ${userId}.]`;
      }
      throw err;
    }
  }

  /**
   * Update an existing memory record.
   */
  public async update(id: string, updates: Partial<MemoryRecord>, userId = 'default_user'): Promise<MemoryRecord | null> {
    this.checkPermission(userId, PermissionLevel.WRITE, 'write');

    const existing = this.memories.get(id);
    if (!existing) return null;

    const updated: MemoryRecord = {
      ...existing,
      ...updates,
      id: existing.id,
      userId: existing.userId,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    };

    this.memories.set(id, updated);
    return JSON.parse(JSON.stringify(updated));
  }

  /**
   * Delete a memory record.
   */
  public async delete(id: string, userId = 'default_user'): Promise<boolean> {
    this.checkPermission(userId, PermissionLevel.WRITE, 'delete');

    const deleted = this.memories.delete(id);
    if (deleted && this.auditLogger) {
      await this.auditLogger.log({
        user: userId,
        requestId: `req_mem_del_${Date.now()}`,
        resource: ResourceType.DATABASES,
        action: 'delete',
        permissionRequired: PermissionLevel.WRITE,
        permissionGranted: PermissionLevel.WRITE,
        decision: SecurityDecisionType.ALLOW,
        reason: `Deleted memory record ${id}`,
        result: 'SUCCESS',
        durationMs: 1,
      });
    }
    return deleted;
  }

  /**
   * Correct an existing memory when the user points out a mistake or update.
   * Maintains full audit trail of the correction.
   */
  public async correct(options: CorrectMemoryOptions): Promise<{ record: MemoryRecord; correction: MemoryCorrection }> {
    this.checkPermission(options.userId, PermissionLevel.WRITE, 'write');

    // Find by ID or Key
    let target = this.memories.get(options.memoryIdOrKey);
    if (!target) {
      target = Array.from(this.memories.values()).find(
        (m) => m.userId === options.userId && m.key.toLowerCase() === options.memoryIdOrKey.toLowerCase()
      );
    }

    if (!target) {
      throw new NotFoundError(`No memory record found matching '${options.memoryIdOrKey}' to correct.`);
    }

    const previousValue = target.value;
    const now = new Date().toISOString();

    const correction: MemoryCorrection = {
      id: `corr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      memoryId: target.id,
      previousValue,
      newValue: options.newValue,
      reason: options.reason,
      timestamp: now,
      correctedBy: options.userId,
    };

    this.corrections.push(correction);

    // Update the memory with high confidence (user explicit correction)
    const updatedRecord: MemoryRecord = {
      ...target,
      value: options.newValue,
      confidence: 1.0,
      tags: Array.from(new Set([...target.tags, 'corrected'])),
      updatedAt: now,
      metadata: {
        ...target.metadata,
        lastCorrectionId: correction.id,
        correctionCount: ((target.metadata?.correctionCount as number) || 0) + 1,
      },
    };

    this.memories.set(target.id, updatedRecord);

    if (this.auditLogger) {
      await this.auditLogger.log({
        user: options.userId,
        requestId: `req_corr_${Date.now()}`,
        resource: ResourceType.DATABASES,
        action: 'modify',
        permissionRequired: PermissionLevel.WRITE,
        permissionGranted: PermissionLevel.WRITE,
        decision: SecurityDecisionType.ALLOW,
        reason: `User corrected memory '${target.key}': ${options.reason}`,
        result: 'SUCCESS',
        durationMs: 1,
      });
    }

    logger.info(`Memory corrected [${target.id}] '${target.key}' by ${options.userId}. Reason: ${options.reason}`);

    return {
      record: JSON.parse(JSON.stringify(updatedRecord)),
      correction,
    };
  }

  /**
   * Retrieve correction history.
   */
  public async getCorrections(memoryId?: string, userId?: string): Promise<MemoryCorrection[]> {
    let results = [...this.corrections];
    if (memoryId) {
      results = results.filter((c) => c.memoryId === memoryId);
    }
    if (userId) {
      results = results.filter((c) => c.correctedBy === userId);
    }
    return results;
  }

  /**
   * Helper to store an episodic memory captured from conversation.
   */
  public async recordConversationFact(
    userId: string,
    key: string,
    value: unknown,
    tags: string[] = ['conversation_fact']
  ): Promise<MemoryRecord> {
    return this.store({
      userId,
      key,
      value,
      type: MemoryType.EPISODIC,
      confidence: 0.95,
      tags,
    });
  }

  public getCount(userId?: string): number {
    if (!userId) return this.memories.size;
    return Array.from(this.memories.values()).filter((m) => m.userId === userId).length;
  }
}
