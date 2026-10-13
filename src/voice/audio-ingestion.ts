/**
 * JARVIS Phase 20 - Audio Ingestion & Microphone Streaming Manager
 * Manages audio capture, microphone hardware indicator invariants, VAD, and wake word detection.
 */

import {
  MicrophoneDeviceInfo,
  MicrophoneStatus,
  WakeWordDetectionResult,
  VadSegment,
} from './voice.interface.js';

export interface AudioIngestionConfig {
  defaultDeviceId?: string;
  maxStreamFps?: number;
  energyThreshold?: number;
}

export class AudioIngestionManager {
  private devices: MicrophoneDeviceInfo[] = [];
  private status: MicrophoneStatus = 'idle';
  private indicatorActive = false;
  private isMuted = false;
  private activeDeviceId: string;
  private lastStreamTime = 0;
  private minIntervalMs: number;
  private energyThreshold: number;

  constructor(config: AudioIngestionConfig = {}) {
    const maxFps = config.maxStreamFps ?? 10;
    this.minIntervalMs = Math.floor(1000 / maxFps);
    this.energyThreshold = config.energyThreshold ?? 0.05;

    this.devices = [
      {
        id: 'mic_integrated_array',
        name: 'Integrated Studio Microphone Array (Stereo)',
        isDefault: true,
        channels: 2,
        sampleRate: 48000,
        bitDepth: 24,
      },
      {
        id: 'mic_studio_cardioid',
        name: 'Pro Broadcast Cardioid Condenser (USB)',
        isDefault: false,
        channels: 1,
        sampleRate: 96000,
        bitDepth: 32,
      },
    ];

    this.activeDeviceId = config.defaultDeviceId || this.devices[0].id;
  }

  public getStatus(): {
    status: MicrophoneStatus;
    indicatorActive: boolean;
    isMuted: boolean;
    activeDeviceId: string;
  } {
    return {
      status: this.isMuted ? 'muted' : this.status,
      indicatorActive: this.isMuted ? false : this.indicatorActive,
      isMuted: this.isMuted,
      activeDeviceId: this.activeDeviceId,
    };
  }

  public getAvailableDevices(): MicrophoneDeviceInfo[] {
    return [...this.devices];
  }

  public setActiveDevice(deviceId: string): boolean {
    const found = this.devices.find((d) => d.id === deviceId);
    if (!found) return false;
    this.activeDeviceId = deviceId;
    return true;
  }

  public setMute(muted: boolean): boolean {
    this.isMuted = muted;
    if (muted) {
      this.status = 'muted';
      this.indicatorActive = false;
    } else {
      this.status = 'idle';
    }
    return this.isMuted;
  }

  /**
   * Evaluates incoming audio buffer or textual chunk for the "Hey Jarvis" or "Jarvis" wake word.
   */
  public detectWakeWord(inputAudioOrText: string): WakeWordDetectionResult {
    const now = new Date().toISOString();
    if (this.isMuted) {
      return {
        detected: false,
        confidence: 0,
        timestamp: now,
        audioChunkMs: 500,
      };
    }

    const normalized = inputAudioOrText.toLowerCase().trim();
    if (normalized.includes('hey jarvis')) {
      this.indicatorActive = true;
      this.status = 'listening';
      setTimeout(() => {
        this.status = 'idle';
        this.indicatorActive = false;
      }, 2000);

      return {
        detected: true,
        wakeWord: 'hey jarvis',
        confidence: 0.98,
        timestamp: now,
        audioChunkMs: 640,
      };
    }

    if (/\bjarvis\b/.test(normalized)) {
      this.indicatorActive = true;
      this.status = 'listening';
      setTimeout(() => {
        this.status = 'idle';
        this.indicatorActive = false;
      }, 2000);

      return {
        detected: true,
        wakeWord: 'jarvis',
        confidence: 0.94,
        timestamp: now,
        audioChunkMs: 480,
      };
    }

    return {
      detected: false,
      confidence: 0.1,
      timestamp: now,
      audioChunkMs: 500,
    };
  }

  /**
   * Performs Voice Activity Detection (VAD) on an audio buffer/stream.
   * Partitions audio into speech vs silence segments.
   */
  public analyzeVoiceActivity(audioSamples: number[] = []): VadSegment[] {
    if (this.isMuted || audioSamples.length === 0) {
      return [
        {
          startTimeMs: 0,
          endTimeMs: 500,
          speechProbability: 0.0,
          isSpeech: false,
        },
      ];
    }

    const segments: VadSegment[] = [];
    const chunkSize = 160; // 10ms at 16kHz
    const sampleDurationMs = 10;

    for (let i = 0; i < audioSamples.length; i += chunkSize) {
      const chunk = audioSamples.slice(i, i + chunkSize);
      const rms = Math.sqrt(
        chunk.reduce((sum, val) => sum + val * val, 0) / (chunk.length || 1)
      );

      const isSpeech = rms > this.energyThreshold;
      const speechProb = Math.min(1.0, Number((rms / (this.energyThreshold * 2)).toFixed(2)));
      const startMs = (i / chunkSize) * sampleDurationMs;
      const endMs = startMs + sampleDurationMs;

      segments.push({
        startTimeMs: startMs,
        endTimeMs: endMs,
        speechProbability: speechProb,
        isSpeech,
      });
    }

    return segments;
  }

  /**
   * Captures an audio stream chunk while enforcing privacy indicator and rate-limiting.
   */
  public acquireStreamChunk(): {
    chunkId: string;
    sampleRate: number;
    samples: number[];
    indicatorActive: boolean;
  } {
    if (this.isMuted) {
      throw new Error('Microphone is hardware-muted. Audio capture is blocked.');
    }

    const now = Date.now();
    if (now - this.lastStreamTime < this.minIntervalMs) {
      throw new Error(
        `Microphone capture rate limit exceeded. Enforcing ${this.minIntervalMs}ms interval.`
      );
    }
    this.lastStreamTime = now;

    // Activate hardware indicator
    this.status = 'recording';
    this.indicatorActive = true;

    // Synthesize 500ms of simulated sine audio waveform samples
    const samples: number[] = [];
    const sampleRate = 16000;
    const durationSec = 0.5;
    const totalSamples = Math.floor(sampleRate * durationSec);
    for (let i = 0; i < totalSamples; i++) {
      const t = i / sampleRate;
      // 440Hz fundamental tone with 0.1 noise
      const val = 0.4 * Math.sin(2 * Math.PI * 440 * t) + (Math.random() - 0.5) * 0.05;
      samples.push(Number(val.toFixed(4)));
    }

    setTimeout(() => {
      this.status = 'idle';
      this.indicatorActive = false;
    }, 1000);

    return {
      chunkId: `chunk_${now}_${Math.random().toString(36).substring(2, 7)}`,
      sampleRate,
      samples,
      indicatorActive: true,
    };
  }
}
