/**
 * JARVIS Phase 14 - Lip Sync & Viseme Speech Alignment Engine
 * Synchronizes voice transcripts with facial phoneme mouth shapes and timing tracks.
 */

import {
  LipSyncTrack,
  VisemeCue,
  VisemeMouthShape,
} from './animation.interface.js';

export class LipSyncEngine {
  private syncCount = 0;

  /**
   * Generates a timed viseme cue sequence from spoken transcript text and target duration.
   */
  public generateLipSync(
    characterRigId: string,
    transcript: string,
    durationSeconds: number = 5
  ): LipSyncTrack {
    const words = transcript.trim().split(/\s+/).filter(Boolean);
    const cues: VisemeCue[] = [];

    if (words.length === 0) {
      cues.push({
        timeSeconds: 0,
        durationSeconds,
        viseme: 'rest',
      });
      return { characterRigId, cues, totalCues: 1 };
    }

    const timePerWord = durationSeconds / words.length;
    let currentTime = 0;

    for (const word of words) {
      const clean = word.toLowerCase().replace(/[^a-z]/g, '');
      const visemes = this.mapWordToVisemes(clean);
      const timePerViseme = timePerWord / visemes.length;

      for (let i = 0; i < visemes.length; i++) {
        cues.push({
          timeSeconds: Math.round(currentTime * 100) / 100,
          durationSeconds: Math.round(timePerViseme * 100) / 100,
          viseme: visemes[i],
          word: i === 0 ? word : undefined,
        });
        currentTime += timePerViseme;
      }
    }

    // Add brief ending rest shape
    cues.push({
      timeSeconds: Math.round(currentTime * 100) / 100,
      durationSeconds: 0.3,
      viseme: 'rest',
    });

    this.syncCount++;

    return {
      characterRigId,
      cues,
      totalCues: cues.length,
    };
  }

  public getSyncCount(): number {
    return this.syncCount;
  }

  /**
   * Maps an English word into an approximation of viseme mouth phonemes.
   */
  private mapWordToVisemes(word: string): VisemeMouthShape[] {
    if (!word) return ['rest'];

    const seq: VisemeMouthShape[] = [];

    for (let i = 0; i < word.length; i++) {
      const ch = word[i];
      if ('aeiou'.includes(ch)) {
        if (ch === 'o' || ch === 'u') seq.push('O');
        else if (ch === 'e' || ch === 'i') seq.push('E');
        else seq.push('A');
      } else if ('bmp'.includes(ch)) {
        seq.push('BMP');
      } else if ('fv'.includes(ch)) {
        seq.push('FV');
      } else if ('ltdns'.includes(ch)) {
        seq.push('L');
      }
    }

    if (seq.length === 0) seq.push('rest');
    // Deduplicate consecutive identical visemes
    return seq.filter((v, idx) => idx === 0 || v !== seq[idx - 1]);
  }
}
