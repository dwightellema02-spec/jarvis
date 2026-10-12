import {
  UserProfile,
  UserIdentity,
  CommunicationPreferences,
  LearningPreferences,
  StudyArea,
  UserGoal,
  UserProfileProject,
  PermissionPreferences,
  PersonalSettings,
  ContextDistinction,
} from './types.js';
import { IUserProfileStore, InMemoryUserProfileStore } from './profile-store.js';
import { createDefaultUserProfile } from './default-profile.js';
import { distillUserProfileForPrompt, distillContextDistinction } from './context-distiller.js';
import { AuditLogger } from '../audit/audit-logger.js';
import { ResourceType, PermissionLevel, SecurityDecisionType } from '../security/types.js';
import { ValidationError, NotFoundError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

export interface UserProfileManagerConfig {
  store?: IUserProfileStore;
  auditLogger?: AuditLogger;
}

export class UserProfileManager {
  private store: IUserProfileStore;
  private auditLogger?: AuditLogger;

  constructor(config: UserProfileManagerConfig = {}) {
    this.store = config.store || new InMemoryUserProfileStore();
    this.auditLogger = config.auditLogger;
  }

  public async getProfile(userId = 'default_user'): Promise<UserProfile> {
    let profile = await this.store.get(userId);
    if (!profile) {
      profile = createDefaultUserProfile(userId);
      await this.store.save(profile);
      logger.info(`Initialized new default profile for user: ${userId}`);
    }
    return profile;
  }

  public async updateProfile(
    userId: string,
    updates: Partial<Omit<UserProfile, 'id' | 'createdAt'>>
  ): Promise<UserProfile> {
    const existing = await this.getProfile(userId);
    const updated: UserProfile = {
      ...existing,
      ...updates,
      id: existing.id,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
      version: existing.version + 1,
    };

    await this.store.save(updated);
    logger.info(`Updated user profile for: ${userId} (version: ${updated.version})`);
    return updated;
  }

  public async updateIdentity(userId: string, identity: Partial<UserIdentity>): Promise<UserProfile> {
    const existing = await this.getProfile(userId);
    const updatedIdentity: UserIdentity = {
      ...existing.identity,
      ...identity,
      userId: existing.identity.userId,
    };
    return this.updateProfile(userId, { identity: updatedIdentity });
  }

  public async updateCommunication(
    userId: string,
    communication: Partial<CommunicationPreferences>
  ): Promise<UserProfile> {
    const existing = await this.getProfile(userId);
    const updatedCommunication: CommunicationPreferences = {
      ...existing.communication,
      ...communication,
    };
    return this.updateProfile(userId, { communication: updatedCommunication });
  }

  public async updateLearning(
    userId: string,
    learning: Partial<LearningPreferences>
  ): Promise<UserProfile> {
    const existing = await this.getProfile(userId);
    const updatedLearning: LearningPreferences = {
      ...existing.learning,
      ...learning,
    };
    return this.updateProfile(userId, { learning: updatedLearning });
  }

  public async addGoal(
    userId: string,
    goal: Omit<UserGoal, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<UserGoal> {
    if (!goal.title || goal.title.trim().length === 0) {
      throw new ValidationError('Goal title is required and cannot be empty');
    }

    const existing = await this.getProfile(userId);
    const now = new Date().toISOString();
    const newGoal: UserGoal = {
      ...goal,
      id: `goal_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      milestones: goal.milestones || [],
      createdAt: now,
      updatedAt: now,
    };

    const goals = [...existing.goals, newGoal];
    await this.updateProfile(userId, { goals });
    logger.info(`Goal created for ${userId}: ${newGoal.title} (${newGoal.id})`);
    return newGoal;
  }

  public async updateGoal(
    userId: string,
    goalId: string,
    updates: Partial<UserGoal>
  ): Promise<UserGoal> {
    const existing = await this.getProfile(userId);
    const index = existing.goals.findIndex((g) => g.id === goalId);
    if (index === -1) {
      throw new NotFoundError(`Goal with id '${goalId}' not found`);
    }

    const updatedGoal: UserGoal = {
      ...existing.goals[index],
      ...updates,
      id: existing.goals[index].id,
      createdAt: existing.goals[index].createdAt,
      updatedAt: new Date().toISOString(),
    };

    const goals = [...existing.goals];
    goals[index] = updatedGoal;
    await this.updateProfile(userId, { goals });
    return updatedGoal;
  }

  public async deleteGoal(userId: string, goalId: string): Promise<boolean> {
    const existing = await this.getProfile(userId);
    const filtered = existing.goals.filter((g) => g.id !== goalId);
    if (filtered.length === existing.goals.length) {
      return false;
    }
    await this.updateProfile(userId, { goals: filtered });
    logger.info(`Goal deleted for ${userId}: ${goalId}`);
    return true;
  }

  public async addProject(
    userId: string,
    project: Omit<UserProfileProject, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<UserProfileProject> {
    if (!project.name || project.name.trim().length === 0) {
      throw new ValidationError('Project name is required and cannot be empty');
    }

    const existing = await this.getProfile(userId);
    const now = new Date().toISOString();
    const newProject: UserProfileProject = {
      ...project,
      id: `proj_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      tags: project.tags || [],
      associatedGoals: project.associatedGoals || [],
      createdAt: now,
      updatedAt: now,
    };

    const projects = [...existing.projects, newProject];
    await this.updateProfile(userId, { projects });
    logger.info(`Project created for ${userId}: ${newProject.name} (${newProject.id})`);
    return newProject;
  }

  public async updateProject(
    userId: string,
    projectId: string,
    updates: Partial<UserProfileProject>
  ): Promise<UserProfileProject> {
    const existing = await this.getProfile(userId);
    const index = existing.projects.findIndex((p) => p.id === projectId);
    if (index === -1) {
      throw new NotFoundError(`Project with id '${projectId}' not found`);
    }

    const updatedProject: UserProfileProject = {
      ...existing.projects[index],
      ...updates,
      id: existing.projects[index].id,
      createdAt: existing.projects[index].createdAt,
      updatedAt: new Date().toISOString(),
    };

    const projects = [...existing.projects];
    projects[index] = updatedProject;
    await this.updateProfile(userId, { projects });
    return updatedProject;
  }

  public async deleteProject(userId: string, projectId: string): Promise<boolean> {
    const existing = await this.getProfile(userId);
    const filtered = existing.projects.filter((p) => p.id !== projectId);
    if (filtered.length === existing.projects.length) {
      return false;
    }
    await this.updateProfile(userId, { projects: filtered });
    logger.info(`Project deleted for ${userId}: ${projectId}`);
    return true;
  }

  public async addStudyArea(
    userId: string,
    studyArea: Omit<StudyArea, 'id' | 'updatedAt'>
  ): Promise<StudyArea> {
    if (!studyArea.title || studyArea.title.trim().length === 0) {
      throw new ValidationError('Study area title is required and cannot be empty');
    }

    const existing = await this.getProfile(userId);
    const now = new Date().toISOString();
    const newStudyArea: StudyArea = {
      ...studyArea,
      id: `study_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      focusAreas: studyArea.focusAreas || [],
      updatedAt: now,
    };

    const studyAreas = [...existing.studyAreas, newStudyArea];
    await this.updateProfile(userId, { studyAreas });
    logger.info(`Study area created for ${userId}: ${newStudyArea.title} (${newStudyArea.id})`);
    return newStudyArea;
  }

  public async updateStudyArea(
    userId: string,
    studyAreaId: string,
    updates: Partial<StudyArea>
  ): Promise<StudyArea> {
    const existing = await this.getProfile(userId);
    const index = existing.studyAreas.findIndex((s) => s.id === studyAreaId);
    if (index === -1) {
      throw new NotFoundError(`Study area with id '${studyAreaId}' not found`);
    }

    const updatedStudyArea: StudyArea = {
      ...existing.studyAreas[index],
      ...updates,
      id: existing.studyAreas[index].id,
      updatedAt: new Date().toISOString(),
    };

    const studyAreas = [...existing.studyAreas];
    studyAreas[index] = updatedStudyArea;
    await this.updateProfile(userId, { studyAreas });
    return updatedStudyArea;
  }

  public async deleteStudyArea(userId: string, studyAreaId: string): Promise<boolean> {
    const existing = await this.getProfile(userId);
    const filtered = existing.studyAreas.filter((s) => s.id !== studyAreaId);
    if (filtered.length === existing.studyAreas.length) {
      return false;
    }
    await this.updateProfile(userId, { studyAreas: filtered });
    logger.info(`Study area deleted for ${userId}: ${studyAreaId}`);
    return true;
  }

  public async updatePermissionPreferences(
    userId: string,
    prefs: Partial<PermissionPreferences>
  ): Promise<UserProfile> {
    const existing = await this.getProfile(userId);
    const updatedPrefs: PermissionPreferences = {
      ...existing.permissionPreferences,
      ...prefs,
    };

    // Sensitive action: audit log change in permission preferences
    if (this.auditLogger) {
      await this.auditLogger.log({
        user: userId,
        requestId: `req_perm_pref_${Date.now()}`,
        resource: ResourceType.SECURITY,
        action: 'write',
        permissionRequired: PermissionLevel.ADMIN,
        permissionGranted: PermissionLevel.ADMIN,
        decision: SecurityDecisionType.ALLOW,
        reason: 'User modified permission policy preferences',
        result: 'SUCCESS',
        durationMs: 1,
      });
    }

    return this.updateProfile(userId, { permissionPreferences: updatedPrefs });
  }

  public async updateSettings(
    userId: string,
    settings: Partial<PersonalSettings>
  ): Promise<UserProfile> {
    const existing = await this.getProfile(userId);
    const updatedSettings: PersonalSettings = {
      ...existing.settings,
      ...settings,
    };
    return this.updateProfile(userId, { settings: updatedSettings });
  }

  public async getPromptContext(userId = 'default_user'): Promise<string> {
    const profile = await this.getProfile(userId);
    return distillUserProfileForPrompt(profile);
  }

  public async getContextDistinction(
    userId: string,
    temporarySession: {
      sessionId: string;
      messageCount: number;
      ephemeralTopics?: string[];
      scratchpadNotes?: string[];
    }
  ): Promise<ContextDistinction> {
    const profile = await this.getProfile(userId);
    return distillContextDistinction(profile, temporarySession);
  }
}
