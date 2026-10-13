import { Router, Request, Response } from 'express';
import { GoalsManager } from '../../goals/goals-manager.js';

export function createGoalsRouter(goalsManager: GoalsManager): Router {
  const router = Router();

  const getUser = (req: Request): string => {
    return (req.headers['x-user-id'] as string) || 'dwight';
  };

  // GET /api/jarvis/goals - List all goals
  router.get('/', (req: Request, res: Response) => {
    try {
      const user = getUser(req);
      const goals = goalsManager.listGoals(user);
      return res.json({ success: true, count: goals.length, data: goals });
    } catch (err: any) {
      return res.status(403).json({ success: false, error: err.message });
    }
  });

  // GET /api/jarvis/goals/analytics - Get goals analytics & velocity metrics
  router.get('/analytics', (req: Request, res: Response) => {
    try {
      const user = getUser(req);
      const analytics = goalsManager.getAnalytics(user);
      return res.json({ success: true, data: analytics });
    } catch (err: any) {
      return res.status(403).json({ success: false, error: err.message });
    }
  });

  // POST /api/jarvis/goals - Create new SMART goal
  router.post('/', (req: Request, res: Response) => {
    try {
      const user = getUser(req);
      const { title, description, category, priority, targetDate, smart, milestones, linkedProjectIds } = req.body;
      if (!title || !description || !targetDate) {
        return res.status(400).json({ success: false, error: 'title, description, and targetDate are required' });
      }
      const goal = goalsManager.createGoal(
        {
          title,
          description,
          category: category || 'personal',
          priority: priority || 'medium',
          targetDate,
          smart,
          milestones,
          linkedProjectIds,
        },
        user
      );
      return res.status(201).json({ success: true, data: goal });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  });

  // POST /api/jarvis/goals/decompose - Decompose an idea into a SMART goal and task DAG
  router.post('/decompose', (req: Request, res: Response) => {
    try {
      const user = getUser(req);
      const { idea, category, autoCreate } = req.body;
      if (!idea) {
        return res.status(400).json({ success: false, error: 'idea parameter is required' });
      }
      const result = goalsManager.decomposeIdea(idea, category || 'education', autoCreate ?? false, user);
      return res.json({ success: true, data: result });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  });

  // GET /api/jarvis/goals/tasks/all - List planning tasks
  router.get('/tasks/all', (req: Request, res: Response) => {
    try {
      const user = getUser(req);
      const { status, quadrant, goalId, projectId } = req.query;
      const tasks = goalsManager.listTasks(
        {
          status: status as any,
          quadrant: quadrant as any,
          goalId: goalId as string,
          projectId: projectId as string,
        },
        user
      );
      return res.json({ success: true, count: tasks.length, data: tasks });
    } catch (err: any) {
      return res.status(403).json({ success: false, error: err.message });
    }
  });

  // POST /api/jarvis/goals/tasks - Create task
  router.post('/tasks', (req: Request, res: Response) => {
    try {
      const user = getUser(req);
      const { title, description, priority, isUrgent, isImportant, estimatedMinutes, assignedTo, goalId, projectId, dependencies, dueDate } = req.body;
      if (!title) {
        return res.status(400).json({ success: false, error: 'title is required' });
      }
      const task = goalsManager.createTask(
        {
          title,
          description,
          priority,
          isUrgent: isUrgent ?? false,
          isImportant: isImportant ?? true,
          estimatedMinutes,
          assignedTo,
          goalId,
          projectId,
          dependencies,
          dueDate,
        },
        user
      );
      return res.status(201).json({ success: true, data: task });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  });

  // PUT /api/jarvis/goals/tasks/:id - Update task
  router.put('/tasks/:id', (req: Request, res: Response) => {
    try {
      const user = getUser(req);
      const updated = goalsManager.updateTask(req.params.id, req.body, user);
      return res.json({ success: true, data: updated });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  });

  // GET /api/jarvis/goals/eisenhower - Eisenhower Matrix
  router.get('/eisenhower', (req: Request, res: Response) => {
    try {
      const user = getUser(req);
      const matrix = goalsManager.getEisenhowerMatrix(user);
      return res.json({ success: true, data: matrix });
    } catch (err: any) {
      return res.status(403).json({ success: false, error: err.message });
    }
  });

  // GET /api/jarvis/goals/projects/all - List projects
  router.get('/projects/all', (req: Request, res: Response) => {
    try {
      const user = getUser(req);
      const projects = goalsManager.listProjects(user);
      return res.json({ success: true, count: projects.length, data: projects });
    } catch (err: any) {
      return res.status(403).json({ success: false, error: err.message });
    }
  });

  // POST /api/jarvis/goals/projects - Create project
  router.post('/projects', (req: Request, res: Response) => {
    try {
      const user = getUser(req);
      const { name, description, rootPath, tags, leadAgentId } = req.body;
      if (!name) {
        return res.status(400).json({ success: false, error: 'name is required' });
      }
      const project = goalsManager.createProject(
        {
          name,
          description: description || '',
          rootPath,
          tags,
          leadAgentId,
        },
        user
      );
      return res.status(201).json({ success: true, data: project });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  });

  // GET /api/jarvis/goals/schedule - List calendar timeblocks
  router.get('/schedule', (req: Request, res: Response) => {
    try {
      const { date } = req.query;
      const blocks = goalsManager.getScheduler().listBlocks(date as string);
      return res.json({ success: true, count: blocks.length, data: blocks });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  });

  // POST /api/jarvis/goals/schedule/block - Add timeblock
  router.post('/schedule/block', (req: Request, res: Response) => {
    try {
      const { title, type, date, startTime, endTime, taskId, goalId } = req.body;
      if (!title || !date || !startTime || !endTime) {
        return res.status(400).json({ success: false, error: 'title, date, startTime, and endTime are required' });
      }
      const result = goalsManager.getScheduler().addBlock(title, type || 'deep_work', date, startTime, endTime, taskId, goalId);
      return res.status(201).json({ success: true, data: result.block, conflicts: result.conflicts });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  });

  // POST /api/jarvis/goals/schedule/block/:id/complete - Mark timeblock complete
  router.post('/schedule/block/:id/complete', (req: Request, res: Response) => {
    try {
      const completed = req.body.completed ?? true;
      const block = goalsManager.getScheduler().markCompleted(req.params.id, completed);
      return res.json({ success: true, data: block });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  });

  // GET /api/jarvis/goals/schedule/suggest - Suggest focus window
  router.get('/schedule/suggest', (req: Request, res: Response) => {
    try {
      const date = (req.query.date as string) || new Date().toISOString().split('T')[0];
      const duration = Number(req.query.duration) || 90;
      const suggestion = goalsManager.getScheduler().suggestFocusSlot(date, duration);
      return res.json({ success: true, data: suggestion });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  });

  // GET /api/jarvis/goals/study/plans - List study plans
  router.get('/study/plans', (_req: Request, res: Response) => {
    try {
      const plans = goalsManager.getStudyPlanner().listPlans();
      return res.json({ success: true, count: plans.length, data: plans });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  });

  // GET /api/jarvis/goals/study/queue - Get due review queue
  router.get('/study/queue', (req: Request, res: Response) => {
    try {
      const planId = req.query.planId as string;
      const queue = goalsManager.getStudyPlanner().getDueReviewQueue(planId);
      return res.json({ success: true, count: queue.length, data: queue });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  });

  // POST /api/jarvis/goals/study/plans - Create study plan
  router.post('/study/plans', (req: Request, res: Response) => {
    try {
      const { title, targetExamOrGoal, topics, dailyHoursTarget } = req.body;
      if (!title || !targetExamOrGoal || !topics) {
        return res.status(400).json({ success: false, error: 'title, targetExamOrGoal, and topics are required' });
      }
      const plan = goalsManager.getStudyPlanner().createPlan(title, targetExamOrGoal, topics, dailyHoursTarget || 2);
      return res.status(201).json({ success: true, data: plan });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  });

  // POST /api/jarvis/goals/study/review - Record study session
  router.post('/study/review', (req: Request, res: Response) => {
    try {
      const { planId, topicId, minutesSpent, scoreOrSelfRating } = req.body;
      if (!planId || !topicId || minutesSpent === undefined || scoreOrSelfRating === undefined) {
        return res.status(400).json({ success: false, error: 'planId, topicId, minutesSpent, and scoreOrSelfRating are required' });
      }
      const result = goalsManager.getStudyPlanner().recordStudySession(planId, topicId, Number(minutesSpent), Number(scoreOrSelfRating));
      return res.json({ success: true, data: result });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  });

  // GET /api/jarvis/goals/:id - Get goal by id
  router.get('/:id', (req: Request, res: Response) => {
    try {
      const user = getUser(req);
      const goal = goalsManager.getGoal(req.params.id, user);
      if (!goal) {
        return res.status(404).json({ success: false, error: `Goal ${req.params.id} not found` });
      }
      return res.json({ success: true, data: goal });
    } catch (err: any) {
      return res.status(403).json({ success: false, error: err.message });
    }
  });

  // PUT /api/jarvis/goals/:id - Update goal
  router.put('/:id', (req: Request, res: Response) => {
    try {
      const user = getUser(req);
      const updated = goalsManager.updateGoal(req.params.id, req.body, user);
      return res.json({ success: true, data: updated });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  });

  // POST /api/jarvis/goals/:id/milestones/:milestoneId/complete - Complete milestone
  router.post('/:id/milestones/:milestoneId/complete', (req: Request, res: Response) => {
    try {
      const user = getUser(req);
      const updated = goalsManager.completeMilestone(req.params.id, req.params.milestoneId, user);
      return res.json({ success: true, data: updated });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  });

  return router;
}
