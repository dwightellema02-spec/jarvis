/**
 * JARVIS Phase 21 - Hardware, Device & IoT Integration REST API Tests
 */

import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/server/app.js';
import { Express } from 'express';

describe('Phase 21 - Hardware & Device REST API Endpoints', () => {
  let app: Express;

  beforeAll(() => {
    const initialized = createApp();
    app = initialized.app;
  });

  it('GET /api/jarvis/devices -> returns list of connected hardware and IoT devices', async () => {
    const res = await request(app)
      .get('/api/jarvis/devices')
      .set('x-user-id', 'dwight');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.count).toBeGreaterThanOrEqual(7);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /api/jarvis/devices/telemetry -> returns real-time hardware telemetry', async () => {
    const res = await request(app)
      .get('/api/jarvis/devices/telemetry')
      .set('x-user-id', 'dwight');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.cpu).toBeDefined();
    expect(res.body.data.cpu.tempCelsius).toBeGreaterThan(0);
    expect(res.body.data.memory.usagePercent).toBeGreaterThan(0);
    expect(res.body.data.battery.levelPercent).toBe(94);
  });

  it('GET /api/jarvis/devices/iot -> returns smart home devices', async () => {
    const res = await request(app)
      .get('/api/jarvis/devices/iot')
      .set('x-user-id', 'dwight');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.count).toBeGreaterThanOrEqual(5);
  });

  it('POST /api/jarvis/devices/iot/control -> controls smart home device', async () => {
    const res = await request(app)
      .post('/api/jarvis/devices/iot/control')
      .set('x-user-id', 'dwight')
      .send({
        deviceId: 'iot_light_desk',
        brightness: 75,
        colorHex: '#00f0ff',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.brightness).toBe(75);
    expect(res.body.data.colorHex).toBe('#00f0ff');
  });

  it('POST /api/jarvis/devices/serial/send -> sends serial command and returns MCU response', async () => {
    const res = await request(app)
      .post('/api/jarvis/devices/serial/send')
      .set('x-user-id', 'dwight')
      .send({
        port: 'COM3',
        command: 'status',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.response).toContain('MCU ONLINE');
    expect(res.body.data.bytesWritten).toBeGreaterThan(0);
  });

  it('POST /api/jarvis/devices/ble/scan -> scans BLE peripherals', async () => {
    const res = await request(app)
      .post('/api/jarvis/devices/ble/scan')
      .set('x-user-id', 'dwight');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.count).toBeGreaterThanOrEqual(3);
  });

  it('POST /api/jarvis/devices/ble/connect -> toggles peripheral connection state', async () => {
    const res = await request(app)
      .post('/api/jarvis/devices/ble/connect')
      .set('x-user-id', 'dwight')
      .send({
        peripheralId: 'ble_smart_band',
        connected: true,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.connected).toBe(true);
  });

  it('POST /api/jarvis/devices/ble/read & write -> interacts with GATT characteristics', async () => {
    const readRes = await request(app)
      .post('/api/jarvis/devices/ble/read')
      .set('x-user-id', 'dwight')
      .send({
        peripheralId: 'ble_smart_band',
        serviceUuid: '180f',
        charUuid: '2a19',
      });

    expect(readRes.status).toBe(200);
    expect(readRes.body.data.valueHex).toBe('58'); // 88% battery

    const writeRes = await request(app)
      .post('/api/jarvis/devices/ble/write')
      .set('x-user-id', 'dwight')
      .send({
        peripheralId: 'ble_smart_band',
        serviceUuid: '1802',
        charUuid: '2a06',
        hexValue: '02',
      });

    expect(writeRes.status).toBe(200);
    expect(writeRes.body.data.valueHex).toBe('02');
  });

  it('GET /api/jarvis/devices/safety -> returns safety interlock telemetry', async () => {
    const res = await request(app)
      .get('/api/jarvis/devices/safety')
      .set('x-user-id', 'dwight');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.maxSafeWattageLimit).toBe(2400);
    expect(res.body.data.emergencyCutoffEngaged).toBe(false);
  });

  it('POST /api/jarvis/devices/safety/cutoff -> triggers and clears emergency cutoff', async () => {
    const cutoffRes = await request(app)
      .post('/api/jarvis/devices/safety/cutoff')
      .set('x-user-id', 'dwight')
      .send({
        cutoff: true,
        reason: 'Operator safety drill',
      });

    expect(cutoffRes.status).toBe(200);
    expect(cutoffRes.body.data.emergencyCutoffEngaged).toBe(true);

    const restoreRes = await request(app)
      .post('/api/jarvis/devices/safety/cutoff')
      .set('x-user-id', 'dwight')
      .send({ cutoff: false });

    expect(restoreRes.status).toBe(200);
    expect(restoreRes.body.data.emergencyCutoffEngaged).toBe(false);
  });

  it('blocks unauthorized requests with 403 status code', async () => {
    const res = await request(app)
      .get('/api/jarvis/devices')
      .set('x-user-id', 'unauthorized_hacker');

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain('Permission denied');
  });
});
