/**
 * JARVIS Phase 16 - Financial Research REST API Routes
 */

import { Router, Request, Response } from 'express';
import { FinanceManager } from '../../finance/finance-manager.js';

export function createFinanceRouter(financeManager: FinanceManager): Router {
  const router = Router();

  const isPermError = (msg: string) => /permission denied|security block|prohibited|threat detected/i.test(msg);

  // 1. Analyze Ticker
  router.post('/finance/ticker', async (req: Request, res: Response) => {
    try {
      const userId = (req.headers['x-user-id'] as string) || 'default_user';
      const { symbol } = req.body;
      if (!symbol) {
        res.status(400).json({ success: false, error: 'Field "symbol" is required.' });
        return;
      }
      const analysis = await financeManager.analyzeTicker(symbol, userId);
      res.json({ success: true, data: analysis });
    } catch (err: any) {
      res.status(isPermError(err.message) ? 403 : 400).json({
        success: false,
        error: err.message,
      });
    }
  });

  // 2. Valuation Model (DCF & Multiples)
  router.post('/finance/valuation', async (req: Request, res: Response) => {
    try {
      const userId = (req.headers['x-user-id'] as string) || 'default_user';
      const { symbol, wacc, growth } = req.body;
      if (!symbol) {
        res.status(400).json({ success: false, error: 'Field "symbol" is required.' });
        return;
      }
      const valuation = await financeManager.calculateValuation(symbol, wacc, growth, userId);
      res.json({ success: true, data: valuation });
    } catch (err: any) {
      res.status(isPermError(err.message) ? 403 : 400).json({
        success: false,
        error: err.message,
      });
    }
  });

  // 3. Portfolio Risk Evaluation
  router.post('/finance/portfolio/risk', async (req: Request, res: Response) => {
    try {
      const userId = (req.headers['x-user-id'] as string) || 'default_user';
      const { assets } = req.body;
      if (!assets || !Array.isArray(assets) || assets.length === 0) {
        res.status(400).json({ success: false, error: 'Field "assets" array with at least one asset is required.' });
        return;
      }
      const profile = await financeManager.evaluatePortfolio(assets, userId);
      res.json({ success: true, data: profile });
    } catch (err: any) {
      res.status(isPermError(err.message) ? 403 : 400).json({
        success: false,
        error: err.message,
      });
    }
  });

  // 4. Macroeconomic Overview
  router.get('/finance/macro', async (req: Request, res: Response) => {
    try {
      const userId = (req.headers['x-user-id'] as string) || 'default_user';
      const macro = await financeManager.getMacroOverview(userId);
      res.json({ success: true, data: macro });
    } catch (err: any) {
      res.status(isPermError(err.message) ? 403 : 500).json({
        success: false,
        error: err.message,
      });
    }
  });

  // 5. Earnings Breakdown
  router.post('/finance/earnings', async (req: Request, res: Response) => {
    try {
      const userId = (req.headers['x-user-id'] as string) || 'default_user';
      const { symbol } = req.body;
      if (!symbol) {
        res.status(400).json({ success: false, error: 'Field "symbol" is required.' });
        return;
      }
      const earnings = await financeManager.getEarningsBreakdown(symbol, userId);
      res.json({ success: true, data: earnings });
    } catch (err: any) {
      res.status(isPermError(err.message) ? 403 : 400).json({
        success: false,
        error: err.message,
      });
    }
  });

  // 6. Strategy Backtest
  router.post('/finance/backtest', async (req: Request, res: Response) => {
    try {
      const userId = (req.headers['x-user-id'] as string) || 'default_user';
      const { strategy, symbol, timeframeDays } = req.body;
      if (!strategy || !symbol) {
        res.status(400).json({ success: false, error: 'Fields "strategy" and "symbol" are required.' });
        return;
      }
      const backtest = await financeManager.runBacktest(strategy, symbol, timeframeDays || 250, userId);
      res.json({ success: true, data: backtest });
    } catch (err: any) {
      res.status(isPermError(err.message) ? 403 : 400).json({
        success: false,
        error: err.message,
      });
    }
  });

  // 7. Broker Credentials & Simulation Mode Audit
  router.get('/finance/brokers', async (req: Request, res: Response) => {
    try {
      const userId = (req.headers['x-user-id'] as string) || 'default_user';
      const audit = await financeManager.auditBrokerCredentials(userId);
      res.json({ success: true, data: audit });
    } catch (err: any) {
      res.status(isPermError(err.message) ? 403 : 500).json({
        success: false,
        error: err.message,
      });
    }
  });

  // 8. Attempt Live Trade (Must be blocked by Guardian)
  router.post('/finance/trade', async (req: Request, res: Response) => {
    try {
      const userId = (req.headers['x-user-id'] as string) || 'default_user';
      const { symbol, quantity, action } = req.body;
      await financeManager.attemptLiveTrade({ symbol, quantity, action }, userId);
      res.status(400).json({ success: false, error: 'Live trade unexpected execution' });
    } catch (err: any) {
      res.status(403).json({
        success: false,
        error: err.message,
        securityBlocked: true,
      });
    }
  });

  return router;
}
