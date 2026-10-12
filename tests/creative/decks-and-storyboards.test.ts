/**
 * Tests for Phase 13 Presentation Builder, Subtitles & Audio Engine, and Storyboard Planner
 */

import { describe, it, expect } from 'vitest';
import { PresentationBuilder } from '../../src/creative/presentation-builder.js';
import { SubtitleAudioEngine } from '../../src/creative/subtitle-audio-engine.js';
import { StoryboardPlanner } from '../../src/creative/storyboard-planner.js';

describe('Phase 13: PresentationBuilder', () => {
  it('creates structured multi-slide decks with speaker notes and HTML export', () => {
    const builder = new PresentationBuilder();

    const deck = builder.createDeck({
      topic: 'Autonomous Multi-Agent AI Frameworks',
      targetAudience: 'Software Engineers & Architects',
      slideCount: 5,
      theme: 'jarvis_dark',
    });

    expect(deck.id).toBeDefined();
    expect(deck.totalSlides).toBe(5);
    expect(deck.estimatedMinutes).toBeGreaterThan(5);
    expect(deck.slides).toHaveLength(5);

    const firstSlide = deck.slides[0];
    expect(firstSlide.slideNumber).toBe(1);
    expect(firstSlide.bulletPoints.length).toBeGreaterThan(0);
    expect(firstSlide.speakerNotes).toBeDefined();

    expect(deck.htmlExport).toContain('<!DOCTYPE html>');
    expect(deck.htmlExport).toContain('Autonomous Multi-Agent AI Frameworks');
    expect(deck.htmlExport).toContain('slide-1');
  });
});

describe('Phase 13: SubtitleAudioEngine', () => {
  it('generates SRT and WebVTT subtitles with valid timestamps', () => {
    const engine = new SubtitleAudioEngine();
    const transcript =
      'Good morning Dwight. All systems are initialized and standing by. Your memory, second brain, and security guardian are fully active.';

    const srt = engine.generateSubtitles({ transcript, format: 'srt', wordsPerLine: 5 });
    expect(srt.format).toBe('srt');
    expect(srt.entryCount).toBeGreaterThan(2);
    expect(srt.content).toMatch(/1\n\d{2}:\d{2}:\d{2},\d{3} --> \d{2}:\d{2}:\d{2},\d{3}/);

    const vtt = engine.generateSubtitles({ transcript, format: 'vtt', wordsPerLine: 5 });
    expect(vtt.format).toBe('vtt');
    expect(vtt.content).toContain('WEBVTT');
    expect(vtt.content).toMatch(/\d{2}:\d{2}:\d{2}\.\d{3} --> \d{2}:\d{2}:\d{2}\.\d{3}/);
  });

  it('synthesizes W3C-compliant SSML with speaking rate and pitch', () => {
    const engine = new SubtitleAudioEngine();
    const text = 'Authorization granted. Executing planned tasks now.';

    const spec = engine.synthesizeSpeechSpec({
      text,
      voiceGender: 'neutral',
      speakingRate: 1.2,
      pitch: 5,
    });

    expect(spec.ssml).toContain('<speak');
    expect(spec.ssml).toContain('<voice gender="neutral">');
    expect(spec.ssml).toContain('rate="120%"');
    expect(spec.ssml).toContain('pitch="+5%"');
    expect(spec.estimatedDurationSeconds).toBeGreaterThan(0);
    expect(spec.wordCount).toBe(6);
  });

  it('rejects empty transcript or empty speech text', () => {
    const engine = new SubtitleAudioEngine();
    expect(() => engine.generateSubtitles({ transcript: '   ' })).toThrow('cannot be empty');
    expect(() => engine.synthesizeSpeechSpec({ text: '   ' })).toThrow('Text is required');
  });
});

describe('Phase 13: StoryboardPlanner', () => {
  it('plans cinematic video storyboards and generates valid JSON render manifest', () => {
    const planner = new StoryboardPlanner();

    const storyboard = planner.createStoryboard({
      projectTitle: 'JARVIS: Dawn of Autonomous Intelligence',
      concept: 'A human-in-the-loop AI guardian orchestrating tasks in high security',
      targetDurationSeconds: 30,
      sceneCount: 5,
    });

    expect(storyboard.id).toBeDefined();
    expect(storyboard.totalScenes).toBe(5);
    expect(storyboard.scenes).toHaveLength(5);
    expect(storyboard.scenes[0].cameraShot).toBe('wide');
    expect(storyboard.scenes[0].audioDialogue).toBeDefined();

    const manifest = JSON.parse(storyboard.renderManifestJson);
    expect(manifest.project).toBe('JARVIS: Dawn of Autonomous Intelligence');
    expect(manifest.canvas.fps).toBe(30);
    expect(manifest.scenes).toHaveLength(5);
  });
});
