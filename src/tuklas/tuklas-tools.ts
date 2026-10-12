/**
 * JARVIS Phase 12 - Tuklas Tool Definitions
 * 8 Registered Tools for Tuklas Educational Operations
 */

import { ITool, ToolDefinition, ToolExecutionContext, ToolExecutionResult } from '../tools/tool.interface.js';
import { TuklasManager } from './tuklas-manager.js';
import { ResourceType, PermissionLevel } from '../security/types.js';

/**
 * 1. TuklasSearchLessonsTool: tuklas.search_lessons
 */
export class TuklasSearchLessonsTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'tuklas.search_lessons',
    name: 'Search Tuklas Lessons',
    description: 'Search educational lessons across subjects, grade levels, and Philippine DepEd competency codes.',
    version: '1.0.0',
    requiredPermissions: [
      { resource: ResourceType.TUKLAS, action: 'read', level: PermissionLevel.READ },
    ],
    parametersSchema: {
      type: 'object',
      properties: {
        query: { type: 'string' },
        subject: { type: 'string' },
        gradeLevel: { type: 'string' },
        competencyCode: { type: 'string' },
      },
    },
    status: 'implemented',
  };

  constructor(private readonly manager: TuklasManager) {}

  public async execute(params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const p = (params || {}) as any;
      const lessons = await this.manager.searchLessons(p, context.userId);
      return {
        success: true,
        toolId: this.definition.id,
        data: { lessons, count: lessons.length },
        verified: true,
        executionTimeMs: Date.now() - startTime,
      };
    } catch (err: any) {
      return {
        success: false,
        toolId: this.definition.id,
        error: err.message,
        verified: false,
        executionTimeMs: Date.now() - startTime,
      };
    }
  }
}

/**
 * 2. TuklasGetLessonTool: tuklas.get_lesson
 */
export class TuklasGetLessonTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'tuklas.get_lesson',
    name: 'Get Tuklas Lesson',
    description: 'Retrieve full lesson markdown, learning objectives, and prerequisites by lesson ID.',
    version: '1.0.0',
    requiredPermissions: [
      { resource: ResourceType.TUKLAS, action: 'read', level: PermissionLevel.READ },
    ],
    parametersSchema: {
      type: 'object',
      properties: {
        lessonId: { type: 'string' },
      },
      required: ['lessonId'],
    },
    status: 'implemented',
  };

  constructor(private readonly manager: TuklasManager) {}

  public async execute(params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const p = (params || {}) as { lessonId: string };
      if (!p.lessonId) throw new Error('Parameter "lessonId" is required.');
      const lesson = await this.manager.getLessonById(p.lessonId, context.userId);
      return {
        success: Boolean(lesson),
        toolId: this.definition.id,
        data: { lesson },
        verified: Boolean(lesson),
        executionTimeMs: Date.now() - startTime,
      };
    } catch (err: any) {
      return {
        success: false,
        toolId: this.definition.id,
        error: err.message,
        verified: false,
        executionTimeMs: Date.now() - startTime,
      };
    }
  }
}

/**
 * 3. TuklasCheckStudentProgressTool: tuklas.check_student_progress
 */
export class TuklasCheckStudentProgressTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'tuklas.check_student_progress',
    name: 'Check Student Progress',
    description: 'Check student mastery percentages, active learning streaks, and competency scores.',
    version: '1.0.0',
    requiredPermissions: [
      { resource: ResourceType.TUKLAS, action: 'read', level: PermissionLevel.READ },
    ],
    parametersSchema: {
      type: 'object',
      properties: {
        studentId: { type: 'string' },
      },
      required: ['studentId'],
    },
    status: 'implemented',
  };

  constructor(private readonly manager: TuklasManager) {}

  public async execute(params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const p = (params || {}) as { studentId: string };
      if (!p.studentId) throw new Error('Parameter "studentId" is required.');
      const progress = await this.manager.getStudentProgress(p.studentId, context.userId);
      return {
        success: Boolean(progress),
        toolId: this.definition.id,
        data: { progress },
        verified: Boolean(progress),
        executionTimeMs: Date.now() - startTime,
      };
    } catch (err: any) {
      return {
        success: false,
        toolId: this.definition.id,
        error: err.message,
        verified: false,
        executionTimeMs: Date.now() - startTime,
      };
    }
  }
}

/**
 * 4. TuklasCreatePracticeTool: tuklas.create_practice
 */
export class TuklasCreatePracticeTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'tuklas.create_practice',
    name: 'Create Practice Set',
    description: 'Generate adaptive practice items with hints and step-by-step explanations.',
    version: '1.0.0',
    requiredPermissions: [
      { resource: ResourceType.TUKLAS, action: 'read', level: PermissionLevel.READ },
    ],
    parametersSchema: {
      type: 'object',
      properties: {
        competencyCode: { type: 'string' },
        difficulty: { type: 'string', enum: ['easy', 'medium', 'hard'] },
        count: { type: 'number' },
      },
    },
    status: 'implemented',
  };

  constructor(private readonly manager: TuklasManager) {}

  public async execute(params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const p = (params || {}) as any;
      const practiceSet = await this.manager.generatePractice(p, context.userId);
      return {
        success: true,
        toolId: this.definition.id,
        data: { practiceSet },
        verified: true,
        executionTimeMs: Date.now() - startTime,
      };
    } catch (err: any) {
      return {
        success: false,
        toolId: this.definition.id,
        error: err.message,
        verified: false,
        executionTimeMs: Date.now() - startTime,
      };
    }
  }
}

/**
 * 5. TuklasEvaluateAssessmentTool: tuklas.evaluate_assessment
 */
export class TuklasEvaluateAssessmentTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'tuklas.evaluate_assessment',
    name: 'Evaluate Assessment',
    description: 'Grade assessment submissions against the answer key, calculating passing status and item feedback.',
    version: '1.0.0',
    requiredPermissions: [
      { resource: ResourceType.TUKLAS, action: 'read', level: PermissionLevel.READ },
    ],
    parametersSchema: {
      type: 'object',
      properties: {
        assessmentId: { type: 'string' },
        studentId: { type: 'string' },
        answers: { type: 'object' },
      },
      required: ['assessmentId', 'studentId', 'answers'],
    },
    status: 'implemented',
  };

  constructor(private readonly manager: TuklasManager) {}

  public async execute(params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const p = (params || {}) as any;
      if (!p.assessmentId || !p.studentId || !p.answers) {
        throw new Error('Parameters "assessmentId", "studentId", and "answers" are required.');
      }
      const evaluation = await this.manager.evaluateAssessment(p, context.userId);
      return {
        success: true,
        toolId: this.definition.id,
        data: { evaluation },
        verified: true,
        executionTimeMs: Date.now() - startTime,
      };
    } catch (err: any) {
      return {
        success: false,
        toolId: this.definition.id,
        error: err.message,
        verified: false,
        executionTimeMs: Date.now() - startTime,
      };
    }
  }
}

/**
 * 6. TuklasAnalyzeMistakesTool: tuklas.analyze_mistakes
 */
export class TuklasAnalyzeMistakesTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'tuklas.analyze_mistakes',
    name: 'Analyze Mistakes & Diagnostics',
    description: 'Diagnose student misconceptions (conceptual, procedural, computational) and recommend remedial lessons.',
    version: '1.0.0',
    requiredPermissions: [
      { resource: ResourceType.TUKLAS, action: 'read', level: PermissionLevel.READ },
    ],
    parametersSchema: {
      type: 'object',
      properties: {
        competencyCode: { type: 'string' },
        wrongAnswer: { type: 'string' },
        correctAnswer: { type: 'string' },
      },
      required: ['competencyCode', 'wrongAnswer', 'correctAnswer'],
    },
    status: 'implemented',
  };

  constructor(private readonly manager: TuklasManager) {}

  public async execute(params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const p = (params || {}) as any;
      if (!p.competencyCode || !p.wrongAnswer || !p.correctAnswer) {
        throw new Error('Parameters "competencyCode", "wrongAnswer", and "correctAnswer" are required.');
      }
      const analysis = await this.manager.analyzeMistake(p, context.userId);
      return {
        success: true,
        toolId: this.definition.id,
        data: { analysis },
        verified: true,
        executionTimeMs: Date.now() - startTime,
      };
    } catch (err: any) {
      return {
        success: false,
        toolId: this.definition.id,
        error: err.message,
        verified: false,
        executionTimeMs: Date.now() - startTime,
      };
    }
  }
}

/**
 * 7. TuklasGetResearchDataTool: tuklas.get_research_data
 */
export class TuklasGetResearchDataTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'tuklas.get_research_data',
    name: 'Get Cohort Research Data',
    description: 'Retrieve anonymized cohort learning metrics, item difficulty, and discrimination indices.',
    version: '1.0.0',
    requiredPermissions: [
      { resource: ResourceType.TUKLAS, action: 'read', level: PermissionLevel.READ },
    ],
    parametersSchema: {
      type: 'object',
      properties: {
        cohortId: { type: 'string' },
      },
    },
    status: 'implemented',
  };

  constructor(private readonly manager: TuklasManager) {}

  public async execute(params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const p = (params || {}) as any;
      const cohortData = await this.manager.getCohortResearchData(p.cohortId, context.userId);
      return {
        success: true,
        toolId: this.definition.id,
        data: { cohortData },
        verified: true,
        executionTimeMs: Date.now() - startTime,
      };
    } catch (err: any) {
      return {
        success: false,
        toolId: this.definition.id,
        error: err.message,
        verified: false,
        executionTimeMs: Date.now() - startTime,
      };
    }
  }
}

/**
 * 8. TuklasManageTeacherTasksTool: tuklas.manage_teacher_tasks
 */
export class TuklasManageTeacherTasksTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'tuklas.manage_teacher_tasks',
    name: 'Manage Teacher Tasks',
    description: 'Create and assign learning tasks or list active class assignments.',
    version: '1.0.0',
    requiredPermissions: [
      { resource: ResourceType.TUKLAS, action: 'write', level: PermissionLevel.WRITE },
    ],
    parametersSchema: {
      type: 'object',
      properties: {
        action: { type: 'string', enum: ['create', 'list'] },
        classId: { type: 'string' },
        title: { type: 'string' },
        competencyCode: { type: 'string' },
        dueDate: { type: 'string' },
      },
      required: ['action', 'classId'],
    },
    status: 'implemented',
  };

  constructor(private readonly manager: TuklasManager) {}

  public async execute(params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const p = (params || {}) as any;
      if (p.action === 'create') {
        const assignment = await this.manager.createAssignment(p, context.userId);
        return {
          success: true,
          toolId: this.definition.id,
          data: { assignment },
          verified: true,
          executionTimeMs: Date.now() - startTime,
        };
      }
      const assignments = await this.manager.listAssignments(p.classId, context.userId);
      return {
        success: true,
        toolId: this.definition.id,
        data: { assignments, count: assignments.length },
        verified: true,
        executionTimeMs: Date.now() - startTime,
      };
    } catch (err: any) {
      return {
        success: false,
        toolId: this.definition.id,
        error: err.message,
        verified: false,
        executionTimeMs: Date.now() - startTime,
      };
    }
  }
}

export function createTuklasTools(tuklasManager: TuklasManager): ITool[] {
  return [
    new TuklasSearchLessonsTool(tuklasManager),
    new TuklasGetLessonTool(tuklasManager),
    new TuklasCheckStudentProgressTool(tuklasManager),
    new TuklasCreatePracticeTool(tuklasManager),
    new TuklasEvaluateAssessmentTool(tuklasManager),
    new TuklasAnalyzeMistakesTool(tuklasManager),
    new TuklasGetResearchDataTool(tuklasManager),
    new TuklasManageTeacherTasksTool(tuklasManager),
  ];
}
