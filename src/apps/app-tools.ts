/**
 * JARVIS Phase 18 - Application Control Tool Definitions
 * 8 Registered Tools for App Catalog, Running Processes, App Launching, Process Termination,
 * Window Management, URI Schemes, Local API Commands, and Authorization Audits.
 */

import { ITool, ToolDefinition, ToolExecutionContext, ToolExecutionResult } from '../tools/tool.interface.js';
import { ApplicationManager } from './application-manager.js';
import { ResourceType, PermissionLevel } from '../security/types.js';

/**
 * 1. AppsListInstalledTool: apps.list_installed
 */
export class AppsListInstalledTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'apps.list_installed',
    name: 'List Installed Applications',
    description: 'Lists all registered applications in catalog with their supported protocols and authorization statuses.',
    version: '1.0.0',
    requiredPermissions: [
      { resource: ResourceType.APPLICATIONS, action: 'read', level: PermissionLevel.READ },
    ],
    parametersSchema: {
      type: 'object',
      properties: {},
    },
    status: 'implemented',
  };

  constructor(private readonly manager: ApplicationManager) {}

  public async execute(_params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const result = this.manager.listInstalledApps(context.userId);
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
        error: err.message,
        verified: false,
        executionTimeMs: Date.now() - startTime,
      };
    }
  }
}

/**
 * 2. AppsGetRunningProcessesTool: apps.get_running_processes
 */
export class AppsGetRunningProcessesTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'apps.get_running_processes',
    name: 'Get Running Processes',
    description: 'Queries active processes and window titles on the host operating system.',
    version: '1.0.0',
    requiredPermissions: [
      { resource: ResourceType.APPLICATIONS, action: 'read', level: PermissionLevel.READ },
    ],
    parametersSchema: {
      type: 'object',
      properties: {},
    },
    status: 'implemented',
  };

  constructor(private readonly manager: ApplicationManager) {}

  public async execute(_params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const result = await this.manager.getRunningProcesses(context.userId);
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
        error: err.message,
        verified: false,
        executionTimeMs: Date.now() - startTime,
      };
    }
  }
}

/**
 * 3. AppsLaunchApplicationTool: apps.launch_application
 */
export class AppsLaunchApplicationTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'apps.launch_application',
    name: 'Launch Application',
    description: 'Launches an authorized desktop application executable with safe argument validation.',
    version: '1.0.0',
    requiredPermissions: [
      { resource: ResourceType.APPLICATIONS, action: 'execute', level: PermissionLevel.EXECUTE },
    ],
    parametersSchema: {
      type: 'object',
      properties: {
        appId: { type: 'string' },
        args: { type: 'array', items: { type: 'string' } },
        simulate: { type: 'boolean' },
      },
      required: ['appId'],
    },
    status: 'implemented',
  };

  constructor(private readonly manager: ApplicationManager) {}

  public async execute(params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const p = (params || {}) as any;
      const result = await this.manager.launchApp(
        p.appId,
        p.args,
        p.simulate !== false,
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
        error: err.message,
        verified: false,
        executionTimeMs: Date.now() - startTime,
      };
    }
  }
}

/**
 * 4. AppsCloseApplicationTool: apps.close_application
 */
export class AppsCloseApplicationTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'apps.close_application',
    name: 'Close Application',
    description: 'Gracefully terminates an authorized application process.',
    version: '1.0.0',
    requiredPermissions: [
      { resource: ResourceType.APPLICATIONS, action: 'execute', level: PermissionLevel.EXECUTE },
    ],
    parametersSchema: {
      type: 'object',
      properties: {
        appId: { type: 'string' },
        pid: { type: 'number' },
        simulate: { type: 'boolean' },
      },
      required: ['appId'],
    },
    status: 'implemented',
  };

  constructor(private readonly manager: ApplicationManager) {}

  public async execute(params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const p = (params || {}) as any;
      const result = await this.manager.closeApp(
        p.appId,
        p.pid,
        p.simulate !== false,
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
        error: err.message,
        verified: false,
        executionTimeMs: Date.now() - startTime,
      };
    }
  }
}

/**
 * 5. AppsFocusWindowTool: apps.focus_window
 */
export class AppsFocusWindowTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'apps.focus_window',
    name: 'Focus Application Window',
    description: 'Brings an authorized application window to the foreground under safe UI automation bounds.',
    version: '1.0.0',
    requiredPermissions: [
      { resource: ResourceType.APPLICATIONS, action: 'execute', level: PermissionLevel.EXECUTE },
    ],
    parametersSchema: {
      type: 'object',
      properties: {
        appId: { type: 'string' },
        windowTitleFilter: { type: 'string' },
        simulate: { type: 'boolean' },
      },
      required: ['appId'],
    },
    status: 'implemented',
  };

  constructor(private readonly manager: ApplicationManager) {}

  public async execute(params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const p = (params || {}) as any;
      const result = await this.manager.focusWindow(
        p.appId,
        p.windowTitleFilter,
        p.simulate !== false,
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
        error: err.message,
        verified: false,
        executionTimeMs: Date.now() - startTime,
      };
    }
  }
}

/**
 * 6. AppsDispatchUriTool: apps.dispatch_uri
 */
export class AppsDispatchUriTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'apps.dispatch_uri',
    name: 'Dispatch Deep-Link URI',
    description: 'Safely dispatches deep link URIs (e.g. vscode://, obsidian://) to authorized applications.',
    version: '1.0.0',
    requiredPermissions: [
      { resource: ResourceType.APPLICATIONS, action: 'write', level: PermissionLevel.WRITE },
    ],
    parametersSchema: {
      type: 'object',
      properties: {
        appId: { type: 'string' },
        uri: { type: 'string' },
        simulate: { type: 'boolean' },
      },
      required: ['appId', 'uri'],
    },
    status: 'implemented',
  };

  constructor(private readonly manager: ApplicationManager) {}

  public async execute(params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const p = (params || {}) as any;
      const result = await this.manager.dispatchUri(
        p.appId,
        p.uri,
        p.simulate !== false,
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
        error: err.message,
        verified: false,
        executionTimeMs: Date.now() - startTime,
      };
    }
  }
}

/**
 * 7. AppsSendApiCommandTool: apps.send_api_command
 */
export class AppsSendApiCommandTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'apps.send_api_command',
    name: 'Send Local API Command',
    description: 'Dispatches structured commands to official local application APIs with authentication enforcement.',
    version: '1.0.0',
    requiredPermissions: [
      { resource: ResourceType.APPLICATIONS, action: 'write', level: PermissionLevel.WRITE },
    ],
    parametersSchema: {
      type: 'object',
      properties: {
        appId: { type: 'string' },
        endpoint: { type: 'string' },
        payload: { type: 'object' },
        authToken: { type: 'string' },
        simulate: { type: 'boolean' },
      },
      required: ['appId', 'endpoint'],
    },
    status: 'implemented',
  };

  constructor(private readonly manager: ApplicationManager) {}

  public async execute(params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const p = (params || {}) as any;
      const result = await this.manager.sendApiCommand(
        p.appId,
        p.endpoint,
        p.payload,
        p.authToken,
        p.simulate !== false,
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
        error: err.message,
        verified: false,
        executionTimeMs: Date.now() - startTime,
      };
    }
  }
}

/**
 * 8. AppsAuditAuthorizationTool: apps.audit_authorization
 */
export class AppsAuditAuthorizationTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'apps.audit_authorization',
    name: 'Audit Application Authorization',
    description: 'Audits application registry authorization states, counts, and security invariants.',
    version: '1.0.0',
    requiredPermissions: [
      { resource: ResourceType.APPLICATIONS, action: 'read', level: PermissionLevel.READ },
    ],
    parametersSchema: {
      type: 'object',
      properties: {},
    },
    status: 'implemented',
  };

  constructor(private readonly manager: ApplicationManager) {}

  public async execute(_params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const result = this.manager.getAuditSummary(context.userId);
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
        error: err.message,
        verified: false,
        executionTimeMs: Date.now() - startTime,
      };
    }
  }
}

export function createAppTools(manager: ApplicationManager): ITool[] {
  return [
    new AppsListInstalledTool(manager),
    new AppsGetRunningProcessesTool(manager),
    new AppsLaunchApplicationTool(manager),
    new AppsCloseApplicationTool(manager),
    new AppsFocusWindowTool(manager),
    new AppsDispatchUriTool(manager),
    new AppsSendApiCommandTool(manager),
    new AppsAuditAuthorizationTool(manager),
  ];
}
