/**
 * JARVIS Phase 19 - Vision & Camera Intelligence REST API Routes
 */

import { Router, Request, Response } from 'express';
import { VisionManager } from '../../vision/vision-manager.js';

export function createVisionRoutes(visionManager: VisionManager): Router {
  const router = Router();

  const isPermError = (msg: string) =>
    /permission denied|security block|prohibited|threat detected|rate limit|strictly prohibited/i.test(
      msg
    );

  // 1. Camera Status & Privacy LED state
  router.get('/vision/camera/status', (req: Request, res: Response) => {
    try {
      const userId = (req.headers['x-user-id'] as string) || 'default_user';
      const status = visionManager.getCameraStatus(userId);
      res.json({ success: true, data: status });
    } catch (err: any) {
      res.status(isPermError(err.message) ? 403 : 400).json({
        success: false,
        error: err.message,
      });
    }
  });

  // 2. Discover Available Cameras
  router.get('/vision/camera/devices', (req: Request, res: Response) => {
    try {
      const userId = (req.headers['x-user-id'] as string) || 'default_user';
      const devices = visionManager.getAvailableCameras(userId);
      res.json({ success: true, count: devices.length, data: devices });
    } catch (err: any) {
      res.status(isPermError(err.message) ? 403 : 400).json({
        success: false,
        error: err.message,
      });
    }
  });

  // 3. Capture Camera Frame
  router.post('/vision/camera/capture', async (req: Request, res: Response) => {
    try {
      const userId = (req.headers['x-user-id'] as string) || 'default_user';
      const { deviceId } = req.body;
      const frame = await visionManager.captureCameraFrame(deviceId, userId);
      res.json({ success: true, data: frame });
    } catch (err: any) {
      res.status(isPermError(err.message) ? 403 : 400).json({
        success: false,
        error: err.message,
      });
    }
  });

  // 4. Capture Desktop Screen
  router.post('/vision/screen/capture', async (req: Request, res: Response) => {
    try {
      const userId = (req.headers['x-user-id'] as string) || 'default_user';
      const { target = 'fullscreen', region, windowTitle } = req.body;
      const screen = await visionManager.captureScreen(target, region, windowTitle, userId);
      res.json({ success: true, data: screen });
    } catch (err: any) {
      res.status(isPermError(err.message) ? 403 : 400).json({
        success: false,
        error: err.message,
      });
    }
  });

  // 5. OCR Text Extraction
  router.post('/vision/ocr', async (req: Request, res: Response) => {
    try {
      const userId = (req.headers['x-user-id'] as string) || 'default_user';
      const { imageBase64, languageHint = 'en' } = req.body;
      if (!imageBase64) {
        res.status(400).json({ success: false, error: 'Field "imageBase64" is required.' });
        return;
      }
      const ocr = await visionManager.performOcr(imageBase64, languageHint, userId);
      res.json({ success: true, data: ocr });
    } catch (err: any) {
      res.status(isPermError(err.message) ? 403 : 400).json({
        success: false,
        error: err.message,
      });
    }
  });

  // 6. Visual Analysis & Object Detection
  router.post('/vision/analyze', async (req: Request, res: Response) => {
    try {
      const userId = (req.headers['x-user-id'] as string) || 'default_user';
      const { imageBase64 } = req.body;
      if (!imageBase64) {
        res.status(400).json({ success: false, error: 'Field "imageBase64" is required.' });
        return;
      }
      const analysis = await visionManager.analyzeImage(imageBase64, userId);
      res.json({ success: true, data: analysis });
    } catch (err: any) {
      res.status(isPermError(err.message) ? 403 : 400).json({
        success: false,
        error: err.message,
      });
    }
  });

  // 7. Privacy Redaction
  router.post('/vision/redact', (req: Request, res: Response) => {
    try {
      const userId = (req.headers['x-user-id'] as string) || 'default_user';
      const { text, imageBase64 } = req.body;
      if (!text) {
        res.status(400).json({ success: false, error: 'Field "text" is required.' });
        return;
      }
      const redaction = visionManager.redactSensitiveInfo(text, imageBase64, userId);
      res.json({ success: true, data: redaction });
    } catch (err: any) {
      res.status(isPermError(err.message) ? 403 : 400).json({
        success: false,
        error: err.message,
      });
    }
  });

  // 8. Document & Whiteboard Scanning
  router.post('/vision/document', async (req: Request, res: Response) => {
    try {
      const userId = (req.headers['x-user-id'] as string) || 'default_user';
      const { imageBase64 } = req.body;
      if (!imageBase64) {
        res.status(400).json({ success: false, error: 'Field "imageBase64" is required.' });
        return;
      }
      const doc = await visionManager.scanDocument(imageBase64, userId);
      res.json({ success: true, data: doc });
    } catch (err: any) {
      res.status(isPermError(err.message) ? 403 : 400).json({
        success: false,
        error: err.message,
      });
    }
  });

  return router;
}
