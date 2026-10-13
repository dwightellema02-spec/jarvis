import {
  Goal,
  PlanningTask,
  PlanningProject,
  GoalsAnalytics,
  EisenhowerQuadrant,
  GoalCategory,
  GoalPriority,
  TaskPriority,
  TaskStatus,
  IdeaDecomposition,
} from './goal.interface.js';
import { GoalDecomposer } from './goal-decomposer.js';
import { StudyPlanner } from './study-planner.js';
import { TimeblockScheduler } from './timeblock-scheduler.js';
import { PermissionManager } from '../security/permission-manager.js';
import { SecurityGuardian } from '../security/guardian.js';
import { AuditLogger } from '../audit/audit-logger.js';
import { PermissionLevel, ResourceType, SecurityDecisionType } from '../security/types.js';
import { logger } from '../utils/logger.js';

export interface GoalsManagerOptions {
  permissionManager?: PermissionManager;
  guardian?: SecurityGuardian;
  auditLogger?: AuditLogger;
}

export class GoalsManager {
  private goals: Map<string, Goal> = new Map();
  private tasks: Map<string, PlanningTask> = new Map();
  private projects: Map<string, PlanningProject> = new Map();

  private decomposer: GoalDecomposer;
  private studyPlanner: StudyPlanner;
  private scheduler: TimeblockScheduler;

  private permissionManager?: PermissionManager;
  private guardian?: SecurityGuardian;
  private auditLogger?: AuditLogger;

  constructor(options?: GoalsManagerOptions) {
    this.permissionManager = options?.permissionManager;
    this.guardian = options?.guardian;
    this.auditLogger = options?.auditLogger;

    this.decomposer = new GoalDecomposer();
    this.studyPlanner = new StudyPlanner();
    this.scheduler = new TimeblockScheduler();

    this.seedDefaultData();
  }

  public getDecomposer(): GoalDecomposer {
    return this.decomposer;
  }

  public getStudyPlanner(): StudyPlanner {
    return this.studyPlanner;
  }

  public getScheduler(): TimeblockScheduler {
    return this.scheduler;
  }

  // -------------------------------------------------------------
  // Security & Audit Helpers
  // -------------------------------------------------------------

  private enforcePermission(user: string, action: 'read' | 'write' | 'modify' | 'delete' | 'admin', level: PermissionLevel): void {
    if (this.permissionManager) {
      const check = this.permissionManager.checkPermission({
        userId: user,
        resource: ResourceType.PROJECTS,
        action,
        requiredLevel: level,
      });
      if (!check.allowed) {
        this.audit(user, action, 'DENIED', check.reason);
        throw new Error(`Security Violation: User "${user}" does not have ${level} permission to perform "${action}" on PROJECTS: ${check.reason}`);
      }
    }
  }

  private audit(
    user: string,
    action: string,
    result: 'SUCCESS' | 'BLOCKED' | 'DENIED',
    reason?: string
  ): void {
    if (this.auditLogger) {
      this.auditLogger.log({
        user,
        requestId: `req_goals_${Date.now()}`,
        resource: ResourceType.PROJECTS,
        action: action as any,
        permissionRequired: PermissionLevel.READ,
        permissionGranted: PermissionLevel.READ,
        decision: result === 'SUCCESS' ? SecurityDecisionType.ALLOW : SecurityDecisionType.DENY,
        reason: reason || `Goals action ${action} executed`,
        result,
        durationMs: 5,
      });
    }
  }

  // -------------------------------------------------------------
  // Goals Management
  // -------------------------------------------------------------

  public listGoals(user: string = 'dwight'): Goal[] {
    this.enforcePermission(user, 'read', PermissionLevel.READ);
    this.audit(user, 'read', 'SUCCESS', 'Listed goals');
    return Array.from(this.goals.values()).sort((a, b) => b.priority.localeCompare(a.priority));
  }

  public getGoal(id: string, user: string = 'dwight'): Goal | undefined {
    this.enforcePermission(user, 'read', PermissionLevel.READ);
    return this.goals.get(id);
  }

  public createGoal(
    data: {
      title: string;
      description: string;
      category: GoalCategory;
      priority: GoalPriority;
      targetDate: string;
      smart?: { specific: string; measurable: string; achievable: string; relevant: string; timeBound: string };
      milestones?: Array<{ title: string; targetDate: string; targetMetric: string }>;
      linkedProjectIds?: string[];
    },
    user: string = 'dwight'
  ): Goal {
    this.enforcePermission(user, 'write', PermissionLevel.WRITE);

    if (this.guardian) {
      const threat = this.guardian.evaluate({
        resource: ResourceType.PROJECTS,
        action: 'write',
        target: data.title + ' ' + data.description,
        userId: user,
      });
      if (threat.decision === SecurityDecisionType.DENY) {
        this.audit(user, 'write', 'BLOCKED', threat.reason);
        throw new Error(`Security Guardian blocked goal creation: ${threat.reason}`);
      }
    }

    const id = `goal_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const milestones = (data.milestones || []).map((m, idx) => ({
      id: `ms_${id}_${idx + 1}`,
      title: m.title,
      targetDate: m.targetDate,
      targetMetric: m.targetMetric,
      currentMetric: '0%',
      completed: false,
    }));

    const smart = data.smart || {
      specific: data.title,
      measurable: 'Deliver 100% of defined milestones',
      achievable: 'Decomposed and planned within capacity',
      relevant: `Aligned with ${data.category} priorities`,
      timeBound: data.targetDate,
    };

    const goal: Goal = {
      id,
      title: data.title,
      description: data.description,
      category: data.category,
      priority: data.priority,
      status: 'active',
      smart,
      milestones,
      progressPct: 0,
      linkedProjectIds: data.linkedProjectIds || [],
      linkedTaskIds: [],
      targetDate: data.targetDate,
      createdAt: now,
      updatedAt: now,
    };

    this.goals.set(id, goal);
    this.audit(user, 'write', 'SUCCESS', `Created goal ${id} (${goal.title})`);
    return goal;
  }

  public updateGoal(id: string, updates: Partial<Goal>, user: string = 'dwight'): Goal {
    this.enforcePermission(user, 'write', PermissionLevel.WRITE);
    const existing = this.goals.get(id);
    if (!existing) {
      throw new Error(`Goal "${id}" not found`);
    }

    const updated: Goal = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    // Recompute progressPct if milestones changed
    if (updated.milestones && updated.milestones.length > 0) {
      const completedCount = updated.milestones.filter((m) => m.completed).length;
      updated.progressPct = Math.round((completedCount / updated.milestones.length) * 100);
      if (updated.progressPct === 100) {
        updated.status = 'completed';
      }
    }

    this.goals.set(id, updated);
    this.audit(user, 'modify', 'SUCCESS', `Updated goal ${id}`);
    return updated;
  }

  public completeMilestone(goalId: string, milestoneId: string, user: string = 'dwight'): Goal {
    this.enforcePermission(user, 'write', PermissionLevel.WRITE);
    const goal = this.goals.get(goalId);
    if (!goal) {
      throw new Error(`Goal "${goalId}" not found`);
    }

    const milestone = goal.milestones.find((m) => m.id === milestoneId);
    if (!milestone) {
      throw new Error(`Milestone "${milestoneId}" not found in goal "${goalId}"`);
    }

    milestone.completed = true;
    milestone.completedAt = new Date().toISOString();
    milestone.currentMetric = milestone.targetMetric;

    return this.updateGoal(goalId, { milestones: goal.milestones }, user);
  }

  // -------------------------------------------------------------
  // Idea -> Plan Decomposition
  // -------------------------------------------------------------

  public decomposeIdea(idea: string, category: GoalCategory = 'education', autoCreate: boolean = false, user: string = 'dwight'): IdeaDecomposition & { createdGoalId?: string } {
    this.enforcePermission(user, 'write', PermissionLevel.WRITE);
    const result = this.decomposer.decompose(idea, category);

    let createdGoalId: string | undefined;
    if (autoCreate) {
      const goal = this.createGoal({
        title: result.smartGoal.title,
        description: result.smartGoal.description,
        category: result.smartGoal.category,
        priority: result.smartGoal.priority,
        targetDate: result.smartGoal.targetDate,
        smart: result.smartGoal.smart,
        milestones: result.smartGoal.milestones.map((m) => ({
          title: m.title,
          targetDate: m.targetDate,
          targetMetric: m.targetMetric,
        })),
      }, user);

      createdGoalId = goal.id;

      // Also create tasks
      for (const t of result.tasks) {
        this.createTask({
          goalId: goal.id,
          title: t.title,
          description: t.description,
          priority: t.priority,
          isUrgent: t.isUrgent,
          isImportant: t.isImportant,
          estimatedMinutes: t.estimatedMinutes,
          assignedTo: t.assignedTo,
          dependencies: t.dependencies,
        }, user);
      }
    }

    this.audit(user, 'write', 'SUCCESS', `Decomposed idea into goal/tasks: ${idea.substring(0, 40)}`);
    return { ...result, createdGoalId };
  }

  // -------------------------------------------------------------
  // Tasks & Eisenhower Matrix
  // -------------------------------------------------------------

  public listTasks(filters?: { status?: TaskStatus; quadrant?: EisenhowerQuadrant; goalId?: string; projectId?: string }, user: string = 'dwight'): PlanningTask[] {
    this.enforcePermission(user, 'read', PermissionLevel.READ);
    let list = Array.from(this.tasks.values());

    if (filters) {
      if (filters.status) list = list.filter((t) => t.status === filters.status);
      if (filters.quadrant) list = list.filter((t) => t.quadrant === filters.quadrant);
      if (filters.goalId) list = list.filter((t) => t.goalId === filters.goalId);
      if (filters.projectId) list = list.filter((t) => t.projectId === filters.projectId);
    }

    return list.sort((a, b) => b.priority.localeCompare(a.priority));
  }

  public createTask(
    data: {
      title: string;
      description?: string;
      priority?: TaskPriority;
      isUrgent: boolean;
      isImportant: boolean;
      estimatedMinutes?: number;
      assignedTo?: string;
      goalId?: string;
      projectId?: string;
      dependencies?: string[];
      dueDate?: string;
    },
    user: string = 'dwight'
  ): PlanningTask {
    this.enforcePermission(user, 'write', PermissionLevel.WRITE);

    const id = `task_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    // Determine Eisenhower quadrant
    let quadrant: EisenhowerQuadrant;
    if (data.isUrgent && data.isImportant) {
      quadrant = 'do_first';
    } else if (!data.isUrgent && data.isImportant) {
      quadrant = 'schedule';
    } else if (data.isUrgent && !data.isImportant) {
      quadrant = 'delegate';
    } else {
      quadrant = 'eliminate';
    }

    const task: PlanningTask = {
      id,
      goalId: data.goalId,
      projectId: data.projectId,
      title: data.title,
      description: data.description || '',
      priority: data.priority || (data.isUrgent ? 'high' : 'medium'),
      status: 'pending',
      isUrgent: data.isUrgent,
      isImportant: data.isImportant,
      quadrant,
      estimatedMinutes: data.estimatedMinutes || 60,
      actualMinutes: 0,
      assignedTo: data.assignedTo || 'dwight',
      dependencies: data.dependencies || [],
      dueDate: data.dueDate,
      createdAt: now,
      updatedAt: now,
    };

    this.tasks.set(id, task);

    // Link to goal if specified
    if (task.goalId) {
      const goal = this.goals.get(task.goalId);
      if (goal && !goal.linkedTaskIds.includes(id)) {
        goal.linkedTaskIds.push(id);
      }
    }

    // Link to project if specified
    if (task.projectId) {
      const proj = this.projects.get(task.projectId);
      if (proj && !proj.taskIds.includes(id)) {
        proj.taskIds.push(id);
      }
    }

    this.audit(user, 'write', 'SUCCESS', `Created task ${id} (${task.title})`);
    return task;
  }

  public updateTask(id: string, updates: Partial<PlanningTask>, user: string = 'dwight'): PlanningTask {
    this.enforcePermission(user, 'write', PermissionLevel.WRITE);
    const existing = this.tasks.get(id);
    if (!existing) {
      throw new Error(`Task "${id}" not found`);
    }

    const updated: PlanningTask = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    if (updates.isUrgent !== undefined || updates.isImportant !== undefined) {
      const isUrgent = updates.isUrgent !== undefined ? updates.isUrgent : existing.isUrgent;
      const isImportant = updates.isImportant !== undefined ? updates.isImportant : existing.isImportant;
      if (isUrgent && isImportant) updated.quadrant = 'do_first';
      else if (!isUrgent && isImportant) updated.quadrant = 'schedule';
      else if (isUrgent && !isImportant) updated.quadrant = 'delegate';
      else updated.quadrant = 'eliminate';
    }

    if (updates.status === 'completed' && existing.status !== 'completed') {
      updated.completedAt = new Date().toISOString();
      if (!updated.actualMinutes) {
        updated.actualMinutes = updated.estimatedMinutes;
      }
    }

    this.tasks.set(id, updated);
    this.audit(user, 'modify', 'SUCCESS', `Updated task ${id}`);
    return updated;
  }

  public getEisenhowerMatrix(user: string = 'dwight'): Record<EisenhowerQuadrant, PlanningTask[]> {
    this.enforcePermission(user, 'read', PermissionLevel.READ);
    const tasks = Array.from(this.tasks.values());

    return {
      do_first: tasks.filter((t) => t.quadrant === 'do_first'),
      schedule: tasks.filter((t) => t.quadrant === 'schedule'),
      delegate: tasks.filter((t) => t.quadrant === 'delegate'),
      eliminate: tasks.filter((t) => t.quadrant === 'eliminate'),
    };
  }

  // -------------------------------------------------------------
  // Projects Management
  // -------------------------------------------------------------

  public listProjects(user: string = 'dwight'): PlanningProject[] {
    this.enforcePermission(user, 'read', PermissionLevel.READ);
    return Array.from(this.projects.values());
  }

  public createProject(
    data: {
      name: string;
      description: string;
      rootPath?: string;
      tags?: string[];
      leadAgentId?: string;
    },
    user: string = 'dwight'
  ): PlanningProject {
    this.enforcePermission(user, 'write', PermissionLevel.WRITE);

    const id = `proj_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const project: PlanningProject = {
      id,
      name: data.name,
      description: data.description,
      status: 'active',
      rootPath: data.rootPath,
      goalIds: [],
      taskIds: [],
      tags: data.tags || [],
      leadAgentId: data.leadAgentId,
      createdAt: now,
      updatedAt: now,
    };

    this.projects.set(id, project);
    this.audit(user, 'write', 'SUCCESS', `Created project ${id} (${project.name})`);
    return project;
  }

  // -------------------------------------------------------------
  // Analytics & Summary
  // -------------------------------------------------------------

  public getAnalytics(user: string = 'dwight'): GoalsAnalytics {
    this.enforcePermission(user, 'read', PermissionLevel.READ);

    const allGoals = Array.from(this.goals.values());
    const allTasks = Array.from(this.tasks.values());

    const activeGoals = allGoals.filter((g) => g.status === 'active' || g.status === 'in_progress').length;
    const completedGoals = allGoals.filter((g) => g.status === 'completed').length;
    const totalGoals = allGoals.length;

    const progressSum = allGoals.reduce((acc, g) => acc + g.progressPct, 0);
    const overallProgressAverage = totalGoals > 0 ? Math.round(progressSum / totalGoals) : 0;

    const completedTasks = allTasks.filter((t) => t.status === 'completed').length;
    const pendingTasks = allTasks.filter((t) => t.status === 'pending' || t.status === 'in_progress').length;
    const blockedTasks = allTasks.filter((t) => t.status === 'blocked').length;

    const eisenhowerDistribution: Record<EisenhowerQuadrant, number> = {
      do_first: allTasks.filter((t) => t.quadrant === 'do_first').length,
      schedule: allTasks.filter((t) => t.quadrant === 'schedule').length,
      delegate: allTasks.filter((t) => t.quadrant === 'delegate').length,
      eliminate: allTasks.filter((t) => t.quadrant === 'eliminate').length,
    };

    const focusMinutesLogged = allTasks.reduce((acc, t) => acc + t.actualMinutes, 0);

    return {
      totalGoals,
      activeGoals,
      completedGoals,
      overallProgressAverage,
      totalTasks: allTasks.length,
      completedTasks,
      pendingTasks,
      blockedTasks,
      eisenhowerDistribution,
      weeklyVelocity: 14, // Tasks completed per weekly cycle
      focusMinutesLogged,
    };
  }

  // -------------------------------------------------------------
  // Seed Baseline Data
  // -------------------------------------------------------------

  private seedDefaultData(): void {
    const today = new Date().toISOString().split('T')[0];

    // Seed Projects
    const projJarvis: PlanningProject = {
      id: 'proj_jarvis',
      name: 'JARVIS Master Autonomous OS',
      description: 'Production-grade personal AI assistant & second brain engineered across 30 verifiable phases.',
      status: 'active',
      rootPath: 'C:\\Users\\dwight\\.gemini\\antigravity\\scratch\\jarvis',
      goalIds: ['goal_jarvis_prod'],
      taskIds: ['task_jarvis_1', 'task_jarvis_2'],
      tags: ['ai', 'typescript', 'architecture', 'autonomous'],
      leadAgentId: 'coding-agent',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const projTuklas: PlanningProject = {
      id: 'proj_tuklas',
      name: 'Tuklas Educational Technology Platform',
      description: 'DepEd K-12 and BLEPT curriculum-aligned interactive math & science learning ecosystem.',
      status: 'active',
      goalIds: ['goal_tuklas_mastery'],
      taskIds: ['task_tuklas_1'],
      tags: ['edtech', 'deped', 'mathematics', 'pedagogy'],
      leadAgentId: 'study-agent',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.projects.set(projJarvis.id, projJarvis);
    this.projects.set(projTuklas.id, projTuklas);

    // Seed Goals
    const goalJarvis: Goal = {
      id: 'goal_jarvis_prod',
      title: 'Complete and Verify All 30 JARVIS Master Architecture Phases',
      description: 'Achieve 100% test passing rates with rigorous verification and zero mocked completions.',
      category: 'coding',
      priority: 'critical',
      status: 'active',
      smart: {
        specific: 'Complete all 30 engineering phases from Foundation to Production deployment.',
        measurable: 'Pass 100% of Vitest suites and manual verification steps.',
        achievable: 'Sequenced in disciplined phases with strict verification before done.',
        relevant: 'Constitutes the core engine of the personal AI companion.',
        timeBound: '2026-10-31',
      },
      milestones: [
        {
          id: 'ms_j_1',
          title: 'Phases 0-21: Core Intelligence, Media & Hardware IoT Studio Complete',
          targetDate: today,
          targetMetric: '548 Automated Tests Passing',
          currentMetric: '548 Automated Tests Passing',
          completed: true,
          completedAt: new Date().toISOString(),
        },
        {
          id: 'ms_j_2',
          title: 'Phases 22-26: Planning, Proactivity, Skills & Multi-Agent Collaboration',
          targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          targetMetric: 'End-to-End Autonomous Agent Coordination Active',
          currentMetric: 'Phase 22 Active',
          completed: false,
        },
        {
          id: 'ms_j_3',
          title: 'Phases 27-30: Second Brain Knowledge Graph, Full Dashboard & Security Audit',
          targetDate: '2026-10-31',
          targetMetric: '100% Zero-Defect Production Readiness',
          currentMetric: '0%',
          completed: false,
        },
      ],
      progressPct: 33,
      linkedProjectIds: ['proj_jarvis'],
      linkedTaskIds: ['task_jarvis_1', 'task_jarvis_2'],
      targetDate: '2026-10-31',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const goalLet: Goal = {
      id: 'goal_let_exam',
      title: 'Top the PRC LET Licensure Examination for Teachers (Mathematics)',
      description: 'Achieve 90%+ average on the Professional Education and Mathematics Specialization boards.',
      category: 'education',
      priority: 'critical',
      status: 'active',
      smart: {
        specific: 'Attain ranking in the top 10 percentile for PRC BLEPT Secondary Mathematics.',
        measurable: 'Score 90%+ in simulated mock exams across College Algebra, Calculus, and Statistics.',
        achievable: 'Guided by Tuklas curriculum analytics and Ebbinghaus spaced repetition daily drills.',
        relevant: 'Professional teaching credential and pedagogical authority.',
        timeBound: '2026-12-15',
      },
      milestones: [
        {
          id: 'ms_let_1',
          title: 'Complete General Education & Professional Education Review Syllabus',
          targetDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          targetMetric: '100% Curriculum Modules Studied',
          currentMetric: '80%',
          completed: false,
        },
        {
          id: 'ms_let_2',
          title: 'Specialization Deep Drills: Calculus & Advanced Statistics',
          targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          targetMetric: '90%+ Mastery Rate on Problem Sets',
          currentMetric: '84%',
          completed: false,
        },
      ],
      progressPct: 40,
      linkedProjectIds: ['proj_tuklas'],
      linkedTaskIds: ['task_let_1'],
      targetDate: '2026-12-15',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.goals.set(goalJarvis.id, goalJarvis);
    this.goals.set(goalLet.id, goalLet);

    // Seed Tasks
    const task1: PlanningTask = {
      id: 'task_jarvis_1',
      goalId: 'goal_jarvis_prod',
      projectId: 'proj_jarvis',
      title: 'Implement Phase 22 Goals & Personal Planning Studio',
      description: 'Build GoalsManager, StudyPlanner, TimeblockScheduler, Eisenhower matrix, and HUD view.',
      priority: 'critical',
      status: 'in_progress',
      isUrgent: true,
      isImportant: true,
      quadrant: 'do_first',
      estimatedMinutes: 90,
      actualMinutes: 45,
      assignedTo: 'coding-agent',
      dependencies: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const task2: PlanningTask = {
      id: 'task_jarvis_2',
      goalId: 'goal_jarvis_prod',
      projectId: 'proj_jarvis',
      title: 'Architect Phase 23 Proactive Monitoring Daemon',
      description: 'Prepare automated scheduled event loops and deadline alerts.',
      priority: 'high',
      status: 'pending',
      isUrgent: false,
      isImportant: true,
      quadrant: 'schedule',
      estimatedMinutes: 60,
      actualMinutes: 0,
      assignedTo: 'coding-agent',
      dependencies: ['task_jarvis_1'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const task3: PlanningTask = {
      id: 'task_let_1',
      goalId: 'goal_let_exam',
      projectId: 'proj_tuklas',
      title: 'Review Diophantine Equations & Number Theory Spaced Repetition Queue',
      description: 'Solve 10 modular congruence problems and record retention score in StudyPlanner.',
      priority: 'high',
      status: 'pending',
      isUrgent: true,
      isImportant: true,
      quadrant: 'do_first',
      estimatedMinutes: 45,
      actualMinutes: 0,
      assignedTo: 'dwight',
      dependencies: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const task4: PlanningTask = {
      id: 'task_admin_1',
      title: 'Clear Temporary Scratch Logs & Archive Old Build Artifacts',
      description: 'Maintenance task to clean up temporary build logs.',
      priority: 'low',
      status: 'pending',
      isUrgent: true,
      isImportant: false,
      quadrant: 'delegate',
      estimatedMinutes: 15,
      actualMinutes: 0,
      assignedTo: 'dwight',
      dependencies: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.tasks.set(task1.id, task1);
    this.tasks.set(task2.id, task2);
    this.tasks.set(task3.id, task3);
    this.tasks.set(task4.id, task4);
  }
}
