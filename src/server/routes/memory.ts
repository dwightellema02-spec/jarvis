import { Router, Request, Response, NextFunction } from 'express';
import { JarvisCore } from '../../core/jarvis-core.js';
import { MemoryType } from '../../memory/memory.interface.js';
import { ValidationError } from '../../utils/errors.js';

export function createMemoryRouter(jarvis: JarvisCore): Router {
  const router = Router();
  const memoryManager = jarvis.getMemoryManager();

  // GET /api/jarvis/memory - Query memories
  router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req.query.userId as string) || 'default_user';
      const type = req.query.type as MemoryType | undefined;
      const keyPrefix = req.query.keyPrefix as string | undefined;
      const tags = req.query.tags ? (req.query.tags as string).split(',') : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;

      const memories = await memoryManager.query({
        userId,
        type,
        keyPrefix,
        tags,
        limit,
      });

      res.json({
        status: 'success',
        count: memories.length,
        memories,
      });
    } catch (err) {
      next(err);
    }
  });

  // POST /api/jarvis/memory - Store a memory
  router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { key, value, type, userId, confidence, tags, expiresAt, metadata } = req.body;
      if (!key) {
        throw new ValidationError('Memory key is required');
      }

      const memory = await memoryManager.store({
        key,
        value,
        type: type || MemoryType.EPISODIC,
        userId: userId || 'default_user',
        confidence,
        tags,
        expiresAt,
        metadata,
      });

      res.status(201).json({
        status: 'success',
        memory,
      });
    } catch (err) {
      next(err);
    }
  });

  // GET /api/jarvis/memory/relevant - Search relevant memories
  router.get('/relevant', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = (req.query.q as string) || '';
      const userId = (req.query.userId as string) || 'default_user';
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 5;

      const results = await memoryManager.searchRelevant(query, {
        userId,
        limit,
      });

      const promptContext = await memoryManager.getPromptMemoryContext(query, userId, limit);

      res.json({
        status: 'success',
        query,
        count: results.length,
        results,
        promptContext,
      });
    } catch (err) {
      next(err);
    }
  });

  // GET /api/jarvis/memory/corrections - List corrections audit trail
  router.get('/corrections', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const memoryId = req.query.memoryId as string | undefined;
      const userId = req.query.userId as string | undefined;

      const corrections = await memoryManager.getCorrections(memoryId, userId);
      res.json({
        status: 'success',
        count: corrections.length,
        corrections,
      });
    } catch (err) {
      next(err);
    }
  });

  // POST /api/jarvis/memory/correct - Correct a memory
  router.post('/correct', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { memoryIdOrKey, newValue, reason, userId } = req.body;
      if (!memoryIdOrKey || !reason) {
        throw new ValidationError('memoryIdOrKey and reason are required for memory correction');
      }

      const result = await memoryManager.correct({
        memoryIdOrKey,
        newValue,
        reason,
        userId: userId || 'default_user',
      });

      res.json({
        status: 'success',
        message: 'Memory corrected successfully',
        record: result.record,
        correction: result.correction,
      });
    } catch (err) {
      next(err);
    }
  });

  // GET /api/jarvis/memory/:id - Retrieve specific memory
  router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req.query.userId as string) || 'default_user';
      const memory = await memoryManager.retrieve(req.params.id, userId);

      if (!memory) {
        res.status(404).json({ error: 'Memory not found' });
        return;
      }

      res.json({
        status: 'success',
        memory,
      });
    } catch (err) {
      next(err);
    }
  });

  // PUT /api/jarvis/memory/:id - Update specific memory
  router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.body.userId || 'default_user';
      const updated = await memoryManager.update(req.params.id, req.body, userId);

      if (!updated) {
        res.status(404).json({ error: 'Memory not found' });
        return;
      }

      res.json({
        status: 'success',
        memory: updated,
      });
    } catch (err) {
      next(err);
    }
  });

  // DELETE /api/jarvis/memory/:id - Delete memory
  router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req.query.userId as string) || req.body.userId || 'default_user';
      const deleted = await memoryManager.delete(req.params.id, userId);

      res.json({
        status: 'success',
        deleted,
      });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
