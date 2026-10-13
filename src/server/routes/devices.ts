/**
 * JARVIS Phase 21 - Hardware, Device & IoT Integration REST API Routes
 */

import { Router, Request, Response } from 'express';
import { DeviceManager } from '../../devices/device-manager.js';

export function createDeviceRoutes(deviceManager: DeviceManager): Router {
  const router = Router();

  const isPermError = (msg: string) =>
    /permission denied|security block|prohibited|threat detected|rate limit|strictly prohibited/i.test(
      msg
    );

  // 1. List All Connected Hardware & IoT Devices
  router.get('/devices', (req: Request, res: Response) => {
    try {
      const userId = (req.headers['x-user-id'] as string) || 'default_user';
      const devices = deviceManager.getAllDevices(userId);
      res.json({ success: true, count: devices.length, data: devices });
    } catch (err: any) {
      res.status(isPermError(err.message) ? 403 : 400).json({
        success: false,
        error: err.message,
      });
    }
  });

  // 2. System Hardware & Sensor Telemetry
  router.get('/devices/telemetry', (req: Request, res: Response) => {
    try {
      const userId = (req.headers['x-user-id'] as string) || 'default_user';
      const telemetry = deviceManager.getSystemTelemetry(userId);
      res.json({ success: true, data: telemetry });
    } catch (err: any) {
      res.status(isPermError(err.message) ? 403 : 400).json({
        success: false,
        error: err.message,
      });
    }
  });

  // 3. IoT Smart Home Devices List & Control
  router.get('/devices/iot', (req: Request, res: Response) => {
    try {
      const userId = (req.headers['x-user-id'] as string) || 'default_user';
      const iotDevices = deviceManager.getIoTDevices(userId);
      res.json({ success: true, count: iotDevices.length, data: iotDevices });
    } catch (err: any) {
      res.status(isPermError(err.message) ? 403 : 400).json({
        success: false,
        error: err.message,
      });
    }
  });

  router.post('/devices/iot/control', (req: Request, res: Response) => {
    try {
      const userId = (req.headers['x-user-id'] as string) || 'default_user';
      const { deviceId, power, brightness, colorHex, colorTempK, targetTempCelsius, hvacMode } =
        req.body;
      if (!deviceId) {
        res.status(400).json({ success: false, error: 'Field "deviceId" is required.' });
        return;
      }
      const updated = deviceManager.controlIoTDevice(
        { deviceId, power, brightness, colorHex, colorTempK, targetTempCelsius, hvacMode },
        userId
      );
      res.json({ success: true, data: updated });
    } catch (err: any) {
      res.status(isPermError(err.message) ? 403 : 400).json({
        success: false,
        error: err.message,
      });
    }
  });

  // 4. USB / Serial COM Port Communication
  router.post('/devices/serial/send', (req: Request, res: Response) => {
    try {
      const userId = (req.headers['x-user-id'] as string) || 'default_user';
      const { port = 'COM3', command } = req.body;
      if (!command) {
        res.status(400).json({ success: false, error: 'Field "command" is required.' });
        return;
      }
      const result = deviceManager.sendSerialCommand(port, command, userId);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(isPermError(err.message) ? 403 : 400).json({
        success: false,
        error: err.message,
      });
    }
  });

  // 5. Bluetooth Low Energy (BLE)
  router.post('/devices/ble/scan', (req: Request, res: Response) => {
    try {
      const userId = (req.headers['x-user-id'] as string) || 'default_user';
      const beacons = deviceManager.scanBlePeripherals(userId);
      res.json({ success: true, count: beacons.length, data: beacons });
    } catch (err: any) {
      res.status(isPermError(err.message) ? 403 : 400).json({
        success: false,
        error: err.message,
      });
    }
  });

  router.post('/devices/ble/connect', (req: Request, res: Response) => {
    try {
      const userId = (req.headers['x-user-id'] as string) || 'default_user';
      const { peripheralId, connected = true } = req.body;
      if (!peripheralId) {
        res.status(400).json({ success: false, error: 'Field "peripheralId" is required.' });
        return;
      }
      const peripheral = deviceManager.setBleConnection(peripheralId, Boolean(connected), userId);
      res.json({ success: true, data: peripheral });
    } catch (err: any) {
      res.status(isPermError(err.message) ? 403 : 400).json({
        success: false,
        error: err.message,
      });
    }
  });

  router.post('/devices/ble/read', (req: Request, res: Response) => {
    try {
      const userId = (req.headers['x-user-id'] as string) || 'default_user';
      const { peripheralId, serviceUuid, charUuid } = req.body;
      if (!peripheralId || !serviceUuid || !charUuid) {
        res
          .status(400)
          .json({ success: false, error: 'Fields "peripheralId", "serviceUuid", and "charUuid" are required.' });
        return;
      }
      const valueHex = deviceManager.readBleCharacteristic(peripheralId, serviceUuid, charUuid, userId);
      res.json({ success: true, data: { peripheralId, serviceUuid, charUuid, valueHex } });
    } catch (err: any) {
      res.status(isPermError(err.message) ? 403 : 400).json({
        success: false,
        error: err.message,
      });
    }
  });

  router.post('/devices/ble/write', (req: Request, res: Response) => {
    try {
      const userId = (req.headers['x-user-id'] as string) || 'default_user';
      const { peripheralId, serviceUuid, charUuid, hexValue } = req.body;
      if (!peripheralId || !serviceUuid || !charUuid || !hexValue) {
        res.status(400).json({
          success: false,
          error: 'Fields "peripheralId", "serviceUuid", "charUuid", and "hexValue" are required.',
        });
        return;
      }
      const characteristic = deviceManager.writeBleCharacteristic(
        peripheralId,
        serviceUuid,
        charUuid,
        hexValue,
        userId
      );
      res.json({ success: true, data: characteristic });
    } catch (err: any) {
      res.status(isPermError(err.message) ? 403 : 400).json({
        success: false,
        error: err.message,
      });
    }
  });

  // 6. Safety Interlock
  router.get('/devices/safety', (req: Request, res: Response) => {
    try {
      const userId = (req.headers['x-user-id'] as string) || 'default_user';
      const status = deviceManager.getSafetyInterlock(userId);
      res.json({ success: true, data: status });
    } catch (err: any) {
      res.status(isPermError(err.message) ? 403 : 400).json({
        success: false,
        error: err.message,
      });
    }
  });

  router.post('/devices/safety/cutoff', (req: Request, res: Response) => {
    try {
      const userId = (req.headers['x-user-id'] as string) || 'default_user';
      const { cutoff = true, reason } = req.body;
      const status = deviceManager.setEmergencyCutoff(Boolean(cutoff), userId, reason);
      res.json({ success: true, data: status });
    } catch (err: any) {
      res.status(isPermError(err.message) ? 403 : 400).json({
        success: false,
        error: err.message,
      });
    }
  });

  return router;
}
