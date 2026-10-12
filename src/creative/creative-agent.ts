/**
 * JARVIS Phase 13 - Creative Agent Implementation
 * Coordinates multimodal content creation: vector graphics, presentations, subtitles, SSML, and storyboards.
 */

import {
  IAgent,
  AgentDefinition,
  AgentExecutionContext,
  AgentExecutionResult,
} from '../agents/agent.interface.js';
import { CreativeManager } from './creative-manager.js';
import { ResourceType, PermissionLevel } from '../security/types.js';
import {
  CreativeStyle,
  AspectRatio,
  GraphicElement,
} from './creative.interface.js';

export interface CreativeAgentInput {
  action:
    | 'generate_image'
    | 'edit_image'
    | 'compose_graphic'
    | 'create_presentation'
    | 'generate_subtitles'
    | 'synthesize_speech_spec'
    | 'create_storyboard'
    | 'get_status';
  prompt?: string;
  style?: CreativeStyle;
  aspectRatio?: AspectRatio;
  width?: number;
  height?: number;
  svgContent?: string;
  instruction?: 'grayscale' | 'invert' | 'add_watermark' | 'scale' | 'filter_cyberpunk';
  watermarkText?: string;
  scaleFactor?: number;
  title?: string;
  subtitle?: string;
  layout?: 'banner' | 'poster' | 'badge' | 'infographic';
  theme?: string;
  elements?: GraphicElement[];
  topic?: string;
  targetAudience?: string;
  slideCount?: number;
  transcript?: string;
  format?: 'srt' | 'vtt';
  wordsPerLine?: number;
  text?: string;
  voiceGender?: 'male' | 'female' | 'neutral';
  speakingRate?: number;
  pitch?: number;
  projectTitle?: string;
  concept?: string;
  targetDurationSeconds?: number;
  sceneCount?: number;
}

export class CreativeAgent implements IAgent {
  public readonly definition: AgentDefinition = {
    id: 'creative-agent',
    name: 'JARVIS Creative Studio Agent',
    description:
      'Autonomous creative generation agent for SVG artworks, vector graphic layouts, slide decks, subtitles, SSML audio specs, and video storyboards.',
    version: '1.0.0',
    capabilities: [
      'generate_image',
      'edit_image',
      'compose_graphic',
      'create_presentation',
      'generate_subtitles',
      'synthesize_speech_spec',
      'create_storyboard',
      'get_status',
    ],
    requiredPermissions: [
      {
        resource: ResourceType.CREATIVE,
        action: 'write',
        level: PermissionLevel.WRITE,
      },
    ],
    inputSchema: {
      action: 'string',
      prompt: 'string?',
      title: 'string?',
      topic: 'string?',
    },
    outputSchema: {
      success: 'boolean',
      data: 'any',
    },
    status: 'implemented',
  };

  private creativeManager: CreativeManager;

  constructor(creativeManager: CreativeManager) {
    this.creativeManager = creativeManager;
  }

  public async execute(rawInput: unknown, context: AgentExecutionContext): Promise<AgentExecutionResult> {
    const startTime = Date.now();
    const input = (rawInput || {}) as CreativeAgentInput;
    const userId = context.userId || 'default_user';

    try {
      switch (input.action) {
        case 'get_status': {
          const status = this.creativeManager.getStatus();
          return {
            success: true,
            agentId: this.definition.id,
            data: status,
            executionTimeMs: Date.now() - startTime,
          };
        }

        case 'generate_image': {
          if (!input.prompt) {
            return {
              success: false,
              agentId: this.definition.id,
              error: 'Field "prompt" is required for image generation.',
              executionTimeMs: Date.now() - startTime,
            };
          }
          const result = await this.creativeManager.generateImage(
            {
              prompt: input.prompt,
              style: input.style,
              aspectRatio: input.aspectRatio,
              width: input.width,
              height: input.height,
            },
            userId
          );
          return {
            success: true,
            agentId: this.definition.id,
            data: result,
            executionTimeMs: Date.now() - startTime,
          };
        }

        case 'edit_image': {
          if (!input.svgContent || !input.instruction) {
            return {
              success: false,
              agentId: this.definition.id,
              error: 'Fields "svgContent" and "instruction" are required for edit_image.',
              executionTimeMs: Date.now() - startTime,
            };
          }
          const result = await this.creativeManager.editImage(
            {
              svgContent: input.svgContent,
              instruction: input.instruction,
              watermarkText: input.watermarkText,
              scaleFactor: input.scaleFactor,
            },
            userId
          );
          return {
            success: true,
            agentId: this.definition.id,
            data: result,
            executionTimeMs: Date.now() - startTime,
          };
        }

        case 'compose_graphic': {
          if (!input.title || !input.layout) {
            return {
              success: false,
              agentId: this.definition.id,
              error: 'Fields "title" and "layout" are required for compose_graphic.',
              executionTimeMs: Date.now() - startTime,
            };
          }
          const result = await this.creativeManager.composeGraphic(
            {
              title: input.title,
              subtitle: input.subtitle,
              layout: input.layout,
              theme: (input.theme as any) || 'dark_neon',
              width: input.width,
              height: input.height,
              elements: input.elements,
            },
            userId
          );
          return {
            success: true,
            agentId: this.definition.id,
            data: result,
            executionTimeMs: Date.now() - startTime,
          };
        }

        case 'create_presentation': {
          if (!input.topic) {
            return {
              success: false,
              agentId: this.definition.id,
              error: 'Field "topic" is required for create_presentation.',
              executionTimeMs: Date.now() - startTime,
            };
          }
          const result = await this.creativeManager.createPresentation(
            {
              topic: input.topic,
              targetAudience: input.targetAudience,
              slideCount: input.slideCount,
              theme: (input.theme as any) || 'jarvis_dark',
            },
            userId
          );
          return {
            success: true,
            agentId: this.definition.id,
            data: result,
            executionTimeMs: Date.now() - startTime,
          };
        }

        case 'generate_subtitles': {
          if (!input.transcript) {
            return {
              success: false,
              agentId: this.definition.id,
              error: 'Field "transcript" is required for generate_subtitles.',
              executionTimeMs: Date.now() - startTime,
            };
          }
          const result = await this.creativeManager.generateSubtitles(
            {
              transcript: input.transcript,
              format: input.format || 'srt',
              wordsPerLine: input.wordsPerLine,
            },
            userId
          );
          return {
            success: true,
            agentId: this.definition.id,
            data: result,
            executionTimeMs: Date.now() - startTime,
          };
        }

        case 'synthesize_speech_spec': {
          if (!input.text) {
            return {
              success: false,
              agentId: this.definition.id,
              error: 'Field "text" is required for synthesize_speech_spec.',
              executionTimeMs: Date.now() - startTime,
            };
          }
          const result = await this.creativeManager.synthesizeSpeechSpec(
            {
              text: input.text,
              voiceGender: input.voiceGender,
              speakingRate: input.speakingRate,
              pitch: input.pitch,
            },
            userId
          );
          return {
            success: true,
            agentId: this.definition.id,
            data: result,
            executionTimeMs: Date.now() - startTime,
          };
        }

        case 'create_storyboard': {
          if (!input.projectTitle || !input.concept) {
            return {
              success: false,
              agentId: this.definition.id,
              error: 'Fields "projectTitle" and "concept" are required for create_storyboard.',
              executionTimeMs: Date.now() - startTime,
            };
          }
          const result = await this.creativeManager.createStoryboard(
            {
              projectTitle: input.projectTitle,
              concept: input.concept,
              targetDurationSeconds: input.targetDurationSeconds,
              sceneCount: input.sceneCount,
            },
            userId
          );
          return {
            success: true,
            agentId: this.definition.id,
            data: result,
            executionTimeMs: Date.now() - startTime,
          };
        }

        default:
          return {
            success: false,
            agentId: this.definition.id,
            error: `Unknown action "${(input as any).action}".`,
            executionTimeMs: Date.now() - startTime,
          };
      }
    } catch (err: any) {
      return {
        success: false,
        agentId: this.definition.id,
        error: err.message || 'Error executing creative action',
        executionTimeMs: Date.now() - startTime,
      };
    }
  }
}
