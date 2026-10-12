/**
 * JARVIS Phase 9 - Descriptive Statistics Engine
 * Computes comprehensive statistical measures on numeric vectors.
 */

import { DescriptiveStatistics } from './data.interface.js';

export class StatisticsEngine {
  /**
   * Computes all descriptive statistics for a numerical column.
   */
  public computeDescriptiveStats(numbers: number[], columnName = 'value'): DescriptiveStatistics {
    const valid = numbers.filter((n) => typeof n === 'number' && !isNaN(n) && isFinite(n));

    if (valid.length === 0) {
      return {
        column: columnName,
        count: 0,
        mean: 0,
        median: 0,
        modes: [],
        min: 0,
        max: 0,
        range: 0,
        sum: 0,
        varianceSample: 0,
        variancePopulation: 0,
        stdDevSample: 0,
        stdDevPopulation: 0,
        q1: 0,
        q2: 0,
        q3: 0,
        iqr: 0,
        skewness: 0,
        kurtosis: 0,
      };
    }

    const n = valid.length;
    const sorted = [...valid].sort((a, b) => a - b);
    const sum = valid.reduce((acc, v) => acc + v, 0);
    const mean = sum / n;

    // Median
    const median = this.computePercentile(sorted, 0.5);

    // Modes
    const freq = new Map<number, number>();
    let maxFreq = 0;
    for (const v of valid) {
      const c = (freq.get(v) || 0) + 1;
      freq.set(v, c);
      if (c > maxFreq) maxFreq = c;
    }
    const modes = maxFreq > 1
      ? Array.from(freq.entries())
          .filter(([_, count]) => count === maxFreq)
          .map(([val]) => val)
          .sort((a, b) => a - b)
      : [];

    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    const range = max - min;

    // Sum of squared deviations
    const ssDev = valid.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0);
    const variancePopulation = ssDev / n;
    const varianceSample = n > 1 ? ssDev / (n - 1) : 0;
    const stdDevPopulation = Math.sqrt(variancePopulation);
    const stdDevSample = Math.sqrt(varianceSample);

    // Quartiles & IQR
    const q1 = this.computePercentile(sorted, 0.25);
    const q2 = median;
    const q3 = this.computePercentile(sorted, 0.75);
    const iqr = q3 - q1;

    // Skewness (Fisher-Pearson standardized third moment)
    let skewness = 0;
    if (n >= 3 && stdDevSample > 0) {
      const sumCubed = valid.reduce((acc, v) => acc + Math.pow((v - mean) / stdDevSample, 3), 0);
      skewness = (n / ((n - 1) * (n - 2))) * sumCubed;
    }

    // Excess Kurtosis
    let kurtosis = 0;
    if (n >= 4 && stdDevSample > 0) {
      const sumFourth = valid.reduce((acc, v) => acc + Math.pow((v - mean) / stdDevSample, 4), 0);
      const term1 = (n * (n + 1)) / ((n - 1) * (n - 2) * (n - 3));
      const term2 = (3 * Math.pow(n - 1, 2)) / ((n - 2) * (n - 3));
      kurtosis = term1 * sumFourth - term2;
    }

    return {
      column: columnName,
      count: n,
      mean: this.round(mean),
      median: this.round(median),
      modes: modes.map((m) => this.round(m)),
      min: this.round(min),
      max: this.round(max),
      range: this.round(range),
      sum: this.round(sum),
      varianceSample: this.round(varianceSample),
      variancePopulation: this.round(variancePopulation),
      stdDevSample: this.round(stdDevSample),
      stdDevPopulation: this.round(stdDevPopulation),
      q1: this.round(q1),
      q2: this.round(q2),
      q3: this.round(q3),
      iqr: this.round(iqr),
      skewness: this.round(skewness),
      kurtosis: this.round(kurtosis),
    };
  }

  private computePercentile(sorted: number[], p: number): number {
    if (sorted.length === 0) return 0;
    if (sorted.length === 1) return sorted[0];

    const idx = (sorted.length - 1) * p;
    const lower = Math.floor(idx);
    const upper = Math.ceil(idx);
    const weight = idx - lower;

    return sorted[lower] * (1 - weight) + sorted[upper] * weight;
  }

  private round(val: number, decimals = 4): number {
    if (!isFinite(val)) return 0;
    return parseFloat(val.toFixed(decimals));
  }
}
