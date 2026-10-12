/**
 * JARVIS Phase 13 - Cinematic Storyboard Planner & Video Manifest Engine
 */

import {
  StoryboardRequest,
  Storyboard,
  StoryboardScene,
} from './creative.interface.js';

export class StoryboardPlanner {
  private storyboardsCount = 0;

  /**
   * Plans a scene-by-scene storyboard and produces an executable render manifest.
   */
  public createStoryboard(request: StoryboardRequest): Storyboard {
    const id = `sb_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const title = request.projectTitle.trim();
    const concept = request.concept.trim();
    const sceneCount = Math.max(3, Math.min(request.sceneCount || 5, 12));
    const targetDuration = request.targetDurationSeconds || sceneCount * 6;

    const scenes = this.synthesizeScenes(title, concept, sceneCount, targetDuration);
    const totalDuration = scenes.reduce((sum, s) => sum + s.durationSeconds, 0);

    const renderManifest = {
      project: title,
      storyboardId: id,
      version: '1.0.0',
      canvas: { width: 1920, height: 1080, fps: 30 },
      scenes: scenes.map((s) => ({
        index: s.sceneNumber,
        title: s.title,
        shot: s.cameraShot,
        duration: s.durationSeconds,
        visual: s.visualDescription,
        audio: s.audioDialogue,
        sfx: s.soundEffects || null,
        transition: s.transition,
      })),
      totalDurationSeconds: totalDuration,
      generatedAt: new Date().toISOString(),
    };

    this.storyboardsCount++;

    return {
      id,
      projectTitle: title,
      concept,
      scenes,
      totalDurationSeconds: totalDuration,
      totalScenes: scenes.length,
      renderManifestJson: JSON.stringify(renderManifest, null, 2),
      createdAt: new Date().toISOString(),
    };
  }

  public getStoryboardsCount(): number {
    return this.storyboardsCount;
  }

  private synthesizeScenes(
    title: string,
    concept: string,
    count: number,
    targetDuration: number
  ): StoryboardScene[] {
    const shotTypes: Array<'wide' | 'close_up' | 'medium' | 'pan' | 'overhead'> = [
      'wide',
      'medium',
      'close_up',
      'pan',
      'overhead',
    ];
    const transitions: Array<'cut' | 'fade' | 'dissolve'> = ['fade', 'cut', 'dissolve', 'cut', 'fade'];

    const durationPerScene = Math.max(3, Math.round(targetDuration / count));
    const scenes: StoryboardScene[] = [];

    // Scene 1: Cold Open / Establishing
    scenes.push({
      sceneNumber: 1,
      title: 'Establishing The Premise',
      visualDescription: `Wide atmospheric shot setting up the premise: "${concept}". Neon-lit architecture and dynamic focal lighting.`,
      cameraShot: 'wide',
      durationSeconds: durationPerScene,
      audioDialogue: `In a world demanding greater clarity and precision, ${title} emerges.`,
      soundEffects: 'Low sub-bass drone rising into electronic shimmer',
      transition: 'cut',
    });

    // Middle scenes: Progression & Core action
    const progressions = [
      {
        title: 'The Conflict & Complexity',
        visual: 'Rapid camera push-in on core system node processing heavy data streams.',
        dialogue: 'Every challenge begins with friction—unfiltered information colliding with tight deadlines.',
        sfx: 'High-frequency data pulse with ambient static',
      },
      {
        title: 'The Breakthrough',
        visual: 'Close-up on UI glyph activating; holographic lattice aligns in harmonic symmetry.',
        dialogue: 'Then comes alignment. Specialized agents orchestrate solutions in real time.',
        sfx: 'Resonant harmonic chime followed by crisp confirmation click',
      },
      {
        title: 'Demonstration of Mastery',
        visual: 'Smooth panoramic pan following the data trajectory as tasks resolve effortlessly.',
        dialogue: 'From analysis to creative synthesis, intelligence moves with purpose.',
        sfx: 'Swoosh transition with subtle mechanical shutter click',
      },
      {
        title: 'Validation & Security Gating',
        visual: 'Overhead top-down perspective of cryptographic guardian seals verifying results.',
        dialogue: 'Every step audited. Every permission validated. Absolute trust established.',
        sfx: 'Firm digital lock engage with low-pass confirmation chime',
      },
    ];

    for (let i = 2; i < count; i++) {
      const p = progressions[(i - 2) % progressions.length];
      scenes.push({
        sceneNumber: i,
        title: `${p.title}`,
        visualDescription: p.visual,
        cameraShot: shotTypes[(i - 1) % shotTypes.length],
        durationSeconds: durationPerScene,
        audioDialogue: p.dialogue,
        soundEffects: p.sfx,
        transition: transitions[(i - 1) % transitions.length],
      });
    }

    // Final Scene: Climax / Call to Action
    scenes.push({
      sceneNumber: count,
      title: 'Resolution & Call to Action',
      visualDescription: `Cinematic pull-back reveal of the complete ${title} logo framed by soft ambient glow and verified stamp.`,
      cameraShot: 'wide',
      durationSeconds: durationPerScene,
      audioDialogue: `${title}: Amplifying human potential. Ready for what comes next.`,
      soundEffects: 'Deep resonant swell fading to clean silence',
      transition: 'fade',
    });

    return scenes;
  }
}
