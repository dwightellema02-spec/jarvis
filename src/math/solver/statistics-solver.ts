/**
 * JARVIS Phase 7 - Statistics & Probability Solver
 * Handles descriptive statistics (mean, median, mode, sample/population variance and std dev, IQR),
 * combinatorics (factorials, permutations, combinations), and probability (Bayes' rule, unions).
 */

import { MathStep } from '../math.interface.js';

export interface DescriptiveStatsResult {
  count: number;
  mean: number;
  median: number;
  modes: number[];
  range: number;
  sampleVariance: number;
  sampleStdDev: number;
  populationVariance: number;
  populationStdDev: number;
  q1: number;
  q3: number;
  iqr: number;
  steps: MathStep[];
}

export interface CombinatoricsResult {
  operation: 'factorial' | 'permutation' | 'combination';
  n: number;
  r?: number;
  value: number;
  steps: MathStep[];
}

export interface ProbabilityResult {
  concept: string;
  probability: number;
  percentage: string;
  steps: MathStep[];
}

export class StatisticsSolver {
  /**
   * Evaluates comprehensive descriptive statistics on a dataset of numbers.
   */
  public analyzeData(data: number[]): DescriptiveStatsResult {
    if (!data || data.length === 0) {
      throw new Error('Data array must contain at least one numeric value.');
    }

    const steps: MathStep[] = [];
    const n = data.length;
    const sorted = [...data].sort((a, b) => a - b);

    steps.push({
      stepNumber: 1,
      title: 'Order Data Ascending',
      expression: `Data (n=${n}): [${sorted.join(', ')}]`,
      explanation: 'Sort observations in non-decreasing order to facilitate positional statistics.',
      ruleApplied: 'Ordered Statistic Array',
    });

    // Mean
    const sum = sorted.reduce((acc, val) => acc + val, 0);
    const mean = sum / n;
    steps.push({
      stepNumber: 2,
      title: 'Arithmetic Mean (x̄)',
      expression: `x̄ = (Σ x) / n = ${sum} / ${n} = ${mean.toFixed(4)}`,
      explanation: 'Sum of all observations divided by total sample size.',
      ruleApplied: 'Sample Mean: x̄ = Σx / n',
    });

    // Median
    let median: number;
    if (n % 2 === 1) {
      median = sorted[Math.floor(n / 2)];
      steps.push({
        stepNumber: 3,
        title: 'Median (Middle Element)',
        expression: `Median = x[${Math.floor(n / 2) + 1}] = ${median}`,
        explanation: 'Since n is odd, the middle element is uniquely identified.',
        ruleApplied: 'Median Definition (Odd n)',
      });
    } else {
      const mid1 = sorted[n / 2 - 1];
      const mid2 = sorted[n / 2];
      median = (mid1 + mid2) / 2;
      steps.push({
        stepNumber: 3,
        title: 'Median (Average of Middle Pair)',
        expression: `Median = (${mid1} + ${mid2}) / 2 = ${median}`,
        explanation: 'Since n is even, take average of the two middle elements.',
        ruleApplied: 'Median Definition (Even n)',
      });
    }

    // Modes
    const freq: Record<number, number> = {};
    let maxFreq = 0;
    for (const val of sorted) {
      freq[val] = (freq[val] || 0) + 1;
      if (freq[val] > maxFreq) maxFreq = freq[val];
    }
    const modes: number[] = [];
    if (maxFreq > 1) {
      for (const [k, v] of Object.entries(freq)) {
        if (v === maxFreq) modes.push(Number(k));
      }
    }

    // Quartiles & IQR
    const q1 = this.getQuantile(sorted, 0.25);
    const q3 = this.getQuantile(sorted, 0.75);
    const iqr = q3 - q1;

    // Variance & Standard Deviation
    const sumSquaredDeviations = sorted.reduce((acc, x) => acc + Math.pow(x - mean, 2), 0);
    const popVar = sumSquaredDeviations / n;
    const popStd = Math.sqrt(popVar);

    const sampVar = n > 1 ? sumSquaredDeviations / (n - 1) : 0;
    const sampStd = Math.sqrt(sampVar);

    steps.push({
      stepNumber: 4,
      title: 'Sample Variance & Standard Deviation (s², s)',
      expression: `s² = Σ(x - x̄)² / (n - 1) = ${sumSquaredDeviations.toFixed(4)} / ${n - 1} = ${sampVar.toFixed(4)}\ns = √s² = ${sampStd.toFixed(4)}`,
      explanation: "Uses Bessel's correction (n - 1) for unbiased sample estimator.",
      ruleApplied: "Bessel's Correction: s = √[Σ(x - x̄)² / (n - 1)]",
    });

    const range = sorted[n - 1] - sorted[0];

    return {
      count: n,
      mean,
      median,
      modes,
      range,
      sampleVariance: sampVar,
      sampleStdDev: sampStd,
      populationVariance: popVar,
      populationStdDev: popStd,
      q1,
      q3,
      iqr,
      steps,
    };
  }

  /**
   * Factorial: n!
   */
  public factorial(n: number): CombinatoricsResult {
    if (n < 0 || !Number.isInteger(n)) {
      throw new Error('Factorial is defined for non-negative integers only.');
    }
    const steps: MathStep[] = [];
    let val = 1;
    for (let i = 2; i <= n; i++) val *= i;

    steps.push({
      stepNumber: 1,
      title: 'Factorial Definition',
      expression: `${n}! = ${n === 0 ? '1' : Array.from({ length: n }, (_, i) => n - i).join(' * ')} = ${val}`,
      explanation: `Product of all positive integers less than or equal to ${n}.`,
      ruleApplied: 'Factorial Formula: n! = n * (n - 1) * ... * 1',
    });

    return { operation: 'factorial', n, value: val, steps };
  }

  /**
   * Permutation: P(n, r) = n! / (n - r)!
   */
  public permutation(n: number, r: number): CombinatoricsResult {
    if (n < 0 || r < 0 || r > n) {
      throw new Error('Requires n >= r >= 0 for permutations.');
    }

    const steps: MathStep[] = [];
    steps.push({
      stepNumber: 1,
      title: 'Permutation Formula Setup',
      expression: `P(${n}, ${r}) = ${n}! / (${n} - ${r})!`,
      explanation: 'Calculates the number of ordered arrangements of r items taken from n distinct items.',
      ruleApplied: 'Permutation: P(n, r) = n! / (n - r)!',
    });

    let val = 1;
    const factorList: number[] = [];
    for (let i = 0; i < r; i++) {
      val *= n - i;
      factorList.push(n - i);
    }

    steps.push({
      stepNumber: 2,
      title: 'Evaluate Cancelled Product',
      expression: `P(${n}, ${r}) = ${factorList.join(' * ')} = ${val}`,
      explanation: `Cancel (${n - r})! from numerator and denominator, leaving product of ${r} descending terms.`,
      ruleApplied: 'Multiplication Principle',
    });

    return { operation: 'permutation', n, r, value: val, steps };
  }

  /**
   * Combination: C(n, r) = n! / [r! (n - r)!]
   */
  public combination(n: number, r: number): CombinatoricsResult {
    if (n < 0 || r < 0 || r > n) {
      throw new Error('Requires n >= r >= 0 for combinations.');
    }

    const steps: MathStep[] = [];
    steps.push({
      stepNumber: 1,
      title: 'Combination Formula Setup',
      expression: `C(${n}, ${r}) = ( ${n} choose ${r} ) = ${n}! / [${r}! * (${n} - ${r})!]`,
      explanation: 'Calculates number of ways to select r items from n without regard to order.',
      ruleApplied: 'Combination: C(n, r) = n! / [r! * (n - r)!]',
    });

    // Symmetry optimization: C(n, r) = C(n, n - r)
    const k = r > n - r ? n - r : r;
    let num = 1;
    let den = 1;
    for (let i = 1; i <= k; i++) {
      num *= n - i + 1;
      den *= i;
    }
    const val = Math.round(num / den);

    steps.push({
      stepNumber: 2,
      title: 'Compute Product with Symmetry',
      expression: `C(${n}, ${r}) = (${Array.from({ length: k }, (_, i) => n - i).join(' * ')}) / (${Array.from({ length: k }, (_, i) => i + 1).join(' * ')}) = ${val}`,
      explanation: 'Divide permutation product by r! to eliminate order permutations.',
      ruleApplied: 'Symmetric Combination Computation',
    });

    return { operation: 'combination', n, r, value: val, steps };
  }

  /**
   * Bayes' Theorem: P(A|B) = [P(B|A) * P(A)] / P(B)
   */
  public solveBayesTheorem(pB_given_A: number, pA: number, pB: number): ProbabilityResult {
    if (pB <= 0 || pA < 0 || pB_given_A < 0) {
      throw new Error('Probabilities must be non-negative and P(B) must be greater than zero.');
    }

    const steps: MathStep[] = [];
    steps.push({
      stepNumber: 1,
      title: "Bayes' Theorem Setup",
      expression: 'P(A|B) = [P(B|A) * P(A)] / P(B)',
      explanation: 'Computes posterior probability of event A given prior evidence of event B.',
      ruleApplied: "Bayes' Theorem",
    });

    const numerator = pB_given_A * pA;
    const posterior = numerator / pB;

    steps.push({
      stepNumber: 2,
      title: 'Substitute Probabilities',
      expression: `P(A|B) = [${pB_given_A} * ${pA}] / ${pB} = ${numerator.toFixed(4)} / ${pB} = ${posterior.toFixed(4)}`,
      explanation: `Multiply conditional probability P(B|A) by prior P(A) and normalize by total evidence P(B).`,
      ruleApplied: 'Posterior Normalization',
    });

    return {
      concept: "Bayes' Rule Posterior Probability",
      probability: posterior,
      percentage: `${(posterior * 100).toFixed(2)}%`,
      steps,
    };
  }

  private getQuantile(sorted: number[], q: number): number {
    const pos = (sorted.length - 1) * q;
    const base = Math.floor(pos);
    const rest = pos - base;
    if (sorted[base + 1] !== undefined) {
      return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
    }
    return sorted[base];
  }
}
