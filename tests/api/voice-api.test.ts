import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/server/app.js';
import { Express } from 'express';

describe('Phase 20 - Voice & Audio Intelligence REST API Endpoints', () => {
  let app: Express;

  beforeAll(() => {
    const created = createApp();
    app = created.app;
  });

  describe('GET /api/jarvis/voice/status', () => {
    it('returns microphone status and active persona for authorized user', async () => {
      const res = await request(app)
        .get('/api/jarvis/voice/status')
        .set('x-user-id', 'dwight');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.activeDeviceId).toBeDefined();
      expect(res.body.data.isMuted).toBe(false);
      expect(res.body.data.activePersona.id).toBeDefined();
    });

    it('denies access when user lacks microphone permissions', async () => {
      const res = await request(app)
        .get('/api/jarvis/voice/status')
        .set('x-user-id', 'unregistered_anonymous_user');

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/jarvis/voice/devices', () => {
    it('discovers hardware microphone devices for authorized user', async () => {
      const res = await request(app)
        .get('/api/jarvis/voice/devices')
        .set('x-user-id', 'dwight');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBeGreaterThanOrEqual(2);
      expect(res.body.data[0].id).toBe('mic_integrated_array');
    });
  });

  describe('POST /api/jarvis/voice/mute', () => {
    it('controls hardware microphone mute state', async () => {
      const resMute = await request(app)
        .post('/api/jarvis/voice/mute')
        .set('x-user-id', 'dwight')
        .send({ muted: true });

      expect(resMute.status).toBe(200);
      expect(resMute.body.success).toBe(true);
      expect(resMute.body.data.muted).toBe(true);

      const resUnmute = await request(app)
        .post('/api/jarvis/voice/mute')
        .set('x-user-id', 'dwight')
        .send({ muted: false });

      expect(resUnmute.status).toBe(200);
      expect(resUnmute.body.data.muted).toBe(false);
    });
  });

  describe('POST /api/jarvis/voice/wake-word', () => {
    it('detects wake word trigger from audio utterance', async () => {
      const res = await request(app)
        .post('/api/jarvis/voice/wake-word')
        .set('x-user-id', 'dwight')
        .send({ text: 'Hey Jarvis, initialize full HUD telemetry' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.detected).toBe(true);
      expect(res.body.data.wakeWord).toBe('hey jarvis');
    });

    it('returns 400 when input text is missing', async () => {
      const res = await request(app)
        .post('/api/jarvis/voice/wake-word')
        .set('x-user-id', 'dwight')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/jarvis/voice/transcribe', () => {
    it('transcribes voice audio stream into text and words', async () => {
      const res = await request(app)
        .post('/api/jarvis/voice/transcribe')
        .set('x-user-id', 'dwight')
        .send({ text: 'JARVIS activate defensive perimeter' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.text).toContain('JARVIS activate');
      expect(res.body.data.words.length).toBeGreaterThan(0);
    });
  });

  describe('POST /api/jarvis/voice/synthesize', () => {
    it('synthesizes text into valid WAV audio with waveform and visemes', async () => {
      const res = await request(app)
        .post('/api/jarvis/voice/synthesize')
        .set('x-user-id', 'dwight')
        .send({
          text: 'Good morning Dwight, all autonomous agents are operational.',
          personaId: 'jarvis-classic',
          emotion: 'authoritative',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.audioBase64).toBeDefined();
      expect(res.body.data.format).toBe('audio/wav');
      expect(res.body.data.waveform.length).toBe(64);
      expect(res.body.data.phonemes.length).toBeGreaterThan(0);
    });

    it('returns 400 when text is missing', async () => {
      const res = await request(app)
        .post('/api/jarvis/voice/synthesize')
        .set('x-user-id', 'dwight')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/jarvis/voice/analyze', () => {
    it('analyzes environmental acoustic parameters and sound events', async () => {
      const res = await request(app)
        .post('/api/jarvis/voice/analyze')
        .set('x-user-id', 'dwight')
        .send({ audioSamples: [0.1, 0.2, 0.15, -0.1, -0.2] });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.dbLevel).toBeDefined();
      expect(res.body.data.snrRatio).toBeDefined();
      expect(res.body.data.detectedEvents.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/jarvis/voice/personas & POST /api/jarvis/voice/persona', () => {
    it('lists available personas and switches active persona', async () => {
      const listRes = await request(app)
        .get('/api/jarvis/voice/personas')
        .set('x-user-id', 'dwight');

      expect(listRes.status).toBe(200);
      expect(listRes.body.count).toBe(4);

      const switchRes = await request(app)
        .post('/api/jarvis/voice/persona')
        .set('x-user-id', 'dwight')
        .send({ personaId: 'friday-us' });

      expect(switchRes.status).toBe(200);
      expect(switchRes.body.success).toBe(true);
      expect(switchRes.body.data.id).toBe('friday-us');
    });

    it('returns 400 when personaId is missing on switch', async () => {
      const res = await request(app)
        .post('/api/jarvis/voice/persona')
        .set('x-user-id', 'dwight')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
});
