import { ParsedTable, NumericColumnStats, CategoricalColumnStats } from '../document.interface.js';

export interface CsvParseOptions {
  delimiter?: string;
  hasHeaders?: boolean;
  tableName?: string;
}

export class CsvParser {
  /**
   * RFC 4180 compliant CSV parser with support for quotes, escaped quotes, and multiline values.
   */
  public static parse(content: string, options: CsvParseOptions = {}): ParsedTable {
    const raw = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const delimiter = options.delimiter || this.detectDelimiter(raw);
    const hasHeaders = options.hasHeaders ?? true;

    const rawRows = this.tokenizeCsv(raw, delimiter);
    if (rawRows.length === 0) {
      return {
        id: `tbl_${Date.now()}`,
        name: options.tableName || 'Empty Table',
        headers: [],
        rows: [],
        rowCount: 0,
        columnCount: 0,
        columnTypes: {},
      };
    }

    let headers: string[] = [];
    let dataRows: (string | number | boolean | null)[][] = [];

    if (hasHeaders && rawRows.length > 0) {
      headers = rawRows[0].map((h, i) => (h && h.trim() ? h.trim() : `Column_${i + 1}`));
      dataRows = rawRows.slice(1).map((r) => this.typeCastRow(r));
    } else {
      const maxCols = Math.max(...rawRows.map((r) => r.length), 0);
      headers = Array.from({ length: maxCols }, (_, i) => `Column_${i + 1}`);
      dataRows = rawRows.map((r) => this.typeCastRow(r));
    }

    // Infer column types
    const columnTypes: Record<string, 'number' | 'string' | 'boolean' | 'date'> = {};
    for (let colIdx = 0; colIdx < headers.length; colIdx++) {
      const headerName = headers[colIdx];
      columnTypes[headerName] = this.inferColumnType(dataRows, colIdx);
    }

    // Compute stats
    const numericStats: Record<string, NumericColumnStats> = {};
    const categoricalStats: Record<string, CategoricalColumnStats> = {};

    for (let colIdx = 0; colIdx < headers.length; colIdx++) {
      const headerName = headers[colIdx];
      const type = columnTypes[headerName];
      if (type === 'number') {
        numericStats[headerName] = this.computeNumericStats(dataRows, colIdx);
      } else {
        categoricalStats[headerName] = this.computeCategoricalStats(dataRows, colIdx);
      }
    }

    return {
      id: `tbl_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: options.tableName || 'CSV Table',
      headers,
      rows: dataRows,
      rowCount: dataRows.length,
      columnCount: headers.length,
      columnTypes,
      numericStats,
      categoricalStats,
    };
  }

  private static detectDelimiter(content: string): string {
    const firstLines = content.split('\n').slice(0, 5).join('\n');
    const counts = {
      ',': (firstLines.match(/,/g) || []).length,
      ';': (firstLines.match(/;/g) || []).length,
      '\t': (firstLines.match(/\t/g) || []).length,
      '|': (firstLines.match(/\|/g) || []).length,
    };

    let maxDelim = ',';
    let maxCount = counts[','];
    for (const [delim, count] of Object.entries(counts)) {
      if (count > maxCount) {
        maxCount = count;
        maxDelim = delim;
      }
    }
    return maxDelim;
  }

  private static tokenizeCsv(text: string, delimiter: string): string[][] {
    const rows: string[][] = [];
    let currentRow: string[] = [];
    let currentCell = '';
    let inQuotes = false;

    let i = 0;
    while (i < text.length) {
      const char = text[i];
      const nextChar = text[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          currentCell += '"';
          i += 2;
          continue;
        }
        inQuotes = !inQuotes;
        i++;
        continue;
      }

      if (!inQuotes && char === delimiter) {
        currentRow.push(currentCell.trim());
        currentCell = '';
        i++;
        continue;
      }

      if (!inQuotes && char === '\n') {
        currentRow.push(currentCell.trim());
        if (currentRow.some((c) => c.length > 0)) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentCell = '';
        i++;
        continue;
      }

      currentCell += char;
      i++;
    }

    if (currentCell.length > 0 || currentRow.length > 0) {
      currentRow.push(currentCell.trim());
      if (currentRow.some((c) => c.length > 0)) {
        rows.push(currentRow);
      }
    }

    return rows;
  }

  private static typeCastRow(rawCells: string[]): (string | number | boolean | null)[] {
    return rawCells.map((val) => {
      if (val === '' || val.toLowerCase() === 'null' || val.toLowerCase() === 'na' || val.toLowerCase() === 'n/a') {
        return null;
      }
      if (val.toLowerCase() === 'true') return true;
      if (val.toLowerCase() === 'false') return false;

      // Check number (strip optional commas in thousands)
      const sanitizedNum = val.replace(/,/g, '');
      if (/^-?\d+(\.\d+)?$/.test(sanitizedNum)) {
        const num = Number(sanitizedNum);
        if (!isNaN(num)) return num;
      }

      return val;
    });
  }

  private static inferColumnType(
    rows: (string | number | boolean | null)[][],
    colIdx: number
  ): 'number' | 'string' | 'boolean' | 'date' {
    let numberCount = 0;
    let booleanCount = 0;
    let dateCount = 0;
    let validCount = 0;

    for (const row of rows) {
      const val = row[colIdx];
      if (val === null || val === undefined) continue;
      validCount++;

      if (typeof val === 'number') {
        numberCount++;
      } else if (typeof val === 'boolean') {
        booleanCount++;
      } else if (typeof val === 'string') {
        if (!isNaN(Date.parse(val)) && (val.includes('-') || val.includes('/'))) {
          dateCount++;
        }
      }
    }

    if (validCount === 0) return 'string';
    if (numberCount / validCount > 0.8) return 'number';
    if (booleanCount / validCount > 0.8) return 'boolean';
    if (dateCount / validCount > 0.8) return 'date';
    return 'string';
  }

  private static computeNumericStats(
    rows: (string | number | boolean | null)[][],
    colIdx: number
  ): NumericColumnStats {
    const nums: number[] = [];
    let nullCount = 0;

    for (const row of rows) {
      const val = row[colIdx];
      if (typeof val === 'number') {
        nums.push(val);
      } else {
        nullCount++;
      }
    }

    if (nums.length === 0) {
      return { count: 0, nullCount, sum: 0, mean: 0, min: 0, max: 0 };
    }

    nums.sort((a, b) => a - b);
    const sum = nums.reduce((acc, n) => acc + n, 0);
    const mean = sum / nums.length;
    const min = nums[0];
    const max = nums[nums.length - 1];

    let median = 0;
    const mid = Math.floor(nums.length / 2);
    if (nums.length % 2 === 0) {
      median = (nums[mid - 1] + nums[mid]) / 2;
    } else {
      median = nums[mid];
    }

    const variance = nums.reduce((acc, n) => acc + Math.pow(n - mean, 2), 0) / nums.length;
    const stdDev = Math.sqrt(variance);

    return {
      count: nums.length,
      nullCount,
      sum: Math.round(sum * 1000) / 1000,
      mean: Math.round(mean * 1000) / 1000,
      min,
      max,
      median: Math.round(median * 1000) / 1000,
      stdDev: Math.round(stdDev * 1000) / 1000,
    };
  }

  private static computeCategoricalStats(
    rows: (string | number | boolean | null)[][],
    colIdx: number
  ): CategoricalColumnStats {
    const freq: Map<string, number> = new Map();
    let count = 0;

    for (const row of rows) {
      const val = row[colIdx];
      if (val === null || val === undefined) continue;
      count++;
      const strVal = String(val);
      freq.set(strVal, (freq.get(strVal) || 0) + 1);
    }

    const sortedEntries = Array.from(freq.entries()).sort((a, b) => b[1] - a[1]);
    const topValues = sortedEntries.slice(0, 5).map(([value, frequency]) => ({ value, frequency }));

    return {
      count,
      distinctCount: freq.size,
      topValues,
    };
  }
}
