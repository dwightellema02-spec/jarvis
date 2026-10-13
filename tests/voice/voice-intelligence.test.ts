import { describe, it, expect, beforeEach } from 'vitest';
import {
  AudioIngestionManager,
  SpeechToTextEngine,
  TextToSpeechEngine,
  AcousticAnalyzer,
  VoiceManager,
  VoiceAgent,
  createVoiceTools,
} from '../../src/voice/index.js';
import { PermissionManager } from '../../src/security/permission-manager.js';
import { SecurityGuardian } from '../../src/security/guardian.js';
import { AuditLogger } from '../../src/audit/audit-logger.js';
import { ResourceType, PermissionLevel } from '../../src/security/types.js';

describe('Phase 20: Voice & Audio Intelligence', () => {
  let permissionManager: PermissionManager;
  let guardian: SecurityGuardian;
  let auditLogger: AuditLogger;
  let voiceManager: VoiceManager;

  beforeEach(() => {
    permissionManager = new PermissionManager();
    guardian = new SecurityGuardian();
    auditLogger = new AuditLogger();

    permissionManager.grantPermission({
      userId: 'test_user',
      resource: ResourceType.MICROPHONE,
      level: PermissionLevel.ADMIN,
      allowedActions: ['read', 'write', 'execute', 'admin'],
      grantedBy: 'system',
    });

    permissionManager.grantPermission({
      userId: 'read_only_user',
      resource: ResourceType.MICROPHONE,
      level: PermissionLevel.READ,
      allowedActions: ['read'],
      grantedBy: 'system',
    });

    voiceManager = new VoiceManager({
      permissionManager,
      guardian,
      auditLogger,
    });
  });

  describe('1. Microphone Device Discovery & Active Indicator Invariant', () => {
    it('discovers available hardware microphone devices', () => {
      const devices = voiceManager.getAvailableMicrophones('test_user');
      expect(devices.length).toBeGreaterThanOrEqual(2);
      expect(devices.some((d) => d.id === 'mic_integrated_array')).toBe(true);
      expect(devices[0].channels).toBeGreaterThanOrEqual(1);
      expect(devices[0].sampleRate).toBeGreaterThanOrEqual(16000);
    });

    it('reports idle status and privacy indicator state', () => {
      const status = voiceManager.getMicrophoneStatus('test_user');
      expect(status.status).toBe('idle');
      expect(status.indicatorActive).toBe(false);
      expect(status.isMuted).toBe(false);
      expect(status.activeDeviceId).toBe('mic_integrated_array');
      expect(status.activePersona.id).toBe('jarvis-classic');
    });

    it('acquires audio stream chunk with active privacy indicator', () => {
      const chunk = voiceManager.acquireStreamChunk('test_user');
      expect(chunk.chunkId).toBeDefined();
      expect(chunk.indicatorActive).toBe(true);
      expect(chunk.samples.length).toBeGreaterThan(0);
      expect(chunk.sampleRate).toBe(16000);
    });

    it('enforces rate limiting on rapid audio stream acquisitions', () => {
      const ingestion = new AudioIngestionManager({ maxStreamFps: 10 });
      ingestion.acquireStreamChunk();
      expect(() => ingestion.acquireStreamChunk()).toThrow(/rate limit exceeded/i);
    });
  });

  describe('2. Hardware Mute Control & Eavesdropping Protection', () => {
    it('toggles hardware mute state', () => {
      const muted = voiceManager.setMute(true, 'test_user');
      expect(muted).toBe(true);
      const status = voiceManager.getMicrophoneStatus('test_user');
      expect(status.isMuted).toBe(true);
      expect(status.status).toBe('muted');
      expect(status.indicatorActive).toBe(false);

      const unmuted = voiceManager.setMute(false, 'test_user');
      expect(unmuted).toBe(false);
      expect(voiceManager.getMicrophoneStatus('test_user').isMuted).toBe(false);
    });

    it('strictly blocks audio chunk acquisition when muted', () => {
      voiceManager.setMute(true, 'test_user');
      expect(() => voiceManager.acquireStreamChunk('test_user')).toThrow(/hardware-muted/i);
    });

    it('suppresses wake word detection when muted', () => {
      voiceManager.setMute(true, 'test_user');
      const res = voiceManager.listenForWakeWord('hey jarvis', 'test_user');
      expect(res.detected).toBe(false);
      expect(res.confidence).toBe(0);
    });
  });

  describe('3. Wake Word Detection', () => {
    it('detects "hey jarvis" wake word with high confidence', () => {
      const res = voiceManager.listenForWakeWord('Hey Jarvis, wake up and run diagnostics', 'test_user');
      expect(res.detected).toBe(true);
      expect(res.wakeWord).toBe('hey jarvis');
      expect(res.confidence).toBeGreaterThan(0.9);
    });

    it('detects standalone "jarvis" wake word', () => {
      const res = voiceManager.listenForWakeWord('Jarvis, what is the server temperature?', 'test_user');
      expect(res.detected).toBe(true);
      expect(res.wakeWord).toBe('jarvis');
      expect(res.confidence).toBeGreaterThan(0.9);
    });

    it('returns detected = false for unrelated utterances', () => {
      const res = voiceManager.listenForWakeWord('Hello world, good morning system', 'test_user');
      expect(res.detected).toBe(false);
      expect(res.confidence).toBeLessThan(0.5);
    });
  });

  describe('4. Voice Activity Detection (VAD)', () => {
    it('partitions audio samples into speech and silence segments', () => {
      const ingestion = new AudioIngestionManager();
      // Generate 320 samples: first half silence, second half energetic speech
      const samples = [
        ...new Array(160).fill(0.01),
        ...new Array(160).fill(0.35),
      ];
      const segments = ingestion.analyzeVoiceActivity(samples);
      expect(segments.length).toBe(2);
      expect(segments[0].isSpeech).toBe(false);
      expect(segments[1].isSpeech).toBe(true);
      expect(segments[1].speechProbability).toBeGreaterThan(0.5);
    });
  });

  describe('5. Speech-to-Text (STT) Transcription Engine', () => {
    const stt = new SpeechToTextEngine();

    it('transcribes voice audio into text with word timestamps', async () => {
      const transcriptBase64 = Buffer.from('JARVIS open coding studio and inspect git status', 'utf-8').toString('base64');
      const res = await stt.transcribe(transcriptBase64, 'en');

      expect(res.text).toContain('JARVIS open coding studio');
      expect(res.confidence).toBeGreaterThan(0.9);
      expect(res.words.length).toBe(8);
      expect(res.words[0].word).toBe('JARVIS');
      expect(res.words[0].startTimeMs).toBeGreaterThan(0);
      expect(res.words[0].endTimeMs).toBeGreaterThan(res.words[0].startTimeMs);
    });

    it('supports multi-language defaults (fil, es)', async () => {
      const resFil = await stt.transcribe('', 'fil');
      expect(resFil.language).toBe('fil');
      expect(resFil.text).toContain('Kamusta JARVIS');

      const resEs = await stt.transcribe('', 'es');
      expect(resEs.language).toBe('es');
      expect(resEs.text).toContain('Hola JARVIS');
    });
  });

  describe('6. Text-to-Speech (TTS) Synthesis Engine', () => {
    const tts = new TextToSpeechEngine();

    it('synthesizes natural speech audio with voice personas', async () => {
      const res = await tts.synthesize({
        text: 'All autonomous defensive systems are fully operational.',
        personaId: 'jarvis-classic',
        emotion: 'authoritative',
      });

      expect(res.audioBase64).toBeDefined();
      expect(res.format).toBe('audio/wav');
      expect(res.durationMs).toBeGreaterThan(500);
      expect(res.voicePersona.id).toBe('jarvis-classic');
      expect(res.voicePersona.emotion).toBe('authoritative');
    });

    it('generates real valid RIFF WAV audio buffer with PCM data', async () => {
      const res = await tts.synthesize({
        text: 'Audio test.',
        personaId: 'friday-us',
      });

      const buffer = Buffer.from(res.audioBase64, 'base64');
      expect(buffer.slice(0, 4).toString('utf-8')).toBe('RIFF');
      expect(buffer.slice(8, 12).toString('utf-8')).toBe('WAVE');
      expect(buffer.slice(12, 16).toString('utf-8')).toBe('fmt ');
      expect(buffer.slice(36, 40).toString('utf-8')).toBe('data');
      expect(buffer.length).toBeGreaterThan(44);
    });

    it('generates phoneme timings for visual mouth viseme synchronization', async () => {
      const res = await tts.synthesize({
        text: 'Hello world',
        personaId: 'nexus-neutral',
      });

      expect(res.phonemes.length).toBeGreaterThan(0);
      expect(res.phonemes[0].phoneme).toBeDefined();
      expect(res.phonemes[0].startMs).toBeDefined();
      expect(res.phonemes[0].endMs).toBeGreaterThanOrEqual(res.phonemes[0].startMs);
    });

    it('generates 64-point normalized audio envelope for oscilloscope canvas', async () => {
      const res = await tts.synthesize({
        text: 'Waveform oscilloscope test',
        personaId: 'let-mentor',
      });

      expect(res.waveform.length).toBe(64);
      expect(res.waveform[0]).toBeGreaterThanOrEqual(0.05);
      expect(res.waveform[32]).toBeLessThanOrEqual(1.0);
    });
  });

  describe('7. Acoustic Analyzer & Sound Event Detection (SED)', () => {
    const acoustic = new AcousticAnalyzer();

    it('measures ambient decibel SPL levels and SNR ratios', () => {
      const res = acoustic.analyze([]);
      expect(res.dbLevel).toBeGreaterThanOrEqual(30);
      expect(res.snrRatio).toBeGreaterThan(10);
      expect(res.detectedEvents.length).toBeGreaterThan(0);
      expect(res.clarityScore).toBeGreaterThan(0.8);
    });

    it('classifies environmental speech sound events', () => {
      // Synthesize 140Hz tone (human speech F0)
      const samples: number[] = [];
      for (let i = 0; i < 1600; i++) {
        samples.push(0.3 * Math.sin(2 * Math.PI * 140 * (i / 16000)));
      }
      const res = acoustic.analyze(samples);
      expect(res.detectedEvents.some((e) => e.type === 'speech')).toBe(true);
    });

    it('flags acoustic alert hazards when noise exceeds 85 dB', () => {
      // High-amplitude samples
      const loudSamples = new Array(1600).fill(0.95);
      const res = acoustic.analyze(loudSamples);
      expect(res.dbLevel).toBeGreaterThan(85.0);
      expect(res.safetyAlerts.some((a) => a.includes('85 dB'))).toBe(true);
    });
  });

  describe('8. VoiceManager Security & Capability Integration', () => {
    it('enforces permission denied for unauthorized users', async () => {
      expect(() => voiceManager.getMicrophoneStatus('unauthorized_stranger')).toThrow(
        /Permission Denied/i
      );
      await expect(
        voiceManager.synthesizeSpeech({ text: 'Hello' }, 'unauthorized_stranger')
      ).rejects.toThrow(/Permission Denied/i);
    });

    it('switches voice persona and records audit trails', () => {
      const persona = voiceManager.setVoicePersona('friday-us', 'test_user');
      expect(persona.id).toBe('friday-us');
      expect(persona.name).toContain('F.R.I.D.A.Y.');
      expect(voiceManager.getMicrophoneStatus('test_user').activePersona.id).toBe('friday-us');
    });
  });

  describe('9. VoiceAgent & 8 Tool Implementations', () => {
    it('executes agent actions via IAgent interface', async () => {
      const agent = new VoiceAgent(voiceManager);
      expect(agent.definition.id).toBe('voice-agent');
      expect(agent.definition.status).toBe('implemented');

      const wakeRes = await agent.execute(
        { action: 'wake_word_listen', text: 'hey jarvis' },
        { userId: 'test_user', sessionId: 'test_sess', permissions: [] }
      );
      expect(wakeRes.success).toBe(true);
      expect(wakeRes.data.detected).toBe(true);

      const statusRes = await agent.execute(
        { action: 'audio_stream_status' },
        { userId: 'test_user', sessionId: 'test_sess', permissions: [] }
      );
      expect(statusRes.success).toBe(true);
      expect(['idle', 'listening']).toContain(statusRes.data.status);
    });

    it('registers and executes all 8 voice tools successfully', async () => {
      const tools = createVoiceTools(voiceManager);
      expect(tools.length).toBe(8);

      const toolMap = new Map(tools.map((t) => [t.definition.id, t]));

      const t1 = await toolMap.get('voice.wake_word_listen')!.execute({ text: 'jarvis' }, { userId: 'test_user' } as any);
      expect(t1.success).toBe(true);
      expect(t1.data.detected).toBe(true);

      const t2 = await toolMap.get('voice.transcribe_audio')!.execute({ text: 'system online' }, { userId: 'test_user' } as any);
      expect(t2.success).toBe(true);
      expect(t2.data.text).toBeDefined();

      const t3 = await toolMap.get('voice.synthesize_speech')!.execute({ text: 'All systems green.' }, { userId: 'test_user' } as any);
      expect(t3.success).toBe(true);
      expect(t3.data.audioBase64).toBeDefined();

      const t4 = await toolMap.get('voice.analyze_acoustics')!.execute({}, { userId: 'test_user' } as any);
      expect(t4.success).toBe(true);
      expect(t4.data.dbLevel).toBeDefined();

      const t5 = await toolMap.get('voice.set_voice_persona')!.execute({ personaId: 'nexus-neutral' }, { userId: 'test_user' } as any);
      expect(t5.success).toBe(true);
      expect(t5.data.id).toBe('nexus-neutral');

      const t6 = await toolMap.get('voice.detect_sound_events')!.execute({}, { userId: 'test_user' } as any);
      expect(t6.success).toBe(true);
      expect(Array.isArray(t6.data)).toBe(true);

      const t7 = await toolMap.get('voice.mute_microphone')!.execute({ muted: false }, { userId: 'test_user' } as any);
      expect(t7.success).toBe(true);
      expect(t7.data.muted).toBe(false);

      const t8 = await toolMap.get('voice.audio_stream_status')!.execute({}, { userId: 'test_user' } as any);
      expect(t8.success).toBe(true);
      expect(t8.data.status).toBe('idle');
    });
  });
});
