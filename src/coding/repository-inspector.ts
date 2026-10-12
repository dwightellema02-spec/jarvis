/**
 * JARVIS Phase 10 - Repository Inspector
 * Scans directories safely, builds file trees, computes language metrics,
 * and searches code with context windows.
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  FileTreeNode,
  RepositoryOverview,
  CodeSearchResult,
  CodeSearchMatch,
} from './coding.interface.js';

const IGNORED_DIRS = new Set([
  '.git',
  'node_modules',
  'dist',
  'build',
  '.cache',
  'coverage',
  '.system_generated',
  '.gemini',
]);

const EXTENSION_MAP: Record<string, string> = {
  '.ts': 'TypeScript',
  '.tsx': 'TypeScript (React)',
  '.js': 'JavaScript',
  '.jsx': 'JavaScript (React)',
  '.py': 'Python',
  '.json': 'JSON',
  '.md': 'Markdown',
  '.html': 'HTML',
  '.css': 'CSS',
  '.sh': 'Shell',
  '.sql': 'SQL',
};

export class RepositoryInspector {
  /**
   * Scans a repository root directory and returns a structured overview.
   */
  public inspectRepository(rootPath: string, maxDepth = 6): RepositoryOverview {
    if (!fs.existsSync(rootPath)) {
      throw new Error(`Repository path does not exist: ${rootPath}`);
    }

    const stat = fs.statSync(rootPath);
    if (!stat.isDirectory()) {
      throw new Error(`Path is not a directory: ${rootPath}`);
    }

    let totalFiles = 0;
    let totalDirectories = 0;
    const langStats: Record<string, { fileCount: number; totalBytes: number }> = {};
    const entryPoints: string[] = [];

    const buildTree = (dirPath: string, depth: number): FileTreeNode => {
      const dirName = path.basename(dirPath);
      const node: FileTreeNode = {
        name: dirName,
        path: dirPath,
        type: 'directory',
        children: [],
      };

      totalDirectories++;
      if (depth > maxDepth) return node;

      const entries = fs.readdirSync(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        if (IGNORED_DIRS.has(entry.name) || entry.name.startsWith('.')) {
          continue;
        }

        const fullPath = path.join(dirPath, entry.name);

        if (entry.isDirectory()) {
          node.children?.push(buildTree(fullPath, depth + 1));
        } else if (entry.isFile()) {
          totalFiles++;
          const fileStat = fs.statSync(fullPath);
          const ext = path.extname(entry.name).toLowerCase();
          const lang = EXTENSION_MAP[ext] || 'Other';

          if (!langStats[lang]) {
            langStats[lang] = { fileCount: 0, totalBytes: 0 };
          }
          langStats[lang].fileCount++;
          langStats[lang].totalBytes += fileStat.size;

          // Detect common entrypoints
          if (
            entry.name === 'index.ts' ||
            entry.name === 'app.ts' ||
            entry.name === 'server.ts' ||
            entry.name === 'main.ts'
          ) {
            entryPoints.push(path.relative(rootPath, fullPath));
          }

          node.children?.push({
            name: entry.name,
            path: fullPath,
            type: 'file',
            sizeBytes: fileStat.size,
          });
        }
      }

      return node;
    };

    const tree = buildTree(rootPath, 0);

    // Compute percentage distributions
    const totalBytesAll = Object.values(langStats).reduce((a, b) => a + b.totalBytes, 0) || 1;
    const languages: Record<string, { fileCount: number; totalBytes: number; percentage: number }> = {};

    for (const [lang, data] of Object.entries(langStats)) {
      languages[lang] = {
        fileCount: data.fileCount,
        totalBytes: data.totalBytes,
        percentage: parseFloat(((data.totalBytes / totalBytesAll) * 100).toFixed(1)),
      };
    }

    return {
      rootPath,
      totalFiles,
      totalDirectories,
      languages,
      entryPoints,
      tree,
    };
  }

  /**
   * Searches the codebase for a text or regex query across files.
   */
  public searchCode(
    rootPath: string,
    query: string,
    options: { isRegex?: boolean; fileExtensions?: string[]; contextLines?: number; maxMatches?: number } = {}
  ): CodeSearchResult {
    const isRegex = options.isRegex ?? false;
    const exts = options.fileExtensions?.map((e) => (e.startsWith('.') ? e : `.${e}`)) || [
      '.ts',
      '.js',
      '.py',
      '.json',
      '.md',
      '.html',
    ];
    const contextSize = options.contextLines ?? 2;
    const maxMatches = options.maxMatches ?? 50;

    let regex: RegExp;
    if (isRegex) {
      regex = new RegExp(query, 'gi');
    } else {
      const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      regex = new RegExp(escaped, 'gi');
    }

    const matches: CodeSearchMatch[] = [];
    let filesSearched = 0;

    const walkAndSearch = (dirPath: string) => {
      if (matches.length >= maxMatches) return;
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        if (matches.length >= maxMatches) break;
        if (IGNORED_DIRS.has(entry.name) || entry.name.startsWith('.')) continue;

        const fullPath = path.join(dirPath, entry.name);

        if (entry.isDirectory()) {
          walkAndSearch(fullPath);
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name).toLowerCase();
          if (exts.includes(ext)) {
            filesSearched++;
            try {
              const content = fs.readFileSync(fullPath, 'utf-8');
              const lines = content.split(/\r?\n/);

              for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
                if (matches.length >= maxMatches) break;
                const lineText = lines[lineIdx];

                if (regex.test(lineText)) {
                  // Extract context lines
                  const ctxStart = Math.max(0, lineIdx - contextSize);
                  const ctxEnd = Math.min(lines.length - 1, lineIdx + contextSize);
                  const ctx: { line: number; text: string }[] = [];

                  for (let c = ctxStart; c <= ctxEnd; c++) {
                    ctx.push({ line: c + 1, text: lines[c] });
                  }

                  matches.push({
                    filePath: fullPath,
                    lineNumber: lineIdx + 1,
                    lineContent: lineText.trim(),
                    matchedText: query,
                    contextLines: ctx,
                  });
                }
                regex.lastIndex = 0; // Reset regex state
              }
            } catch {
              // Ignore unreadable binary files
            }
          }
        }
      }
    };

    walkAndSearch(rootPath);

    return {
      query,
      matchCount: matches.length,
      filesSearched,
      matches,
    };
  }
}
