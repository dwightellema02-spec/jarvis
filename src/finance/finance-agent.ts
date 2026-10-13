/**
 * JARVIS Phase 16 - Financial Research Agent Implementation
 * Autonomous quantitative analyst coordinating ticker analysis, valuations, MPT risk, and backtesting.
 */

import {
  IAgent,
  AgentDefinition,
  AgentExecutionContext,
  AgentExecutionResult,
} from '../agents/agent.interface.js';
import { FinanceManager } from './finance-manager.js';
import { ResourceType, PermissionLevel } from '../security/types.js';
import { PortfolioAssetInput } from './finance.interface.js';

export interface FinanceAgentInput {
  action:
    | 'analyze_ticker'
    | 'calculate_valuation'
    | 'evaluate_portfolio'
    | 'get_macro_overview'
    | 'get_earnings_breakdown'
    | 'run_backtest'
    | 'audit_broker_credentials'
    | 'attempt_live_trade';
  symbol?: string;
  wacc?: number;
  growth?: number;
  assets?: PortfolioAssetInput[];
  strategy?: 'SMA_Crossover' | 'RSI_Mean_Reversion';
  timeframeDays?: number;
  tradeParams?: {
    symbol: string;
    quantity: number;
    action: 'BUY' | 'SELL';
  };
}

export class FinanceAgent implements IAgent {
  public readonly definition: AgentDefinition = {
    id: 'finance-agent',
    name: 'JARVIS Financial Research Agent',
    description:
      'Autonomous quantitative analyst executing technical indicator analysis, DCF valuations, MPT risk evaluations, and strategy backtesting under default-deny security.',
    version: '1.0.0',
    capabilities: [
      'analyze_ticker',
      'calculate_valuation',
      'evaluate_portfolio',
      'get_macro_overview',
      'get_earnings_breakdown',
      'run_backtest',
      'audit_broker_credentials',
      'attempt_live_trade',
    ],
    requiredPermissions: [
      {
        resource: ResourceType.FINANCIAL_SERVICES,
        action: 'read',
        level: PermissionLevel.READ,
      },
    ],
    inputSchema: {
      action: 'string',
      symbol: 'string?',
      wacc: 'number?',
      growth: 'number?',
      assets: 'array?',
      strategy: 'string?',
      timeframeDays: 'number?',
      tradeParams: 'object?',
    },
    outputSchema: {
      success: 'boolean',
      data: 'any',
    },
    status: 'implemented',
  };

  private manager: FinanceManager;

  constructor(manager: FinanceManager) {
    this.manager = manager;
  }

  public async execute(
    rawInput: unknown,
    context: AgentExecutionContext
  ): Promise<AgentExecutionResult> {
    const startTime = Date.now();
    const input = (rawInput || {}) as FinanceAgentInput;
    const userId = context.userId || 'default_user';

    try {
      switch (input.action) {
        case 'analyze_ticker': {
          if (!input.symbol) {
            return {
              success: false,
              agentId: this.definition.id,
              error: '"symbol" is required for ticker analysis.',
              executionTimeMs: Date.now() - startTime,
            };
          }
          const analysis = await this.manager.analyzeTicker(input.symbol, userId);
          return {
            success: true,
            agentId: this.definition.id,
            data: analysis,
            executionTimeMs: Date.now() - startTime,
          };
        }

        case 'calculate_valuation': {
          if (!input.symbol) {
            return {
              success: false,
              agentId: this.definition.id,
              error: '"symbol" is required for valuation model.',
              executionTimeMs: Date.now() - startTime,
            };
          }
          const valuation = await this.manager.calculateValuation(
            input.symbol,
            input.wacc,
            input.growth,
            userId
          );
          return {
            success: true,
            agentId: this.definition.id,
            data: valuation,
            executionTimeMs: Date.now() - startTime,
          };
        }

        case 'evaluate_portfolio': {
          if (!input.assets || !Array.isArray(input.assets) || input.assets.length === 0) {
            return {
              success: false,
              agentId: this.definition.id,
              error: '"assets" array with at least one asset is required.',
              executionTimeMs: Date.now() - startTime,
            };
          }
          const riskProfile = await this.manager.evaluatePortfolio(input.assets, userId);
          return {
            success: true,
            agentId: this.definition.id,
            data: riskProfile,
            executionTimeMs: Date.now() - startTime,
          };
        }

        case 'get_macro_overview': {
          const macro = await this.manager.getMacroOverview(userId);
          return {
            success: true,
            agentId: this.definition.id,
            data: macro,
            executionTimeMs: Date.now() - startTime,
          };
        }

        case 'get_earnings_breakdown': {
          if (!input.symbol) {
            return {
              success: false,
              agentId: this.definition.id,
              error: '"symbol" is required for earnings breakdown.',
              executionTimeMs: Date.now() - startTime,
            };
          }
          const earnings = await this.manager.getEarningsBreakdown(input.symbol, userId);
          return {
            success: true,
            agentId: this.definition.id,
            data: earnings,
            executionTimeMs: Date.now() - startTime,
          };
        }

        case 'run_backtest': {
          if (!input.symbol) {
            return {
              success: false,
              agentId: this.definition.id,
              error: '"symbol" is required for strategy backtest.',
              executionTimeMs: Date.now() - startTime,
            };
          }
          const strat = input.strategy || 'SMA_Crossover';
          const backtest = await this.manager.runBacktest(
            strat,
            input.symbol,
            input.timeframeDays || 250,
            userId
          );
          return {
            success: true,
            agentId: this.definition.id,
            data: backtest,
            executionTimeMs: Date.now() - startTime,
          };
        }

        case 'audit_broker_credentials': {
          const audit = await this.manager.auditBrokerCredentials(userId);
          return {
            success: true,
            agentId: this.definition.id,
            data: audit,
            executionTimeMs: Date.now() - startTime,
          };
        }

        case 'attempt_live_trade': {
          // This must be blocked by Guardian!
          await this.manager.attemptLiveTrade(
            input.tradeParams || { symbol: 'AAPL', quantity: 1, action: 'BUY' },
            userId
          );
          return {
            success: false,
            agentId: this.definition.id,
            error: 'Live trade should have been blocked by Security Guardian.',
            executionTimeMs: Date.now() - startTime,
          };
        }

        default:
          return {
            success: false,
            agentId: this.definition.id,
            error: `Unsupported finance action: "${input.action}".`,
            executionTimeMs: Date.now() - startTime,
          };
      }
    } catch (err: any) {
      return {
        success: false,
        agentId: this.definition.id,
        error: err.message || 'Financial agent execution failed.',
        executionTimeMs: Date.now() - startTime,
      };
    }
  }
}
