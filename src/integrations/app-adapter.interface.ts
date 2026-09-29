import { ResourcePermission } from '../security/types.js';

export interface ApplicationAdapter {
  readonly id: string;
  readonly applicationName: string;
  readonly integrationType: 'official_api' | 'plugin' | 'controlled_automation';
  readonly requiredPermissions: ResourcePermission[];
  
  connect(): Promise<boolean>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
  getCapabilities(): string[];
  executeAction(action: string, payload: unknown): Promise<{ success: boolean; result?: unknown; error?: string }>;
}
