import { describe, it, expect, beforeEach } from 'vitest';
import { UserProfileManager } from '../../src/profile/profile-manager.js';
import { InMemoryUserProfileStore } from '../../src/profile/profile-store.js';
import { AuditLogger } from '../../src/audit/audit-logger.js';
import { ValidationError, NotFoundError } from '../../src/utils/errors.js';

describe('Phase 3 User Profile & Personal Identity Tests', () => {
  let profileManager: UserProfileManager;
  let auditLogger: AuditLogger;

  beforeEach(() => {
    auditLogger = new AuditLogger();
    profileManager = new UserProfileManager({
      store: new InMemoryUserProfileStore(true),
      auditLogger,
    });
  });

  it('initializes and returns default user profile for Dwight', async () => {
    const profile = await profileManager.getProfile('default_user');

    expect(profile).toBeDefined();
    expect(profile.identity.name).toBe('Dwight');
    expect(profile.identity.role).toContain('Lead Engineer');
    expect(profile.goals.length).toBeGreaterThanOrEqual(3);
    expect(profile.projects.length).toBeGreaterThanOrEqual(2);
    expect(profile.studyAreas.length).toBeGreaterThanOrEqual(3);
  });

  it('updates user identity and increments profile version', async () => {
    const initial = await profileManager.getProfile('default_user');
    const initialVersion = initial.version;

    const updated = await profileManager.updateIdentity('default_user', {
      role: 'Principal Architect & AI Researcher',
      preferredName: 'Dwight (Sir Dwight)',
    });

    expect(updated.version).toBe(initialVersion + 1);
    expect(updated.identity.role).toBe('Principal Architect & AI Researcher');
    expect(updated.identity.preferredName).toBe('Dwight (Sir Dwight)');
    expect(updated.identity.name).toBe('Dwight');
  });

  it('updates communication and learning preferences', async () => {
    const updated = await profileManager.updateCommunication('default_user', {
      tone: 'academic',
      proactivity: 'proactive',
    });

    expect(updated.communication.tone).toBe('academic');
    expect(updated.communication.proactivity).toBe('proactive');

    const updatedLearning = await profileManager.updateLearning('default_user', {
      preferredStyle: 'worked_examples',
      explanationDepth: 'rigorous_mathematical',
    });

    expect(updatedLearning.learning.preferredStyle).toBe('worked_examples');
    expect(updatedLearning.learning.explanationDepth).toBe('rigorous_mathematical');
  });

  it('performs full CRUD lifecycle on user goals', async () => {
    // 1. Create Goal
    const goal = await profileManager.addGoal('default_user', {
      title: 'Master Linear Algebra for AI',
      description: 'Cover eigenvalues, SVD, and vector spaces for machine learning.',
      category: 'learning',
      priority: 'high',
      status: 'in_progress',
      milestones: [{ id: 'm1', description: 'Complete SVD chapter', completed: false }],
    });

    expect(goal.id).toMatch(/^goal_/);
    expect(goal.title).toBe('Master Linear Algebra for AI');

    // 2. Update Goal
    const updatedGoal = await profileManager.updateGoal('default_user', goal.id, {
      status: 'achieved',
      milestones: [{ id: 'm1', description: 'Complete SVD chapter', completed: true }],
    });

    expect(updatedGoal.status).toBe('achieved');
    expect(updatedGoal.milestones[0].completed).toBe(true);

    // 3. Delete Goal
    const deleted = await profileManager.deleteGoal('default_user', goal.id);
    expect(deleted).toBe(true);

    // 4. Verify Not Found on subsequent update
    await expect(
      profileManager.updateGoal('default_user', goal.id, { status: 'in_progress' })
    ).rejects.toThrow(NotFoundError);
  });

  it('validates goal and project inputs', async () => {
    await expect(
      profileManager.addGoal('default_user', {
        title: '',
        description: 'Empty title goal',
        category: 'personal',
        priority: 'low',
        status: 'not_started',
        milestones: [],
      })
    ).rejects.toThrow(ValidationError);

    await expect(
      profileManager.addProject('default_user', {
        name: '   ',
        description: 'Empty name project',
        role: 'Lead',
        tags: [],
        status: 'active',
        associatedGoals: [],
      })
    ).rejects.toThrow(ValidationError);
  });

  it('performs full CRUD lifecycle on projects and study areas', async () => {
    // Project
    const project = await profileManager.addProject('default_user', {
      name: 'Research Thesis',
      description: 'Educational technology and AI in mathematics education.',
      role: 'Principal Researcher',
      tags: ['Thesis', 'Education', 'AI'],
      status: 'active',
      associatedGoals: [],
    });
    expect(project.id).toMatch(/^proj_/);

    const updatedProj = await profileManager.updateProject('default_user', project.id, {
      status: 'completed',
    });
    expect(updatedProj.status).toBe('completed');

    const projDeleted = await profileManager.deleteProject('default_user', project.id);
    expect(projDeleted).toBe(true);

    // Study Area
    const study = await profileManager.addStudyArea('default_user', {
      domain: 'education_let',
      title: 'Foundations of Special Education',
      currentTopic: 'Inclusive education policies',
      focusAreas: ['SPED', 'Policies'],
      masteryLevel: 'intermediate',
      notes: 'Review for LET General and Professional Ed.',
    });
    expect(study.id).toMatch(/^study_/);

    const updatedStudy = await profileManager.updateStudyArea('default_user', study.id, {
      masteryLevel: 'advanced',
    });
    expect(updatedStudy.masteryLevel).toBe('advanced');

    const studyDeleted = await profileManager.deleteStudyArea('default_user', study.id);
    expect(studyDeleted).toBe(true);
  });

  it('audit logs changes to permission preferences', async () => {
    const updated = await profileManager.updatePermissionPreferences('default_user', {
      defaultRiskPolicy: 'strict',
      requireExplicitConfirmationForHighRisk: true,
    });

    expect(updated.permissionPreferences.defaultRiskPolicy).toBe('strict');

    const auditEvents = await auditLogger.query({ user: 'default_user' });
    const permEvent = auditEvents.find((e) => e.reason.includes('permission policy'));
    expect(permEvent).toBeDefined();
    expect(permEvent?.permissionRequired).toBe('ADMIN');
  });

  it('distills user profile into high-signal prompt context for AI guidance', async () => {
    const promptContext = await profileManager.getPromptContext('default_user');

    expect(promptContext).toContain('[USER IDENTITY & PROFILE CONTEXT]');
    expect(promptContext).toContain('Assisting: Dwight');
    expect(promptContext).toContain('Role: Lead Engineer');
    expect(promptContext).toContain('[ACTIVE USER GOALS]');
    expect(promptContext).toContain('LET Licensure Examination');
    expect(promptContext).toContain('[ACTIVE USER PROJECTS]');
    expect(promptContext).toContain('JARVIS');
    expect(promptContext).toContain('Tuklas');
    expect(promptContext).toContain('[CURRENT STUDY & REVIEW TRACKS]');
    expect(promptContext).toContain('Higher Mathematics');
  });

  it('strictly distinguishes temporary conversation context from persistent user profile', async () => {
    const distinction = await profileManager.getContextDistinction('default_user', {
      sessionId: 'sess_temp_12345',
      messageCount: 5,
      ephemeralTopics: ['Calculus question on derivatives'],
      scratchpadNotes: ['Intermediate step: dy/dx = 2x'],
    });

    // Verify temporary conversation state is ephemeral
    expect(distinction.temporaryConversation.sessionId).toBe('sess_temp_12345');
    expect(distinction.temporaryConversation.recentMessageCount).toBe(5);
    expect(distinction.temporaryConversation.ephemeralTopics).toContain('Calculus question on derivatives');
    expect(distinction.temporaryConversation.scratchpadNotes).toContain('Intermediate step: dy/dx = 2x');

    // Verify persistent user information is long-term
    expect(distinction.persistentUserInformation.userName).toBe('Dwight');
    expect(distinction.persistentUserInformation.activeProjects).toContain('JARVIS');
    expect(distinction.persistentUserInformation.activeProjects).toContain('Tuklas');
    expect(distinction.persistentUserInformation.activeGoals.length).toBeGreaterThan(0);
    expect(distinction.persistentUserInformation.activeStudyTracks.length).toBeGreaterThan(0);
  });
});
