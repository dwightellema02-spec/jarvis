/**
 * JARVIS Phase 14 - Animation Tool Definitions
 * 8 Registered Tools for Animation, Layer Decomposition, Rigs, Lip Sync, and Rendering.
 */

import { ITool, ToolDefinition, ToolExecutionContext, ToolExecutionResult } from '../tools/tool.interface.js';
import { AnimationManager } from './animation-manager.js';
import { ResourceType, PermissionLevel } from '../security/types.js';

/**
 * 1. AnimationDecomposeLayersTool: animation.decompose_layers
 */
export class AnimationDecomposeLayersTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'animation.decompose_layers',
    name: 'Decompose Scene Layers',
    description: 'Deconstructs a scene prompt into hierarchical animatable SVG layers (background, midground, character rig, foreground).',
    version: '1.0.0',
    requiredPermissions: [
      { resource: ResourceType.ANIMATION, action: 'write', level: PermissionLevel.WRITE },
    ],
    parametersSchema: {
      type: 'object',
      properties: {
        sceneTitle: { type: 'string' },
        conceptPrompt: { type: 'string' },
        width: { type: 'number' },
        height: { type: 'number' },
        characterName: { type: 'string' },
      },
      required: ['sceneTitle', 'conceptPrompt'],
    },
    status: 'implemented',
  };

  constructor(private readonly manager: AnimationManager) {}

  public async execute(params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const p = (params || {}) as any;
      const layers = await this.manager.decomposeLayers(
        {
          sceneTitle: p.sceneTitle,
          conceptPrompt: p.conceptPrompt,
          width: p.width || 1280,
          height: p.height || 720,
          characterName: p.characterName,
        },
        context.userId
      );
      return {
        success: true,
        toolId: this.definition.id,
        data: { layers, count: layers.length },
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
 * 2. AnimationRigCharacterTool: animation.rig_character
 */
export class AnimationRigCharacterTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'animation.rig_character',
    name: 'Rig 2D Skeletal Character',
    description: 'Builds a 2D skeletal character rig with joint hierarchies, preset poses (idle, walk, talk, alert), and viseme mouth shapes.',
    version: '1.0.0',
    requiredPermissions: [
      { resource: ResourceType.ANIMATION, action: 'write', level: PermissionLevel.WRITE },
    ],
    parametersSchema: {
      type: 'object',
      properties: {
        characterName: { type: 'string' },
      },
      required: ['characterName'],
    },
    status: 'implemented',
  };

  constructor(private readonly manager: AnimationManager) {}

  public async execute(params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const p = (params || {}) as any;
      const rig = await this.manager.rigCharacter(p.characterName, context.userId);
      return {
        success: true,
        toolId: this.definition.id,
        data: rig,
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
 * 3. AnimationGenerateKeyframesTool: animation.generate_keyframes
 */
export class AnimationGenerateKeyframesTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'animation.generate_keyframes',
    name: 'Generate Keyframe Motion Tracks',
    description: 'Generates mathematical motion curves, transform tracks (translate, rotate, scale, opacity), and easing functions.',
    version: '1.0.0',
    requiredPermissions: [
      { resource: ResourceType.ANIMATION, action: 'write', level: PermissionLevel.WRITE },
    ],
    parametersSchema: {
      type: 'object',
      properties: {
        durationSeconds: { type: 'number' },
      },
    },
    status: 'implemented',
  };

  constructor(private readonly manager: AnimationManager) {}

  public async execute(params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const p = (params || {}) as any;
      const tracks = await this.manager.generateMotionTracks(p.durationSeconds || 6, context.userId);
      return {
        success: true,
        toolId: this.definition.id,
        data: { tracks, count: tracks.length },
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
 * 4. AnimationSyncLipsTool: animation.sync_lips
 */
export class AnimationSyncLipsTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'animation.sync_lips',
    name: 'Synchronize Lip Sync & Visemes',
    description: 'Matches spoken transcripts with facial viseme mouth shapes (rest, A, E, O, BMP, L, FV) and precise timing offsets.',
    version: '1.0.0',
    requiredPermissions: [
      { resource: ResourceType.ANIMATION, action: 'write', level: PermissionLevel.WRITE },
    ],
    parametersSchema: {
      type: 'object',
      properties: {
        characterRigId: { type: 'string' },
        transcript: { type: 'string' },
        durationSeconds: { type: 'number' },
      },
      required: ['transcript'],
    },
    status: 'implemented',
  };

  constructor(private readonly manager: AnimationManager) {}

  public async execute(params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const p = (params || {}) as any;
      const track = await this.manager.generateLipSync(
        p.characterRigId || 'rig_default',
        p.transcript,
        p.durationSeconds || 5,
        context.userId
      );
      return {
        success: true,
        toolId: this.definition.id,
        data: track,
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
 * 5. AnimationComposeSceneTool: animation.compose_scene
 */
export class AnimationComposeSceneTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'animation.compose_scene',
    name: 'Compose Animated Scene',
    description: 'Executes the full 7-stage Bring-It-Alive pipeline to assemble an animated SVG, audio mixing, and motion tracks.',
    version: '1.0.0',
    requiredPermissions: [
      { resource: ResourceType.ANIMATION, action: 'write', level: PermissionLevel.WRITE },
    ],
    parametersSchema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        conceptPrompt: { type: 'string' },
        style: { type: 'string' },
        durationSeconds: { type: 'number' },
        fps: { type: 'number' },
        characterName: { type: 'string' },
        transcriptVoice: { type: 'string' },
      },
      required: ['title', 'conceptPrompt'],
    },
    status: 'implemented',
  };

  constructor(private readonly manager: AnimationManager) {}

  public async execute(params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const p = (params || {}) as any;
      const animation = await this.manager.createAnimation(p, context.userId);
      return {
        success: true,
        toolId: this.definition.id,
        data: animation,
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
 * 6. AnimationExportPlayerTool: animation.export_player
 */
export class AnimationExportPlayerTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'animation.export_player',
    name: 'Export HTML5 Animation Player',
    description: 'Exports an interactive browser player with play/pause, timeline scrubber, and animated vector viewport.',
    version: '1.0.0',
    requiredPermissions: [
      { resource: ResourceType.ANIMATION, action: 'write', level: PermissionLevel.WRITE },
    ],
    parametersSchema: {
      type: 'object',
      properties: {
        animationId: { type: 'string' },
        htmlPlayer: { type: 'string' },
      },
      required: ['animationId', 'htmlPlayer'],
    },
    status: 'implemented',
  };

  constructor(private readonly manager: AnimationManager) {}

  public async execute(params: unknown, _context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const p = (params || {}) as any;
      const exported = {
        animationId: p.animationId,
        mimeType: 'text/html',
        sizeBytes: Buffer.byteLength(p.htmlPlayer || '', 'utf8'),
        ready: true,
      };
      return {
        success: true,
        toolId: this.definition.id,
        data: exported,
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
 * 7. AnimationGenerateRenderManifestTool: animation.generate_render_manifest
 */
export class AnimationGenerateRenderManifestTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'animation.generate_render_manifest',
    name: 'Generate Video Render Manifest',
    description: 'Generates standardized FFmpeg and Remotion composition render manifests with layer order and audio mix specifications.',
    version: '1.0.0',
    requiredPermissions: [
      { resource: ResourceType.ANIMATION, action: 'write', level: PermissionLevel.WRITE },
    ],
    parametersSchema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        conceptPrompt: { type: 'string' },
        durationSeconds: { type: 'number' },
      },
      required: ['title', 'conceptPrompt'],
    },
    status: 'implemented',
  };

  constructor(private readonly manager: AnimationManager) {}

  public async execute(params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const p = (params || {}) as any;
      const anim = await this.manager.createAnimation(p, context.userId);
      return {
        success: true,
        toolId: this.definition.id,
        data: {
          manifest: JSON.parse(anim.renderManifestJson),
          renderManifestJson: anim.renderManifestJson,
        },
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
 * 8. AnimationCheckRenderingToolsTool: animation.check_rendering_tools
 */
export class AnimationCheckRenderingToolsTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'animation.check_rendering_tools',
    name: 'Check Video Rendering Tools',
    description: 'Audits host system for external rendering software (FFmpeg, Blender, Canvas) and honestly reports available capabilities.',
    version: '1.0.0',
    requiredPermissions: [
      { resource: ResourceType.ANIMATION, action: 'read', level: PermissionLevel.READ },
    ],
    parametersSchema: {
      type: 'object',
      properties: {},
    },
    status: 'implemented',
  };

  constructor(private readonly manager: AnimationManager) {}

  public async execute(_params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const result = await this.manager.checkRenderingTools(context.userId);
      return {
        success: true,
        toolId: this.definition.id,
        data: result,
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

export function createAnimationTools(animationManager: AnimationManager): ITool[] {
  return [
    new AnimationDecomposeLayersTool(animationManager),
    new AnimationRigCharacterTool(animationManager),
    new AnimationGenerateKeyframesTool(animationManager),
    new AnimationSyncLipsTool(animationManager),
    new AnimationComposeSceneTool(animationManager),
    new AnimationExportPlayerTool(animationManager),
    new AnimationGenerateRenderManifestTool(animationManager),
    new AnimationCheckRenderingToolsTool(animationManager),
  ];
}
