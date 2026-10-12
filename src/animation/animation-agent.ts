/**
 * JARVIS Phase 14 - Animation Agent Implementation
 * Autonomous agent coordinating the 7-stage Bring It Alive animation pipeline.
 */

import {
  IAgent,
  AgentDefinition,
  AgentExecutionContext,
  AgentExecutionResult,
} from '../agents/agent.interface.js';
import { AnimationManager } from './animation-manager.js';
import { ResourceType, PermissionLevel } from '../security/types.js';
import { AnimationStyle } from './animation.interface.js';

export interface AnimationAgentInput {
  action:
    | 'create_animation'
    | 'decompose_layers'
    | 'rig_character'
    | 'generate_motion_tracks'
    | 'generate_lip_sync'
    | 'check_rendering_tools';
  title?: string;
  conceptPrompt?: string;
  style?: AnimationStyle;
  durationSeconds?: number;
  fps?: number;
  characterName?: string;
  transcriptVoice?: string;
  characterRigId?: string;
  transcript?: string;
  width?: number;
  height?: number;
}

export class AnimationAgent implements IAgent {
  public readonly definition: AgentDefinition = {
    id: 'animation-agent',
    name: 'JARVIS Bring-It-Alive Animation Agent',
    description:
      'Autonomous animation agent executing the 7-stage pipeline: idea, drawings, asset layers, skeletal rigs, motion graphs, lip sync, and render manifests.',
    version: '1.0.0',
    capabilities: [
      'create_animation',
      'decompose_layers',
      'rig_character',
      'generate_motion_tracks',
      'generate_lip_sync',
      'check_rendering_tools',
    ],
    requiredPermissions: [
      {
        resource: ResourceType.ANIMATION,
        action: 'write',
        level: PermissionLevel.WRITE,
      },
    ],
    inputSchema: {
      action: 'string',
      title: 'string?',
      conceptPrompt: 'string?',
      durationSeconds: 'number?',
    },
    outputSchema: {
      success: 'boolean',
      data: 'any',
    },
    status: 'implemented',
  };

  private animationManager: AnimationManager;

  constructor(animationManager: AnimationManager) {
    this.animationManager = animationManager;
  }

  public async execute(rawInput: unknown, context: AgentExecutionContext): Promise<AgentExecutionResult> {
    const startTime = Date.now();
    const input = (rawInput || {}) as AnimationAgentInput;
    const userId = context.userId || 'default_user';

    try {
      switch (input.action) {
        case 'create_animation': {
          if (!input.title || !input.conceptPrompt) {
            return {
              success: false,
              agentId: this.definition.id,
              error: 'Fields "title" and "conceptPrompt" are required for create_animation.',
              executionTimeMs: Date.now() - startTime,
            };
          }
          const result = await this.animationManager.createAnimation(
            {
              title: input.title,
              conceptPrompt: input.conceptPrompt,
              style: input.style,
              durationSeconds: input.durationSeconds,
              fps: input.fps,
              characterName: input.characterName,
              transcriptVoice: input.transcriptVoice,
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

        case 'decompose_layers': {
          const result = await this.animationManager.decomposeLayers(
            {
              sceneTitle: input.title || 'Scene Concept',
              conceptPrompt: input.conceptPrompt || 'Layered scene',
              width: input.width || 1280,
              height: input.height || 720,
              characterName: input.characterName,
            },
            userId
          );
          return {
            success: true,
            agentId: this.definition.id,
            data: { layers: result, count: result.length },
            executionTimeMs: Date.now() - startTime,
          };
        }

        case 'rig_character': {
          const result = await this.animationManager.rigCharacter(
            input.characterName || 'Hero Avatar',
            userId
          );
          return {
            success: true,
            agentId: this.definition.id,
            data: result,
            executionTimeMs: Date.now() - startTime,
          };
        }

        case 'generate_motion_tracks': {
          const result = await this.animationManager.generateMotionTracks(
            input.durationSeconds || 6,
            userId
          );
          return {
            success: true,
            agentId: this.definition.id,
            data: { tracks: result, count: result.length },
            executionTimeMs: Date.now() - startTime,
          };
        }

        case 'generate_lip_sync': {
          if (!input.transcript) {
            return {
              success: false,
              agentId: this.definition.id,
              error: 'Field "transcript" is required for generate_lip_sync.',
              executionTimeMs: Date.now() - startTime,
            };
          }
          const result = await this.animationManager.generateLipSync(
            input.characterRigId || 'default_rig',
            input.transcript,
            input.durationSeconds || 5,
            userId
          );
          return {
            success: true,
            agentId: this.definition.id,
            data: result,
            executionTimeMs: Date.now() - startTime,
          };
        }

        case 'check_rendering_tools': {
          const result = await this.animationManager.checkRenderingTools(userId);
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
            error: `Unknown animation action "${(input as any).action}".`,
            executionTimeMs: Date.now() - startTime,
          };
      }
    } catch (err: any) {
      return {
        success: false,
        agentId: this.definition.id,
        error: err.message || 'Error executing animation action',
        executionTimeMs: Date.now() - startTime,
      };
    }
  }
}
