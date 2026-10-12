/**
 * JARVIS Phase 12 - Tuklas Lessons, Curriculum & Student Progress Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { TuklasStore } from '../../src/tuklas/tuklas-store.js';
import { TuklasClient } from '../../src/tuklas/tuklas-client.js';
import { TuklasManager } from '../../src/tuklas/tuklas-manager.js';
import { PermissionManager } from '../../src/security/permission-manager.js';
import { SecurityGuardian } from '../../src/security/guardian.js';
import { AuditLogger } from '../../src/audit/audit-logger.js';
import { ResourceType, PermissionLevel } from '../../src/security/types.js';

describe('Phase 12 - Tuklas Lessons & Student Progress Tests', () => {
  let store: TuklasStore;
  let client: TuklasClient;
  let permissionManager: PermissionManager;
  let guardian: SecurityGuardian;
  let auditLogger: AuditLogger;
  let manager: TuklasManager;

  beforeEach(() => {
    store = new TuklasStore();
    client = new TuklasClient({}, store);
    permissionManager = new PermissionManager();
    guardian = new SecurityGuardian();
    auditLogger = new AuditLogger();

    // Default authorized grants
    permissionManager.grantPermission({
      userId: 'test_user',
      resource: ResourceType.TUKLAS,
      level: PermissionLevel.WRITE,
      allowedActions: ['read', 'write', 'execute'],
      grantedBy: 'system',
    });

    manager = new TuklasManager(client, permissionManager, guardian, auditLogger);
  });

  describe('Tuklas Store & System Status', () => {
    it('initializes with seed Philippine DepEd and BLEPT lessons and student records', () => {
      const status = manager.getStatus();
      expect(status.mode).toBe('local');
      expect(status.connected).toBe(true);
      expect(status.totalLessons).toBeGreaterThanOrEqual(6);
      expect(status.totalStudents).toBeGreaterThanOrEqual(3);
      expect(status.version).toContain('philippine-deped');
    });
  });

  describe('Curriculum & Lesson Search', () => {
    it('searches lessons by subject and grade level', async () => {
      const g7Lessons = await manager.searchLessons({ gradeLevel: 'Grade 7' }, 'test_user');
      expect(g7Lessons.length).toBeGreaterThanOrEqual(1);
      expect(g7Lessons[0].competencyCode).toBe('M7AL-IIa-1');
      expect(g7Lessons[0].title).toContain('Evaluating Algebraic Expressions');
    });

    it('searches lessons by Philippine competency code', async () => {
      const polyLessons = await manager.searchLessons({ competencyCode: 'M8AL-Ia-b-1' }, 'test_user');
      expect(polyLessons.length).toBe(1);
      expect(polyLessons[0].title).toContain('Factoring Polynomials');
      expect(polyLessons[0].objectives.length).toBeGreaterThan(0);
    });

    it('retrieves lesson by ID with full markdown and prerequisites', async () => {
      const lesson = await manager.getLessonById('lesson_quad_03', 'test_user');
      expect(lesson).toBeDefined();
      expect(lesson?.title).toContain('Quadratic Equations');
      expect(lesson?.contentMarkdown).toContain('Discriminant');
      expect(lesson?.prerequisiteCompetencies).toContain('M8AL-Ia-b-1');
    });

    it('creates a new lesson with authorized teacher WRITE permission', async () => {
      const created = await manager.createLesson(
        {
          title: 'Special Angles in Trigonometry',
          subject: 'Mathematics',
          gradeLevel: 'Grade 9',
          competencyCode: 'M9GE-IVa-1',
          summary: 'Compute exact values for 30, 45, and 60 degree trigonometric ratios.',
          objectives: ['Derive trigonometric ratios of special angles', 'Evaluate sine, cosine, tangent without calculators'],
          prerequisiteCompetencies: ['Pythagorean Theorem', 'Special Right Triangles'],
          contentMarkdown: '# Special Angles\n\nExact values for 30°, 45°, 60°.',
          estimatedMinutes: 35,
          tags: ['trigonometry', 'angles', 'deped-g9'],
          author: 'Teacher Dwight',
        },
        'test_user'
      );

      expect(created.id).toBeDefined();
      expect(created.competencyCode).toBe('M9GE-IVa-1');

      const found = await manager.getLessonById(created.id, 'test_user');
      expect(found).toBeDefined();
      expect(found?.title).toBe('Special Angles in Trigonometry');
    });
  });

  describe('Student Progress & Mastery Heatmap', () => {
    it('retrieves detailed student progress and learning streaks', async () => {
      const progress = await manager.getStudentProgress('student_dwight', 'test_user');
      expect(progress).toBeDefined();
      expect(progress?.studentName).toContain('Dwight');
      expect(progress?.overallMasteryPercent).toBe(94);
      expect(progress?.streakDays).toBe(14);
      expect(progress?.competencyScores['LET-MATH-02']).toBe(94);
    });

    it('identifies student learning gaps from competency scores', async () => {
      const juan = await manager.getStudentProgress('student_juan', 'test_user');
      expect(juan).toBeDefined();
      expect(juan?.overallMasteryPercent).toBe(68);
      expect(juan?.competencyScores['M8AL-Ia-b-1']).toBe(60); // Low mastery in factoring polynomials
    });
  });

  describe('Permission & Security Gating', () => {
    it('denies lesson search and progress query to unauthorized users without READ on TUKLAS', async () => {
      await expect(
        manager.searchLessons({}, 'unauthorized_attacker')
      ).rejects.toThrow('Permission Denied on TUKLAS');

      await expect(
        manager.getStudentProgress('student_dwight', 'unauthorized_attacker')
      ).rejects.toThrow('Permission Denied on TUKLAS');
    });

    it('denies lesson creation if user only has READ but lacks WRITE', async () => {
      permissionManager.grantPermission({
        userId: 'student_only',
        resource: ResourceType.TUKLAS,
        level: PermissionLevel.READ,
        allowedActions: ['read'],
        grantedBy: 'system',
      });

      await expect(
        manager.createLesson(
          {
            title: 'Hacked Lesson',
            subject: 'Math',
            gradeLevel: 'G8',
            competencyCode: 'HACK-01',
            summary: 'unauthorized',
            objectives: [],
            prerequisiteCompetencies: [],
            contentMarkdown: 'evil',
            estimatedMinutes: 10,
            tags: [],
            author: 'attacker',
          },
          'student_only'
        )
      ).rejects.toThrow('Permission Denied on TUKLAS');
    });
  });
});
