/**
 * JARVIS Phase 10 - Error Debugger & Diagnostics
 * Parses runtime stack traces, extracts source context, classifies error taxonomies,
 * and proposes targeted remediations.
 */

import * as fs from 'fs';
import { ErrorDiagnostic } from './coding.interface.js';

export class ErrorDebugger {
  /**
   * Diagnoses a runtime error stack trace and produces actionable fixes.
   */
  public diagnoseError(rawTrace: string, projectRoot?: string): ErrorDiagnostic {
    const lines = rawTrace.split(/\r?\n/).map((l) => l.trim());

    // 1. Header parsing (e.g. "TypeError: Cannot read properties of undefined (reading 'title')")
    const firstLine = lines[0] || 'Error: Unknown runtime error';
    const headerMatch = firstLine.match(/^([A-Za-z0-9_]+Error|AssertionError|Error):\s*(.*)$/);

    const errorType = headerMatch ? headerMatch[1] : 'RuntimeError';
    const errorMessage = headerMatch ? headerMatch[2] : firstLine;

    // 2. Stack Frame parsing
    const stackFrames: ErrorDiagnostic['stackFrames'] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];

      // Format: "at Object.method (C:\path\to\file.ts:135:29)" or "at C:\path\to\file.ts:135:29"
      const frameMatch = line.match(/^at\s+(?:([A-Za-z0-9_$.<>\s]+)\s+)?\(?(.*?):(\d+):(\d+)\)?$/);
      if (frameMatch) {
        const fnName = frameMatch[1]?.trim();
        const file = frameMatch[2]?.trim();
        const lineNum = parseInt(frameMatch[3], 10);
        const colNum = parseInt(frameMatch[4], 10);

        const isProjectCode = !file.includes('node_modules') && (!projectRoot || file.startsWith(projectRoot));

        stackFrames.push({
          file,
          line: lineNum,
          column: colNum,
          functionName: fnName || '<anonymous>',
          isProjectCode,
        });
      }
    }

    // 3. Root Cause Classification
    let rootCause = 'An unhandled exception occurred during execution.';
    const suggestedFixes: string[] = [];

    if (errorType === 'TypeError') {
      if (errorMessage.includes('Cannot read properties of undefined') || errorMessage.includes('is not a function')) {
        rootCause = 'Null pointer or undefined property access. An asynchronous promise was likely unawaited, or an object was accessed before initialization.';
        suggestedFixes.push('Ensure asynchronous function calls are prefixed with "await".');
        suggestedFixes.push('Add optional chaining (?.), nullish coalescing (??), or guard clauses before accessing properties.');
      } else {
        rootCause = 'Type mismatch between caller expectations and runtime object shape.';
        suggestedFixes.push('Verify function argument types and parameter order.');
      }
    } else if (errorType === 'ReferenceError') {
      rootCause = 'Attempted access to an undeclared identifier or variable outside current lexical scope.';
      suggestedFixes.push('Verify variable declaration and import statements.');
    } else if (errorType === 'AssertionError') {
      rootCause = 'Test expectation failed to match observed value.';
      suggestedFixes.push('Inspect intermediate mock values or return types from the tested function.');
    } else if (errorType === 'SyntaxError') {
      rootCause = 'Code syntax violation prevented compiler from parsing the module.';
      suggestedFixes.push('Check unclosed brackets, missing commas, or incompatible language keywords.');
    }

    // Find first project stack frame for file context
    const firstProjectFrame = stackFrames.find((f) => f.isProjectCode) || stackFrames[0];
    if (firstProjectFrame && fs.existsSync(firstProjectFrame.file)) {
      try {
        const sourceLines = fs.readFileSync(firstProjectFrame.file, 'utf-8').split(/\r?\n/);
        const faultyLine = sourceLines[firstProjectFrame.line - 1];
        if (faultyLine) {
          suggestedFixes.push(`Inspect line ${firstProjectFrame.line} in ${firstProjectFrame.file}: "${faultyLine.trim()}"`);
        }
      } catch {
        // Ignore file read error
      }
    }

    return {
      rawError: rawTrace,
      errorType,
      errorMessage,
      stackFrames,
      rootCauseAnalysis: rootCause,
      suggestedFixes,
    };
  }
}
