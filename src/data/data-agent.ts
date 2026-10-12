/**
 * JARVIS Phase 9 - Data & Statistics Agent
 * Implements IAgent for data cleaning, descriptive stats,
 * correlation, regression, hypothesis testing, and chart generation.
 */

import {
  IAgent,
  AgentDefinition,
  AgentExecutionContext,
  AgentExecutionResult,
} from '../agents/agent.interface.js';
import { PermissionLevel, ResourceType } from '../security/types.js';
import { DataStatisticsManager } from './data-manager.js';
import {
  DataCleaningOptions,
  ChartConfig,
} from './data.interface.js';

export interface DataAgentInput {
  action:
    | 'clean_data'
    | 'descriptive_stats'
    | 'correlation'
    | 'regression'
    | 'hypothesis_test'
    | 'visualize'
    | 'pipeline'
    | 'ingest_to_second_brain';
  csvContent?: string;
  jsonData?: Record<string, any>[];
  column?: string;
  xColumn?: string;
  yColumn?: string;
  cleaningOptions?: DataCleaningOptions;
  testParams?: {
    type: 'one_sample' | 'two_sample';
    column1: string;
    column2?: string;
    hypothesizedMean?: number;
    alpha?: number;
  };
  chartConfig?: ChartConfig;
  title?: string;
}

export class DataStatisticsAgent implements IAgent {
  public readonly definition: AgentDefinition = {
    id: 'data-statistics-agent',
    name: 'Data & Statistics Agent',
    description:
      'Performs real data cleaning, descriptive statistics (mean, median, mode, IQR, skewness, kurtosis), Pearson/Spearman correlation, linear regression, t-tests, and SVG/ASCII visualization',
    version: '1.0.0',
    capabilities: [
      'compute_descriptive_stats',
      'clean_dataset',
      'generate_charts',
      'correlation_analysis',
      'regression_modeling',
      'hypothesis_testing',
      'data_pipeline',
    ],
    requiredPermissions: [
      { resource: ResourceType.FILES, action: 'read', level: PermissionLevel.READ },
    ],
    inputSchema: { type: 'object' },
    outputSchema: { type: 'object' },
    status: 'implemented',
  };

  constructor(private readonly manager: DataStatisticsManager) {}

  public async execute(rawInput: unknown, context: AgentExecutionContext): Promise<AgentExecutionResult> {
    const startTime = Date.now();
    try {
      const input = (rawInput || {}) as DataAgentInput;
      let resultData: any;

      switch (input.action) {
        case 'clean_data': {
          resultData = this.manager.cleanData(
            { csvContent: input.csvContent, jsonData: input.jsonData },
            input.cleaningOptions,
            context.userId
          );
          break;
        }

        case 'descriptive_stats': {
          if (!input.column) throw new Error('Action "descriptive_stats" requires "column".');
          const dataset = this.manager.cleanData(
            { csvContent: input.csvContent, jsonData: input.jsonData },
            input.cleaningOptions,
            context.userId
          );
          resultData = this.manager.computeDescriptiveStats(input.column, dataset, context.userId);
          break;
        }

        case 'correlation': {
          if (!input.xColumn || !input.yColumn) {
            throw new Error('Action "correlation" requires "xColumn" and "yColumn".');
          }
          const dataset = this.manager.cleanData(
            { csvContent: input.csvContent, jsonData: input.jsonData },
            input.cleaningOptions,
            context.userId
          );
          resultData = this.manager.computeCorrelation(input.xColumn, input.yColumn, dataset, context.userId);
          break;
        }

        case 'regression': {
          if (!input.xColumn || !input.yColumn) {
            throw new Error('Action "regression" requires "xColumn" and "yColumn".');
          }
          const dataset = this.manager.cleanData(
            { csvContent: input.csvContent, jsonData: input.jsonData },
            input.cleaningOptions,
            context.userId
          );
          resultData = this.manager.computeLinearRegression(input.xColumn, input.yColumn, dataset, context.userId);
          break;
        }

        case 'hypothesis_test': {
          if (!input.testParams) throw new Error('Action "hypothesis_test" requires "testParams".');
          const dataset = this.manager.cleanData(
            { csvContent: input.csvContent, jsonData: input.jsonData },
            input.cleaningOptions,
            context.userId
          );
          resultData = this.manager.computeHypothesisTest(input.testParams, dataset, context.userId);
          break;
        }

        case 'visualize': {
          if (!input.chartConfig) throw new Error('Action "visualize" requires "chartConfig".');
          const dataset = this.manager.cleanData(
            { csvContent: input.csvContent, jsonData: input.jsonData },
            input.cleaningOptions,
            context.userId
          );
          resultData = this.manager.generateChart(input.chartConfig, dataset, context.userId);
          break;
        }

        case 'pipeline':
        default: {
          resultData = await this.manager.runPipeline({
            csvContent: input.csvContent,
            jsonData: input.jsonData,
            cleaningOptions: input.cleaningOptions,
            userId: context.userId,
          });
          break;
        }
      }

      return {
        success: true,
        agentId: this.definition.id,
        data: resultData,
        executionTimeMs: Date.now() - startTime,
      };
    } catch (err: any) {
      return {
        success: false,
        agentId: this.definition.id,
        error: err.message || 'Data & Statistics agent execution failed',
        executionTimeMs: Date.now() - startTime,
      };
    }
  }
}
