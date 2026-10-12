import { describe, it, expect } from 'vitest';
import { CsvParser } from '../../src/documents/parsers/csv-parser.js';
import { TableAnalyzer } from '../../src/documents/parsers/table-analyzer.js';

describe('CSV Parser & Table Analyzer Tests', () => {
  it('parses standard RFC 4180 CSV with headers, quotes, and commas inside cells', () => {
    const csvContent = `id,name,score,status
1,"Doe, John",95.5,true
2,"Smith, Alice",82.0,false
3,"Taylor, Bob",74.5,true`;

    const table = CsvParser.parse(csvContent, { tableName: 'Student Scores' });

    expect(table.name).toBe('Student Scores');
    expect(table.rowCount).toBe(3);
    expect(table.columnCount).toBe(4);
    expect(table.headers).toEqual(['id', 'name', 'score', 'status']);
    expect(table.rows[0]).toEqual([1, 'Doe, John', 95.5, true]);
    expect(table.rows[1][1]).toBe('Smith, Alice');
    expect(table.columnTypes['id']).toBe('number');
    expect(table.columnTypes['name']).toBe('string');
    expect(table.columnTypes['score']).toBe('number');
    expect(table.columnTypes['status']).toBe('boolean');
  });

  it('correctly calculates numeric column statistics (min, max, mean, sum, median, stdDev)', () => {
    const csvContent = `value
10
20
30
40
50`;

    const table = CsvParser.parse(csvContent);
    const stats = table.numericStats!['value'];

    expect(stats.count).toBe(5);
    expect(stats.sum).toBe(150);
    expect(stats.mean).toBe(30);
    expect(stats.min).toBe(10);
    expect(stats.max).toBe(50);
    expect(stats.median).toBe(30);
    expect(stats.stdDev).toBeCloseTo(14.142, 2);
  });

  it('detects semicolons and tabs automatically as delimiters', () => {
    const semiContent = `item;price;quantity\nApple;15.5;10\nOrange;25.0;5`;
    const table = CsvParser.parse(semiContent);

    expect(table.rowCount).toBe(2);
    expect(table.headers).toEqual(['item', 'price', 'quantity']);
    expect(table.rows[0]).toEqual(['Apple', 15.5, 10]);
  });

  it('filters rows using TableAnalyzer operators (gt, gte, lt, lte, eq, contains)', () => {
    const csvContent = `name,score,category
Algebra,92,Math
Calculus,88,Math
World History,75,History
Linear Algebra,95,Math`;

    const table = CsvParser.parse(csvContent);

    const filtered = TableAnalyzer.analyze(table, {
      filterColumn: 'score',
      filterOperator: 'gte',
      filterValue: 90,
    });

    expect(filtered.filteredRows?.length).toBe(2);
    expect(filtered.filteredRows?.[0][0]).toBe('Algebra');
    expect(filtered.filteredRows?.[1][0]).toBe('Linear Algebra');

    const containsFiltered = TableAnalyzer.analyze(table, {
      filterColumn: 'category',
      filterOperator: 'contains',
      filterValue: 'math',
    });
    expect(containsFiltered.filteredRows?.length).toBe(3);
  });

  it('sorts rows descending and generates automated textual insights', () => {
    const csvContent = `topic,mastery
Calculus,85
Geometry,90
Trigonometry,70`;

    const table = CsvParser.parse(csvContent);
    const result = TableAnalyzer.analyze(table, {
      sortBy: 'mastery',
      sortOrder: 'desc',
    });

    expect(result.filteredRows?.[0][0]).toBe('Geometry');
    expect(result.filteredRows?.[1][0]).toBe('Calculus');
    expect(result.filteredRows?.[2][0]).toBe('Trigonometry');

    expect(result.insights.length).toBeGreaterThan(0);
    expect(result.insights.some((i) => i.includes('mastery'))).toBe(true);
  });
});
