/**
 * JARVIS Phase 13 - Creative REST API & Multi-Agent Integration Tests
 */

import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/server/app.js';
import { Express } from 'express';
import { JarvisCore } from '../../src/core/jarvis-core.js';

describe('Phase 13 - Creative Studio REST API Endpoints', () => {
  let app: Express;
  let core: JarvisCore;

  beforeAll(() => {
    const created = createApp();
    app = created.app;
    core = created.core;
  });

  describe('GET /api/jarvis/creative/status', () => {
    it('returns creative studio status and feature flags', async () => {
      const res = await request(app).get('/api/jarvis/creative/status');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.serviceName).toBe('JARVIS Creative Studio Engine');
      expect(res.body.data.supportedStyles).toContain('cyberpunk');
      expect(res.body.data.features.length).toBeGreaterThan(4);
    });
  });

  describe('POST /api/jarvis/creative/image/generate', () => {
    it('generates vector SVG artwork for authorized user', async () => {
      const res = await request(app)
        .post('/api/jarvis/creative/image/generate')
        .set('x-user-id', 'dwight')
        .send({
          prompt: 'Bioluminescent deep-sea robotic exploration vessel',
          style: 'digital_art',
          aspectRatio: '16:9',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.isVector).toBe(true);
      expect(res.body.data.contentData).toContain('<svg');
    });

    it('rejects image generation when prompt is missing', async () => {
      const res = await request(app)
        .post('/api/jarvis/creative/image/generate')
        .set('x-user-id', 'dwight')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('prompt');
    });

    it('denies image generation for unauthorized user', async () => {
      const res = await request(app)
        .post('/api/jarvis/creative/image/generate')
        .set('x-user-id', 'unauthorized_stranger')
        .send({ prompt: 'Something unauthorized' });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Permission Denied');
    });
  });

  describe('POST /api/jarvis/creative/image/edit', () => {
    it('edits an SVG artwork with filter or watermark', async () => {
      const svg = '<svg xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100"/></svg>';
      const res = await request(app)
        .post('/api/jarvis/creative/image/edit')
        .set('x-user-id', 'dwight')
        .send({
          svgContent: svg,
          instruction: 'add_watermark',
          watermarkText: 'TOP SECRET',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.contentData).toContain('TOP SECRET');
    });
  });

  describe('POST /api/jarvis/creative/graphic/compose', () => {
    it('composes a vector graphic banner layout', async () => {
      const res = await request(app)
        .post('/api/jarvis/creative/graphic/compose')
        .set('x-user-id', 'dwight')
        .send({
          title: 'Quantum Cognitive Systems',
          subtitle: 'Architectural Blueprint',
          layout: 'banner',
          theme: 'dark_neon',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.layout).toBe('banner');
      expect(res.body.data.svgMarkup).toContain('Quantum Cognitive Systems');
    });
  });

  describe('POST /api/jarvis/creative/presentation/create', () => {
    it('builds a multi-slide presentation deck with HTML export', async () => {
      const res = await request(app)
        .post('/api/jarvis/creative/presentation/create')
        .set('x-user-id', 'dwight')
        .send({
          topic: 'Principles of Trustworthy Personal AI',
          targetAudience: 'Engineering Leaders',
          slideCount: 5,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalSlides).toBe(5);
      expect(res.body.data.htmlExport).toContain('Principles of Trustworthy Personal AI');
    });
  });

  describe('POST /api/jarvis/creative/subtitles/generate', () => {
    it('generates timed subtitle cues from transcript', async () => {
      const res = await request(app)
        .post('/api/jarvis/creative/subtitles/generate')
        .set('x-user-id', 'dwight')
        .send({
          transcript: 'Welcome to JARVIS. This is an automated test of subtitle generation.',
          format: 'srt',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.format).toBe('srt');
      expect(res.body.data.entryCount).toBeGreaterThan(0);
    });
  });

  describe('POST /api/jarvis/creative/speech/spec', () => {
    it('generates SSML specification with prosody and duration', async () => {
      const res = await request(app)
        .post('/api/jarvis/creative/speech/spec')
        .set('x-user-id', 'dwight')
        .send({
          text: 'Security Guardian check passed. Commencing autonomous pipeline.',
          voiceGender: 'neutral',
          speakingRate: 1.1,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.ssml).toContain('<speak');
      expect(res.body.data.wordCount).toBe(7);
    });
  });

  describe('POST /api/jarvis/creative/storyboard/create', () => {
    it('plans cinematic video storyboard and produces manifest', async () => {
      const res = await request(app)
        .post('/api/jarvis/creative/storyboard/create')
        .set('x-user-id', 'dwight')
        .send({
          projectTitle: 'Project Prometheus',
          concept: 'Autonomous intelligence assisting human cognition',
          sceneCount: 5,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalScenes).toBe(5);
      expect(res.body.data.renderManifestJson).toContain('Project Prometheus');
    });
  });

  describe('Creative Agent & Tools Integration', () => {
    it('registers all 8 creative tools in ToolRegistry', () => {
      const toolRegistry = core.getToolRegistry();
      const expectedTools = [
        'creative.generate_image',
        'creative.edit_image',
        'creative.compose_graphic',
        'creative.create_presentation',
        'creative.export_document_layout',
        'creative.generate_subtitles',
        'creative.synthesize_speech_spec',
        'creative.create_storyboard',
      ];

      for (const tid of expectedTools) {
        expect(toolRegistry.get(tid)).toBeDefined();
      }
    });

    it('executes creative.generate_image via ToolRegistry', async () => {
      const tool = core.getToolRegistry().getImplementation('creative.generate_image');
      expect(tool).toBeDefined();

      const result = await tool!.execute(
        { prompt: 'Cyberpunk orbital station' },
        { requestId: 'test_req', userId: 'dwight' }
      );

      expect(result.success).toBe(true);
      expect(result.verified).toBe(true);
      expect((result.data as any).mimeType).toBe('image/svg+xml');
    });

    it('executes creative-agent via AgentRegistry', async () => {
      const agent = core.getAgentRegistry().getImplementation('creative-agent');
      expect(agent).toBeDefined();

      const result = await agent!.execute(
        {
          action: 'create_storyboard',
          projectTitle: 'Agent Test',
          concept: 'Autonomous testing sequence',
        },
        { requestId: 'agent_req', userId: 'dwight' }
      );

      expect(result.success).toBe(true);
      expect(result.agentId).toBe('creative-agent');
      expect((result.data as any).totalScenes).toBeGreaterThan(0);
    });
  });
});
