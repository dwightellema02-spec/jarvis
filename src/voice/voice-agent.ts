/**
 * JARVIS Phase 20 - Voice & Audio Intelligence Agent Implementation
 * Autonomous auditory agent coordinating speech transcription, speech synthesis, and acoustics.
 */

import {
  IAgent,
  AgentDefinition,
  AgentExecutionContext,
  AgentExecutionResult,
} from '../agents/agent.interface.js';
import { VoiceManager } from './voice-manager.js';
import { ResourceType, PermissionLevel } from '../security/types.js';
import { SpeechEmotion, VoicePersonaId } from './voice.interface.js';

export interface VoiceAgentInput {
  action:
    | 'wake_word_listen'
    | 'transcribe_audio'
    | 'synthesize_speech'
    | 'analyze_acoustics'
    | 'set_voice_persona'
    | 'detect_sound_events'
    | 'mute_microphone'
    | 'audio_stream_status';
  text?: string;
  inputAudioOrText?: string;
  audioPayload?: string;
  audioSamples?: number[];
  languageHint?: string;
  personaId?: VoicePersonaId;
  emotion?: SpeechEmotion;
  pitch?: number;
  rate?: number;
  muted?: boolean;
}

export class VoiceAgent implements IAgent {
  public readonly definition: AgentDefinition = {
    id: 'voice-agent',
    name: 'JARVIS Voice & Audio Intelligence Agent',
    description:
      'Auditory perception and speech reasoning agent capable of real-time microphone stream ingestion, speech-to-text, text-to-speech synthesis, acoustic analysis, and wake word detection.',
    version: '1.0.0',
    capabilities: [
      'wake_word_listen',
      'transcribe_audio',
      'synthesize_speech',
      'analyze_acoustics',
      'set_voice_persona',
      'detect_sound_events',
      'mute_microphone',
      'audio_stream_status',
    ],
    requiredPermissions: [
      {
        resource: ResourceType.MICROPHONE,
        action: 'read',
        level: PermissionLevel.READ,
      },
    ],
    inputSchema: {
      type: 'object',
      properties: {
        action: {
          type: 'string',
          enum: [
            'wake_word_listen',
            'transcribe_audio',
            'synthesize_speech',
            'analyze_acoustics',
            'set_voice_persona',
            'detect_sound_events',
            'mute_microphone',
            'audio_stream_status',
          ],
        },
        text: { type: 'string' },
        inputAudioOrText: { type: 'string' },
        audioPayload: { type: 'string' },
        languageHint: { type: 'string' },
        personaId: { type: 'string' },
        emotion: { type: 'string' },
        pitch: { type: 'number' },
        rate: { type: 'number' },
        muted: { type: 'boolean' },
      },
      required: ['action'],
    },
    outputSchema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'any' },
        message: { type: 'string' },
      },
    },
    status: 'implemented',
  };

  constructor(private voiceManager: VoiceManager) {}

  public async execute(rawInput: unknown, context: AgentExecutionContext): Promise<AgentExecutionResult> {
    const start = Date.now();
    const input = (rawInput || {}) as VoiceAgentInput;
    const userId = context.userId || 'default_user';

    try {
      let data: any;

      switch (input.action) {
        case 'wake_word_listen': {
          const textVal = input.inputAudioOrText || input.text || 'hey jarvis';
          data = this.voiceManager.listenForWakeWord(textVal, userId);
          break;
        }

        case 'transcribe_audio': {
          const payload = input.audioPayload || input.text || '';
          const lang = input.languageHint || 'en';
          data = await this.voiceManager.transcribeAudio(payload, lang, userId);
          break;
        }

        case 'synthesize_speech': {
          data = await this.voiceManager.synthesizeSpeech(
            {
              text: input.text || 'JARVIS systems operational.',
              personaId: input.personaId,
              emotion: input.emotion,
              pitch: input.pitch,
              rate: input.rate,
            },
            userId
          );
          break;
        }

        case 'analyze_acoustics':
        case 'detect_sound_events': {
          const samples = input.audioSamples || [];
          data = this.voiceManager.analyzeAcoustics(samples, userId);
          break;
        }

        case 'set_voice_persona': {
          const personaId = input.personaId || 'jarvis-classic';
          data = this.voiceManager.setVoicePersona(personaId, userId);
          break;
        }

        case 'mute_microphone': {
          const muted = input.muted ?? true;
          data = { muted: this.voiceManager.setMute(muted, userId) };
          break;
        }

        case 'audio_stream_status':
        default: {
          data = this.voiceManager.getMicrophoneStatus(userId);
          break;
        }
      }

      return {
        success: true,
        agentId: this.definition.id,
        data,
        executionTimeMs: Date.now() - start,
      };
    } catch (err: any) {
      return {
        success: false,
        agentId: this.definition.id,
        error: err.message,
        executionTimeMs: Date.now() - start,
      };
    }
  }
}
