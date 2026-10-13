/**
 * JARVIS Phase 16 - Financial Research Manager & Security Coordinator
 * Coordinates technical analysis, DCF valuation, MPT portfolio risk, macro signals,
 * strategy backtesting, and honest broker credential auditing.
 * Gated by ResourceType.FINANCIAL_SERVICES with default-deny security.
 */

import { TickerAnalyzer } from './ticker-analyzer.js';
import { ValuationEngine } from './valuation-engine.js';
import { PortfolioRiskEngine } from './portfolio-risk-engine.js';
import { MacroEconomicEngine } from './macro-economic-engine.js';
import { BacktestEngine } from './backtest-engine.js';
import {
  TickerAnalysis,
  ValuationModelResult,
  PortfolioAssetInput,
  PortfolioRiskProfile,
  MacroEconomicOverview,
  EarningsBreakdown,
  StrategyBacktestResult,
  BrokerCredentialsAudit,
} from './finance.interface.js';
import { PermissionManager } from '../security/permission-manager.js';
import { SecurityGuardian } from '../security/guardian.js';
import { AuditLogger } from '../audit/audit-logger.js';
import { ResourceType, PermissionLevel, SecurityDecisionType } from '../security/types.js';
import { logger } from '../utils/logger.js';

export class FinanceManager {
  private tickerAnalyzer: TickerAnalyzer;
  private valuationEngine: ValuationEngine;
  private portfolioRiskEngine: PortfolioRiskEngine;
  private macroEconomicEngine: MacroEconomicEngine;
  private backtestEngine: BacktestEngine;

  private permissionManager: PermissionManager;
  private guardian: SecurityGuardian;
  private auditLogger: AuditLogger;

  constructor(
    permissionManager: PermissionManager,
    guardian: SecurityGuardian,
    auditLogger: AuditLogger,
    tickerAnalyzer?: TickerAnalyzer,
    valuationEngine?: ValuationEngine,
    portfolioRiskEngine?: PortfolioRiskEngine,
    macroEconomicEngine?: MacroEconomicEngine,
    backtestEngine?: BacktestEngine
  ) {
    this.permissionManager = permissionManager;
    this.guardian = guardian;
    this.auditLogger = auditLogger;

    this.tickerAnalyzer = tickerAnalyzer || new TickerAnalyzer();
    this.valuationEngine = valuationEngine || new ValuationEngine();
    this.portfolioRiskEngine = portfolioRiskEngine || new PortfolioRiskEngine();
    this.macroEconomicEngine = macroEconomicEngine || new MacroEconomicEngine();
    this.backtestEngine = backtestEngine || new BacktestEngine();
  }

  /**
   * Technical and momentum analysis for a ticker symbol.
   */
  public async analyzeTicker(
    symbol: string,
    userId: string = 'default_user'
  ): Promise<TickerAnalysis> {
    this.assertPermission(userId, 'read', PermissionLevel.READ, `analyze_ticker:${symbol}`);
    this.assertGuardian(userId, 'read', `ticker:${symbol}`);

    const result = this.tickerAnalyzer.analyzeTicker(symbol);

    this.recordAudit(userId, 'read', PermissionLevel.READ, `Analyzed technical indicators for ${symbol}`, {
      symbol: result.symbol,
      price: result.currentPrice,
      trend: result.trendSignal,
    });

    return result;
  }

  /**
   * Fundamental DCF valuation and financial multiples modeling.
   */
  public async calculateValuation(
    symbol: string,
    wacc?: number,
    growth?: number,
    userId: string = 'default_user'
  ): Promise<ValuationModelResult> {
    this.assertPermission(userId, 'read', PermissionLevel.READ, `valuation_model:${symbol}`);
    this.assertGuardian(userId, 'read', `valuation:${symbol}`);

    const result = this.valuationEngine.calculateValuation(symbol, wacc, growth);

    this.recordAudit(userId, 'read', PermissionLevel.READ, `Calculated DCF valuation for ${symbol}`, {
      symbol: result.symbol,
      fairValue: result.estimatedFairValue,
      assessment: result.assessment,
    });

    return result;
  }

  /**
   * Quantitative portfolio risk analysis (MPT, Sharpe, VaR).
   */
  public async evaluatePortfolio(
    assets: PortfolioAssetInput[],
    userId: string = 'default_user'
  ): Promise<PortfolioRiskProfile> {
    this.assertPermission(userId, 'read', PermissionLevel.READ, 'portfolio_risk');
    this.assertGuardian(userId, 'read', 'portfolio_risk');

    const result = this.portfolioRiskEngine.evaluatePortfolio(assets);

    this.recordAudit(userId, 'read', PermissionLevel.READ, 'Evaluated portfolio risk profile', {
      assetsCount: assets.length,
      expectedReturn: result.expectedAnnualReturn,
      sharpeRatio: result.sharpeRatio,
      var95: result.valueAtRisk95,
    });

    return result;
  }

  /**
   * Macroeconomic overview, yield curve spread, and regime identification.
   */
  public async getMacroOverview(userId: string = 'default_user'): Promise<MacroEconomicOverview> {
    this.assertPermission(userId, 'read', PermissionLevel.READ, 'macro_economic_overview');
    this.assertGuardian(userId, 'read', 'macro_economic_overview');

    const result = this.macroEconomicEngine.getMacroOverview();

    this.recordAudit(userId, 'read', PermissionLevel.READ, 'Retrieved macroeconomic overview', {
      cpi: result.indicators.cpiInflationYoY,
      fedFunds: result.indicators.fedFundsRate,
      regime: result.macroRegime,
    });

    return result;
  }

  /**
   * Quarterly earnings breakdown and financial statement metrics.
   */
  public async getEarningsBreakdown(
    symbol: string,
    userId: string = 'default_user'
  ): Promise<EarningsBreakdown> {
    this.assertPermission(userId, 'read', PermissionLevel.READ, `earnings_breakdown:${symbol}`);
    this.assertGuardian(userId, 'read', `earnings:${symbol}`);

    const result = this.valuationEngine.getEarningsBreakdown(symbol);

    this.recordAudit(userId, 'read', PermissionLevel.READ, `Retrieved earnings breakdown for ${symbol}`, {
      symbol: result.symbol,
      quarter: result.quarter,
      revenueActual: result.revenueActual,
    });

    return result;
  }

  /**
   * Quantitative strategy backtesting (SMA Crossover / RSI Mean-Reversion).
   */
  public async runBacktest(
    strategy: 'SMA_Crossover' | 'RSI_Mean_Reversion',
    symbol: string,
    timeframeDays: number = 250,
    userId: string = 'default_user'
  ): Promise<StrategyBacktestResult> {
    this.assertPermission(userId, 'read', PermissionLevel.READ, `backtest_strategy:${strategy}`);
    this.assertGuardian(userId, 'read', `backtest:${strategy}`);

    const result = this.backtestEngine.runBacktest(strategy, symbol, timeframeDays);

    this.recordAudit(userId, 'read', PermissionLevel.READ, `Executed strategy backtest for ${symbol}`, {
      strategy,
      winRate: result.winRatePercent,
      strategyReturn: result.totalStrategyReturnPercent,
      buyHoldReturn: result.benchmarkBuyAndHoldReturnPercent,
    });

    return result;
  }

  /**
   * Honest host environment broker credentials audit.
   */
  public async auditBrokerCredentials(
    userId: string = 'default_user'
  ): Promise<BrokerCredentialsAudit> {
    this.assertPermission(userId, 'read', PermissionLevel.READ, 'audit_broker_credentials');

    const alpacaKeyPresent = Boolean(process.env.ALPACA_API_KEY && process.env.ALPACA_API_KEY.length > 5);
    const ibkrHostPresent = Boolean(process.env.IBKR_HOST && process.env.IBKR_HOST.length > 3);
    const alphaVantagePresent = Boolean(process.env.ALPHA_VANTAGE_KEY && process.env.ALPHA_VANTAGE_KEY.length > 5);

    const configuredBrokers = [
      {
        name: 'Alpaca Trading API',
        keyPresent: alpacaKeyPresent,
        accountType: alpacaKeyPresent ? ('paper' as const) : ('unconfigured' as const),
        status: alpacaKeyPresent ? 'Configured (Paper Sandbox Mode)' : 'Unconfigured (Missing ALPACA_API_KEY)',
      },
      {
        name: 'Interactive Brokers Gateway',
        keyPresent: ibkrHostPresent,
        accountType: ibkrHostPresent ? ('paper' as const) : ('unconfigured' as const),
        status: ibkrHostPresent ? 'Configured (Local TWS Gateway)' : 'Unconfigured (Missing IBKR_HOST)',
      },
      {
        name: 'AlphaVantage Market Data Feed',
        keyPresent: alphaVantagePresent,
        accountType: alphaVantagePresent ? ('paper' as const) : ('unconfigured' as const),
        status: alphaVantagePresent ? 'Active Data Feed Key' : 'Unconfigured (Missing ALPHA_VANTAGE_KEY)',
      },
    ];

    const audit: BrokerCredentialsAudit = {
      isLiveTradingAllowed: false, // Inviolable master security policy
      isSimulationModeActive: true,
      configuredBrokers,
      securityNotice:
        'Live monetary transactions are strictly disabled by default-deny Security Guardian policy. All quantitative execution operates in analytical simulation mode.',
    };

    this.recordAudit(userId, 'read', PermissionLevel.READ, 'Audited broker credentials and simulation bounds', {
      simulationMode: audit.isSimulationModeActive,
      liveTradingAllowed: audit.isLiveTradingAllowed,
    });

    return audit;
  }

  /**
   * Prohibited live fund transfer or real-money trade execution attempt.
   * Guaranteed to be blocked by the Security Guardian.
   */
  public async attemptLiveTrade(
    tradeParams: { symbol: string; quantity: number; action: 'BUY' | 'SELL' },
    userId: string = 'default_user'
  ): Promise<never> {
    // Evaluating this action through Guardian triggers ThreatCategory.UNAUTHORIZED_FINANCIAL_ACTION
    this.assertGuardian(userId, 'execute', `execute_trade:${tradeParams.action}:${tradeParams.symbol}`);
    this.assertPermission(userId, 'execute', PermissionLevel.ADMIN, 'execute_trade');

    throw new Error('Prohibited: Automated real-money trading is blocked by Security Guardian.');
  }

  // --- Security Helpers ---

  private assertPermission(
    userId: string,
    action: 'read' | 'write' | 'execute',
    requiredLevel: PermissionLevel,
    targetIdentifier: string
  ): void {
    const permResult = this.permissionManager.checkPermission({
      userId,
      resource: ResourceType.FINANCIAL_SERVICES,
      action,
      requiredLevel,
      targetIdentifier,
    });

    if (!permResult.allowed) {
      throw new Error(
        `Permission Denied on FINANCIAL_SERVICES: User "${userId}" lacks required ${requiredLevel} permission.`
      );
    }
  }

  private assertGuardian(userId: string, action: 'read' | 'write' | 'execute', target: string): void {
    const decision = this.guardian.evaluate({
      resource: ResourceType.FINANCIAL_SERVICES,
      action,
      target,
      userId,
    });

    if (decision.decision === SecurityDecisionType.DENY) {
      throw new Error(`Security Guardian blocked Financial action: ${decision.reason || 'Threat detected'}`);
    }
  }

  private recordAudit(
    userId: string,
    action: 'read' | 'write' | 'execute',
    permissionRequired: PermissionLevel,
    reason: string,
    details?: Record<string, any>
  ): void {
    try {
      this.auditLogger.log({
        user: userId,
        requestId: `req_fin_${Date.now()}`,
        resource: ResourceType.FINANCIAL_SERVICES,
        action,
        permissionRequired,
        decision: SecurityDecisionType.ALLOW,
        reason,
        result: 'SUCCESS',
        details,
      });
    } catch (err: any) {
      logger.warn(`[FinanceManager] Failed to record audit log: ${err.message}`);
    }
  }
}
