/**
 * JARVIS Phase 12 - Tuklas EdTech Integration Manager
 * Coordinates Tuklas operations, security guardian checks, permissions, and audit logging.
 */

import { TuklasClient } from './tuklas-client.js';
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
  TuklasSystemStatus,
} from './tuklas.interface.js';
import { PermissionManager } from '../security/permission-manager.js';
import { SecurityGuardian } from '../security/guardian.js';
import { AuditLogger } from '../audit/audit-logger.js';
import {
  ResourceType,
  PermissionLevel,
  PermissionAction,
  SecurityDecisionType,
} from '../security/types.js';
import { logger } from '../utils/logger.js';

export class TuklasManager {
  private client: TuklasClient;
  private permissionManager: PermissionManager;
  private guardian: SecurityGuardian;
  private auditLogger: AuditLogger;

  constructor(
    client: TuklasClient,
    permissionManager: PermissionManager,
    guardian: SecurityGuardian,
    auditLogger: AuditLogger
  ) {
    this.client = client;
    this.permissionManager = permissionManager;
    this.guardian = guardian;
    this.auditLogger = auditLogger;
  }

  public getStatus(): TuklasSystemStatus {
    return this.client.getStatus();
  }

  // ==================== LESSON OPERATIONS ====================

  public async searchLessons(filter: TuklasLessonFilter, userId: string = 'default_user'): Promise<TuklasLesson[]> {
    this.assertPermission(userId, 'read', PermissionLevel.READ, 'search_lessons');
    this.assertGuardian(userId, 'read', 'search_lessons');

    this.recordAudit(userId, 'read', PermissionLevel.READ, 'Search lessons', { filter });

    return this.client.searchLessons(filter);
  }

  public async getLessonById(id: string, userId: string = 'default_user'): Promise<TuklasLesson | undefined> {
    this.assertPermission(userId, 'read', PermissionLevel.READ, `lesson:${id}`);
    this.assertGuardian(userId, 'read', `lesson:${id}`);

    const lesson = await this.client.getLessonById(id);

    this.recordAudit(userId, 'read', PermissionLevel.READ, `Get lesson ${id}`, {
      lessonId: id,
      found: Boolean(lesson),
    });

    return lesson;
  }

  public async createLesson(
    lesson: Omit<TuklasLesson, 'id' | 'createdAt'>,
    userId: string = 'default_user'
  ): Promise<TuklasLesson> {
    // Teacher function: requires WRITE on TUKLAS
    this.assertPermission(userId, 'write', PermissionLevel.WRITE, 'create_lesson');
    this.assertGuardian(userId, 'write', 'create_lesson');

    const created = await this.client.createLesson(lesson);

    this.recordAudit(userId, 'write', PermissionLevel.WRITE, 'Create lesson', {
      lessonId: created.id,
      title: created.title,
      competencyCode: created.competencyCode,
    });

    return created;
  }

  // ==================== STUDENT MASTERY & PROGRESS ====================

  public async getStudentProgress(studentId: string, userId: string = 'default_user'): Promise<StudentProgress | undefined> {
    this.assertPermission(userId, 'read', PermissionLevel.READ, `student:${studentId}`);
    this.assertGuardian(userId, 'read', `student:${studentId}`);

    const progress = await this.client.getStudentProgress(studentId);

    this.recordAudit(userId, 'read', PermissionLevel.READ, `Get progress for student ${studentId}`, {
      studentId,
      found: Boolean(progress),
    });

    return progress;
  }

  // ==================== PRACTICE & ASSESSMENTS ====================

  public async generatePractice(
    req: PracticeGenerationRequest,
    userId: string = 'default_user'
  ): Promise<PracticeSet> {
    this.assertPermission(userId, 'read', PermissionLevel.READ, 'generate_practice');
    this.assertGuardian(userId, 'read', 'generate_practice');

    const practiceSet = await this.client.generatePractice(req);

    this.recordAudit(userId, 'read', PermissionLevel.READ, 'Generate practice set', {
      competencyCode: req.competencyCode,
      itemCount: practiceSet.items.length,
    });

    return practiceSet;
  }

  public async evaluateAssessment(
    submission: AssessmentSubmission,
    userId: string = 'default_user'
  ): Promise<AssessmentEvaluationResult> {
    this.assertPermission(userId, 'read', PermissionLevel.READ, `evaluate:${submission.assessmentId}`);
    this.assertGuardian(userId, 'read', `evaluate:${submission.assessmentId}`);

    const result = await this.client.evaluateAssessment(submission);

    this.recordAudit(userId, 'execute', PermissionLevel.READ, `Evaluate assessment ${submission.assessmentId}`, {
      assessmentId: submission.assessmentId,
      studentId: submission.studentId,
      score: result.score,
      passed: result.passed,
    });

    return result;
  }

  // ==================== MISTAKE & DIAGNOSTICS ====================

  public async analyzeMistake(
    req: MistakeAnalysisRequest,
    userId: string = 'default_user'
  ): Promise<MistakeAnalysisResult> {
    this.assertPermission(userId, 'read', PermissionLevel.READ, 'analyze_mistake');
    this.assertGuardian(userId, 'read', 'analyze_mistake');

    const result = await this.client.analyzeMistake(req);

    this.recordAudit(userId, 'read', PermissionLevel.READ, `Analyze mistake for ${req.competencyCode}`, {
      competencyCode: req.competencyCode,
      errorType: result.errorType,
    });

    return result;
  }

  // ==================== RESEARCH DATA ====================

  public async getCohortResearchData(
    cohortId?: string,
    userId: string = 'default_user'
  ): Promise<TuklasCohortResearchData> {
    this.assertPermission(userId, 'read', PermissionLevel.READ, 'cohort_research');
    this.assertGuardian(userId, 'read', 'cohort_research');

    const data = await this.client.getCohortResearchData(cohortId);

    this.recordAudit(userId, 'read', PermissionLevel.READ, 'Extract cohort research data', {
      cohortId: data.cohortId,
      studentCount: data.studentCount,
    });

    return data;
  }

  // ==================== TEACHER FUNCTIONS ====================

  public async createAssignment(
    req: TeacherAssignmentRequest,
    teacherId: string = 'default_user'
  ): Promise<TeacherAssignment> {
    // Teacher function: requires WRITE on TUKLAS
    this.assertPermission(teacherId, 'write', PermissionLevel.WRITE, 'create_assignment');
    this.assertGuardian(teacherId, 'write', 'create_assignment');

    const assignment = await this.client.createAssignment(req, teacherId);

    this.recordAudit(teacherId, 'write', PermissionLevel.WRITE, `Create assignment ${assignment.id}`, {
      assignmentId: assignment.id,
      title: assignment.title,
      classId: assignment.classId,
    });

    return assignment;
  }

  public async listAssignments(classId?: string, userId: string = 'default_user'): Promise<TeacherAssignment[]> {
    this.assertPermission(userId, 'read', PermissionLevel.READ, 'list_assignments');
    this.assertGuardian(userId, 'read', 'list_assignments');

    return this.client.listAssignments(classId);
  }

  private recordAudit(
    user: string,
    action: PermissionAction,
    permissionRequired: PermissionLevel,
    reason: string,
    details?: Record<string, unknown>
  ): void {
    this.auditLogger.log({
      user,
      requestId: `req_tuklas_${Date.now()}`,
      resource: ResourceType.TUKLAS,
      action,
      permissionRequired,
      decision: SecurityDecisionType.ALLOW,
      reason,
      result: 'SUCCESS',
      details,
    });
  }

  // ==================== INTERNAL SECURITY ASSERTIONS ====================

  private assertPermission(
    userId: string,
    action: 'read' | 'write' | 'execute',
    requiredLevel: PermissionLevel,
    targetIdentifier: string
  ): void {
    const permResult = this.permissionManager.checkPermission({
      userId,
      resource: ResourceType.TUKLAS,
      action,
      requiredLevel,
      targetIdentifier,
    });

    if (!permResult.allowed) {
      throw new Error(`Permission Denied on TUKLAS: User "${userId}" lacks required ${requiredLevel} permission.`);
    }
  }

  private assertGuardian(userId: string, action: 'read' | 'write' | 'execute', target: string): void {
    const decision = this.guardian.evaluate({
      resource: ResourceType.TUKLAS,
      action,
      target,
      userId,
    });

    if (decision.decision === SecurityDecisionType.DENY) {
      throw new Error(`Security Guardian blocked Tuklas action: ${decision.reason || 'Threat detected'}`);
    }
  }
}
