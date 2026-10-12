/**
 * JARVIS Phase 14 - Character Rig & Skeletal Joint Engine
 * Builds 2D skeletal rigs, bone hierarchies, preset poses, and phoneme viseme mouth shapes.
 */

import {
  CharacterRig,
  CharacterPose,
  VisemeMouthShape,
} from './animation.interface.js';

export class CharacterRigEngine {
  private rigCount = 0;

  /**
   * Constructs a skeletal 2D character rig with joint hierarchy, poses, and viseme shapes.
   */
  public createCharacterRig(characterName: string = 'JARVIS Avatar'): CharacterRig {
    const id = `rig_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const joints = [
      { name: 'root_hip', offsetX: 0, offsetY: 0 },
      { name: 'spine', parent: 'root_hip', offsetX: 0, offsetY: -40 },
      { name: 'chest', parent: 'spine', offsetX: 0, offsetY: -40 },
      { name: 'neck', parent: 'chest', offsetX: 0, offsetY: -20 },
      { name: 'head', parent: 'neck', offsetX: 0, offsetY: -35 },
      { name: 'shoulder_left', parent: 'chest', offsetX: -35, offsetY: -10 },
      { name: 'shoulder_right', parent: 'chest', offsetX: 35, offsetY: -10 },
      { name: 'arm_left', parent: 'shoulder_left', offsetX: -40, offsetY: 45 },
      { name: 'arm_right', parent: 'shoulder_right', offsetX: 40, offsetY: 45 },
      { name: 'hip_left', parent: 'root_hip', offsetX: -25, offsetY: 50 },
      { name: 'hip_right', parent: 'root_hip', offsetX: 25, offsetY: 50 },
      { name: 'leg_left', parent: 'hip_left', offsetX: 0, offsetY: 70 },
      { name: 'leg_right', parent: 'hip_right', offsetX: 0, offsetY: 70 },
    ];

    const availablePoses: Record<string, CharacterPose> = {
      idle: {
        name: 'idle',
        headRotationDeg: 0,
        bodyRotationDeg: 0,
        leftArmAngleDeg: 12,
        rightArmAngleDeg: -12,
        leftLegAngleDeg: 0,
        rightLegAngleDeg: 0,
        mouthShape: 'rest',
      },
      talk: {
        name: 'talk',
        headRotationDeg: 4,
        bodyRotationDeg: -2,
        leftArmAngleDeg: 45,
        rightArmAngleDeg: -20,
        leftLegAngleDeg: 0,
        rightLegAngleDeg: 0,
        mouthShape: 'A',
      },
      walk: {
        name: 'walk',
        headRotationDeg: -2,
        bodyRotationDeg: 5,
        leftArmAngleDeg: -28,
        rightArmAngleDeg: 30,
        leftLegAngleDeg: 22,
        rightLegAngleDeg: -22,
        mouthShape: 'rest',
      },
      alert: {
        name: 'alert',
        headRotationDeg: 0,
        bodyRotationDeg: -4,
        leftArmAngleDeg: 60,
        rightArmAngleDeg: 60,
        leftLegAngleDeg: -10,
        rightLegAngleDeg: 10,
        mouthShape: 'wide_smile',
      },
    };

    // Standard W3C / Disney 2D Viseme mouth shape SVG paths (centered at 0, 0)
    const mouthShapes: Record<VisemeMouthShape, string> = {
      rest: 'M -14 0 Q 0 4 14 0',
      A: 'M -16 -6 C -16 -16 16 -16 16 -6 C 16 12 -16 12 -16 -6 Z',
      E: 'M -18 -2 C -18 -8 18 -8 18 -2 C 18 6 -18 6 -18 -2 Z',
      O: 'M -10 -8 C -18 -8 -18 8 -10 8 C 10 8 10 -8 -10 -8 Z',
      BMP: 'M -15 0 L 15 0',
      L: 'M -14 -4 C -14 -12 14 -12 14 -4 C 14 4 -14 4 -14 -4 Z',
      FV: 'M -14 -2 L 14 -2 M -10 4 L 10 4',
      wide_smile: 'M -18 -4 Q 0 16 18 -4',
    };

    const svgMarkup = `<g id="${id}" data-rig="${characterName}">
      <!-- Rig Anchor -->
      <circle cx="0" cy="0" r="4" fill="#00f2fe" opacity="0.5" />
    </g>`;

    this.rigCount++;

    return {
      id,
      characterName,
      baseHeight: 400,
      baseWidth: 200,
      joints,
      availablePoses,
      mouthShapes,
      svgMarkup,
    };
  }

  public getRigCount(): number {
    return this.rigCount;
  }
}
