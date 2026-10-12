/**
 * JARVIS Phase 13 - Subtitle & Speech Audio Synthesis Engine
 */

import {
  SubtitleGenerationRequest,
  SubtitleGenerationResult,
  SubtitleEntry,
  SpeechSynthesisRequest,
  SpeechSynthesisSpec,
} from './creative.interface.js';

export class SubtitleAudioEngine {
  private subtitleCount = 0;
  private speechSpecCount = 0;

  /**
   * Generates timed subtitles in SRT or WebVTT format from raw text transcript.
   */
  public generateSubtitles(request: SubtitleGenerationRequest): SubtitleGenerationResult {
    const format = request.format || 'srt';
    const wordsPerLine = request.wordsPerLine || 7;
    const secondsPerWord = request.secondsPerWord || 0.4;

    const words = request.transcript.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      throw new Error('Transcript text cannot be empty.');
    }

    const entries: SubtitleEntry[] = [];
    let currentTimeSec = 0.5; // Start offset
    let index = 1;

    for (let i = 0; i < words.length; i += wordsPerLine) {
      const chunkWords = words.slice(i, i + wordsPerLine);
      const chunkText = chunkWords.join(' ');
      const duration = Math.max(1.2, chunkWords.length * secondsPerWord);

      const startTime = this.formatTimestamp(currentTimeSec, format);
      const endTime = this.formatTimestamp(currentTimeSec + duration, format);

      entries.push({
        index,
        startTime,
        endTime,
        text: chunkText,
      });

      currentTimeSec += duration + 0.2; // 200ms gap
      index++;
    }

    const content = this.formatSubtitleContent(entries, format);
    this.subtitleCount++;

    return {
      format,
      content,
      entryCount: entries.length,
      durationSeconds: Math.round(currentTimeSec * 10) / 10,
    };
  }

  /**
   * Generates an SSML speech synthesis specification with prosody, pitch, and pauses.
   */
  public synthesizeSpeechSpec(request: SpeechSynthesisRequest): SpeechSynthesisSpec {
    const text = request.text.trim();
    if (!text) {
      throw new Error('Text is required for speech synthesis specification.');
    }

    const voiceGender = request.voiceGender || 'neutral';
    const rate = Math.max(0.5, Math.min(request.speakingRate || 1.0, 2.0));
    const pitch = Math.max(-20, Math.min(request.pitch || 0, 20));

    const words = text.split(/\s+/).filter(Boolean);
    const wordCount = words.length;

    // Normal speech rate is ~140 words per minute (2.33 words/sec)
    const baseSeconds = wordCount / 2.33;
    const estimatedDurationSeconds = Math.round((baseSeconds / rate) * 10) / 10;

    // Build standard W3C SSML
    const sentences = text.match(/[^.!?]+[.!?]+|\s*[^.!?]+$/g) || [text];
    const pitchStr = pitch >= 0 ? `+${pitch}%` : `${pitch}%`;
    const rateStr = `${Math.round(rate * 100)}%`;

    const bodySsml = sentences
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => `    <s>${this.escapeXml(s)}</s>\n    <break time="250ms"/>`)
      .join('\n');

    const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
  <voice gender="${voiceGender}">
    <prosody rate="${rateStr}" pitch="${pitchStr}">
${bodySsml}
    </prosody>
  </voice>
</speak>`;

    const id = `ssml_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    this.speechSpecCount++;

    return {
      id,
      text,
      voiceGender,
      speakingRate: rate,
      pitch,
      ssml,
      estimatedDurationSeconds,
      wordCount,
    };
  }

  public getSubtitleCount(): number {
    return this.subtitleCount;
  }

  public getSpeechSpecCount(): number {
    return this.speechSpecCount;
  }

  private formatTimestamp(seconds: number, format: 'srt' | 'vtt'): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const millis = Math.floor((seconds - Math.floor(seconds)) * 1000);

    const pad = (n: number, z = 2) => String(n).padStart(z, '0');
    const sep = format === 'srt' ? ',' : '.';

    return `${pad(hours)}:${pad(minutes)}:${pad(secs)}${sep}${pad(millis, 3)}`;
  }

  private formatSubtitleContent(entries: SubtitleEntry[], format: 'srt' | 'vtt'): string {
    if (format === 'vtt') {
      const vttLines = ['WEBVTT', ''];
      for (const e of entries) {
        vttLines.push(String(e.index));
        vttLines.push(`${e.startTime} --> ${e.endTime}`);
        vttLines.push(e.text);
        vttLines.push('');
      }
      return vttLines.join('\n');
    }

    // SRT format
    const srtLines: string[] = [];
    for (const e of entries) {
      srtLines.push(String(e.index));
      srtLines.push(`${e.startTime} --> ${e.endTime}`);
      srtLines.push(e.text);
      srtLines.push('');
    }
    return srtLines.join('\n');
  }

  private escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}
