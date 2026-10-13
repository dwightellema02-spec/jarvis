/**
 * JARVIS Phase 17 - Browser Manager & Security Coordinator
 * Coordinates web search, page reading, form automation, secure downloads, and workflows.
 * Strictly gated by ResourceType.WEBSITES with Security Guardian anti-phishing, anti-scam,
 * and anti-SSRF protections.
 */

import { SearchProvider } from './search-provider.js';
import { PageReader } from './page-reader.js';
import { FormAutomation } from './form-automation.js';
import { DownloadController } from './download-controller.js';
import { BrowserSession } from './browser-session.js';
import {
  WebSearchResult,
  PageReadResult,
  FormSpec,
  FormFillRequest,
  FormFillResult,
  FileDownloadRequest,
  FileDownloadResult,
  BrowserSessionState,
  BrowserWorkflowStep,
  BrowserWorkflowResult,
} from './browser.interface.js';
import { PermissionManager } from '../security/permission-manager.js';
import { SecurityGuardian } from '../security/guardian.js';
import { AuditLogger } from '../audit/audit-logger.js';
import { ResourceType, PermissionLevel, SecurityDecisionType } from '../security/types.js';
import { logger } from '../utils/logger.js';

export class BrowserManager {
  private searchProvider: SearchProvider;
  private pageReader: PageReader;
  private formAutomation: FormAutomation;
  private downloadController: DownloadController;
  private activeSession: BrowserSession;

  private permissionManager: PermissionManager;
  private guardian: SecurityGuardian;
  private auditLogger: AuditLogger;

  constructor(
    permissionManager: PermissionManager,
    guardian: SecurityGuardian,
    auditLogger: AuditLogger,
    searchProvider?: SearchProvider,
    pageReader?: PageReader,
    formAutomation?: FormAutomation,
    downloadController?: DownloadController,
    activeSession?: BrowserSession
  ) {
    this.permissionManager = permissionManager;
    this.guardian = guardian;
    this.auditLogger = auditLogger;

    this.searchProvider = searchProvider || new SearchProvider();
    this.pageReader = pageReader || new PageReader();
    this.formAutomation = formAutomation || new FormAutomation();
    this.downloadController = downloadController || new DownloadController();
    this.activeSession = activeSession || new BrowserSession();
  }

  /**
   * Executes a web search query.
   */
  public async searchWeb(
    query: string,
    options?: { domain?: string; limit?: number },
    userId: string = 'default_user'
  ): Promise<WebSearchResult> {
    this.assertPermission(userId, 'read', PermissionLevel.READ, `search:${query}`);
    this.assertGuardian(userId, 'read', query);

    const result = this.searchProvider.search(query, options);

    this.recordAudit(userId, 'read', PermissionLevel.READ, `Searched web for "${query}"`, {
      query,
      resultsCount: result.totalResults,
    });

    return result;
  }

  /**
   * Opens / navigates to a target URL in the active session.
   */
  public async openUrl(url: string, userId: string = 'default_user'): Promise<{ currentUrl: string; state: BrowserSessionState }> {
    this.assertPermission(userId, 'write', PermissionLevel.WRITE, url);
    this.assertGuardian(userId, 'write', url);

    // Validate anti-SSRF bounds before navigating
    this.pageReader.assertUrlSafe(url);

    this.activeSession.navigate(url);
    const state = this.activeSession.getSessionState();

    this.recordAudit(userId, 'write', PermissionLevel.WRITE, `Navigated browser to ${url}`, {
      url,
      historyLength: state.history.length,
    });

    return { currentUrl: state.currentUrl, state };
  }

  /**
   * Reads and parses a web page, returning text, markdown, headings, links, and discovered forms.
   */
  public async readPage(url: string, rawHtml?: string, userId: string = 'default_user'): Promise<PageReadResult> {
    this.assertPermission(userId, 'read', PermissionLevel.READ, url);
    this.assertGuardian(userId, 'read', url);

    const pageResult = await this.pageReader.readPage(url, rawHtml);

    this.recordAudit(userId, 'read', PermissionLevel.READ, `Read page content from ${url}`, {
      url,
      title: pageResult.title,
      wordCount: pageResult.wordCount,
      formsCount: pageResult.forms.length,
    });

    return pageResult;
  }

  /**
   * Discovers and inspects all HTML forms available on a web page.
   */
  public async inspectForms(url: string, rawHtml?: string, userId: string = 'default_user'): Promise<FormSpec[]> {
    this.assertPermission(userId, 'read', PermissionLevel.READ, url);
    this.assertGuardian(userId, 'read', url);

    const pageResult = await this.pageReader.readPage(url, rawHtml);
    return pageResult.forms;
  }

  /**
   * Fills and submits a form on a target web page.
   */
  public async fillForm(
    request: FormFillRequest,
    availableForms?: FormSpec[],
    userId: string = 'default_user'
  ): Promise<FormFillResult> {
    this.assertPermission(userId, 'write', PermissionLevel.WRITE, request.url);
    this.assertGuardian(userId, 'write', request.url);

    // If available forms are not supplied, read the page to discover them
    const forms = availableForms || (await this.pageReader.readPage(request.url)).forms;
    const result = this.formAutomation.executeFormFill(request, forms);

    this.recordAudit(userId, 'write', PermissionLevel.WRITE, `Filled form "${result.formId}" on ${request.url}`, {
      url: request.url,
      formId: result.formId,
      submitted: result.submitted,
      filledFields: result.filledFields,
    });

    return result;
  }

  /**
   * Downloads a file from an authorized web URL to the local environment.
   */
  public async downloadFile(
    request: FileDownloadRequest,
    customContent?: Buffer | string,
    userId: string = 'default_user'
  ): Promise<FileDownloadResult> {
    this.assertPermission(userId, 'write', PermissionLevel.WRITE, request.url);
    this.assertGuardian(userId, 'write', request.url);

    // Evaluate destination file through Guardian for executable/suspicious file write
    const parsed = new URL(request.url);
    const targetFilename = request.destinationFilename || parsed.pathname;
    const fileDecision = this.guardian.evaluate({
      resource: ResourceType.FILES,
      action: 'write',
      target: targetFilename,
      userId,
    });

    if (fileDecision.decision === SecurityDecisionType.DENY) {
      throw new Error(`Security Guardian blocked download: ${fileDecision.reason}`);
    }

    const downloadResult = await this.downloadController.downloadFile(request, customContent);

    this.recordAudit(userId, 'write', PermissionLevel.WRITE, `Downloaded file from ${request.url}`, {
      url: request.url,
      savedPath: downloadResult.savedPath,
      fileSize: downloadResult.fileSizeBytes,
      mimeType: downloadResult.mimeType,
    });

    return downloadResult;
  }

  /**
   * Executes a multi-step browser workflow.
   */
  public async executeWorkflow(
    workflowName: string,
    steps: BrowserWorkflowStep[],
    userId: string = 'default_user'
  ): Promise<BrowserWorkflowResult> {
    this.assertPermission(userId, 'execute', PermissionLevel.EXECUTE, `workflow:${workflowName}`);
    this.assertGuardian(userId, 'execute', `workflow:${workflowName}`);

    // Pre-flight evaluate each step's target URL through Guardian
    for (const step of steps) {
      if (step.target.startsWith('http://') || step.target.startsWith('https://')) {
        this.assertGuardian(userId, 'write', step.target);
      }
    }

    const result = await this.activeSession.executeWorkflow(workflowName, steps, {
      searchProvider: this.searchProvider,
      pageReader: this.pageReader,
      formAutomation: this.formAutomation,
      downloadController: this.downloadController,
    });

    this.recordAudit(userId, 'execute', PermissionLevel.EXECUTE, `Executed browser workflow "${workflowName}"`, {
      workflowName,
      stepsExecuted: result.stepsExecuted,
      success: result.success,
    });

    return result;
  }

  /**
   * Retrieves current session metrics and navigation history.
   */
  public getSessionState(userId: string = 'default_user'): BrowserSessionState {
    this.assertPermission(userId, 'read', PermissionLevel.READ, 'session_state');
    return this.activeSession.getSessionState();
  }

  // --- Security Helpers ---

  private assertPermission(
    userId: string,
    action: 'read' | 'write' | 'execute',
    requiredLevel: PermissionLevel,
    targetIdentifier: string
  ): void {
    const permResult = this.permissionManager.checkPermission({
      userId,
      resource: ResourceType.WEBSITES,
      action,
      requiredLevel,
      targetIdentifier,
    });

    if (!permResult.allowed) {
      throw new Error(
        `Permission Denied on WEBSITES: User "${userId}" lacks required ${requiredLevel} permission.`
      );
    }
  }

  private assertGuardian(userId: string, action: 'read' | 'write' | 'execute', target: string): void {
    const decision = this.guardian.evaluate({
      resource: ResourceType.WEBSITES,
      action,
      target,
      userId,
    });

    if (decision.decision === SecurityDecisionType.DENY) {
      throw new Error(`Security Guardian blocked web action: ${decision.reason || 'Threat detected'}`);
    }

    if (decision.decision === SecurityDecisionType.REQUIRE_CONFIRMATION) {
      throw new Error(`Security Guardian confirmation required: ${decision.reason || 'Suspicious destination'}`);
    }
  }

  private recordAudit(
    userId: string,
    action: 'read' | 'write' | 'execute',
    permissionRequired: PermissionLevel,
    reason: string,
    details?: Record<string, any>
  ): void {
    try {
      this.auditLogger.log({
        user: userId,
        requestId: `req_browser_${Date.now()}`,
        resource: ResourceType.WEBSITES,
        action,
        permissionRequired,
        decision: SecurityDecisionType.ALLOW,
        reason,
        result: 'SUCCESS',
        details,
      });
    } catch (err: any) {
      logger.warn(`[BrowserManager] Failed to record audit log: ${err.message}`);
    }
  }
}
