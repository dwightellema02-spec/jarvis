/**
 * JARVIS Phase 13 - Creative Engine Interfaces
 */

export type CreativeStyle = 'photorealistic' | 'digital_art' | 'vector' | 'cyberpunk' | 'minimalist';
export type AspectRatio = '1:1' | '16:9' | '4:3' | '9:16';

export interface ImageGenerationRequest {
  prompt: string;
  negativePrompt?: string;
  style?: CreativeStyle;
  aspectRatio?: AspectRatio;
  width?: number;
  height?: number;
}

export interface GeneratedImageResult {
  id: string;
  prompt: string;
  style: CreativeStyle;
  aspectRatio: AspectRatio;
  width: number;
  height: number;
  mimeType: 'image/svg+xml' | 'image/png' | 'image/webp';
  contentData: string; // SVG markup or base64 data
  isVector: boolean;
  createdAt: string;
}

export interface ImageEditRequest {
  sourceImageId?: string;
  svgContent?: string;
  instruction: 'grayscale' | 'invert' | 'add_watermark' | 'scale' | 'filter_cyberpunk';
  watermarkText?: string;
  scaleFactor?: number;
}

export interface GraphicElement {
  type: 'text' | 'rect' | 'circle' | 'icon' | 'badge';
  content?: string;
  x: number;
  y: number;
  fill?: string;
  fontSize?: number;
  stroke?: string;
}

export interface GraphicCompositionRequest {
  title: string;
  subtitle?: string;
  layout: 'banner' | 'poster' | 'badge' | 'infographic';
  theme: 'dark_neon' | 'academic_clean' | 'modern_gradient';
  width?: number;
  height?: number;
  elements?: GraphicElement[];
}

export interface GraphicCompositionResult {
  id: string;
  title: string;
  layout: string;
  theme: string;
  svgMarkup: string;
  width: number;
  height: number;
  createdAt: string;
}

export interface PresentationSlide {
  slideNumber: number;
  title: string;
  bulletPoints: string[];
  visualCue?: string;
  speakerNotes?: string;
  background?: string;
}

export interface PresentationDeckRequest {
  topic: string;
  targetAudience?: string;
  slideCount?: number;
  theme?: 'jarvis_dark' | 'academic_blue' | 'minimal_light';
}

export interface PresentationDeck {
  id: string;
  topic: string;
  theme: string;
  slides: PresentationSlide[];
  totalSlides: number;
  estimatedMinutes: number;
  htmlExport: string;
  createdAt: string;
}

export interface SubtitleEntry {
  index: number;
  startTime: string; // "00:00:01,000"
  endTime: string;   // "00:00:04,500"
  text: string;
}

export interface SubtitleGenerationRequest {
  transcript: string;
  format?: 'srt' | 'vtt';
  wordsPerLine?: number;
  secondsPerWord?: number;
}

export interface SubtitleGenerationResult {
  format: 'srt' | 'vtt';
  content: string;
  entryCount: number;
  durationSeconds: number;
}

export interface SpeechSynthesisRequest {
  text: string;
  voiceGender?: 'male' | 'female' | 'neutral';
  speakingRate?: number; // 0.5 to 2.0
  pitch?: number;        // -20 to 20
  format?: 'ssml' | 'plain';
}

export interface SpeechSynthesisSpec {
  id: string;
  text: string;
  voiceGender: 'male' | 'female' | 'neutral';
  speakingRate: number;
  pitch: number;
  ssml: string;
  estimatedDurationSeconds: number;
  wordCount: number;
}

export interface StoryboardScene {
  sceneNumber: number;
  title: string;
  visualDescription: string;
  cameraShot: 'wide' | 'close_up' | 'medium' | 'pan' | 'overhead';
  durationSeconds: number;
  audioDialogue: string;
  soundEffects?: string;
  transition: 'cut' | 'fade' | 'dissolve';
}

export interface StoryboardRequest {
  projectTitle: string;
  concept: string;
  targetDurationSeconds?: number;
  sceneCount?: number;
}

export interface Storyboard {
  id: string;
  projectTitle: string;
  concept: string;
  scenes: StoryboardScene[];
  totalDurationSeconds: number;
  totalScenes: number;
  renderManifestJson: string;
  createdAt: string;
}

export interface CreativeSystemStatus {
  serviceName: string;
  supportedStyles: CreativeStyle[];
  features: string[];
  totalImagesGenerated: number;
  totalPresentationsBuilt: number;
  totalStoryboardsCreated: number;
  version: string;
}
