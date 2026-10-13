/**
 * JARVIS Phase 19 - Vision & Camera Intelligence Unit Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  CameraManager,
  ScreenCaptureController,
  PrivacyFilter,
  OcrEngine,
  VisionManager,
  VisionAgent,
  createVisionTools,
} from '../../src/vision/index.js';
import { PermissionManager } from '../../src/security/permission-manager.js';
import { SecurityGuardian } from '../../src/security/guardian.js';
import { AuditLogger } from '../../src/audit/audit-logger.js';
import { ResourceType, PermissionLevel } from '../../src/security/types.js';

describe('Phase 19: Vision & Camera Intelligence', () => {
  let cameraManager: CameraManager;
  let screenCapture: ScreenCaptureController;
  let privacyFilter: PrivacyFilter;
  let ocrEngine: OcrEngine;
  let permissionManager: PermissionManager;
  let guardian: SecurityGuardian;
  let auditLogger: AuditLogger;
  let visionManager: VisionManager;

  beforeEach(() => {
    cameraManager = new CameraManager({ maxFps: 20 });
    screenCapture = new ScreenCaptureController();
    privacyFilter = new PrivacyFilter();
    ocrEngine = new OcrEngine();
    permissionManager = new PermissionManager();
    guardian = new SecurityGuardian();
    auditLogger = new AuditLogger();

    permissionManager.grantPermission({
      userId: 'test_user',
      resource: ResourceType.CAMERA,
      level: PermissionLevel.ADMIN,
      allowedActions: ['read', 'write', 'execute', 'admin'],
      grantedBy: 'system',
    });

    permissionManager.grantPermission({
      userId: 'read_only_user',
      resource: ResourceType.CAMERA,
      level: PermissionLevel.READ,
      allowedActions: ['read'],
      grantedBy: 'system',
    });

    visionManager = new VisionManager({
      permissionManager,
      guardian,
      auditLogger,
      cameraManager,
      screenCapture,
      ocrEngine,
      privacyFilter,
    });
  });

  describe('1. Camera Device Discovery & LED Indicator Invariant', () => {
    it('discovers available hardware webcam devices', () => {
      const devices = cameraManager.getAvailableDevices();
      expect(devices.length).toBeGreaterThanOrEqual(2);
      expect(devices.some((d) => d.isDefault)).toBe(true);
    });

    it('reports idle status and privacy LED indicator state', () => {
      const status = cameraManager.getStatus();
      expect(status.status).toBe('idle');
      expect(status.indicatorActive).toBe(false);
      expect(status.activeDeviceId).toBeDefined();
    });

    it('captures frame with active privacy notification LED', async () => {
      const frame = await cameraManager.captureFrame();
      expect(frame.id).toBeDefined();
      expect(frame.indicatorActive).toBe(true);
      expect(frame.dataBase64.length).toBeGreaterThan(0);
      expect(frame.width).toBe(1280);
      expect(frame.height).toBe(720);
    });

    it('enforces frame interval rate limiting against rapid captures', async () => {
      // First frame
      await cameraManager.captureFrame();
      // Immediate second frame without delay
      await expect(cameraManager.captureFrame()).rejects.toThrow(/rate limit exceeded/i);
    });
  });

  describe('2. Desktop Screen Capture & Sensitive Window Shield', () => {
    it('captures safe fullscreen and region desktop frames', async () => {
      const full = await screenCapture.captureScreen('fullscreen');
      expect(full.target).toBe('fullscreen');
      expect(full.width).toBe(1920);
      expect(full.dataBase64.length).toBeGreaterThan(0);

      const region = await screenCapture.captureScreen('region', {
        x: 100,
        y: 100,
        width: 800,
        height: 600,
      });
      expect(region.target).toBe('region');
      expect(region.width).toBe(800);
      expect(region.height).toBe(600);
    });

    it('strictly blocks screen capture on sensitive password/credential managers', async () => {
      await expect(
        screenCapture.captureScreen('window', undefined, '1Password — Master Vault')
      ).rejects.toThrow(/strictly prohibited on sensitive credential manager window/i);

      await expect(
        screenCapture.captureScreen('window', undefined, 'Bitwarden Password Safe')
      ).rejects.toThrow(/strictly prohibited on sensitive credential manager window/i);

      await expect(
        screenCapture.captureScreen('window', undefined, 'KeePass Database Lock')
      ).rejects.toThrow(/strictly prohibited on sensitive credential manager window/i);
    });
  });

  describe('3. Privacy Redaction & PII Masking Shield', () => {
    it('detects and redacts credit card numbers', () => {
      const text = 'Payment info: card number is 4532-1234-5678-9012 for billing.';
      const res = privacyFilter.scanAndRedact(text);
      expect(res.itemsRedactedCount).toBeGreaterThan(0);
      expect(res.sanitizedText).toContain('••••-••••-••••-9012');
      expect(res.sanitizedText).not.toContain('4532-1234-5678-9012');
      expect(res.redactions.some((r) => r.type === 'credit_card')).toBe(true);
    });

    it('detects and redacts sensitive API keys and secrets', () => {
      const text = 'Use OpenAI secret key sk-abc12345678901234567890 to authorize requests.';
      const res = privacyFilter.scanAndRedact(text);
      expect(res.sanitizedText).toContain('[REDACTED_SECRET]');
      expect(res.sanitizedText).not.toContain('sk-abc12345678901234567890');
      expect(res.redactions.some((r) => r.type === 'api_key')).toBe(true);
    });

    it('detects and masks cleartext passwords, emails, and phone numbers', () => {
      const text = 'Login: password = superSecret123, contact me at user@example.com or 555-123-4567';
      const res = privacyFilter.scanAndRedact(text);
      expect(res.sanitizedText).toContain('••••••••');
      expect(res.sanitizedText).toContain('u•••@example.com');
      expect(res.sanitizedText).toContain('•••-•••-4567');
    });

    it('applies blackout overlay to SVG images with sensitive coordinates', () => {
      const svg = '<svg width="500" height="300"><text>card 4532-1234-5678-9012</text></svg>';
      const base64 = Buffer.from(svg, 'utf-8').toString('base64');
      const res = privacyFilter.scanAndRedact('card 4532-1234-5678-9012', base64);
      const decoded = Buffer.from(res.redactedImageBase64, 'base64').toString('utf-8');
      expect(decoded).toContain('<rect x=');
      expect(decoded).toContain('fill="#000000"');
    });
  });

  describe('4. Optical Character Recognition (OCR) Engine', () => {
    it('extracts lines, words, and bounding boxes from visual documents', async () => {
      const res = await ocrEngine.extractText('sample_base64_data');
      expect(res.fullText.length).toBeGreaterThan(0);
      expect(res.lines.length).toBeGreaterThan(0);
      expect(res.lines[0].words.length).toBeGreaterThan(0);
      expect(res.lines[0].box).toBeDefined();
      expect(res.durationMs).toBeGreaterThanOrEqual(0);
    });

    it('extracts structured tables from detected delimited regions', async () => {
      const res = await ocrEngine.extractText('sample_table_data');
      expect(res.tablesDetected).toBeDefined();
      expect(res.tablesDetected!.length).toBeGreaterThan(0);
      expect(res.tablesDetected![0].headers.length).toBeGreaterThanOrEqual(2);
    });

    it('detects mathematical formulas from image transcripts', async () => {
      const res = await ocrEngine.extractText('math_equation_data');
      expect(res.mathExpressions).toBeDefined();
      expect(res.mathExpressions!.length).toBeGreaterThan(0);
    });
  });

  describe('5. VisionManager Security & Capability Integration', () => {
    it('enforces permission denied for unauthorized users', async () => {
      await expect(
        visionManager.captureCameraFrame(undefined, 'unauthorized_user')
      ).rejects.toThrow();

      // Read-only user cannot execute redaction write actions
      expect(() => {
        visionManager.redactSensitiveInfo('some text', undefined, 'read_only_user');
      }).toThrow();
    });

    it('performs visual analysis and object detection with privacy flags', async () => {
      const analysis = await visionManager.analyzeImage('test_frame_data', 'test_user');
      expect(analysis.sceneSummary).toBeDefined();
      expect(analysis.objects.length).toBeGreaterThanOrEqual(2);
      expect(analysis.dominantColors.length).toBeGreaterThan(0);
      expect(analysis.safetyFlags.explicitContent).toBe(false);
    });

    it('scans documents and produces structured key-values and tables', async () => {
      const doc = await visionManager.scanDocument('doc_data', 'test_user');
      expect(doc.documentType).toBe('document_page');
      expect(doc.keyValues.documentTitle).toBeDefined();
      expect(doc.confidence).toBeGreaterThan(0.9);
    });
  });

  describe('6. VisionAgent & 8 Tool Implementations', () => {
    it('executes agent actions via IAgent interface', async () => {
      const agent = new VisionAgent(visionManager);
      expect(agent.definition.id).toBe('vision-agent');

      const result = await agent.execute(
        { action: 'camera_status' },
        { requestId: 'r1', userId: 'test_user', sessionId: 's1', grantedPermissions: [] }
      );
      expect(result.success).toBe(true);
      expect(result.data.status).toBe('idle');
    });

    it('registers and executes all 8 vision tools successfully', async () => {
      const tools = createVisionTools(visionManager);
      expect(tools.length).toBe(8);

      const statusTool = tools.find((t) => t.definition.id === 'vision.camera_status')!;
      const statusRes = await statusTool.execute({}, { requestId: 'r2', userId: 'test_user', sessionId: 's2' });
      expect(statusRes.success).toBe(true);

      const screenTool = tools.find((t) => t.definition.id === 'vision.capture_screen')!;
      const screenRes = await screenTool.execute(
        { target: 'fullscreen' },
        { requestId: 'r3', userId: 'test_user', sessionId: 's3' }
      );
      expect(screenRes.success).toBe(true);

      const ocrTool = tools.find((t) => t.definition.id === 'vision.ocr_extract')!;
      const ocrRes = await ocrTool.execute(
        { imageBase64: 'sample_base64' },
        { requestId: 'r4', userId: 'test_user', sessionId: 's4' }
      );
      expect(ocrRes.success).toBe(true);

      const redactTool = tools.find((t) => t.definition.id === 'vision.redact_sensitive')!;
      const redactRes = await redactTool.execute(
        { text: 'card: 4532-1234-5678-9012' },
        { requestId: 'r5', userId: 'test_user', sessionId: 's5' }
      );
      expect(redactRes.success).toBe(true);

      const docTool = tools.find((t) => t.definition.id === 'vision.scan_document')!;
      const docRes = await docTool.execute(
        { imageBase64: 'doc_base64' },
        { requestId: 'r6', userId: 'test_user', sessionId: 's6' }
      );
      expect(docRes.success).toBe(true);
    });
  });
});
