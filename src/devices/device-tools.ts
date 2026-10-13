/**
 * JARVIS Phase 21 - Hardware & IoT Device Tools (8 Registered Tools)
 */

import { ITool, ToolDefinition, ToolExecutionContext, ToolExecutionResult } from '../tools/tool.interface.js';
import { ResourceType, PermissionLevel } from '../security/types.js';
import { DeviceManager } from './device-manager.js';

/**
 * 1. DeviceListDevicesTool: device.list_devices
 */
export class DeviceListDevicesTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'device.list_devices',
    name: 'List Connected Hardware & IoT Devices',
    description: 'Lists all connected USB peripherals, serial ports, BLE beacons, and smart home IoT devices.',
    version: '1.0.0',
    requiredPermissions: [
      { resource: ResourceType.DEVICES, action: 'read', level: PermissionLevel.READ },
    ],
    parametersSchema: {
      type: 'object',
      properties: {},
    },
    status: 'implemented',
  };

  constructor(private readonly manager: DeviceManager) {}

  public async execute(_params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const result = this.manager.getAllDevices(context.userId);
      return {
        success: true,
        toolId: this.definition.id,
        data: result,
        verified: true,
        executionTimeMs: Date.now() - startTime,
      };
    } catch (err: any) {
      return {
        success: false,
        toolId: this.definition.id,
        error: err.message,
        verified: false,
        executionTimeMs: Date.now() - startTime,
      };
    }
  }
}

/**
 * 2. DeviceGetTelemetryTool: device.get_telemetry
 */
export class DeviceGetTelemetryTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'device.get_telemetry',
    name: 'Get System Hardware Telemetry',
    description: 'Retrieves real-time CPU/GPU load, temperatures, memory, battery, and storage metrics.',
    version: '1.0.0',
    requiredPermissions: [
      { resource: ResourceType.DEVICES, action: 'read', level: PermissionLevel.READ },
    ],
    parametersSchema: {
      type: 'object',
      properties: {},
    },
    status: 'implemented',
  };

  constructor(private readonly manager: DeviceManager) {}

  public async execute(_params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const result = this.manager.getSystemTelemetry(context.userId);
      return {
        success: true,
        toolId: this.definition.id,
        data: result,
        verified: true,
        executionTimeMs: Date.now() - startTime,
      };
    } catch (err: any) {
      return {
        success: false,
        toolId: this.definition.id,
        error: err.message,
        verified: false,
        executionTimeMs: Date.now() - startTime,
      };
    }
  }
}

/**
 * 3. DeviceControlIotTool: device.control_iot
 */
export class DeviceControlIotTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'device.control_iot',
    name: 'Control Smart Home IoT Device',
    description: 'Modulates smart home lights (power/brightness/color), plugs (power/relay), and climate thermostats.',
    version: '1.0.0',
    requiredPermissions: [
      { resource: ResourceType.DEVICES, action: 'write', level: PermissionLevel.WRITE },
    ],
    parametersSchema: {
      type: 'object',
      properties: {
        deviceId: { type: 'string' },
        power: { type: 'boolean' },
        brightness: { type: 'number' },
        colorHex: { type: 'string' },
        colorTempK: { type: 'number' },
        targetTempCelsius: { type: 'number' },
        hvacMode: { type: 'string' },
      },
      required: ['deviceId'],
    },
    status: 'implemented',
  };

  constructor(private readonly manager: DeviceManager) {}

  public async execute(params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const p = (params || {}) as any;
      const result = this.manager.controlIoTDevice(p, context.userId);
      return {
        success: true,
        toolId: this.definition.id,
        data: result,
        verified: true,
        executionTimeMs: Date.now() - startTime,
      };
    } catch (err: any) {
      return {
        success: false,
        toolId: this.definition.id,
        error: err.message,
        verified: false,
        executionTimeMs: Date.now() - startTime,
      };
    }
  }
}

/**
 * 4. DeviceSerialCommunicateTool: device.serial_communicate
 */
export class DeviceSerialCommunicateTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'device.serial_communicate',
    name: 'Send Command Over Serial COM Port',
    description: 'Transmits formatted command frames to microcontrollers (STM32, Arduino) over virtual serial ports.',
    version: '1.0.0',
    requiredPermissions: [
      { resource: ResourceType.DEVICES, action: 'write', level: PermissionLevel.WRITE },
    ],
    parametersSchema: {
      type: 'object',
      properties: {
        port: { type: 'string' },
        command: { type: 'string' },
      },
      required: ['command'],
    },
    status: 'implemented',
  };

  constructor(private readonly manager: DeviceManager) {}

  public async execute(params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const p = (params || {}) as { port?: string; command: string };
      const port = p.port || 'COM3';
      const result = this.manager.sendSerialCommand(port, p.command, context.userId);
      return {
        success: true,
        toolId: this.definition.id,
        data: result,
        verified: true,
        executionTimeMs: Date.now() - startTime,
      };
    } catch (err: any) {
      return {
        success: false,
        toolId: this.definition.id,
        error: err.message,
        verified: false,
        executionTimeMs: Date.now() - startTime,
      };
    }
  }
}

/**
 * 5. DeviceBleScanTool: device.ble_scan
 */
export class DeviceBleScanTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'device.ble_scan',
    name: 'Scan Bluetooth Low Energy Beacons',
    description: 'Scans for nearby BLE peripherals with signal RSSI meters and GATT services.',
    version: '1.0.0',
    requiredPermissions: [
      { resource: ResourceType.DEVICES, action: 'read', level: PermissionLevel.READ },
    ],
    parametersSchema: {
      type: 'object',
      properties: {},
    },
    status: 'implemented',
  };

  constructor(private readonly manager: DeviceManager) {}

  public async execute(_params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const result = this.manager.scanBlePeripherals(context.userId);
      return {
        success: true,
        toolId: this.definition.id,
        data: result,
        verified: true,
        executionTimeMs: Date.now() - startTime,
      };
    } catch (err: any) {
      return {
        success: false,
        toolId: this.definition.id,
        error: err.message,
        verified: false,
        executionTimeMs: Date.now() - startTime,
      };
    }
  }
}

/**
 * 6. DeviceBleConnectTool: device.ble_connect
 */
export class DeviceBleConnectTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'device.ble_connect',
    name: 'Connect or Disconnect BLE Peripheral',
    description: 'Connects or disconnects a discovered Bluetooth Low Energy peripheral.',
    version: '1.0.0',
    requiredPermissions: [
      { resource: ResourceType.DEVICES, action: 'write', level: PermissionLevel.WRITE },
    ],
    parametersSchema: {
      type: 'object',
      properties: {
        peripheralId: { type: 'string' },
        connected: { type: 'boolean' },
      },
      required: ['peripheralId'],
    },
    status: 'implemented',
  };

  constructor(private readonly manager: DeviceManager) {}

  public async execute(params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const p = (params || {}) as { peripheralId: string; connected?: boolean };
      const connected = p.connected ?? true;
      const result = this.manager.setBleConnection(p.peripheralId, connected, context.userId);
      return {
        success: true,
        toolId: this.definition.id,
        data: result,
        verified: true,
        executionTimeMs: Date.now() - startTime,
      };
    } catch (err: any) {
      return {
        success: false,
        toolId: this.definition.id,
        error: err.message,
        verified: false,
        executionTimeMs: Date.now() - startTime,
      };
    }
  }
}

/**
 * 7. DeviceSafetyInterlockTool: device.safety_interlock
 */
export class DeviceSafetyInterlockTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'device.safety_interlock',
    name: 'Hardware Safety Interlock Guard',
    description: 'Inspects power draw limits, thermal thresholds, and triggers or clears emergency cutoff.',
    version: '1.0.0',
    requiredPermissions: [
      { resource: ResourceType.DEVICES, action: 'read', level: PermissionLevel.READ },
      { resource: ResourceType.DEVICES, action: 'admin', level: PermissionLevel.ADMIN },
    ],
    parametersSchema: {
      type: 'object',
      properties: {
        cutoff: { type: 'boolean' },
        reason: { type: 'string' },
      },
    },
    status: 'implemented',
  };

  constructor(private readonly manager: DeviceManager) {}

  public async execute(params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const p = (params || {}) as { cutoff?: boolean; reason?: string };
      let result: any;
      if (p.cutoff !== undefined) {
        result = this.manager.setEmergencyCutoff(p.cutoff, context.userId, p.reason);
      } else {
        result = this.manager.getSafetyInterlock(context.userId);
      }
      return {
        success: true,
        toolId: this.definition.id,
        data: result,
        verified: true,
        executionTimeMs: Date.now() - startTime,
      };
    } catch (err: any) {
      return {
        success: false,
        toolId: this.definition.id,
        error: err.message,
        verified: false,
        executionTimeMs: Date.now() - startTime,
      };
    }
  }
}

/**
 * 8. DeviceHardwareStatusTool: device.hardware_status
 */
export class DeviceHardwareStatusTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'device.hardware_status',
    name: 'Get Complete Hardware Status',
    description: 'Summarizes overall connected hardware counts, safety state, and active power draw.',
    version: '1.0.0',
    requiredPermissions: [
      { resource: ResourceType.DEVICES, action: 'read', level: PermissionLevel.READ },
    ],
    parametersSchema: {
      type: 'object',
      properties: {},
    },
    status: 'implemented',
  };

  constructor(private readonly manager: DeviceManager) {}

  public async execute(_params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const devices = this.manager.getAllDevices(context.userId);
      const safety = this.manager.getSafetyInterlock(context.userId);
      const telemetry = this.manager.getSystemTelemetry(context.userId);
      return {
        success: true,
        toolId: this.definition.id,
        data: {
          totalDevicesCount: devices.length,
          safetyInterlockEngaged: safety.emergencyCutoffEngaged,
          totalWattageDraw: safety.totalWattageDraw,
          cpuTempCelsius: telemetry.cpu.tempCelsius,
          batteryLevelPercent: telemetry.battery.levelPercent,
        },
        verified: true,
        executionTimeMs: Date.now() - startTime,
      };
    } catch (err: any) {
      return {
        success: false,
        toolId: this.definition.id,
        error: err.message,
        verified: false,
        executionTimeMs: Date.now() - startTime,
      };
    }
  }
}

/**
 * Factory creating all 8 Device Tools.
 */
export function createDeviceTools(deviceManager: DeviceManager): ITool[] {
  return [
    new DeviceListDevicesTool(deviceManager),
    new DeviceGetTelemetryTool(deviceManager),
    new DeviceControlIotTool(deviceManager),
    new DeviceSerialCommunicateTool(deviceManager),
    new DeviceBleScanTool(deviceManager),
    new DeviceBleConnectTool(deviceManager),
    new DeviceSafetyInterlockTool(deviceManager),
    new DeviceHardwareStatusTool(deviceManager),
  ];
}
