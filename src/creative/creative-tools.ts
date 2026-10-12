/**
 * JARVIS Phase 13 - Creative Studio Tool Definitions
 * 8 Registered Tools for Creative and Multimodal Content Generation
 */

import { ITool, ToolDefinition, ToolExecutionContext, ToolExecutionResult } from '../tools/tool.interface.js';
import { CreativeManager } from './creative-manager.js';
import { ResourceType, PermissionLevel } from '../security/types.js';

/**
 * 1. CreativeGenerateImageTool: creative.generate_image
 */
export class CreativeGenerateImageTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'creative.generate_image',
    name: 'Generate Vector / SVG Image',
    description: 'Generates high-fidelity SVG artwork across styles (digital_art, cyberpunk, vector, minimalist, photorealistic) and aspect ratios.',
    version: '1.0.0',
    requiredPermissions: [
      { resource: ResourceType.CREATIVE, action: 'write', level: PermissionLevel.WRITE },
    ],
    parametersSchema: {
      type: 'object',
      properties: {
        prompt: { type: 'string' },
        style: { type: 'string', enum: ['photorealistic', 'digital_art', 'vector', 'cyberpunk', 'minimalist'] },
        aspectRatio: { type: 'string', enum: ['1:1', '16:9', '4:3', '9:16'] },
        width: { type: 'number' },
        height: { type: 'number' },
      },
      required: ['prompt'],
    },
    status: 'implemented',
  };

  constructor(private readonly manager: CreativeManager) {}

  public async execute(params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const p = (params || {}) as any;
      const result = await this.manager.generateImage(p, context.userId);
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

/**
 * 2. CreativeEditImageTool: creative.edit_image
 */
export class CreativeEditImageTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'creative.edit_image',
    name: 'Edit SVG Vector Artwork',
    description: 'Applies image transformations (grayscale, invert, watermark, filter_cyberpunk, scale) to SVG content.',
    version: '1.0.0',
    requiredPermissions: [
      { resource: ResourceType.CREATIVE, action: 'write', level: PermissionLevel.WRITE },
    ],
    parametersSchema: {
      type: 'object',
      properties: {
        svgContent: { type: 'string' },
        instruction: { type: 'string', enum: ['grayscale', 'invert', 'add_watermark', 'scale', 'filter_cyberpunk'] },
        watermarkText: { type: 'string' },
        scaleFactor: { type: 'number' },
      },
      required: ['svgContent', 'instruction'],
    },
    status: 'implemented',
  };

  constructor(private readonly manager: CreativeManager) {}

  public async execute(params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const p = (params || {}) as any;
      const result = await this.manager.editImage(p, context.userId);
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

/**
 * 3. CreativeComposeGraphicTool: creative.compose_graphic
 */
export class CreativeComposeGraphicTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'creative.compose_graphic',
    name: 'Compose Vector Graphic Layout',
    description: 'Generates graphic layouts including banners, posters, badges, and infographics with themes and element positioning.',
    version: '1.0.0',
    requiredPermissions: [
      { resource: ResourceType.CREATIVE, action: 'write', level: PermissionLevel.WRITE },
    ],
    parametersSchema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        subtitle: { type: 'string' },
        layout: { type: 'string', enum: ['banner', 'poster', 'badge', 'infographic'] },
        theme: { type: 'string', enum: ['dark_neon', 'academic_clean', 'modern_gradient'] },
        width: { type: 'number' },
        height: { type: 'number' },
      },
      required: ['title', 'layout'],
    },
    status: 'implemented',
  };

  constructor(private readonly manager: CreativeManager) {}

  public async execute(params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const p = (params || {}) as any;
      const result = await this.manager.composeGraphic(p, context.userId);
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

/**
 * 4. CreativeCreatePresentationTool: creative.create_presentation
 */
export class CreativeCreatePresentationTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'creative.create_presentation',
    name: 'Create Presentation Slide Deck',
    description: 'Generates a structured multi-slide deck with visual cues, speaker notes, and standalone HTML export.',
    version: '1.0.0',
    requiredPermissions: [
      { resource: ResourceType.CREATIVE, action: 'write', level: PermissionLevel.WRITE },
    ],
    parametersSchema: {
      type: 'object',
      properties: {
        topic: { type: 'string' },
        targetAudience: { type: 'string' },
        slideCount: { type: 'number' },
        theme: { type: 'string', enum: ['jarvis_dark', 'academic_blue', 'minimal_light'] },
      },
      required: ['topic'],
    },
    status: 'implemented',
  };

  constructor(private readonly manager: CreativeManager) {}

  public async execute(params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const p = (params || {}) as any;
      const result = await this.manager.createPresentation(p, context.userId);
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

/**
 * 5. CreativeExportDocumentLayoutTool: creative.export_document_layout
 */
export class CreativeExportDocumentLayoutTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'creative.export_document_layout',
    name: 'Export Document Layout',
    description: 'Exports formatted presentation decks or graphic layout sheets ready for browser preview or rendering.',
    version: '1.0.0',
    requiredPermissions: [
      { resource: ResourceType.CREATIVE, action: 'write', level: PermissionLevel.WRITE },
    ],
    parametersSchema: {
      type: 'object',
      properties: {
        documentType: { type: 'string', enum: ['presentation_html', 'graphic_svg'] },
        content: { type: 'string' },
      },
      required: ['documentType', 'content'],
    },
    status: 'implemented',
  };

  constructor(private readonly manager: CreativeManager) {}

  public async execute(params: unknown, _context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const p = (params || {}) as any;
      const docType = p.documentType;
      const content = p.content || '';

      const exported = {
        documentType: docType,
        mimeType: docType === 'presentation_html' ? 'text/html' : 'image/svg+xml',
        sizeBytes: Buffer.byteLength(content, 'utf8'),
        previewReady: true,
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
 * 6. CreativeGenerateSubtitlesTool: creative.generate_subtitles
 */
export class CreativeGenerateSubtitlesTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'creative.generate_subtitles',
    name: 'Generate Subtitles (SRT / VTT)',
    description: 'Converts transcript text into precisely timed subtitle cues in standard SRT or WebVTT format.',
    version: '1.0.0',
    requiredPermissions: [
      { resource: ResourceType.CREATIVE, action: 'write', level: PermissionLevel.WRITE },
    ],
    parametersSchema: {
      type: 'object',
      properties: {
        transcript: { type: 'string' },
        format: { type: 'string', enum: ['srt', 'vtt'] },
        wordsPerLine: { type: 'number' },
      },
      required: ['transcript'],
    },
    status: 'implemented',
  };

  constructor(private readonly manager: CreativeManager) {}

  public async execute(params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const p = (params || {}) as any;
      const result = await this.manager.generateSubtitles(p, context.userId);
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

/**
 * 7. CreativeSynthesizeSpeechSpecTool: creative.synthesize_speech_spec
 */
export class CreativeSynthesizeSpeechSpecTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'creative.synthesize_speech_spec',
    name: 'Synthesize SSML Speech Spec',
    description: 'Generates W3C-compliant SSML with speaking rate, pitch, pauses, and voice characteristics.',
    version: '1.0.0',
    requiredPermissions: [
      { resource: ResourceType.CREATIVE, action: 'write', level: PermissionLevel.WRITE },
    ],
    parametersSchema: {
      type: 'object',
      properties: {
        text: { type: 'string' },
        voiceGender: { type: 'string', enum: ['male', 'female', 'neutral'] },
        speakingRate: { type: 'number' },
        pitch: { type: 'number' },
      },
      required: ['text'],
    },
    status: 'implemented',
  };

  constructor(private readonly manager: CreativeManager) {}

  public async execute(params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const p = (params || {}) as any;
      const result = await this.manager.synthesizeSpeechSpec(p, context.userId);
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

/**
 * 8. CreativeCreateStoryboardTool: creative.create_storyboard
 */
export class CreativeCreateStoryboardTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'creative.create_storyboard',
    name: 'Create Video Storyboard',
    description: 'Plans cinematic scene-by-scene video storyboards with shot types, audio, transitions, and render manifest.',
    version: '1.0.0',
    requiredPermissions: [
      { resource: ResourceType.CREATIVE, action: 'write', level: PermissionLevel.WRITE },
    ],
    parametersSchema: {
      type: 'object',
      properties: {
        projectTitle: { type: 'string' },
        concept: { type: 'string' },
        targetDurationSeconds: { type: 'number' },
        sceneCount: { type: 'number' },
      },
      required: ['projectTitle', 'concept'],
    },
    status: 'implemented',
  };

  constructor(private readonly manager: CreativeManager) {}

  public async execute(params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const p = (params || {}) as any;
      const result = await this.manager.createStoryboard(p, context.userId);
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

export function createCreativeTools(creativeManager: CreativeManager): ITool[] {
  return [
    new CreativeGenerateImageTool(creativeManager),
    new CreativeEditImageTool(creativeManager),
    new CreativeComposeGraphicTool(creativeManager),
    new CreativeCreatePresentationTool(creativeManager),
    new CreativeExportDocumentLayoutTool(creativeManager),
    new CreativeGenerateSubtitlesTool(creativeManager),
    new CreativeSynthesizeSpeechSpecTool(creativeManager),
    new CreativeCreateStoryboardTool(creativeManager),
  ];
}
