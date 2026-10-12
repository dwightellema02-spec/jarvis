/**
 * JARVIS Phase 14 - Animation & "Bring It Alive" Pipeline Interfaces
 */

export type AnimationStyle = '2d_vector' | 'motion_graphics' | 'cutout_puppet' | 'pixel_art' | 'kinetic_typography';
export type EasingType = 'linear' | 'ease_in' | 'ease_out' | 'ease_in_out' | 'bounce' | 'elastic';
export type VisemeMouthShape = 'rest' | 'A' | 'E' | 'O' | 'BMP' | 'L' | 'FV' | 'wide_smile';

export interface SceneLayer {
  id: string;
  name: string;
  type: 'background' | 'midground' | 'character_body' | 'character_head' | 'character_limbs' | 'foreground' | 'particle';
  zIndex: number;
  svgContent: string;
  pivotX: number;
  pivotY: number;
  visible: boolean;
}

export interface CharacterPose {
  name: string;
  headRotationDeg: number;
  bodyRotationDeg: number;
  leftArmAngleDeg: number;
  rightArmAngleDeg: number;
  leftLegAngleDeg: number;
  rightLegAngleDeg: number;
  mouthShape: VisemeMouthShape;
}

export interface CharacterRig {
  id: string;
  characterName: string;
  baseHeight: number;
  baseWidth: number;
  joints: Array<{
    name: string;
    parent?: string;
    offsetX: number;
    offsetY: number;
  }>;
  availablePoses: Record<string, CharacterPose>;
  mouthShapes: Record<VisemeMouthShape, string>; // SVG path or shape markup
  svgMarkup: string;
}

export interface KeyframeProperty {
  timeSeconds: number;
  value: number; // e.g. angle in degrees, position offset, opacity
  easing?: EasingType;
}

export interface MotionTrack {
  targetLayerId: string;
  property: 'translateX' | 'translateY' | 'rotate' | 'scale' | 'opacity';
  keyframes: KeyframeProperty[];
}

export interface VisemeCue {
  timeSeconds: number;
  durationSeconds: number;
  viseme: VisemeMouthShape;
  word?: string;
}

export interface LipSyncTrack {
  characterRigId: string;
  cues: VisemeCue[];
  totalCues: number;
}

export interface AudioTrackMix {
  type: 'dialogue' | 'music' | 'sfx';
  title: string;
  startOffsetSeconds: number;
  durationSeconds: number;
  volume: number; // 0.0 to 1.0
  audioUri?: string;
}

export interface AnimationProjectRequest {
  title: string;
  conceptPrompt: string;
  style?: AnimationStyle;
  durationSeconds?: number;
  fps?: number;
  dimensions?: { width: number; height: number };
  characterName?: string;
  transcriptVoice?: string;
  backgroundMusicMood?: string;
}

export interface AnimationProject {
  id: string;
  title: string;
  conceptPrompt: string;
  style: AnimationStyle;
  fps: number;
  durationSeconds: number;
  totalFrames: number;
  dimensions: { width: number; height: number };
  layers: SceneLayer[];
  characterRig?: CharacterRig;
  motionTracks: MotionTrack[];
  lipSyncTrack?: LipSyncTrack;
  audioTracks: AudioTrackMix[];
  animatedSvgMarkup: string;
  htmlPlayer: string;
  renderManifestJson: string;
  createdAt: string;
}

export interface ToolAvailabilitySummary {
  ffmpegInstalled: boolean;
  blenderInstalled: boolean;
  canvasSupported: boolean;
  svgSmilSupported: boolean;
  remotionConfigured: boolean;
  notes: string[];
}
