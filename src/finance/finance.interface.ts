/**
 * JARVIS Phase 16 - Financial Research & Market Intelligence Interfaces
 */

export interface TechnicalIndicators {
  sma20: number;
  sma50: number;
  sma200: number;
  rsi14: number; // 0 - 100
  macd: {
    value: number;
    signal: number;
    histogram: number;
  };
  bollingerBands: {
    upper: number;
    middle: number;
    lower: number;
  };
  annualizedVolatility: number; // percentage
}

export interface TickerAnalysis {
  symbol: string;
  name: string;
  assetClass: 'equity' | 'crypto' | 'etf' | 'forex' | 'commodity';
  currentPrice: number;
  change24h: number;
  change24hPercent: number;
  technicals: TechnicalIndicators;
  supportResistance: {
    support: number;
    resistance: number;
  };
  trendSignal: 'strong_bullish' | 'bullish' | 'neutral' | 'bearish' | 'strong_bearish';
  keyInsights: string[];
  disclaimer: string;
}

export interface DcfInputs {
  wacc: number; // Weighted Average Cost of Capital (e.g. 0.09 = 9%)
  terminalGrowthRate: number; // e.g. 0.025 = 2.5%
  projectedCashFlows: number[]; // e.g. 5-year projections in millions
  terminalValue: number;
  presentValueOfCashFlows: number;
  enterpriseValue: number;
}

export interface ValuationMultiples {
  peRatio: number;
  psRatio: number;
  evEbitda: number;
  fcfYield: number; // percentage
}

export interface ValuationModelResult {
  symbol: string;
  currentMarketPrice: number;
  estimatedFairValue: number;
  marginOfSafetyPercent: number;
  valuationMethod: 'DCF_perpetual_growth';
  dcfInputs: DcfInputs;
  multiples: ValuationMultiples;
  assessment: 'undervalued' | 'fairly_valued' | 'overvalued';
  summary: string;
  disclaimer: string;
}

export interface PortfolioAssetInput {
  symbol: string;
  weight: number; // 0.0 - 1.0 (must sum to ~1.0)
  expectedReturn?: number;
  volatility?: number;
}

export interface PortfolioRiskProfile {
  assets: Array<{
    symbol: string;
    weight: number;
    expectedReturn: number;
    volatility: number;
  }>;
  expectedAnnualReturn: number;
  portfolioVolatility: number;
  sharpeRatio: number; // (Return - Rf) / Volatility
  sortinoRatio: number; // (Return - Rf) / DownsideDev
  valueAtRisk95: number; // 1-day 95% VaR percentage
  valueAtRisk99: number; // 1-day 99% VaR percentage
  maxDrawdownPercent: number;
  diversificationScore: number; // 0 - 100
  correlationMatrix: Record<string, Record<string, number>>;
  disclaimer: string;
}

export interface MacroEconomicOverview {
  indicators: {
    cpiInflationYoY: number;
    fedFundsRate: number;
    treasury10Y2YSpread: number; // e.g. -0.15%
    gdpGrowthAnnual: number;
    unemploymentRate: number;
  };
  yieldCurveStatus: 'inverted' | 'flat' | 'normal';
  recessionRiskAssessment: 'low' | 'moderate' | 'elevated' | 'high';
  macroRegime: 'stagflation' | 'expansion' | 'disinflationary_boom' | 'contraction';
  marketImplications: string[];
  disclaimer: string;
}

export interface EarningsBreakdown {
  symbol: string;
  quarter: string;
  revenueActual: string;
  revenueEstimate: string;
  revenueYoYGrowth: number;
  epsActual: number;
  epsEstimate: number;
  epsSurprisePercent: number;
  grossMargin: number;
  operatingMargin: number;
  guidanceSummary: string;
  disclaimer: string;
}

export interface StrategyBacktestResult {
  strategyName: 'SMA_Crossover' | 'RSI_Mean_Reversion';
  symbol: string;
  timeframeDays: number;
  totalTrades: number;
  winningTrades: number;
  winRatePercent: number;
  profitFactor: number;
  totalStrategyReturnPercent: number;
  benchmarkBuyAndHoldReturnPercent: number;
  maxDrawdownPercent: number;
  tradeLogSample: Array<{
    tradeNumber: number;
    type: 'BUY' | 'SELL';
    dayIndex: number;
    price: number;
    pnlPercent?: number;
  }>;
  disclaimer: string;
}

export interface BrokerCredentialsAudit {
  isLiveTradingAllowed: boolean;
  isSimulationModeActive: boolean;
  configuredBrokers: Array<{
    name: string;
    keyPresent: boolean;
    accountType: 'paper' | 'live' | 'unconfigured';
    status: string;
  }>;
  securityNotice: string;
}

export const FINANCIAL_RESEARCH_DISCLAIMER =
  'JARVIS Financial Research provides quantitative analysis and educational mathematical modeling, not licensed fiduciary financial advice or investment recommendations. Live capital execution is strictly prohibited by default-deny security policy.';
