/**
 * JARVIS Phase 16 - Macroeconomic & Economic Overview Engine
 * Synthesizes inflation, interest rates, yield curve spreads, recession signals, and macro regimes.
 */

import { MacroEconomicOverview, FINANCIAL_RESEARCH_DISCLAIMER } from './finance.interface.js';

export class MacroEconomicEngine {
  /**
   * Generates macroeconomic overview with current indicators, yield curve analysis, and market implications.
   */
  public getMacroOverview(): MacroEconomicOverview {
    const indicators = {
      cpiInflationYoY: 2.7, // 2.7% CPI YoY
      fedFundsRate: 4.75, // 4.75% benchmark target
      treasury10Y2YSpread: 0.18, // +18 bps un-inverting yield curve
      gdpGrowthAnnual: 2.3, // 2.3% Real GDP
      unemploymentRate: 4.1, // 4.1% U3 Unemployment
    };

    let yieldCurveStatus: 'inverted' | 'flat' | 'normal' = 'normal';
    if (indicators.treasury10Y2YSpread < 0) {
      yieldCurveStatus = 'inverted';
    } else if (indicators.treasury10Y2YSpread <= 0.15) {
      yieldCurveStatus = 'flat';
    }

    let recessionRiskAssessment: 'low' | 'moderate' | 'elevated' | 'high' = 'moderate';
    if (yieldCurveStatus === 'inverted') {
      recessionRiskAssessment = 'elevated';
    } else if (indicators.unemploymentRate > 4.5 && indicators.gdpGrowthAnnual < 1.0) {
      recessionRiskAssessment = 'high';
    } else if (indicators.gdpGrowthAnnual > 2.0 && indicators.cpiInflationYoY < 3.0) {
      recessionRiskAssessment = 'low';
    }

    let macroRegime: 'stagflation' | 'expansion' | 'disinflationary_boom' | 'contraction' = 'disinflationary_boom';
    if (indicators.cpiInflationYoY > 4.0 && indicators.gdpGrowthAnnual < 1.5) {
      macroRegime = 'stagflation';
    } else if (indicators.gdpGrowthAnnual < 0.5) {
      macroRegime = 'contraction';
    } else if (indicators.cpiInflationYoY < 3.0 && indicators.gdpGrowthAnnual >= 2.0) {
      macroRegime = 'disinflationary_boom';
    } else {
      macroRegime = 'expansion';
    }

    const marketImplications: string[] = [
      `Yield curve is currently ${yieldCurveStatus.toUpperCase()} (${indicators.treasury10Y2YSpread > 0 ? '+' : ''}${indicators.treasury10Y2YSpread}% spread), indicating normalizing duration premium.`,
      `Fed Funds Rate at ${indicators.fedFundsRate}% maintains positive real yield buffer against ${indicators.cpiInflationYoY}% CPI inflation.`,
      'Equities: Quality cash-flow compounders and enterprise AI infrastructure remain favorable in disinflationary regimes.',
      'Fixed Income: Intermediate duration bonds offer attractive real yield with protection against macroeconomic volatility.',
      'Cash / Short-term Bills: Yields remain competitive, reducing urgency for excessive speculative risk.',
    ];

    return {
      indicators,
      yieldCurveStatus,
      recessionRiskAssessment,
      macroRegime,
      marketImplications,
      disclaimer: FINANCIAL_RESEARCH_DISCLAIMER,
    };
  }
}
