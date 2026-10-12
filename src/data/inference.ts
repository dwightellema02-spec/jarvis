/**
 * JARVIS Phase 9 - Inferential & Relational Statistics Engine
 * Implements Pearson correlation, Spearman rank correlation,
 * ordinary least squares linear regression, and Student's t-tests.
 */

import {
  CorrelationResult,
  CorrelationStrength,
  RegressionResult,
  RegressionPrediction,
  HypothesisTestResult,
} from './data.interface.js';

export class InferenceEngine {
  /**
   * Computes Pearson product-moment correlation and Spearman rank correlation.
   */
  public computeCorrelation(x: number[], y: number[], xCol = 'X', yCol = 'Y'): CorrelationResult {
    const pairs: Array<{ x: number; y: number }> = [];
    const len = Math.min(x.length, y.length);

    for (let i = 0; i < len; i++) {
      if (!isNaN(x[i]) && !isNaN(y[i]) && isFinite(x[i]) && isFinite(y[i])) {
        pairs.push({ x: x[i], y: y[i] });
      }
    }

    const n = pairs.length;
    if (n < 2) {
      return {
        xColumn: xCol,
        yColumn: yCol,
        pearsonR: 0,
        pearsonR2: 0,
        spearmanRho: 0,
        strength: 'none',
        direction: 'zero',
        sampleSize: n,
        interpretation: 'Insufficient valid paired observations to compute correlation (minimum n=2 required).',
      };
    }

    const xVals = pairs.map((p) => p.x);
    const yVals = pairs.map((p) => p.y);

    const xMean = xVals.reduce((a, b) => a + b, 0) / n;
    const yMean = yVals.reduce((a, b) => a + b, 0) / n;

    let numerator = 0;
    let denomX = 0;
    let denomY = 0;

    for (let i = 0; i < n; i++) {
      const dx = xVals[i] - xMean;
      const dy = yVals[i] - yMean;
      numerator += dx * dy;
      denomX += dx * dx;
      denomY += dy * dy;
    }

    let pearsonR = 0;
    if (denomX > 0 && denomY > 0) {
      pearsonR = numerator / Math.sqrt(denomX * denomY);
      pearsonR = Math.max(-1, Math.min(1, pearsonR)); // Clamp within [-1, 1]
    }

    // Spearman Rank Correlation
    const xRanks = this.computeRanks(xVals);
    const yRanks = this.computeRanks(yVals);
    const spearmanRho = this.computePearsonDirect(xRanks, yRanks);

    // Interpretations
    const absR = Math.abs(pearsonR);
    let strength: CorrelationStrength = 'none';
    if (absR >= 0.8) strength = 'very_strong';
    else if (absR >= 0.6) strength = 'strong';
    else if (absR >= 0.4) strength = 'moderate';
    else if (absR >= 0.2) strength = 'weak';
    else if (absR > 0.05) strength = 'very_weak';

    const direction: 'positive' | 'negative' | 'zero' =
      pearsonR > 0.01 ? 'positive' : pearsonR < -0.01 ? 'negative' : 'zero';

    const interpretation =
      direction === 'zero'
        ? `No meaningful linear correlation exists between ${xCol} and ${yCol} (r = ${pearsonR.toFixed(4)}).`
        : `A ${strength.replace('_', ' ')} ${direction} correlation (r = ${pearsonR.toFixed(4)}, ρ = ${spearmanRho.toFixed(4)}) exists between ${xCol} and ${yCol}. Approximately ${(pearsonR * pearsonR * 100).toFixed(1)}% of variance in ${yCol} is explained by ${xCol}.`;

    return {
      xColumn: xCol,
      yColumn: yCol,
      pearsonR: this.round(pearsonR),
      pearsonR2: this.round(pearsonR * pearsonR),
      spearmanRho: this.round(spearmanRho),
      strength,
      direction,
      sampleSize: n,
      interpretation,
    };
  }

  /**
   * Computes simple linear regression y = mx + b.
   */
  public computeLinearRegression(x: number[], y: number[], xCol = 'X', yCol = 'Y'): RegressionResult {
    const pairs: Array<{ x: number; y: number }> = [];
    const len = Math.min(x.length, y.length);

    for (let i = 0; i < len; i++) {
      if (!isNaN(x[i]) && !isNaN(y[i]) && isFinite(x[i]) && isFinite(y[i])) {
        pairs.push({ x: x[i], y: y[i] });
      }
    }

    const n = pairs.length;
    if (n < 2) {
      return {
        xColumn: xCol,
        yColumn: yCol,
        slope: 0,
        intercept: 0,
        equation: `${yCol} = 0`,
        r2: 0,
        standardError: 0,
        predictions: [],
        interpretation: 'Insufficient paired data to fit a regression model.',
      };
    }

    const xVals = pairs.map((p) => p.x);
    const yVals = pairs.map((p) => p.y);

    const xMean = xVals.reduce((a, b) => a + b, 0) / n;
    const yMean = yVals.reduce((a, b) => a + b, 0) / n;

    let ssXY = 0;
    let ssXX = 0;
    let ssYY = 0;

    for (let i = 0; i < n; i++) {
      const dx = xVals[i] - xMean;
      const dy = yVals[i] - yMean;
      ssXY += dx * dy;
      ssXX += dx * dx;
      ssYY += dy * dy;
    }

    const slope = ssXX !== 0 ? ssXY / ssXX : 0;
    const intercept = yMean - slope * xMean;

    // Predictions & Residuals
    let ssRes = 0;
    const predictions: RegressionPrediction[] = [];

    for (let i = 0; i < n; i++) {
      const predY = slope * xVals[i] + intercept;
      const res = yVals[i] - predY;
      ssRes += res * res;
      predictions.push({
        x: this.round(xVals[i]),
        actualY: this.round(yVals[i]),
        predictedY: this.round(predY),
        residual: this.round(res),
      });
    }

    const r2 = ssYY > 0 ? Math.max(0, 1 - ssRes / ssYY) : 0;
    const standardError = n > 2 ? Math.sqrt(ssRes / (n - 2)) : 0;

    const sign = intercept >= 0 ? '+' : '-';
    const absIntercept = Math.abs(intercept).toFixed(4);
    const equation = `${yCol} = ${slope.toFixed(4)} * ${xCol} ${sign} ${absIntercept}`;

    const interpretation = `Fitted model: ${equation}. Coefficient of determination R² = ${r2.toFixed(4)}. Each 1 unit increase in ${xCol} corresponds to a ${slope >= 0 ? '+' : ''}${slope.toFixed(4)} unit change in ${yCol}.`;

    return {
      xColumn: xCol,
      yColumn: yCol,
      slope: this.round(slope),
      intercept: this.round(intercept),
      equation,
      r2: this.round(r2),
      standardError: this.round(standardError),
      predictions,
      interpretation,
    };
  }

  /**
   * One-sample Student's t-test: H0: mu = mu0 vs H1: mu != mu0.
   */
  public computeOneSampleTTest(
    sample: number[],
    hypothesizedMean: number,
    alpha = 0.05,
    colName = 'Sample'
  ): HypothesisTestResult {
    const valid = sample.filter((n) => typeof n === 'number' && !isNaN(n) && isFinite(n));
    const n = valid.length;

    if (n < 2) {
      throw new Error('One-sample t-test requires at least 2 observations.');
    }

    const mean = valid.reduce((a, b) => a + b, 0) / n;
    const variance = valid.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / (n - 1);
    const stdDev = Math.sqrt(variance);
    const se = stdDev / Math.sqrt(n);
    const df = n - 1;

    const t = se > 0 ? (mean - hypothesizedMean) / se : 0;
    const pValue = this.approximateTwoTailedPValue(Math.abs(t), df);
    const isSignificant = pValue < alpha;

    // Critical value approximation for 95% CI
    const tCrit = this.approximateTCritical(df, 1 - alpha / 2);
    const ci95: [number, number] = [this.round(mean - tCrit * se), this.round(mean + tCrit * se)];

    const conclusion = isSignificant
      ? `Reject H₀ at α = ${alpha} (t(${df}) = ${t.toFixed(4)}, p = ${pValue.toFixed(4)}). The sample mean (${mean.toFixed(4)}) is statistically significantly different from ${hypothesizedMean}.`
      : `Fail to reject H₀ at α = ${alpha} (t(${df}) = ${t.toFixed(4)}, p = ${pValue.toFixed(4)}). No statistically significant difference detected between the sample mean (${mean.toFixed(4)}) and ${hypothesizedMean}.`;

    return {
      type: 'one_sample_t_test',
      testStatistic: this.round(t),
      degreesOfFreedom: df,
      pValueEstimated: this.round(pValue),
      alpha,
      isSignificant,
      confidenceInterval95: ci95,
      sample1Stats: { mean: this.round(mean), stdDev: this.round(stdDev), n },
      conclusion,
    };
  }

  /**
   * Two-sample independent t-test (Welch's t-test allowing unequal variances).
   */
  public computeTwoSampleTTest(
    sample1: number[],
    sample2: number[],
    alpha = 0.05,
    col1 = 'Group 1',
    col2 = 'Group 2'
  ): HypothesisTestResult {
    const s1 = sample1.filter((n) => typeof n === 'number' && !isNaN(n) && isFinite(n));
    const s2 = sample2.filter((n) => typeof n === 'number' && !isNaN(n) && isFinite(n));

    if (s1.length < 2 || s2.length < 2) {
      throw new Error('Two-sample t-test requires at least 2 observations in each sample.');
    }

    const n1 = s1.length;
    const n2 = s2.length;

    const m1 = s1.reduce((a, b) => a + b, 0) / n1;
    const m2 = s2.reduce((a, b) => a + b, 0) / n2;

    const v1 = s1.reduce((acc, v) => acc + Math.pow(v - m1, 2), 0) / (n1 - 1);
    const v2 = s2.reduce((acc, v) => acc + Math.pow(v - m2, 2), 0) / (n2 - 1);

    const sd1 = Math.sqrt(v1);
    const sd2 = Math.sqrt(v2);

    const seDiff = Math.sqrt(v1 / n1 + v2 / n2);
    const t = seDiff > 0 ? (m1 - m2) / seDiff : 0;

    // Welch-Satterthwaite degrees of freedom
    const num = Math.pow(v1 / n1 + v2 / n2, 2);
    const denom = Math.pow(v1 / n1, 2) / (n1 - 1) + Math.pow(v2 / n2, 2) / (n2 - 1);
    const df = Math.max(1, Math.round(num / denom));

    const pValue = this.approximateTwoTailedPValue(Math.abs(t), df);
    const isSignificant = pValue < alpha;

    const tCrit = this.approximateTCritical(df, 1 - alpha / 2);
    const diff = m1 - m2;
    const ci95: [number, number] = [this.round(diff - tCrit * seDiff), this.round(diff + tCrit * seDiff)];

    const conclusion = isSignificant
      ? `Reject H₀ at α = ${alpha} (Welch's t(${df}) = ${t.toFixed(4)}, p = ${pValue.toFixed(4)}). A statistically significant difference exists between ${col1} (mean ${m1.toFixed(4)}) and ${col2} (mean ${m2.toFixed(4)}).`
      : `Fail to reject H₀ at α = ${alpha} (Welch's t(${df}) = ${t.toFixed(4)}, p = ${pValue.toFixed(4)}). No statistically significant difference detected between ${col1} and ${col2}.`;

    return {
      type: 'two_sample_independent_t_test',
      testStatistic: this.round(t),
      degreesOfFreedom: df,
      pValueEstimated: this.round(pValue),
      alpha,
      isSignificant,
      confidenceInterval95: ci95,
      sample1Stats: { mean: this.round(m1), stdDev: this.round(sd1), n: n1 },
      sample2Stats: { mean: this.round(m2), stdDev: this.round(sd2), n: n2 },
      conclusion,
    };
  }

  // --- Helpers for statistical tests ---

  private computeRanks(arr: number[]): number[] {
    const indexed = arr.map((val, idx) => ({ val, idx }));
    indexed.sort((a, b) => a.val - b.val);

    const ranks: number[] = new Array(arr.length);
    let i = 0;
    while (i < indexed.length) {
      let j = i;
      while (j < indexed.length - 1 && indexed[j + 1].val === indexed[j].val) {
        j++;
      }
      const rankSum = ((i + 1 + (j + 1)) * (j - i + 1)) / 2;
      const avgRank = rankSum / (j - i + 1);
      for (let k = i; k <= j; k++) {
        ranks[indexed[k].idx] = avgRank;
      }
      i = j + 1;
    }
    return ranks;
  }

  private computePearsonDirect(x: number[], y: number[]): number {
    const n = x.length;
    if (n < 2) return 0;
    const xM = x.reduce((a, b) => a + b, 0) / n;
    const yM = y.reduce((a, b) => a + b, 0) / n;
    let num = 0;
    let dX = 0;
    let dY = 0;
    for (let i = 0; i < n; i++) {
      const dx = x[i] - xM;
      const dy = y[i] - yM;
      num += dx * dy;
      dX += dx * dx;
      dY += dy * dy;
    }
    return dX > 0 && dY > 0 ? num / Math.sqrt(dX * dY) : 0;
  }

  /**
   * Approximates two-tailed p-value for Student's t using Hill's approximation.
   */
  private approximateTwoTailedPValue(t: number, df: number): number {
    if (t === 0) return 1.0;
    // For large df (df >= 30), t-distribution approaches standard normal Z
    const z = df > 30 ? t : t * Math.sqrt((df - 0.5) / df);
    // Approximation of standard normal complementary CDF: 2 * (1 - Phi(|z|))
    const b1 = 0.319381530;
    const b2 = -0.356563782;
    const b3 = 1.781477937;
    const b4 = -1.821255978;
    const b5 = 1.330274429;
    const p = 0.2316419;
    const c = 0.39894228;

    const absZ = Math.abs(z);
    const k = 1.0 / (1.0 + p * absZ);
    const pdf = c * Math.exp(-0.5 * absZ * absZ);
    const tail = pdf * (k * (b1 + k * (b2 + k * (b3 + k * (b4 + k * b5)))));

    return Math.max(0.0001, Math.min(1.0, 2.0 * tail));
  }

  private approximateTCritical(df: number, prob: number): number {
    // Normal quantile approximation for prob=0.975 (two-tailed alpha=0.05)
    if (df > 120) return 1.96;
    if (df > 60) return 2.00;
    if (df > 30) return 2.042;
    if (df > 15) return 2.131;
    if (df > 5) return 2.228;
    return 2.571;
  }

  private round(val: number, decimals = 4): number {
    if (!isFinite(val)) return 0;
    return parseFloat(val.toFixed(decimals));
  }
}
