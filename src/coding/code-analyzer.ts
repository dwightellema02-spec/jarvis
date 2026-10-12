/**
 * JARVIS Phase 10 - Code Analyzer & Reviewer
 * Extracts symbols, estimates cyclomatic complexity, audits security anti-patterns,
 * and generates structured code reviews.
 */

import {
  CodeAnalysisResult,
  CodeSymbol,
  CodeReviewReport,
  CodeReviewRuleCheck,
} from './coding.interface.js';

export class CodeAnalyzer {
  /**
   * Analyzes source code file contents and extracts architectural metrics.
   */
  public analyzeCode(content: string, filePath = 'file.ts'): CodeAnalysisResult {
    const lines = content.split(/\r?\n/);
    let commentLineCount = 0;
    let blankLineCount = 0;
    let inBlockComment = false;

    const imports: string[] = [];
    const exports: string[] = [];
    const symbols: CodeSymbol[] = [];
    const potentialIssues: CodeAnalysisResult['potentialIssues'] = [];

    let complexityPoints = 1; // Base complexity

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      const lineNum = i + 1;

      // Blank line check
      if (trimmed === '') {
        blankLineCount++;
        continue;
      }

      // Comment tracking
      if (inBlockComment) {
        commentLineCount++;
        if (trimmed.includes('*/')) inBlockComment = false;
        continue;
      }
      if (trimmed.startsWith('/*')) {
        commentLineCount++;
        if (!trimmed.includes('*/')) inBlockComment = true;
        continue;
      }
      if (trimmed.startsWith('//') || trimmed.startsWith('#')) {
        commentLineCount++;
        continue;
      }

      // 1. Imports
      if (trimmed.startsWith('import ') || trimmed.startsWith('from ')) {
        imports.push(trimmed);
      }

      // 2. Exports
      if (trimmed.startsWith('export ')) {
        exports.push(trimmed);
      }

      // 3. Symbol Extraction (Regex heuristic for TS/JS/Python)
      // Classes
      const classMatch = trimmed.match(/(?:export\s+)?class\s+([A-Za-z0-9_]+)/);
      if (classMatch) {
        symbols.push({ name: classMatch[1], kind: 'class', line: lineNum, signature: trimmed });
      }

      // Interfaces
      const ifaceMatch = trimmed.match(/(?:export\s+)?interface\s+([A-Za-z0-9_]+)/);
      if (ifaceMatch) {
        symbols.push({ name: ifaceMatch[1], kind: 'interface', line: lineNum, signature: trimmed });
      }

      // Functions & Methods
      const fnMatch = trimmed.match(/(?:async\s+)?(?:function\s+([A-Za-z0-9_]+)|(?:public|private|protected)?\s*(?:async\s+)?([A-Za-z0-9_]+)\s*\()/);
      if (fnMatch) {
        const name = fnMatch[1] || fnMatch[2];
        if (name && !['if', 'for', 'while', 'switch', 'catch'].includes(name)) {
          symbols.push({ name, kind: 'function', line: lineNum, signature: trimmed });
        }
      }

      // 4. Cyclomatic Complexity Metrics
      if (/\b(if|else\s+if|for|while|case|catch)\b/.test(trimmed)) {
        complexityPoints++;
      }
      if (/&&|\|\||\?/.test(trimmed)) {
        complexityPoints++;
      }

      // 5. Security & Code Smell Checks
      // Eval
      if (/\beval\s*\(/.test(trimmed) || /new\s+Function\s*\(/.test(trimmed)) {
        potentialIssues.push({
          severity: 'error',
          line: lineNum,
          rule: 'security/no-eval',
          message: 'Direct invocation of eval() or new Function() introduces remote code execution vulnerabilities.',
        });
      }

      // Hardcoded credentials
      if (/(?:api_key|apiKey|secret|password|passwd|auth_token)\s*[:=]\s*["'][A-Za-z0-9_\-]{8,}["']/i.test(trimmed)) {
        potentialIssues.push({
          severity: 'error',
          line: lineNum,
          rule: 'security/no-hardcoded-secrets',
          message: 'Potential hardcoded secret or API credential detected in source code.',
        });
      }

      // Prototype pollution
      if (/__proto__|constructor\.prototype/.test(trimmed)) {
        potentialIssues.push({
          severity: 'warning',
          line: lineNum,
          rule: 'security/prototype-pollution',
          message: 'Direct access to __proto__ or constructor.prototype risk prototype pollution.',
        });
      }

      // Todo / Hack tags
      if (/\b(TODO|FIXME|HACK|XXX)\b/i.test(trimmed)) {
        potentialIssues.push({
          severity: 'info',
          line: lineNum,
          rule: 'maintainability/todo-comment',
          message: `Pending technical debt marker: "${trimmed}"`,
        });
      }
    }

    // Maintainability score (0 - 100) based on Halstead / McCabe heuristics
    const codeLines = lines.length - commentLineCount - blankLineCount;
    const penaltyIssues = potentialIssues.reduce((acc, iss) => acc + (iss.severity === 'error' ? 15 : iss.severity === 'warning' ? 5 : 1), 0);
    const penaltyComplexity = Math.max(0, complexityPoints - 10) * 1.5;
    const maintainabilityScore = Math.max(0, Math.min(100, Math.round(100 - penaltyIssues - penaltyComplexity - (codeLines > 400 ? 10 : 0))));

    return {
      filePath,
      language: this.detectLanguage(filePath),
      lineCount: lines.length,
      commentLineCount,
      blankLineCount,
      imports,
      exports,
      symbols,
      estimatedComplexity: complexityPoints,
      maintainabilityScore,
      potentialIssues,
    };
  }

  /**
   * Generates a formal code review report with compliance rules.
   */
  public reviewCode(content: string, filePath = 'file.ts'): CodeReviewReport {
    const analysis = this.analyzeCode(content, filePath);

    const rules: CodeReviewRuleCheck[] = [
      {
        id: 'SEC-01',
        title: 'No Dynamic Code Execution (eval/Function)',
        passed: !analysis.potentialIssues.some((i) => i.rule === 'security/no-eval'),
        severity: 'high',
        findings: analysis.potentialIssues.filter((i) => i.rule === 'security/no-eval').map((i) => `Line ${i.line}: ${i.message}`),
      },
      {
        id: 'SEC-02',
        title: 'Zero Hardcoded Secrets or Credentials',
        passed: !analysis.potentialIssues.some((i) => i.rule === 'security/no-hardcoded-secrets'),
        severity: 'high',
        findings: analysis.potentialIssues.filter((i) => i.rule === 'security/no-hardcoded-secrets').map((i) => `Line ${i.line}: ${i.message}`),
      },
      {
        id: 'SEC-03',
        title: 'Prototype Pollution Protections',
        passed: !analysis.potentialIssues.some((i) => i.rule === 'security/prototype-pollution'),
        severity: 'medium',
        findings: analysis.potentialIssues.filter((i) => i.rule === 'security/prototype-pollution').map((i) => `Line ${i.line}: ${i.message}`),
      },
      {
        id: 'MAINT-01',
        title: 'Bounded Cyclomatic Complexity',
        passed: analysis.estimatedComplexity <= 25,
        severity: 'medium',
        findings: analysis.estimatedComplexity > 25 ? [`Estimated complexity is ${analysis.estimatedComplexity} (threshold <= 25). Consider decomposing large branches.`] : [],
      },
      {
        id: 'MAINT-02',
        title: 'Modular Sizing & File Length',
        passed: analysis.lineCount <= 800,
        severity: 'low',
        findings: analysis.lineCount > 800 ? [`File has ${analysis.lineCount} lines (recommended limit <= 800).`] : [],
      },
    ];

    const securityPassed = rules.filter((r) => r.severity === 'high').every((r) => r.passed);
    const summary = securityPassed
      ? `Code review passed security standards. Maintainability score is ${analysis.maintainabilityScore}/100 with ${analysis.symbols.length} symbols identified.`
      : `Security audit failed: Critical vulnerabilities detected that must be remediated prior to merging.`;

    return {
      filePath,
      reviewDate: new Date().toISOString(),
      overallScore: analysis.maintainabilityScore,
      rulesEvaluated: rules,
      summary,
      securityChecksPassed: securityPassed,
    };
  }

  private detectLanguage(filePath: string): string {
    const ext = filePath.substring(filePath.lastIndexOf('.')).toLowerCase();
    switch (ext) {
      case '.ts':
      case '.tsx':
        return 'TypeScript';
      case '.js':
      case '.jsx':
        return 'JavaScript';
      case '.py':
        return 'Python';
      case '.json':
        return 'JSON';
      case '.html':
        return 'HTML';
      default:
        return 'Unknown';
    }
  }
}
