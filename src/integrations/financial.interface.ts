export type FinancialActivityStage =
  | 'INFORMATION'
  | 'RESEARCH'
  | 'ANALYSIS'
  | 'RECOMMENDATION_EDUCATION'
  | 'EXECUTION_ACTION';

export interface MarketDataPoint {
  symbol: string;
  price: number;
  timestamp: string;
  currency: string;
  change24h?: number;
}

export interface PortfolioPosition {
  asset: string;
  quantity: number;
  costBasis: number;
  currentPrice: number;
}

export interface FinancialEducationTopic {
  id: string;
  title: string; // e.g. "Bitcoin Halving Mechanics", "Blockchain Consensus"
  overview: string;
  riskDisclaimer: string;
}

/**
 * Architectural Boundary:
 * Separates read-only research and analysis from real financial transactions.
 * Transactions must always default to DENY and require explicit administrative
 * confirmation with multi-factor proof.
 */
export interface IFinancialResearchService {
  getMarketData(symbol: string): Promise<MarketDataPoint>;
  getEducationalContent(topicId: string): Promise<FinancialEducationTopic>;
  calculatePortfolioMetrics(positions: PortfolioPosition[]): {
    totalValue: number;
    unrealizedPnL: number;
    riskScore: number;
  };
}
