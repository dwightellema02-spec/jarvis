/**
 * JARVIS Phase 21 - USB & Serial Port Hardware Driver
 */

import { DeviceInfo, SerialPortConfig, SerialTransmissionResult } from './device.interface.js';

export class UsbSerialDriver {
  private devices: Map<string, DeviceInfo> = new Map();
  private openPorts: Map<string, SerialPortConfig> = new Map();

  constructor() {
    this.seedDevices();
  }

  private seedDevices(): void {
    const list: DeviceInfo[] = [
      {
        id: 'usb_hid_keyboard',
        name: 'Quantum Mechanical Keyboard (RGB Matrix)',
        type: 'usb',
        vendor: 'Keychron',
        model: 'Q3 Max Pro',
        status: 'connected',
        connectionPath: 'USB\\VID_3434&PID_0280\\0001',
        capabilities: ['hid_keyboard', 'nkro', 'macro_keys', 'per_key_rgb'],
        firmwareVersion: '1.4.2',
        metadata: { pollingRateHz: 1000, latencyMs: 1.0 },
      },
      {
        id: 'usb_hid_mouse',
        name: 'Pro Wireless Optical Sensor Mouse',
        type: 'usb',
        vendor: 'Logitech',
        model: 'G Pro X Superlight',
        status: 'connected',
        connectionPath: 'USB\\VID_046D&PID_C547\\0002',
        capabilities: ['hid_mouse', 'dpi_scaling', 'sensor_hero25k'],
        firmwareVersion: '2.1.0',
        metadata: { currentDpi: 1600, batteryPercent: 88 },
      },
      {
        id: 'serial_bridge_mcu',
        name: 'STM32F4 Core Telemetry Bridge',
        type: 'serial',
        vendor: 'STMicroelectronics',
        model: 'Virtual COM Port (VCP)',
        status: 'connected',
        connectionPath: 'COM3',
        capabilities: ['serial_uart', 'adc_sampler', 'gpio_matrix', 'can_bus_gateway'],
        firmwareVersion: '3.0.8',
        metadata: { defaultBaud: 115200, bufferSize: 4096 },
      },
      {
        id: 'usb_audio_dac',
        name: 'High-Resolution 32-bit DAC / Headphone Amp',
        type: 'usb',
        vendor: 'FiiO',
        model: 'K7 Dual AK4493SEQ',
        status: 'connected',
        connectionPath: 'USB\\VID_2972&PID_0049\\0003',
        capabilities: ['audio_output', 'dsd512', 'balanced_4.4mm', 'pcm_384khz'],
        firmwareVersion: '1.0.6',
        metadata: { sampleRate: 192000, bitDepth: 32 },
      },
    ];

    for (const d of list) {
      this.devices.set(d.id, d);
    }
  }

  /**
   * List all USB and Serial devices.
   */
  public listDevices(): DeviceInfo[] {
    return Array.from(this.devices.values());
  }

  /**
   * Get specific device info.
   */
  public getDevice(id: string): DeviceInfo | undefined {
    return this.devices.get(id);
  }

  /**
   * Configure and open a serial port.
   */
  public configurePort(config: SerialPortConfig): void {
    if (!config.port || !config.baudRate) {
      throw new Error('Port name and baud rate are required for serial configuration.');
    }
    this.openPorts.set(config.port, config);
  }

  /**
   * Transmits command over serial port with payload sanitization and hardware response.
   */
  public transmitCommand(port: string, command: string): SerialTransmissionResult {
    const trimmed = (command || '').trim();
    if (!trimmed) {
      throw new Error('Command string cannot be empty.');
    }

    // Safety check: Prevent raw dangerous firmware bricking payloads without handshake
    if (/bootloader_erase|flash_nand_raw|disable_failsafe|kill_mcu_voltage/i.test(trimmed)) {
      throw new Error(
        `Security Guardian Block: Dangerous serial payload "${trimmed}" blocked. Raw memory erasure is prohibited.`
      );
    }

    const start = Date.now();
    let response = '';

    // Route commands to simulated microcontroller responses
    if (/status|ping|echo/i.test(trimmed)) {
      response = `ACK [${port}] - MCU ONLINE | CLOCK: 168MHz | SYSTEM_HEALTH: 100%`;
    } else if (/adc_read|analog/i.test(trimmed)) {
      response = `CH0: 3.298V | CH1: 1.205V | CH2: 4.812V | TEMP_SENSOR: 24.5C`;
    } else if (/gpio_get/i.test(trimmed)) {
      response = `GPIO PIN_STATE: [PIN2:HIGH, PIN4:LOW, PIN7:HIGH, PIN8:HIGH]`;
    } else if (/gpio_set\s+(\w+)\s+(\w+)/i.test(trimmed)) {
      const match = trimmed.match(/gpio_set\s+(\w+)\s+(\w+)/i);
      response = `GPIO PIN ${match?.[1]?.toUpperCase()} SET TO ${match?.[2]?.toUpperCase()}: OK`;
    } else {
      response = `ACK: CMD [${trimmed}] EXECUTED - CODE 0`;
    }

    const latencyMs = Math.max(2, Date.now() - start);

    return {
      port,
      command: trimmed,
      bytesWritten: Buffer.byteLength(trimmed, 'utf8'),
      response,
      latencyMs,
      timestamp: new Date().toISOString(),
    };
  }
}
