/**
 * JARVIS Phase 20 - Voice & Audio Intelligence REST API Routes
 */

import { Router, Request, Response } from 'express';
import { VoiceManager } from '../../voice/voice-manager.js';

export function createVoiceRoutes(voiceManager: VoiceManager): Router {
  const router = Router();

  const isPermError = (msg: string) =>
    /permission denied|security block|prohibited|threat detected|rate limit|strictly prohibited/i.test(
      msg
    );

  // 1. Microphone Status & Privacy LED state
  router.get('/voice/status', (req: Request, res: Response) => {
    try {
      const userId = (req.headers['x-user-id'] as string) || 'default_user';
      const status = voiceManager.getMicrophoneStatus(userId);
      res.json({ success: true, data: status });
    } catch (err: any) {
      res.status(isPermError(err.message) ? 403 : 400).json({
        success: false,
        error: err.message,
      });
    }
  });

  // 2. Available Microphones
  router.get('/voice/devices', (req: Request, res: Response) => {
    try {
      const userId = (req.headers['x-user-id'] as string) || 'default_user';
      const devices = voiceManager.getAvailableMicrophones(userId);
      res.json({ success: true, count: devices.length, data: devices });
    } catch (err: any) {
      res.status(isPermError(err.message) ? 403 : 400).json({
        success: false,
        error: err.message,
      });
    }
  });

  // 3. Hardware Mute Control
  router.post('/voice/mute', (req: Request, res: Response) => {
    try {
      const userId = (req.headers['x-user-id'] as string) || 'default_user';
      const { muted = true } = req.body;
      const isMuted = voiceManager.setMute(Boolean(muted), userId);
      res.json({ success: true, data: { muted: isMuted } });
    } catch (err: any) {
      res.status(isPermError(err.message) ? 403 : 400).json({
        success: false,
        error: err.message,
      });
    }
  });

  // 4. Wake Word Detection
  router.post('/voice/wake-word', (req: Request, res: Response) => {
    try {
      const userId = (req.headers['x-user-id'] as string) || 'default_user';
      const { inputAudioOrText, text } = req.body;
      const input = inputAudioOrText || text || '';
      if (!input) {
        res.status(400).json({ success: false, error: 'Field "inputAudioOrText" is required.' });
        return;
      }
      const result = voiceManager.listenForWakeWord(input, userId);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(isPermError(err.message) ? 403 : 400).json({
        success: false,
        error: err.message,
      });
    }
  });

  // 5. Speech-to-Text Transcription
  router.post('/voice/transcribe', async (req: Request, res: Response) => {
    try {
      const userId = (req.headers['x-user-id'] as string) || 'default_user';
      const { audioPayload, text, languageHint = 'en' } = req.body;
      const payload = audioPayload || text || '';
      const result = await voiceManager.transcribeAudio(payload, languageHint, userId);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(isPermError(err.message) ? 403 : 400).json({
        success: false,
        error: err.message,
      });
    }
  });

  // 6. Text-to-Speech Synthesis
  router.post('/voice/synthesize', async (req: Request, res: Response) => {
    try {
      const userId = (req.headers['x-user-id'] as string) || 'default_user';
      const { text, personaId, emotion, pitch, rate, format } = req.body;
      if (!text) {
        res.status(400).json({ success: false, error: 'Field "text" is required.' });
        return;
      }
      const result = await voiceManager.synthesizeSpeech(
        { text, personaId, emotion, pitch, rate, format },
        userId
      );
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(isPermError(err.message) ? 403 : 400).json({
        success: false,
        error: err.message,
      });
    }
  });

  // 7. Acoustic Environment Analysis
  router.post('/voice/analyze', (req: Request, res: Response) => {
    try {
      const userId = (req.headers['x-user-id'] as string) || 'default_user';
      const { audioSamples = [] } = req.body;
      const result = voiceManager.analyzeAcoustics(audioSamples, userId);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(isPermError(err.message) ? 403 : 400).json({
        success: false,
        error: err.message,
      });
    }
  });

  // 8. Voice Personas
  router.get('/voice/personas', (_req: Request, res: Response) => {
    const personas = voiceManager.getVoicePersonas();
    res.json({ success: true, count: personas.length, data: personas });
  });

  router.post('/voice/persona', (req: Request, res: Response) => {
    try {
      const userId = (req.headers['x-user-id'] as string) || 'default_user';
      const { personaId } = req.body;
      if (!personaId) {
        res.status(400).json({ success: false, error: 'Field "personaId" is required.' });
        return;
      }
      const persona = voiceManager.setVoicePersona(personaId, userId);
      res.json({ success: true, data: persona });
    } catch (err: any) {
      res.status(isPermError(err.message) ? 403 : 400).json({
        success: false,
        error: err.message,
      });
    }
  });

  return router;
}
