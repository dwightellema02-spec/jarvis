/**
 * JARVIS Phase 21 - Smart Home & IoT Hub with Safety Interlock
 */

import { IoTDeviceState, IoTControlRequest, SafetyInterlockStatus } from './device.interface.js';

export class SmartHomeHub {
  private iotDevices: Map<string, IoTDeviceState> = new Map();
  private maxWattageLimit = 2400; // 2400 Watts safety threshold
  private emergencyCutoff = false;
  private trippedReasons: string[] = [];

  constructor() {
    this.seedIotDevices();
  }

  private seedIotDevices(): void {
    const list: IoTDeviceState[] = [
      {
        id: 'iot_light_desk',
        type: 'light',
        name: 'Desk Halo Lightbar (Ambient Cyan)',
        online: true,
        power: true,
        brightness: 85,
        colorHex: '#00f0ff',
        colorTempK: 6500,
        currentWattage: 12.5,
        totalKwh: 3.4,
        lastUpdated: new Date().toISOString(),
      },
      {
        id: 'iot_light_ceiling',
        type: 'light',
        name: 'Studio Main Ceiling Chandelier',
        online: true,
        power: true,
        brightness: 60,
        colorHex: '#ffffff',
        colorTempK: 4000,
        currentWattage: 45.0,
        totalKwh: 18.2,
        lastUpdated: new Date().toISOString(),
      },
      {
        id: 'iot_plug_workstation',
        type: 'plug',
        name: 'High-Power Workstation Rig Plug',
        online: true,
        power: true,
        currentWattage: 420.0,
        totalKwh: 142.5,
        lastUpdated: new Date().toISOString(),
      },
      {
        id: 'iot_plug_heater',
        type: 'plug',
        name: 'Auxiliary Ceramic Space Heater Relay',
        online: true,
        power: false,
        currentWattage: 0,
        totalKwh: 88.1,
        lastUpdated: new Date().toISOString(),
      },
      {
        id: 'iot_thermostat_main',
        type: 'thermostat',
        name: 'Central Climate Control Thermostat',
        online: true,
        power: true,
        currentTempCelsius: 22.5,
        targetTempCelsius: 21.0,
        hvacMode: 'cool',
        currentWattage: 850.0,
        totalKwh: 340.0,
        lastUpdated: new Date().toISOString(),
      },
    ];

    for (const d of list) {
      this.iotDevices.set(d.id, d);
    }
  }

  /**
   * List all IoT devices.
   */
  public listDevices(): IoTDeviceState[] {
    return Array.from(this.iotDevices.values());
  }

  /**
   * Get specific IoT device.
   */
  public getDevice(id: string): IoTDeviceState | undefined {
    return this.iotDevices.get(id);
  }

  /**
   * Calculate total current power draw across all active IoT devices.
   */
  public calculateTotalWattage(): number {
    let total = 0;
    for (const d of this.iotDevices.values()) {
      if (d.power && d.currentWattage) {
        total += d.currentWattage;
      }
    }
    return Math.round(total * 10) / 10;
  }

  /**
   * Safety Interlock Inspection.
   */
  public getSafetyInterlockStatus(): SafetyInterlockStatus {
    const totalWattage = this.calculateTotalWattage();
    return {
      emergencyCutoffEngaged: this.emergencyCutoff,
      totalWattageDraw: totalWattage,
      maxSafeWattageLimit: this.maxWattageLimit,
      maxSafeThermalLimit: 85.0,
      trippedReasons: [...this.trippedReasons],
      lastChecked: new Date().toISOString(),
    };
  }

  /**
   * Trigger or clear emergency cutoff.
   */
  public setEmergencyCutoff(cutoff: boolean, reason = 'Operator triggered emergency cutoff'): SafetyInterlockStatus {
    this.emergencyCutoff = cutoff;
    if (cutoff) {
      this.trippedReasons.push(reason);
      // Immediately power off all devices
      for (const d of this.iotDevices.values()) {
        d.power = false;
        if (d.currentWattage) d.currentWattage = 0;
        d.lastUpdated = new Date().toISOString();
      }
    } else {
      this.trippedReasons = [];
    }
    return this.getSafetyInterlockStatus();
  }

  /**
   * Controls an IoT device with safety interlock validation.
   */
  public controlDevice(req: IoTControlRequest): IoTDeviceState {
    const d = this.iotDevices.get(req.deviceId);
    if (!d) {
      throw new Error(`IoT device "${req.deviceId}" not found.`);
    }

    if (this.emergencyCutoff && req.power === true) {
      throw new Error(
        'Physical Safety Interlock is currently ENGAGED. Cannot power on devices until cutoff is reset.'
      );
    }

    // Safety Invariant: Check if turning on a high-power device breaches wattage safety limit
    if (req.power === true && !d.power) {
      // Space heater nominal draw is 1500W
      const additionalWattage = req.deviceId === 'iot_plug_heater' ? 1500 : 50;
      const projectedWattage = this.calculateTotalWattage() + additionalWattage;

      if (projectedWattage > this.maxWattageLimit) {
        this.emergencyCutoff = true;
        const breachMsg = `PROJECTED POWER OVERLOAD: ${projectedWattage}W exceeds safe limit of ${this.maxWattageLimit}W! Safety Interlock tripped.`;
        this.trippedReasons.push(breachMsg);
        throw new Error(breachMsg);
      }
    }

    // Apply state changes
    if (req.power !== undefined) {
      d.power = req.power;
      if (!d.power) {
        d.currentWattage = 0;
      } else {
        if (d.id === 'iot_plug_heater') d.currentWattage = 1500.0;
        else if (d.id === 'iot_plug_workstation') d.currentWattage = 420.0;
        else if (d.id === 'iot_light_desk') d.currentWattage = 12.5;
        else if (d.id === 'iot_light_ceiling') d.currentWattage = 45.0;
      }
    }

    if (req.brightness !== undefined) {
      d.brightness = Math.max(0, Math.min(100, req.brightness));
    }
    if (req.colorHex !== undefined) {
      d.colorHex = req.colorHex;
    }
    if (req.colorTempK !== undefined) {
      d.colorTempK = Math.max(2000, Math.min(6500, req.colorTempK));
    }
    if (req.targetTempCelsius !== undefined) {
      d.targetTempCelsius = Math.max(16, Math.min(30, req.targetTempCelsius));
    }
    if (req.hvacMode !== undefined) {
      d.hvacMode = req.hvacMode;
    }

    d.lastUpdated = new Date().toISOString();
    return d;
  }
}
