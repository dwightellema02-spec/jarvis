/**
 * JARVIS Phase 18 - Application Control Agent Implementation
 * Autonomous controller coordinating application launch, process monitoring, deep-link dispatch, and local APIs.
 */

import {
  IAgent,
  AgentDefinition,
  AgentExecutionContext,
  AgentExecutionResult,
} from '../agents/agent.interface.js';
import { ApplicationManager } from './application-manager.js';
import { ResourceType, PermissionLevel } from '../security/types.js';
import { AppAuthorizationStatus } from './app.interface.js';

export interface ApplicationAgentInput {
  action:
    | 'list_apps'
    | 'get_processes'
    | 'launch_app'
    | 'close_app'
    | 'focus_window'
    | 'dispatch_uri'
    | 'send_api_command'
    | 'set_authorization'
    | 'audit_authorization';
  appId?: string;
  args?: string[];
  pid?: number;
  windowTitleFilter?: string;
  uri?: string;
  endpoint?: string;
  payload?: Record<string, unknown>;
  authToken?: string;
  status?: AppAuthorizationStatus;
  simulate?: boolean;
}

export class ApplicationControlAgent implements IAgent {
  public readonly definition: AgentDefinition = {
    id: 'app-control-agent',
    name: 'JARVIS Application Control Agent',
    description:
      'Controlled interface with authorized desktop and development software for application launching, process discovery, window focus, deep-link dispatch, and local API integration under strict security boundaries.',
    version: '1.0.0',
    capabilities: [
      'list_apps',
      'get_processes',
      'launch_app',
      'close_app',
      'focus_window',
      'dispatch_uri',
      'send_api_command',
      'set_authorization',
      'audit_authorization',
    ],
    requiredPermissions: [
      {
        resource: ResourceType.APPLICATIONS,
        action: 'read',
        level: PermissionLevel.READ,
      },
    ],
    inputSchema: {
      type: 'object',
      properties: {
        action: {
          type: 'string',
          enum: [
            'list_apps',
            'get_processes',
            'launch_app',
            'close_app',
            'focus_window',
            'dispatch_uri',
            'send_api_command',
            'set_authorization',
            'audit_authorization',
          ],
        },
        appId: { type: 'string' },
        args: { type: 'array', items: { type: 'string' } },
        pid: { type: 'number' },
        windowTitleFilter: { type: 'string' },
        uri: { type: 'string' },
        endpoint: { type: 'string' },
        payload: { type: 'object' },
        authToken: { type: 'string' },
        status: { type: 'string', enum: ['authorized', 'pending', 'blocked'] },
        simulate: { type: 'boolean' },
      },
      required: ['action'],
    },
    outputSchema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'any' },
        message: { type: 'string' },
      },
    },
    status: 'implemented',
  };

  constructor(private appManager: ApplicationManager) {}

  public async execute(rawInput: unknown, context: AgentExecutionContext): Promise<AgentExecutionResult> {
    const start = Date.now();
    const input = (rawInput || {}) as ApplicationAgentInput;
    const userId = context.userId || 'default_user';

    try {
      let data: any;

      switch (input.action) {
        case 'list_apps':
          data = this.appManager.listInstalledApps(userId);
          break;

        case 'get_processes':
          data = await this.appManager.getRunningProcesses(userId);
          break;

        case 'launch_app':
          if (!input.appId) throw new Error('Field "appId" is required for launch_app.');
          data = await this.appManager.launchApp(
            input.appId,
            input.args,
            input.simulate !== false,
            userId
          );
          break;

        case 'close_app':
          if (!input.appId) throw new Error('Field "appId" is required for close_app.');
          data = await this.appManager.closeApp(
            input.appId,
            input.pid,
            input.simulate !== false,
            userId
          );
          break;

        case 'focus_window':
          if (!input.appId) throw new Error('Field "appId" is required for focus_window.');
          data = await this.appManager.focusWindow(
            input.appId,
            input.windowTitleFilter,
            input.simulate !== false,
            userId
          );
          break;

        case 'dispatch_uri':
          if (!input.appId || !input.uri) {
            throw new Error('Fields "appId" and "uri" are required for dispatch_uri.');
          }
          data = await this.appManager.dispatchUri(
            input.appId,
            input.uri,
            input.simulate !== false,
            userId
          );
          break;

        case 'send_api_command':
          if (!input.appId || !input.endpoint) {
            throw new Error('Fields "appId" and "endpoint" are required for send_api_command.');
          }
          data = await this.appManager.sendApiCommand(
            input.appId,
            input.endpoint,
            input.payload,
            input.authToken,
            input.simulate !== false,
            userId
          );
          break;

        case 'set_authorization':
          if (!input.appId || !input.status) {
            throw new Error('Fields "appId" and "status" are required for set_authorization.');
          }
          data = this.appManager.setAppAuthorization(input.appId, input.status, userId);
          break;

        case 'audit_authorization':
          data = this.appManager.getAuditSummary(userId);
          break;

        default:
          throw new Error(`Unsupported action "${input.action}" in ApplicationControlAgent.`);
      }

      return {
        success: true,
        agentId: this.definition.id,
        data,
        executionTimeMs: Date.now() - start,
      };
    } catch (err: any) {
      return {
        success: false,
        agentId: this.definition.id,
        error: err.message,
        executionTimeMs: Date.now() - start,
      };
    }
  }
}
