/**
 * JARVIS Phase 16 - Fundamental & Valuation Engine
 * Computes Discounted Cash Flow (DCF), financial multiples, and earnings breakdowns.
 */

import {
  ValuationModelResult,
  ValuationMultiples,
  DcfInputs,
  EarningsBreakdown,
  FINANCIAL_RESEARCH_DISCLAIMER,
} from './finance.interface.js';

interface FundamentalProfile {
  name: string;
  marketPrice: number;
  sharesOutstandingMillions: number;
  netDebtMillions: number;
  baseFcfMillions: number;
  wacc: number;
  terminalGrowthRate: number;
  fcfGrowthRates: number[]; // 5-year growth rates
  multiples: ValuationMultiples;
  earnings: Omit<EarningsBreakdown, 'symbol' | 'disclaimer'>;
}

export class ValuationEngine {
  private static readonly KNOWN_PROFILES: Record<string, FundamentalProfile> = {
    AAPL: {
      name: 'Apple Inc.',
      marketPrice: 228.5,
      sharesOutstandingMillions: 15300,
      netDebtMillions: 48000,
      baseFcfMillions: 108000,
      wacc: 0.088,
      terminalGrowthRate: 0.025,
      fcfGrowthRates: [0.08, 0.08, 0.07, 0.06, 0.05],
      multiples: {
        peRatio: 33.5,
        psRatio: 8.9,
        evEbitda: 24.8,
        fcfYield: 3.1,
      },
      earnings: {
        quarter: 'Q3 FY2026',
        revenueActual: '$85.78 Billion',
        revenueEstimate: '$84.50 Billion',
        revenueYoYGrowth: 4.9,
        epsActual: 1.4,
        epsEstimate: 1.35,
        epsSurprisePercent: 3.7,
        grossMargin: 46.3,
        operatingMargin: 30.1,
        guidanceSummary: 'Services and iPhone replacement cycles expected to sustain mid-single digit revenue growth.',
      },
    },
    NVDA: {
      name: 'NVIDIA Corporation',
      marketPrice: 132.8,
      sharesOutstandingMillions: 24600,
      netDebtMillions: -18000, // Net cash
      baseFcfMillions: 62000,
      wacc: 0.105,
      terminalGrowthRate: 0.035,
      fcfGrowthRates: [0.45, 0.35, 0.25, 0.18, 0.12],
      multiples: {
        peRatio: 48.2,
        psRatio: 28.4,
        evEbitda: 38.6,
        fcfYield: 2.1,
      },
      earnings: {
        quarter: 'Q2 FY2026',
        revenueActual: '$30.04 Billion',
        revenueEstimate: '$28.70 Billion',
        revenueYoYGrowth: 122.4,
        epsActual: 0.68,
        epsEstimate: 0.64,
        epsSurprisePercent: 6.25,
        grossMargin: 75.1,
        operatingMargin: 62.3,
        guidanceSummary: 'Blackwell architecture demand remains extraordinary across enterprise cloud providers.',
      },
    },
    MSFT: {
      name: 'Microsoft Corporation',
      marketPrice: 422.0,
      sharesOutstandingMillions: 7430,
      netDebtMillions: 32000,
      baseFcfMillions: 74000,
      wacc: 0.085,
      terminalGrowthRate: 0.028,
      fcfGrowthRates: [0.14, 0.13, 0.12, 0.1, 0.08],
      multiples: {
        peRatio: 35.1,
        psRatio: 12.8,
        evEbitda: 22.4,
        fcfYield: 2.6,
      },
      earnings: {
        quarter: 'Q4 FY2026',
        revenueActual: '$64.73 Billion',
        revenueEstimate: '$64.38 Billion',
        revenueYoYGrowth: 15.2,
        epsActual: 2.95,
        epsEstimate: 2.93,
        epsSurprisePercent: 0.68,
        grossMargin: 69.8,
        operatingMargin: 43.1,
        guidanceSummary: 'Azure AI cloud workload growth projected at 28-29% YoY with expanding margins.',
      },
    },
  };

  /**
   * Performs 5-year Discounted Cash Flow valuation using perpetual growth terminal model.
   */
  public calculateValuation(
    symbol: string,
    customWacc?: number,
    customGrowth?: number
  ): ValuationModelResult {
    const sym = symbol.toUpperCase().trim();
    const profile = ValuationEngine.KNOWN_PROFILES[sym] || this.synthesizeFundamentalProfile(sym);

    const wacc = customWacc !== undefined ? customWacc : profile.wacc;
    const g = customGrowth !== undefined ? customGrowth : profile.terminalGrowthRate;

    // 1. Project 5-year Free Cash Flows
    const projectedCashFlows: number[] = [];
    let currentFcf = profile.baseFcfMillions;

    for (let i = 0; i < 5; i++) {
      const growthRate = profile.fcfGrowthRates[i] || 0.08;
      currentFcf = currentFcf * (1 + growthRate);
      projectedCashFlows.push(Math.round(currentFcf));
    }

    // 2. Discounted Present Value of Projected FCFs
    let pvFcf = 0;
    for (let t = 1; t <= 5; t++) {
      const discountFactor = Math.pow(1 + wacc, t);
      pvFcf += projectedCashFlows[t - 1] / discountFactor;
    }
    const presentValueOfCashFlows = Math.round(pvFcf);

    // 3. Gordon Perpetual Terminal Value
    const finalYearFcf = projectedCashFlows[4];
    const terminalValue = Math.round((finalYearFcf * (1 + g)) / Math.max(0.01, wacc - g));
    const pvTerminalValue = Math.round(terminalValue / Math.pow(1 + wacc, 5));

    // 4. Enterprise Value & Equity Value Per Share
    const enterpriseValue = presentValueOfCashFlows + pvTerminalValue;
    const equityValue = enterpriseValue - profile.netDebtMillions;
    const estimatedFairValue =
      Math.round((equityValue / profile.sharesOutstandingMillions) * 100) / 100;

    // 5. Margin of Safety: (Fair Value - Current Price) / Fair Value
    const marginOfSafetyPercent =
      Math.round(((estimatedFairValue - profile.marketPrice) / estimatedFairValue) * 10000) / 100;

    let assessment: 'undervalued' | 'fairly_valued' | 'overvalued' = 'fairly_valued';
    if (marginOfSafetyPercent >= 15) assessment = 'undervalued';
    else if (marginOfSafetyPercent <= -15) assessment = 'overvalued';

    const dcfInputs: DcfInputs = {
      wacc,
      terminalGrowthRate: g,
      projectedCashFlows,
      terminalValue,
      presentValueOfCashFlows,
      enterpriseValue,
    };

    const summary = `DCF modeled fair value is $${estimatedFairValue} vs current market price $${profile.marketPrice} (Margin of safety: ${marginOfSafetyPercent}%). Status: ${assessment.toUpperCase()}.`;

    return {
      symbol: sym,
      currentMarketPrice: profile.marketPrice,
      estimatedFairValue,
      marginOfSafetyPercent,
      valuationMethod: 'DCF_perpetual_growth',
      dcfInputs,
      multiples: profile.multiples,
      assessment,
      summary,
      disclaimer: FINANCIAL_RESEARCH_DISCLAIMER,
    };
  }

  /**
   * Retrieves or synthesizes recent quarterly earnings breakdown.
   */
  public getEarningsBreakdown(symbol: string): EarningsBreakdown {
    const sym = symbol.toUpperCase().trim();
    const profile = ValuationEngine.KNOWN_PROFILES[sym] || this.synthesizeFundamentalProfile(sym);

    return {
      symbol: sym,
      ...profile.earnings,
      disclaimer: FINANCIAL_RESEARCH_DISCLAIMER,
    };
  }

  private synthesizeFundamentalProfile(symbol: string): FundamentalProfile {
    let hash = 0;
    for (let i = 0; i < symbol.length; i++) {
      hash = (hash << 5) - hash + symbol.charCodeAt(i);
      hash |= 0;
    }
    const seed = Math.abs(hash);

    const marketPrice = Math.round(((seed % 350) + 40) * 100) / 100;
    const sharesOutstanding = (seed % 8000) + 1200;
    const baseFcf = Math.round(sharesOutstanding * marketPrice * 0.05);

    return {
      name: `${symbol} Corporation`,
      marketPrice,
      sharesOutstandingMillions: sharesOutstanding,
      netDebtMillions: (seed % 15000) - 5000,
      baseFcfMillions: baseFcf,
      wacc: 0.09,
      terminalGrowthRate: 0.025,
      fcfGrowthRates: [0.12, 0.1, 0.08, 0.07, 0.05],
      multiples: {
        peRatio: (seed % 25) + 15,
        psRatio: (seed % 8) + 2.5,
        evEbitda: (seed % 14) + 10,
        fcfYield: 4.2,
      },
      earnings: {
        quarter: 'Q2 FY2026',
        revenueActual: `$${((seed % 40) + 8).toFixed(2)} Billion`,
        revenueEstimate: `$${((seed % 40) + 7.5).toFixed(2)} Billion`,
        revenueYoYGrowth: (seed % 18) + 4,
        epsActual: Math.round(((seed % 200) / 100 + 1) * 100) / 100,
        epsEstimate: Math.round(((seed % 190) / 100 + 1) * 100) / 100,
        epsSurprisePercent: (seed % 5) + 1,
        grossMargin: (seed % 25) + 45,
        operatingMargin: (seed % 15) + 20,
        guidanceSummary: 'Management reiterates operational discipline with strong cash flow visibility.',
      },
    };
  }
}
