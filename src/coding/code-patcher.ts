/**
 * JARVIS Phase 10 - Code Patcher & Modification Engine
 * Ensures JARVIS never modifies code blindly.
 * Generates diff proposals, creates backups, applies patches, and supports atomic rollbacks.
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  CodeDiffProposal,
  CodeModificationResult,
  CodeDiffHunk,
} from './coding.interface.js';

export class CodePatcher {
  private backups: Map<string, string> = new Map(); // filePath -> backupPath

  /**
   * Generates a diff proposal before modifying any file.
   */
  public proposePatch(
    filePath: string,
    targetContent: string,
    replacementContent: string,
    reason = 'Code enhancement or bug fix'
  ): CodeDiffProposal {
    if (!fs.existsSync(filePath)) {
      throw new Error(`Target file does not exist: ${filePath}`);
    }

    const currentContent = fs.readFileSync(filePath, 'utf-8');
    const startIdx = currentContent.indexOf(targetContent);

    if (startIdx === -1) {
      throw new Error(`Target content to replace was not found in file: ${filePath}`);
    }

    // Determine line number
    const prefix = currentContent.substring(0, startIdx);
    const startLine = prefix.split(/\r?\n/).length;

    const oldLines = targetContent.split(/\r?\n/);
    const newLines = replacementContent.split(/\r?\n/);

    const hunks: CodeDiffHunk[] = [
      {
        startLine,
        oldLines,
        newLines,
      },
    ];

    const diffPreview = [
      `--- ${filePath} (Original)`,
      `+++ ${filePath} (Proposed)`,
      `@@ -${startLine},${oldLines.length} +${startLine},${newLines.length} @@`,
      ...oldLines.map((l) => `- ${l}`),
      ...newLines.map((l) => `+ ${l}`),
    ].join('\n');

    const linesAdded = newLines.length;
    const linesRemoved = oldLines.length;

    const isSensitive = filePath.includes('.env') || filePath.includes('security') || filePath.includes('permission');
    const riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = isSensitive ? 'HIGH' : linesAdded + linesRemoved > 50 ? 'MEDIUM' : 'LOW';

    return {
      filePath,
      reason,
      hunks,
      diffPreview,
      linesAdded,
      linesRemoved,
      riskLevel,
      requiresConfirmation: riskLevel === 'HIGH',
    };
  }

  /**
   * Applies the proposed patch to disk after verification and backup.
   */
  public applyPatch(proposal: CodeDiffProposal, confirmed = false): CodeModificationResult {
    this.assertWithinSafeBoundary(proposal.filePath);

    if (proposal.requiresConfirmation && !confirmed) {
      return {
        success: false,
        filePath: proposal.filePath,
        linesModified: 0,
        verified: false,
        error: 'High-risk modification requires explicit user confirmation prior to execution.',
        rollbackAvailable: false,
      };
    }

    const currentContent = fs.readFileSync(proposal.filePath, 'utf-8');

    // Create backup
    const backupDir = path.join(path.dirname(proposal.filePath), '.jarvis_backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const backupFileName = `${path.basename(proposal.filePath)}.${Date.now()}.bak`;
    const backupPath = path.join(backupDir, backupFileName);
    fs.writeFileSync(backupPath, currentContent, 'utf-8');
    this.backups.set(proposal.filePath, backupPath);

    // Apply hunks
    let modified = currentContent;
    let linesModified = 0;

    for (const hunk of proposal.hunks) {
      const targetStr = hunk.oldLines.join('\n');
      const repStr = hunk.newLines.join('\n');

      if (modified.includes(targetStr)) {
        modified = modified.replace(targetStr, repStr);
        linesModified += hunk.newLines.length;
      } else {
        // Try with CRLF
        const targetStrCRLF = hunk.oldLines.join('\r\n');
        const repStrCRLF = hunk.newLines.join('\r\n');
        if (modified.includes(targetStrCRLF)) {
          modified = modified.replace(targetStrCRLF, repStrCRLF);
          linesModified += hunk.newLines.length;
        } else {
          return {
            success: false,
            filePath: proposal.filePath,
            backupPath,
            linesModified: 0,
            verified: false,
            error: `Failed to match hunk at line ${hunk.startLine} during patch application.`,
            rollbackAvailable: true,
          };
        }
      }
    }

    // Write modified content
    fs.writeFileSync(proposal.filePath, modified, 'utf-8');

    // Verification check: confirm file exists and contains replacement
    const verifyContent = fs.readFileSync(proposal.filePath, 'utf-8');
    const verified = verifyContent === modified;

    return {
      success: true,
      filePath: proposal.filePath,
      backupPath,
      linesModified,
      verified,
      rollbackAvailable: true,
    };
  }

  /**
   * Reverts a modified file to its previous backup state.
   */
  public rollback(filePath: string): boolean {
    const backupPath = this.backups.get(filePath);
    if (!backupPath || !fs.existsSync(backupPath)) {
      return false;
    }

    const backupContent = fs.readFileSync(backupPath, 'utf-8');
    fs.writeFileSync(filePath, backupContent, 'utf-8');
    this.backups.delete(filePath);
    return true;
  }

  /**
   * Safely creates a new file on disk.
   */
  public createFile(filePath: string, content: string): boolean {
    this.assertWithinSafeBoundary(filePath);

    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(filePath, content, 'utf-8');
    return fs.existsSync(filePath);
  }

  private assertWithinSafeBoundary(targetPath: string): void {
    const normalized = path.resolve(targetPath);
    if (normalized.includes('..') || targetPath.startsWith('/etc') || targetPath.startsWith('C:\\Windows')) {
      throw new Error(`Security Violation: Path traversal outside project boundary is forbidden: ${targetPath}`);
    }
  }
}
