import { describe, it, expect } from 'vitest';
import { DataCleaner } from '../../src/data/cleaner.js';
import { StatisticsEngine } from '../../src/data/statistics.js';

describe('Phase 9 - Data Cleaner & Descriptive Statistics Engine', () => {
  const cleaner = new DataCleaner();
  const stats = new StatisticsEngine();

  it('should parse raw CSV text with quoted values and null handling', () => {
    const csv = `
student_id,name,score,passed
101,"Santos, Maria",88.5,true
102,"Dela Cruz, Juan",,false
103,"Reyes, Ana",92.0,true
    `.trim();

    const parsed = cleaner.parseCsv(csv);
    expect(parsed.headers).toEqual(['student_id', 'name', 'score', 'passed']);
    expect(parsed.rows.length).toBe(3);
    expect(parsed.rows[0][1]).toBe('Santos, Maria');
    expect(parsed.rows[0][2]).toBe(88.5);
    expect(parsed.rows[0][3]).toBe(true);
    expect(parsed.rows[1][2]).toBeNull();
  });

  it('should convert JSON records into tabular headers and rows', () => {
    const records = [
      { id: 1, topic: 'Calculus', score: 95 },
      { id: 2, topic: 'Algebra', score: 88 },
      { id: 3, topic: 'Geometry', score: null },
    ];

    const table = cleaner.recordsToTable(records);
    expect(table.headers).toEqual(['id', 'topic', 'score']);
    expect(table.rows.length).toBe(3);
    expect(table.rows[2][2]).toBeNull();
  });

  it('should drop rows with missing values under drop strategy', () => {
    const headers = ['x', 'y'];
    const rows = [
      [10, 20],
      [null, 30],
      [15, null],
      [25, 40],
    ];

    const cleaned = cleaner.clean(headers, rows, { missingValueStrategy: 'drop' });
    expect(cleaned.cleanedRowCount).toBe(2);
    expect(cleaned.droppedRows).toBe(2);
    expect(cleaned.rows).toEqual([
      [10, 20],
      [25, 40],
    ]);
  });

  it('should impute missing values with column mean or median', () => {
    const headers = ['score'];
    const rows = [[80], [null], [100], [60]]; // Mean: (80 + 100 + 60) / 3 = 80

    const cleanedMean = cleaner.clean(headers, rows, { missingValueStrategy: 'impute-mean' });
    expect(cleanedMean.cleanedRowCount).toBe(4);
    expect(cleanedMean.imputedCells).toBe(1);
    expect(cleanedMean.rows[1][0]).toBe(80);

    const rowsMedian = [[10], [null], [20], [100]]; // Valid: 10, 20, 100 -> Median = 20
    const cleanedMedian = cleaner.clean(headers, rowsMedian, { missingValueStrategy: 'impute-median' });
    expect(cleanedMedian.rows[1][0]).toBe(20);
  });

  it('should deduplicate identical rows', () => {
    const headers = ['item', 'qty'];
    const rows = [
      ['A', 10],
      ['B', 20],
      ['A', 10], // Duplicate
      ['C', 30],
      ['B', 20], // Duplicate
    ];

    const cleaned = cleaner.clean(headers, rows, { deduplicate: true });
    expect(cleaned.cleanedRowCount).toBe(3);
    expect(cleaned.droppedRows).toBe(2);
  });

  it('should detect and trim outliers using the IQR method', () => {
    const headers = ['val'];
    // 10, 12, 13, 14, 15, 16, 17, 18, 100 (100 is an extreme outlier)
    const rows = [[10], [12], [13], [14], [15], [16], [17], [18], [100]];

    const cleaned = cleaner.clean(headers, rows, { outlierStrategy: 'iqr-trim', outlierThreshold: 1.5 });
    expect(cleaned.outliersDetected).toBe(1);
    expect(cleaned.cleanedRowCount).toBe(8);
    expect(cleaned.rows.some((r) => r[0] === 100)).toBe(false);
  });

  it('should compute complete descriptive statistics correctly', () => {
    // Dataset: 2, 4, 4, 4, 5, 5, 7, 9
    // Count = 8, Sum = 40, Mean = 5.0
    // Median = (4 + 5) / 2 = 4.5
    // Mode = [4]
    // Min = 2, Max = 9, Range = 7
    // Sample variance = 4.5714, Sample std = 2.1381
    const dataset = [2, 4, 4, 4, 5, 5, 7, 9];
    const res = stats.computeDescriptiveStats(dataset, 'test_col');

    expect(res.count).toBe(8);
    expect(res.sum).toBe(40);
    expect(res.mean).toBe(5);
    expect(res.median).toBe(4.5);
    expect(res.modes).toEqual([4]);
    expect(res.min).toBe(2);
    expect(res.max).toBe(9);
    expect(res.range).toBe(7);
    expect(res.varianceSample).toBeCloseTo(4.5714, 3);
    expect(res.stdDevSample).toBeCloseTo(2.1381, 3);
    expect(res.q1).toBe(4);
    expect(res.q3).toBe(5.5);
    expect(res.iqr).toBe(1.5);
    expect(res.skewness).toBeDefined();
    expect(res.kurtosis).toBeDefined();
  });
});
