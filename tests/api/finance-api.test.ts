import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/server/app.js';
import { Express } from 'express';
import { FINANCIAL_RESEARCH_DISCLAIMER } from '../../src/finance/finance.interface.js';

describe('Phase 16 - Financial Research REST API Endpoints', () => {
  let app: Express;

  beforeAll(() => {
    const created = createApp();
    app = created.app;
  });

  describe('POST /api/jarvis/finance/ticker', () => {
    it('returns quantitative technical indicators for symbol', async () => {
      const res = await request(app)
        .post('/api/jarvis/finance/ticker')
        .set('x-user-id', 'dwight')
        .send({ symbol: 'AAPL' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.symbol).toBe('AAPL');
      expect(res.body.data.technicals.sma20).toBeGreaterThan(0);
      expect(res.body.data.technicals.rsi14).toBeGreaterThanOrEqual(0);
      expect(res.body.data.disclaimer).toBe(FINANCIAL_RESEARCH_DISCLAIMER);
    });

    it('returns 400 when symbol is missing', async () => {
      const res = await request(app)
        .post('/api/jarvis/finance/ticker')
        .set('x-user-id', 'dwight')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/jarvis/finance/valuation', () => {
    it('returns 5-year DCF intrinsic value and multiples', async () => {
      const res = await request(app)
        .post('/api/jarvis/finance/valuation')
        .set('x-user-id', 'dwight')
        .send({ symbol: 'MSFT', wacc: 0.09, growth: 0.025 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.symbol).toBe('MSFT');
      expect(res.body.data.estimatedFairValue).toBeGreaterThan(0);
      expect(res.body.data.dcfInputs.enterpriseValue).toBeGreaterThan(0);
      expect(res.body.data.multiples.peRatio).toBeGreaterThan(0);
    });
  });

  describe('POST /api/jarvis/finance/portfolio/risk', () => {
    it('evaluates MPT portfolio risk and VaR metrics', async () => {
      const res = await request(app)
        .post('/api/jarvis/finance/portfolio/risk')
        .set('x-user-id', 'dwight')
        .send({
          assets: [
            { symbol: 'AAPL', weight: 0.5 },
            { symbol: 'MSFT', weight: 0.5 },
          ],
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.expectedAnnualReturn).toBeGreaterThan(0);
      expect(res.body.data.valueAtRisk95).toBeGreaterThan(0);
    });

    it('returns 400 when assets list is empty or omitted', async () => {
      const res = await request(app)
        .post('/api/jarvis/finance/portfolio/risk')
        .set('x-user-id', 'dwight')
        .send({ assets: [] });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/jarvis/finance/macro', () => {
    it('returns macroeconomic signals and regime indicator', async () => {
      const res = await request(app)
        .get('/api/jarvis/finance/macro')
        .set('x-user-id', 'dwight');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(typeof res.body.data.indicators.cpiInflationYoY).toBe('number');
      expect(res.body.data.macroRegime).toBeDefined();
    });
  });

  describe('POST /api/jarvis/finance/earnings', () => {
    it('returns quarterly earnings and revenue breakdown', async () => {
      const res = await request(app)
        .post('/api/jarvis/finance/earnings')
        .set('x-user-id', 'dwight')
        .send({ symbol: 'NVDA' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.symbol).toBe('NVDA');
      expect(res.body.data.quarter).toBeDefined();
      expect(res.body.data.epsActual).toBeGreaterThan(0);
    });
  });

  describe('POST /api/jarvis/finance/backtest', () => {
    it('runs strategy backtest on historical candles', async () => {
      const res = await request(app)
        .post('/api/jarvis/finance/backtest')
        .set('x-user-id', 'dwight')
        .send({
          strategy: 'SMA_Crossover',
          symbol: 'SPY',
          timeframeDays: 200,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.strategyName).toBe('SMA_Crossover');
      expect(typeof res.body.data.totalStrategyReturnPercent).toBe('number');
      expect(res.body.data.tradeLogSample.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('GET /api/jarvis/finance/brokers', () => {
    it('returns simulation mode status and broker sandbox configuration', async () => {
      const res = await request(app)
        .get('/api/jarvis/finance/brokers')
        .set('x-user-id', 'dwight');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.isSimulationModeActive).toBe(true);
      expect(res.body.data.isLiveTradingAllowed).toBe(false);
      expect(res.body.data.securityNotice).toContain('Live monetary transactions are strictly disabled');
    });
  });

  describe('POST /api/jarvis/finance/trade (Security Guardian Invariant)', () => {
    it('blocks live order execution with 403 Forbidden', async () => {
      const res = await request(app)
        .post('/api/jarvis/finance/trade')
        .set('x-user-id', 'dwight')
        .send({
          symbol: 'AAPL',
          quantity: 100,
          action: 'BUY',
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.securityBlocked).toBe(true);
      expect(res.body.error).toMatch(/threat detected|blocked|unauthorized financial action|critical/i);
    });
  });

  describe('Security Permissions on Financial Services', () => {
    it('denies access to unauthorized user lacking FINANCIAL_SERVICES permission', async () => {
      const res = await request(app)
        .post('/api/jarvis/finance/ticker')
        .set('x-user-id', 'unauthorized_stranger')
        .send({ symbol: 'AAPL' });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Permission Denied on FINANCIAL_SERVICES');
    });
  });
});
