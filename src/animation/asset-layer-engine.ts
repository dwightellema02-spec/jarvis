/**
 * JARVIS Phase 14 - Asset Decomposition & Scene Layer Engine
 * Deconstructs concepts and artwork into hierarchical, animatable SVG layers.
 */

import { SceneLayer } from './animation.interface.js';

export class AssetLayerEngine {
  private decomposedCount = 0;

  /**
   * Deconstructs a scene prompt and dimensions into multi-plane animatable SVG layers.
   */
  public decomposeLayers(params: {
    sceneTitle: string;
    conceptPrompt: string;
    width: number;
    height: number;
    characterName?: string;
  }): SceneLayer[] {
    const { sceneTitle, width, height, characterName } = params;
    const charName = characterName || 'Hero Character';
    const cx = width / 2;
    const cy = height / 2;

    const layers: SceneLayer[] = [
      // 1. Background Plane (Sky, distant horizon, space grid)
      {
        id: 'layer_bg',
        name: 'Background Plane',
        type: 'background',
        zIndex: 0,
        pivotX: cx,
        pivotY: cy,
        visible: true,
        svgContent: `<g id="layer_bg">
          <defs>
            <linearGradient id="anim_bg_grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#050814" />
              <stop offset="100%" stop-color="#0f172a" />
            </linearGradient>
            <radialGradient id="anim_sun_grad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#00f2fe" stop-opacity="0.25" />
              <stop offset="100%" stop-color="#000000" stop-opacity="0" />
            </radialGradient>
          </defs>
          <rect width="${width}" height="${height}" fill="url(#anim_bg_grad)" />
          <circle cx="${cx}" cy="${height * 0.35}" r="${Math.min(width, height) * 0.4}" fill="url(#anim_sun_grad)" />
          <line x1="0" y1="${height * 0.75}" x2="${width}" y2="${height * 0.75}" stroke="#1e293b" stroke-width="2" />
        </g>`,
      },

      // 2. Midground Plane (Structures, console station, environment pillars)
      {
        id: 'layer_mid',
        name: 'Midground Environment',
        type: 'midground',
        zIndex: 10,
        pivotX: cx,
        pivotY: height * 0.75,
        visible: true,
        svgContent: `<g id="layer_mid">
          <rect x="${cx - 300}" y="${height * 0.68}" width="600" height="24" rx="12" fill="#1e293b" stroke="#334155" stroke-width="1.5" />
          <line x1="${cx - 240}" y1="${height * 0.69}" x2="${cx + 240}" y2="${height * 0.69}" stroke="#38bdf8" stroke-width="2" stroke-dasharray="8 6" opacity="0.6" />
        </g>`,
      },

      // 3. Character Body & Torso (Root body anchor)
      {
        id: 'layer_char_body',
        name: `${charName} - Body & Torso`,
        type: 'character_body',
        zIndex: 20,
        pivotX: cx,
        pivotY: cy + 60,
        visible: true,
        svgContent: `<g id="layer_char_body" transform-origin="${cx} ${cy + 60}">
          <rect x="${cx - 45}" y="${cy - 20}" width="90" height="120" rx="20" fill="#0f172a" stroke="#00f2fe" stroke-width="2" />
          <circle cx="${cx}" cy="${cy + 35}" r="16" fill="#0284c7" opacity="0.8" />
          <!-- Limbs / Legs -->
          <line x1="${cx - 25}" y1="${cy + 100}" x2="${cx - 25}" y2="${cy + 175}" stroke="#38bdf8" stroke-width="12" stroke-linecap="round" />
          <line x1="${cx + 25}" y1="${cy + 100}" x2="${cx + 25}" y2="${cy + 175}" stroke="#38bdf8" stroke-width="12" stroke-linecap="round" />
        </g>`,
      },

      // 4. Character Head & Face Structure
      {
        id: 'layer_char_head',
        name: `${charName} - Head Rig`,
        type: 'character_head',
        zIndex: 30,
        pivotX: cx,
        pivotY: cy - 40,
        visible: true,
        svgContent: `<g id="layer_char_head" transform-origin="${cx} ${cy - 40}">
          <circle cx="${cx}" cy="${cy - 75}" r="50" fill="#1e293b" stroke="#38bdf8" stroke-width="2" />
          <path d="M ${cx - 35} ${cy - 95} Q ${cx} ${cy - 120} ${cx + 35} ${cy - 95}" fill="none" stroke="#00f2fe" stroke-width="5" stroke-linecap="round" />
          <!-- Eyes -->
          <circle cx="${cx - 18}" cy="${cy - 80}" r="7" fill="#00f2fe" />
          <circle cx="${cx + 18}" cy="${cy - 80}" r="7" fill="#00f2fe" />
          <circle cx="${cx - 16}" cy="${cy - 82}" r="2" fill="#ffffff" />
          <circle cx="${cx + 20}" cy="${cy - 82}" r="2" fill="#ffffff" />
        </g>`,
      },

      // 5. Character Mouth Viseme Track
      {
        id: 'layer_char_mouth',
        name: `${charName} - Lip Sync Mouth`,
        type: 'character_head',
        zIndex: 35,
        pivotX: cx,
        pivotY: cy - 50,
        visible: true,
        svgContent: `<g id="layer_char_mouth" transform-origin="${cx} ${cy - 50}">
          <path id="viseme_mouth_shape" d="M ${cx - 14} ${cy - 55} Q ${cx} ${cy - 45} ${cx + 14} ${cy - 55}" fill="none" stroke="#f8fafc" stroke-width="3.5" stroke-linecap="round" />
        </g>`,
      },

      // 6. Character Gesturing Arms / Limbs
      {
        id: 'layer_char_arms',
        name: `${charName} - Gesturing Limbs`,
        type: 'character_limbs',
        zIndex: 40,
        pivotX: cx,
        pivotY: cy + 10,
        visible: true,
        svgContent: `<g id="layer_char_arms">
          <g id="limb_arm_left" transform-origin="${cx - 45} ${cy}">
            <line x1="${cx - 45}" y1="${cy}" x2="${cx - 95}" y2="${cy + 55}" stroke="#00f2fe" stroke-width="10" stroke-linecap="round" />
            <circle cx="${cx - 95}" cy="${cy + 55}" r="8" fill="#38bdf8" />
          </g>
          <g id="limb_arm_right" transform-origin="${cx + 45} ${cy}">
            <line x1="${cx + 45}" y1="${cy}" x2="${cx + 95}" y2="${cy + 40}" stroke="#00f2fe" stroke-width="10" stroke-linecap="round" />
            <circle cx="${cx + 95}" cy="${cy + 40}" r="8" fill="#38bdf8" />
          </g>
        </g>`,
      },

      // 7. Foreground Ambient Particles & Cinematic Framing
      {
        id: 'layer_fg',
        name: 'Foreground Cinematic Glow',
        type: 'foreground',
        zIndex: 50,
        pivotX: cx,
        pivotY: cy,
        visible: true,
        svgContent: `<g id="layer_fg" opacity="0.3">
          <circle cx="${width * 0.15}" cy="${height * 0.2}" r="3" fill="#00f2fe" />
          <circle cx="${width * 0.85}" cy="${height * 0.3}" r="4" fill="#38bdf8" />
          <circle cx="${width * 0.25}" cy="${height * 0.7}" r="2" fill="#ffffff" />
          <circle cx="${width * 0.75}" cy="${height * 0.8}" r="3" fill="#00f2fe" />
        </g>`,
      },
    ];

    this.decomposedCount++;
    return layers;
  }

  public getDecomposedCount(): number {
    return this.decomposedCount;
  }
}
