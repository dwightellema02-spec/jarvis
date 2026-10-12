/**
 * JARVIS Phase 9 - Data & Statistics Manager
 * End-to-end data analytics orchestration: cleaning, descriptive stats,
 * correlation/regression, hypothesis testing, visualization, and Second Brain synthesis.
 */

import { PermissionManager } from '../security/permission-manager.js';
import { SecurityGuardian } from '../security/guardian.js';
import { AuditLogger } from '../audit/audit-logger.js';
import { ResourceType, PermissionLevel, SecurityDecisionType } from '../security/types.js';
import { SecondBrainManager } from '../memory/second-brain-manager.js';
import {
  DataCleaningOptions,
  CleanedDataset,
  DescriptiveStatistics,
  CorrelationResult,
  RegressionResult,
  HypothesisTestResult,
  ChartConfig,
  ChartOutput,
  DataPipelineRequest,
  DataPipelineResult,
} from './data.interface.js';
import { DataCleaner } from './cleaner.js';
import { StatisticsEngine } from './statistics.js';
import { InferenceEngine } from './inference.js';
import { VisualizerEngine } from './visualizer.js';
import { logger } from '../utils/logger.js';

export class DataStatisticsManager {
  private cleaner: DataCleaner;
  private statsEngine: StatisticsEngine;
  private inferenceEngine: InferenceEngine;
  private visualizer: VisualizerEngine;

  constructor(
    private readonly permissionManager: PermissionManager,
    private readonly guardian: SecurityGuardian,
    private readonly auditLogger: AuditLogger,
    private readonly secondBrain?: SecondBrainManager
  ) {
    this.cleaner = new DataCleaner();
    this.statsEngine = new StatisticsEngine();
    this.inferenceEngine = new InferenceEngine();
    this.visualizer = new VisualizerEngine();
  }

  /**
   * Cleans tabular data from CSV or JSON.
   */
  public cleanData(
    input: { csvContent?: string; jsonData?: Record<string, any>[] },
    options: DataCleaningOptions = {},
    userId = 'default_user'
  ): CleanedDataset {
    this.checkPermission(userId, PermissionLevel.READ, 'read');

    let headers: string[] = [];
    let rows: (string | number | boolean | null)[][] = [];

    if (input.csvContent) {
      const parsed = this.cleaner.parseCsv(input.csvContent);
      headers = parsed.headers;
      rows = parsed.rows;
    } else if (input.jsonData && input.jsonData.length > 0) {
      const parsed = this.cleaner.recordsToTable(input.jsonData);
      headers = parsed.headers;
      rows = parsed.rows;
    } else {
      throw new Error('Either csvContent or jsonData must be provided for data cleaning.');
    }

    return this.cleaner.clean(headers, rows, options);
  }

  /**
   * Computes descriptive statistics on a single column.
   */
  public computeDescriptiveStats(
    column: string,
    dataset: CleanedDataset,
    userId = 'default_user'
  ): DescriptiveStatistics {
    this.checkPermission(userId, PermissionLevel.READ, 'read');

    const colIdx = dataset.headers.indexOf(column);
    if (colIdx === -1) {
      throw new Error(`Column "${column}" not found in dataset.`);
    }

    const numbers = dataset.rows
      .map((r) => Number(r[colIdx]))
      .filter((n) => !isNaN(n) && isFinite(n));

    return this.statsEngine.computeDescriptiveStats(numbers, column);
  }

  /**
   * Computes Pearson & Spearman correlation between two numerical columns.
   */
  public computeCorrelation(
    xColumn: string,
    yColumn: string,
    dataset: CleanedDataset,
    userId = 'default_user'
  ): CorrelationResult {
    this.checkPermission(userId, PermissionLevel.READ, 'read');

    const xIdx = dataset.headers.indexOf(xColumn);
    const yIdx = dataset.headers.indexOf(yColumn);
    if (xIdx === -1) throw new Error(`Column "${xColumn}" not found.`);
    if (yIdx === -1) throw new Error(`Column "${yColumn}" not found.`);

    const xVals = dataset.rows.map((r) => Number(r[xIdx]));
    const yVals = dataset.rows.map((r) => Number(r[yIdx]));

    return this.inferenceEngine.computeCorrelation(xVals, yVals, xColumn, yColumn);
  }

  /**
   * Fits an ordinary least squares linear regression model y = mx + b.
   */
  public computeLinearRegression(
    xColumn: string,
    yColumn: string,
    dataset: CleanedDataset,
    userId = 'default_user'
  ): RegressionResult {
    this.checkPermission(userId, PermissionLevel.READ, 'read');

    const xIdx = dataset.headers.indexOf(xColumn);
    const yIdx = dataset.headers.indexOf(yColumn);
    if (xIdx === -1) throw new Error(`Column "${xColumn}" not found.`);
    if (yIdx === -1) throw new Error(`Column "${yColumn}" not found.`);

    const xVals = dataset.rows.map((r) => Number(r[xIdx]));
    const yVals = dataset.rows.map((r) => Number(r[yIdx]));

    return this.inferenceEngine.computeLinearRegression(xVals, yVals, xColumn, yColumn);
  }

  /**
   * Conducts one-sample or two-sample hypothesis testing.
   */
  public computeHypothesisTest(
    params: {
      type: 'one_sample' | 'two_sample';
      column1: string;
      column2?: string;
      hypothesizedMean?: number;
      alpha?: number;
    },
    dataset: CleanedDataset,
    userId = 'default_user'
  ): HypothesisTestResult {
    this.checkPermission(userId, PermissionLevel.READ, 'read');

    const idx1 = dataset.headers.indexOf(params.column1);
    if (idx1 === -1) throw new Error(`Column "${params.column1}" not found.`);
    const s1 = dataset.rows.map((r) => Number(r[idx1])).filter((n) => !isNaN(n));

    if (params.type === 'one_sample') {
      const mu0 = params.hypothesizedMean !== undefined ? params.hypothesizedMean : 0;
      return this.inferenceEngine.computeOneSampleTTest(s1, mu0, params.alpha || 0.05, params.column1);
    } else {
      if (!params.column2) throw new Error('Two-sample test requires column2.');
      const idx2 = dataset.headers.indexOf(params.column2);
      if (idx2 === -1) throw new Error(`Column "${params.column2}" not found.`);
      const s2 = dataset.rows.map((r) => Number(r[idx2])).filter((n) => !isNaN(n));

      return this.inferenceEngine.computeTwoSampleTTest(s1, s2, params.alpha || 0.05, params.column1, params.column2);
    }
  }

  /**
   * Generates a chart from dataset columns.
   */
  public generateChart(
    config: ChartConfig,
    dataset: CleanedDataset,
    userId = 'default_user'
  ): ChartOutput {
    this.checkPermission(userId, PermissionLevel.READ, 'read');

    let labels: string[] = [];
    let values: number[] = [];
    let xValues: number[] = [];
    let yValues: number[] = [];

    if (config.type === 'bar' || config.type === 'line' || config.type === 'pie') {
      const valCol = config.valuesColumn || config.yColumn || dataset.headers[1];
      const lblCol = config.xColumn || dataset.headers[0];
      const valIdx = dataset.headers.indexOf(valCol);
      const lblIdx = dataset.headers.indexOf(lblCol);

      labels = dataset.rows.map((r) => String(r[lblIdx] ?? ''));
      values = dataset.rows.map((r) => Number(r[valIdx] ?? 0)).filter((n) => !isNaN(n));
    } else if (config.type === 'histogram' || config.type === 'boxplot') {
      const valCol = config.valuesColumn || config.yColumn || dataset.headers[0];
      const valIdx = dataset.headers.indexOf(valCol);
      values = dataset.rows.map((r) => Number(r[valIdx] ?? 0)).filter((n) => !isNaN(n));
    } else if (config.type === 'scatter') {
      const xCol = config.xColumn || dataset.headers[0];
      const yCol = config.yColumn || dataset.headers[1];
      const xIdx = dataset.headers.indexOf(xCol);
      const yIdx = dataset.headers.indexOf(yCol);

      for (const r of dataset.rows) {
        const x = Number(r[xIdx]);
        const y = Number(r[yIdx]);
        if (!isNaN(x) && !isNaN(y)) {
          xValues.push(x);
          yValues.push(y);
        }
      }
    }

    return this.visualizer.generateChart(config, { labels, values, xValues, yValues });
  }

  /**
   * Full Analytics Pipeline: Clean -> Analyze -> Statistics -> Visualize -> Explain.
   */
  public async runPipeline(request: DataPipelineRequest): Promise<DataPipelineResult> {
    const userId = request.userId || 'default_user';
    this.checkPermission(userId, PermissionLevel.READ, 'read');

    // 1. Clean
    const dataset = this.cleanData(
      { csvContent: request.csvContent, jsonData: request.jsonData },
      request.cleaningOptions || {},
      userId
    );

    // 2. Identify numeric columns
    const numericCols = dataset.headers.filter(
      (h) => dataset.columnProfiles[h]?.type === 'numeric'
    );

    // 3. Descriptive Stats
    const descriptiveStatistics: Record<string, DescriptiveStatistics> = {};
    const colsToAnalyze = request.descriptiveColumns || numericCols;

    for (const col of colsToAnalyze) {
      if (dataset.headers.includes(col)) {
        descriptiveStatistics[col] = this.computeDescriptiveStats(col, dataset, userId);
      }
    }

    // 4. Correlations
    const correlations: CorrelationResult[] = [];
    const pairsToCorrelate = request.correlationPairs || [];
    if (pairsToCorrelate.length === 0 && numericCols.length >= 2) {
      pairsToCorrelate.push({ x: numericCols[0], y: numericCols[1] });
    }

    for (const pair of pairsToCorrelate) {
      correlations.push(this.computeCorrelation(pair.x, pair.y, dataset, userId));
    }

    // 5. Regressions
    const regressions: RegressionResult[] = [];
    const pairsToRegress = request.regressionPairs || [];
    if (pairsToRegress.length === 0 && pairsToCorrelate.length > 0) {
      pairsToRegress.push(pairsToCorrelate[0]);
    }

    for (const pair of pairsToRegress) {
      regressions.push(this.computeLinearRegression(pair.x, pair.y, dataset, userId));
    }

    // 6. Hypothesis Tests
    const hypothesisTests: HypothesisTestResult[] = [];
    for (const t of request.hypothesisTests || []) {
      hypothesisTests.push(this.computeHypothesisTest(t, dataset, userId));
    }

    // 7. Charts
    const charts: ChartOutput[] = [];
    const chartConfigs = request.charts || [];

    if (chartConfigs.length === 0) {
      if (numericCols.length >= 2) {
        chartConfigs.push({
          type: 'scatter',
          title: `${numericCols[0]} vs ${numericCols[1]}`,
          xColumn: numericCols[0],
          yColumn: numericCols[1],
        });
      } else if (numericCols.length >= 1) {
        chartConfigs.push({
          type: 'histogram',
          title: `Distribution of ${numericCols[0]}`,
          valuesColumn: numericCols[0],
        });
      }
    }

    for (const conf of chartConfigs) {
      charts.push(this.generateChart(conf, dataset, userId));
    }

    // 8. Generate Narrative Synthesis
    const narrativeReport = this.synthesizeReport(dataset, descriptiveStatistics, correlations, regressions, hypothesisTests);

    // Audit log
    await this.auditLogger.log({
      user: userId,
      requestId: `req_data_${Date.now()}`,
      resource: ResourceType.FILES,
      action: 'read',
      permissionRequired: PermissionLevel.READ,
      permissionGranted: PermissionLevel.READ,
      decision: SecurityDecisionType.ALLOW,
      reason: `Completed data analysis pipeline across ${dataset.cleanedRowCount} records.`,
      result: 'SUCCESS',
      details: {
        originalRows: dataset.originalRowCount,
        cleanedRows: dataset.cleanedRowCount,
        numericColumns: numericCols.length,
      },
    });

    return {
      dataset,
      descriptiveStatistics,
      correlations,
      regressions,
      hypothesisTests,
      charts,
      narrativeReport,
    };
  }

  /**
   * Ingests statistical analysis findings into Second Brain knowledge graph.
   */
  public async ingestAnalysisToSecondBrain(
    title: string,
    pipelineResult: DataPipelineResult,
    userId = 'default_user'
  ): Promise<{ success: boolean; nodeId: string }> {
    if (!this.secondBrain) {
      throw new Error('Second Brain manager is not configured for DataStatisticsManager.');
    }

    this.checkPermission(userId, PermissionLevel.WRITE, 'write', ResourceType.DATABASES);

    const node = await this.secondBrain.index(
      {
        title: `Data Analytics: ${title}`,
        content: pipelineResult.narrativeReport,
        domain: 'study',
        category: 'STATISTICS',
        tags: ['data-analysis', 'statistics', 'empirical-evidence'],
        relationships: [],
      },
      userId
    );

    return {
      success: true,
      nodeId: node.id,
    };
  }

  // --- Private Helpers ---

  private checkPermission(
    userId: string,
    level: PermissionLevel,
    action: any,
    resource: ResourceType = ResourceType.FILES
  ): void {
    const perm = this.permissionManager.checkPermission({
      userId,
      resource,
      action,
      requiredLevel: level,
    });

    if (!perm.allowed) {
      throw new Error(`Permission Denied: User ${userId} is not authorized for data operation (${action}).`);
    }
  }

  private synthesizeReport(
    dataset: CleanedDataset,
    stats: Record<string, DescriptiveStatistics>,
    correlations: CorrelationResult[],
    regressions: RegressionResult[],
    tests: HypothesisTestResult[]
  ): string {
    const statLines = Object.values(stats)
      .map(
        (s) =>
          `- **${s.column}**: Mean = ${s.mean}, Median = ${s.median}, StdDev = ${s.stdDevSample}, Range = [${s.min}, ${s.max}], IQR = ${s.iqr}`
      )
      .join('\n');

    const corrLines = correlations.map((c) => `- ${c.interpretation}`).join('\n') || 'None computed.';
    const regLines = regressions.map((r) => `- ${r.interpretation}`).join('\n') || 'None computed.';
    const testLines = tests.map((t) => `- ${t.conclusion}`).join('\n') || 'None computed.';

    return `
# Executive Statistical Report

## 1. Data Cleaning & Integrity Summary
- **Original Records**: ${dataset.originalRowCount}
- **Cleaned Records**: ${dataset.cleanedRowCount} (Dropped: ${dataset.droppedRows}, Imputed: ${dataset.imputedCells})
- **Outliers Detected**: ${dataset.outliersDetected}

## 2. Descriptive Statistics
${statLines || 'No numeric columns evaluated.'}

## 3. Correlation & Relational Analysis
${corrLines}

## 4. Regression & Predictive Modeling
${regLines}

## 5. Inferential Hypothesis Testing
${testLines}
    `.trim();
  }
}
