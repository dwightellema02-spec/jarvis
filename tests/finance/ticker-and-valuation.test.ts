import { describe, it, expect } from 'vitest';
import { TickerAnalyzer } from '../../src/finance/ticker-analyzer.js';
import { ValuationEngine } from '../../src/finance/valuation-engine.js';
import { FINANCIAL_RESEARCH_DISCLAIMER } from '../../src/finance/finance.interface.js';

describe('Phase 16 - Ticker Analyzer & Technical Indicators', () => {
  const analyzer = new TickerAnalyzer();

  it('calculates technical indicators for AAPL accurately', () => {
    const analysis = analyzer.analyzeTicker('AAPL');

    expect(analysis.symbol).toBe('AAPL');
    expect(analysis.name).toContain('Apple');
    expect(analysis.currentPrice).toBeGreaterThan(0);
    expect(analysis.assetClass).toBe('equity');

    // Moving Averages & Technicals
    expect(analysis.technicals.sma20).toBeGreaterThan(0);
    expect(analysis.technicals.sma50).toBeGreaterThan(0);
    expect(analysis.technicals.sma200).toBeGreaterThan(0);

    // Momentum Indicators
    expect(analysis.technicals.rsi14).toBeGreaterThanOrEqual(0);
    expect(analysis.technicals.rsi14).toBeLessThanOrEqual(100);
    expect(typeof analysis.technicals.macd.value).toBe('number');
    expect(typeof analysis.technicals.macd.signal).toBe('number');
    expect(typeof analysis.technicals.macd.histogram).toBe('number');

    // Volatility & Bollinger Bands
    expect(analysis.technicals.bollingerBands.upper).toBeGreaterThan(
      analysis.technicals.bollingerBands.lower
    );
    expect(analysis.technicals.bollingerBands.middle).toBeGreaterThan(0);
    expect(analysis.technicals.annualizedVolatility).toBeGreaterThan(0);

    // Support and Resistance
    expect(analysis.supportResistance.resistance).toBeGreaterThan(
      analysis.supportResistance.support
    );

    // Trend signal and disclaimer
    expect([
      'strong_bullish',
      'bullish',
      'neutral',
      'bearish',
      'strong_bearish',
    ]).toContain(analysis.trendSignal);
    expect(analysis.keyInsights.length).toBeGreaterThan(0);
    expect(analysis.disclaimer).toBe(FINANCIAL_RESEARCH_DISCLAIMER);
  });

  it('supports custom synthetic tickers with generated baseline', () => {
    const analysis = analyzer.analyzeTicker('XYZCORP');

    expect(analysis.symbol).toBe('XYZCORP');
    expect(analysis.currentPrice).toBeGreaterThan(0);
    expect(analysis.technicals.sma20).toBeGreaterThan(0);
    expect(analysis.technicals.rsi14).toBeGreaterThanOrEqual(0);
  });

  it('normalizes lowercase symbol names to uppercase', () => {
    const analysis = analyzer.analyzeTicker('msft');
    expect(analysis.symbol).toBe('MSFT');
  });
});

describe('Phase 16 - Valuation Engine & DCF Modeling', () => {
  const engine = new ValuationEngine();

  it('calculates 5-year DCF intrinsic value and multiples for MSFT', () => {
    const valuation = engine.calculateValuation('MSFT', 0.09, 0.025);

    expect(valuation.symbol).toBe('MSFT');
    expect(valuation.currentMarketPrice).toBeGreaterThan(0);
    expect(valuation.estimatedFairValue).toBeGreaterThan(0);
    expect(typeof valuation.marginOfSafetyPercent).toBe('number');

    // DCF Details
    expect(valuation.dcfInputs.wacc).toBe(0.09);
    expect(valuation.dcfInputs.terminalGrowthRate).toBe(0.025);
    expect(valuation.dcfInputs.projectedCashFlows.length).toBe(5);
    expect(valuation.dcfInputs.presentValueOfCashFlows).toBeGreaterThan(0);
    expect(valuation.dcfInputs.terminalValue).toBeGreaterThan(0);
    expect(valuation.dcfInputs.enterpriseValue).toBeGreaterThan(0);

    // Multiples
    expect(valuation.multiples.peRatio).toBeGreaterThan(0);
    expect(valuation.multiples.psRatio).toBeGreaterThan(0);
    expect(valuation.multiples.evEbitda).toBeGreaterThan(0);
    expect(valuation.multiples.fcfYield).toBeGreaterThan(0);

    // Qualitative Assessment
    expect(['undervalued', 'fairly_valued', 'overvalued']).toContain(valuation.assessment);
    expect(valuation.summary.length).toBeGreaterThan(0);
    expect(valuation.disclaimer).toBe(FINANCIAL_RESEARCH_DISCLAIMER);
  });

  it('computes quarterly earnings breakdowns for a ticker', () => {
    const earnings = engine.getEarningsBreakdown('NVDA');

    expect(earnings.symbol).toBe('NVDA');
    expect(earnings.quarter).toBeDefined();
    expect(earnings.revenueActual).toBeDefined();
    expect(earnings.epsActual).toBeGreaterThan(0);
    expect(typeof earnings.epsSurprisePercent).toBe('number');
    expect(typeof earnings.revenueYoYGrowth).toBe('number');
    expect(earnings.disclaimer).toBe(FINANCIAL_RESEARCH_DISCLAIMER);
  });
});
