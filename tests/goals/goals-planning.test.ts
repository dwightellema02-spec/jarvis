import { describe, it, expect, beforeEach } from 'vitest';
import {
  GoalsManager,
  GoalDecomposer,
  StudyPlanner,
  TimeblockScheduler,
  GoalAgent,
  ProjectAgent,
  CreateGoalTool,
  DecomposeIdeaTool,
  ManageTasksTool,
  TrackProgressTool,
  CreateStudyPlanTool,
  ScheduleTimeblockTool,
  ManageProjectTool,
  EisenhowerMatrixTool,
} from '../../src/goals/index.js';
import { PermissionManager } from '../../src/security/permission-manager.js';
import { SecurityGuardian } from '../../src/security/guardian.js';
import { AuditLogger } from '../../src/audit/audit-logger.js';
import { PermissionLevel, ResourceType } from '../../src/security/types.js';

describe('Phase 22 — Goals, Tasks, Planning & Study Intelligence Tests', () => {
  let permissionManager: PermissionManager;
  let guardian: SecurityGuardian;
  let auditLogger: AuditLogger;
  let goalsManager: GoalsManager;

  beforeEach(() => {
    permissionManager = new PermissionManager();
    guardian = new SecurityGuardian();
    auditLogger = new AuditLogger();

    // Grant dwight admin on PROJECTS
    permissionManager.grantPermission({
      userId: 'dwight',
      resource: ResourceType.PROJECTS,
      level: PermissionLevel.ADMIN,
      allowedActions: ['read', 'write', 'modify', 'delete', 'admin'],
      grantedBy: 'system',
    });

    goalsManager = new GoalsManager({
      permissionManager,
      guardian,
      auditLogger,
    });
  });

  describe('GoalDecomposer', () => {
    const decomposer = new GoalDecomposer();

    it('decomposes freeform idea into SMART goal, milestones, and task DAG', () => {
      const result = decomposer.decompose('Build and launch the Tuklas curriculum engine', 'education');

      expect(result.idea).toBe('Build and launch the Tuklas curriculum engine');
      expect(result.smartGoal.title).toBeDefined();
      expect(result.smartGoal.smart.specific).toContain('Build and launch the Tuklas curriculum engine');
      expect(result.smartGoal.milestones.length).toBeGreaterThanOrEqual(3);
      expect(result.tasks.length).toBeGreaterThanOrEqual(4);
      expect(result.tasks[0].quadrant).toBe('do_first');
      expect(result.actionSteps.length).toBeGreaterThanOrEqual(3);
    });

    it('infers education category and critical priority for LET Exam ideas', () => {
      const result = decomposer.decompose('Review for the PRC LET Licensure Exam in Mathematics');
      expect(result.smartGoal.category).toBe('education');
      expect(result.smartGoal.priority).toBe('critical');
    });

    it('throws error on empty idea', () => {
      expect(() => decomposer.decompose('   ')).toThrow('Idea prompt cannot be empty');
    });
  });

  describe('StudyPlanner & Spaced Repetition Engine', () => {
    let planner: StudyPlanner;

    beforeEach(() => {
      planner = new StudyPlanner();
    });

    it('lists seeded default study plans including PRC LET Mathematics', () => {
      const plans = planner.listPlans();
      expect(plans.length).toBeGreaterThanOrEqual(1);
      const letPlan = plans.find((p) => p.id === 'plan_let_math_2026');
      expect(letPlan).toBeDefined();
      expect(letPlan?.topics.length).toBe(4);
      expect(letPlan?.overallMasteryPct).toBeGreaterThan(70);
    });

    it('creates a custom study plan with mastery calculation', () => {
      const plan = planner.createPlan(
        'Autonomous Systems Architecture Mastery',
        'Senior AI Systems Certification',
        [
          { subject: 'Distributed Systems', topic: 'Raft Consensus & Log Replication', masteryLevel: 80, notes: 'Core Raft protocol' },
          { subject: 'Operating Systems', topic: 'Virtual Memory & Page Replacement', masteryLevel: 60, notes: 'LRU and Clock algorithms' },
        ],
        3
      );

      expect(plan.id).toBeDefined();
      expect(plan.topics.length).toBe(2);
      expect(plan.overallMasteryPct).toBe(70);
      expect(plan.topics[0].repetitionIntervalDays).toBe(1);
    });

    it('retrieves topics due for review today', () => {
      const queue = planner.getDueReviewQueue();
      expect(queue.length).toBeGreaterThanOrEqual(1);
      // Topics in queue should have nextReviewDate <= today
      const today = new Date().toISOString().split('T')[0];
      for (const t of queue) {
        expect(t.nextReviewDate <= today).toBe(true);
      }
    });

    it('advances spaced repetition interval on successful review (score >= 75)', () => {
      const plan = planner.getPlan('plan_let_math_2026')!;
      const topic = plan.topics.find((t) => t.id === 'topic_let_4')!;
      const initialInterval = topic.repetitionIntervalDays; // 1 day

      const result = planner.recordStudySession('plan_let_math_2026', 'topic_let_4', 30, 85);
      expect(result.topic.reviewCount).toBe(3);
      expect(result.topic.repetitionIntervalDays).toBeGreaterThan(initialInterval); // 1 -> 3
      expect(result.topic.masteryLevel).toBeGreaterThanOrEqual(76);
    });

    it('resets spaced repetition interval to 1 day on poor recall (score < 75)', () => {
      const result = planner.recordStudySession('plan_let_math_2026', 'topic_let_1', 30, 50);
      expect(result.topic.repetitionIntervalDays).toBe(1);
    });
  });

  describe('TimeblockScheduler', () => {
    let scheduler: TimeblockScheduler;
    const today = new Date().toISOString().split('T')[0];

    beforeEach(() => {
      scheduler = new TimeblockScheduler();
    });

    it('lists default scheduled timeblocks', () => {
      const blocks = scheduler.listBlocks(today);
      expect(blocks.length).toBeGreaterThanOrEqual(3);
      expect(blocks[0].startTime).toBe('08:30');
    });

    it('adds a non-conflicting timeblock', () => {
      const res = scheduler.addBlock('Late Night Code Refactor', 'coding', today, '22:00', '23:30');
      expect(res.block.id).toBeDefined();
      expect(res.conflicts.length).toBe(0);
      expect(scheduler.listBlocks(today).some((b) => b.id === res.block.id)).toBe(true);
    });

    it('detects time conflicts when intervals overlap', () => {
      // Seed block tb_1 is 08:30 - 11:30
      const res = scheduler.addBlock('Interfering Meeting', 'admin', today, '09:00', '10:00');
      expect(res.conflicts.length).toBeGreaterThan(0);
      expect(res.conflicts[0].overlapMinutes).toBe(60);
    });

    it('rejects invalid time ranges where start >= end', () => {
      expect(() => scheduler.addBlock('Bad Block', 'deep_work', today, '14:00', '13:00')).toThrow(
        'Start time (14:00) must be strictly before end time (13:00)'
      );
    });

    it('suggests optimal cognitive focus windows without conflicts', () => {
      const suggestion = scheduler.suggestFocusSlot(today, 60);
      expect(suggestion.recommendedStart).toBeDefined();
      expect(suggestion.recommendedEnd).toBeDefined();
      expect(suggestion.reason).toBeDefined();
    });

    it('marks block as completed and removes block', () => {
      const res = scheduler.addBlock('Temporary Task', 'break', today, '12:00', '12:30');
      const updated = scheduler.markCompleted(res.block.id, true);
      expect(updated.completed).toBe(true);
      expect(scheduler.removeBlock(res.block.id)).toBe(true);
    });
  });

  describe('GoalsManager Core Orchestration', () => {
    it('lists seeded goals and projects', () => {
      const goals = goalsManager.listGoals('dwight');
      expect(goals.length).toBeGreaterThanOrEqual(2);

      const projects = goalsManager.listProjects('dwight');
      expect(projects.length).toBeGreaterThanOrEqual(2);
      expect(projects.some((p) => p.name.includes('JARVIS'))).toBe(true);
    });

    it('creates a new SMART goal and verifies attributes', () => {
      const goal = goalsManager.createGoal(
        {
          title: 'Publish Research Paper on Agentic Cognitive Architectures',
          description: 'Submit peer-reviewed paper to IEEE Transactions on Learning Technologies.',
          category: 'research',
          priority: 'high',
          targetDate: '2026-11-30',
          milestones: [
            { title: 'Draft Literature Review', targetDate: '2026-10-25', targetMetric: '100% Complete' },
            { title: 'Empirical Data Analysis', targetDate: '2026-11-10', targetMetric: 'ANOVA Verified' },
          ],
        },
        'dwight'
      );

      expect(goal.id).toBeDefined();
      expect(goal.status).toBe('active');
      expect(goal.milestones.length).toBe(2);
      expect(goal.progressPct).toBe(0);
    });

    it('completes milestones and dynamically updates goal progress percentage', () => {
      const goal = goalsManager.createGoal(
        {
          title: 'Two Milestone Goal',
          description: 'Test progress math',
          category: 'personal',
          priority: 'medium',
          targetDate: '2026-12-01',
          milestones: [
            { title: 'Part 1', targetDate: '2026-10-20', targetMetric: 'Done' },
            { title: 'Part 2', targetDate: '2026-10-25', targetMetric: 'Done' },
          ],
        },
        'dwight'
      );

      const updated1 = goalsManager.completeMilestone(goal.id, goal.milestones[0].id, 'dwight');
      expect(updated1.progressPct).toBe(50);
      expect(updated1.status).toBe('active');

      const updated2 = goalsManager.completeMilestone(goal.id, goal.milestones[1].id, 'dwight');
      expect(updated2.progressPct).toBe(100);
      expect(updated2.status).toBe('completed');
    });

    it('creates tasks and accurately partitions into Eisenhower quadrants', () => {
      const urgentImportant = goalsManager.createTask({
        title: 'Fix Production Bug',
        isUrgent: true,
        isImportant: true,
      }, 'dwight');
      expect(urgentImportant.quadrant).toBe('do_first');

      const notUrgentImportant = goalsManager.createTask({
        title: 'Learn Advanced Rust',
        isUrgent: false,
        isImportant: true,
      }, 'dwight');
      expect(notUrgentImportant.quadrant).toBe('schedule');

      const urgentNotImportant = goalsManager.createTask({
        title: 'Reply to Routine Status Ping',
        isUrgent: true,
        isImportant: false,
      }, 'dwight');
      expect(urgentNotImportant.quadrant).toBe('delegate');

      const notUrgentNotImportant = goalsManager.createTask({
        title: 'Organize Random Bookmarks',
        isUrgent: false,
        isImportant: false,
      }, 'dwight');
      expect(notUrgentNotImportant.quadrant).toBe('eliminate');

      const matrix = goalsManager.getEisenhowerMatrix('dwight');
      expect(matrix.do_first.some((t) => t.id === urgentImportant.id)).toBe(true);
      expect(matrix.schedule.some((t) => t.id === notUrgentImportant.id)).toBe(true);
      expect(matrix.delegate.some((t) => t.id === urgentNotImportant.id)).toBe(true);
      expect(matrix.eliminate.some((t) => t.id === notUrgentNotImportant.id)).toBe(true);
    });

    it('calculates comprehensive analytics metrics', () => {
      const analytics = goalsManager.getAnalytics('dwight');
      expect(analytics.totalGoals).toBeGreaterThanOrEqual(2);
      expect(analytics.activeGoals).toBeGreaterThanOrEqual(1);
      expect(analytics.totalTasks).toBeGreaterThanOrEqual(4);
      expect(analytics.weeklyVelocity).toBe(14);
      expect(analytics.eisenhowerDistribution.do_first).toBeGreaterThanOrEqual(1);
    });

    it('enforces permission gating and blocks unauthorized users', () => {
      expect(() => goalsManager.listGoals('unauthorized_stranger')).toThrow('Security Violation');
      expect(() => goalsManager.createGoal({
        title: 'Hack Goal',
        description: 'Unauthorized creation',
        category: 'system',
        priority: 'high',
        targetDate: '2026-10-31',
      }, 'unauthorized_stranger')).toThrow('Security Violation');
    });
  });

  describe('Autonomous GoalAgent & ProjectAgent Execution', () => {
    it('executes goal decomposition and matrix queries via GoalAgent', async () => {
      const agent = new GoalAgent(goalsManager);
      const ctx = {
        requestId: 'req_test_agent',
        userId: 'dwight',
        sessionId: 'sess_test',
        grantedPermissions: [],
      };

      const resDecompose = await agent.execute({
        action: 'decompose',
        idea: 'Construct an advanced IoT smart garden telemetry station',
        category: 'coding',
      }, ctx);

      expect(resDecompose.success).toBe(true);
      expect(resDecompose.data.tasks.length).toBeGreaterThanOrEqual(4);

      const resMatrix = await agent.execute({ action: 'get_matrix' }, ctx);
      expect(resMatrix.success).toBe(true);
      expect(resMatrix.data.do_first).toBeDefined();
    });

    it('executes project coordination and task creation via ProjectAgent', async () => {
      const agent = new ProjectAgent(goalsManager);
      const ctx = {
        requestId: 'req_proj_agent',
        userId: 'dwight',
        sessionId: 'sess_test',
        grantedPermissions: [],
      };

      const resProj = await agent.execute({ action: 'list_projects' }, ctx);
      expect(resProj.success).toBe(true);
      expect(resProj.data.length).toBeGreaterThanOrEqual(2);

      const resTask = await agent.execute({
        action: 'create_task',
        taskData: {
          title: 'Run regression tests on agent coordinator',
          isUrgent: true,
          isImportant: true,
          estimatedMinutes: 30,
        },
      }, ctx);
      expect(resTask.success).toBe(true);
      expect(resTask.data.title).toBe('Run regression tests on agent coordinator');
    });
  });

  describe('Registered Phase 22 Tools', () => {
    const ctx = {
      requestId: 'req_tool_test',
      userId: 'dwight',
      sessionId: 'sess_tool',
      permissionVerified: true,
    };

    it('executes CreateGoalTool and DecomposeIdeaTool', async () => {
      const createGoalTool = new CreateGoalTool(goalsManager);
      const resGoal = await createGoalTool.execute({
        title: 'Tool Test Goal',
        description: 'Testing create tool',
        targetDate: '2026-11-01',
      }, ctx);
      expect(resGoal.success).toBe(true);
      expect(resGoal.data.title).toBe('Tool Test Goal');

      const decomposeTool = new DecomposeIdeaTool(goalsManager);
      const resDecompose = await decomposeTool.execute({
        idea: 'Master Differential Equations for BLEPT',
        category: 'education',
      }, ctx);
      expect(resDecompose.success).toBe(true);
      expect(resDecompose.data.smartGoal).toBeDefined();
    });

    it('executes ManageTasksTool, TrackProgressTool, and EisenhowerMatrixTool', async () => {
      const manageTasksTool = new ManageTasksTool(goalsManager);
      const resTask = await manageTasksTool.execute({
        action: 'create',
        taskData: {
          title: 'Tool-created task',
          isUrgent: false,
          isImportant: true,
        },
      }, ctx);
      expect(resTask.success).toBe(true);

      const trackProgressTool = new TrackProgressTool(goalsManager);
      const resProgress = await trackProgressTool.execute({}, ctx);
      expect(resProgress.success).toBe(true);
      expect(resProgress.data.totalGoals).toBeGreaterThanOrEqual(2);

      const eisenhowerTool = new EisenhowerMatrixTool(goalsManager);
      const resMatrix = await eisenhowerTool.execute({}, ctx);
      expect(resMatrix.success).toBe(true);
      expect(resMatrix.data.schedule).toBeDefined();
    });

    it('executes CreateStudyPlanTool, ScheduleTimeblockTool, and ManageProjectTool', async () => {
      const studyTool = new CreateStudyPlanTool(goalsManager);
      const resStudy = await studyTool.execute({
        title: 'Tool Study Plan',
        targetExamOrGoal: 'Test Certification',
        topics: [{ subject: 'Math', topic: 'Calculus', masteryLevel: 85 }],
      }, ctx);
      expect(resStudy.success).toBe(true);

      const schedTool = new ScheduleTimeblockTool(goalsManager);
      const resSched = await schedTool.execute({
        title: 'Tool Focus Block',
        date: new Date().toISOString().split('T')[0],
        startTime: '19:00',
        endTime: '20:30',
      }, ctx);
      expect(resSched.success).toBe(true);

      const projTool = new ManageProjectTool(goalsManager);
      const resProj = await projTool.execute({ action: 'list' }, ctx);
      expect(resProj.success).toBe(true);
      expect(resProj.data.length).toBeGreaterThanOrEqual(2);
    });
  });
});
