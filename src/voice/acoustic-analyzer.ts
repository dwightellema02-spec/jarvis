/**
 * JARVIS Phase 20 - Acoustic Analyzer & Sound Event Detection (SED)
 * Analyzes audio energy, decibel levels, SNR, and environmental acoustic events.
 */

import {
  AcousticAnalysisResult,
  SoundEvent,
  SoundEventType,
} from './voice.interface.js';

export class AcousticAnalyzer {
  /**
   * Analyzes an audio waveform or simulated acoustic environment.
   */
  public analyze(audioSamples: number[] = []): AcousticAnalysisResult {
    const now = new Date().toISOString();

    if (!audioSamples || audioSamples.length === 0) {
      // Default ambient cockpit acoustics
      return {
        dbLevel: 42.5,
        snrRatio: 18.2,
        noiseFloorDb: 35.0,
        frequencyPeakHz: 250,
        detectedEvents: [
          {
            type: 'ambient_silence',
            confidence: 0.94,
            dbLevel: 38.0,
            timestamp: now,
          },
        ],
        clarityScore: 0.95,
        safetyAlerts: [],
      };
    }

    // Calculate RMS and Decibel SPL approximation
    const sumSquares = audioSamples.reduce((sum, val) => sum + val * val, 0);
    const rms = Math.sqrt(sumSquares / audioSamples.length);
    // Reference 0 dB SPL threshold
    const dbLevel = Math.max(20, Math.min(120, Number((20 * Math.log10(rms + 0.0001) + 90).toFixed(1))));
    const noiseFloorDb = 36.0;
    const snrRatio = Math.max(0, Number((dbLevel - noiseFloorDb).toFixed(1)));

    // Spectral peak estimation from sample changes
    let zeroCrossings = 0;
    for (let i = 1; i < audioSamples.length; i++) {
      if ((audioSamples[i] >= 0 && audioSamples[i - 1] < 0) || (audioSamples[i] < 0 && audioSamples[i - 1] >= 0)) {
        zeroCrossings++;
      }
    }
    const sampleRate = 16000;
    const frequencyPeakHz = Math.round((zeroCrossings * sampleRate) / (2 * audioSamples.length));

    // Sound Event Detection (SED) heuristics
    const detectedEvents: SoundEvent[] = [];
    const safetyAlerts: string[] = [];

    if (dbLevel > 85.0) {
      safetyAlerts.push('Acoustic hazard warning: Ambient noise exceeds 85 dB threshold.');
    }

    if (frequencyPeakHz > 2500 && dbLevel > 65.0) {
      detectedEvents.push({
        type: 'alert_alarm',
        confidence: 0.89,
        dbLevel,
        timestamp: now,
      });
      safetyAlerts.push('Acoustic Alert: High-frequency alarm pattern detected.');
    } else if (frequencyPeakHz >= 85 && frequencyPeakHz <= 450 && dbLevel > 48.0) {
      detectedEvents.push({
        type: 'speech',
        confidence: 0.95,
        dbLevel,
        timestamp: now,
      });
    } else if (frequencyPeakHz > 1200 && dbLevel > 50.0) {
      detectedEvents.push({
        type: 'keyboard_typing',
        confidence: 0.88,
        dbLevel,
        timestamp: now,
      });
    } else if (dbLevel > 55.0) {
      detectedEvents.push({
        type: 'background_noise',
        confidence: 0.75,
        dbLevel,
        timestamp: now,
      });
    } else {
      detectedEvents.push({
        type: 'ambient_silence',
        confidence: 0.92,
        dbLevel,
        timestamp: now,
      });
    }

    const clarityScore = Math.min(1.0, Math.max(0.2, Number((snrRatio / 30).toFixed(2))));

    return {
      dbLevel,
      snrRatio,
      noiseFloorDb,
      frequencyPeakHz,
      detectedEvents,
      clarityScore,
      safetyAlerts,
    };
  }
}
