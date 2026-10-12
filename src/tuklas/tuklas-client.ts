/**
 * JARVIS Phase 12 - Tuklas API Client / Service Adapter
 * Bridges JARVIS Core to remote Tuklas backend or embedded local data store.
 */

import {
  TuklasLesson,
  TuklasLessonFilter,
  StudentProgress,
  PracticeSet,
  PracticeGenerationRequest,
  AssessmentSubmission,
  AssessmentEvaluationResult,
  MistakeAnalysisRequest,
  MistakeAnalysisResult,
  TuklasCohortResearchData,
  TeacherAssignment,
  TeacherAssignmentRequest,
  TuklasClientConfig,
  TuklasSystemStatus,
} from './tuklas.interface.js';
import { TuklasStore } from './tuklas-store.js';
import { logger } from '../utils/logger.js';

export class TuklasClient {
  private config: TuklasClientConfig;
  private localStore: TuklasStore;

  constructor(config: TuklasClientConfig = {}, localStore?: TuklasStore) {
    this.config = {
      apiUrl: config.apiUrl || process.env.TUKLAS_API_URL,
      apiKey: config.apiKey || process.env.TUKLAS_API_KEY,
      mode: config.mode || (process.env.TUKLAS_API_URL ? 'remote' : 'local'),
      timeoutMs: config.timeoutMs || 10000,
    };
    this.localStore = localStore || new TuklasStore();
  }

  public getStatus(): TuklasSystemStatus {
    return {
      mode: this.config.mode || 'local',
      connected: true,
      endpoint: this.config.apiUrl || 'embedded://tuklas-local-store',
      totalLessons: this.localStore.countLessons(),
      totalStudents: this.localStore.countStudents(),
      totalAssignments: this.localStore.countAssignments(),
      version: '1.2.0-philippine-deped',
    };
  }

  // ==================== LESSONS ====================

  public async searchLessons(filter: TuklasLessonFilter = {}): Promise<TuklasLesson[]> {
    if (this.config.mode === 'remote' && this.config.apiUrl) {
      try {
        const url = new URL(`${this.config.apiUrl}/lessons/search`);
        if (filter.query) url.searchParams.set('q', filter.query);
        if (filter.subject) url.searchParams.set('subject', filter.subject);
        if (filter.gradeLevel) url.searchParams.set('gradeLevel', filter.gradeLevel);
        if (filter.competencyCode) url.searchParams.set('competencyCode', filter.competencyCode);
        if (filter.limit) url.searchParams.set('limit', String(filter.limit));

        const res = await fetch(url.toString(), {
          headers: {
            Authorization: `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json',
          },
          signal: AbortSignal.timeout(this.config.timeoutMs || 10000),
        });

        if (res.ok) {
          const json = (await res.json()) as any;
          return json.lessons || json;
        }
      } catch (err: any) {
        logger.warn(`Remote Tuklas API failed (${err.message}), falling back to local store.`);
      }
    }

    return this.localStore.searchLessons(filter);
  }

  public async getLessonById(id: string): Promise<TuklasLesson | undefined> {
    if (this.config.mode === 'remote' && this.config.apiUrl) {
      try {
        const res = await fetch(`${this.config.apiUrl}/lessons/${id}`, {
          headers: { Authorization: `Bearer ${this.config.apiKey}` },
          signal: AbortSignal.timeout(this.config.timeoutMs || 10000),
        });
        if (res.ok) {
          return (await res.json()) as TuklasLesson;
        }
      } catch (err: any) {
        logger.warn(`Remote Tuklas API failed (${err.message}), falling back to local store.`);
      }
    }

    return this.localStore.getLessonById(id);
  }

  public async createLesson(lesson: Omit<TuklasLesson, 'id' | 'createdAt'>): Promise<TuklasLesson> {
    if (this.config.mode === 'remote' && this.config.apiUrl) {
      try {
        const res = await fetch(`${this.config.apiUrl}/lessons`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(lesson),
          signal: AbortSignal.timeout(this.config.timeoutMs || 10000),
        });
        if (res.ok) {
          return (await res.json()) as TuklasLesson;
        }
      } catch (err: any) {
        logger.warn(`Remote Tuklas API failed (${err.message}), falling back to local store.`);
      }
    }

    return this.localStore.createLesson(lesson);
  }

  // ==================== STUDENTS ====================

  public async getStudentProgress(studentId: string): Promise<StudentProgress | undefined> {
    if (this.config.mode === 'remote' && this.config.apiUrl) {
      try {
        const res = await fetch(`${this.config.apiUrl}/students/${studentId}/progress`, {
          headers: { Authorization: `Bearer ${this.config.apiKey}` },
          signal: AbortSignal.timeout(this.config.timeoutMs || 10000),
        });
        if (res.ok) {
          return (await res.json()) as StudentProgress;
        }
      } catch (err: any) {
        logger.warn(`Remote Tuklas API failed (${err.message}), falling back to local store.`);
      }
    }

    return this.localStore.getStudentProgress(studentId);
  }

  // ==================== PRACTICE ====================

  public async generatePractice(req: PracticeGenerationRequest = {}): Promise<PracticeSet> {
    if (this.config.mode === 'remote' && this.config.apiUrl) {
      try {
        const res = await fetch(`${this.config.apiUrl}/practice/generate`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(req),
          signal: AbortSignal.timeout(this.config.timeoutMs || 10000),
        });
        if (res.ok) {
          return (await res.json()) as PracticeSet;
        }
      } catch (err: any) {
        logger.warn(`Remote Tuklas API failed (${err.message}), falling back to local store.`);
      }
    }

    return this.localStore.generatePractice(req);
  }

  // ==================== ASSESSMENT ====================

  public async evaluateAssessment(submission: AssessmentSubmission): Promise<AssessmentEvaluationResult> {
    if (this.config.mode === 'remote' && this.config.apiUrl) {
      try {
        const res = await fetch(`${this.config.apiUrl}/assessments/evaluate`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(submission),
          signal: AbortSignal.timeout(this.config.timeoutMs || 10000),
        });
        if (res.ok) {
          return (await res.json()) as AssessmentEvaluationResult;
        }
      } catch (err: any) {
        logger.warn(`Remote Tuklas API failed (${err.message}), falling back to local store.`);
      }
    }

    return this.localStore.evaluateAssessment(submission);
  }

  // ==================== MISTAKE ANALYSIS ====================

  public async analyzeMistake(req: MistakeAnalysisRequest): Promise<MistakeAnalysisResult> {
    if (this.config.mode === 'remote' && this.config.apiUrl) {
      try {
        const res = await fetch(`${this.config.apiUrl}/diagnostics/mistakes`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(req),
          signal: AbortSignal.timeout(this.config.timeoutMs || 10000),
        });
        if (res.ok) {
          return (await res.json()) as MistakeAnalysisResult;
        }
      } catch (err: any) {
        logger.warn(`Remote Tuklas API failed (${err.message}), falling back to local store.`);
      }
    }

    return this.localStore.analyzeMistake(req);
  }

  // ==================== RESEARCH DATA ====================

  public async getCohortResearchData(cohortId?: string): Promise<TuklasCohortResearchData> {
    if (this.config.mode === 'remote' && this.config.apiUrl) {
      try {
        const res = await fetch(`${this.config.apiUrl}/research/cohort/${cohortId || 'default'}`, {
          headers: { Authorization: `Bearer ${this.config.apiKey}` },
          signal: AbortSignal.timeout(this.config.timeoutMs || 10000),
        });
        if (res.ok) {
          return (await res.json()) as TuklasCohortResearchData;
        }
      } catch (err: any) {
        logger.warn(`Remote Tuklas API failed (${err.message}), falling back to local store.`);
      }
    }

    return this.localStore.getCohortResearchData(cohortId);
  }

  // ==================== TEACHER ASSIGNMENTS ====================

  public async createAssignment(req: TeacherAssignmentRequest, teacherId: string): Promise<TeacherAssignment> {
    if (this.config.mode === 'remote' && this.config.apiUrl) {
      try {
        const res = await fetch(`${this.config.apiUrl}/assignments`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ...req, teacherId }),
          signal: AbortSignal.timeout(this.config.timeoutMs || 10000),
        });
        if (res.ok) {
          return (await res.json()) as TeacherAssignment;
        }
      } catch (err: any) {
        logger.warn(`Remote Tuklas API failed (${err.message}), falling back to local store.`);
      }
    }

    return this.localStore.createAssignment(req, teacherId);
  }

  public async listAssignments(classId?: string): Promise<TeacherAssignment[]> {
    return this.localStore.listAssignments(classId);
  }
}
