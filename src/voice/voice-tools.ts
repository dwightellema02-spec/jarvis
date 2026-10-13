/**
 * JARVIS Phase 20 - Voice & Audio Intelligence Tool Definitions
 * 8 Registered Tools for Wake Word Listening, STT, TTS, Acoustic Analysis, and Mute Control.
 */

import {
  ITool,
  ToolDefinition,
  ToolExecutionContext,
  ToolExecutionResult,
} from '../tools/tool.interface.js';
import { VoiceManager } from './voice-manager.js';
import { ResourceType, PermissionLevel } from '../security/types.js';

/**
 * 1. VoiceWakeWordListenTool: voice.wake_word_listen
 */
export class VoiceWakeWordListenTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'voice.wake_word_listen',
    name: 'Listen for Wake Word',
    description: 'Scans an audio stream chunk or text utterance for "Hey Jarvis" or "Jarvis".',
    version: '1.0.0',
    requiredPermissions: [
      { resource: ResourceType.MICROPHONE, action: 'read', level: PermissionLevel.READ },
    ],
    parametersSchema: {
      type: 'object',
      properties: {
        inputAudioOrText: { type: 'string' },
        text: { type: 'string' },
      },
    },
    status: 'implemented',
  };

  constructor(private readonly manager: VoiceManager) {}

  public async execute(params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const p = (params || {}) as { inputAudioOrText?: string; text?: string };
      const input = p.inputAudioOrText || p.text || 'hey jarvis';
      const result = this.manager.listenForWakeWord(input, context.userId);
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
 * 2. VoiceTranscribeAudioTool: voice.transcribe_audio
 */
export class VoiceTranscribeAudioTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'voice.transcribe_audio',
    name: 'Speech to Text Transcriber',
    description: 'Transcribes voice audio recordings into timestamped text words and sentences.',
    version: '1.0.0',
    requiredPermissions: [
      { resource: ResourceType.MICROPHONE, action: 'read', level: PermissionLevel.READ },
    ],
    parametersSchema: {
      type: 'object',
      properties: {
        audioPayload: { type: 'string' },
        text: { type: 'string' },
        languageHint: { type: 'string' },
      },
    },
    status: 'implemented',
  };

  constructor(private readonly manager: VoiceManager) {}

  public async execute(params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const p = (params || {}) as { audioPayload?: string; text?: string; languageHint?: string };
      const payload = p.audioPayload || p.text || '';
      const lang = p.languageHint || 'en';
      const result = await this.manager.transcribeAudio(payload, lang, context.userId);
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
 * 3. VoiceSynthesizeSpeechTool: voice.synthesize_speech
 */
export class VoiceSynthesizeSpeechTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'voice.synthesize_speech',
    name: 'Text to Speech Synthesizer',
    description: 'Converts text into natural voice audio with phoneme timings and PCM WAV audio data.',
    version: '1.0.0',
    requiredPermissions: [
      { resource: ResourceType.MICROPHONE, action: 'execute', level: PermissionLevel.EXECUTE },
    ],
    parametersSchema: {
      type: 'object',
      properties: {
        text: { type: 'string' },
        personaId: { type: 'string' },
        emotion: { type: 'string' },
        pitch: { type: 'number' },
        rate: { type: 'number' },
        format: { type: 'string' },
      },
      required: ['text'],
    },
    status: 'implemented',
  };

  constructor(private readonly manager: VoiceManager) {}

  public async execute(params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const p = (params || {}) as any;
      const result = await this.manager.synthesizeSpeech(
        {
          text: p.text || 'JARVIS systems nominal.',
          personaId: p.personaId,
          emotion: p.emotion,
          pitch: p.pitch,
          rate: p.rate,
          format: p.format,
        },
        context.userId
      );
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
 * 4. VoiceAnalyzeAcousticsTool: voice.analyze_acoustics
 */
export class VoiceAnalyzeAcousticsTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'voice.analyze_acoustics',
    name: 'Analyze Acoustic Environment',
    description: 'Measures ambient decibel SPL levels, SNR ratios, and dominant frequency peaks.',
    version: '1.0.0',
    requiredPermissions: [
      { resource: ResourceType.MICROPHONE, action: 'read', level: PermissionLevel.READ },
    ],
    parametersSchema: {
      type: 'object',
      properties: {
        audioSamples: { type: 'array' },
      },
    },
    status: 'implemented',
  };

  constructor(private readonly manager: VoiceManager) {}

  public async execute(params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const p = (params || {}) as { audioSamples?: number[] };
      const samples = p.audioSamples || [];
      const result = this.manager.analyzeAcoustics(samples, context.userId);
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
 * 5. VoiceSetVoicePersonaTool: voice.set_voice_persona
 */
export class VoiceSetVoicePersonaTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'voice.set_voice_persona',
    name: 'Set Voice Persona',
    description: 'Switches the active speech synthesis persona (JARVIS Classic, Friday, Nexus, LET Mentor).',
    version: '1.0.0',
    requiredPermissions: [
      { resource: ResourceType.MICROPHONE, action: 'write', level: PermissionLevel.WRITE },
    ],
    parametersSchema: {
      type: 'object',
      properties: {
        personaId: { type: 'string' },
      },
      required: ['personaId'],
    },
    status: 'implemented',
  };

  constructor(private readonly manager: VoiceManager) {}

  public async execute(params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const p = (params || {}) as { personaId: any };
      const personaId = p.personaId || 'jarvis-classic';
      const result = this.manager.setVoicePersona(personaId, context.userId);
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
 * 6. VoiceDetectSoundEventsTool: voice.detect_sound_events
 */
export class VoiceDetectSoundEventsTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'voice.detect_sound_events',
    name: 'Detect Environmental Sound Events',
    description: 'Classifies ambient sound events such as speech, alarms, keyboard typing, or applause.',
    version: '1.0.0',
    requiredPermissions: [
      { resource: ResourceType.MICROPHONE, action: 'read', level: PermissionLevel.READ },
    ],
    parametersSchema: {
      type: 'object',
      properties: {
        audioSamples: { type: 'array' },
      },
    },
    status: 'implemented',
  };

  constructor(private readonly manager: VoiceManager) {}

  public async execute(params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const p = (params || {}) as { audioSamples?: number[] };
      const samples = p.audioSamples || [];
      const result = this.manager.analyzeAcoustics(samples, context.userId);
      return {
        success: true,
        toolId: this.definition.id,
        data: result.detectedEvents,
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
 * 7. VoiceMuteMicrophoneTool: voice.mute_microphone
 */
export class VoiceMuteMicrophoneTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'voice.mute_microphone',
    name: 'Hardware Microphone Mute Control',
    description: 'Toggles the hardware-level mute state to prevent all audio acquisition.',
    version: '1.0.0',
    requiredPermissions: [
      { resource: ResourceType.MICROPHONE, action: 'write', level: PermissionLevel.WRITE },
    ],
    parametersSchema: {
      type: 'object',
      properties: {
        muted: { type: 'boolean' },
      },
    },
    status: 'implemented',
  };

  constructor(private readonly manager: VoiceManager) {}

  public async execute(params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const p = (params || {}) as { muted?: boolean };
      const muted = p.muted ?? true;
      const result = this.manager.setMute(muted, context.userId);
      return {
        success: true,
        toolId: this.definition.id,
        data: { muted: result },
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
 * 8. VoiceAudioStreamStatusTool: voice.audio_stream_status
 */
export class VoiceAudioStreamStatusTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'voice.audio_stream_status',
    name: 'Get Audio Stream Status',
    description: 'Inspects active microphone status, hardware privacy indicator state, and device telemetry.',
    version: '1.0.0',
    requiredPermissions: [
      { resource: ResourceType.MICROPHONE, action: 'read', level: PermissionLevel.READ },
    ],
    parametersSchema: {
      type: 'object',
      properties: {},
    },
    status: 'implemented',
  };

  constructor(private readonly manager: VoiceManager) {}

  public async execute(_params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const result = this.manager.getMicrophoneStatus(context.userId);
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
 * Factory creating all 8 Voice Tools.
 */
export function createVoiceTools(voiceManager: VoiceManager): ITool[] {
  return [
    new VoiceWakeWordListenTool(voiceManager),
    new VoiceTranscribeAudioTool(voiceManager),
    new VoiceSynthesizeSpeechTool(voiceManager),
    new VoiceAnalyzeAcousticsTool(voiceManager),
    new VoiceSetVoicePersonaTool(voiceManager),
    new VoiceDetectSoundEventsTool(voiceManager),
    new VoiceMuteMicrophoneTool(voiceManager),
    new VoiceAudioStreamStatusTool(voiceManager),
  ];
}
