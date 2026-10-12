/**
 * JARVIS Phase 9 - Data Cleaner
 * Provides robust tabular data cleaning, type inference, missing value imputation,
 * deduplication, and outlier detection (IQR & Z-Score).
 */

import {
  DataCleaningOptions,
  CleanedDataset,
  ColumnProfile,
  ColumnDataType,
} from './data.interface.js';

export class DataCleaner {
  /**
   * Parse raw CSV text into headers and row matrix.
   */
  public parseCsv(csvText: string): { headers: string[]; rows: (string | number | boolean | null)[][] } {
    const lines = csvText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length === 0) {
      return { headers: [], rows: [] };
    }

    const headers = this.parseCsvLine(lines[0]).map((h) => String(h).trim());
    const rows: (string | number | boolean | null)[][] = [];

    for (let i = 1; i < lines.length; i++) {
      const parsed = this.parseCsvLine(lines[i]);
      // Normalize row length to match headers
      while (parsed.length < headers.length) {
        parsed.push(null);
      }
      rows.push(parsed.slice(0, headers.length));
    }

    return { headers, rows };
  }

  /**
   * Convert array of record objects to tabular headers and rows.
   */
  public recordsToTable(records: Record<string, any>[]): {
    headers: string[];
    rows: (string | number | boolean | null)[][]
  } {
    if (records.length === 0) {
      return { headers: [], rows: [] };
    }

    const headerSet = new Set<string>();
    for (const rec of records) {
      for (const key of Object.keys(rec)) {
        headerSet.add(key);
      }
    }
    const headers = Array.from(headerSet);

    const rows = records.map((rec) => {
      return headers.map((h) => {
        const val = rec[h];
        if (val === undefined || val === null || val === '') return null;
        return this.coerceValue(val);
      });
    });

    return { headers, rows };
  }

  /**
   * Cleans a dataset according to specified options.
   */
  public clean(
    headers: string[],
    rawRows: (string | number | boolean | null)[][],
    options: DataCleaningOptions = {}
  ): CleanedDataset {
    const originalRowCount = rawRows.length;
    let rows = rawRows.map((r) => [...r]);

    // 1. Coerce values and infer column types
    const initialProfiles = this.profileColumns(headers, rows);

    // 2. Deduplication
    let droppedRows = 0;
    if (options.deduplicate) {
      const seen = new Set<string>();
      const deduplicated: (string | number | boolean | null)[][] = [];
      for (const row of rows) {
        const key = JSON.stringify(row);
        if (!seen.has(key)) {
          seen.add(key);
          deduplicated.push(row);
        } else {
          droppedRows++;
        }
      }
      rows = deduplicated;
    }

    // 3. Missing Value Handling
    const missingStrategy = options.missingValueStrategy || 'drop';
    let imputedCells = 0;

    if (missingStrategy === 'drop') {
      const retained: (string | number | boolean | null)[][] = [];
      for (const row of rows) {
        const hasNull = row.some((v) => v === null || v === undefined || (typeof v === 'string' && v.trim() === ''));
        if (hasNull) {
          droppedRows++;
        } else {
          retained.push(row);
        }
      }
      rows = retained;
    } else {
      // Imputation strategy
      for (let colIdx = 0; colIdx < headers.length; colIdx++) {
        const header = headers[colIdx];
        if (options.targetColumns && !options.targetColumns.includes(header)) continue;

        const profile = initialProfiles[header];
        const validValues = rows
          .map((r) => r[colIdx])
          .filter((v): v is string | number | boolean => v !== null && v !== undefined && v !== '');

        let replacement: string | number | boolean | null = null;

        if (missingStrategy === 'constant') {
          replacement = options.imputeConstantValue !== undefined ? options.imputeConstantValue : 0;
        } else if (profile.type === 'numeric' && validValues.length > 0) {
          const numValues = validValues.map((v) => Number(v)).filter((n) => !isNaN(n));
          if (missingStrategy === 'impute-mean') {
            const sum = numValues.reduce((a, b) => a + b, 0);
            replacement = parseFloat((sum / numValues.length).toFixed(4));
          } else if (missingStrategy === 'impute-median') {
            const sorted = [...numValues].sort((a, b) => a - b);
            const mid = Math.floor(sorted.length / 2);
            replacement = sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
          } else if (missingStrategy === 'impute-mode') {
            replacement = this.computeMode(numValues);
          }
        } else if (validValues.length > 0) {
          // Categorical mode
          replacement = this.computeMode(validValues);
        }

        if (replacement !== null) {
          for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
            const current = rows[rowIdx][colIdx];
            if (current === null || current === undefined || (typeof current === 'string' && current.trim() === '')) {
              rows[rowIdx][colIdx] = replacement;
              imputedCells++;
            }
          }
        }
      }
    }

    // 4. Outlier Handling (IQR or Z-Score)
    let outliersDetected = 0;
    const outlierStrategy = options.outlierStrategy || 'none';

    if (outlierStrategy !== 'none' && rows.length >= 4) {
      const threshold = options.outlierThreshold || (outlierStrategy === 'iqr-trim' ? 1.5 : 3.0);
      const outlierRowIndices = new Set<number>();

      for (let colIdx = 0; colIdx < headers.length; colIdx++) {
        const header = headers[colIdx];
        if (options.targetColumns && !options.targetColumns.includes(header)) continue;

        const profile = initialProfiles[header];
        if (profile.type !== 'numeric') continue;

        const numbers = rows.map((r) => Number(r[colIdx])).filter((n) => !isNaN(n));
        if (numbers.length < 4) continue;

        if (outlierStrategy === 'iqr-trim') {
          const sorted = [...numbers].sort((a, b) => a - b);
          const q1 = this.calculatePercentile(sorted, 0.25);
          const q3 = this.calculatePercentile(sorted, 0.75);
          const iqr = q3 - q1;
          const lowerBound = q1 - threshold * iqr;
          const upperBound = q3 + threshold * iqr;

          rows.forEach((r, idx) => {
            const val = Number(r[colIdx]);
            if (!isNaN(val) && (val < lowerBound || val > upperBound)) {
              outlierRowIndices.add(idx);
            }
          });
        } else if (outlierStrategy === 'zscore-trim') {
          const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
          const std = Math.sqrt(numbers.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / numbers.length);
          if (std > 0) {
            rows.forEach((r, idx) => {
              const val = Number(r[colIdx]);
              if (!isNaN(val) && Math.abs((val - mean) / std) > threshold) {
                outlierRowIndices.add(idx);
              }
            });
          }
        }
      }

      outliersDetected = outlierRowIndices.size;
      if (outlierStrategy === 'iqr-trim' || outlierStrategy === 'zscore-trim') {
        rows = rows.filter((_, idx) => !outlierRowIndices.has(idx));
        droppedRows += outliersDetected;
      }
    }

    const finalProfiles = this.profileColumns(headers, rows);

    return {
      headers,
      rows,
      originalRowCount,
      cleanedRowCount: rows.length,
      droppedRows,
      imputedCells,
      outliersDetected,
      columnProfiles: finalProfiles,
    };
  }

  // --- Private Helper Methods ---

  private parseCsvLine(line: string): (string | number | boolean | null)[] {
    const values: (string | number | boolean | null)[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        values.push(this.coerceValue(current.trim()));
        current = '';
      } else {
        current += char;
      }
    }
    values.push(this.coerceValue(current.trim()));

    return values;
  }

  private coerceValue(raw: any): string | number | boolean | null {
    if (raw === undefined || raw === null) return null;
    if (typeof raw === 'number' || typeof raw === 'boolean') return raw;

    const s = String(raw).trim();
    if (s === '' || s.toLowerCase() === 'null' || s.toLowerCase() === 'nan' || s.toLowerCase() === 'n/a') {
      return null;
    }

    if (s.toLowerCase() === 'true') return true;
    if (s.toLowerCase() === 'false') return false;

    // Check if numeric
    if (!isNaN(Number(s)) && !isNaN(parseFloat(s))) {
      return Number(s);
    }

    return s;
  }

  private profileColumns(
    headers: string[],
    rows: (string | number | boolean | null)[][]
  ): Record<string, ColumnProfile> {
    const profiles: Record<string, ColumnProfile> = {};

    for (let c = 0; c < headers.length; c++) {
      const name = headers[c];
      const values = rows.map((r) => r[c]);
      const validValues = values.filter((v) => v !== null && v !== undefined && v !== '');
      const nullCount = values.length - validValues.length;
      const uniqueCount = new Set(validValues.map((v) => String(v))).size;

      // Determine type
      let numericCount = 0;
      let booleanCount = 0;
      let dateCount = 0;

      for (const val of validValues) {
        if (typeof val === 'number') numericCount++;
        else if (typeof val === 'boolean') booleanCount++;
        else if (typeof val === 'string' && !isNaN(Date.parse(val)) && val.length >= 8 && /\d/.test(val)) {
          dateCount++;
        }
      }

      let type: ColumnDataType = 'categorical';
      if (validValues.length > 0) {
        if (numericCount / validValues.length >= 0.8) type = 'numeric';
        else if (booleanCount / validValues.length >= 0.8) type = 'boolean';
        else if (dateCount / validValues.length >= 0.8) type = 'datetime';
      }

      profiles[name] = {
        name,
        type,
        totalCount: values.length,
        nullCount,
        uniqueCount,
        sampleValues: validValues.slice(0, 5),
      };
    }

    return profiles;
  }

  private computeMode<T>(arr: T[]): T | null {
    if (arr.length === 0) return null;
    const freq = new Map<T, number>();
    for (const val of arr) {
      freq.set(val, (freq.get(val) || 0) + 1);
    }
    let maxCount = 0;
    let mode: T = arr[0];
    for (const [val, count] of freq.entries()) {
      if (count > maxCount) {
        maxCount = count;
        mode = val;
      }
    }
    return mode;
  }

  private calculatePercentile(sorted: number[], p: number): number {
    if (sorted.length === 0) return 0;
    const index = (sorted.length - 1) * p;
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index - lower;
    return sorted[lower] * (1 - weight) + sorted[upper] * weight;
  }
}
