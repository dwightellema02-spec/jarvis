/**
 * JARVIS Phase 17 - Web & Browser Tool Definitions
 * 8 Registered Tools for Web Search, Open URL, Page Reading, Form Inspection,
 * Form Filling, File Downloads, Browser Workflows, and Session Status.
 */

import { ITool, ToolDefinition, ToolExecutionContext, ToolExecutionResult } from '../tools/tool.interface.js';
import { BrowserManager } from './browser-manager.js';
import { ResourceType, PermissionLevel } from '../security/types.js';

/**
 * 1. BrowserSearchTool: browser.search
 */
export class BrowserSearchTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'browser.search',
    name: 'Web Search',
    description: 'Searches the web with safe search filtering, query rank, and domain scoping.',
    version: '1.0.0',
    requiredPermissions: [
      { resource: ResourceType.WEBSITES, action: 'read', level: PermissionLevel.READ },
    ],
    parametersSchema: {
      type: 'object',
      properties: {
        query: { type: 'string' },
        domain: { type: 'string' },
        limit: { type: 'number' },
      },
      required: ['query'],
    },
    status: 'implemented',
  };

  constructor(private readonly manager: BrowserManager) {}

  public async execute(params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const p = (params || {}) as any;
      const result = await this.manager.searchWeb(
        p.query,
        { domain: p.domain, limit: p.limit },
        context.userId
      );
      return {
        success: true,
        toolId: this.definition.id,
        data: result,
        verified: true,
        executionTimeMs: Date.now() - startTime,
      };
    } catch (err: any) {
      return {
        success: false,
        toolId: this.definition.id,
        error: err.message || 'Web search failed',
        verified: false,
        executionTimeMs: Date.now() - startTime,
      };
    }
  }
}

/**
 * 2. BrowserOpenUrlTool: browser.open_url
 */
export class BrowserOpenUrlTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'browser.open_url',
    name: 'Open Web Page',
    description: 'Navigates browser session to a target URL, validating security and anti-SSRF bounds.',
    version: '1.0.0',
    requiredPermissions: [
      { resource: ResourceType.WEBSITES, action: 'write', level: PermissionLevel.WRITE },
    ],
    parametersSchema: {
      type: 'object',
      properties: {
        url: { type: 'string' },
      },
      required: ['url'],
    },
    status: 'implemented',
  };

  constructor(private readonly manager: BrowserManager) {}

  public async execute(params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const p = (params || {}) as any;
      const result = await this.manager.openUrl(p.url, context.userId);
      return {
        success: true,
        toolId: this.definition.id,
        data: result,
        verified: true,
        executionTimeMs: Date.now() - startTime,
      };
    } catch (err: any) {
      return {
        success: false,
        toolId: this.definition.id,
        error: err.message || 'Navigation failed',
        verified: false,
        executionTimeMs: Date.now() - startTime,
      };
    }
  }
}

/**
 * 3. BrowserReadPageTool: browser.read_page
 */
export class BrowserReadPageTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'browser.read_page',
    name: 'Read Web Page',
    description: 'Safely parses HTML into clean markdown, extracting headings, links, forms, and readability metrics.',
    version: '1.0.0',
    requiredPermissions: [
      { resource: ResourceType.WEBSITES, action: 'read', level: PermissionLevel.READ },
    ],
    parametersSchema: {
      type: 'object',
      properties: {
        url: { type: 'string' },
        rawHtml: { type: 'string' },
      },
      required: ['url'],
    },
    status: 'implemented',
  };

  constructor(private readonly manager: BrowserManager) {}

  public async execute(params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const p = (params || {}) as any;
      const result = await this.manager.readPage(p.url, p.rawHtml, context.userId);
      return {
        success: true,
        toolId: this.definition.id,
        data: result,
        verified: true,
        executionTimeMs: Date.now() - startTime,
      };
    } catch (err: any) {
      return {
        success: false,
        toolId: this.definition.id,
        error: err.message || 'Page read failed',
        verified: false,
        executionTimeMs: Date.now() - startTime,
      };
    }
  }
}

/**
 * 4. BrowserInspectFormsTool: browser.inspect_forms
 */
export class BrowserInspectFormsTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'browser.inspect_forms',
    name: 'Inspect HTML Forms',
    description: 'Discovers and inspects all input specifications and submission targets on a web page.',
    version: '1.0.0',
    requiredPermissions: [
      { resource: ResourceType.WEBSITES, action: 'read', level: PermissionLevel.READ },
    ],
    parametersSchema: {
      type: 'object',
      properties: {
        url: { type: 'string' },
        rawHtml: { type: 'string' },
      },
      required: ['url'],
    },
    status: 'implemented',
  };

  constructor(private readonly manager: BrowserManager) {}

  public async execute(params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const p = (params || {}) as any;
      const forms = await this.manager.inspectForms(p.url, p.rawHtml, context.userId);
      return {
        success: true,
        toolId: this.definition.id,
        data: { url: p.url, formsCount: forms.length, forms },
        verified: true,
        executionTimeMs: Date.now() - startTime,
      };
    } catch (err: any) {
      return {
        success: false,
        toolId: this.definition.id,
        error: err.message || 'Form inspection failed',
        verified: false,
        executionTimeMs: Date.now() - startTime,
      };
    }
  }
}

/**
 * 5. BrowserFillFormTool: browser.fill_form
 */
export class BrowserFillFormTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'browser.fill_form',
    name: 'Fill Web Form',
    description: 'Validates and automates form inputs and submission while enforcing anti-credential-theft guardrails.',
    version: '1.0.0',
    requiredPermissions: [
      { resource: ResourceType.WEBSITES, action: 'write', level: PermissionLevel.WRITE },
    ],
    parametersSchema: {
      type: 'object',
      properties: {
        url: { type: 'string' },
        formId: { type: 'string' },
        fields: { type: 'object' },
        submit: { type: 'boolean' },
      },
      required: ['url', 'fields'],
    },
    status: 'implemented',
  };

  constructor(private readonly manager: BrowserManager) {}

  public async execute(params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const p = (params || {}) as any;
      const result = await this.manager.fillForm(
        {
          url: p.url,
          formId: p.formId,
          fields: p.fields || {},
          submit: p.submit !== false,
        },
        undefined,
        context.userId
      );
      return {
        success: true,
        toolId: this.definition.id,
        data: result,
        verified: true,
        executionTimeMs: Date.now() - startTime,
      };
    } catch (err: any) {
      return {
        success: false,
        toolId: this.definition.id,
        error: err.message || 'Form fill failed',
        verified: false,
        executionTimeMs: Date.now() - startTime,
      };
    }
  }
}

/**
 * 6. BrowserDownloadFileTool: browser.download_file
 */
export class BrowserDownloadFileTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'browser.download_file',
    name: 'Download Permitted Web File',
    description: 'Downloads a file from a URL, strictly enforcing executable extension blacklists and size limits.',
    version: '1.0.0',
    requiredPermissions: [
      { resource: ResourceType.WEBSITES, action: 'write', level: PermissionLevel.WRITE },
    ],
    parametersSchema: {
      type: 'object',
      properties: {
        url: { type: 'string' },
        destinationFilename: { type: 'string' },
        maxSizeBytes: { type: 'number' },
      },
      required: ['url'],
    },
    status: 'implemented',
  };

  constructor(private readonly manager: BrowserManager) {}

  public async execute(params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const p = (params || {}) as any;
      const result = await this.manager.downloadFile(
        {
          url: p.url,
          destinationFilename: p.destinationFilename,
          maxSizeBytes: p.maxSizeBytes,
        },
        undefined,
        context.userId
      );
      return {
        success: true,
        toolId: this.definition.id,
        data: result,
        verified: true,
        executionTimeMs: Date.now() - startTime,
      };
    } catch (err: any) {
      return {
        success: false,
        toolId: this.definition.id,
        error: err.message || 'Download failed',
        verified: false,
        executionTimeMs: Date.now() - startTime,
      };
    }
  }
}

/**
 * 7. BrowserExecuteWorkflowTool: browser.execute_workflow
 */
export class BrowserExecuteWorkflowTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'browser.execute_workflow',
    name: 'Execute Multi-Step Web Workflow',
    description: 'Runs an automated sequence of search, navigation, form filling, reading, and downloading steps.',
    version: '1.0.0',
    requiredPermissions: [
      { resource: ResourceType.WEBSITES, action: 'execute', level: PermissionLevel.EXECUTE },
    ],
    parametersSchema: {
      type: 'object',
      properties: {
        workflowName: { type: 'string' },
        steps: { type: 'array' },
      },
      required: ['workflowName', 'steps'],
    },
    status: 'implemented',
  };

  constructor(private readonly manager: BrowserManager) {}

  public async execute(params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const p = (params || {}) as any;
      const result = await this.manager.executeWorkflow(
        p.workflowName,
        p.steps || [],
        context.userId
      );
      return {
        success: true,
        toolId: this.definition.id,
        data: result,
        verified: true,
        executionTimeMs: Date.now() - startTime,
      };
    } catch (err: any) {
      return {
        success: false,
        toolId: this.definition.id,
        error: err.message || 'Workflow execution failed',
        verified: false,
        executionTimeMs: Date.now() - startTime,
      };
    }
  }
}

/**
 * 8. BrowserSessionStatusTool: browser.session_status
 */
export class BrowserSessionStatusTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'browser.session_status',
    name: 'Browser Session Status',
    description: 'Inspects active browser session metrics, current URL, and navigation history.',
    version: '1.0.0',
    requiredPermissions: [
      { resource: ResourceType.WEBSITES, action: 'read', level: PermissionLevel.READ },
    ],
    parametersSchema: {
      type: 'object',
      properties: {},
    },
    status: 'implemented',
  };

  constructor(private readonly manager: BrowserManager) {}

  public async execute(_params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const state = this.manager.getSessionState(context.userId);
      return {
        success: true,
        toolId: this.definition.id,
        data: state,
        verified: true,
        executionTimeMs: Date.now() - startTime,
      };
    } catch (err: any) {
      return {
        success: false,
        toolId: this.definition.id,
        error: err.message || 'Session query failed',
        verified: false,
        executionTimeMs: Date.now() - startTime,
      };
    }
  }
}

/**
 * Factory creating all 8 Phase 17 browser tools.
 */
export function createBrowserTools(manager: BrowserManager): ITool[] {
  return [
    new BrowserSearchTool(manager),
    new BrowserOpenUrlTool(manager),
    new BrowserReadPageTool(manager),
    new BrowserInspectFormsTool(manager),
    new BrowserFillFormTool(manager),
    new BrowserDownloadFileTool(manager),
    new BrowserExecuteWorkflowTool(manager),
    new BrowserSessionStatusTool(manager),
  ];
}
