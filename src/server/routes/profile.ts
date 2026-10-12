import { Router, Request, Response, NextFunction } from 'express';
import { JarvisCore } from '../../core/jarvis-core.js';
import { ValidationError } from '../../utils/errors.js';

export function createProfileRouter(jarvis: JarvisCore): Router {
  const router = Router();
  const profileManager = jarvis.getUserProfileManager();

  // GET /api/jarvis/profile - Retrieve user profile
  router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req.query.userId as string) || 'default_user';
      const profile = await profileManager.getProfile(userId);
      res.json({
        status: 'success',
        profile,
      });
    } catch (err) {
      next(err);
    }
  });

  // PUT /api/jarvis/profile - Update user profile identity or top-level fields
  router.put('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.body.userId || 'default_user';
      const { identity, communication, learning, permissionPreferences, settings } = req.body;

      let updated = await profileManager.getProfile(userId);

      if (identity) {
        updated = await profileManager.updateIdentity(userId, identity);
      }
      if (communication) {
        updated = await profileManager.updateCommunication(userId, communication);
      }
      if (learning) {
        updated = await profileManager.updateLearning(userId, learning);
      }
      if (permissionPreferences) {
        updated = await profileManager.updatePermissionPreferences(userId, permissionPreferences);
      }
      if (settings) {
        updated = await profileManager.updateSettings(userId, settings);
      }

      res.json({
        status: 'success',
        message: 'Profile updated successfully',
        profile: updated,
      });
    } catch (err) {
      next(err);
    }
  });

  // POST /api/jarvis/profile/goals - Add a goal
  router.post('/goals', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.body.userId || 'default_user';
      const { title, description, category, priority, status, targetDate, milestones } = req.body;

      if (!title) {
        throw new ValidationError('Goal title is required');
      }

      const goal = await profileManager.addGoal(userId, {
        title,
        description: description || '',
        category: category || 'personal',
        priority: priority || 'medium',
        status: status || 'in_progress',
        targetDate,
        milestones: milestones || [],
      });

      res.status(201).json({
        status: 'success',
        goal,
      });
    } catch (err) {
      next(err);
    }
  });

  // PUT /api/jarvis/profile/goals/:id - Update a goal
  router.put('/goals/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.body.userId || 'default_user';
      const goalId = req.params.id;
      const updated = await profileManager.updateGoal(userId, goalId, req.body);

      res.json({
        status: 'success',
        goal: updated,
      });
    } catch (err) {
      next(err);
    }
  });

  // DELETE /api/jarvis/profile/goals/:id - Delete a goal
  router.delete('/goals/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req.query.userId as string) || req.body.userId || 'default_user';
      const goalId = req.params.id;
      const deleted = await profileManager.deleteGoal(userId, goalId);

      res.json({
        status: 'success',
        deleted,
      });
    } catch (err) {
      next(err);
    }
  });

  // POST /api/jarvis/profile/projects - Add a project
  router.post('/projects', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.body.userId || 'default_user';
      const { name, description, role, tags, workspacePath, status, associatedGoals } = req.body;

      if (!name) {
        throw new ValidationError('Project name is required');
      }

      const project = await profileManager.addProject(userId, {
        name,
        description: description || '',
        role: role || 'Lead',
        tags: tags || [],
        workspacePath,
        status: status || 'active',
        associatedGoals: associatedGoals || [],
      });

      res.status(201).json({
        status: 'success',
        project,
      });
    } catch (err) {
      next(err);
    }
  });

  // PUT /api/jarvis/profile/projects/:id - Update a project
  router.put('/projects/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.body.userId || 'default_user';
      const projectId = req.params.id;
      const updated = await profileManager.updateProject(userId, projectId, req.body);

      res.json({
        status: 'success',
        project: updated,
      });
    } catch (err) {
      next(err);
    }
  });

  // DELETE /api/jarvis/profile/projects/:id - Delete a project
  router.delete('/projects/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req.query.userId as string) || req.body.userId || 'default_user';
      const projectId = req.params.id;
      const deleted = await profileManager.deleteProject(userId, projectId);

      res.json({
        status: 'success',
        deleted,
      });
    } catch (err) {
      next(err);
    }
  });

  // POST /api/jarvis/profile/study-areas - Add a study area
  router.post('/study-areas', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.body.userId || 'default_user';
      const { domain, title, currentTopic, focusAreas, masteryLevel, notes, targetExamOrGoal } = req.body;

      if (!title) {
        throw new ValidationError('Study area title is required');
      }

      const studyArea = await profileManager.addStudyArea(userId, {
        domain: domain || 'general',
        title,
        currentTopic: currentTopic || '',
        focusAreas: focusAreas || [],
        masteryLevel: masteryLevel || 'intermediate',
        notes: notes || '',
        targetExamOrGoal,
      });

      res.status(201).json({
        status: 'success',
        studyArea,
      });
    } catch (err) {
      next(err);
    }
  });

  // PUT /api/jarvis/profile/study-areas/:id - Update a study area
  router.put('/study-areas/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.body.userId || 'default_user';
      const studyAreaId = req.params.id;
      const updated = await profileManager.updateStudyArea(userId, studyAreaId, req.body);

      res.json({
        status: 'success',
        studyArea: updated,
      });
    } catch (err) {
      next(err);
    }
  });

  // DELETE /api/jarvis/profile/study-areas/:id - Delete a study area
  router.delete('/study-areas/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req.query.userId as string) || req.body.userId || 'default_user';
      const studyAreaId = req.params.id;
      const deleted = await profileManager.deleteStudyArea(userId, studyAreaId);

      res.json({
        status: 'success',
        deleted,
      });
    } catch (err) {
      next(err);
    }
  });

  // GET /api/jarvis/profile/context - Prompt injection context and distinction breakdown
  router.get('/context', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req.query.userId as string) || 'default_user';
      const sessionId = (req.query.sessionId as string) || 'ephemeral_session';
      const promptContext = await profileManager.getPromptContext(userId);
      const distinction = await profileManager.getContextDistinction(userId, {
        sessionId,
        messageCount: parseInt((req.query.messageCount as string) || '0', 10),
        ephemeralTopics: req.query.topic ? [req.query.topic as string] : [],
      });

      res.json({
        status: 'success',
        promptContext,
        distinction,
      });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
