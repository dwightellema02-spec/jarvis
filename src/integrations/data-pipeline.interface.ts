export interface DescriptiveStatistics {
  mean: number;
  median: number;
  mode?: number[];
  range: number;
  variance: number;
  standardDeviation: number;
  count: number;
}

export type ChartType = 'bar' | 'line' | 'histogram' | 'scatter' | 'pie' | 'box';

export interface ChartSpec {
  type: ChartType;
  title: string;
  xAxisLabel: string;
  yAxisLabel: string;
  series: {
    name: string;
    data: (number | string)[];
  }[];
}

export interface IDataPipeline {
  cleanData(filePathOrContent: string): Promise<{ cleanedRecords: number; anomaliesRemoved: number }>;
  computeStatistics(values: number[]): DescriptiveStatistics;
  generateChartSpec(dataset: unknown[], chartType: ChartType, options?: Record<string, unknown>): ChartSpec;
}
