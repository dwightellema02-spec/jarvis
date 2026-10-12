/**
 * JARVIS Phase 9 - Data & Statistics Agent Interfaces
 */

export type ColumnDataType = 'numeric' | 'categorical' | 'boolean' | 'datetime';

export type MissingValueStrategy = 'drop' | 'impute-mean' | 'impute-median' | 'impute-mode' | 'constant';

export type OutlierStrategy = 'none' | 'iqr-trim' | 'zscore-trim' | 'flag';

export interface DataCleaningOptions {
  missingValueStrategy?: MissingValueStrategy;
  imputeConstantValue?: string | number | boolean;
  deduplicate?: boolean;
  outlierStrategy?: OutlierStrategy;
  outlierThreshold?: number; // 1.5 for IQR, 3.0 for Z-score
  targetColumns?: string[];
}

export interface ColumnProfile {
  name: string;
  type: ColumnDataType;
  totalCount: number;
  nullCount: number;
  uniqueCount: number;
  sampleValues: (string | number | boolean | null)[];
}

export interface CleanedDataset {
  headers: string[];
  rows: (string | number | boolean | null)[][];
  originalRowCount: number;
  cleanedRowCount: number;
  droppedRows: number;
  imputedCells: number;
  outliersDetected: number;
  columnProfiles: Record<string, ColumnProfile>;
}

export interface DescriptiveStatistics {
  column: string;
  count: number;
  mean: number;
  median: number;
  modes: number[];
  min: number;
  max: number;
  range: number;
  sum: number;
  varianceSample: number;
  variancePopulation: number;
  stdDevSample: number;
  stdDevPopulation: number;
  q1: number;
  q2: number;
  q3: number;
  iqr: number;
  skewness: number;
  kurtosis: number;
}

export type CorrelationStrength = 'none' | 'very_weak' | 'weak' | 'moderate' | 'strong' | 'very_strong';

export interface CorrelationResult {
  xColumn: string;
  yColumn: string;
  pearsonR: number;
  pearsonR2: number;
  spearmanRho: number;
  strength: CorrelationStrength;
  direction: 'positive' | 'negative' | 'zero';
  sampleSize: number;
  interpretation: string;
}

export interface RegressionPrediction {
  x: number;
  actualY: number;
  predictedY: number;
  residual: number;
}

export interface RegressionResult {
  xColumn: string;
  yColumn: string;
  slope: number;
  intercept: number;
  equation: string;
  r2: number;
  standardError: number;
  predictions: RegressionPrediction[];
  interpretation: string;
}

export interface HypothesisTestResult {
  type: 'one_sample_t_test' | 'two_sample_independent_t_test';
  testStatistic: number; // t
  degreesOfFreedom: number; // df
  pValueEstimated: number;
  alpha: number;
  isSignificant: boolean;
  confidenceInterval95: [number, number];
  sample1Stats: { mean: number; stdDev: number; n: number };
  sample2Stats?: { mean: number; stdDev: number; n: number };
  conclusion: string;
}

export type ChartType = 'bar' | 'line' | 'histogram' | 'scatter' | 'pie' | 'boxplot';

export interface ChartConfig {
  type: ChartType;
  title: string;
  xColumn?: string;
  yColumn?: string;
  valuesColumn?: string;
  bins?: number;
  width?: number;
  height?: number;
}

export interface ChartOutput {
  type: ChartType;
  title: string;
  svg: string;
  ascii: string;
}

export interface DataPipelineRequest {
  csvContent?: string;
  jsonData?: Record<string, any>[];
  cleaningOptions?: DataCleaningOptions;
  descriptiveColumns?: string[];
  correlationPairs?: Array<{ x: string; y: string }>;
  regressionPairs?: Array<{ x: string; y: string }>;
  hypothesisTests?: Array<{
    type: 'one_sample' | 'two_sample';
    column1: string;
    column2?: string;
    hypothesizedMean?: number;
  }>;
  charts?: ChartConfig[];
  userId?: string;
}

export interface DataPipelineResult {
  dataset: CleanedDataset;
  descriptiveStatistics: Record<string, DescriptiveStatistics>;
  correlations: CorrelationResult[];
  regressions: RegressionResult[];
  hypothesisTests: HypothesisTestResult[];
  charts: ChartOutput[];
  narrativeReport: string;
}
