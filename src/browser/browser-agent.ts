/**
 * JARVIS Phase 17 - Web & Browser Agent Implementation
 * Autonomous web analyst coordinating search, page reading, form automation, secure downloads, and workflows.
 */

import {
  IAgent,
  AgentDefinition,
  AgentExecutionContext,
  AgentExecutionResult,
} from '../agents/agent.interface.js';
import { BrowserManager } from './browser-manager.js';
import { ResourceType, PermissionLevel } from '../security/types.js';
import { BrowserWorkflowStep, FormFillRequest, FileDownloadRequest } from './browser.interface.js';

export interface BrowserAgentInput {
  action:
    | 'search'
    | 'open_url'
    | 'read_page'
    | 'inspect_forms'
    | 'fill_form'
    | 'download_file'
    | 'execute_workflow'
    | 'get_session_state';
  query?: string;
  url?: string;
  rawHtml?: string;
  formRequest?: FormFillRequest;
  downloadRequest?: FileDownloadRequest;
  workflowName?: string;
  workflowSteps?: BrowserWorkflowStep[];
  options?: { domain?: string; limit?: number };
}

export class BrowserAgent implements IAgent {
  public readonly definition: AgentDefinition = {
    id: 'browser-agent',
    name: 'JARVIS Web & Browser Agent',
    description:
      'Autonomous web exploration and interaction agent capable of controlled search, page reading, form filling, and multi-step web workflows with strict anti-phishing, anti-scam, and anti-SSRF protections.',
    version: '1.0.0',
    capabilities: [
      'search',
      'open_url',
      'read_page',
      'inspect_forms',
      'fill_form',
      'download_file',
      'execute_workflow',
      'get_session_state',
    ],
    requiredPermissions: [
      {
        resource: ResourceType.WEBSITES,
        action: 'read',
        level: PermissionLevel.READ,
      },
    ],
    inputSchema: {
      action: 'string',
      query: 'string?',
      url: 'string?',
      rawHtml: 'string?',
      formRequest: 'object?',
      downloadRequest: 'object?',
      workflowName: 'string?',
      workflowSteps: 'array?',
      options: 'object?',
    },
    outputSchema: {
      success: 'boolean',
      data: 'any',
    },
    status: 'implemented',
  };

  private browserManager: BrowserManager;

  constructor(browserManager: BrowserManager) {
    this.browserManager = browserManager;
  }

  public async execute(
    rawInput: unknown,
    context: AgentExecutionContext
  ): Promise<AgentExecutionResult> {
    const startTime = Date.now();
    const input = (rawInput || {}) as BrowserAgentInput;

    if (!input || !input.action) {
      return {
        success: false,
        agentId: this.definition.id,
        error: 'Invalid input: "action" is required.',
        executionTimeMs: Date.now() - startTime,
      };
    }

    const userId = context.userId || 'default_user';

    try {
      switch (input.action) {
        case 'search': {
          if (!input.query) {
            return {
              success: false,
              agentId: this.definition.id,
              error: 'Field "query" is required for search.',
              executionTimeMs: Date.now() - startTime,
            };
          }
          const result = await this.browserManager.searchWeb(input.query, input.options, userId);
          return {
            success: true,
            agentId: this.definition.id,
            data: result,
            executionTimeMs: Date.now() - startTime,
          };
        }

        case 'open_url': {
          if (!input.url) {
            return {
              success: false,
              agentId: this.definition.id,
              error: 'Field "url" is required for open_url.',
              executionTimeMs: Date.now() - startTime,
            };
          }
          const result = await this.browserManager.openUrl(input.url, userId);
          return {
            success: true,
            agentId: this.definition.id,
            data: result,
            executionTimeMs: Date.now() - startTime,
          };
        }

        case 'read_page': {
          if (!input.url) {
            return {
              success: false,
              agentId: this.definition.id,
              error: 'Field "url" is required for read_page.',
              executionTimeMs: Date.now() - startTime,
            };
          }
          const result = await this.browserManager.readPage(input.url, input.rawHtml, userId);
          return {
            success: true,
            agentId: this.definition.id,
            data: result,
            executionTimeMs: Date.now() - startTime,
          };
        }

        case 'inspect_forms': {
          if (!input.url) {
            return {
              success: false,
              agentId: this.definition.id,
              error: 'Field "url" is required for inspect_forms.',
              executionTimeMs: Date.now() - startTime,
            };
          }
          const result = await this.browserManager.inspectForms(input.url, input.rawHtml, userId);
          return {
            success: true,
            agentId: this.definition.id,
            data: result,
            executionTimeMs: Date.now() - startTime,
          };
        }

        case 'fill_form': {
          if (!input.formRequest) {
            return {
              success: false,
              agentId: this.definition.id,
              error: 'Field "formRequest" is required for fill_form.',
              executionTimeMs: Date.now() - startTime,
            };
          }
          const result = await this.browserManager.fillForm(input.formRequest, undefined, userId);
          return {
            success: true,
            agentId: this.definition.id,
            data: result,
            executionTimeMs: Date.now() - startTime,
          };
        }

        case 'download_file': {
          if (!input.downloadRequest) {
            return {
              success: false,
              agentId: this.definition.id,
              error: 'Field "downloadRequest" is required for download_file.',
              executionTimeMs: Date.now() - startTime,
            };
          }
          const result = await this.browserManager.downloadFile(input.downloadRequest, undefined, userId);
          return {
            success: true,
            agentId: this.definition.id,
            data: result,
            executionTimeMs: Date.now() - startTime,
          };
        }

        case 'execute_workflow': {
          if (!input.workflowName || !input.workflowSteps) {
            return {
              success: false,
              agentId: this.definition.id,
              error: 'Fields "workflowName" and "workflowSteps" are required.',
              executionTimeMs: Date.now() - startTime,
            };
          }
          const result = await this.browserManager.executeWorkflow(
            input.workflowName,
            input.workflowSteps,
            userId
          );
          return {
            success: true,
            agentId: this.definition.id,
            data: result,
            executionTimeMs: Date.now() - startTime,
          };
        }

        case 'get_session_state': {
          const result = this.browserManager.getSessionState(userId);
          return {
            success: true,
            agentId: this.definition.id,
            data: result,
            executionTimeMs: Date.now() - startTime,
          };
        }

        default:
          return {
            success: false,
            agentId: this.definition.id,
            error: `Unsupported action: "${(input as any).action}".`,
            executionTimeMs: Date.now() - startTime,
          };
      }
    } catch (err: any) {
      return {
        success: false,
        agentId: this.definition.id,
        error: err.message,
        executionTimeMs: Date.now() - startTime,
      };
    }
  }
}
