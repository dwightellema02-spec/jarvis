/**
 * Tests for Phase 14 Animation Pipeline, Layers, Rigs, Motion, and Lip Sync
 */

import { describe, it, expect } from 'vitest';
import { AssetLayerEngine } from '../../src/animation/asset-layer-engine.js';
import { CharacterRigEngine } from '../../src/animation/character-rig-engine.js';
import { KeyframeMotionEngine } from '../../src/animation/keyframe-motion-engine.js';
import { LipSyncEngine } from '../../src/animation/lip-sync-engine.js';
import { AnimationRenderPipeline } from '../../src/animation/animation-render-pipeline.js';

describe('Phase 14: AssetLayerEngine', () => {
  it('decomposes a scene into 7 hierarchical animatable SVG planes', () => {
    const engine = new AssetLayerEngine();
    const layers = engine.decomposeLayers({
      sceneTitle: 'Hero Awakening',
      conceptPrompt: 'Cybernetic avatar standing before mainframe terminal',
      width: 1280,
      height: 720,
      characterName: 'Avatar Prime',
    });

    expect(layers).toHaveLength(7);
    const layerIds = layers.map((l) => l.id);
    expect(layerIds).toContain('layer_bg');
    expect(layerIds).toContain('layer_mid');
    expect(layerIds).toContain('layer_char_body');
    expect(layerIds).toContain('layer_char_head');
    expect(layerIds).toContain('layer_char_mouth');
    expect(layerIds).toContain('layer_char_arms');
    expect(layerIds).toContain('layer_fg');

    // Verify z-index ordering
    const bg = layers.find((l) => l.id === 'layer_bg')!;
    const body = layers.find((l) => l.id === 'layer_char_body')!;
    const fg = layers.find((l) => l.id === 'layer_fg')!;
    expect(bg.zIndex).toBeLessThan(body.zIndex);
    expect(body.zIndex).toBeLessThan(fg.zIndex);
  });
});

describe('Phase 14: CharacterRigEngine', () => {
  it('builds skeletal joint hierarchy, poses, and viseme shapes', () => {
    const rigEngine = new CharacterRigEngine();
    const rig = rigEngine.createCharacterRig('Dwight Avatar');

    expect(rig.characterName).toBe('Dwight Avatar');
    expect(rig.joints.length).toBeGreaterThan(10);

    const rootHip = rig.joints.find((j) => j.name === 'root_hip');
    expect(rootHip).toBeDefined();
    expect(rootHip?.parent).toBeUndefined();

    const head = rig.joints.find((j) => j.name === 'head');
    expect(head?.parent).toBe('neck');

    expect(rig.availablePoses['idle']).toBeDefined();
    expect(rig.availablePoses['talk']).toBeDefined();
    expect(rig.availablePoses['walk']).toBeDefined();

    expect(rig.mouthShapes['rest']).toBeDefined();
    expect(rig.mouthShapes['A']).toBeDefined();
    expect(rig.mouthShapes['O']).toBeDefined();
    expect(rig.mouthShapes['BMP']).toBeDefined();
  });
});

describe('Phase 14: KeyframeMotionEngine', () => {
  it('generates multi-layer motion tracks and evaluates mathematical easing', () => {
    const motionEngine = new KeyframeMotionEngine();
    const tracks = motionEngine.generateMotionTracks(6);

    expect(tracks.length).toBeGreaterThanOrEqual(4);
    const bodyTrack = tracks.find((t) => t.targetLayerId === 'layer_char_body')!;
    expect(bodyTrack.property).toBe('translateY');
    expect(bodyTrack.keyframes.length).toBe(5);

    // Easing evaluations
    expect(motionEngine.evaluateEasing(0, 'linear')).toBe(0);
    expect(motionEngine.evaluateEasing(1, 'linear')).toBe(1);
    expect(motionEngine.evaluateEasing(0.5, 'ease_in')).toBeCloseTo(0.25, 2);

    const css = motionEngine.renderCssKeyframes(tracks, 6);
    expect(css).toContain('@keyframes');
    expect(css).toContain('#layer_char_body');
    expect(css).toContain('transform: translateY');
  });

  it('renders SVG SMIL tags for standalone animation', () => {
    const motionEngine = new KeyframeMotionEngine();
    const tracks = motionEngine.generateMotionTracks(6);
    const headTrack = tracks.find((t) => t.targetLayerId === 'layer_char_head')!;

    const smil = motionEngine.renderSmilTags(headTrack, 6, 640, 320);
    expect(smil).toContain('<animateTransform');
    expect(smil).toContain('type="rotate"');
    expect(smil).toContain('dur="6s"');
  });
});

describe('Phase 14: LipSyncEngine', () => {
  it('maps voice transcripts to timed viseme cues', () => {
    const lipEngine = new LipSyncEngine();
    const transcript = 'Welcome Dwight to the animation studio.';

    const track = lipEngine.generateLipSync('rig_test', transcript, 4);

    expect(track.characterRigId).toBe('rig_test');
    expect(track.totalCues).toBeGreaterThan(5);
    expect(track.cues[0].timeSeconds).toBe(0);

    const visemes = track.cues.map((c) => c.viseme);
    expect(visemes).toContain('O');
    expect(visemes).toContain('A');
    expect(visemes[visemes.length - 1]).toBe('rest');
  });
});

describe('Phase 14: AnimationRenderPipeline', () => {
  it('executes full 7-stage Bring-It-Alive composition', () => {
    const pipeline = new AnimationRenderPipeline();

    const project = pipeline.buildAnimation({
      title: 'JARVIS Alive',
      conceptPrompt: 'Holographic avatar speaking from central console terminal',
      durationSeconds: 5,
      fps: 30,
      characterName: 'Avatar',
      transcriptVoice: 'All systems online.',
    });

    expect(project.id).toBeDefined();
    expect(project.totalFrames).toBe(150);
    expect(project.animatedSvgMarkup).toContain('<svg');
    expect(project.animatedSvgMarkup).toContain('layer_char_head');
    expect(project.animatedSvgMarkup).toContain('@keyframes');

    expect(project.htmlPlayer).toContain('JARVIS Alive - JARVIS Animated Player');
    expect(project.htmlPlayer).toContain('id="scrubber"');

    const manifest = JSON.parse(project.renderManifestJson);
    expect(manifest.project).toBe('JARVIS Alive');
    expect(manifest.fps).toBe(30);
    expect(manifest.cliExportCommands.ffmpegPngSequence).toContain('ffmpeg');
  });

  it('audits host system rendering tools honestly', () => {
    const pipeline = new AnimationRenderPipeline();
    const tools = pipeline.checkRenderingTools();

    expect(tools.canvasSupported).toBe(true);
    expect(tools.svgSmilSupported).toBe(true);
    expect(typeof tools.ffmpegInstalled).toBe('boolean');
    expect(tools.notes.length).toBeGreaterThan(0);
  });
});
