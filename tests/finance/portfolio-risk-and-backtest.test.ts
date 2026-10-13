import { describe, it, expect, beforeEach } from 'vitest';
import { PortfolioRiskEngine } from '../../src/finance/portfolio-risk-engine.js';
import { MacroEconomicEngine } from '../../src/finance/macro-economic-engine.js';
import { BacktestEngine } from '../../src/finance/backtest-engine.js';
import { FinanceManager } from '../../src/finance/finance-manager.js';
import { PermissionManager } from '../../src/security/permission-manager.js';
import { SecurityGuardian } from '../../src/security/guardian.js';
import { AuditLogger } from '../../src/audit/audit-logger.js';
import { ResourceType, PermissionLevel } from '../../src/security/types.js';
import { FINANCIAL_RESEARCH_DISCLAIMER } from '../../src/finance/finance.interface.js';

describe('Phase 16 - Portfolio Risk Engine (MPT & VaR)', () => {
  const riskEngine = new PortfolioRiskEngine();

  it('evaluates multi-asset portfolio risk profile accurately', () => {
    const assets = [
      { symbol: 'AAPL', weight: 0.4 },
      { symbol: 'MSFT', weight: 0.4 },
      { symbol: 'GOOGL', weight: 0.2 },
    ];

    const profile = riskEngine.evaluatePortfolio(assets);

    expect(profile.assets.length).toBe(3);
    expect(profile.expectedAnnualReturn).toBeGreaterThan(0);
    expect(profile.portfolioVolatility).toBeGreaterThan(0);

    // Risk-adjusted returns
    expect(typeof profile.sharpeRatio).toBe('number');
    expect(typeof profile.sortinoRatio).toBe('number');

    // VaR (Parametric)
    expect(profile.valueAtRisk95).toBeGreaterThan(0);
    expect(profile.valueAtRisk99).toBeGreaterThan(profile.valueAtRisk95);
    expect(profile.maxDrawdownPercent).toBeGreaterThan(0);
    expect(profile.diversificationScore).toBeGreaterThanOrEqual(0);

    // Correlation Matrix
    expect(profile.correlationMatrix['AAPL']['AAPL']).toBe(1.0);
    expect(profile.correlationMatrix['MSFT']['MSFT']).toBe(1.0);
    expect(profile.disclaimer).toBe(FINANCIAL_RESEARCH_DISCLAIMER);
  });

  it('normalizes weights when input weights do not sum to 1.0', () => {
    const assets = [
      { symbol: 'AAPL', weight: 50 },
      { symbol: 'NVDA', weight: 50 },
    ];

    const profile = riskEngine.evaluatePortfolio(assets);
    const sum = profile.assets.reduce((acc, a) => acc + a.weight, 0);
    expect(Math.abs(sum - 1.0)).toBeLessThan(0.002);
  });
});

describe('Phase 16 - Macroeconomic Engine & Backtesting Engine', () => {
  const macroEngine = new MacroEconomicEngine();
  const backtestEngine = new BacktestEngine();

  it('generates macroeconomic overview with regime indicator', () => {
    const macro = macroEngine.getMacroOverview();

    expect(typeof macro.indicators.cpiInflationYoY).toBe('number');
    expect(typeof macro.indicators.fedFundsRate).toBe('number');
    expect(typeof macro.indicators.treasury10Y2YSpread).toBe('number');
    expect(['low', 'moderate', 'elevated', 'high']).toContain(macro.recessionRiskAssessment);
    expect(['inverted', 'flat', 'normal']).toContain(macro.yieldCurveStatus);
    expect(['stagflation', 'expansion', 'disinflationary_boom', 'contraction']).toContain(
      macro.macroRegime
    );
    expect(macro.marketImplications.length).toBeGreaterThan(0);
    expect(macro.disclaimer).toBe(FINANCIAL_RESEARCH_DISCLAIMER);
  });

  it('backtests SMA Crossover strategy on SPY', () => {
    const result = backtestEngine.runBacktest('SMA_Crossover', 'SPY', 250);

    expect(result.symbol).toBe('SPY');
    expect(result.strategyName).toBe('SMA_Crossover');
    expect(result.timeframeDays).toBe(250);
    expect(typeof result.totalStrategyReturnPercent).toBe('number');
    expect(typeof result.benchmarkBuyAndHoldReturnPercent).toBe('number');
    expect(result.totalTrades).toBeGreaterThanOrEqual(0);
    expect(result.winRatePercent).toBeGreaterThanOrEqual(0);
    expect(result.winRatePercent).toBeLessThanOrEqual(100);
    expect(typeof result.maxDrawdownPercent).toBe('number');
    expect(result.tradeLogSample.length).toBeGreaterThanOrEqual(0);
    expect(result.disclaimer).toBe(FINANCIAL_RESEARCH_DISCLAIMER);
  });

  it('backtests RSI Mean-Reversion strategy on QQQ', () => {
    const result = backtestEngine.runBacktest('RSI_Mean_Reversion', 'QQQ', 200);

    expect(result.strategyName).toBe('RSI_Mean_Reversion');
    expect(result.symbol).toBe('QQQ');
    expect(typeof result.totalStrategyReturnPercent).toBe('number');
  });
});

describe('Phase 16 - FinanceManager Security Gating & Safety Invariants', () => {
  let permissionManager: PermissionManager;
  let guardian: SecurityGuardian;
  let auditLogger: AuditLogger;
  let financeManager: FinanceManager;

  beforeEach(() => {
    permissionManager = new PermissionManager();
    guardian = new SecurityGuardian();
    auditLogger = new AuditLogger();

    // Grant READ on FINANCIAL_SERVICES to authorized user
    permissionManager.grantPermission({
      userId: 'quant_trader',
      resource: ResourceType.FINANCIAL_SERVICES,
      level: PermissionLevel.READ,
      allowedActions: ['read'],
      grantedBy: 'admin',
    });

    financeManager = new FinanceManager(permissionManager, guardian, auditLogger);
  });

  it('allows authorized user to perform financial research and analysis', async () => {
    const ticker = await financeManager.analyzeTicker('AAPL', 'quant_trader');
    expect(ticker.symbol).toBe('AAPL');

    const valuation = await financeManager.calculateValuation('AAPL', 0.08, 0.03, 'quant_trader');
    expect(valuation.symbol).toBe('AAPL');

    const risk = await financeManager.evaluatePortfolio(
      [{ symbol: 'AAPL', weight: 1.0 }],
      'quant_trader'
    );
    expect(risk.assets.length).toBe(1);
  });

  it('blocks unauthorized user with permission error', async () => {
    await expect(
      financeManager.analyzeTicker('AAPL', 'unauthorized_hacker')
    ).rejects.toThrow(/Permission denied/i);
  });

  it('strictly blocks live trading execution attempts (Invariant)', async () => {
    // Attempting to execute an order must always fail with security block
    await expect(
      financeManager.attemptLiveTrade(
        {
          symbol: 'AAPL',
          action: 'BUY',
          quantity: 100,
        },
        'quant_trader'
      )
    ).rejects.toThrow(/threat detected|blocked|unauthorized financial action|critical/i);
  });

  it('performs honest broker credentials check confirming sandbox status', async () => {
    const audit = await financeManager.auditBrokerCredentials('quant_trader');

    expect(audit.isSimulationModeActive).toBe(true);
    expect(audit.isLiveTradingAllowed).toBe(false);
    expect(audit.configuredBrokers.length).toBeGreaterThan(0);
    expect(audit.securityNotice).toContain('Live monetary transactions are strictly disabled');
  });
});
