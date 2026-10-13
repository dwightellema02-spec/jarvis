/**
 * JARVIS Phase 21 - Hardware & Device Intelligence Manager
 */

import { PermissionManager } from '../security/permission-manager.js';
import { SecurityGuardian } from '../security/guardian.js';
import { AuditLogger } from '../audit/audit-logger.js';
import { ResourceType, PermissionLevel, SecurityDecisionType } from '../security/types.js';
import { PermissionDeniedError } from '../utils/errors.js';
import {
  DeviceInfo,
  SystemTelemetry,
  IoTDeviceState,
  IoTControlRequest,
  SerialPortConfig,
  SerialTransmissionResult,
  BlePeripheral,
  BleGattCharacteristic,
  SafetyInterlockStatus,
} from './device.interface.js';
import { SystemSensorCollector } from './system-sensor-collector.js';
import { UsbSerialDriver } from './usb-serial-driver.js';
import { BleManager } from './ble-manager.js';
import { SmartHomeHub } from './smart-home-hub.js';

export class DeviceManager {
  private sensorCollector: SystemSensorCollector;
  private usbSerialDriver: UsbSerialDriver;
  private bleManager: BleManager;
  private iotHub: SmartHomeHub;

  constructor(
    private readonly permissionManager: PermissionManager,
    private readonly guardian: SecurityGuardian,
    private readonly auditLogger: AuditLogger
  ) {
    this.sensorCollector = new SystemSensorCollector();
    this.usbSerialDriver = new UsbSerialDriver();
    this.bleManager = new BleManager();
    this.iotHub = new SmartHomeHub();
  }

  // --- Internal Security Check ---
  private checkPermission(
    action: 'read' | 'write' | 'execute' | 'admin',
    level: PermissionLevel,
    userId: string,
    targetIdentifier?: string
  ): void {
    const check = this.permissionManager.checkPermission({
      userId,
      resource: ResourceType.DEVICES,
      action,
      requiredLevel: level,
      targetIdentifier,
    });

    if (!check.allowed) {
      this.auditLogger.log({
        user: userId,
        requestId: `req_dev_${Date.now()}`,
        resource: ResourceType.DEVICES,
        action: action as any,
        permissionRequired: level,
        permissionGranted: PermissionLevel.READ,
        decision: SecurityDecisionType.DENY,
        reason: `Access denied to DEVICES (${action}) for user "${userId}".`,
        result: 'FAILED',
        durationMs: 1,
      });
      throw new PermissionDeniedError(ResourceType.DEVICES, action, level, {
        userId,
        reason: check.reason,
      });
    }

    this.auditLogger.log({
      user: userId,
      requestId: `req_dev_${Date.now()}`,
      resource: ResourceType.DEVICES,
      action: action as any,
      permissionRequired: level,
      permissionGranted: level,
      decision: SecurityDecisionType.ALLOW,
      reason: `Access granted to DEVICES (${action}) on ${targetIdentifier || 'hardware'}.`,
      result: 'SUCCESS',
      durationMs: 1,
    });
  }

  // 1. Device Catalog
  public getAllDevices(userId: string): DeviceInfo[] {
    this.checkPermission('read', PermissionLevel.READ, userId, 'catalog');

    const usbSerial = this.usbSerialDriver.listDevices();
    const iot = this.iotHub.listDevices().map((d): DeviceInfo => ({
      id: d.id,
      name: d.name,
      type: d.type === 'light' ? 'iot_light' : d.type === 'plug' ? 'iot_plug' : 'iot_thermostat',
      vendor: 'Nexus Home Automation',
      model: d.type.toUpperCase() + '-GEN3',
      status: d.online ? 'connected' : 'disconnected',
      connectionPath: `iot://${d.id}`,
      capabilities: [
        'power_control',
        ...(d.brightness !== undefined ? ['dimmer'] : []),
        ...(d.colorHex ? ['rgb_color'] : []),
        ...(d.currentWattage !== undefined ? ['power_telemetry'] : []),
        ...(d.targetTempCelsius !== undefined ? ['hvac_climate'] : []),
      ],
      metadata: { power: d.power, wattage: d.currentWattage },
    }));

    const ble = this.bleManager.scan().map((b): DeviceInfo => ({
      id: b.id,
      name: b.name,
      type: 'ble',
      vendor: 'Nordic Semiconductor',
      model: 'BLE-PERIPHERAL',
      status: b.connected ? 'connected' : 'standby',
      connectionPath: b.address,
      capabilities: b.services.map((s) => s.name),
      metadata: { rssi: b.rssi, connected: b.connected },
    }));

    return [...usbSerial, ...iot, ...ble];
  }

  // 2. System Hardware Telemetry
  public getSystemTelemetry(userId: string): SystemTelemetry {
    this.checkPermission('read', PermissionLevel.READ, userId, 'telemetry');
    return this.sensorCollector.collectTelemetry();
  }

  // 3. IoT Control
  public controlIoTDevice(req: IoTControlRequest, userId: string): IoTDeviceState {
    this.checkPermission('write', PermissionLevel.WRITE, userId, req.deviceId);
    return this.iotHub.controlDevice(req);
  }

  public getIoTDevices(userId: string): IoTDeviceState[] {
    this.checkPermission('read', PermissionLevel.READ, userId, 'iot_list');
    return this.iotHub.listDevices();
  }

  // 4. USB & Serial Port Communications
  public configureSerialPort(config: SerialPortConfig, userId: string): void {
    this.checkPermission('write', PermissionLevel.WRITE, userId, config.port);
    this.usbSerialDriver.configurePort(config);
  }

  public sendSerialCommand(port: string, command: string, userId: string): SerialTransmissionResult {
    this.checkPermission('write', PermissionLevel.WRITE, userId, port);
    return this.usbSerialDriver.transmitCommand(port, command);
  }

  // 5. Bluetooth Low Energy (BLE)
  public scanBlePeripherals(userId: string): BlePeripheral[] {
    this.checkPermission('read', PermissionLevel.READ, userId, 'ble_scan');
    return this.bleManager.scan();
  }

  public setBleConnection(peripheralId: string, connected: boolean, userId: string): BlePeripheral {
    this.checkPermission('write', PermissionLevel.WRITE, userId, peripheralId);
    return this.bleManager.setConnection(peripheralId, connected);
  }

  public readBleCharacteristic(
    peripheralId: string,
    serviceUuid: string,
    charUuid: string,
    userId: string
  ): string {
    this.checkPermission('read', PermissionLevel.READ, userId, `${peripheralId}/${charUuid}`);
    return this.bleManager.readCharacteristic(peripheralId, serviceUuid, charUuid);
  }

  public writeBleCharacteristic(
    peripheralId: string,
    serviceUuid: string,
    charUuid: string,
    hexValue: string,
    userId: string
  ): BleGattCharacteristic {
    this.checkPermission('write', PermissionLevel.WRITE, userId, `${peripheralId}/${charUuid}`);
    return this.bleManager.writeCharacteristic(peripheralId, serviceUuid, charUuid, hexValue);
  }

  // 6. Safety Interlock
  public getSafetyInterlock(userId: string): SafetyInterlockStatus {
    this.checkPermission('read', PermissionLevel.READ, userId, 'safety_interlock');
    return this.iotHub.getSafetyInterlockStatus();
  }

  public setEmergencyCutoff(cutoff: boolean, userId: string, reason?: string): SafetyInterlockStatus {
    this.checkPermission('admin', PermissionLevel.ADMIN, userId, 'emergency_cutoff');
    return this.iotHub.setEmergencyCutoff(cutoff, reason);
  }

  // Testing helpers
  public getSensorCollector(): SystemSensorCollector {
    return this.sensorCollector;
  }
}
