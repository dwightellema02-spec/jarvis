import { Router, Request, Response, NextFunction } from 'express';
import { JarvisCore } from '../../core/jarvis-core.js';
import { KnowledgeDomain } from '../../memory/knowledge.interface.js';
import { ValidationError } from '../../utils/errors.js';

export function createSecondBrainRouter(jarvis: JarvisCore): Router {
  const router = Router();
  const secondBrain = jarvis.getSecondBrain();

  // GET /api/jarvis/second-brain/tree - Get full knowledge hierarchy tree
  router.get('/tree', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req.query.userId as string) || 'default_user';
      const tree = await secondBrain.getTree(userId);
      res.json({
        status: 'success',
        tree,
      });
    } catch (err) {
      next(err);
    }
  });

  // GET /api/jarvis/second-brain/nodes - List / query knowledge nodes
  router.get('/nodes', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req.query.userId as string) || 'default_user';
      const query = req.query.q as string | undefined;
      const domain = req.query.domain as KnowledgeDomain | undefined;
      const category = req.query.category as string | undefined;

      let nodes;
      if (category && domain) {
        nodes = await secondBrain.getByCategory(domain, category, userId);
      } else if (query) {
        nodes = await secondBrain.search(query, domain, userId);
      } else {
        nodes = await secondBrain.search('', domain, userId);
      }

      res.json({
        status: 'success',
        count: nodes.length,
        nodes,
      });
    } catch (err) {
      next(err);
    }
  });

  // GET /api/jarvis/second-brain/nodes/:id - Get specific node
  router.get('/nodes/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req.query.userId as string) || 'default_user';
      const node = await secondBrain.get(req.params.id, userId);

      if (!node) {
        res.status(404).json({ error: `Knowledge node '${req.params.id}' not found` });
        return;
      }

      // Resolve connected relationship nodes
      const related = [];
      for (const rel of node.relationships) {
        const target = await secondBrain.get(rel.nodeId, userId);
        if (target) {
          related.push({
            relation: rel.relation,
            target,
          });
        }
      }

      res.json({
        status: 'success',
        node,
        related,
      });
    } catch (err) {
      next(err);
    }
  });

  // POST /api/jarvis/second-brain/nodes - Create / index new knowledge node
  router.post('/nodes', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.body.userId || 'default_user';
      const { domain, category, title, content, tags, sourceUri, relationships } = req.body;

      if (!title || !content || !domain) {
        throw new ValidationError('Title, content, and domain are required for knowledge nodes');
      }

      const node = await secondBrain.index(
        {
          domain,
          category: category || 'general',
          title,
          content,
          tags: tags || [],
          sourceUri,
          relationships: relationships || [],
        },
        userId
      );

      res.status(201).json({
        status: 'success',
        node,
      });
    } catch (err) {
      next(err);
    }
  });

  // PUT /api/jarvis/second-brain/nodes/:id - Update node
  router.put('/nodes/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.body.userId || 'default_user';
      const updated = await secondBrain.update(req.params.id, req.body, userId);

      if (!updated) {
        res.status(404).json({ error: `Knowledge node '${req.params.id}' not found` });
        return;
      }

      res.json({
        status: 'success',
        node: updated,
      });
    } catch (err) {
      next(err);
    }
  });

  // DELETE /api/jarvis/second-brain/nodes/:id - Delete node
  router.delete('/nodes/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req.query.userId as string) || req.body.userId || 'default_user';
      const deleted = await secondBrain.delete(req.params.id, userId);

      res.json({
        status: 'success',
        deleted,
      });
    } catch (err) {
      next(err);
    }
  });

  // POST /api/jarvis/second-brain/nodes/:id/relate - Link relationship between nodes
  router.post('/nodes/:id/relate', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.body.userId || 'default_user';
      const fromNodeId = req.params.id;
      const { targetNodeId, relation } = req.body;

      if (!targetNodeId || !relation) {
        throw new ValidationError('targetNodeId and relation are required');
      }

      const connected = await secondBrain.addRelationship(fromNodeId, targetNodeId, relation, userId);
      res.json({
        status: 'success',
        connected,
      });
    } catch (err) {
      next(err);
    }
  });

  // GET /api/jarvis/second-brain/search - Semantic search with score ranking
  router.get('/search', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = (req.query.q as string) || '';
      const domain = req.query.domain as KnowledgeDomain | undefined;
      const category = req.query.category as string | undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 5;
      const userId = (req.query.userId as string) || 'default_user';

      const results = await secondBrain.semanticSearch(
        query,
        {
          domain,
          category,
          limit,
          includeRelated: true,
        },
        userId
      );

      res.json({
        status: 'success',
        query,
        count: results.length,
        results,
      });
    } catch (err) {
      next(err);
    }
  });

  // GET /api/jarvis/second-brain/context - Prompt knowledge context string
  router.get('/context', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = (req.query.q as string) || '';
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 4;
      const userId = (req.query.userId as string) || 'default_user';

      const promptContext = await secondBrain.getPromptKnowledgeContext(query, limit, userId);
      res.json({
        status: 'success',
        query,
        promptContext,
      });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
