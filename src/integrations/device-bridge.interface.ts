import { ResourcePermission } from '../security/types.js';

export type DeviceType = 'laptop' | 'desktop' | 'phone' | 'camera' | 'microphone' | 'bluetooth_peripheral';

export interface DeviceTelemetry {
  deviceId: string;
  type: DeviceType;
  name: string;
  batteryLevel?: number;
  isOnline: boolean;
  osVersion?: string;
  lastHeartbeat: string;
}

export interface IDeviceBridge {
  readonly deviceId: string;
  readonly deviceType: DeviceType;
  readonly requiredPermissions: ResourcePermission[];

  getTelemetry(): Promise<DeviceTelemetry>;
  sendNotification(title: string, message: string): Promise<boolean>;
  dispatchCommand(command: string, args?: unknown): Promise<{ success: boolean; output?: string; error?: string }>;
}
