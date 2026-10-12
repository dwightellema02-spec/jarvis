import {
  ParsedTable,
  TabularAnalysisQuery,
  TabularAnalysisResult,
  NumericColumnStats,
  CategoricalColumnStats,
} from '../document.interface.js';

export class TableAnalyzer {
  public static analyze(table: ParsedTable, query?: TabularAnalysisQuery): TabularAnalysisResult {
    let rows = [...table.rows];

    // Apply filtering if requested
    if (query?.filterColumn && query.filterOperator && query.filterValue !== undefined) {
      const colIdx = table.headers.indexOf(query.filterColumn);
      if (colIdx !== -1) {
        rows = rows.filter((r) => this.matchesFilter(r[colIdx], query.filterOperator!, query.filterValue!));
      }
    }

    // Apply sorting
    if (query?.sortBy) {
      const colIdx = table.headers.indexOf(query.sortBy);
      if (colIdx !== -1) {
        const order = query.sortOrder === 'desc' ? -1 : 1;
        rows.sort((a, b) => {
          const valA = a[colIdx];
          const valB = b[colIdx];
          if (valA === null || valA === undefined) return 1;
          if (valB === null || valB === undefined) return -1;
          if (typeof valA === 'number' && typeof valB === 'number') {
            return (valA - valB) * order;
          }
          return String(valA).localeCompare(String(valB)) * order;
        });
      }
    }

    // Apply limit
    if (query?.limit && query.limit > 0) {
      rows = rows.slice(0, query.limit);
    }

    // Generate insights
    const insights = this.generateInsights(table);

    return {
      tableId: table.id,
      tableName: table.name,
      rowCount: table.rowCount,
      columnCount: table.columnCount,
      headers: table.headers,
      columnTypes: table.columnTypes,
      numericSummary: table.numericStats || {},
      categoricalSummary: table.categoricalStats || {},
      filteredRows: query ? rows : undefined,
      insights,
    };
  }

  private static matchesFilter(
    cellValue: string | number | boolean | null,
    operator: string,
    filterValue: string | number
  ): boolean {
    if (cellValue === null || cellValue === undefined) return false;

    switch (operator) {
      case 'eq':
        return cellValue === filterValue || String(cellValue).toLowerCase() === String(filterValue).toLowerCase();
      case 'neq':
        return cellValue !== filterValue;
      case 'gt':
        return Number(cellValue) > Number(filterValue);
      case 'gte':
        return Number(cellValue) >= Number(filterValue);
      case 'lt':
        return Number(cellValue) < Number(filterValue);
      case 'lte':
        return Number(cellValue) <= Number(filterValue);
      case 'contains':
        return String(cellValue).toLowerCase().includes(String(filterValue).toLowerCase());
      default:
        return true;
    }
  }

  private static generateInsights(table: ParsedTable): string[] {
    const insights: string[] = [];

    insights.push(`Dataset contains ${table.rowCount} rows across ${table.columnCount} columns (${table.headers.join(', ')}).`);

    // Check numeric columns
    if (table.numericStats) {
      for (const [col, stats] of Object.entries(table.numericStats)) {
        if (stats.count > 0) {
          insights.push(
            `Column "${col}": Average = ${stats.mean}, Range = [${stats.min} to ${stats.max}] (Sum: ${stats.sum}${
              stats.nullCount > 0 ? `, ${stats.nullCount} missing entries` : ''
            }).`
          );
        }
      }
    }

    // Check categorical columns
    if (table.categoricalStats) {
      for (const [col, stats] of Object.entries(table.categoricalStats)) {
        if (stats.topValues && stats.topValues.length > 0) {
          const top = stats.topValues[0];
          insights.push(
            `Column "${col}": ${stats.distinctCount} distinct values. Most frequent is "${top.value}" (${top.frequency} occurrences).`
          );
        }
      }
    }

    return insights;
  }
}
