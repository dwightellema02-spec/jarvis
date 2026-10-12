/**
 * JARVIS Phase 11 - Package Manager & Dependency Inspector
 */

import * as fs from 'fs';
import * as path from 'path';
import { TerminalExecutor } from './terminal-executor.js';
import {
  DependencyAuditReport,
  DependencyAuditVulnerability,
  PackageJsonOverview,
} from './devenv.interface.js';
import { logger } from '../utils/logger.js';

export class DependencyManager {
  private terminalExecutor: TerminalExecutor;
  private defaultRootDir: string;

  constructor(terminalExecutor: TerminalExecutor, defaultRootDir?: string) {
    this.terminalExecutor = terminalExecutor;
    this.defaultRootDir = path.resolve(defaultRootDir || process.cwd());
  }

  /**
   * Read and parse project package.json
   */
  public getPackageJson(cwd?: string): PackageJsonOverview {
    const targetDir = path.resolve(cwd || this.defaultRootDir);
    const pkgPath = path.join(targetDir, 'package.json');

    if (!fs.existsSync(pkgPath)) {
      throw new Error(`package.json not found in directory: ${targetDir}`);
    }

    try {
      const raw = fs.readFileSync(pkgPath, 'utf-8');
      const parsed = JSON.parse(raw);

      const scripts = parsed.scripts || {};
      const dependencies = parsed.dependencies || {};
      const devDependencies = parsed.devDependencies || {};

      return {
        name: parsed.name || 'unnamed-project',
        version: parsed.version || '0.0.0',
        description: parsed.description,
        scripts,
        dependencies,
        devDependencies,
        totalDependencies: Object.keys(dependencies).length,
        totalDevDependencies: Object.keys(devDependencies).length,
      };
    } catch (err: any) {
      logger.error('Failed to parse package.json', { error: err.message });
      throw new Error(`Invalid package.json format: ${err.message}`);
    }
  }

  /**
   * Run npm audit --json and parse vulnerability reports
   */
  public async auditDependencies(cwd?: string): Promise<DependencyAuditReport> {
    const targetDir = path.resolve(cwd || this.defaultRootDir);
    const res = await this.terminalExecutor.executeCommand({
      command: 'npm audit --json',
      cwd: targetDir,
      timeoutMs: 30000,
    });

    const report: DependencyAuditReport = {
      vulnerabilitiesFound: 0,
      severityCounts: { low: 0, moderate: 0, high: 0, critical: 0 },
      details: [],
      advisorySummary: 'No vulnerabilities detected.',
    };

    if (!res.stdout) {
      report.advisorySummary = 'Audit completed or npm audit returned empty output.';
      return report;
    }

    try {
      const parsed = JSON.parse(res.stdout);
      const vulns = parsed.vulnerabilities || {};
      const metadata = parsed.metadata?.vulnerabilities || {};

      report.severityCounts = {
        low: metadata.low || 0,
        moderate: metadata.moderate || 0,
        high: metadata.high || 0,
        critical: metadata.critical || 0,
      };

      const vulnList: DependencyAuditVulnerability[] = [];
      for (const [name, info] of Object.entries<any>(vulns)) {
        vulnList.push({
          name,
          severity: (info.severity || 'low').toLowerCase(),
          via: Array.isArray(info.via) ? info.via.map((v: any) => (typeof v === 'string' ? v : v.title || v.name)) : [String(info.via)],
          range: info.range || '*',
        });
      }

      report.vulnerabilitiesFound = Object.keys(vulns).length;
      report.details = vulnList;

      if (report.vulnerabilitiesFound > 0) {
        report.advisorySummary = `Found ${report.vulnerabilitiesFound} vulnerable packages: ${report.severityCounts.critical} critical, ${report.severityCounts.high} high, ${report.severityCounts.moderate} moderate, ${report.severityCounts.low} low. Run "npm audit fix" or review package versions.`;
      } else {
        report.advisorySummary = '0 vulnerabilities found. All inspected dependencies meet security standards.';
      }
    } catch {
      // In case stdout was not valid JSON, summarize exit output
      report.advisorySummary = res.stdout.includes('found 0 vulnerabilities')
        ? '0 vulnerabilities found in project dependencies.'
        : res.stdout.slice(0, 300);
    }

    return report;
  }
}
