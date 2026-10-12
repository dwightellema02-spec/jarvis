/**
 * JARVIS Phase 8 - Research Engine API Routes
 * Exposes endpoints for epistemic classification, academic citations,
 * source comparison, research question development, and Second Brain integration.
 */

import { Router, Request, Response } from 'express';
import { JarvisCore } from '../../core/jarvis-core.js';
import { logger } from '../../utils/logger.js';

export function createResearchRouter(jarvisCore: JarvisCore): Router {
  const router = Router();
  const researchManager = jarvisCore.getResearchManager();

  // 1. List research sources
  router.get('/research/sources', (_req: Request, res: Response) => {
    try {
      const sources = researchManager.listSources();
      res.json({ success: true, count: sources.length, data: sources });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 2. Add new research source
  router.post('/research/sources', (req: Request, res: Response) => {
    try {
      const { title, authors, publishedYear, publisher, url, doi, sourceType, abstract, snippets } = req.body;
      if (!title || !authors) {
        res.status(400).json({ success: false, error: 'Fields "title" and "authors" are required.' });
        return;
      }

      const source = researchManager.addSource({
        title,
        authors: Array.isArray(authors) ? authors : [authors],
        publishedYear,
        publisher,
        url,
        doi,
        sourceType: sourceType || 'unknown',
        credibilityScore: req.body.credibilityScore ?? 0.85,
        abstract,
        snippets: snippets || [],
      });

      res.status(201).json({ success: true, data: source });
    } catch (err: any) {
      logger.warn('Add research source error', { error: err.message });
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // 3. Epistemic classification
  router.post('/research/classify', (req: Request, res: Response) => {
    try {
      const { text } = req.body;
      if (!text || typeof text !== 'string') {
        res.status(400).json({ success: false, error: 'Field "text" is required.' });
        return;
      }

      const analysis = researchManager.classifyText(text);
      res.json({ success: true, data: analysis });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // 4. Generate citations for a source
  router.get('/research/citations/:sourceId', (req: Request, res: Response) => {
    try {
      const sourceId = req.params.sourceId;
      const citations = researchManager.generateCitations(sourceId);
      res.json({ success: true, count: citations.length, data: citations });
    } catch (err: any) {
      res.status(404).json({ success: false, error: err.message });
    }
  });

  // 5. Compare sources
  router.post('/research/compare', (req: Request, res: Response) => {
    try {
      const { sourceIds } = req.body;
      if (!Array.isArray(sourceIds) || sourceIds.length < 2) {
        res.status(400).json({ success: false, error: 'Field "sourceIds" array of at least 2 IDs is required.' });
        return;
      }

      const comparison = researchManager.compareSources(sourceIds);
      res.json({ success: true, data: comparison });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // 6. Formulate research question (PICO / FINER)
  router.post('/research/questions', (req: Request, res: Response) => {
    try {
      const {
        topic,
        framework,
        population,
        intervention,
        comparison,
        outcome,
        independentVariable,
        dependentVariable,
      } = req.body;

      if (!topic) {
        res.status(400).json({ success: false, error: 'Field "topic" is required.' });
        return;
      }

      const question = researchManager.developResearchQuestion({
        topic,
        framework,
        population,
        intervention,
        comparison,
        outcome,
        independentVariable,
        dependentVariable,
      });

      res.json({ success: true, data: question });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // 7. List research notes
  router.get('/research/notes', (_req: Request, res: Response) => {
    try {
      const notes = researchManager.listNotes();
      res.json({ success: true, count: notes.length, data: notes });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 8. Create research note
  router.post('/research/notes', (req: Request, res: Response) => {
    try {
      const { title, topic, rawText, sourceIds, projectId } = req.body;
      const userId = (req.headers['x-user-id'] as string) || req.body.userId || 'default_user';

      if (!title || !topic || !rawText) {
        res.status(400).json({ success: false, error: 'Fields "title", "topic", and "rawText" are required.' });
        return;
      }

      const note = researchManager.createResearchNote({
        title,
        topic,
        rawText,
        sourceIds,
        projectId,
        userId,
      });

      res.status(201).json({ success: true, data: note });
    } catch (err: any) {
      logger.warn('Create research note error', { error: err.message });
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // 9. Ingest research note into Second Brain
  router.post('/research/notes/:id/to-knowledge', async (req: Request, res: Response) => {
    try {
      const noteId = req.params.id;
      const userId = (req.headers['x-user-id'] as string) || req.body.userId || 'default_user';

      const result = await researchManager.ingestNoteToSecondBrain(noteId, userId);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  return router;
}
