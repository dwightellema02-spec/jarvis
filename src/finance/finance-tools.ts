/**
 * JARVIS Phase 16 - Financial Research Tool Definitions
 * 8 Registered Tools for Technical Analysis, DCF Valuation, MPT Risk,
 * Macro Overviews, Correlation, Earnings, Backtesting, and Broker Auditing.
 */

import { ITool, ToolDefinition, ToolExecutionContext, ToolExecutionResult } from '../tools/tool.interface.js';
import { FinanceManager } from './finance-manager.js';
import { ResourceType, PermissionLevel } from '../security/types.js';

/**
 * 1. FinanceAnalyzeTickerTool: finance.analyze_ticker
 */
export class FinanceAnalyzeTickerTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'finance.analyze_ticker',
    name: 'Analyze Asset Ticker',
    description: 'Computes technical indicators (SMA, EMA, RSI, MACD, Bollinger Bands, volatility) and support/resistance.',
    version: '1.0.0',
    requiredPermissions: [
      { resource: ResourceType.FINANCIAL_SERVICES, action: 'read', level: PermissionLevel.READ },
    ],
    parametersSchema: {
      type: 'object',
      properties: {
        symbol: { type: 'string' },
      },
      required: ['symbol'],
    },
    status: 'implemented',
  };

  constructor(private readonly manager: FinanceManager) {}

  public async execute(params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const p = (params || {}) as any;
      const result = await this.manager.analyzeTicker(p.symbol, context.userId);
      return {
        success: true,
        toolId: this.definition.id,
        data: result,
        verified: true,
        executionTimeMs: Date.now() - startTime,
      };
    } catch (err: any) {
      return {
        success: false,
        toolId: this.definition.id,
        error: err.message || 'Ticker analysis failed',
        verified: false,
        executionTimeMs: Date.now() - startTime,
      };
    }
  }
}

/**
 * 2. FinanceValuationModelTool: finance.valuation_model
 */
export class FinanceValuationModelTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'finance.valuation_model',
    name: 'Valuation & DCF Model',
    description: 'Performs 5-year Discounted Cash Flow valuation, financial multiples benchmarking, and margin of safety analysis.',
    version: '1.0.0',
    requiredPermissions: [
      { resource: ResourceType.FINANCIAL_SERVICES, action: 'read', level: PermissionLevel.READ },
    ],
    parametersSchema: {
      type: 'object',
      properties: {
        symbol: { type: 'string' },
        wacc: { type: 'number' },
        growth: { type: 'number' },
      },
      required: ['symbol'],
    },
    status: 'implemented',
  };

  constructor(private readonly manager: FinanceManager) {}

  public async execute(params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const p = (params || {}) as any;
      const result = await this.manager.calculateValuation(p.symbol, p.wacc, p.growth, context.userId);
      return {
        success: true,
        toolId: this.definition.id,
        data: result,
        verified: true,
        executionTimeMs: Date.now() - startTime,
      };
    } catch (err: any) {
      return {
        success: false,
        toolId: this.definition.id,
        error: err.message || 'Valuation modeling failed',
        verified: false,
        executionTimeMs: Date.now() - startTime,
      };
    }
  }
}

/**
 * 3. FinancePortfolioRiskTool: finance.portfolio_risk
 */
export class FinancePortfolioRiskTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'finance.portfolio_risk',
    name: 'Evaluate Portfolio Risk',
    description: 'Calculates Modern Portfolio Theory (MPT) variance, Sharpe ratio, Sortino ratio, and 1-day Value at Risk (VaR 95%/99%).',
    version: '1.0.0',
    requiredPermissions: [
      { resource: ResourceType.FINANCIAL_SERVICES, action: 'read', level: PermissionLevel.READ },
    ],
    parametersSchema: {
      type: 'object',
      properties: {
        assets: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              symbol: { type: 'string' },
              weight: { type: 'number' },
            },
            required: ['symbol', 'weight'],
          },
        },
      },
      required: ['assets'],
    },
    status: 'implemented',
  };

  constructor(private readonly manager: FinanceManager) {}

  public async execute(params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const p = (params || {}) as any;
      const result = await this.manager.evaluatePortfolio(p.assets || [], context.userId);
      return {
        success: true,
        toolId: this.definition.id,
        data: result,
        verified: true,
        executionTimeMs: Date.now() - startTime,
      };
    } catch (err: any) {
      return {
        success: false,
        toolId: this.definition.id,
        error: err.message || 'Portfolio risk evaluation failed',
        verified: false,
        executionTimeMs: Date.now() - startTime,
      };
    }
  }
}

/**
 * 4. FinanceMacroEconomicOverviewTool: finance.macro_economic_overview
 */
export class FinanceMacroEconomicOverviewTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'finance.macro_economic_overview',
    name: 'Macroeconomic Overview',
    description: 'Synthesizes CPI inflation, interest rates, 10Y-2Y yield curve status, and macroeconomic regime signals.',
    version: '1.0.0',
    requiredPermissions: [
      { resource: ResourceType.FINANCIAL_SERVICES, action: 'read', level: PermissionLevel.READ },
    ],
    parametersSchema: {
      type: 'object',
      properties: {},
    },
    status: 'implemented',
  };

  constructor(private readonly manager: FinanceManager) {}

  public async execute(_params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const result = await this.manager.getMacroOverview(context.userId);
      return {
        success: true,
        toolId: this.definition.id,
        data: result,
        verified: true,
        executionTimeMs: Date.now() - startTime,
      };
    } catch (err: any) {
      return {
        success: false,
        toolId: this.definition.id,
        error: err.message || 'Macro overview failed',
        verified: false,
        executionTimeMs: Date.now() - startTime,
      };
    }
  }
}

/**
 * 5. FinanceCorrelationMatrixTool: finance.correlation_matrix
 */
export class FinanceCorrelationMatrixTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'finance.correlation_matrix',
    name: 'Asset Correlation Matrix',
    description: 'Generates cross-asset correlation matrix for multi-asset diversification benchmarking.',
    version: '1.0.0',
    requiredPermissions: [
      { resource: ResourceType.FINANCIAL_SERVICES, action: 'read', level: PermissionLevel.READ },
    ],
    parametersSchema: {
      type: 'object',
      properties: {
        symbols: {
          type: 'array',
          items: { type: 'string' },
        },
      },
      required: ['symbols'],
    },
    status: 'implemented',
  };

  constructor(private readonly manager: FinanceManager) {}

  public async execute(params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const p = (params || {}) as any;
      const symbols = (p.symbols || ['AAPL', 'MSFT', 'SPY', 'GLD', 'BTC']) as string[];
      const assets = symbols.map((s) => ({ symbol: s, weight: 1 / symbols.length }));
      const riskProfile = await this.manager.evaluatePortfolio(assets, context.userId);
      return {
        success: true,
        toolId: this.definition.id,
        data: {
          symbols,
          correlationMatrix: riskProfile.correlationMatrix,
          diversificationScore: riskProfile.diversificationScore,
        },
        verified: true,
        executionTimeMs: Date.now() - startTime,
      };
    } catch (err: any) {
      return {
        success: false,
        toolId: this.definition.id,
        error: err.message || 'Correlation matrix failed',
        verified: false,
        executionTimeMs: Date.now() - startTime,
      };
    }
  }
}

/**
 * 6. FinanceEarningsBreakdownTool: finance.earnings_breakdown
 */
export class FinanceEarningsBreakdownTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'finance.earnings_breakdown',
    name: 'Quarterly Earnings Breakdown',
    description: 'Analyzes quarterly revenue beats, EPS surprise margins, YoY growth, and executive guidance.',
    version: '1.0.0',
    requiredPermissions: [
      { resource: ResourceType.FINANCIAL_SERVICES, action: 'read', level: PermissionLevel.READ },
    ],
    parametersSchema: {
      type: 'object',
      properties: {
        symbol: { type: 'string' },
      },
      required: ['symbol'],
    },
    status: 'implemented',
  };

  constructor(private readonly manager: FinanceManager) {}

  public async execute(params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const p = (params || {}) as any;
      const result = await this.manager.getEarningsBreakdown(p.symbol, context.userId);
      return {
        success: true,
        toolId: this.definition.id,
        data: result,
        verified: true,
        executionTimeMs: Date.now() - startTime,
      };
    } catch (err: any) {
      return {
        success: false,
        toolId: this.definition.id,
        error: err.message || 'Earnings breakdown failed',
        verified: false,
        executionTimeMs: Date.now() - startTime,
      };
    }
  }
}

/**
 * 7. FinanceBacktestStrategyTool: finance.backtest_strategy
 */
export class FinanceBacktestStrategyTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'finance.backtest_strategy',
    name: 'Backtest Quantitative Strategy',
    description: 'Simulates technical trading strategies (SMA Crossover / RSI Mean Reversion) over historical horizons.',
    version: '1.0.0',
    requiredPermissions: [
      { resource: ResourceType.FINANCIAL_SERVICES, action: 'read', level: PermissionLevel.READ },
    ],
    parametersSchema: {
      type: 'object',
      properties: {
        symbol: { type: 'string' },
        strategy: { type: 'string', enum: ['SMA_Crossover', 'RSI_Mean_Reversion'] },
        timeframeDays: { type: 'number' },
      },
      required: ['symbol', 'strategy'],
    },
    status: 'implemented',
  };

  constructor(private readonly manager: FinanceManager) {}

  public async execute(params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const p = (params || {}) as any;
      const result = await this.manager.runBacktest(p.strategy, p.symbol, p.timeframeDays || 250, context.userId);
      return {
        success: true,
        toolId: this.definition.id,
        data: result,
        verified: true,
        executionTimeMs: Date.now() - startTime,
      };
    } catch (err: any) {
      return {
        success: false,
        toolId: this.definition.id,
        error: err.message || 'Strategy backtest failed',
        verified: false,
        executionTimeMs: Date.now() - startTime,
      };
    }
  }
}

/**
 * 8. FinanceCheckBrokerCredentialsTool: finance.check_broker_credentials
 */
export class FinanceCheckBrokerCredentialsTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'finance.check_broker_credentials',
    name: 'Check Broker Credentials & Simulation Mode',
    description: 'Audits host broker API environment credentials and reports simulation mode bounds honestly.',
    version: '1.0.0',
    requiredPermissions: [
      { resource: ResourceType.FINANCIAL_SERVICES, action: 'read', level: PermissionLevel.READ },
    ],
    parametersSchema: {
      type: 'object',
      properties: {},
    },
    status: 'implemented',
  };

  constructor(private readonly manager: FinanceManager) {}

  public async execute(_params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const result = await this.manager.auditBrokerCredentials(context.userId);
      return {
        success: true,
        toolId: this.definition.id,
        data: result,
        verified: true,
        executionTimeMs: Date.now() - startTime,
      };
    } catch (err: any) {
      return {
        success: false,
        toolId: this.definition.id,
        error: err.message || 'Checking broker credentials failed',
        verified: false,
        executionTimeMs: Date.now() - startTime,
      };
    }
  }
}

export function createFinanceTools(manager: FinanceManager): ITool[] {
  return [
    new FinanceAnalyzeTickerTool(manager),
    new FinanceValuationModelTool(manager),
    new FinancePortfolioRiskTool(manager),
    new FinanceMacroEconomicOverviewTool(manager),
    new FinanceCorrelationMatrixTool(manager),
    new FinanceEarningsBreakdownTool(manager),
    new FinanceBacktestStrategyTool(manager),
    new FinanceCheckBrokerCredentialsTool(manager),
  ];
}
