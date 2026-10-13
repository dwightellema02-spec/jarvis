/**
 * JARVIS Phase 21 - Hardware, Device & IoT Integration Data Contracts
 */

export type DeviceType =
  | 'usb'
  | 'serial'
  | 'ble'
  | 'iot_light'
  | 'iot_plug'
  | 'iot_thermostat'
  | 'system_sensor';

export type DeviceStatus = 'connected' | 'disconnected' | 'busy' | 'error' | 'standby';

export interface DeviceInfo {
  id: string;
  name: string;
  type: DeviceType;
  vendor: string;
  model: string;
  status: DeviceStatus;
  connectionPath: string; // e.g. "COM3", "USB\VID_046D&PID_C52B", "AA:BB:CC:DD:EE:FF", "192.168.1.150"
  capabilities: string[];
  firmwareVersion?: string;
  metadata?: Record<string, unknown>;
}

export interface SystemTelemetry {
  cpu: {
    usagePercent: number;
    tempCelsius: number;
    cores: number;
    freqGhz: number;
    throttling: boolean;
  };
  gpu: {
    usagePercent: number;
    tempCelsius: number;
    memoryUsedMb: number;
    memoryTotalMb: number;
  };
  memory: {
    usedBytes: number;
    totalBytes: number;
    usagePercent: number;
  };
  battery: {
    levelPercent: number;
    isCharging: boolean;
    healthPercent: number;
    timeRemainingMin?: number;
  };
  storage: {
    usedBytes: number;
    totalBytes: number;
    usagePercent: number;
  };
  systemUptimeSec: number;
  timestamp: string;
}

export interface IoTDeviceState {
  id: string;
  type: 'light' | 'plug' | 'thermostat';
  name: string;
  online: boolean;
  power: boolean;
  brightness?: number; // 0 - 100
  colorHex?: string; // e.g. "#00f0ff"
  colorTempK?: number; // 2700K - 6500K
  currentWattage?: number; // Watts
  totalKwh?: number;
  currentTempCelsius?: number;
  targetTempCelsius?: number;
  hvacMode?: 'off' | 'heat' | 'cool' | 'auto';
  lastUpdated: string;
}

export interface IoTControlRequest {
  deviceId: string;
  power?: boolean;
  brightness?: number;
  colorHex?: string;
  colorTempK?: number;
  targetTempCelsius?: number;
  hvacMode?: 'off' | 'heat' | 'cool' | 'auto';
}

export interface SerialPortConfig {
  port: string;
  baudRate: number;
  dataBits?: 5 | 6 | 7 | 8;
  stopBits?: 1 | 2;
  parity?: 'none' | 'even' | 'odd';
}

export interface SerialTransmissionResult {
  port: string;
  command: string;
  bytesWritten: number;
  response: string;
  latencyMs: number;
  timestamp: string;
}

export interface BleGattCharacteristic {
  uuid: string;
  name: string;
  properties: ('read' | 'write' | 'notify')[];
  valueHex?: string;
}

export interface BleGattService {
  uuid: string;
  name: string;
  characteristics: BleGattCharacteristic[];
}

export interface BlePeripheral {
  id: string;
  name: string;
  address: string;
  rssi: number;
  connected: boolean;
  services: BleGattService[];
  txPower?: number;
  lastSeen: string;
}

export interface SafetyInterlockStatus {
  emergencyCutoffEngaged: boolean;
  totalWattageDraw: number;
  maxSafeWattageLimit: number; // e.g. 2400 W
  maxSafeThermalLimit: number; // e.g. 85 C
  trippedReasons: string[];
  lastChecked: string;
}
