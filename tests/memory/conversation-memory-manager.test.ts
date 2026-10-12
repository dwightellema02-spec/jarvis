import { describe, it, expect, beforeEach } from 'vitest';
import { ConversationMemoryManager } from '../../src/memory/conversation-memory-manager.js';
import { MemoryType } from '../../src/memory/memory.interface.js';
import { PermissionManager } from '../../src/security/permission-manager.js';
import { AuditLogger } from '../../src/audit/audit-logger.js';
import { ResourceType, PermissionLevel } from '../../src/security/types.js';
import { ValidationError, NotFoundError, PermissionDeniedError } from '../../src/utils/errors.js';

describe('Phase 4 Conversation Memory Tests', () => {
  let memoryManager: ConversationMemoryManager;
  let permissionManager: PermissionManager;
  let auditLogger: AuditLogger;

  beforeEach(() => {
    permissionManager = new PermissionManager();
    auditLogger = new AuditLogger();

    // Grant default user read & write permissions on DATABASES
    permissionManager.grantPermission({
      userId: 'default_user',
      resource: ResourceType.DATABASES,
      level: PermissionLevel.WRITE,
      allowedActions: ['read', 'write', 'modify', 'delete'],
      grantedBy: 'system',
    });

    memoryManager = new ConversationMemoryManager({
      permissionManager,
      auditLogger,
    });
  });

  it('stores and retrieves episodic conversational memories', async () => {
    const mem = await memoryManager.store({
      userId: 'default_user',
      key: 'Dwight Favorite Framework',
      value: 'TypeScript with Node.js and Express',
      type: MemoryType.PREFERENCE,
      confidence: 0.95,
      tags: ['developer', 'preferences', 'typescript'],
    });

    expect(mem.id).toMatch(/^mem_/);
    expect(mem.key).toBe('Dwight Favorite Framework');

    const retrieved = await memoryManager.retrieve(mem.id, 'default_user');
    expect(retrieved).toBeDefined();
    expect(retrieved?.value).toBe('TypeScript with Node.js and Express');
  });

  it('updates existing memory when stored with the same key', async () => {
    await memoryManager.store({
      userId: 'default_user',
      key: 'Project Focus',
      value: 'Initial planning for Tuklas',
      tags: ['tuklas'],
    });

    const updated = await memoryManager.store({
      userId: 'default_user',
      key: 'Project Focus',
      value: 'Building Tuklas math modules and assessment engines',
      tags: ['tuklas', 'modules'],
    });

    expect(updated.value).toBe('Building Tuklas math modules and assessment engines');
    expect(updated.tags).toContain('modules');

    const all = await memoryManager.query({ userId: 'default_user', keyPrefix: 'Project Focus' });
    expect(all.length).toBe(1);
  });

  it('retrieves relevant memories matching natural query terms and tags', async () => {
    await memoryManager.store({
      userId: 'default_user',
      key: 'Tuklas Mathematics Platform',
      value: 'Tuklas focuses on interactive math instruction for Philippine students.',
      tags: ['tuklas', 'math', 'education'],
    });

    await memoryManager.store({
      userId: 'default_user',
      key: 'LET Licensure Exam',
      value: 'Preparing for Professional Education and Mathematics specialization.',
      tags: ['let', 'exam', 'teacher'],
    });

    await memoryManager.store({
      userId: 'default_user',
      key: 'Cooking Recipe',
      value: 'Favorite recipe for chicken adobo.',
      tags: ['personal', 'food'],
    });

    // Query relevant to Tuklas education
    const relevant = await memoryManager.searchRelevant('Tell me about the math education project Tuklas', {
      userId: 'default_user',
    });

    expect(relevant.length).toBeGreaterThanOrEqual(1);
    expect(relevant[0].record.key).toBe('Tuklas Mathematics Platform');
    expect(relevant[0].score).toBeGreaterThan(1.0);

    // Format prompt block
    const promptBlock = await memoryManager.getPromptMemoryContext('Tuklas math education', 'default_user');
    expect(promptBlock).toContain('[RELEVANT CONVERSATION MEMORIES RETRIEVED FROM PREVIOUS INTERACTIONS]');
    expect(promptBlock).toContain('Tuklas Mathematics Platform');
  });

  it('explicitly returns honesty directive when no matching memories exist', async () => {
    const promptBlock = await memoryManager.getPromptMemoryContext('What did we discuss about space travel?', 'default_user');
    expect(promptBlock).toContain('No relevant past memories found');
    expect(promptBlock).toContain('Do not invent past memories');
  });

  it('corrects a memory, updating value to 100% confidence and logging audit trail', async () => {
    const initial = await memoryManager.store({
      userId: 'default_user',
      key: 'LET Exam Target Date',
      value: 'September 2026',
      confidence: 0.8,
      tags: ['let', 'exam'],
    });

    // User corrects date
    const correctionResult = await memoryManager.correct({
      userId: 'default_user',
      memoryIdOrKey: initial.id,
      newValue: 'October 31, 2026',
      reason: 'Official Board of Professional Teachers schedule announced',
    });

    expect(correctionResult.record.value).toBe('October 31, 2026');
    expect(correctionResult.record.confidence).toBe(1.0);
    expect(correctionResult.record.tags).toContain('corrected');

    expect(correctionResult.correction.previousValue).toBe('September 2026');
    expect(correctionResult.correction.newValue).toBe('October 31, 2026');
    expect(correctionResult.correction.reason).toBe('Official Board of Professional Teachers schedule announced');

    // Verify audit logger recorded the correction
    const auditLogs = await auditLogger.query({ user: 'default_user' });
    const corrLog = auditLogs.find((l) => l.reason.includes('corrected memory'));
    expect(corrLog).toBeDefined();
    expect(corrLog?.action).toBe('modify');
  });

  it('deletes memory and records audit trail', async () => {
    const mem = await memoryManager.store({
      userId: 'default_user',
      key: 'Temporary scratchpad',
      value: 'x = 42',
    });

    const deleted = await memoryManager.delete(mem.id, 'default_user');
    expect(deleted).toBe(true);

    const check = await memoryManager.retrieve(mem.id, 'default_user');
    expect(check).toBeNull();

    const auditLogs = await auditLogger.query({ user: 'default_user' });
    const delLog = auditLogs.find((l) => l.action === 'delete');
    expect(delLog).toBeDefined();
  });

  it('enforces permission controls and denies unauthorized users (default-deny)', async () => {
    // unauthorized_user has no permission grant
    await expect(
      memoryManager.retrieve('mem_123', 'unauthorized_user')
    ).rejects.toThrow(PermissionDeniedError);

    await expect(
      memoryManager.store({
        userId: 'unauthorized_user',
        key: 'Secret note',
        value: 'unauthorized write',
      })
    ).rejects.toThrow(PermissionDeniedError);
  });

  it('validates memory store arguments', async () => {
    await expect(
      memoryManager.store({
        userId: 'default_user',
        key: '',
        value: 'Missing key',
      })
    ).rejects.toThrow(ValidationError);
  });
});
