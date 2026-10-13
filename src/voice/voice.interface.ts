/**
 * JARVIS Phase 20 - Voice & Audio Intelligence Data Contracts
 */

export type MicrophoneStatus = 'idle' | 'listening' | 'recording' | 'muted' | 'blocked' | 'error';

export interface MicrophoneDeviceInfo {
  id: string;
  name: string;
  isDefault: boolean;
  channels: number;
  sampleRate: number;
  bitDepth: number;
}

export interface WakeWordDetectionResult {
  detected: boolean;
  wakeWord?: 'hey jarvis' | 'jarvis';
  confidence: number;
  timestamp: string;
  audioChunkMs: number;
}

export interface VadSegment {
  startTimeMs: number;
  endTimeMs: number;
  speechProbability: number;
  isSpeech: boolean;
}

export interface TranscribedWord {
  word: string;
  startTimeMs: number;
  endTimeMs: number;
  confidence: number;
}

export interface TranscriptionResult {
  text: string;
  confidence: number;
  language: string;
  durationMs: number;
  words: TranscribedWord[];
  source: 'whisper' | 'webspeech' | 'simulated';
}

export type VoicePersonaId = 'jarvis-classic' | 'friday-us' | 'nexus-neutral' | 'let-mentor';

export type SpeechEmotion = 'friendly' | 'authoritative' | 'urgent' | 'focused' | 'socratic';

export interface VoicePersona {
  id: VoicePersonaId;
  name: string;
  description: string;
  pitchMultiplier: number;
  speedMultiplier: number;
  accent: string;
  emotion: SpeechEmotion;
}

export interface SpeechSynthesisRequest {
  text: string;
  personaId?: VoicePersonaId;
  emotion?: SpeechEmotion;
  pitch?: number;
  rate?: number;
  format?: 'audio/wav' | 'audio/mp3';
}

export interface PhonemeTiming {
  phoneme: string;
  startMs: number;
  endMs: number;
}

export interface SpeechSynthesisResult {
  audioBase64: string;
  format: 'audio/wav' | 'audio/mp3';
  durationMs: number;
  sampleRate: number;
  phonemes: PhonemeTiming[];
  waveform: number[];
  voicePersona: VoicePersona;
}

export type SoundEventType =
  | 'speech'
  | 'applause'
  | 'keyboard_typing'
  | 'alert_alarm'
  | 'door_knock'
  | 'ambient_silence'
  | 'background_noise';

export interface SoundEvent {
  type: SoundEventType;
  confidence: number;
  dbLevel: number;
  timestamp: string;
}

export interface AcousticAnalysisResult {
  dbLevel: number;
  snrRatio: number;
  noiseFloorDb: number;
  frequencyPeakHz: number;
  detectedEvents: SoundEvent[];
  clarityScore: number;
  safetyAlerts: string[];
}
