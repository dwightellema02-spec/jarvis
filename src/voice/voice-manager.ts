/**
 * JARVIS Phase 20 - Voice & Audio Intelligence Manager
 * Core orchestrator enforcing ResourceType.MICROPHONE permissions, privacy indicator invariants,
 * wake word recognition, STT, TTS, and acoustic analysis.
 */

import { AudioIngestionManager, AudioIngestionConfig } from './audio-ingestion.js';
import { SpeechToTextEngine } from './stt-engine.js';
import { TextToSpeechEngine } from './tts-engine.js';
import { AcousticAnalyzer } from './acoustic-analyzer.js';
import {
  MicrophoneDeviceInfo,
  MicrophoneStatus,
  WakeWordDetectionResult,
  TranscriptionResult,
  SpeechSynthesisRequest,
  SpeechSynthesisResult,
  VoicePersona,
  VoicePersonaId,
  AcousticAnalysisResult,
} from './voice.interface.js';
import { PermissionManager } from '../security/permission-manager.js';
import { SecurityGuardian } from '../security/guardian.js';
import { AuditLogger } from '../audit/audit-logger.js';
import {
  ResourceType,
  PermissionLevel,
  SecurityDecisionType,
  PermissionAction,
} from '../security/types.js';
import { PermissionDeniedError, SecurityBlockError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

export interface VoiceManagerDependencies {
  permissionManager?: PermissionManager;
  guardian?: SecurityGuardian;
  auditLogger?: AuditLogger;
  ingestionConfig?: AudioIngestionConfig;
}

export class VoiceManager {
  private ingestion: AudioIngestionManager;
  private stt: SpeechToTextEngine;
  private tts: TextToSpeechEngine;
  private acoustic: AcousticAnalyzer;
  private permissionManager?: PermissionManager;
  private guardian?: SecurityGuardian;
  private auditLogger?: AuditLogger;
  private activePersonaId: VoicePersonaId = 'jarvis-classic';

  constructor(deps: VoiceManagerDependencies = {}) {
    this.permissionManager = deps.permissionManager;
    this.guardian = deps.guardian;
    this.auditLogger = deps.auditLogger;
    this.ingestion = new AudioIngestionManager(deps.ingestionConfig);
    this.stt = new SpeechToTextEngine();
    this.tts = new TextToSpeechEngine();
    this.acoustic = new AcousticAnalyzer();

    logger.info('VoiceManager initialized with AudioIngestion, STT, TTS, and Acoustic Analyzer.', {
      context: 'jarvis',
    });
  }

  private checkPermission(
    userId: string,
    action: 'read' | 'write' | 'execute' | 'admin',
    level: PermissionLevel
  ): void {
    if (!this.permissionManager) return;
    const check = this.permissionManager.checkPermission({
      userId,
      resource: ResourceType.MICROPHONE,
      action,
      requiredLevel: level,
    });
    if (!check.allowed) {
      throw new PermissionDeniedError(ResourceType.MICROPHONE, action, level, {
        userId,
        reason: check.reason,
      });
    }
  }

  private evaluateThreat(userId: string, target: string, action: PermissionAction = 'open'): void {
    if (!this.guardian) return;
    const evaluation = this.guardian.evaluate({
      resource: ResourceType.MICROPHONE,
      action,
      target,
      userId,
    });
    if (evaluation.decision === SecurityDecisionType.DENY) {
      throw new SecurityBlockError(evaluation.reason, {
        threats: evaluation.threatsDetected,
      });
    }
  }

  private async auditLog(
    userId: string,
    action: string,
    details: string,
    success = true
  ): Promise<void> {
    if (!this.auditLogger) return;
    await this.auditLogger.log({
      user: userId,
      requestId: `req_voice_${Date.now()}`,
      resource: ResourceType.MICROPHONE,
      action: action as any,
      permissionRequired: PermissionLevel.READ,
      permissionGranted: PermissionLevel.READ,
      decision: success ? SecurityDecisionType.ALLOW : SecurityDecisionType.DENY,
      reason: details,
      result: success ? 'SUCCESS' : 'FAILED',
      durationMs: 1,
    });
  }

  public getMicrophoneStatus(userId = 'default_user'): {
    status: MicrophoneStatus;
    indicatorActive: boolean;
    isMuted: boolean;
    activeDeviceId: string;
    activePersona: VoicePersona;
  } {
    this.checkPermission(userId, 'read', PermissionLevel.READ);
    const status = this.ingestion.getStatus();
    return {
      ...status,
      activePersona: this.tts.getPersona(this.activePersonaId),
    };
  }

  public getAvailableMicrophones(userId = 'default_user'): MicrophoneDeviceInfo[] {
    this.checkPermission(userId, 'read', PermissionLevel.READ);
    return this.ingestion.getAvailableDevices();
  }

  public setMute(muted: boolean, userId = 'default_user'): boolean {
    this.checkPermission(userId, 'write', PermissionLevel.WRITE);
    const result = this.ingestion.setMute(muted);
    this.auditLog(userId, 'write', `Microphone mute state changed to ${muted}`);
    return result;
  }

  public listenForWakeWord(audioOrText: string, userId = 'default_user'): WakeWordDetectionResult {
    this.checkPermission(userId, 'read', PermissionLevel.READ);
    this.evaluateThreat(userId, audioOrText, 'read');
    const result = this.ingestion.detectWakeWord(audioOrText);
    if (result.detected) {
      this.auditLog(userId, 'read', `Wake word "${result.wakeWord}" detected`);
    }
    return result;
  }

  public async transcribeAudio(
    audioPayload: string | number[],
    languageHint = 'en',
    userId = 'default_user'
  ): Promise<TranscriptionResult> {
    this.checkPermission(userId, 'read', PermissionLevel.READ);
    const result = await this.stt.transcribe(audioPayload, languageHint);
    this.auditLog(userId, 'read', `Audio transcribed (${result.words.length} words)`);
    return result;
  }

  public async synthesizeSpeech(
    request: SpeechSynthesisRequest,
    userId = 'default_user'
  ): Promise<SpeechSynthesisResult> {
    this.checkPermission(userId, 'execute', PermissionLevel.EXECUTE);
    this.evaluateThreat(userId, request.text, 'execute');
    const personaId = request.personaId || this.activePersonaId;
    const result = await this.tts.synthesize({
      ...request,
      personaId,
    });
    this.auditLog(userId, 'execute', `Speech synthesized for persona ${personaId}`);
    return result;
  }

  public analyzeAcoustics(
    audioSamples: number[] = [],
    userId = 'default_user'
  ): AcousticAnalysisResult {
    this.checkPermission(userId, 'read', PermissionLevel.READ);
    const result = this.acoustic.analyze(audioSamples);
    this.auditLog(userId, 'read', `Acoustic analysis completed: ${result.dbLevel} dB`);
    return result;
  }

  public acquireStreamChunk(userId = 'default_user'): {
    chunkId: string;
    sampleRate: number;
    samples: number[];
    indicatorActive: boolean;
  } {
    this.checkPermission(userId, 'execute', PermissionLevel.EXECUTE);
    const result = this.ingestion.acquireStreamChunk();
    this.auditLog(userId, 'execute', 'Audio stream chunk acquired with active indicator');
    return result;
  }

  public getVoicePersonas(): VoicePersona[] {
    return this.tts.getPersonas();
  }

  public setVoicePersona(personaId: VoicePersonaId, userId = 'default_user'): VoicePersona {
    this.checkPermission(userId, 'write', PermissionLevel.WRITE);
    this.activePersonaId = personaId;
    const persona = this.tts.getPersona(personaId);
    this.auditLog(userId, 'write', `Switched active voice persona to ${personaId}`);
    return persona;
  }
}
