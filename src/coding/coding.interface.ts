/**
 * JARVIS Phase 10 - Coding Agent Interfaces
 */

export interface CodeSymbol {
  name: string;
  kind: 'function' | 'class' | 'interface' | 'variable' | 'type' | 'import' | 'export';
  line: number;
  signature?: string;
  docstring?: string;
}

export interface CodeAnalysisResult {
  filePath: string;
  language: string;
  lineCount: number;
  commentLineCount: number;
  blankLineCount: number;
  imports: string[];
  exports: string[];
  symbols: CodeSymbol[];
  estimatedComplexity: number; // Cyclomatic complexity score
  maintainabilityScore: number; // 0 - 100
  potentialIssues: Array<{
    severity: 'info' | 'warning' | 'error';
    line: number;
    rule: string;
    message: string;
  }>;
}

export interface CodeSearchMatch {
  filePath: string;
  lineNumber: number;
  lineContent: string;
  matchedText: string;
  contextLines: { line: number; text: string }[];
}

export interface CodeSearchResult {
  query: string;
  matchCount: number;
  filesSearched: number;
  matches: CodeSearchMatch[];
}

export interface CodeDiffHunk {
  startLine: number;
  oldLines: string[];
  newLines: string[];
}

export interface CodeDiffProposal {
  filePath: string;
  reason: string;
  hunks: CodeDiffHunk[];
  diffPreview: string;
  linesAdded: number;
  linesRemoved: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  requiresConfirmation: boolean;
}

export interface CodeModificationResult {
  success: boolean;
  filePath: string;
  backupPath?: string;
  linesModified: number;
  verified: boolean;
  error?: string;
  rollbackAvailable: boolean;
}

export interface ErrorDiagnostic {
  rawError: string;
  errorType: string;
  errorMessage: string;
  stackFrames: Array<{
    file: string;
    line: number;
    column: number;
    functionName?: string;
    isProjectCode: boolean;
  }>;
  rootCauseAnalysis: string;
  suggestedFixes: string[];
}

export interface CodeReviewRuleCheck {
  id: string;
  title: string;
  passed: boolean;
  severity: 'low' | 'medium' | 'high';
  findings: string[];
}

export interface CodeReviewReport {
  filePath: string;
  reviewDate: string;
  overallScore: number; // 0 - 100
  rulesEvaluated: CodeReviewRuleCheck[];
  summary: string;
  securityChecksPassed: boolean;
}

export interface FileTreeNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  sizeBytes?: number;
  children?: FileTreeNode[];
}

export interface RepositoryOverview {
  rootPath: string;
  totalFiles: number;
  totalDirectories: number;
  languages: Record<string, { fileCount: number; totalBytes: number; percentage: number }>;
  entryPoints: string[];
  tree: FileTreeNode;
}
