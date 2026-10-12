/**
 * JARVIS Phase 14 - Animation Manager & Security Coordinator
 * Enforces permissions, threat modeling, and audit logging for animation pipelines.
 */

import { AnimationRenderPipeline } from './animation-render-pipeline.js';
import {
  AnimationProjectRequest,
  AnimationProject,
  SceneLayer,
  CharacterRig,
  MotionTrack,
  LipSyncTrack,
  ToolAvailabilitySummary,
} from './animation.interface.js';
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

export class AnimationManager {
  private pipeline: AnimationRenderPipeline;
  private permissionManager: PermissionManager;
  private guardian: SecurityGuardian;
  private auditLogger: AuditLogger;

  constructor(
    permissionManager: PermissionManager,
    guardian: SecurityGuardian,
    auditLogger: AuditLogger,
    pipeline?: AnimationRenderPipeline
  ) {
    this.permissionManager = permissionManager;
    this.guardian = guardian;
    this.auditLogger = auditLogger;
    this.pipeline = pipeline || new AnimationRenderPipeline();
  }

  /**
   * Executes the complete 7-stage Bring-It-Alive animation pipeline.
   */
  public async createAnimation(
    request: AnimationProjectRequest,
    userId: string = 'default_user'
  ): Promise<AnimationProject> {
    this.assertPermission(userId, 'write', PermissionLevel.WRITE, 'create_animation');
    this.assertGuardian(userId, 'write', `animation_prompt:${request.conceptPrompt.substring(0, 50)}`);

    logger.info(`[AnimationManager] Creating animation "${request.title}" for user ${userId}`);
    const project = this.pipeline.buildAnimation(request);

    this.recordAudit(userId, 'write', PermissionLevel.WRITE, 'Generated animation project and player', {
      animationId: project.id,
      title: project.title,
      duration: project.durationSeconds,
      layersCount: project.layers.length,
      fps: project.fps,
    });

    return project;
  }

  /**
   * Decomposes scene into animatable SVG layers.
   */
  public async decomposeLayers(
    params: {
      sceneTitle: string;
      conceptPrompt: string;
      width: number;
      height: number;
      characterName?: string;
    },
    userId: string = 'default_user'
  ): Promise<SceneLayer[]> {
    this.assertPermission(userId, 'write', PermissionLevel.WRITE, 'decompose_layers');
    this.assertGuardian(userId, 'write', 'decompose_layers');

    const layers = (this.pipeline as any).layerEngine.decomposeLayers(params);

    this.recordAudit(userId, 'write', PermissionLevel.WRITE, 'Decomposed scene layers', {
      layersCount: layers.length,
      sceneTitle: params.sceneTitle,
    });

    return layers;
  }

  /**
   * Builds character rig with joints and visemes.
   */
  public async rigCharacter(
    characterName: string,
    userId: string = 'default_user'
  ): Promise<CharacterRig> {
    this.assertPermission(userId, 'write', PermissionLevel.WRITE, 'rig_character');
    this.assertGuardian(userId, 'write', `rig:${characterName}`);

    const rig = (this.pipeline as any).rigEngine.createCharacterRig(characterName);

    this.recordAudit(userId, 'write', PermissionLevel.WRITE, 'Created skeletal character rig', {
      rigId: rig.id,
      characterName,
      jointsCount: rig.joints.length,
    });

    return rig;
  }

  /**
   * Generates motion graphs and keyframes.
   */
  public async generateMotionTracks(
    durationSeconds: number = 6,
    userId: string = 'default_user'
  ): Promise<MotionTrack[]> {
    this.assertPermission(userId, 'write', PermissionLevel.WRITE, 'generate_motion_tracks');
    this.assertGuardian(userId, 'write', 'generate_motion_tracks');

    const tracks = (this.pipeline as any).motionEngine.generateMotionTracks(durationSeconds);

    this.recordAudit(userId, 'write', PermissionLevel.WRITE, 'Generated keyframe motion tracks', {
      tracksCount: tracks.length,
      durationSeconds,
    });

    return tracks;
  }

  /**
   * Generates lip sync viseme cues.
   */
  public async generateLipSync(
    characterRigId: string,
    transcript: string,
    durationSeconds: number = 5,
    userId: string = 'default_user'
  ): Promise<LipSyncTrack> {
    this.assertPermission(userId, 'write', PermissionLevel.WRITE, 'generate_lip_sync');
    this.assertGuardian(userId, 'write', 'generate_lip_sync');

    const track = (this.pipeline as any).lipSyncEngine.generateLipSync(characterRigId, transcript, durationSeconds);

    this.recordAudit(userId, 'write', PermissionLevel.WRITE, 'Generated lip sync viseme track', {
      characterRigId,
      totalCues: track.totalCues,
    });

    return track;
  }

  /**
   * Checks host system video rendering tools honestly.
   */
  public async checkRenderingTools(userId: string = 'default_user'): Promise<ToolAvailabilitySummary> {
    this.assertPermission(userId, 'read', PermissionLevel.READ, 'check_rendering_tools');
    this.assertGuardian(userId, 'read', 'check_rendering_tools');

    return this.pipeline.checkRenderingTools();
  }

  // ==================== INTERNAL AUDIT & PERMISSIONS ====================

  private recordAudit(
    user: string,
    action: PermissionAction,
    permissionRequired: PermissionLevel,
    reason: string,
    details?: Record<string, unknown>
  ): void {
    this.auditLogger.log({
      user,
      requestId: `req_anim_${Date.now()}`,
      resource: ResourceType.ANIMATION,
      action,
      permissionRequired,
      decision: SecurityDecisionType.ALLOW,
      reason,
      result: 'SUCCESS',
      details,
    });
  }

  private assertPermission(
    userId: string,
    action: 'read' | 'write' | 'execute',
    requiredLevel: PermissionLevel,
    targetIdentifier: string
  ): void {
    const permResult = this.permissionManager.checkPermission({
      userId,
      resource: ResourceType.ANIMATION,
      action,
      requiredLevel,
      targetIdentifier,
    });

    if (!permResult.allowed) {
      throw new Error(`Permission Denied on ANIMATION: User "${userId}" lacks required ${requiredLevel} permission.`);
    }
  }

  private assertGuardian(userId: string, action: 'read' | 'write' | 'execute', target: string): void {
    const decision = this.guardian.evaluate({
      resource: ResourceType.ANIMATION,
      action,
      target,
      userId,
    });

    if (decision.decision === SecurityDecisionType.DENY) {
      throw new Error(`Security Guardian blocked Animation action: ${decision.reason || 'Threat detected'}`);
    }
  }
}
