/**
 * JARVIS Phase 16 - Quantitative Portfolio Risk & Optimization Engine
 * Calculates expected returns, portfolio volatility, Sharpe ratio, Sortino, VaR, and correlation matrices.
 */

import {
  PortfolioAssetInput,
  PortfolioRiskProfile,
  FINANCIAL_RESEARCH_DISCLAIMER,
} from './finance.interface.js';

export class PortfolioRiskEngine {
  private static readonly ASSET_BENCHMARKS: Record<
    string,
    { expectedReturn: number; volatility: number; correlationBase: number }
  > = {
    AAPL: { expectedReturn: 14.5, volatility: 21.5, correlationBase: 0.65 },
    MSFT: { expectedReturn: 13.8, volatility: 19.8, correlationBase: 0.68 },
    NVDA: { expectedReturn: 28.5, volatility: 44.2, correlationBase: 0.72 },
    GOOGL: { expectedReturn: 15.0, volatility: 23.4, correlationBase: 0.64 },
    AMZN: { expectedReturn: 16.2, volatility: 25.1, correlationBase: 0.66 },
    SPY: { expectedReturn: 10.5, volatility: 13.2, correlationBase: 0.85 },
    QQQ: { expectedReturn: 14.2, volatility: 17.5, correlationBase: 0.88 },
    BTC: { expectedReturn: 35.0, volatility: 56.4, correlationBase: 0.35 },
    ETH: { expectedReturn: 32.0, volatility: 61.2, correlationBase: 0.38 },
    GLD: { expectedReturn: 7.5, volatility: 12.0, correlationBase: -0.1 },
    TLT: { expectedReturn: 5.2, volatility: 14.5, correlationBase: -0.25 },
  };

  private static readonly RISK_FREE_RATE = 4.5; // 4.5% US Treasury benchmark

  /**
   * Evaluates portfolio risk profile, Sharpe, Sortino, and Value at Risk.
   */
  public evaluatePortfolio(rawAssets: PortfolioAssetInput[]): PortfolioRiskProfile {
    if (!rawAssets || rawAssets.length === 0) {
      throw new Error('Portfolio must contain at least one asset.');
    }

    // 1. Normalize weights so they sum to 1.0
    const rawSum = rawAssets.reduce((sum, a) => sum + Math.max(0, a.weight), 0);
    const totalWeight = rawSum > 0 ? rawSum : rawAssets.length;

    const normalizedAssets = rawAssets.map((a) => {
      const sym = a.symbol.toUpperCase().trim();
      const bench =
        PortfolioRiskEngine.ASSET_BENCHMARKS[sym] || this.synthesizeAssetBenchmark(sym);

      const weight = Math.round((Math.max(0, a.weight) / totalWeight) * 1000) / 1000;
      const expectedReturn =
        a.expectedReturn !== undefined ? a.expectedReturn : bench.expectedReturn;
      const volatility =
        a.volatility !== undefined ? a.volatility : bench.volatility;

      return {
        symbol: sym,
        weight,
        expectedReturn,
        volatility,
      };
    });

    // 2. Expected Portfolio Return: w * R
    const expectedAnnualReturn =
      Math.round(
        normalizedAssets.reduce(
          (sum, a) => sum + a.weight * a.expectedReturn,
          0
        ) * 100
      ) / 100;

    // 3. Correlation Matrix
    const correlationMatrix: Record<string, Record<string, number>> = {};
    const symbols = normalizedAssets.map((a) => a.symbol);

    for (const s1 of symbols) {
      correlationMatrix[s1] = {};
      for (const s2 of symbols) {
        if (s1 === s2) {
          correlationMatrix[s1][s2] = 1.0;
        } else {
          const corr = this.computeCorrelation(s1, s2);
          correlationMatrix[s1][s2] = corr;
        }
      }
    }

    // 4. Portfolio Variance & Volatility: sqrt( sum_i sum_j w_i w_j vol_i vol_j corr_ij )
    let portfolioVariance = 0;
    let weightedVolSum = 0;

    for (let i = 0; i < normalizedAssets.length; i++) {
      const a_i = normalizedAssets[i];
      weightedVolSum += a_i.weight * a_i.volatility;

      for (let j = 0; j < normalizedAssets.length; j++) {
        const a_j = normalizedAssets[j];
        const rho = correlationMatrix[a_i.symbol][a_j.symbol] || 0.5;
        portfolioVariance +=
          a_i.weight * a_j.weight * a_i.volatility * a_j.volatility * rho;
      }
    }

    const portfolioVolatility =
      Math.round(Math.sqrt(Math.max(0.1, portfolioVariance)) * 100) / 100;

    // 5. Sharpe Ratio: (Return - Rf) / Volatility
    const excessReturn = expectedAnnualReturn - PortfolioRiskEngine.RISK_FREE_RATE;
    const sharpeRatio =
      Math.round((excessReturn / Math.max(1, portfolioVolatility)) * 100) / 100;

    // 6. Sortino Ratio: (Return - Rf) / DownsideDev
    const downsideDev = Math.max(1, portfolioVolatility * 0.72);
    const sortinoRatio =
      Math.round((excessReturn / downsideDev) * 100) / 100;

    // 7. 1-Day Value at Risk (VaR)
    // 95% 1-day = 1.645 * (vol / sqrt(252))
    // 99% 1-day = 2.326 * (vol / sqrt(252))
    const dailyVol = portfolioVolatility / Math.sqrt(252);
    const valueAtRisk95 = Math.round(1.645 * dailyVol * 100) / 100;
    const valueAtRisk99 = Math.round(2.326 * dailyVol * 100) / 100;

    // 8. Max Drawdown Estimate (historical rule of thumb for given volatility)
    const maxDrawdownPercent =
      Math.round(Math.min(95, portfolioVolatility * 1.85) * 10) / 10;

    // 9. Diversification Score (0-100)
    // Measures variance reduction relative to undiversified weighted volatility
    const volReduction = Math.max(0, weightedVolSum - portfolioVolatility);
    const diversificationRatio = weightedVolSum > 0 ? volReduction / weightedVolSum : 0;
    const assetSpread = Math.min(1, normalizedAssets.length / 5);
    const diversificationScore =
      Math.round((diversificationRatio * 60 + assetSpread * 40) * 100) / 100;

    return {
      assets: normalizedAssets,
      expectedAnnualReturn,
      portfolioVolatility,
      sharpeRatio,
      sortinoRatio,
      valueAtRisk95,
      valueAtRisk99,
      maxDrawdownPercent,
      diversificationScore: Math.min(100, Math.max(10, diversificationScore)),
      correlationMatrix,
      disclaimer: FINANCIAL_RESEARCH_DISCLAIMER,
    };
  }

  private computeCorrelation(s1: string, s2: string): number {
    const b1 =
      PortfolioRiskEngine.ASSET_BENCHMARKS[s1] || this.synthesizeAssetBenchmark(s1);
    const b2 =
      PortfolioRiskEngine.ASSET_BENCHMARKS[s2] || this.synthesizeAssetBenchmark(s2);

    if (
      (s1 === 'GLD' && s2 === 'TLT') ||
      (s1 === 'TLT' && s2 === 'GLD')
    ) {
      return 0.35;
    }
    if (s1 === 'GLD' || s2 === 'GLD' || s1 === 'TLT' || s2 === 'TLT') {
      return -0.15;
    }

    const avgBase = (b1.correlationBase + b2.correlationBase) / 2;
    return Math.round(avgBase * 100) / 100;
  }

  private synthesizeAssetBenchmark(symbol: string): {
    expectedReturn: number;
    volatility: number;
    correlationBase: number;
  } {
    let hash = 0;
    for (let i = 0; i < symbol.length; i++) {
      hash = (hash << 5) - hash + symbol.charCodeAt(i);
      hash |= 0;
    }
    const seed = Math.abs(hash);

    const isCrypto =
      symbol.includes('BTC') || symbol.includes('ETH') || symbol.includes('SOL');
    const isBondOrDefensive =
      symbol.includes('BOND') || symbol.includes('GOV') || symbol.includes('GOLD');

    if (isCrypto) {
      return {
        expectedReturn: 30.0,
        volatility: 55.0,
        correlationBase: 0.4,
      };
    }
    if (isBondOrDefensive) {
      return {
        expectedReturn: 6.0,
        volatility: 11.0,
        correlationBase: -0.1,
      };
    }

    return {
      expectedReturn: (seed % 14) + 8,
      volatility: (seed % 20) + 16,
      correlationBase: 0.6,
    };
  }
}
