/**
 * JARVIS Phase 12 - Tuklas Agent Implementation
 * Connects JARVIS to the Tuklas Educational Platform
 */

import {
  IAgent,
  AgentDefinition,
  AgentExecutionContext,
  AgentExecutionResult,
} from '../agents/agent.interface.js';
import { TuklasManager } from './tuklas-manager.js';
import { ResourceType, PermissionLevel } from '../security/types.js';

export interface TuklasAgentInput {
  action:
    | 'search_lessons'
    | 'get_lesson'
    | 'create_lesson'
    | 'check_progress'
    | 'create_practice'
    | 'evaluate_assessment'
    | 'analyze_mistakes'
    | 'get_research_data'
    | 'create_assignment'
    | 'list_assignments'
    | 'get_status';
  query?: string;
  subject?: string;
  gradeLevel?: string;
  competencyCode?: string;
  lessonId?: string;
  studentId?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  count?: number;
  assessmentId?: string;
  answers?: Record<string, string>;
  question?: string;
  wrongAnswer?: string;
  correctAnswer?: string;
  cohortId?: string;
  classId?: string;
  title?: string;
  dueDate?: string;
  instructions?: string;
  lessonData?: {
    title: string;
    subject: string;
    gradeLevel: string;
    competencyCode: string;
    summary: string;
    objectives: string[];
    prerequisiteCompetencies: string[];
    contentMarkdown: string;
    estimatedMinutes: number;
    tags: string[];
    author: string;
  };
}

export class TuklasAgent implements IAgent {
  public readonly definition: AgentDefinition = {
    id: 'tuklas-agent',
    name: 'Tuklas Educational Assistant Agent',
    description:
      'Authorized agent integrating JARVIS with the Tuklas EdTech platform for lessons, student progress, practice, assessments, mistake diagnostics, and teacher workflows.',
    version: '1.0.0',
    capabilities: [
      'search_lessons',
      'get_lesson',
      'create_lesson',
      'check_progress',
      'create_practice',
      'evaluate_assessment',
      'analyze_mistakes',
      'get_research_data',
      'create_assignment',
      'list_assignments',
      'get_status',
    ],
    requiredPermissions: [
      {
        resource: ResourceType.TUKLAS,
        action: 'read',
        level: PermissionLevel.READ,
      },
    ],
    inputSchema: {
      action: 'string',
      competencyCode: 'string?',
      studentId: 'string?',
      query: 'string?',
    },
    outputSchema: {
      success: 'boolean',
      data: 'any',
    },
    status: 'implemented',
  };

  private tuklasManager: TuklasManager;

  constructor(tuklasManager: TuklasManager) {
    this.tuklasManager = tuklasManager;
  }

  public async execute(rawInput: unknown, context: AgentExecutionContext): Promise<AgentExecutionResult> {
    const startTime = Date.now();
    const input = (rawInput || {}) as TuklasAgentInput;
    const userId = context.userId || 'default_user';

    try {
      switch (input.action) {
        case 'get_status': {
          const status = this.tuklasManager.getStatus();
          return {
            success: true,
            agentId: this.definition.id,
            data: status,
            executionTimeMs: Date.now() - startTime,
          };
        }

        case 'search_lessons': {
          const lessons = await this.tuklasManager.searchLessons(
            {
              query: input.query,
              subject: input.subject,
              gradeLevel: input.gradeLevel,
              competencyCode: input.competencyCode,
              limit: input.count,
            },
            userId
          );
          return {
            success: true,
            agentId: this.definition.id,
            data: { lessons, count: lessons.length },
            executionTimeMs: Date.now() - startTime,
          };
        }

        case 'get_lesson': {
          if (!input.lessonId) {
            return {
              success: false,
              agentId: this.definition.id,
              error: 'Field "lessonId" is required for action "get_lesson".',
              executionTimeMs: Date.now() - startTime,
            };
          }
          const lesson = await this.tuklasManager.getLessonById(input.lessonId, userId);
          return {
            success: Boolean(lesson),
            agentId: this.definition.id,
            data: lesson,
            executionTimeMs: Date.now() - startTime,
          };
        }

        case 'create_lesson': {
          if (!input.lessonData) {
            return {
              success: false,
              agentId: this.definition.id,
              error: 'Field "lessonData" is required for action "create_lesson".',
              executionTimeMs: Date.now() - startTime,
            };
          }
          const lesson = await this.tuklasManager.createLesson(input.lessonData, userId);
          return {
            success: true,
            agentId: this.definition.id,
            data: lesson,
            executionTimeMs: Date.now() - startTime,
          };
        }

        case 'check_progress': {
          if (!input.studentId) {
            return {
              success: false,
              agentId: this.definition.id,
              error: 'Field "studentId" is required for action "check_progress".',
              executionTimeMs: Date.now() - startTime,
            };
          }
          const progress = await this.tuklasManager.getStudentProgress(input.studentId, userId);
          return {
            success: Boolean(progress),
            agentId: this.definition.id,
            data: progress,
            executionTimeMs: Date.now() - startTime,
          };
        }

        case 'create_practice': {
          const practice = await this.tuklasManager.generatePractice(
            {
              competencyCode: input.competencyCode,
              difficulty: input.difficulty,
              count: input.count,
              subject: input.subject,
            },
            userId
          );
          return {
            success: true,
            agentId: this.definition.id,
            data: practice,
            executionTimeMs: Date.now() - startTime,
          };
        }

        case 'evaluate_assessment': {
          if (!input.assessmentId || !input.answers || !input.studentId) {
            return {
              success: false,
              agentId: this.definition.id,
              error: 'Fields "assessmentId", "studentId", and "answers" are required for action "evaluate_assessment".',
              executionTimeMs: Date.now() - startTime,
            };
          }
          const result = await this.tuklasManager.evaluateAssessment(
            {
              assessmentId: input.assessmentId,
              studentId: input.studentId,
              answers: input.answers,
            },
            userId
          );
          return {
            success: true,
            agentId: this.definition.id,
            data: result,
            executionTimeMs: Date.now() - startTime,
          };
        }

        case 'analyze_mistakes': {
          if (!input.competencyCode || !input.wrongAnswer || !input.correctAnswer) {
            return {
              success: false,
              agentId: this.definition.id,
              error: 'Fields "competencyCode", "wrongAnswer", and "correctAnswer" are required for action "analyze_mistakes".',
              executionTimeMs: Date.now() - startTime,
            };
          }
          const analysis = await this.tuklasManager.analyzeMistake(
            {
              studentId: input.studentId,
              competencyCode: input.competencyCode,
              question: input.question || 'Practice question',
              wrongAnswer: input.wrongAnswer,
              correctAnswer: input.correctAnswer,
            },
            userId
          );
          return {
            success: true,
            agentId: this.definition.id,
            data: analysis,
            executionTimeMs: Date.now() - startTime,
          };
        }

        case 'get_research_data': {
          const research = await this.tuklasManager.getCohortResearchData(input.cohortId, userId);
          return {
            success: true,
            agentId: this.definition.id,
            data: research,
            executionTimeMs: Date.now() - startTime,
          };
        }

        case 'create_assignment': {
          if (!input.classId || !input.title || !input.competencyCode || !input.dueDate) {
            return {
              success: false,
              agentId: this.definition.id,
              error: 'Fields "classId", "title", "competencyCode", and "dueDate" are required for action "create_assignment".',
              executionTimeMs: Date.now() - startTime,
            };
          }
          const assignment = await this.tuklasManager.createAssignment(
            {
              classId: input.classId,
              title: input.title,
              lessonId: input.lessonId,
              competencyCode: input.competencyCode,
              dueDate: input.dueDate,
              instructions: input.instructions,
            },
            userId
          );
          return {
            success: true,
            agentId: this.definition.id,
            data: assignment,
            executionTimeMs: Date.now() - startTime,
          };
        }

        case 'list_assignments': {
          const assignments = await this.tuklasManager.listAssignments(input.classId, userId);
          return {
            success: true,
            agentId: this.definition.id,
            data: { assignments, count: assignments.length },
            executionTimeMs: Date.now() - startTime,
          };
        }

        default:
          return {
            success: false,
            agentId: this.definition.id,
            error: `Unsupported action: "${input.action}"`,
            executionTimeMs: Date.now() - startTime,
          };
      }
    } catch (err: any) {
      return {
        success: false,
        agentId: this.definition.id,
        error: err.message,
        executionTimeMs: Date.now() - startTime,
      };
    }
  }
}
