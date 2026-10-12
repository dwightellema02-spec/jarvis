/**
 * JARVIS Phase 13 - Creative Engine Coordinator & Security Manager
 */

import { ImageGenerator } from './image-generator.js';
import { GraphicDesigner } from './graphic-designer.js';
import { PresentationBuilder } from './presentation-builder.js';
import { SubtitleAudioEngine } from './subtitle-audio-engine.js';
import { StoryboardPlanner } from './storyboard-planner.js';
import {
  ImageGenerationRequest,
  GeneratedImageResult,
  ImageEditRequest,
  GraphicCompositionRequest,
  GraphicCompositionResult,
  PresentationDeckRequest,
  PresentationDeck,
  SubtitleGenerationRequest,
  SubtitleGenerationResult,
  SpeechSynthesisRequest,
  SpeechSynthesisSpec,
  StoryboardRequest,
  Storyboard,
  CreativeSystemStatus,
} from './creative.interface.js';
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

export class CreativeManager {
  private imageGenerator: ImageGenerator;
  private graphicDesigner: GraphicDesigner;
  private presentationBuilder: PresentationBuilder;
  private subtitleAudioEngine: SubtitleAudioEngine;
  private storyboardPlanner: StoryboardPlanner;

  private permissionManager: PermissionManager;
  private guardian: SecurityGuardian;
  private auditLogger: AuditLogger;

  constructor(
    permissionManager: PermissionManager,
    guardian: SecurityGuardian,
    auditLogger: AuditLogger,
    imageGenerator?: ImageGenerator,
    graphicDesigner?: GraphicDesigner,
    presentationBuilder?: PresentationBuilder,
    subtitleAudioEngine?: SubtitleAudioEngine,
    storyboardPlanner?: StoryboardPlanner
  ) {
    this.permissionManager = permissionManager;
    this.guardian = guardian;
    this.auditLogger = auditLogger;

    this.imageGenerator = imageGenerator || new ImageGenerator();
    this.graphicDesigner = graphicDesigner || new GraphicDesigner();
    this.presentationBuilder = presentationBuilder || new PresentationBuilder();
    this.subtitleAudioEngine = subtitleAudioEngine || new SubtitleAudioEngine();
    this.storyboardPlanner = storyboardPlanner || new StoryboardPlanner();
  }

  public getStatus(): CreativeSystemStatus {
    return {
      serviceName: 'JARVIS Creative Studio Engine',
      supportedStyles: ['photorealistic', 'digital_art', 'vector', 'cyberpunk', 'minimalist'],
      features: [
        'svg_vector_image_generation',
        'image_filters_watermarking_scaling',
        'layout_graphic_composition',
        'multi_slide_presentation_builder',
        'srt_vtt_subtitle_generator',
        'w3c_ssml_speech_specifier',
        'cinematic_video_storyboard_planner',
      ],
      totalImagesGenerated: this.imageGenerator.getGeneratedCount(),
      totalPresentationsBuilt: this.presentationBuilder.getDecksCount(),
      totalStoryboardsCreated: this.storyboardPlanner.getStoryboardsCount(),
      version: '1.0.0-phase13',
    };
  }

  // ==================== IMAGE GENERATION & EDITING ====================

  public async generateImage(
    request: ImageGenerationRequest,
    userId: string = 'default_user'
  ): Promise<GeneratedImageResult> {
    this.assertPermission(userId, 'write', PermissionLevel.WRITE, 'generate_image');
    this.assertGuardian(userId, 'write', `image_prompt:${request.prompt.substring(0, 50)}`);

    logger.info(`[CreativeManager] Generating image for user ${userId} with style ${request.style || 'default'}`);
    const result = this.imageGenerator.generateImage(request);

    this.recordAudit(userId, 'write', PermissionLevel.WRITE, 'Generated SVG vector artwork', {
      imageId: result.id,
      prompt: request.prompt,
      style: result.style,
      aspectRatio: result.aspectRatio,
    });

    return result;
  }

  public async editImage(
    request: ImageEditRequest,
    userId: string = 'default_user'
  ): Promise<GeneratedImageResult> {
    this.assertPermission(userId, 'write', PermissionLevel.WRITE, 'edit_image');
    this.assertGuardian(userId, 'write', `image_edit:${request.instruction}`);

    logger.info(`[CreativeManager] Editing image with instruction ${request.instruction}`);
    const result = this.imageGenerator.editImage(request);

    this.recordAudit(userId, 'write', PermissionLevel.WRITE, 'Applied filter or edit to SVG artwork', {
      instruction: request.instruction,
      imageId: result.id,
    });

    return result;
  }

  // ==================== GRAPHIC DESIGN COMPOSITION ====================

  public async composeGraphic(
    request: GraphicCompositionRequest,
    userId: string = 'default_user'
  ): Promise<GraphicCompositionResult> {
    this.assertPermission(userId, 'write', PermissionLevel.WRITE, 'compose_graphic');
    this.assertGuardian(userId, 'write', `compose_layout:${request.layout}`);

    logger.info(`[CreativeManager] Composing ${request.layout} graphic titled "${request.title}"`);
    const result = this.graphicDesigner.composeGraphic(request);

    this.recordAudit(userId, 'write', PermissionLevel.WRITE, 'Composed vector graphic layout', {
      graphicId: result.id,
      title: request.title,
      layout: request.layout,
      theme: request.theme,
    });

    return result;
  }

  // ==================== PRESENTATION BUILDER ====================

  public async createPresentation(
    request: PresentationDeckRequest,
    userId: string = 'default_user'
  ): Promise<PresentationDeck> {
    this.assertPermission(userId, 'write', PermissionLevel.WRITE, 'create_presentation');
    this.assertGuardian(userId, 'write', `presentation_topic:${request.topic.substring(0, 50)}`);

    logger.info(`[CreativeManager] Building presentation deck for "${request.topic}"`);
    const result = this.presentationBuilder.createDeck(request);

    this.recordAudit(userId, 'write', PermissionLevel.WRITE, 'Built multi-slide presentation deck', {
      deckId: result.id,
      topic: request.topic,
      totalSlides: result.totalSlides,
      theme: result.theme,
    });

    return result;
  }

  // ==================== SUBTITLES & AUDIO SPECS ====================

  public async generateSubtitles(
    request: SubtitleGenerationRequest,
    userId: string = 'default_user'
  ): Promise<SubtitleGenerationResult> {
    this.assertPermission(userId, 'write', PermissionLevel.WRITE, 'generate_subtitles');
    this.assertGuardian(userId, 'write', 'generate_subtitles');

    const result = this.subtitleAudioEngine.generateSubtitles(request);

    this.recordAudit(userId, 'write', PermissionLevel.WRITE, 'Generated timed subtitles', {
      format: result.format,
      entryCount: result.entryCount,
      durationSeconds: result.durationSeconds,
    });

    return result;
  }

  public async synthesizeSpeechSpec(
    request: SpeechSynthesisRequest,
    userId: string = 'default_user'
  ): Promise<SpeechSynthesisSpec> {
    this.assertPermission(userId, 'write', PermissionLevel.WRITE, 'synthesize_speech_spec');
    this.assertGuardian(userId, 'write', 'synthesize_speech_spec');

    const result = this.subtitleAudioEngine.synthesizeSpeechSpec(request);

    this.recordAudit(userId, 'write', PermissionLevel.WRITE, 'Synthesized SSML speech specification', {
      specId: result.id,
      voiceGender: result.voiceGender,
      speakingRate: result.speakingRate,
      estimatedDurationSeconds: result.estimatedDurationSeconds,
    });

    return result;
  }

  // ==================== CINEMATIC STORYBOARD ====================

  public async createStoryboard(
    request: StoryboardRequest,
    userId: string = 'default_user'
  ): Promise<Storyboard> {
    this.assertPermission(userId, 'write', PermissionLevel.WRITE, 'create_storyboard');
    this.assertGuardian(userId, 'write', `storyboard_project:${request.projectTitle.substring(0, 50)}`);

    logger.info(`[CreativeManager] Creating storyboard for project "${request.projectTitle}"`);
    const result = this.storyboardPlanner.createStoryboard(request);

    this.recordAudit(userId, 'write', PermissionLevel.WRITE, 'Planned cinematic storyboard', {
      storyboardId: result.id,
      projectTitle: result.projectTitle,
      totalScenes: result.totalScenes,
      totalDurationSeconds: result.totalDurationSeconds,
    });

    return result;
  }

  // ==================== INTERNAL HELPERS ====================

  private recordAudit(
    user: string,
    action: PermissionAction,
    permissionRequired: PermissionLevel,
    reason: string,
    details?: Record<string, unknown>
  ): void {
    this.auditLogger.log({
      user,
      requestId: `req_creative_${Date.now()}`,
      resource: ResourceType.CREATIVE,
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
      resource: ResourceType.CREATIVE,
      action,
      requiredLevel,
      targetIdentifier,
    });

    if (!permResult.allowed) {
      throw new Error(`Permission Denied on CREATIVE: User "${userId}" lacks required ${requiredLevel} permission.`);
    }
  }

  private assertGuardian(userId: string, action: 'read' | 'write' | 'execute', target: string): void {
    const decision = this.guardian.evaluate({
      resource: ResourceType.CREATIVE,
      action,
      target,
      userId,
    });

    if (decision.decision === SecurityDecisionType.DENY) {
      throw new Error(`Security Guardian blocked Creative action: ${decision.reason || 'Threat detected'}`);
    }
  }
}
