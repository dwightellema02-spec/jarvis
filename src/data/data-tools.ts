/**
 * JARVIS Phase 9 - Data & Statistics Tools
 * Implements ITool instances for registration in ToolRegistry.
 */

import { ITool, ToolDefinition, ToolExecutionContext, ToolExecutionResult } from '../tools/tool.interface.js';
import { ResourceType, PermissionLevel } from '../security/types.js';
import { DataStatisticsManager } from './data-manager.js';

/**
 * 1. DataCleanTool: data.clean
 */
export class DataCleanTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'data.clean',
    name: 'Tabular Data Cleaner',
    description: 'Cleans tabular datasets (CSV/JSON), handles missing values, deduplicates, and trims outliers',
    version: '1.0.0',
    requiredPermissions: [
      { resource: ResourceType.FILES, action: 'read', level: PermissionLevel.READ },
    ],
    parametersSchema: {
      type: 'object',
      properties: {
        csvContent: { type: 'string' },
        jsonData: { type: 'array' },
        cleaningOptions: { type: 'object' },
      },
    },
    status: 'implemented',
  };

  constructor(private readonly manager: DataStatisticsManager) {}

  public async execute(params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const p = params as any;
      const res = this.manager.cleanData(
        { csvContent: p.csvContent, jsonData: p.jsonData },
        p.cleaningOptions,
        context.userId
      );
      return {
        success: true,
        toolId: this.definition.id,
        data: res,
        verified: true,
        executionTimeMs: Date.now() - startTime,
      };
    } catch (err: any) {
      return {
        success: false,
        toolId: this.definition.id,
        error: err.message,
        verified: false,
        executionTimeMs: Date.now() - startTime,
      };
    }
  }
}

/**
 * 2. DataDescriptiveStatsTool: data.descriptive_stats
 */
export class DataDescriptiveStatsTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'data.descriptive_stats',
    name: 'Descriptive Statistics Engine',
    description: 'Computes summary statistics (mean, median, mode, IQR, sample/pop variance, skewness, kurtosis)',
    version: '1.0.0',
    requiredPermissions: [
      { resource: ResourceType.FILES, action: 'read', level: PermissionLevel.READ },
    ],
    parametersSchema: {
      type: 'object',
      properties: {
        csvContent: { type: 'string' },
        jsonData: { type: 'array' },
        column: { type: 'string' },
      },
      required: ['column'],
    },
    status: 'implemented',
  };

  constructor(private readonly manager: DataStatisticsManager) {}

  public async execute(params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const p = params as any;
      const dataset = this.manager.cleanData(
        { csvContent: p.csvContent, jsonData: p.jsonData },
        p.cleaningOptions,
        context.userId
      );
      const res = this.manager.computeDescriptiveStats(p.column, dataset, context.userId);
      return {
        success: true,
        toolId: this.definition.id,
        data: res,
        verified: true,
        executionTimeMs: Date.now() - startTime,
      };
    } catch (err: any) {
      return {
        success: false,
        toolId: this.definition.id,
        error: err.message,
        verified: false,
        executionTimeMs: Date.now() - startTime,
      };
    }
  }
}

/**
 * 3. DataCorrelationRegressionTool: data.correlation_regression
 */
export class DataCorrelationRegressionTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'data.correlation_regression',
    name: 'Correlation & Regression Analyzer',
    description: 'Computes Pearson & Spearman correlation and fits simple ordinary least squares linear regression',
    version: '1.0.0',
    requiredPermissions: [
      { resource: ResourceType.FILES, action: 'read', level: PermissionLevel.READ },
    ],
    parametersSchema: {
      type: 'object',
      properties: {
        csvContent: { type: 'string' },
        jsonData: { type: 'array' },
        xColumn: { type: 'string' },
        yColumn: { type: 'string' },
      },
      required: ['xColumn', 'yColumn'],
    },
    status: 'implemented',
  };

  constructor(private readonly manager: DataStatisticsManager) {}

  public async execute(params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const p = params as any;
      const dataset = this.manager.cleanData(
        { csvContent: p.csvContent, jsonData: p.jsonData },
        p.cleaningOptions,
        context.userId
      );
      const correlation = this.manager.computeCorrelation(p.xColumn, p.yColumn, dataset, context.userId);
      const regression = this.manager.computeLinearRegression(p.xColumn, p.yColumn, dataset, context.userId);
      return {
        success: true,
        toolId: this.definition.id,
        data: { correlation, regression },
        verified: true,
        executionTimeMs: Date.now() - startTime,
      };
    } catch (err: any) {
      return {
        success: false,
        toolId: this.definition.id,
        error: err.message,
        verified: false,
        executionTimeMs: Date.now() - startTime,
      };
    }
  }
}

/**
 * 4. DataHypothesisTestTool: data.hypothesis_test
 */
export class DataHypothesisTestTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'data.hypothesis_test',
    name: 'Inferential Hypothesis Tester',
    description: 'Performs one-sample and two-sample independent Student t-tests with degrees of freedom and p-values',
    version: '1.0.0',
    requiredPermissions: [
      { resource: ResourceType.FILES, action: 'read', level: PermissionLevel.READ },
    ],
    parametersSchema: {
      type: 'object',
      properties: {
        csvContent: { type: 'string' },
        jsonData: { type: 'array' },
        type: { type: 'string', enum: ['one_sample', 'two_sample'] },
        column1: { type: 'string' },
        column2: { type: 'string' },
        hypothesizedMean: { type: 'number' },
        alpha: { type: 'number' },
      },
      required: ['type', 'column1'],
    },
    status: 'implemented',
  };

  constructor(private readonly manager: DataStatisticsManager) {}

  public async execute(params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const p = params as any;
      const dataset = this.manager.cleanData(
        { csvContent: p.csvContent, jsonData: p.jsonData },
        p.cleaningOptions,
        context.userId
      );
      const res = this.manager.computeHypothesisTest(p, dataset, context.userId);
      return {
        success: true,
        toolId: this.definition.id,
        data: res,
        verified: true,
        executionTimeMs: Date.now() - startTime,
      };
    } catch (err: any) {
      return {
        success: false,
        toolId: this.definition.id,
        error: err.message,
        verified: false,
        executionTimeMs: Date.now() - startTime,
      };
    }
  }
}

/**
 * 5. DataVisualizeTool: data.visualize
 */
export class DataVisualizeTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'data.visualize',
    name: 'Statistical Visualizer',
    description: 'Generates SVG and ASCII visual charts (bar, line, histogram, scatter, pie, boxplot)',
    version: '1.0.0',
    requiredPermissions: [
      { resource: ResourceType.FILES, action: 'read', level: PermissionLevel.READ },
    ],
    parametersSchema: {
      type: 'object',
      properties: {
        csvContent: { type: 'string' },
        jsonData: { type: 'array' },
        chartConfig: { type: 'object' },
      },
      required: ['chartConfig'],
    },
    status: 'implemented',
  };

  constructor(private readonly manager: DataStatisticsManager) {}

  public async execute(params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const p = params as any;
      const dataset = this.manager.cleanData(
        { csvContent: p.csvContent, jsonData: p.jsonData },
        p.cleaningOptions,
        context.userId
      );
      const res = this.manager.generateChart(p.chartConfig, dataset, context.userId);
      return {
        success: true,
        toolId: this.definition.id,
        data: res,
        verified: true,
        executionTimeMs: Date.now() - startTime,
      };
    } catch (err: any) {
      return {
        success: false,
        toolId: this.definition.id,
        error: err.message,
        verified: false,
        executionTimeMs: Date.now() - startTime,
      };
    }
  }
}

/**
 * 6. DataPipelineTool: data.pipeline
 */
export class DataPipelineTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'data.pipeline',
    name: 'End-to-End Data Analytics Pipeline',
    description: 'Executes the complete workflow: Clean -> Analyze -> Statistics -> Visualize -> Explain',
    version: '1.0.0',
    requiredPermissions: [
      { resource: ResourceType.FILES, action: 'read', level: PermissionLevel.READ },
    ],
    parametersSchema: {
      type: 'object',
      properties: {
        csvContent: { type: 'string' },
        jsonData: { type: 'array' },
        cleaningOptions: { type: 'object' },
        descriptiveColumns: { type: 'array' },
      },
    },
    status: 'implemented',
  };

  constructor(private readonly manager: DataStatisticsManager) {}

  public async execute(params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const p = params as any;
      const res = await this.manager.runPipeline({
        ...p,
        userId: context.userId,
      });
      return {
        success: true,
        toolId: this.definition.id,
        data: res,
        verified: true,
        executionTimeMs: Date.now() - startTime,
      };
    } catch (err: any) {
      return {
        success: false,
        toolId: this.definition.id,
        error: err.message,
        verified: false,
        executionTimeMs: Date.now() - startTime,
      };
    }
  }
}
