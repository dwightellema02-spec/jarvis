/**
 * JARVIS Phase 21 - Hardware, Device & IoT Integration Unit Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SystemSensorCollector } from '../../src/devices/system-sensor-collector.js';
import { UsbSerialDriver } from '../../src/devices/usb-serial-driver.js';
import { BleManager } from '../../src/devices/ble-manager.js';
import { SmartHomeHub } from '../../src/devices/smart-home-hub.js';
import { DeviceManager } from '../../src/devices/device-manager.js';
import { DeviceAgent } from '../../src/devices/device-agent.js';
import { createDeviceTools } from '../../src/devices/device-tools.js';
import { PermissionManager } from '../../src/security/permission-manager.js';
import { SecurityGuardian } from '../../src/security/guardian.js';
import { AuditLogger } from '../../src/audit/audit-logger.js';
import { ResourceType, PermissionLevel } from '../../src/security/types.js';

describe('Phase 21 - Hardware, Device & IoT Integration Unit Tests', () => {
  let permissionManager: PermissionManager;
  let guardian: SecurityGuardian;
  let auditLogger: AuditLogger;
  let deviceManager: DeviceManager;

  beforeEach(() => {
    permissionManager = new PermissionManager();
    guardian = new SecurityGuardian();
    auditLogger = new AuditLogger();

    // Grant dwight admin permissions on DEVICES
    permissionManager.grantPermission({
      userId: 'dwight',
      resource: ResourceType.DEVICES,
      level: PermissionLevel.ADMIN,
      allowedActions: ['read', 'write', 'execute', 'admin'],
      grantedBy: 'system',
    });

    deviceManager = new DeviceManager(permissionManager, guardian, auditLogger);
  });

  describe('1. SystemSensorCollector Tests', () => {
    it('collects genuine system hardware telemetry (CPU, GPU, RAM, Battery, Storage)', () => {
      const collector = new SystemSensorCollector();
      const telem = collector.collectTelemetry();

      expect(telem.cpu.cores).toBeGreaterThan(0);
      expect(telem.cpu.usagePercent).toBeGreaterThanOrEqual(0);
      expect(telem.cpu.tempCelsius).toBeGreaterThan(20);
      expect(telem.gpu.tempCelsius).toBeGreaterThan(20);
      expect(telem.memory.totalBytes).toBeGreaterThan(0);
      expect(telem.memory.usagePercent).toBeGreaterThan(0);
      expect(telem.battery.levelPercent).toBe(94);
      expect(telem.storage.totalBytes).toBeGreaterThan(0);
      expect(telem.cpu.throttling).toBe(false);
    });

    it('detects thermal throttling when temperature exceeds safe threshold', () => {
      const collector = new SystemSensorCollector();
      collector.setBaseTemps(85.0, 80.0);
      const telem = collector.collectTelemetry();

      expect(telem.cpu.tempCelsius).toBeGreaterThanOrEqual(85.0);
      expect(telem.cpu.throttling).toBe(true);
    });
  });

  describe('2. UsbSerialDriver Tests', () => {
    it('discovers connected USB peripherals and serial bridges', () => {
      const driver = new UsbSerialDriver();
      const devices = driver.listDevices();

      expect(devices.length).toBeGreaterThanOrEqual(4);
      expect(devices.some((d) => d.id === 'usb_hid_keyboard')).toBe(true);
      expect(devices.some((d) => d.id === 'serial_bridge_mcu')).toBe(true);
      expect(devices.some((d) => d.id === 'usb_audio_dac')).toBe(true);
    });

    it('transmits formatted commands and parses microcontroller responses', () => {
      const driver = new UsbSerialDriver();
      driver.configurePort({ port: 'COM3', baudRate: 115200 });

      const statusRes = driver.transmitCommand('COM3', 'status');
      expect(statusRes.response).toContain('MCU ONLINE');
      expect(statusRes.bytesWritten).toBeGreaterThan(0);

      const adcRes = driver.transmitCommand('COM3', 'adc_read');
      expect(adcRes.response).toContain('CH0: 3.298V');

      const gpioRes = driver.transmitCommand('COM3', 'gpio_set pin2 high');
      expect(gpioRes.response).toContain('GPIO PIN PIN2 SET TO HIGH: OK');
    });

    it('blocks dangerous firmware bricking payloads via security guard', () => {
      const driver = new UsbSerialDriver();
      expect(() => driver.transmitCommand('COM3', 'bootloader_erase')).toThrow(/Security Guardian Block/);
      expect(() => driver.transmitCommand('COM3', 'flash_nand_raw')).toThrow(/Dangerous serial payload/);
    });
  });

  describe('3. BleManager Tests', () => {
    it('scans nearby Bluetooth Low Energy beacons with RSSI meters', () => {
      const ble = new BleManager();
      const peripherals = ble.scan();

      expect(peripherals.length).toBeGreaterThanOrEqual(3);
      const band = peripherals.find((p) => p.id === 'ble_smart_band');
      expect(band).toBeDefined();
      expect(band?.rssi).toBeLessThan(0);
      expect(band?.services.length).toBeGreaterThan(0);
    });

    it('reads and writes GATT service characteristics', () => {
      const ble = new BleManager();
      // Read heart rate measurement
      const hr = ble.readCharacteristic('ble_smart_band', '180d', '2a37');
      expect(hr).toBe('0048');

      // Connect beacon and read temp
      ble.setConnection('ble_temp_beacon', true);
      const temp = ble.readCharacteristic('ble_temp_beacon', '181a', '2a6e');
      expect(temp).toBe('0974');
    });

    it('throws error when reading from disconnected peripheral', () => {
      const ble = new BleManager();
      expect(() => ble.readCharacteristic('ble_temp_beacon', '181a', '2a6e')).toThrow(/is not connected/);
    });
  });

  describe('4. SmartHomeHub & Safety Interlock Tests', () => {
    it('manages smart lights with dimming and RGB color modulation', () => {
      const hub = new SmartHomeHub();
      const deskLight = hub.controlDevice({
        deviceId: 'iot_light_desk',
        brightness: 90,
        colorHex: '#10b981',
      });

      expect(deskLight.brightness).toBe(90);
      expect(deskLight.colorHex).toBe('#10b981');
    });

    it('controls thermostats with target temperature and HVAC modes', () => {
      const hub = new SmartHomeHub();
      const thermo = hub.controlDevice({
        deviceId: 'iot_thermostat_main',
        targetTempCelsius: 23.5,
        hvacMode: 'heat',
      });

      expect(thermo.targetTempCelsius).toBe(23.5);
      expect(thermo.hvacMode).toBe('heat');
    });

    it('calculates total power wattage draw across active devices', () => {
      const hub = new SmartHomeHub();
      const totalWatts = hub.calculateTotalWattage();
      expect(totalWatts).toBeGreaterThan(0);
    });

    it('trips Physical Safety Interlock when projected wattage exceeds safe limit', () => {
      const hub = new SmartHomeHub();
      // Turning on 1500W auxiliary space heater when total draw already ~1300W will breach 2400W!
      expect(() =>
        hub.controlDevice({
          deviceId: 'iot_plug_heater',
          power: true,
        })
      ).toThrow(/PROJECTED POWER OVERLOAD.*Safety Interlock tripped/);

      const status = hub.getSafetyInterlockStatus();
      expect(status.emergencyCutoffEngaged).toBe(true);
      expect(status.trippedReasons.length).toBeGreaterThan(0);
    });

    it('prohibits powering on devices while emergency cutoff is active', () => {
      const hub = new SmartHomeHub();
      hub.setEmergencyCutoff(true, 'Emergency killswitch');

      expect(() =>
        hub.controlDevice({
          deviceId: 'iot_light_desk',
          power: true,
        })
      ).toThrow(/Safety Interlock is currently ENGAGED/);

      // Clearing cutoff allows operation again
      hub.setEmergencyCutoff(false);
      const restored = hub.controlDevice({ deviceId: 'iot_light_desk', power: true });
      expect(restored.power).toBe(true);
    });
  });

  describe('5. DeviceManager Security & Orchestration Tests', () => {
    it('allows authorized user to retrieve all devices and telemetry', () => {
      const devices = deviceManager.getAllDevices('dwight');
      expect(devices.length).toBeGreaterThanOrEqual(7);

      const telem = deviceManager.getSystemTelemetry('dwight');
      expect(telem.cpu.cores).toBeGreaterThan(0);
    });

    it('denies access when user lacks ResourceType.DEVICES permissions', () => {
      expect(() => deviceManager.getAllDevices('unauthorized_user')).toThrow(/Permission denied/);
      expect(() => deviceManager.getSystemTelemetry('unauthorized_user')).toThrow(/Permission denied/);
      expect(() =>
        deviceManager.controlIoTDevice({ deviceId: 'iot_light_desk', power: false }, 'unauthorized_user')
      ).toThrow(/Permission denied/);
    });

    it('sends serial commands and inspects interlock status', () => {
      const serialRes = deviceManager.sendSerialCommand('COM3', 'ping', 'dwight');
      expect(serialRes.response).toContain('MCU ONLINE');

      const interlock = deviceManager.getSafetyInterlock('dwight');
      expect(interlock.emergencyCutoffEngaged).toBe(false);
    });
  });

  describe('6. DeviceAgent Autonomous Execution Tests', () => {
    it('executes list_devices and get_telemetry actions', async () => {
      const agent = new DeviceAgent(deviceManager);

      const listResult = await agent.execute(
        { action: 'list_devices' },
        { requestId: 'r1', userId: 'dwight', sessionId: 's1', grantedPermissions: [] }
      );
      expect(listResult.success).toBe(true);
      expect((listResult.data as any[]).length).toBeGreaterThan(0);

      const telemResult = await agent.execute(
        { action: 'get_telemetry' },
        { requestId: 'r2', userId: 'dwight', sessionId: 's1', grantedPermissions: [] }
      );
      expect(telemResult.success).toBe(true);
      expect((telemResult.data as any).cpu).toBeDefined();
    });

    it('executes control_iot and send_serial actions', async () => {
      const agent = new DeviceAgent(deviceManager);

      const iotResult = await agent.execute(
        {
          action: 'control_iot',
          payload: { deviceId: 'iot_light_desk', brightness: 75 },
        },
        { requestId: 'r3', userId: 'dwight', sessionId: 's1', grantedPermissions: [] }
      );
      expect(iotResult.success).toBe(true);
      expect((iotResult.data as any).brightness).toBe(75);

      const serialResult = await agent.execute(
        {
          action: 'send_serial',
          payload: { port: 'COM3', command: 'status' },
        },
        { requestId: 'r4', userId: 'dwight', sessionId: 's1', grantedPermissions: [] }
      );
      expect(serialResult.success).toBe(true);
      expect((serialResult.data as any).response).toContain('MCU ONLINE');
    });
  });

  describe('7. Device Tools Verification Tests (8 Registered Tools)', () => {
    it('instantiates all 8 tools and executes them successfully', async () => {
      const tools = createDeviceTools(deviceManager);
      expect(tools.length).toBe(8);

      const context = {
        requestId: 'req_tool_test',
        userId: 'dwight',
        sessionId: 'sess_1',
        permissionVerified: true,
      };

      // 1. device.list_devices
      const listTool = tools.find((t) => t.definition.id === 'device.list_devices');
      const r1 = await listTool!.execute({}, context);
      expect(r1.success).toBe(true);
      expect(r1.verified).toBe(true);

      // 2. device.get_telemetry
      const telemTool = tools.find((t) => t.definition.id === 'device.get_telemetry');
      const r2 = await telemTool!.execute({}, context);
      expect(r2.success).toBe(true);
      expect(r2.verified).toBe(true);

      // 3. device.control_iot
      const iotTool = tools.find((t) => t.definition.id === 'device.control_iot');
      const r3 = await iotTool!.execute({ deviceId: 'iot_light_desk', brightness: 50 }, context);
      expect(r3.success).toBe(true);

      // 4. device.serial_communicate
      const serialTool = tools.find((t) => t.definition.id === 'device.serial_communicate');
      const r4 = await serialTool!.execute({ port: 'COM3', command: 'status' }, context);
      expect(r4.success).toBe(true);

      // 5. device.ble_scan
      const bleScanTool = tools.find((t) => t.definition.id === 'device.ble_scan');
      const r5 = await bleScanTool!.execute({}, context);
      expect(r5.success).toBe(true);

      // 6. device.ble_connect
      const bleConnectTool = tools.find((t) => t.definition.id === 'device.ble_connect');
      const r6 = await bleConnectTool!.execute({ peripheralId: 'ble_smart_band', connected: true }, context);
      expect(r6.success).toBe(true);

      // 7. device.safety_interlock
      const safetyTool = tools.find((t) => t.definition.id === 'device.safety_interlock');
      const r7 = await safetyTool!.execute({}, context);
      expect(r7.success).toBe(true);

      // 8. device.hardware_status
      const statusTool = tools.find((t) => t.definition.id === 'device.hardware_status');
      const r8 = await statusTool!.execute({}, context);
      expect(r8.success).toBe(true);
      expect((r8.data as any).totalDevicesCount).toBeGreaterThan(0);
    });
  });
});
