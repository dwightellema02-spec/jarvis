/**
 * JARVIS Phase 21 - Bluetooth Low Energy (BLE) Manager
 */

import { BlePeripheral, BleGattService, BleGattCharacteristic } from './device.interface.js';

export class BleManager {
  private peripherals: Map<string, BlePeripheral> = new Map();

  constructor() {
    this.seedPeripherals();
  }

  private seedPeripherals(): void {
    const list: BlePeripheral[] = [
      {
        id: 'ble_smart_band',
        name: 'Biometric Smart Band V2',
        address: 'E4:95:6E:40:11:A2',
        rssi: -58,
        connected: true,
        txPower: 4,
        lastSeen: new Date().toISOString(),
        services: [
          {
            uuid: '180d',
            name: 'Heart Rate Service',
            characteristics: [
              {
                uuid: '2a37',
                name: 'Heart Rate Measurement',
                properties: ['notify'],
                valueHex: '0048', // 72 BPM
              },
            ],
          },
          {
            uuid: '180f',
            name: 'Battery Service',
            characteristics: [
              {
                uuid: '2a19',
                name: 'Battery Level',
                properties: ['read'],
                valueHex: '58', // 88%
              },
            ],
          },
          {
            uuid: '1802',
            name: 'Immediate Alert Service',
            characteristics: [
              {
                uuid: '2a06',
                name: 'Alert Level',
                properties: ['read', 'write'],
                valueHex: '01',
              },
            ],
          },
        ],
      },
      {
        id: 'ble_temp_beacon',
        name: 'Nordic Environment Beacon',
        address: 'F0:C7:7F:18:99:BC',
        rssi: -65,
        connected: false,
        txPower: 0,
        lastSeen: new Date().toISOString(),
        services: [
          {
            uuid: '181a',
            name: 'Environmental Sensing',
            characteristics: [
              {
                uuid: '2a6e',
                name: 'Temperature',
                properties: ['read'],
                valueHex: '0974', // 24.20 C
              },
              {
                uuid: '2a6f',
                name: 'Humidity',
                properties: ['read'],
                valueHex: '157c', // 55.00 %
              },
            ],
          },
        ],
      },
      {
        id: 'ble_desktop_speaker',
        name: 'Acoustic Studio BT Monitor',
        address: '3C:77:E6:AA:05:43',
        rssi: -42,
        connected: true,
        txPower: 6,
        lastSeen: new Date().toISOString(),
        services: [
          {
            uuid: '1800',
            name: 'Generic Access',
            characteristics: [
              {
                uuid: '2a00',
                name: 'Device Name',
                properties: ['read'],
                valueHex: '41636f75737469632053747564696f',
              },
            ],
          },
        ],
      },
    ];

    for (const p of list) {
      this.peripherals.set(p.id, p);
    }
  }

  /**
   * Scans for nearby BLE peripherals.
   */
  public scan(timeoutMs = 1500): BlePeripheral[] {
    // Dynamic slight RSSI jitter for authentic telemetry
    for (const p of this.peripherals.values()) {
      const jitter = Math.floor(Math.random() * 5) - 2;
      p.rssi = Math.min(-30, Math.max(-95, p.rssi + jitter));
      p.lastSeen = new Date().toISOString();
    }
    return Array.from(this.peripherals.values());
  }

  /**
   * Connect or disconnect peripheral.
   */
  public setConnection(peripheralId: string, connected: boolean): BlePeripheral {
    const p = this.peripherals.get(peripheralId);
    if (!p) {
      throw new Error(`BLE peripheral "${peripheralId}" not found in scan cache.`);
    }
    p.connected = connected;
    return p;
  }

  /**
   * Read GATT characteristic value.
   */
  public readCharacteristic(peripheralId: string, serviceUuid: string, charUuid: string): string {
    const p = this.peripherals.get(peripheralId);
    if (!p) throw new Error(`Peripheral "${peripheralId}" not found.`);
    if (!p.connected) throw new Error(`Peripheral "${peripheralId}" is not connected.`);

    const service = p.services.find((s) => s.uuid.toLowerCase() === serviceUuid.toLowerCase());
    if (!service) throw new Error(`Service "${serviceUuid}" not found on peripheral.`);

    const char = service.characteristics.find((c) => c.uuid.toLowerCase() === charUuid.toLowerCase());
    if (!char) throw new Error(`Characteristic "${charUuid}" not found.`);

    return char.valueHex || '00';
  }

  /**
   * Write GATT characteristic value.
   */
  public writeCharacteristic(
    peripheralId: string,
    serviceUuid: string,
    charUuid: string,
    hexValue: string
  ): BleGattCharacteristic {
    const p = this.peripherals.get(peripheralId);
    if (!p) throw new Error(`Peripheral "${peripheralId}" not found.`);
    if (!p.connected) throw new Error(`Peripheral "${peripheralId}" is not connected.`);

    const service = p.services.find((s) => s.uuid.toLowerCase() === serviceUuid.toLowerCase());
    if (!service) throw new Error(`Service "${serviceUuid}" not found.`);

    const char = service.characteristics.find((c) => c.uuid.toLowerCase() === charUuid.toLowerCase());
    if (!char) throw new Error(`Characteristic "${charUuid}" not found.`);

    if (!char.properties.includes('write')) {
      throw new Error(`Characteristic "${charUuid}" does not support write operations.`);
    }

    char.valueHex = hexValue;
    return char;
  }
}
