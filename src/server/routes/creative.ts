/**
 * JARVIS Phase 13 - Creative Studio REST API Routes
 */

import { Router, Request, Response } from 'express';
import { CreativeManager } from '../../creative/creative-manager.js';

export function createCreativeRouter(creativeManager: CreativeManager): Router {
  const router = Router();

  // 1. Status
  router.get('/creative/status', (_req: Request, res: Response) => {
    try {
      const status = creativeManager.getStatus();
      res.json({ success: true, data: status });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 2. Generate Image
  router.post('/creative/image/generate', async (req: Request, res: Response) => {
    try {
      const userId = (req.headers['x-user-id'] as string) || 'default_user';
      const { prompt, style, aspectRatio, width, height } = req.body;
      if (!prompt) {
        res.status(400).json({ success: false, error: 'Field "prompt" is required.' });
        return;
      }
      const result = await creativeManager.generateImage(
        { prompt, style, aspectRatio, width, height },
        userId
      );
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(err.message.includes('Permission Denied') ? 403 : 400).json({
        success: false,
        error: err.message,
      });
    }
  });

  // 3. Edit Image
  router.post('/creative/image/edit', async (req: Request, res: Response) => {
    try {
      const userId = (req.headers['x-user-id'] as string) || 'default_user';
      const { svgContent, instruction, watermarkText, scaleFactor } = req.body;
      if (!svgContent || !instruction) {
        res.status(400).json({ success: false, error: 'Fields "svgContent" and "instruction" are required.' });
        return;
      }
      const result = await creativeManager.editImage(
        { svgContent, instruction, watermarkText, scaleFactor },
        userId
      );
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(err.message.includes('Permission Denied') ? 403 : 400).json({
        success: false,
        error: err.message,
      });
    }
  });

  // 4. Compose Graphic
  router.post('/creative/graphic/compose', async (req: Request, res: Response) => {
    try {
      const userId = (req.headers['x-user-id'] as string) || 'default_user';
      const { title, subtitle, layout, theme, width, height, elements } = req.body;
      if (!title || !layout) {
        res.status(400).json({ success: false, error: 'Fields "title" and "layout" are required.' });
        return;
      }
      const result = await creativeManager.composeGraphic(
        { title, subtitle, layout, theme: theme || 'dark_neon', width, height, elements },
        userId
      );
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(err.message.includes('Permission Denied') ? 403 : 400).json({
        success: false,
        error: err.message,
      });
    }
  });

  // 5. Create Presentation Deck
  router.post('/creative/presentation/create', async (req: Request, res: Response) => {
    try {
      const userId = (req.headers['x-user-id'] as string) || 'default_user';
      const { topic, targetAudience, slideCount, theme } = req.body;
      if (!topic) {
        res.status(400).json({ success: false, error: 'Field "topic" is required.' });
        return;
      }
      const result = await creativeManager.createPresentation(
        { topic, targetAudience, slideCount, theme: theme || 'jarvis_dark' },
        userId
      );
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(err.message.includes('Permission Denied') ? 403 : 400).json({
        success: false,
        error: err.message,
      });
    }
  });

  // 6. Generate Subtitles
  router.post('/creative/subtitles/generate', async (req: Request, res: Response) => {
    try {
      const userId = (req.headers['x-user-id'] as string) || 'default_user';
      const { transcript, format, wordsPerLine, secondsPerWord } = req.body;
      if (!transcript) {
        res.status(400).json({ success: false, error: 'Field "transcript" is required.' });
        return;
      }
      const result = await creativeManager.generateSubtitles(
        { transcript, format, wordsPerLine, secondsPerWord },
        userId
      );
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(err.message.includes('Permission Denied') ? 403 : 400).json({
        success: false,
        error: err.message,
      });
    }
  });

  // 7. Synthesize Speech Spec
  router.post('/creative/speech/spec', async (req: Request, res: Response) => {
    try {
      const userId = (req.headers['x-user-id'] as string) || 'default_user';
      const { text, voiceGender, speakingRate, pitch } = req.body;
      if (!text) {
        res.status(400).json({ success: false, error: 'Field "text" is required.' });
        return;
      }
      const result = await creativeManager.synthesizeSpeechSpec(
        { text, voiceGender, speakingRate, pitch },
        userId
      );
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(err.message.includes('Permission Denied') ? 403 : 400).json({
        success: false,
        error: err.message,
      });
    }
  });

  // 8. Create Storyboard
  router.post('/creative/storyboard/create', async (req: Request, res: Response) => {
    try {
      const userId = (req.headers['x-user-id'] as string) || 'default_user';
      const { projectTitle, concept, targetDurationSeconds, sceneCount } = req.body;
      if (!projectTitle || !concept) {
        res.status(400).json({ success: false, error: 'Fields "projectTitle" and "concept" are required.' });
        return;
      }
      const result = await creativeManager.createStoryboard(
        { projectTitle, concept, targetDurationSeconds, sceneCount },
        userId
      );
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(err.message.includes('Permission Denied') ? 403 : 400).json({
        success: false,
        error: err.message,
      });
    }
  });

  return router;
}
