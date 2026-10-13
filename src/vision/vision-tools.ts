/**
 * JARVIS Phase 19 - Vision & Camera Intelligence Tool Definitions
 * 8 Registered Tools for Camera Control, Screen Capture, OCR, Object Detection, Document Scanning, and Privacy Redaction.
 */

import { ITool, ToolDefinition, ToolExecutionContext, ToolExecutionResult } from '../tools/tool.interface.js';
import { VisionManager } from './vision-manager.js';
import { ResourceType, PermissionLevel } from '../security/types.js';

/**
 * 1. VisionCameraStatusTool: vision.camera_status
 */
export class VisionCameraStatusTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'vision.camera_status',
    name: 'Get Camera Status',
    description: 'Inspects webcam device availability, recording state, and hardware privacy LED indicator.',
    version: '1.0.0',
    requiredPermissions: [
      { resource: ResourceType.CAMERA, action: 'read', level: PermissionLevel.READ },
    ],
    parametersSchema: {
      type: 'object',
      properties: {},
    },
    status: 'implemented',
  };

  constructor(private readonly manager: VisionManager) {}

  public async execute(_params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const result = this.manager.getCameraStatus(context.userId);
      return {
        success: true,
        toolId: this.definition.id,
        data: result,
        verified: true,
        executionTimeMs: Date.now() - startTime,
      };
    } catch (err: any) {
      return {
        success: false,
        toolId: this.definition.id,
        error: err.message,
        verified: false,
        executionTimeMs: Date.now() - startTime,
      };
    }
  }
}

/**
 * 2. VisionCaptureFrameTool: vision.capture_frame
 */
export class VisionCaptureFrameTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'vision.capture_frame',
    name: 'Capture Camera Frame',
    description: 'Captures a camera frame from an authorized webcam with active privacy LED notification.',
    version: '1.0.0',
    requiredPermissions: [
      { resource: ResourceType.CAMERA, action: 'read', level: PermissionLevel.READ },
    ],
    parametersSchema: {
      type: 'object',
      properties: {
        deviceId: { type: 'string' },
      },
    },
    status: 'implemented',
  };

  constructor(private readonly manager: VisionManager) {}

  public async execute(params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const p = (params || {}) as { deviceId?: string };
      const result = await this.manager.captureCameraFrame(p.deviceId, context.userId);
      return {
        success: true,
        toolId: this.definition.id,
        data: result,
        verified: true,
        executionTimeMs: Date.now() - startTime,
      };
    } catch (err: any) {
      return {
        success: false,
        toolId: this.definition.id,
        error: err.message,
        verified: false,
        executionTimeMs: Date.now() - startTime,
      };
    }
  }
}

/**
 * 3. VisionCaptureScreenTool: vision.capture_screen
 */
export class VisionCaptureScreenTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'vision.capture_screen',
    name: 'Capture Desktop Screen',
    description: 'Captures full screen or region bounds with credential manager window protection.',
    version: '1.0.0',
    requiredPermissions: [
      { resource: ResourceType.CAMERA, action: 'read', level: PermissionLevel.READ },
    ],
    parametersSchema: {
      type: 'object',
      properties: {
        target: { type: 'string', enum: ['fullscreen', 'window', 'region'] },
        region: { type: 'object' },
        windowTitle: { type: 'string' },
      },
    },
    status: 'implemented',
  };

  constructor(private readonly manager: VisionManager) {}

  public async execute(params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const p = (params || {}) as any;
      const result = await this.manager.captureScreen(
        p.target || 'fullscreen',
        p.region,
        p.windowTitle,
        context.userId
      );
      return {
        success: true,
        toolId: this.definition.id,
        data: result,
        verified: true,
        executionTimeMs: Date.now() - startTime,
      };
    } catch (err: any) {
      return {
        success: false,
        toolId: this.definition.id,
        error: err.message,
        verified: false,
        executionTimeMs: Date.now() - startTime,
      };
    }
  }
}

/**
 * 4. VisionAnalyzeImageTool: vision.analyze_image
 */
export class VisionAnalyzeImageTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'vision.analyze_image',
    name: 'Analyze Visual Scene',
    description: 'Performs perceptual scene understanding, object detection, and lighting assessment.',
    version: '1.0.0',
    requiredPermissions: [
      { resource: ResourceType.CAMERA, action: 'read', level: PermissionLevel.READ },
    ],
    parametersSchema: {
      type: 'object',
      properties: {
        imageBase64: { type: 'string' },
      },
      required: ['imageBase64'],
    },
    status: 'implemented',
  };

  constructor(private readonly manager: VisionManager) {}

  public async execute(params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const p = (params || {}) as { imageBase64: string };
      if (!p.imageBase64) throw new Error('Field "imageBase64" is required.');
      const result = await this.manager.analyzeImage(p.imageBase64, context.userId);
      return {
        success: true,
        toolId: this.definition.id,
        data: result,
        verified: true,
        executionTimeMs: Date.now() - startTime,
      };
    } catch (err: any) {
      return {
        success: false,
        toolId: this.definition.id,
        error: err.message,
        verified: false,
        executionTimeMs: Date.now() - startTime,
      };
    }
  }
}

/**
 * 5. VisionOcrExtractTool: vision.ocr_extract
 */
export class VisionOcrExtractTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'vision.ocr_extract',
    name: 'Extract Text via OCR',
    description: 'Extracts words, lines, bounding boxes, tables, and mathematical formulas from images.',
    version: '1.0.0',
    requiredPermissions: [
      { resource: ResourceType.CAMERA, action: 'read', level: PermissionLevel.READ },
    ],
    parametersSchema: {
      type: 'object',
      properties: {
        imageBase64: { type: 'string' },
        languageHint: { type: 'string' },
      },
      required: ['imageBase64'],
    },
    status: 'implemented',
  };

  constructor(private readonly manager: VisionManager) {}

  public async execute(params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const p = (params || {}) as { imageBase64: string; languageHint?: string };
      if (!p.imageBase64) throw new Error('Field "imageBase64" is required.');
      const result = await this.manager.performOcr(p.imageBase64, p.languageHint, context.userId);
      return {
        success: true,
        toolId: this.definition.id,
        data: result,
        verified: true,
        executionTimeMs: Date.now() - startTime,
      };
    } catch (err: any) {
      return {
        success: false,
        toolId: this.definition.id,
        error: err.message,
        verified: false,
        executionTimeMs: Date.now() - startTime,
      };
    }
  }
}

/**
 * 6. VisionDetectObjectsTool: vision.detect_objects
 */
export class VisionDetectObjectsTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'vision.detect_objects',
    name: 'Detect Visual Objects',
    description: 'Discovers objects, entities, and spatial coordinates inside an image frame.',
    version: '1.0.0',
    requiredPermissions: [
      { resource: ResourceType.CAMERA, action: 'read', level: PermissionLevel.READ },
    ],
    parametersSchema: {
      type: 'object',
      properties: {
        imageBase64: { type: 'string' },
      },
      required: ['imageBase64'],
    },
    status: 'implemented',
  };

  constructor(private readonly manager: VisionManager) {}

  public async execute(params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const p = (params || {}) as { imageBase64: string };
      if (!p.imageBase64) throw new Error('Field "imageBase64" is required.');
      const analysis = await this.manager.analyzeImage(p.imageBase64, context.userId);
      return {
        success: true,
        toolId: this.definition.id,
        data: { objects: analysis.objects, count: analysis.objects.length },
        verified: true,
        executionTimeMs: Date.now() - startTime,
      };
    } catch (err: any) {
      return {
        success: false,
        toolId: this.definition.id,
        error: err.message,
        verified: false,
        executionTimeMs: Date.now() - startTime,
      };
    }
  }
}

/**
 * 7. VisionRedactSensitiveTool: vision.redact_sensitive
 */
export class VisionRedactSensitiveTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'vision.redact_sensitive',
    name: 'Redact Sensitive Visual Data',
    description: 'Detects and redacts credit cards, tokens, passwords, and PII from text and images.',
    version: '1.0.0',
    requiredPermissions: [
      { resource: ResourceType.CAMERA, action: 'write', level: PermissionLevel.WRITE },
    ],
    parametersSchema: {
      type: 'object',
      properties: {
        text: { type: 'string' },
        imageBase64: { type: 'string' },
      },
      required: ['text'],
    },
    status: 'implemented',
  };

  constructor(private readonly manager: VisionManager) {}

  public async execute(params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const p = (params || {}) as { text: string; imageBase64?: string };
      if (!p.text) throw new Error('Field "text" is required.');
      const result = this.manager.redactSensitiveInfo(p.text, p.imageBase64, context.userId);
      return {
        success: true,
        toolId: this.definition.id,
        data: result,
        verified: true,
        executionTimeMs: Date.now() - startTime,
      };
    } catch (err: any) {
      return {
        success: false,
        toolId: this.definition.id,
        error: err.message,
        verified: false,
        executionTimeMs: Date.now() - startTime,
      };
    }
  }
}

/**
 * 8. VisionScanDocumentTool: vision.scan_document
 */
export class VisionScanDocumentTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'vision.scan_document',
    name: 'Scan Document or Whiteboard',
    description: 'Scans document layout, structured key-values, and tabular records from photos.',
    version: '1.0.0',
    requiredPermissions: [
      { resource: ResourceType.CAMERA, action: 'read', level: PermissionLevel.READ },
    ],
    parametersSchema: {
      type: 'object',
      properties: {
        imageBase64: { type: 'string' },
      },
      required: ['imageBase64'],
    },
    status: 'implemented',
  };

  constructor(private readonly manager: VisionManager) {}

  public async execute(params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const p = (params || {}) as { imageBase64: string };
      if (!p.imageBase64) throw new Error('Field "imageBase64" is required.');
      const result = await this.manager.scanDocument(p.imageBase64, context.userId);
      return {
        success: true,
        toolId: this.definition.id,
        data: result,
        verified: true,
        executionTimeMs: Date.now() - startTime,
      };
    } catch (err: any) {
      return {
        success: false,
        toolId: this.definition.id,
        error: err.message,
        verified: false,
        executionTimeMs: Date.now() - startTime,
      };
    }
  }
}

export function createVisionTools(manager: VisionManager): ITool[] {
  return [
    new VisionCameraStatusTool(manager),
    new VisionCaptureFrameTool(manager),
    new VisionCaptureScreenTool(manager),
    new VisionAnalyzeImageTool(manager),
    new VisionOcrExtractTool(manager),
    new VisionDetectObjectsTool(manager),
    new VisionRedactSensitiveTool(manager),
    new VisionScanDocumentTool(manager),
  ];
}
