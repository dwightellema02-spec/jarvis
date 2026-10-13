/**
 * JARVIS Phase 16 - Quantitative Strategy Backtesting Engine
 * Simulates SMA Crossover and RSI Mean-Reversion rules against historical price series.
 */

import { StrategyBacktestResult, FINANCIAL_RESEARCH_DISCLAIMER } from './finance.interface.js';

export class BacktestEngine {
  /**
   * Backtests an algorithmic strategy over a historical time horizon.
   */
  public runBacktest(
    strategy: 'SMA_Crossover' | 'RSI_Mean_Reversion',
    symbol: string,
    timeframeDays: number = 250
  ): StrategyBacktestResult {
    const sym = symbol.toUpperCase().trim();
    const days = Math.max(50, Math.min(1000, timeframeDays));

    // Synthesize historical price path deterministically for symbol
    const prices = this.generateHistoricalPriceSeries(sym, days);

    const trades: Array<{
      tradeNumber: number;
      type: 'BUY' | 'SELL';
      dayIndex: number;
      price: number;
      pnlPercent?: number;
    }> = [];

    let inPosition = false;
    let entryPrice = 0;
    let winningTrades = 0;
    let grossGains = 0;
    let grossLosses = 0;
    let currentEquity = 10000;
    let peakEquity = currentEquity;
    let maxDrawdown = 0;

    const initialPrice = prices[0];
    const finalPrice = prices[prices.length - 1];
    const benchmarkBuyAndHoldReturnPercent =
      Math.round(((finalPrice - initialPrice) / initialPrice) * 10000) / 100;

    if (strategy === 'SMA_Crossover') {
      const fastWindow = 20;
      const slowWindow = 50;

      for (let i = slowWindow; i < prices.length; i++) {
        const fastSma = this.calculateSma(prices, i, fastWindow);
        const slowSma = this.calculateSma(prices, i, slowWindow);
        const prevFastSma = this.calculateSma(prices, i - 1, fastWindow);
        const prevSlowSma = this.calculateSma(prices, i - 1, slowWindow);

        // Buy condition: Fast SMA crosses above Slow SMA
        if (!inPosition && prevFastSma <= prevSlowSma && fastSma > slowSma) {
          inPosition = true;
          entryPrice = prices[i];
          trades.push({
            tradeNumber: trades.length + 1,
            type: 'BUY',
            dayIndex: i,
            price: Math.round(entryPrice * 100) / 100,
          });
        }
        // Sell condition: Fast SMA crosses below Slow SMA
        else if (inPosition && prevFastSma >= prevSlowSma && fastSma < slowSma) {
          inPosition = false;
          const exitPrice = prices[i];
          const pnlPercent = Math.round(((exitPrice - entryPrice) / entryPrice) * 10000) / 100;
          const tradePnlDollar = currentEquity * (pnlPercent / 100);
          currentEquity += tradePnlDollar;

          if (currentEquity > peakEquity) peakEquity = currentEquity;
          const dd = ((peakEquity - currentEquity) / peakEquity) * 100;
          if (dd > maxDrawdown) maxDrawdown = dd;

          if (pnlPercent > 0) {
            winningTrades++;
            grossGains += tradePnlDollar;
          } else {
            grossLosses += Math.abs(tradePnlDollar);
          }

          trades.push({
            tradeNumber: trades.length + 1,
            type: 'SELL',
            dayIndex: i,
            price: Math.round(exitPrice * 100) / 100,
            pnlPercent,
          });
        }
      }
    } else {
      // RSI Mean-Reversion strategy
      const rsiWindow = 14;

      for (let i = rsiWindow + 1; i < prices.length; i++) {
        const rsi = this.calculateRsi(prices, i, rsiWindow);

        // Buy condition: Oversold RSI < 32
        if (!inPosition && rsi < 32) {
          inPosition = true;
          entryPrice = prices[i];
          trades.push({
            tradeNumber: trades.length + 1,
            type: 'BUY',
            dayIndex: i,
            price: Math.round(entryPrice * 100) / 100,
          });
        }
        // Sell condition: Overbought RSI > 68
        else if (inPosition && rsi > 68) {
          inPosition = false;
          const exitPrice = prices[i];
          const pnlPercent = Math.round(((exitPrice - entryPrice) / entryPrice) * 10000) / 100;
          const tradePnlDollar = currentEquity * (pnlPercent / 100);
          currentEquity += tradePnlDollar;

          if (currentEquity > peakEquity) peakEquity = currentEquity;
          const dd = ((peakEquity - currentEquity) / peakEquity) * 100;
          if (dd > maxDrawdown) maxDrawdown = dd;

          if (pnlPercent > 0) {
            winningTrades++;
            grossGains += tradePnlDollar;
          } else {
            grossLosses += Math.abs(tradePnlDollar);
          }

          trades.push({
            tradeNumber: trades.length + 1,
            type: 'SELL',
            dayIndex: i,
            price: Math.round(exitPrice * 100) / 100,
            pnlPercent,
          });
        }
      }
    }

    const closedTradesCount = Math.floor(trades.length / 2);
    const totalTrades = closedTradesCount > 0 ? closedTradesCount : 1;
    const winRatePercent = Math.round((winningTrades / totalTrades) * 1000) / 10;
    const profitFactor =
      grossLosses > 0
        ? Math.round((grossGains / grossLosses) * 100) / 100
        : Math.round(grossGains > 0 ? 3.5 : 1.0);
    const totalStrategyReturnPercent =
      Math.round(((currentEquity - 10000) / 10000) * 10000) / 100;

    return {
      strategyName: strategy,
      symbol: sym,
      timeframeDays: days,
      totalTrades,
      winningTrades,
      winRatePercent,
      profitFactor,
      totalStrategyReturnPercent,
      benchmarkBuyAndHoldReturnPercent,
      maxDrawdownPercent: Math.round(maxDrawdown * 100) / 100,
      tradeLogSample: trades.slice(0, 10),
      disclaimer: FINANCIAL_RESEARCH_DISCLAIMER,
    };
  }

  private calculateSma(prices: number[], currentIndex: number, window: number): number {
    let sum = 0;
    for (let i = currentIndex - window + 1; i <= currentIndex; i++) {
      sum += prices[i];
    }
    return sum / window;
  }

  private calculateRsi(prices: number[], currentIndex: number, window: number): number {
    let gains = 0;
    let losses = 0;
    for (let i = currentIndex - window + 1; i <= currentIndex; i++) {
      const diff = prices[i] - prices[i - 1];
      if (diff >= 0) gains += diff;
      else losses += Math.abs(diff);
    }
    const avgGain = gains / window;
    const avgLoss = losses / window;
    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return 100 - 100 / (1 + rs);
  }

  private generateHistoricalPriceSeries(symbol: string, count: number): number[] {
    let hash = 0;
    for (let i = 0; i < symbol.length; i++) {
      hash = (hash << 5) - hash + symbol.charCodeAt(i);
      hash |= 0;
    }
    const seed = Math.abs(hash);

    let price = (seed % 200) + 50;
    const series: number[] = [price];

    for (let i = 1; i < count; i++) {
      const pseudoRandom = Math.sin(seed + i * 1.3) * 0.02 + 0.0005; // upward drift
      price = price * (1 + pseudoRandom);
      series.push(Math.round(price * 100) / 100);
    }

    return series;
  }
}
