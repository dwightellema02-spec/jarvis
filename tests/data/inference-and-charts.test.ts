import { describe, it, expect } from 'vitest';
import { InferenceEngine } from '../../src/data/inference.js';
import { VisualizerEngine } from '../../src/data/visualizer.js';

describe('Phase 9 - Inferential Statistics & Visualization Engines', () => {
  const inference = new InferenceEngine();
  const visualizer = new VisualizerEngine();

  it('should compute Pearson and Spearman correlation accurately', () => {
    // Perfect positive linear correlation: y = 2x + 1
    const x = [1, 2, 3, 4, 5];
    const y = [3, 5, 7, 9, 11];

    const res = inference.computeCorrelation(x, y, 'Hours', 'Score');
    expect(res.pearsonR).toBe(1);
    expect(res.pearsonR2).toBe(1);
    expect(res.spearmanRho).toBe(1);
    expect(res.strength).toBe('very_strong');
    expect(res.direction).toBe('positive');
    expect(res.interpretation).toContain('Hours');
    expect(res.interpretation).toContain('Score');
  });

  it('should compute inverse negative correlation', () => {
    const x = [1, 2, 3, 4, 5];
    const y = [10, 8, 6, 4, 2];

    const res = inference.computeCorrelation(x, y, 'Absences', 'Score');
    expect(res.pearsonR).toBe(-1);
    expect(res.direction).toBe('negative');
    expect(res.strength).toBe('very_strong');
  });

  it('should fit simple linear regression y = mx + b with R2 and residuals', () => {
    // x: [1, 2, 3, 4, 5], y: [2, 4, 5, 4, 5]
    // xMean = 3, yMean = 4
    // dx = [-2, -1, 0, 1, 2], dy = [-2, 0, 1, 0, 1]
    // ssXY = 4 + 0 + 0 + 0 + 2 = 6, ssXX = 4 + 1 + 0 + 1 + 4 = 10
    // slope = 6 / 10 = 0.6
    // intercept = 4 - 0.6 * 3 = 2.2
    const x = [1, 2, 3, 4, 5];
    const y = [2, 4, 5, 4, 5];

    const reg = inference.computeLinearRegression(x, y, 'StudyHours', 'TestGrade');
    expect(reg.slope).toBeCloseTo(0.6, 3);
    expect(reg.intercept).toBeCloseTo(2.2, 3);
    expect(reg.r2).toBeGreaterThan(0);
    expect(reg.equation).toContain('TestGrade = 0.6000 * StudyHours + 2.2000');
    expect(reg.predictions.length).toBe(5);
    expect(reg.predictions[0].predictedY).toBeCloseTo(2.8, 2);
  });

  it('should compute one-sample t-test against hypothesized mean', () => {
    // Sample: [102, 104, 105, 107, 108], hypothesized mean = 100
    const sample = [102, 104, 105, 107, 108];
    const test = inference.computeOneSampleTTest(sample, 100, 0.05, 'IQ');

    expect(test.type).toBe('one_sample_t_test');
    expect(test.sample1Stats.mean).toBe(105.2);
    expect(test.testStatistic).toBeGreaterThan(0);
    expect(test.degreesOfFreedom).toBe(4);
    expect(test.isSignificant).toBe(true);
    expect(test.conclusion).toContain('Reject H₀');
  });

  it('should compute two-sample Welch t-test for comparing two groups', () => {
    const group1 = [88, 92, 94, 90, 89]; // Mean = 90.6
    const group2 = [75, 78, 80, 74, 76]; // Mean = 76.6

    const test = inference.computeTwoSampleTTest(group1, group2, 0.05, 'Class A', 'Class B');
    expect(test.type).toBe('two_sample_independent_t_test');
    expect(test.sample1Stats.mean).toBe(90.6);
    expect(test.sample2Stats?.mean).toBe(76.6);
    expect(test.isSignificant).toBe(true);
    expect(test.conclusion).toContain('Reject H₀');
  });

  it('should generate SVG and ASCII charts across all supported chart types', () => {
    // 1. Bar Chart
    const bar = visualizer.generateChart(
      { type: 'bar', title: 'LET Subject Averages' },
      { labels: ['GenEd', 'ProfEd', 'Majorship'], values: [84.5, 88.2, 91.4] }
    );
    expect(bar.svg).toContain('<svg');
    expect(bar.svg).toContain('LET Subject Averages');
    expect(bar.ascii).toContain('█');

    // 2. Line Chart
    const line = visualizer.generateChart(
      { type: 'line', title: 'Weekly Progress' },
      { labels: ['W1', 'W2', 'W3'], values: [60, 75, 90] }
    );
    expect(line.svg).toContain('<path');
    expect(line.ascii).toContain('Weekly Progress');

    // 3. Histogram
    const hist = visualizer.generateChart(
      { type: 'histogram', title: 'Score Distribution', bins: 4 },
      { labels: [], values: [55, 62, 70, 78, 85, 88, 92, 95] }
    );
    expect(hist.svg).toContain('Score Distribution');
    expect(hist.ascii).toContain('■');

    // 4. Scatter Plot
    const scatter = visualizer.generateChart(
      { type: 'scatter', title: 'Hours vs Scores' },
      { labels: [], values: [], xValues: [1, 2, 3, 4], yValues: [10, 20, 30, 40] }
    );
    expect(scatter.svg).toContain('<circle');
    expect(scatter.ascii).toContain('Hours vs Scores');

    // 5. Pie Chart
    const pie = visualizer.generateChart(
      { type: 'pie', title: 'Competency Weight' },
      { labels: ['Algebra', 'Geometry', 'Calculus'], values: [20, 20, 20] }
    );
    expect(pie.svg).toContain('<path');
    expect(pie.ascii).toContain('33.3%');

    // 6. Boxplot
    const boxplot = visualizer.generateChart(
      { type: 'boxplot', title: 'Class Dispersion' },
      { labels: [], values: [50, 65, 75, 80, 85, 90, 95, 100] }
    );
    expect(boxplot.svg).toContain('Class Dispersion');
    expect(boxplot.ascii).toContain('Min:');
    expect(boxplot.ascii).toContain('Med:');
  });
});
