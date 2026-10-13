/**
 * JARVIS Phase 18 - Application Control & Local Integration Interfaces
 */

export type AppCategory =
  | 'productivity'
  | 'code_editor'
  | 'terminal'
  | 'browser'
  | 'media'
  | 'communication'
  | 'notes'
  | 'system_utility';

export type IntegrationProtocol = 'api' | 'cli' | 'uri_scheme' | 'ui_automation';

export type AppAuthorizationStatus = 'authorized' | 'pending' | 'blocked';

export interface AppDefinition {
  id: string;
  name: string;
  category: AppCategory;
  executable: string;
  defaultPath?: string;
  supportedProtocols: IntegrationProtocol[];
  uriSchemePrefix?: string;
  status: AppAuthorizationStatus;
  description: string;
  apiPort?: number;
  apiAuthRequired?: boolean;
}

export interface RunningProcessInfo {
  pid: number;
  processName: string;
  windowTitle: string;
  cpuPercent?: number;
  memoryMb?: number;
  isResponding: boolean;
  startTime?: string;
}

export interface AppLaunchResult {
  success: boolean;
  appId: string;
  pid?: number;
  message: string;
  launchedAt: string;
}

export interface AppCloseResult {
  success: boolean;
  appId: string;
  pid?: number;
  graceful: boolean;
  message: string;
}

export interface AppCommandSpec {
  appId: string;
  protocol: IntegrationProtocol;
  endpointOrCommand: string;
  payload?: Record<string, unknown>;
}

export interface AppCommandResult {
  success: boolean;
  appId: string;
  protocol: IntegrationProtocol;
  response: Record<string, unknown> | string;
  durationMs: number;
}

export interface WindowActionSpec {
  appId: string;
  action: 'focus' | 'minimize' | 'maximize' | 'restore';
  windowTitleFilter?: string;
}

export interface WindowActionResult {
  success: boolean;
  appId: string;
  action: 'focus' | 'minimize' | 'maximize' | 'restore';
  windowTitle: string;
  durationMs: number;
}

export interface AppAuthorizationAudit {
  totalRegistered: number;
  authorizedCount: number;
  pendingCount: number;
  blockedCount: number;
  applications: AppDefinition[];
  securityNotice: string;
}
