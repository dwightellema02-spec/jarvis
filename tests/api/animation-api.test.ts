/**
 * JARVIS Phase 14 - Animation REST API & Multi-Agent Integration Tests
 */

import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/server/app.js';
import { Express } from 'express';
import { JarvisCore } from '../../src/core/jarvis-core.js';

describe('Phase 14 - Animation REST API Endpoints', () => {
  let app: Express;
  let core: JarvisCore;

  beforeAll(() => {
    const created = createApp();
    app = created.app;
    core = created.core;
  });

  describe('GET /api/jarvis/animation/tools', () => {
    it('audits video rendering software availability on host', async () => {
      const res = await request(app)
        .get('/api/jarvis/animation/tools')
        .set('x-user-id', 'dwight');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.canvasSupported).toBe(true);
      expect(typeof res.body.data.ffmpegInstalled).toBe('boolean');
      expect(res.body.data.notes.length).toBeGreaterThan(0);
    });
  });

  describe('POST /api/jarvis/animation/compose', () => {
    it('executes full 7-stage Bring It Alive pipeline for authorized user', async () => {
      const res = await request(app)
        .post('/api/jarvis/animation/compose')
        .set('x-user-id', 'dwight')
        .send({
          title: 'Quantum Avatar Prime',
          conceptPrompt: 'Holographic avatar speaking from central console terminal',
          durationSeconds: 5,
          fps: 30,
          characterName: 'Avatar Prime',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBeDefined();
      expect(res.body.data.totalFrames).toBe(150);
      expect(res.body.data.animatedSvgMarkup).toContain('<svg');
      expect(res.body.data.htmlPlayer).toContain('Quantum Avatar Prime');
    });

    it('rejects request when title or concept prompt is missing', async () => {
      const res = await request(app)
        .post('/api/jarvis/animation/compose')
        .set('x-user-id', 'dwight')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('required');
    });

    it('denies animation creation for unauthorized user', async () => {
      const res = await request(app)
        .post('/api/jarvis/animation/compose')
        .set('x-user-id', 'unauthorized_stranger')
        .send({
          title: 'Unauthorized Anim',
          conceptPrompt: 'Testing denial',
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Permission Denied');
    });
  });

  describe('POST /api/jarvis/animation/layers/decompose', () => {
    it('decomposes scene into hierarchical layers', async () => {
      const res = await request(app)
        .post('/api/jarvis/animation/layers/decompose')
        .set('x-user-id', 'dwight')
        .send({
          sceneTitle: 'Console Chamber',
          conceptPrompt: 'Cybernetic control room',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.count).toBe(7);
      expect(res.body.data.layers[0].id).toBe('layer_bg');
    });
  });

  describe('POST /api/jarvis/animation/rig', () => {
    it('constructs a skeletal 2D character rig', async () => {
      const res = await request(app)
        .post('/api/jarvis/animation/rig')
        .set('x-user-id', 'dwight')
        .send({
          characterName: 'Dwight Hero Rig',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.characterName).toBe('Dwight Hero Rig');
      expect(res.body.data.joints.length).toBeGreaterThan(10);
    });
  });

  describe('POST /api/jarvis/animation/keyframes/generate', () => {
    it('generates multi-track motion graphs and keyframes', async () => {
      const res = await request(app)
        .post('/api/jarvis/animation/keyframes/generate')
        .set('x-user-id', 'dwight')
        .send({ durationSeconds: 6 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.count).toBeGreaterThanOrEqual(4);
    });
  });

  describe('POST /api/jarvis/animation/lipsync/generate', () => {
    it('generates timed phoneme visemes from transcript', async () => {
      const res = await request(app)
        .post('/api/jarvis/animation/lipsync/generate')
        .set('x-user-id', 'dwight')
        .send({
          transcript: 'Good morning Dwight. Animation systems active.',
          durationSeconds: 4,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalCues).toBeGreaterThan(5);
    });
  });

  describe('Animation Agent & Tools Integration', () => {
    it('registers all 8 animation tools in ToolRegistry', () => {
      const toolRegistry = core.getToolRegistry();
      const expectedTools = [
        'animation.decompose_layers',
        'animation.rig_character',
        'animation.generate_keyframes',
        'animation.sync_lips',
        'animation.compose_scene',
        'animation.export_player',
        'animation.generate_render_manifest',
        'animation.check_rendering_tools',
      ];

      for (const tid of expectedTools) {
        expect(toolRegistry.get(tid)).toBeDefined();
      }
    });

    it('executes animation.compose_scene via ToolRegistry', async () => {
      const tool = core.getToolRegistry().getImplementation('animation.compose_scene');
      expect(tool).toBeDefined();

      const result = await tool!.execute(
        {
          title: 'Tool Test Scene',
          conceptPrompt: 'Autonomous tool test',
        },
        { requestId: 'test_anim_req', userId: 'dwight' }
      );

      expect(result.success).toBe(true);
      expect(result.verified).toBe(true);
      expect((result.data as any).totalFrames).toBeGreaterThan(0);
    });

    it('executes animation-agent via AgentRegistry', async () => {
      const agent = core.getAgentRegistry().getImplementation('animation-agent');
      expect(agent).toBeDefined();

      const result = await agent!.execute(
        {
          action: 'create_animation',
          title: 'Agent Animated Awakening',
          conceptPrompt: 'Avatar greeting in holographic console',
        },
        { requestId: 'agent_anim_req', userId: 'dwight' }
      );

      expect(result.success).toBe(true);
      expect(result.agentId).toBe('animation-agent');
      expect((result.data as any).animatedSvgMarkup).toContain('<svg');
    });
  });
});
