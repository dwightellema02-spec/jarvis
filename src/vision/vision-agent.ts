/**
 * JARVIS Phase 19 - Vision & Camera Intelligence Agent Implementation
 * Autonomous visual analyst coordinating camera perception, OCR, object detection, and privacy redaction.
 */

import {
  IAgent,
  AgentDefinition,
  AgentExecutionContext,
  AgentExecutionResult,
} from '../agents/agent.interface.js';
import { VisionManager } from './vision-manager.js';
import { ResourceType, PermissionLevel } from '../security/types.js';
import { BoundingBox } from './vision.interface.js';

export interface VisionAgentInput {
  action:
    | 'camera_status'
    | 'list_cameras'
    | 'capture_frame'
    | 'capture_screen'
    | 'analyze_image'
    | 'extract_ocr'
    | 'redact_privacy'
    | 'scan_document';
  deviceId?: string;
  target?: 'fullscreen' | 'window' | 'region';
  region?: BoundingBox;
  windowTitle?: string;
  imageBase64?: string;
  text?: string;
  languageHint?: string;
}

export class VisionAgent implements IAgent {
  public readonly definition: AgentDefinition = {
    id: 'vision-agent',
    name: 'JARVIS Vision & Camera Intelligence Agent',
    description:
      'Perceptual vision reasoning agent capable of controlled webcam frame capture, desktop screen grabs, optical character recognition (OCR), object detection, and automated PII redaction under strict privacy guarantees.',
    version: '1.0.0',
    capabilities: [
      'camera_status',
      'list_cameras',
      'capture_frame',
      'capture_screen',
      'analyze_image',
      'extract_ocr',
      'redact_privacy',
      'scan_document',
    ],
    requiredPermissions: [
      {
        resource: ResourceType.CAMERA,
        action: 'read',
        level: PermissionLevel.READ,
      },
    ],
    inputSchema: {
      type: 'object',
      properties: {
        action: {
          type: 'string',
          enum: [
            'camera_status',
            'list_cameras',
            'capture_frame',
            'capture_screen',
            'analyze_image',
            'extract_ocr',
            'redact_privacy',
            'scan_document',
          ],
        },
        deviceId: { type: 'string' },
        target: { type: 'string', enum: ['fullscreen', 'window', 'region'] },
        region: { type: 'object' },
        windowTitle: { type: 'string' },
        imageBase64: { type: 'string' },
        text: { type: 'string' },
        languageHint: { type: 'string' },
      },
      required: ['action'],
    },
    outputSchema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'any' },
        message: { type: 'string' },
      },
    },
    status: 'implemented',
  };

  constructor(private visionManager: VisionManager) {}

  public async execute(rawInput: unknown, context: AgentExecutionContext): Promise<AgentExecutionResult> {
    const start = Date.now();
    const input = (rawInput || {}) as VisionAgentInput;
    const userId = context.userId || 'default_user';

    try {
      let data: any;

      switch (input.action) {
        case 'camera_status':
          data = this.visionManager.getCameraStatus(userId);
          break;

        case 'list_cameras':
          data = this.visionManager.getAvailableCameras(userId);
          break;

        case 'capture_frame':
          data = await this.visionManager.captureCameraFrame(input.deviceId, userId);
          break;

        case 'capture_screen':
          data = await this.visionManager.captureScreen(
            input.target || 'fullscreen',
            input.region,
            input.windowTitle,
            userId
          );
          break;

        case 'analyze_image':
          if (!input.imageBase64) throw new Error('Field "imageBase64" is required for analyze_image.');
          data = await this.visionManager.analyzeImage(input.imageBase64, userId);
          break;

        case 'extract_ocr':
          if (!input.imageBase64) throw new Error('Field "imageBase64" is required for extract_ocr.');
          data = await this.visionManager.performOcr(input.imageBase64, input.languageHint || 'en', userId);
          break;

        case 'redact_privacy':
          if (!input.text) throw new Error('Field "text" is required for redact_privacy.');
          data = this.visionManager.redactSensitiveInfo(input.text, input.imageBase64, userId);
          break;

        case 'scan_document':
          if (!input.imageBase64) throw new Error('Field "imageBase64" is required for scan_document.');
          data = await this.visionManager.scanDocument(input.imageBase64, userId);
          break;

        default:
          throw new Error(`Unsupported action "${input.action}" in VisionAgent.`);
      }

      return {
        success: true,
        agentId: this.definition.id,
        data,
        executionTimeMs: Date.now() - start,
      };
    } catch (err: any) {
      return {
        success: false,
        agentId: this.definition.id,
        error: err.message,
        executionTimeMs: Date.now() - start,
      };
    }
  }
}
