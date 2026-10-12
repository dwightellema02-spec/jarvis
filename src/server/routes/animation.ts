/**
 * JARVIS Phase 14 - Animation REST API Routes
 */

import { Router, Request, Response } from 'express';
import { AnimationManager } from '../../animation/animation-manager.js';

export function createAnimationRouter(animationManager: AnimationManager): Router {
  const router = Router();

  // 1. Check host system rendering tools
  router.get('/animation/tools', async (req: Request, res: Response) => {
    try {
      const userId = (req.headers['x-user-id'] as string) || 'default_user';
      const tools = await animationManager.checkRenderingTools(userId);
      res.json({ success: true, data: tools });
    } catch (err: any) {
      res.status(err.message.includes('Permission Denied') ? 403 : 500).json({
        success: false,
        error: err.message,
      });
    }
  });

  // 2. Compose full animation project
  router.post('/animation/compose', async (req: Request, res: Response) => {
    try {
      const userId = (req.headers['x-user-id'] as string) || 'default_user';
      const { title, conceptPrompt, style, durationSeconds, fps, characterName, transcriptVoice } = req.body;
      if (!title || !conceptPrompt) {
        res.status(400).json({ success: false, error: 'Fields "title" and "conceptPrompt" are required.' });
        return;
      }
      const project = await animationManager.createAnimation(
        { title, conceptPrompt, style, durationSeconds, fps, characterName, transcriptVoice },
        userId
      );
      res.json({ success: true, data: project });
    } catch (err: any) {
      res.status(err.message.includes('Permission Denied') ? 403 : 400).json({
        success: false,
        error: err.message,
      });
    }
  });

  // 3. Decompose scene layers
  router.post('/animation/layers/decompose', async (req: Request, res: Response) => {
    try {
      const userId = (req.headers['x-user-id'] as string) || 'default_user';
      const { sceneTitle, conceptPrompt, width, height, characterName } = req.body;
      if (!sceneTitle || !conceptPrompt) {
        res.status(400).json({ success: false, error: 'Fields "sceneTitle" and "conceptPrompt" are required.' });
        return;
      }
      const layers = await animationManager.decomposeLayers(
        {
          sceneTitle,
          conceptPrompt,
          width: width || 1280,
          height: height || 720,
          characterName,
        },
        userId
      );
      res.json({ success: true, data: { layers, count: layers.length } });
    } catch (err: any) {
      res.status(err.message.includes('Permission Denied') ? 403 : 400).json({
        success: false,
        error: err.message,
      });
    }
  });

  // 4. Rig character
  router.post('/animation/rig', async (req: Request, res: Response) => {
    try {
      const userId = (req.headers['x-user-id'] as string) || 'default_user';
      const { characterName } = req.body;
      if (!characterName) {
        res.status(400).json({ success: false, error: 'Field "characterName" is required.' });
        return;
      }
      const rig = await animationManager.rigCharacter(characterName, userId);
      res.json({ success: true, data: rig });
    } catch (err: any) {
      res.status(err.message.includes('Permission Denied') ? 403 : 400).json({
        success: false,
        error: err.message,
      });
    }
  });

  // 5. Generate motion tracks
  router.post('/animation/keyframes/generate', async (req: Request, res: Response) => {
    try {
      const userId = (req.headers['x-user-id'] as string) || 'default_user';
      const { durationSeconds } = req.body;
      const tracks = await animationManager.generateMotionTracks(durationSeconds || 6, userId);
      res.json({ success: true, data: { tracks, count: tracks.length } });
    } catch (err: any) {
      res.status(err.message.includes('Permission Denied') ? 403 : 400).json({
        success: false,
        error: err.message,
      });
    }
  });

  // 6. Generate lip sync
  router.post('/animation/lipsync/generate', async (req: Request, res: Response) => {
    try {
      const userId = (req.headers['x-user-id'] as string) || 'default_user';
      const { characterRigId, transcript, durationSeconds } = req.body;
      if (!transcript) {
        res.status(400).json({ success: false, error: 'Field "transcript" is required.' });
        return;
      }
      const track = await animationManager.generateLipSync(
        characterRigId || 'rig_default',
        transcript,
        durationSeconds || 5,
        userId
      );
      res.json({ success: true, data: track });
    } catch (err: any) {
      res.status(err.message.includes('Permission Denied') ? 403 : 400).json({
        success: false,
        error: err.message,
      });
    }
  });

  return router;
}
