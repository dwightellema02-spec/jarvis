/**
 * JARVIS Phase 18 - Application Control Manager
 */

import {
  AppDefinition,
  AppAuthorizationStatus,
  RunningProcessInfo,
  AppLaunchResult,
  AppCloseResult,
  WindowActionResult,
  AppCommandResult,
  AppAuthorizationAudit,
} from './app.interface.js';
import { AppRegistry } from './app-registry.js';
import { ProcessDetector } from './process-detector.js';
import { UriAdapter, UriDispatchResult } from './adapters/uri-adapter.js';
import { CliAdapter } from './adapters/cli-adapter.js';
import { LocalApiAdapter } from './adapters/local-api-adapter.js';
import { WindowAdapter } from './adapters/window-adapter.js';
import { PermissionManager } from '../security/permission-manager.js';
import { SecurityGuardian } from '../security/guardian.js';
import { AuditLogger } from '../audit/audit-logger.js';
import { ResourceType, PermissionLevel, SecurityDecisionType, PermissionAction } from '../security/types.js';
import { PermissionDeniedError, SecurityBlockError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

export interface ApplicationManagerConfig {
  permissionManager?: PermissionManager;
  guardian?: SecurityGuardian;
  auditLogger?: AuditLogger;
  appRegistry?: AppRegistry;
  processDetector?: ProcessDetector;
}

export class ApplicationManager {
  private permissionManager?: PermissionManager;
  private guardian?: SecurityGuardian;
  private auditLogger?: AuditLogger;
  private appRegistry: AppRegistry;
  private processDetector: ProcessDetector;
  private uriAdapter: UriAdapter;
  private cliAdapter: CliAdapter;
  private localApiAdapter: LocalApiAdapter;
  private windowAdapter: WindowAdapter;

  constructor(config: ApplicationManagerConfig = {}) {
    this.permissionManager = config.permissionManager;
    this.guardian = config.guardian;
    this.auditLogger = config.auditLogger;
    this.appRegistry = config.appRegistry || new AppRegistry();
    this.processDetector = config.processDetector || new ProcessDetector();
    this.uriAdapter = new UriAdapter();
    this.cliAdapter = new CliAdapter();
    this.localApiAdapter = new LocalApiAdapter();
    this.windowAdapter = new WindowAdapter();

    logger.info(
      `ApplicationManager initialized with ${this.appRegistry.getAll().length} registered applications.`
    );
  }

  public getRegistry(): AppRegistry {
    return this.appRegistry;
  }

  public getProcessDetector(): ProcessDetector {
    return this.processDetector;
  }

  private checkPermission(
    userId: string,
    action: 'read' | 'write' | 'execute' | 'admin',
    level: PermissionLevel
  ): void {
    if (!this.permissionManager) return;
    const check = this.permissionManager.checkPermission({
      userId,
      resource: ResourceType.APPLICATIONS,
      action,
      requiredLevel: level,
    });
    if (!check.allowed) {
      throw new PermissionDeniedError(ResourceType.APPLICATIONS, action, level, {
        userId,
        reason: check.reason,
      });
    }
  }

  private evaluateThreat(userId: string, target: string, action: PermissionAction = 'open'): void {
    if (!this.guardian) return;
    const evaluation = this.guardian.evaluate({
      resource: ResourceType.APPLICATIONS,
      action,
      target,
      userId,
    });
    if (evaluation.decision === SecurityDecisionType.DENY) {
      throw new SecurityBlockError(evaluation.reason, {
        threats: evaluation.threatsDetected,
      });
    }
  }

  private async auditLog(
    userId: string,
    action: string,
    details: string,
    success = true
  ): Promise<void> {
    if (!this.auditLogger) return;
    await this.auditLogger.log({
      user: userId,
      requestId: `req_app_${Date.now()}`,
      resource: ResourceType.APPLICATIONS,
      action: action as any,
      permissionRequired: PermissionLevel.EXECUTE,
      permissionGranted: PermissionLevel.EXECUTE,
      decision: success ? SecurityDecisionType.ALLOW : SecurityDecisionType.DENY,
      reason: details,
      result: success ? 'SUCCESS' : 'FAILED',
      durationMs: 1,
    });
  }

  // 1. List Catalog
  public listInstalledApps(userId = 'default_user'): AppDefinition[] {
    this.checkPermission(userId, 'read', PermissionLevel.READ);
    return this.appRegistry.getAll();
  }

  // 2. Discover Running Processes
  public async getRunningProcesses(userId = 'default_user'): Promise<RunningProcessInfo[]> {
    this.checkPermission(userId, 'read', PermissionLevel.READ);
    return await this.processDetector.getRunningProcesses();
  }

  // 3. Launch Authorized Application
  public async launchApp(
    appId: string,
    args: string[] = [],
    simulate = true,
    userId = 'default_user'
  ): Promise<AppLaunchResult> {
    this.checkPermission(userId, 'execute', PermissionLevel.EXECUTE);

    const app = this.appRegistry.getById(appId);
    if (!app) {
      throw new Error(`Application ID "${appId}" is not registered in catalog.`);
    }

    if (!this.appRegistry.isAuthorized(appId)) {
      throw new Error(
        `Security Block: Application "${app.name}" is ${app.status.toUpperCase()} and not authorized for execution.`
      );
    }

    this.evaluateThreat(userId, `${app.executable} ${args.join(' ')}`, 'execute');

    const result = await this.cliAdapter.launchApp(app, args, simulate);
    await this.auditLog(userId, 'execute', `Launched app ${app.name} (PID: ${result.pid})`, result.success);
    return result;
  }

  // 4. Close Running Application
  public async closeApp(
    appId: string,
    pid?: number,
    simulate = true,
    userId = 'default_user'
  ): Promise<AppCloseResult> {
    this.checkPermission(userId, 'execute', PermissionLevel.EXECUTE);

    const app = this.appRegistry.getById(appId);
    if (!app) {
      throw new Error(`Application ID "${appId}" is not registered in catalog.`);
    }

    const result = await this.cliAdapter.closeApp(app, pid, simulate);
    await this.auditLog(userId, 'execute', `Terminated app ${app.name} process`, result.success);
    return result;
  }

  // 5. Focus Window (UI Automation)
  public async focusWindow(
    appId: string,
    windowTitleFilter?: string,
    simulate = true,
    userId = 'default_user'
  ): Promise<WindowActionResult> {
    this.checkPermission(userId, 'execute', PermissionLevel.EXECUTE);

    const app = this.appRegistry.getById(appId);
    if (!app) {
      throw new Error(`Application ID "${appId}" is not registered in catalog.`);
    }

    const result = await this.windowAdapter.controlWindow(app, 'focus', windowTitleFilter, simulate);
    await this.auditLog(userId, 'write', `Focused window for ${app.name}: "${result.windowTitle}"`);
    return result;
  }

  // 6. Deep Link URI Dispatch
  public async dispatchUri(
    appId: string,
    uri: string,
    simulate = true,
    userId = 'default_user'
  ): Promise<UriDispatchResult> {
    this.checkPermission(userId, 'write', PermissionLevel.WRITE);

    const app = this.appRegistry.getById(appId);
    if (!app) {
      throw new Error(`Application ID "${appId}" is not registered in catalog.`);
    }

    if (!this.appRegistry.isAuthorized(appId)) {
      throw new Error(`Security Block: Application "${app.name}" is not authorized for URI dispatch.`);
    }

    this.evaluateThreat(userId, uri, 'open');

    const result = await this.uriAdapter.dispatchUri(app, uri, simulate);
    await this.auditLog(userId, 'write', `Dispatched URI ${uri} to ${app.name}`);
    return result;
  }

  // 7. Send Local API Command
  public async sendApiCommand(
    appId: string,
    endpoint: string,
    payload: Record<string, unknown> = {},
    authToken?: string,
    simulate = true,
    userId = 'default_user'
  ): Promise<AppCommandResult> {
    this.checkPermission(userId, 'write', PermissionLevel.WRITE);

    const app = this.appRegistry.getById(appId);
    if (!app) {
      throw new Error(`Application ID "${appId}" is not registered in catalog.`);
    }

    if (!this.appRegistry.isAuthorized(appId)) {
      throw new Error(`Security Block: Application "${app.name}" is not authorized for API commands.`);
    }

    const result = await this.localApiAdapter.sendCommand(app, endpoint, payload, { authToken, simulate });
    await this.auditLog(userId, 'write', `Sent API command to ${app.name} [${endpoint}]`);
    return result;
  }

  // 8. Change App Authorization Status
  public setAppAuthorization(
    appId: string,
    status: AppAuthorizationStatus,
    userId = 'default_user'
  ): AppDefinition {
    this.checkPermission(userId, 'admin', PermissionLevel.ADMIN);

    const app = this.appRegistry.getById(appId);
    if (!app) {
      throw new Error(`Application ID "${appId}" does not exist in registry.`);
    }

    this.appRegistry.setAuthorizationStatus(appId, status);
    logger.info(`App [${appId}] authorization set to "${status}" by user [${userId}]`);
    return { ...this.appRegistry.getById(appId)! };
  }

  // 9. Authorization Audit
  public getAuditSummary(userId = 'default_user'): AppAuthorizationAudit {
    this.checkPermission(userId, 'read', PermissionLevel.READ);
    return this.appRegistry.getAuditSummary();
  }
}
