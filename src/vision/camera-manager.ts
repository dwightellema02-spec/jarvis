/**
 * JARVIS Phase 19 - Camera Device Manager & Frame Grabber
 * Manages webcam discovery, frame capture, rate-limiting, and privacy LED indicator states.
 */

import {
  CameraDeviceInfo,
  CameraStatus,
  CapturedFrame,
} from './vision.interface.js';

export interface CameraManagerConfig {
  defaultDeviceId?: string;
  maxFps?: number;
  simulated?: boolean;
}

export class CameraManager {
  private devices: CameraDeviceInfo[] = [];
  private status: CameraStatus = 'idle';
  private indicatorActive = false;
  private lastCaptureTime = 0;
  private minIntervalMs: number;
  private simulated: boolean;
  private activeDeviceId: string;

  constructor(config: CameraManagerConfig = {}) {
    this.simulated = config.simulated ?? true;
    const maxFps = config.maxFps ?? 10;
    this.minIntervalMs = Math.floor(1000 / maxFps);

    this.devices = [
      {
        id: 'cam_integrated_01',
        name: 'Integrated HD Webcam (1080p)',
        isDefault: true,
        capabilities: {
          maxWidth: 1920,
          maxHeight: 1080,
          maxFps: 30,
        },
      },
      {
        id: 'cam_external_4k',
        name: 'Ultra Vision 4K Studio Camera',
        isDefault: false,
        capabilities: {
          maxWidth: 3840,
          maxHeight: 2160,
          maxFps: 60,
        },
      },
    ];

    this.activeDeviceId = config.defaultDeviceId || this.devices[0].id;
  }

  public getStatus(): { status: CameraStatus; indicatorActive: boolean; activeDeviceId: string } {
    return {
      status: this.status,
      indicatorActive: this.indicatorActive,
      activeDeviceId: this.activeDeviceId,
    };
  }

  public getAvailableDevices(): CameraDeviceInfo[] {
    return [...this.devices];
  }

  public setActiveDevice(deviceId: string): boolean {
    const found = this.devices.find((d) => d.id === deviceId);
    if (!found) return false;
    this.activeDeviceId = deviceId;
    return true;
  }

  /**
   * Captures a single frame from the active camera.
   * Enforces privacy LED notification and frame rate interval throttling.
   */
  public async captureFrame(deviceId?: string): Promise<CapturedFrame> {
    const now = Date.now();
    if (now - this.lastCaptureTime < this.minIntervalMs) {
      throw new Error(
        `Camera capture rate limit exceeded. Enforcing ${this.minIntervalMs}ms frame interval.`
      );
    }
    this.lastCaptureTime = now;

    const targetDevice = deviceId || this.activeDeviceId;
    const device = this.devices.find((d) => d.id === targetDevice);
    if (!device) {
      throw new Error(`Camera device "${targetDevice}" not found.`);
    }

    // Activate camera privacy indicator (LED indicator invariant)
    this.status = 'streaming';
    this.indicatorActive = true;

    // Generate camera frame (high-resolution SVG/PNG data)
    const frameSvg = this.generateSampleCameraFrame(device.name, now);
    const dataBase64 = Buffer.from(frameSvg, 'utf-8').toString('base64');

    const frame: CapturedFrame = {
      id: `frame_${now}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date(now).toISOString(),
      deviceId: device.id,
      width: 1280,
      height: 720,
      format: 'image/svg+xml',
      dataBase64,
      indicatorActive: true,
      sizeBytes: dataBase64.length,
    };

    // Return to idle after burst
    setTimeout(() => {
      this.status = 'idle';
      this.indicatorActive = false;
    }, 1500);

    return frame;
  }

  private generateSampleCameraFrame(cameraName: string, timestamp: number): string {
    const timeStr = new Date(timestamp).toLocaleTimeString();
    return `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
      <defs>
        <radialGradient id="camGrad" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stop-color="#0a192f"/>
          <stop offset="100%" stop-color="#020813"/>
        </radialGradient>
      </defs>
      <rect width="1280" height="720" fill="url(#camGrad)"/>
      <circle cx="640" cy="360" r="180" fill="none" stroke="#00f0ff" stroke-width="2" stroke-dasharray="8 4"/>
      <circle cx="640" cy="360" r="12" fill="#00f0ff"/>
      <circle cx="48" cy="48" r="12" fill="#ef4444"/>
      <text x="72" y="54" fill="#ffffff" font-family="monospace" font-size="16" font-weight="bold">REC [CAMERA ACTIVE]</text>
      <text x="640" y="240" fill="#00f0ff" font-family="sans-serif" font-size="28" font-weight="bold" text-anchor="middle">JARVIS VISION CORE v3.0</text>
      <text x="640" y="280" fill="#94a3b8" font-family="monospace" font-size="16" text-anchor="middle">DEVICE: ${cameraName}</text>
      <text x="640" y="520" fill="#10b981" font-family="monospace" font-size="20" text-anchor="middle">TARGET LOCKED: OPERATOR DWIGHT</text>
      <text x="1232" y="688" fill="#64748b" font-family="monospace" font-size="14" text-anchor="end">${timeStr}</text>
    </svg>`;
  }
}
