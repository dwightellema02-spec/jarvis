/**
 * JARVIS Phase 14 - Keyframe Motion Graph & Easing Interpolator
 * Generates timed transform tracks, mathematical easing curves, and SMIL/CSS keyframes.
 */

import {
  MotionTrack,
  KeyframeProperty,
  EasingType,
} from './animation.interface.js';

export class KeyframeMotionEngine {
  private motionCount = 0;

  /**
   * Generates motion tracks for scene layers (breathing idle, head nod, limb gesturing, ambient camera pan).
   */
  public generateMotionTracks(durationSeconds: number = 6): MotionTrack[] {
    const dur = Math.max(2, durationSeconds);

    const tracks: MotionTrack[] = [
      // 1. Character Body Subtle Breathing / Idle Float
      {
        targetLayerId: 'layer_char_body',
        property: 'translateY',
        keyframes: [
          { timeSeconds: 0, value: 0, easing: 'ease_in_out' },
          { timeSeconds: dur * 0.25, value: -6, easing: 'ease_in_out' },
          { timeSeconds: dur * 0.5, value: 0, easing: 'ease_in_out' },
          { timeSeconds: dur * 0.75, value: -6, easing: 'ease_in_out' },
          { timeSeconds: dur, value: 0, easing: 'ease_in_out' },
        ],
      },

      // 2. Character Head Attentive Tilt
      {
        targetLayerId: 'layer_char_head',
        property: 'rotate',
        keyframes: [
          { timeSeconds: 0, value: 0, easing: 'ease_in_out' },
          { timeSeconds: dur * 0.2, value: 4, easing: 'ease_in_out' },
          { timeSeconds: dur * 0.45, value: -3, easing: 'ease_in_out' },
          { timeSeconds: dur * 0.7, value: 2, easing: 'ease_in_out' },
          { timeSeconds: dur, value: 0, easing: 'ease_in_out' },
        ],
      },

      // 3. Gesturing Limbs (Left arm articulate gesture)
      {
        targetLayerId: 'layer_char_arms',
        property: 'rotate',
        keyframes: [
          { timeSeconds: 0, value: 0, easing: 'ease_in_out' },
          { timeSeconds: dur * 0.3, value: -18, easing: 'ease_out' },
          { timeSeconds: dur * 0.6, value: 12, easing: 'ease_in_out' },
          { timeSeconds: dur * 0.85, value: -6, easing: 'ease_in_out' },
          { timeSeconds: dur, value: 0, easing: 'ease_in_out' },
        ],
      },

      // 4. Subtle Ambient Background Camera Pan
      {
        targetLayerId: 'layer_bg',
        property: 'scale',
        keyframes: [
          { timeSeconds: 0, value: 1.0, easing: 'linear' },
          { timeSeconds: dur * 0.5, value: 1.04, easing: 'ease_in_out' },
          { timeSeconds: dur, value: 1.0, easing: 'linear' },
        ],
      },
    ];

    this.motionCount++;
    return tracks;
  }

  /**
   * Generates CSS @keyframes markup for embedding into HTML5 players or SVG <style> tags.
   */
  public renderCssKeyframes(tracks: MotionTrack[], totalDurationSeconds: number): string {
    const cssBlocks: string[] = [];

    tracks.forEach((track, idx) => {
      const animName = `anim_${track.targetLayerId}_${track.property}_${idx}`;
      const keyframeRules = track.keyframes
        .map((kf) => {
          const pct = Math.round((kf.timeSeconds / totalDurationSeconds) * 100);
          const transformValue = this.formatTransform(track.property, kf.value);
          return `    ${pct}% { ${transformValue} }`;
        })
        .join('\n');

      cssBlocks.push(`  @keyframes ${animName} {
${keyframeRules}
  }
  #${track.targetLayerId} {
    animation: ${animName} ${totalDurationSeconds}s infinite ease-in-out;
  }`);
    });

    return cssBlocks.join('\n\n');
  }

  /**
   * Generates native SVG SMIL <animateTransform> and <animate> tags for standalone vector players.
   */
  public renderSmilTags(track: MotionTrack, totalDurationSeconds: number, pivotX = 0, pivotY = 0): string {
    if (track.property === 'rotate') {
      const values = track.keyframes
        .map((kf) => `${kf.value} ${pivotX} ${pivotY}`)
        .join('; ');
      return `<animateTransform attributeName="transform" type="rotate" values="${values}" dur="${totalDurationSeconds}s" repeatCount="indefinite" />`;
    }

    if (track.property === 'translateY') {
      const values = track.keyframes.map((kf) => `0 ${kf.value}`).join('; ');
      return `<animateTransform attributeName="transform" type="translate" values="${values}" dur="${totalDurationSeconds}s" repeatCount="indefinite" additive="sum" />`;
    }

    if (track.property === 'translateX') {
      const values = track.keyframes.map((kf) => `${kf.value} 0`).join('; ');
      return `<animateTransform attributeName="transform" type="translate" values="${values}" dur="${totalDurationSeconds}s" repeatCount="indefinite" additive="sum" />`;
    }

    if (track.property === 'opacity') {
      const values = track.keyframes.map((kf) => kf.value).join('; ');
      return `<animate attributeName="opacity" values="${values}" dur="${totalDurationSeconds}s" repeatCount="indefinite" />`;
    }

    return '';
  }

  public evaluateEasing(t: number, easing: EasingType): number {
    switch (easing) {
      case 'ease_in':
        return t * t;
      case 'ease_out':
        return t * (2 - t);
      case 'ease_in_out':
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      case 'bounce':
        if (t < 1 / 2.75) return 7.5625 * t * t;
        if (t < 2 / 2.75) return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
        if (t < 2.5 / 2.75) return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
        return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
      case 'elastic':
        return Math.sin(-13 * (t + 1) * (Math.PI / 2)) * Math.pow(2, -10 * t) + 1;
      case 'linear':
      default:
        return t;
    }
  }

  public getMotionCount(): number {
    return this.motionCount;
  }

  private formatTransform(property: string, value: number): string {
    switch (property) {
      case 'rotate':
        return `transform: rotate(${value}deg);`;
      case 'translateY':
        return `transform: translateY(${value}px);`;
      case 'translateX':
        return `transform: translateX(${value}px);`;
      case 'scale':
        return `transform: scale(${value});`;
      case 'opacity':
        return `opacity: ${value};`;
      default:
        return '';
    }
  }
}
