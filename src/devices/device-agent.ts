/**
 * JARVIS Phase 21 - Hardware & IoT Device Agent Implementation
 */

import { IAgent, AgentDefinition, AgentExecutionContext, AgentExecutionResult } from '../agents/agent.interface.js';
import { ResourceType, PermissionLevel } from '../security/types.js';
import { DeviceManager } from './device-manager.js';

export class DeviceAgent implements IAgent {
  public readonly definition: AgentDefinition = {
    id: 'device-agent',
    name: 'Hardware & IoT Integration Agent',
    description:
      'Autonomous hardware controller governing USB peripherals, serial COM ports, BLE peripherals, smart home IoT automation, and physical safety interlocks.',
    version: '1.0.0',
    capabilities: [
      'hardware_discovery',
      'system_telemetry',
      'iot_lighting_control',
      'iot_power_monitoring',
      'serial_communication',
      'bluetooth_gatt_explorer',
      'safety_interlock_guard',
    ],
    requiredPermissions: [
      { resource: ResourceType.DEVICES, action: 'read', level: PermissionLevel.READ },
      { resource: ResourceType.DEVICES, action: 'write', level: PermissionLevel.WRITE },
      { resource: ResourceType.DEVICES, action: 'execute', level: PermissionLevel.EXECUTE },
      { resource: ResourceType.DEVICES, action: 'admin', level: PermissionLevel.ADMIN },
    ],
    inputSchema: {
      type: 'object',
      properties: {
        action: {
          type: 'string',
          enum: [
            'list_devices',
            'get_telemetry',
            'control_iot',
            'send_serial',
            'scan_ble',
            'connect_ble',
            'get_safety_status',
            'emergency_cutoff',
          ],
        },
        payload: { type: 'object' },
      },
      required: ['action'],
    },
    outputSchema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'object' },
      },
    },
    status: 'implemented',
  };

  constructor(private readonly deviceManager: DeviceManager) {}

  public async execute(input: unknown, context: AgentExecutionContext): Promise<AgentExecutionResult> {
    const start = Date.now();
    const userId = context.userId || 'default_user';
    const params = (input || {}) as { action: string; payload?: any };

    try {
      let data: any;

      switch (params.action) {
        case 'list_devices': {
          data = this.deviceManager.getAllDevices(userId);
          break;
        }

        case 'get_telemetry': {
          data = this.deviceManager.getSystemTelemetry(userId);
          break;
        }

        case 'control_iot': {
          if (!params.payload?.deviceId) {
            throw new Error('Payload must include "deviceId" for control_iot.');
          }
          data = this.deviceManager.controlIoTDevice(params.payload, userId);
          break;
        }

        case 'send_serial': {
          const { port = 'COM3', command = 'status' } = params.payload || {};
          data = this.deviceManager.sendSerialCommand(port, command, userId);
          break;
        }

        case 'scan_ble': {
          data = this.deviceManager.scanBlePeripherals(userId);
          break;
        }

        case 'connect_ble': {
          const { peripheralId, connected = true } = params.payload || {};
          if (!peripheralId) throw new Error('Payload must include "peripheralId".');
          data = this.deviceManager.setBleConnection(peripheralId, connected, userId);
          break;
        }

        case 'get_safety_status': {
          data = this.deviceManager.getSafetyInterlock(userId);
          break;
        }

        case 'emergency_cutoff': {
          const { cutoff = true, reason } = params.payload || {};
          data = this.deviceManager.setEmergencyCutoff(cutoff, userId, reason);
          break;
        }

        default:
          throw new Error(`Unknown hardware agent action: "${params.action}".`);
      }

      return {
        success: true,
        agentId: this.definition.id,
        data,
        executionTimeMs: Date.now() - start,
      };
    } catch (err: any) {
      return {
        success: false,
        agentId: this.definition.id,
        error: err.message,
        executionTimeMs: Date.now() - start,
      };
    }
  }
}
