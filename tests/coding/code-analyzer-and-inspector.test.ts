import { describe, it, expect } from 'vitest';
import * as path from 'path';
import { RepositoryInspector } from '../../src/coding/repository-inspector.js';
import { CodeAnalyzer } from '../../src/coding/code-analyzer.js';

describe('Phase 10 - Repository Inspector & Code Analyzer', () => {
  const inspector = new RepositoryInspector();
  const analyzer = new CodeAnalyzer();
  const repoRoot = path.resolve(__dirname, '../..');

  it('should inspect repository and extract tree, languages, and entrypoints', () => {
    const overview = inspector.inspectRepository(repoRoot);

    expect(overview.rootPath).toBe(repoRoot);
    expect(overview.totalFiles).toBeGreaterThan(20);
    expect(overview.totalDirectories).toBeGreaterThan(5);
    expect(overview.languages.TypeScript).toBeDefined();
    expect(overview.languages.TypeScript.percentage).toBeGreaterThan(50);
    expect(overview.entryPoints.length).toBeGreaterThan(0);
    expect(overview.tree.type).toBe('directory');
  });

  it('should search codebase for text query with context lines', () => {
    const searchRes = inspector.searchCode(repoRoot, 'JARVIS Core', {
      contextLines: 2,
      maxMatches: 10,
    });

    expect(searchRes.query).toBe('JARVIS Core');
    expect(searchRes.matchCount).toBeGreaterThan(0);
    expect(searchRes.matches[0].contextLines.length).toBeGreaterThanOrEqual(1);
    expect(searchRes.matches[0].lineContent.toLowerCase()).toContain('jarvis');
  });

  it('should extract symbols, calculate complexity, and estimate maintainability', () => {
    const sampleCode = `
import { IAgent } from './agent.interface.js';

export interface CalculatorConfig {
  precision: number;
}

export class SafeCalculator {
  private precision: number;

  constructor(config: CalculatorConfig) {
    this.precision = config.precision;
  }

  public calculate(a: number, b: number, op: string): number {
    if (op === 'add') {
      return a + b;
    } else if (op === 'sub') {
      return a - b;
    } else if (op === 'mul') {
      return a * b;
    } else {
      throw new Error('Unsupported operation');
    }
  }
}
    `.trim();

    const analysis = analyzer.analyzeCode(sampleCode, 'calculator.ts');

    expect(analysis.language).toBe('TypeScript');
    expect(analysis.symbols.some((s) => s.name === 'SafeCalculator' && s.kind === 'class')).toBe(true);
    expect(analysis.symbols.some((s) => s.name === 'CalculatorConfig' && s.kind === 'interface')).toBe(true);
    expect(analysis.symbols.some((s) => s.name === 'calculate' && s.kind === 'function')).toBe(true);
    expect(analysis.estimatedComplexity).toBeGreaterThanOrEqual(4);
    expect(analysis.maintainabilityScore).toBeGreaterThan(70);
  });

  it('should detect security anti-patterns (eval, hardcoded secrets, prototype pollution)', () => {
    const maliciousCode = `
function dangerous() {
  const apiKey = "sk_live_abcdef1234567890";
  const obj = {};
  obj.__proto__.admin = true;
  return eval("2 + 2");
}
    `.trim();

    const analysis = analyzer.analyzeCode(maliciousCode, 'danger.ts');
    const rules = analysis.potentialIssues.map((i) => i.rule);

    expect(rules).toContain('security/no-eval');
    expect(rules).toContain('security/no-hardcoded-secrets');
    expect(rules).toContain('security/prototype-pollution');

    const review = analyzer.reviewCode(maliciousCode, 'danger.ts');
    expect(review.securityChecksPassed).toBe(false);
    expect(review.summary).toContain('Security audit failed');
  });
});
