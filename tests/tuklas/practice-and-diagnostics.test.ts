/**
 * JARVIS Phase 12 - Practice, Assessment, Diagnostics & Agent Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { TuklasStore } from '../../src/tuklas/tuklas-store.js';
import { TuklasClient } from '../../src/tuklas/tuklas-client.js';
import { TuklasManager } from '../../src/tuklas/tuklas-manager.js';
import { TuklasAgent } from '../../src/tuklas/tuklas-agent.js';
import { createTuklasTools } from '../../src/tuklas/tuklas-tools.js';
import { PermissionManager } from '../../src/security/permission-manager.js';
import { SecurityGuardian } from '../../src/security/guardian.js';
import { AuditLogger } from '../../src/audit/audit-logger.js';
import { ResourceType, PermissionLevel } from '../../src/security/types.js';

describe('Phase 12 - Practice, Assessment, Diagnostics & Agent Tests', () => {
  let store: TuklasStore;
  let client: TuklasClient;
  let permissionManager: PermissionManager;
  let guardian: SecurityGuardian;
  let auditLogger: AuditLogger;
  let manager: TuklasManager;
  let agent: TuklasAgent;

  beforeEach(() => {
    store = new TuklasStore();
    client = new TuklasClient({}, store);
    permissionManager = new PermissionManager();
    guardian = new SecurityGuardian();
    auditLogger = new AuditLogger();

    permissionManager.grantPermission({
      userId: 'test_user',
      resource: ResourceType.TUKLAS,
      level: PermissionLevel.WRITE,
      allowedActions: ['read', 'write', 'execute'],
      grantedBy: 'system',
    });

    manager = new TuklasManager(client, permissionManager, guardian, auditLogger);
    agent = new TuklasAgent(manager);
  });

  describe('Adaptive Practice Generator', () => {
    it('generates practice items with hints and step-by-step explanations', async () => {
      const practice = await manager.generatePractice(
        { competencyCode: 'M8AL-Ia-b-1', count: 2 },
        'test_user'
      );

      expect(practice.id).toBeDefined();
      expect(practice.competencyCode).toBe('M8AL-Ia-b-1');
      expect(practice.items.length).toBeGreaterThanOrEqual(1);

      const firstItem = practice.items[0];
      expect(firstItem.question).toBeDefined();
      expect(firstItem.hint).toBeDefined();
      expect(firstItem.explanation).toBeDefined();
    });

    it('filters practice items by difficulty level', async () => {
      const easyPractice = await manager.generatePractice(
        { difficulty: 'easy', count: 2 },
        'test_user'
      );
      expect(easyPractice.items.length).toBeGreaterThan(0);
      expect(easyPractice.items.every((i) => i.difficulty === 'easy')).toBe(true);
    });
  });

  describe('Assessment Evaluation', () => {
    it('evaluates submitted answers against answer key and calculates passing score', async () => {
      const result = await manager.evaluateAssessment(
        {
          assessmentId: 'assess_math_g8',
          studentId: 'student_dwight',
          answers: {
            item_alg_01: 'C',
            item_poly_02: 'B',
            item_poly_03: 'B',
          },
        },
        'test_user'
      );

      expect(result.totalItems).toBe(3);
      expect(result.score).toBe(3);
      expect(result.percentage).toBe(100);
      expect(result.passed).toBe(true);
      expect(result.details.every((d) => d.isCorrect)).toBe(true);
    });

    it('marks assessment failed when score falls below passing threshold', async () => {
      const result = await manager.evaluateAssessment(
        {
          assessmentId: 'assess_math_g8',
          studentId: 'student_juan',
          answers: {
            item_alg_01: 'A', // Wrong
            item_poly_02: 'A', // Wrong
            item_poly_03: 'B', // Correct
          },
        },
        'test_user'
      );

      expect(result.score).toBe(1);
      expect(result.percentage).toBe(33);
      expect(result.passed).toBe(false);
    });
  });

  describe('Mistake & Learning Diagnostics', () => {
    it('analyzes sign misconceptions in factoring and links remedial lesson', async () => {
      const analysis = await manager.analyzeMistake(
        {
          studentId: 'student_juan',
          competencyCode: 'M8AL-Ia-b-1',
          question: 'Factor completely: 25x² - 64y²',
          wrongAnswer: '(5x + 8y)²',
          correctAnswer: '(5x - 8y)(5x + 8y)',
        },
        'test_user'
      );

      expect(analysis.errorType).toBe('conceptual');
      expect(analysis.misconceptionDescription).toContain('Sign error');
      expect(analysis.remedialExplanation).toContain('difference of two squares');
      expect(analysis.recommendedLessonId).toBe('lesson_poly_02');
      expect(analysis.recommendedLessonTitle).toContain('Factoring Polynomials');
      expect(analysis.practiceSuggestions.length).toBeGreaterThan(0);
    });

    it('identifies order of operations errors in algebra expressions', async () => {
      const analysis = await manager.analyzeMistake(
        {
          competencyCode: 'M7AL-IIa-1',
          question: 'Evaluate 4a² - 2b + 7',
          wrongAnswer: '23',
          correctAnswer: '53',
        },
        'test_user'
      );

      expect(analysis.errorType).toBe('procedural');
      expect(analysis.misconceptionDescription).toContain('Order of Operations');
    });
  });

  describe('Cohort Research & Analytics', () => {
    it('retrieves anonymized cohort research data conforming to privacy standards', async () => {
      const data = await manager.getCohortResearchData('cohort_let_math_2025', 'test_user');

      expect(data.cohortId).toBe('cohort_let_math_2025');
      expect(data.studentCount).toBeGreaterThan(0);
      expect(data.averageScore).toBeGreaterThan(0);
      expect(data.passingRate).toBeGreaterThan(0);

      // Verify PII anonymization
      expect(data.records.length).toBeGreaterThan(0);
      expect(data.records[0].anonymizedId).toMatch(/^anon_st_/);

      // Verify item difficulty and discrimination indices
      expect(data.competencyMetrics.length).toBeGreaterThan(0);
      expect(data.competencyMetrics[0].discriminationIndex).toBeDefined();
    });
  });

  describe('Teacher Tasks & Assignments', () => {
    it('creates and lists assignments for student cohorts', async () => {
      const assignment = await manager.createAssignment(
        {
          classId: 'class_section_gauss',
          title: 'Polynomial Factoring Problem Set',
          competencyCode: 'M8AL-Ia-b-1',
          dueDate: '2025-04-01T23:59:59.000Z',
          instructions: 'Complete practice set with score >= 80%.',
        },
        'test_user'
      );

      expect(assignment.id).toBeDefined();
      expect(assignment.classId).toBe('class_section_gauss');

      const list = await manager.listAssignments('class_section_gauss', 'test_user');
      expect(list.length).toBe(1);
      expect(list[0].title).toBe('Polynomial Factoring Problem Set');
    });
  });

  describe('TuklasAgent Execution', () => {
    it('executes actions through the IAgent interface', async () => {
      const context = {
        requestId: 'req_agent_test',
        userId: 'test_user',
        sessionId: 'sess_1',
        grantedPermissions: [],
      };

      const resStatus = await agent.execute({ action: 'get_status' }, context);
      expect(resStatus.success).toBe(true);
      expect(resStatus.agentId).toBe('tuklas-agent');
      expect((resStatus.data as any).totalLessons).toBeGreaterThan(0);

      const resPractice = await agent.execute(
        { action: 'create_practice', competencyCode: 'M9AL-Ia-b-1', count: 1 },
        context
      );
      expect(resPractice.success).toBe(true);
      expect((resPractice.data as any).items.length).toBeGreaterThan(0);

      const resMistake = await agent.execute(
        {
          action: 'analyze_mistakes',
          competencyCode: 'M8AL-Ia-b-1',
          wrongAnswer: 'a + b',
          correctAnswer: 'a - b',
        },
        context
      );
      expect(resMistake.success).toBe(true);
      expect((resMistake.data as any).recommendedLessonId).toBeDefined();
    });
  });

  describe('Tuklas Tools Execution', () => {
    it('executes registered tools through ITool interface', async () => {
      const tools = createTuklasTools(manager);
      expect(tools.length).toBe(8);

      const searchTool = tools.find((t) => t.definition.id === 'tuklas.search_lessons')!;
      const toolRes = await searchTool.execute(
        { query: 'algebra' },
        { requestId: 'req_1', userId: 'test_user', sessionId: 'sess_1', permissionVerified: true }
      );

      expect(toolRes.success).toBe(true);
      expect(toolRes.verified).toBe(true);
      expect((toolRes.data as any).count).toBeGreaterThan(0);
    });
  });
});
