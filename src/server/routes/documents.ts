import { Router, Request, Response } from 'express';
import { JarvisCore } from '../../core/jarvis-core.js';
import { logger } from '../../utils/logger.js';

export function createDocumentRouter(jarvisCore: JarvisCore): Router {
  const router = Router();
  const documentManager = jarvisCore.getDocumentIntelligence();
  const secondBrain = jarvisCore.getSecondBrain();

  // 1. List documents
  router.get('/documents', (_req: Request, res: Response) => {
    try {
      const docs = documentManager.listDocuments();
      res.json({
        success: true,
        count: docs.length,
        documents: docs,
      });
    } catch (err) {
      logger.error('Failed to list documents', { error: String(err) });
      res.status(500).json({ success: false, error: err instanceof Error ? err.message : String(err) });
    }
  });

  // 2. Ingest / Parse document
  router.post('/documents/ingest', async (req: Request, res: Response) => {
    try {
      const { content, filename, mimeType, title, author, tags, isPaper } = req.body;
      const userId = (req.headers['x-user-id'] as string) || req.body.userId || 'default_user';

      if (!content || !filename) {
        res.status(400).json({
          success: false,
          error: 'Missing required parameters: content and filename are required',
        });
        return;
      }

      const parsed = await documentManager.parseAndIngest(content, filename, {
        userId,
        mimeType,
        title,
        author,
        tags,
        isPaper,
      });

      res.status(201).json({
        success: true,
        document: parsed,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const statusCode = msg.includes('Permission Denied')
        ? 403
        : msg.includes('Security Violation') || msg.includes('Security Guardian Blocked')
        ? 403
        : 400;

      logger.warn('Document ingest error', { error: msg });
      res.status(statusCode).json({ success: false, error: msg });
    }
  });

  // 3. Get single document
  router.get('/documents/:id', (req: Request, res: Response) => {
    try {
      const doc = documentManager.getDocument(req.params.id);
      if (!doc) {
        res.status(404).json({ success: false, error: `Document ${req.params.id} not found` });
        return;
      }
      res.json({ success: true, document: doc });
    } catch (err) {
      res.status(500).json({ success: false, error: err instanceof Error ? err.message : String(err) });
    }
  });

  // 4. Delete document
  router.delete('/documents/:id', (req: Request, res: Response) => {
    try {
      const userId = (req.headers['x-user-id'] as string) || 'default_user';
      const deleted = documentManager.deleteDocument(req.params.id, userId);
      if (!deleted) {
        res.status(404).json({ success: false, error: `Document ${req.params.id} not found` });
        return;
      }
      res.json({ success: true, message: `Document ${req.params.id} deleted` });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const statusCode = msg.includes('Permission Denied') ? 403 : 500;
      res.status(statusCode).json({ success: false, error: msg });
    }
  });

  // 5. Search document passages
  router.get('/documents/:id/search', (req: Request, res: Response) => {
    try {
      const query = (req.query.q as string) || '';
      if (!query.trim()) {
        res.status(400).json({ success: false, error: 'Query parameter q is required' });
        return;
      }

      const results = documentManager.searchDocument(req.params.id, query);
      res.json({ success: true, count: results.length, results });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      res.status(msg.includes('not found') ? 404 : 500).json({ success: false, error: msg });
    }
  });

  // 6. Summarize document
  router.post('/documents/:id/summarize', (_req: Request, res: Response) => {
    try {
      const summary = documentManager.summarizeDocument(_req.params.id);
      res.json({ success: true, summary });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      res.status(msg.includes('not found') ? 404 : 500).json({ success: false, error: msg });
    }
  });

  // 7. Document Question & Answer
  router.post('/documents/:id/qa', (req: Request, res: Response) => {
    try {
      const { question } = req.body;
      if (!question || !question.trim()) {
        res.status(400).json({ success: false, error: 'Question parameter is required' });
        return;
      }

      const qa = documentManager.answerQuestion(req.params.id, question);
      res.json({ success: true, qa });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      res.status(msg.includes('not found') ? 404 : 500).json({ success: false, error: msg });
    }
  });

  // 8. Compare documents
  router.post('/documents/compare', (req: Request, res: Response) => {
    try {
      const { docIdA, docIdB } = req.body;
      if (!docIdA || !docIdB) {
        res.status(400).json({ success: false, error: 'docIdA and docIdB parameters are required' });
        return;
      }

      const comparison = documentManager.compareDocuments(docIdA, docIdB);
      res.json({ success: true, comparison });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      res.status(msg.includes('not found') ? 404 : 400).json({ success: false, error: msg });
    }
  });

  // 9. Analyze table
  router.post('/documents/:id/analyze-table', (req: Request, res: Response) => {
    try {
      const { tableIndex, query } = req.body;
      const result = documentManager.analyzeTable(req.params.id, tableIndex ?? 0, query);
      res.json({ success: true, analysis: result });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      res.status(msg.includes('not found') ? 404 : 400).json({ success: false, error: msg });
    }
  });

  // 10. Convert Document to Second Brain Knowledge
  router.post('/documents/:id/to-knowledge', async (req: Request, res: Response) => {
    try {
      const userId = (req.headers['x-user-id'] as string) || req.body.userId || 'default_user';
      const { projectId, domain, category } = req.body;

      const result = await documentManager.buildKnowledgeFromDocument(
        req.params.id,
        secondBrain,
        domain || 'knowledge',
        category || 'document',
        projectId,
        userId
      );

      res.status(201).json({ success: true, result });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const statusCode = msg.includes('Permission Denied') ? 403 : msg.includes('not found') ? 404 : 400;
      res.status(statusCode).json({ success: false, error: msg });
    }
  });

  return router;
}
