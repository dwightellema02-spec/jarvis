import {
  GoalCategory,
  GoalPriority,
  IdeaDecomposition,
  PlanningTask,
  TaskPriority,
  EisenhowerQuadrant,
  Goal,
} from './goal.interface.js';

export class GoalDecomposer {
  /**
   * Decomposes a freeform human idea into an actionable, structured execution plan:
   * IDEA -> GOAL -> PLAN -> TASKS -> ACTION -> PROGRESS
   */
  public decompose(idea: string, category: GoalCategory = 'education'): IdeaDecomposition {
    const trimmed = idea.trim();
    if (!trimmed) {
      throw new Error('Idea prompt cannot be empty');
    }

    // Infer priority and category if keywords are present
    let inferredCategory = category;
    let inferredPriority: GoalPriority = 'high';

    const lower = trimmed.toLowerCase();
    if (lower.includes('let') || lower.includes('exam') || lower.includes('licensure') || lower.includes('math')) {
      inferredCategory = 'education';
      inferredPriority = 'critical';
    } else if (lower.includes('code') || lower.includes('software') || lower.includes('architecture') || lower.includes('app')) {
      inferredCategory = 'coding';
    } else if (lower.includes('research') || lower.includes('thesis') || lower.includes('paper')) {
      inferredCategory = 'research';
    } else if (lower.includes('finance') || lower.includes('portfolio') || lower.includes('budget')) {
      inferredCategory = 'finance';
    }

    const title = this.generateGoalTitle(trimmed);
    const targetDate = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const smartGoal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'> = {
      title,
      description: trimmed,
      category: inferredCategory,
      priority: inferredPriority,
      status: 'active',
      smart: {
        specific: `Execute end-to-end milestone deliverables for: "${trimmed}".`,
        measurable: 'Track 100% completion across all defined milestones and validation verification steps.',
        achievable: 'Decomposed into modular, self-contained task phases with concrete dependency order.',
        relevant: `Directly aligns with ${inferredCategory.toUpperCase()} priorities and personal second-brain objectives.`,
        timeBound: `Target completion by ${targetDate}.`,
      },
      milestones: [
        {
          id: 'ms-1',
          title: 'Foundational Scoping & Syllabus / Requirements Alignment',
          targetDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          targetMetric: '100% Core Requirements Documented',
          currentMetric: '0%',
          completed: false,
        },
        {
          id: 'ms-2',
          title: 'Core Implementation & Active Practice Cycles',
          targetDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          targetMetric: '85%+ Mastery or Verified Deliverables',
          currentMetric: '0%',
          completed: false,
        },
        {
          id: 'ms-3',
          title: 'Mock Assessment / System Stress Testing & Certification',
          targetDate: targetDate,
          targetMetric: 'Passing Score >= 90% or Full Test Suite Green',
          currentMetric: '0%',
          completed: false,
        },
      ],
      progressPct: 0,
      linkedProjectIds: [],
      linkedTaskIds: [],
      targetDate,
    };

    const tasks: Array<Omit<PlanningTask, 'id' | 'createdAt' | 'updatedAt'>> = [
      {
        title: `Audit Baseline Readiness for ${title}`,
        description: 'Conduct diagnostic check on current knowledge or code state.',
        priority: 'high',
        status: 'pending',
        isUrgent: true,
        isImportant: true,
        quadrant: 'do_first',
        estimatedMinutes: 60,
        actualMinutes: 0,
        assignedTo: 'dwight',
        dependencies: [],
      },
      {
        title: `Assemble Resource Manifest & Reference Materials`,
        description: 'Collate textbooks, official schemas, APIs, or DepEd/LET materials into second brain.',
        priority: 'medium',
        status: 'pending',
        isUrgent: false,
        isImportant: true,
        quadrant: 'schedule',
        estimatedMinutes: 90,
        actualMinutes: 0,
        assignedTo: 'research-agent',
        dependencies: ['task-1'],
      },
      {
        title: `Execute Sprint 1 Core Drills / Architecture Slices`,
        description: 'Perform focused deep-work sessions targeting the highest-yield topics or modules.',
        priority: 'high',
        status: 'pending',
        isUrgent: false,
        isImportant: true,
        quadrant: 'schedule',
        estimatedMinutes: 180,
        actualMinutes: 0,
        assignedTo: inferredCategory === 'coding' ? 'coding-agent' : 'dwight',
        dependencies: ['task-2'],
      },
      {
        title: `Conduct Intermediate Progress Verification`,
        description: 'Measure retention/performance against target rubric without simulated shortcuts.',
        priority: 'critical',
        status: 'pending',
        isUrgent: true,
        isImportant: true,
        quadrant: 'do_first',
        estimatedMinutes: 45,
        actualMinutes: 0,
        assignedTo: 'dwight',
        dependencies: ['task-3'],
      },
    ];

    const actionSteps = [
      '1. Review and approve the decomposed SMART goal criteria in the HUD.',
      '2. Block off dedicated daily deep-work timeblocks in the calendar scheduler.',
      '3. Initiate Task 1 diagnostic audit with JARVIS assistance.',
      '4. Periodically inspect the Eisenhower matrix to maintain high-yield execution focus.',
    ];

    return {
      idea: trimmed,
      smartGoal,
      tasks,
      actionSteps,
      estimatedDays: 60,
      riskAssessment: 'LOW — Standard personal planning cycle operating within authorized workspace boundaries.',
    };
  }

  private generateGoalTitle(idea: string): string {
    const words = idea.split(/\s+/).slice(0, 7).join(' ');
    return words.length < idea.length ? `${words}...` : words;
  }
}
