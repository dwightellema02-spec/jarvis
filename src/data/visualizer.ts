/**
 * JARVIS Phase 9 - Data Visualization Engine
 * Generates pure Node.js SVG and terminal ASCII visualizations:
 * Bar, Line, Histogram, Scatter, Pie, and Boxplot.
 */

import { ChartConfig, ChartOutput } from './data.interface.js';

export class VisualizerEngine {
  /**
   * Generates both SVG and ASCII representations for a requested chart.
   */
  public generateChart(config: ChartConfig, data: { labels: string[]; values: number[]; xValues?: number[]; yValues?: number[] }): ChartOutput {
    const width = config.width || 600;
    const height = config.height || 400;

    switch (config.type) {
      case 'bar':
        return {
          type: 'bar',
          title: config.title,
          svg: this.renderBarSvg(config.title, data.labels, data.values, width, height),
          ascii: this.renderBarAscii(config.title, data.labels, data.values),
        };
      case 'line':
        return {
          type: 'line',
          title: config.title,
          svg: this.renderLineSvg(config.title, data.labels, data.values, width, height),
          ascii: this.renderLineAscii(config.title, data.labels, data.values),
        };
      case 'histogram':
        return {
          type: 'histogram',
          title: config.title,
          svg: this.renderHistogramSvg(config.title, data.values, config.bins || 6, width, height),
          ascii: this.renderHistogramAscii(config.title, data.values, config.bins || 6),
        };
      case 'scatter':
        return {
          type: 'scatter',
          title: config.title,
          svg: this.renderScatterSvg(config.title, data.xValues || [], data.yValues || [], width, height),
          ascii: this.renderScatterAscii(config.title, data.xValues || [], data.yValues || []),
        };
      case 'pie':
        return {
          type: 'pie',
          title: config.title,
          svg: this.renderPieSvg(config.title, data.labels, data.values, width, height),
          ascii: this.renderPieAscii(config.title, data.labels, data.values),
        };
      case 'boxplot':
        return {
          type: 'boxplot',
          title: config.title,
          svg: this.renderBoxplotSvg(config.title, data.values, width, height),
          ascii: this.renderBoxplotAscii(config.title, data.values),
        };
      default:
        throw new Error(`Unsupported chart type: ${config.type}`);
    }
  }

  // --- SVG Renderers ---

  private renderBarSvg(title: string, labels: string[], values: number[], width: number, height: number): string {
    const margin = { top: 40, right: 30, bottom: 60, left: 60 };
    const chartW = width - margin.left - margin.right;
    const chartH = height - margin.top - margin.bottom;

    const maxVal = Math.max(...values, 1);
    const barWidth = chartW / (values.length || 1) * 0.7;
    const barStep = chartW / (values.length || 1);

    const bars = values.map((val, idx) => {
      const h = (val / maxVal) * chartH;
      const x = margin.left + idx * barStep + (barStep - barWidth) / 2;
      const y = margin.top + chartH - h;
      const label = labels[idx] || `Item ${idx + 1}`;
      return `
        <rect x="${x}" y="${y}" width="${barWidth}" height="${h}" rx="4" fill="#3b82f6" />
        <text x="${x + barWidth / 2}" y="${y - 6}" text-anchor="middle" font-size="11" fill="#cbd5e1">${val}</text>
        <text x="${x + barWidth / 2}" y="${margin.top + chartH + 20}" text-anchor="middle" font-size="11" fill="#94a3b8">${this.truncate(label, 10)}</text>
      `;
    }).join('');

    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" style="background:#0f172a; font-family:sans-serif;">
        <text x="${width / 2}" y="24" text-anchor="middle" font-size="16" font-weight="bold" fill="#f8fafc">${title}</text>
        <!-- Axes -->
        <line x1="${margin.left}" y1="${margin.top + chartH}" x2="${margin.left + chartW}" y2="${margin.top + chartH}" stroke="#334155" stroke-width="2" />
        <line x1="${margin.left}" y1="${margin.top}" x2="${margin.left}" y2="${margin.top + chartH}" stroke="#334155" stroke-width="2" />
        ${bars}
      </svg>
    `.trim();
  }

  private renderLineSvg(title: string, labels: string[], values: number[], width: number, height: number): string {
    const margin = { top: 40, right: 30, bottom: 60, left: 60 };
    const chartW = width - margin.left - margin.right;
    const chartH = height - margin.top - margin.bottom;

    const minVal = Math.min(...values, 0);
    const maxVal = Math.max(...values, 1);
    const range = maxVal - minVal || 1;

    const stepX = chartW / Math.max(values.length - 1, 1);

    const points = values.map((val, idx) => {
      const x = margin.left + idx * stepX;
      const y = margin.top + chartH - ((val - minVal) / range) * chartH;
      return { x, y, val, label: labels[idx] || `${idx + 1}` };
    });

    const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

    const dots = points.map((p) => `
      <circle cx="${p.x}" cy="${p.y}" r="4" fill="#38bdf8" stroke="#0f172a" stroke-width="2" />
      <text x="${p.x}" y="${p.y - 10}" text-anchor="middle" font-size="11" fill="#cbd5e1">${p.val}</text>
      <text x="${p.x}" y="${margin.top + chartH + 20}" text-anchor="middle" font-size="11" fill="#94a3b8">${this.truncate(p.label, 8)}</text>
    `).join('');

    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" style="background:#0f172a; font-family:sans-serif;">
        <text x="${width / 2}" y="24" text-anchor="middle" font-size="16" font-weight="bold" fill="#f8fafc">${title}</text>
        <line x1="${margin.left}" y1="${margin.top + chartH}" x2="${margin.left + chartW}" y2="${margin.top + chartH}" stroke="#334155" stroke-width="2" />
        <line x1="${margin.left}" y1="${margin.top}" x2="${margin.left}" y2="${margin.top + chartH}" stroke="#334155" stroke-width="2" />
        <path d="${pathData}" fill="none" stroke="#0284c7" stroke-width="3" />
        ${dots}
      </svg>
    `.trim();
  }

  private renderHistogramSvg(title: string, values: number[], binCount: number, width: number, height: number): string {
    const margin = { top: 40, right: 30, bottom: 60, left: 60 };
    const chartW = width - margin.left - margin.right;
    const chartH = height - margin.top - margin.bottom;

    if (values.length === 0) return `<svg width="${width}" height="${height}"></svg>`;

    const min = Math.min(...values);
    const max = Math.max(...values);
    const binSize = (max - min) / binCount || 1;

    const bins: number[] = new Array(binCount).fill(0);
    const binRanges: Array<{ start: number; end: number }> = [];

    for (let b = 0; b < binCount; b++) {
      binRanges.push({ start: min + b * binSize, end: min + (b + 1) * binSize });
    }

    for (const v of values) {
      let bIdx = Math.floor((v - min) / binSize);
      if (bIdx >= binCount) bIdx = binCount - 1;
      bins[bIdx]++;
    }

    const maxCount = Math.max(...bins, 1);
    const barWidth = chartW / binCount * 0.9;
    const barStep = chartW / binCount;

    const bars = bins.map((count, idx) => {
      const h = (count / maxCount) * chartH;
      const x = margin.left + idx * barStep + (barStep - barWidth) / 2;
      const y = margin.top + chartH - h;
      const rangeLabel = `${binRanges[idx].start.toFixed(1)}`;
      return `
        <rect x="${x}" y="${y}" width="${barWidth}" height="${h}" rx="2" fill="#10b981" />
        <text x="${x + barWidth / 2}" y="${y - 6}" text-anchor="middle" font-size="11" fill="#cbd5e1">${count}</text>
        <text x="${x + barWidth / 2}" y="${margin.top + chartH + 20}" text-anchor="middle" font-size="10" fill="#94a3b8">${rangeLabel}</text>
      `;
    }).join('');

    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" style="background:#0f172a; font-family:sans-serif;">
        <text x="${width / 2}" y="24" text-anchor="middle" font-size="16" font-weight="bold" fill="#f8fafc">${title}</text>
        <line x1="${margin.left}" y1="${margin.top + chartH}" x2="${margin.left + chartW}" y2="${margin.top + chartH}" stroke="#334155" stroke-width="2" />
        <line x1="${margin.left}" y1="${margin.top}" x2="${margin.left}" y2="${margin.top + chartH}" stroke="#334155" stroke-width="2" />
        ${bars}
      </svg>
    `.trim();
  }

  private renderScatterSvg(title: string, xVals: number[], yVals: number[], width: number, height: number): string {
    const margin = { top: 40, right: 30, bottom: 60, left: 60 };
    const chartW = width - margin.left - margin.right;
    const chartH = height - margin.top - margin.bottom;

    if (xVals.length === 0 || yVals.length === 0) return `<svg width="${width}" height="${height}"></svg>`;

    const minX = Math.min(...xVals);
    const maxX = Math.max(...xVals);
    const rangeX = maxX - minX || 1;

    const minY = Math.min(...yVals);
    const maxY = Math.max(...yVals);
    const rangeY = maxY - minY || 1;

    const points = xVals.map((x, i) => {
      const y = yVals[i];
      const px = margin.left + ((x - minX) / rangeX) * chartW;
      const py = margin.top + chartH - ((y - minY) / rangeY) * chartH;
      return `<circle cx="${px}" cy="${py}" r="5" fill="#f59e0b" fill-opacity="0.8" stroke="#d97706" stroke-width="1.5" />`;
    }).join('');

    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" style="background:#0f172a; font-family:sans-serif;">
        <text x="${width / 2}" y="24" text-anchor="middle" font-size="16" font-weight="bold" fill="#f8fafc">${title}</text>
        <line x1="${margin.left}" y1="${margin.top + chartH}" x2="${margin.left + chartW}" y2="${margin.top + chartH}" stroke="#334155" stroke-width="2" />
        <line x1="${margin.left}" y1="${margin.top}" x2="${margin.left}" y2="${margin.top + chartH}" stroke="#334155" stroke-width="2" />
        ${points}
      </svg>
    `.trim();
  }

  private renderPieSvg(title: string, labels: string[], values: number[], width: number, height: number): string {
    const cx = width / 2 - 80;
    const cy = height / 2 + 10;
    const radius = Math.min(width, height) / 2 - 60;
    const total = values.reduce((a, b) => a + b, 0) || 1;

    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];
    let currentAngle = 0;

    const slices: string[] = [];
    const legendItems: string[] = [];

    values.forEach((val, idx) => {
      const sliceAngle = (val / total) * 2 * Math.PI;
      const startAngle = currentAngle;
      const endAngle = currentAngle + sliceAngle;
      currentAngle = endAngle;

      const x1 = cx + radius * Math.cos(startAngle);
      const y1 = cy + radius * Math.sin(startAngle);
      const x2 = cx + radius * Math.cos(endAngle);
      const y2 = cy + radius * Math.sin(endAngle);
      const largeArc = sliceAngle > Math.PI ? 1 : 0;
      const color = colors[idx % colors.length];

      slices.push(`
        <path d="M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z" fill="${color}" stroke="#0f172a" stroke-width="2" />
      `);

      const pct = ((val / total) * 100).toFixed(1);
      const label = labels[idx] || `Item ${idx + 1}`;
      legendItems.push(`
        <g transform="translate(${width - 150}, ${60 + idx * 24})">
          <rect width="12" height="12" fill="${color}" rx="2" />
          <text x="20" y="10" font-size="12" fill="#cbd5e1">${this.truncate(label, 12)} (${pct}%)</text>
        </g>
      `);
    });

    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" style="background:#0f172a; font-family:sans-serif;">
        <text x="${width / 2}" y="24" text-anchor="middle" font-size="16" font-weight="bold" fill="#f8fafc">${title}</text>
        ${slices.join('')}
        ${legendItems.join('')}
      </svg>
    `.trim();
  }

  private renderBoxplotSvg(title: string, values: number[], width: number, height: number): string {
    const margin = { top: 40, right: 40, bottom: 40, left: 40 };
    const chartW = width - margin.left - margin.right;
    const midY = height / 2;

    if (values.length < 4) return `<svg width="${width}" height="${height}"></svg>`;

    const sorted = [...values].sort((a, b) => a - b);
    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    const range = max - min || 1;

    const q1 = sorted[Math.floor(sorted.length * 0.25)];
    const median = sorted[Math.floor(sorted.length * 0.5)];
    const q3 = sorted[Math.floor(sorted.length * 0.75)];

    const mapX = (v: number) => margin.left + ((v - min) / range) * chartW;

    const xMin = mapX(min);
    const xQ1 = mapX(q1);
    const xMed = mapX(median);
    const xQ3 = mapX(q3);
    const xMax = mapX(max);

    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" style="background:#0f172a; font-family:sans-serif;">
        <text x="${width / 2}" y="24" text-anchor="middle" font-size="16" font-weight="bold" fill="#f8fafc">${title}</text>
        <!-- Whiskers -->
        <line x1="${xMin}" y1="${midY}" x2="${xQ1}" y2="${midY}" stroke="#94a3b8" stroke-width="2" />
        <line x1="${xQ3}" y1="${midY}" x2="${xMax}" y2="${midY}" stroke="#94a3b8" stroke-width="2" />
        <line x1="${xMin}" y1="${midY - 20}" x2="${xMin}" y2="${midY + 20}" stroke="#94a3b8" stroke-width="2" />
        <line x1="${xMax}" y1="${midY - 20}" x2="${xMax}" y2="${midY + 20}" stroke="#94a3b8" stroke-width="2" />
        <!-- Box -->
        <rect x="${xQ1}" y="${midY - 40}" width="${xQ3 - xQ1}" height="80" fill="#6366f1" fill-opacity="0.4" stroke="#818cf8" stroke-width="2" rx="4" />
        <!-- Median -->
        <line x1="${xMed}" y1="${midY - 40}" x2="${xMed}" y2="${midY + 40}" stroke="#f43f5e" stroke-width="3" />
        <!-- Labels -->
        <text x="${xMin}" y="${midY + 40}" text-anchor="middle" font-size="11" fill="#cbd5e1">Min: ${min.toFixed(1)}</text>
        <text x="${xQ1}" y="${midY - 48}" text-anchor="middle" font-size="11" fill="#cbd5e1">Q1: ${q1.toFixed(1)}</text>
        <text x="${xMed}" y="${midY + 40}" text-anchor="middle" font-size="11" fill="#f43f5e">Med: ${median.toFixed(1)}</text>
        <text x="${xQ3}" y="${midY - 48}" text-anchor="middle" font-size="11" fill="#cbd5e1">Q3: ${q3.toFixed(1)}</text>
        <text x="${xMax}" y="${midY + 40}" text-anchor="middle" font-size="11" fill="#cbd5e1">Max: ${max.toFixed(1)}</text>
      </svg>
    `.trim();
  }

  // --- Terminal ASCII Renderers ---

  private renderBarAscii(title: string, labels: string[], values: number[]): string {
    const maxVal = Math.max(...values, 1);
    const maxBarLen = 30;
    const lines = [`[${title}]`];

    labels.forEach((lbl, idx) => {
      const val = values[idx] || 0;
      const barLen = Math.round((val / maxVal) * maxBarLen);
      const bar = '█'.repeat(barLen);
      lines.push(`${lbl.padEnd(12)} | ${bar} ${val}`);
    });

    return lines.join('\n');
  }

  private renderLineAscii(title: string, labels: string[], values: number[]): string {
    const min = Math.min(...values);
    const max = Math.max(...values);
    const lines = [`[${title}] (Range: ${min} to ${max})`];
    labels.forEach((lbl, idx) => {
      lines.push(`• ${lbl}: ${values[idx]}`);
    });
    return lines.join('\n');
  }

  private renderHistogramAscii(title: string, values: number[], binCount: number): string {
    if (values.length === 0) return `[${title}] No data`;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const binSize = (max - min) / binCount || 1;
    const bins: number[] = new Array(binCount).fill(0);

    for (const v of values) {
      let bIdx = Math.floor((v - min) / binSize);
      if (bIdx >= binCount) bIdx = binCount - 1;
      bins[bIdx]++;
    }

    const lines = [`[${title}]`];
    bins.forEach((count, idx) => {
      const start = (min + idx * binSize).toFixed(1);
      const end = (min + (idx + 1) * binSize).toFixed(1);
      const bar = '■'.repeat(count);
      lines.push(`[${start} - ${end}] | ${bar} (${count})`);
    });
    return lines.join('\n');
  }

  private renderScatterAscii(title: string, xVals: number[], yVals: number[]): string {
    const lines = [`[${title}] Pairs (${xVals.length} points)`];
    const previewCount = Math.min(xVals.length, 5);
    for (let i = 0; i < previewCount; i++) {
      lines.push(`(x: ${xVals[i]}, y: ${yVals[i]})`);
    }
    if (xVals.length > previewCount) {
      lines.push(`... and ${xVals.length - previewCount} more`);
    }
    return lines.join('\n');
  }

  private renderPieAscii(title: string, labels: string[], values: number[]): string {
    const total = values.reduce((a, b) => a + b, 0) || 1;
    const lines = [`[${title}]`];
    labels.forEach((lbl, idx) => {
      const val = values[idx] || 0;
      const pct = ((val / total) * 100).toFixed(1);
      lines.push(`${lbl.padEnd(12)}: ${pct}% (${val})`);
    });
    return lines.join('\n');
  }

  private renderBoxplotAscii(title: string, values: number[]): string {
    if (values.length < 4) return `[${title}] Insufficient data`;
    const sorted = [...values].sort((a, b) => a - b);
    const min = sorted[0];
    const q1 = sorted[Math.floor(sorted.length * 0.25)];
    const med = sorted[Math.floor(sorted.length * 0.5)];
    const q3 = sorted[Math.floor(sorted.length * 0.75)];
    const max = sorted[sorted.length - 1];

    return [
      `[${title}]`,
      `Min: ${min.toFixed(2)} | Q1: ${q1.toFixed(2)} | Med: ${med.toFixed(2)} | Q3: ${q3.toFixed(2)} | Max: ${max.toFixed(2)}`,
      `|-----[====|====]-----|`,
    ].join('\n');
  }

  private truncate(str: string, len: number): string {
    return str.length > len ? str.substring(0, len - 1) + '…' : str;
  }
}
