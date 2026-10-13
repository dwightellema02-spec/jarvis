import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/server/app.js';
import { Express } from 'express';

describe('Phase 19 - Vision & Camera Intelligence REST API Endpoints', () => {
  let app: Express;
  const sampleSvgBase64 = Buffer.from(
    '<svg width="400" height="200"><text x="20" y="40">System Dashboard Status: Online</text></svg>',
    'utf-8'
  ).toString('base64');

  beforeAll(() => {
    const created = createApp();
    app = created.app;
  });

  describe('GET /api/jarvis/vision/camera/status', () => {
    it('returns camera device status and indicator state for authorized user', async () => {
      const res = await request(app)
        .get('/api/jarvis/vision/camera/status')
        .set('x-user-id', 'dwight');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.activeDeviceId).toBeDefined();
      expect(res.body.data.status).toBeDefined();
      expect(typeof res.body.data.indicatorActive).toBe('boolean');
    });

    it('denies access when user lacks camera permissions', async () => {
      const res = await request(app)
        .get('/api/jarvis/vision/camera/status')
        .set('x-user-id', 'unregistered_anonymous_user');

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/jarvis/vision/camera/devices', () => {
    it('discovers hardware camera devices for authorized user', async () => {
      const res = await request(app)
        .get('/api/jarvis/vision/camera/devices')
        .set('x-user-id', 'dwight');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBeGreaterThanOrEqual(1);
      expect(res.body.data[0].id).toBe('cam_integrated_01');
      expect(res.body.data[0].name).toContain('Webcam');
    });
  });

  describe('POST /api/jarvis/vision/camera/capture', () => {
    it('captures frame with active privacy notification LED indicator', async () => {
      // Delay slightly in case of interval rate limiting
      await new Promise((resolve) => setTimeout(resolve, 200));

      const res = await request(app)
        .post('/api/jarvis/vision/camera/capture')
        .set('x-user-id', 'dwight')
        .send({ deviceId: 'cam_integrated_01' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBeDefined();
      expect(res.body.data.indicatorActive).toBe(true);
      expect(res.body.data.dataBase64).toBeDefined();
    });
  });

  describe('POST /api/jarvis/vision/screen/capture', () => {
    it('captures safe fullscreen desktop screen frame', async () => {
      const res = await request(app)
        .post('/api/jarvis/vision/screen/capture')
        .set('x-user-id', 'dwight')
        .send({ target: 'fullscreen' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.dataBase64).toBeDefined();
      expect(res.body.data.width).toBe(1920);
      expect(res.body.data.height).toBe(1080);
    });

    it('blocks capture attempt when targeting sensitive credential window', async () => {
      const res = await request(app)
        .post('/api/jarvis/vision/screen/capture')
        .set('x-user-id', 'dwight')
        .send({
          target: 'window',
          windowTitle: 'Bitwarden Password Manager - Master Vault',
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Security Block');
    });
  });

  describe('POST /api/jarvis/vision/ocr', () => {
    it('extracts OCR text lines and bounding boxes from image', async () => {
      const res = await request(app)
        .post('/api/jarvis/vision/ocr')
        .set('x-user-id', 'dwight')
        .send({
          imageBase64: sampleSvgBase64,
          languageHint: 'en',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.fullText).toBeDefined();
      expect(res.body.data.lines).toBeInstanceOf(Array);
      expect(res.body.data.lines.length).toBeGreaterThan(0);
      expect(res.body.data.lines[0].confidence).toBeGreaterThan(0.8);
    });

    it('returns 400 when imageBase64 is missing', async () => {
      const res = await request(app)
        .post('/api/jarvis/vision/ocr')
        .set('x-user-id', 'dwight')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/jarvis/vision/analyze', () => {
    it('analyzes image scene and detects objects', async () => {
      const res = await request(app)
        .post('/api/jarvis/vision/analyze')
        .set('x-user-id', 'dwight')
        .send({ imageBase64: sampleSvgBase64 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.sceneSummary).toBeDefined();
      expect(res.body.data.objects).toBeInstanceOf(Array);
      expect(res.body.data.objects.length).toBeGreaterThan(0);
      expect(res.body.data.dominantColors).toBeInstanceOf(Array);
    });

    it('returns 400 when imageBase64 is missing', async () => {
      const res = await request(app)
        .post('/api/jarvis/vision/analyze')
        .set('x-user-id', 'dwight')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/jarvis/vision/redact', () => {
    it('sanitizes cleartext API tokens and credit card numbers', async () => {
      const res = await request(app)
        .post('/api/jarvis/vision/redact')
        .set('x-user-id', 'dwight')
        .send({
          text: 'Payment via 4532-1234-5678-9012 with token ghp_abcdefghijklmnopqrstuvwxyz123456',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.itemsRedactedCount).toBe(2);
      expect(res.body.data.sanitizedText).toContain('••••-••••-••••-9012');
      expect(res.body.data.sanitizedText).toContain('[REDACTED_SECRET]');
    });

    it('returns 400 when text is missing', async () => {
      const res = await request(app)
        .post('/api/jarvis/vision/redact')
        .set('x-user-id', 'dwight')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/jarvis/vision/document', () => {
    it('scans visual document and returns structured fields and tables', async () => {
      const res = await request(app)
        .post('/api/jarvis/vision/document')
        .set('x-user-id', 'dwight')
        .send({ imageBase64: sampleSvgBase64 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.documentType).toBeDefined();
      expect(res.body.data.keyValues).toBeDefined();
    });

    it('returns 400 when imageBase64 is missing', async () => {
      const res = await request(app)
        .post('/api/jarvis/vision/document')
        .set('x-user-id', 'dwight')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
});
