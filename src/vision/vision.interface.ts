/**
 * JARVIS Phase 19 - Vision & Camera Intelligence Interfaces
 */

export type CameraStatus = 'offline' | 'idle' | 'streaming' | 'recording' | 'blocked';

export interface CameraDeviceInfo {
  id: string;
  name: string;
  isDefault: boolean;
  capabilities: {
    maxWidth: number;
    maxHeight: number;
    maxFps: number;
  };
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CapturedFrame {
  id: string;
  timestamp: string;
  deviceId: string;
  width: number;
  height: number;
  format: 'image/png' | 'image/jpeg' | 'image/svg+xml';
  dataBase64: string;
  indicatorActive: boolean;
  sizeBytes: number;
}

export interface ScreenCaptureResult {
  id: string;
  timestamp: string;
  target: 'fullscreen' | 'window' | 'region';
  region?: BoundingBox;
  width: number;
  height: number;
  format: string;
  dataBase64: string;
  windowTitle?: string;
  sizeBytes: number;
}

export interface OcrWord {
  text: string;
  confidence: number;
  box: BoundingBox;
}

export interface OcrLine {
  text: string;
  confidence: number;
  words: OcrWord[];
  box: BoundingBox;
}

export interface OcrResult {
  fullText: string;
  lines: OcrLine[];
  detectedLanguage: string;
  tablesDetected?: Array<{
    headers: string[];
    rows: string[][];
  }>;
  mathExpressions?: string[];
  durationMs: number;
}

export interface DetectedObject {
  label: string;
  confidence: number;
  box: BoundingBox;
  attributes?: Record<string, string | number | boolean>;
}

export interface VisualAnalysisResult {
  sceneSummary: string;
  objects: DetectedObject[];
  dominantColors: string[];
  lightingCondition: 'dark' | 'normal' | 'bright';
  textDetected: boolean;
  ocrSnippet?: string;
  safetyFlags: {
    explicitContent: boolean;
    violence: boolean;
    sensitivePiFound: boolean;
  };
  durationMs: number;
}

export interface PrivacyRedactionItem {
  type: 'credit_card' | 'api_key' | 'password' | 'email' | 'phone' | 'pii';
  rawText: string;
  redactedText: string;
  box?: BoundingBox;
}

export interface PrivacyRedactionResult {
  redactedImageBase64: string;
  sanitizedText: string;
  itemsRedactedCount: number;
  redactions: PrivacyRedactionItem[];
}

export interface DocumentScanResult {
  documentType: 'receipt' | 'id_card' | 'whiteboard' | 'document_page' | 'diagram';
  extractedText: string;
  keyValues: Record<string, string>;
  tables: Array<{ headers: string[]; rows: string[][] }>;
  confidence: number;
}
