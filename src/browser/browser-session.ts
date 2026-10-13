/**
 * JARVIS Phase 17 - Browser Session & Workflow Orchestrator
 * Manages navigation history, stateful browser sessions, and executes multi-step web workflows.
 */

import {
  BrowserSessionState,
  BrowserWorkflowStep,
  BrowserWorkflowResult,
  PageReadResult,
} from './browser.interface.js';
import { SearchProvider } from './search-provider.js';
import { PageReader } from './page-reader.js';
import { FormAutomation } from './form-automation.js';
import { DownloadController } from './download-controller.js';

export class BrowserSession {
  private sessionId: string;
  private currentUrl: string;
  private history: string[];
  private historyIndex: number;
  private userAgent: string;
  private cookiesCount: number;
  private activeSince: string;
  private lastNavigatedAt: string;

  constructor(initialUrl: string = 'about:blank') {
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    this.currentUrl = initialUrl;
    this.history = [initialUrl];
    this.historyIndex = 0;
    this.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) JARVIS/1.0';
    this.cookiesCount = 0;
    this.activeSince = new Date().toISOString();
    this.lastNavigatedAt = new Date().toISOString();
  }

  public getSessionState(): BrowserSessionState {
    return {
      sessionId: this.sessionId,
      currentUrl: this.currentUrl,
      history: [...this.history],
      historyIndex: this.historyIndex,
      userAgent: this.userAgent,
      cookiesCount: this.cookiesCount,
      activeSince: this.activeSince,
      lastNavigatedAt: this.lastNavigatedAt,
    };
  }

  public navigate(url: string): string {
    if (this.currentUrl !== url) {
      // If navigating forward from a middle history point, prune future history
      if (this.historyIndex < this.history.length - 1) {
        this.history = this.history.slice(0, this.historyIndex + 1);
      }
      this.history.push(url);
      this.historyIndex = this.history.length - 1;
      this.currentUrl = url;
      this.lastNavigatedAt = new Date().toISOString();
    }
    return this.currentUrl;
  }

  public back(): string | null {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.currentUrl = this.history[this.historyIndex];
      this.lastNavigatedAt = new Date().toISOString();
      return this.currentUrl;
    }
    return null;
  }

  public forward(): string | null {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.currentUrl = this.history[this.historyIndex];
      this.lastNavigatedAt = new Date().toISOString();
      return this.currentUrl;
    }
    return null;
  }

  /**
   * Executes a sequential multi-step browser workflow.
   */
  public async executeWorkflow(
    workflowName: string,
    steps: BrowserWorkflowStep[],
    services: {
      searchProvider: SearchProvider;
      pageReader: PageReader;
      formAutomation: FormAutomation;
      downloadController: DownloadController;
    }
  ): Promise<BrowserWorkflowResult> {
    const startTime = Date.now();
    const stepResults: BrowserWorkflowResult['stepResults'] = [];
    let lastPageResult: PageReadResult | null = null;
    let success = true;

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const stepIndex = i + 1;

      try {
        switch (step.type) {
          case 'search': {
            const searchRes = services.searchProvider.search(step.target);
            stepResults.push({
              step: stepIndex,
              type: 'search',
              target: step.target,
              status: 'SUCCESS',
              details: { totalResults: searchRes.totalResults, topUrl: searchRes.results[0]?.url },
            });
            break;
          }

          case 'navigate': {
            this.navigate(step.target);
            lastPageResult = await services.pageReader.readPage(step.target);
            stepResults.push({
              step: stepIndex,
              type: 'navigate',
              target: step.target,
              status: 'SUCCESS',
              details: { title: lastPageResult.title, wordCount: lastPageResult.wordCount },
            });
            break;
          }

          case 'read': {
            const urlToRead = step.target || this.currentUrl;
            lastPageResult = await services.pageReader.readPage(urlToRead);
            stepResults.push({
              step: stepIndex,
              type: 'read',
              target: urlToRead,
              status: 'SUCCESS',
              details: {
                title: lastPageResult.title,
                headingsCount: lastPageResult.headings.length,
                formsCount: lastPageResult.forms.length,
              },
            });
            break;
          }

          case 'fill': {
            if (!lastPageResult || lastPageResult.forms.length === 0) {
              lastPageResult = await services.pageReader.readPage(this.currentUrl);
            }
            const fillRes = services.formAutomation.executeFormFill(
              {
                url: this.currentUrl,
                fields: step.data?.fields || {},
                submit: step.data?.submit !== false,
              },
              lastPageResult.forms
            );
            stepResults.push({
              step: stepIndex,
              type: 'fill',
              target: this.currentUrl,
              status: 'SUCCESS',
              details: fillRes,
            });
            break;
          }

          case 'download': {
            const downloadRes = await services.downloadController.downloadFile({
              url: step.target,
              destinationFilename: step.data?.filename,
            });
            stepResults.push({
              step: stepIndex,
              type: 'download',
              target: step.target,
              status: 'SUCCESS',
              details: { fileName: downloadRes.fileName, size: downloadRes.fileSizeBytes },
            });
            break;
          }

          default:
            throw new Error(`Unsupported browser workflow step type: "${(step as any).type}"`);
        }
      } catch (err: any) {
        success = false;
        stepResults.push({
          step: stepIndex,
          type: step.type,
          target: step.target,
          status: 'FAILED',
          details: { error: err.message },
        });
        break; // Stop on first failing step
      }
    }

    return {
      workflowName,
      stepsExecuted: stepResults.length,
      totalSteps: steps.length,
      success,
      stepResults,
      executionTimeMs: Date.now() - startTime,
    };
  }
}
