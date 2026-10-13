/**
 * JARVIS Phase 18 - Application Catalog & Authorization Registry
 */

import { AppDefinition, AppAuthorizationStatus, AppAuthorizationAudit } from './app.interface.js';

export const DEFAULT_APPLICATIONS: AppDefinition[] = [
  {
    id: 'vscode',
    name: 'Visual Studio Code',
    category: 'code_editor',
    executable: 'code',
    supportedProtocols: ['cli', 'uri_scheme', 'ui_automation'],
    uriSchemePrefix: 'vscode://',
    status: 'authorized',
    description: 'Code editor and developer environment',
  },
  {
    id: 'notepad',
    name: 'Text Editor (Notepad)',
    category: 'notes',
    executable: 'notepad',
    supportedProtocols: ['cli', 'ui_automation'],
    status: 'authorized',
    description: 'Quick scratchpad and text note editor',
  },
  {
    id: 'calculator',
    name: 'Calculator',
    category: 'system_utility',
    executable: 'calc',
    supportedProtocols: ['cli', 'ui_automation'],
    status: 'authorized',
    description: 'Mathematical computation desk accessory',
  },
  {
    id: 'terminal',
    name: 'System Terminal',
    category: 'terminal',
    executable: 'wt',
    supportedProtocols: ['cli'],
    status: 'authorized',
    description: 'Windows Terminal / command shell host',
  },
  {
    id: 'obsidian',
    name: 'Obsidian Knowledge Base',
    category: 'notes',
    executable: 'obsidian',
    supportedProtocols: ['uri_scheme', 'api', 'ui_automation'],
    uriSchemePrefix: 'obsidian://',
    apiPort: 27123,
    apiAuthRequired: true,
    status: 'authorized',
    description: 'Markdown second brain and note graph',
  },
  {
    id: 'spotify',
    name: 'Spotify Music Player',
    category: 'media',
    executable: 'spotify',
    supportedProtocols: ['uri_scheme', 'ui_automation'],
    uriSchemePrefix: 'spotify://',
    status: 'authorized',
    description: 'Focus music and audio stream player',
  },
  {
    id: 'slack',
    name: 'Slack Communication',
    category: 'communication',
    executable: 'slack',
    supportedProtocols: ['uri_scheme', 'ui_automation'],
    uriSchemePrefix: 'slack://',
    status: 'pending',
    description: 'Team messaging and collaboration hub',
  },
  {
    id: 'browser_chrome',
    name: 'Google Chrome',
    category: 'browser',
    executable: 'chrome',
    supportedProtocols: ['cli', 'uri_scheme'],
    status: 'authorized',
    description: 'Web navigation and browser renderer',
  },
  {
    id: 'browser_edge',
    name: 'Microsoft Edge',
    category: 'browser',
    executable: 'msedge',
    supportedProtocols: ['cli', 'uri_scheme'],
    status: 'authorized',
    description: 'Default Windows web browser engine',
  },
];

export const BLACKLISTED_EXECUTABLES: RegExp[] = [
  /\bformat(\.exe)?\b/i,
  /\bregedit(\.exe)?\b/i,
  /\brundll32(\.exe)?\b/i,
  /\bvssadmin(\.exe)?\b/i,
  /\bcertutil(\.exe)?\b/i,
  /\bbcdedit(\.exe)?\b/i,
  /\bdiskpart(\.exe)?\b/i,
  /\bdelnode(\.exe)?\b/i,
  /\bshutdown(\.exe)?\b/i,
];

export class AppRegistry {
  private apps: Map<string, AppDefinition> = new Map();

  constructor(initialApps: AppDefinition[] = DEFAULT_APPLICATIONS) {
    for (const app of initialApps) {
      this.apps.set(app.id, { ...app });
    }
  }

  public getAll(): AppDefinition[] {
    return Array.from(this.apps.values());
  }

  public getById(id: string): AppDefinition | undefined {
    return this.apps.get(id);
  }

  public getByExecutable(executable: string): AppDefinition | undefined {
    const norm = executable.toLowerCase().replace(/\.exe$/i, '');
    for (const app of this.apps.values()) {
      if (app.executable.toLowerCase().replace(/\.exe$/i, '') === norm) {
        return app;
      }
    }
    return undefined;
  }

  public registerApp(app: AppDefinition): void {
    if (this.isBlacklisted(app.executable)) {
      throw new Error(`Executable "${app.executable}" is permanently blacklisted by security policy.`);
    }
    this.apps.set(app.id, { ...app });
  }

  public register(app: AppDefinition): void {
    this.registerApp(app);
  }

  public setAuthorizationStatus(id: string, status: AppAuthorizationStatus): boolean {
    const app = this.apps.get(id);
    if (!app) return false;
    if (status === 'authorized' && this.isBlacklisted(app.executable)) {
      throw new Error(`Cannot authorize blacklisted executable "${app.executable}".`);
    }
    app.status = status;
    return true;
  }

  public isAuthorized(id: string): boolean {
    const app = this.apps.get(id);
    if (!app) return false;
    return app.status === 'authorized' && !this.isBlacklisted(app.executable);
  }

  public isBlacklisted(executableOrCommand: string): boolean {
    return BLACKLISTED_EXECUTABLES.some((pattern) => pattern.test(executableOrCommand));
  }

  public getAuditSummary(): AppAuthorizationAudit {
    const list = this.getAll();
    const authorizedCount = list.filter((a) => a.status === 'authorized').length;
    const pendingCount = list.filter((a) => a.status === 'pending').length;
    const blockedCount = list.filter((a) => a.status === 'blocked').length;

    return {
      totalRegistered: list.length,
      authorizedCount,
      pendingCount,
      blockedCount,
      applications: list,
      securityNotice:
        'Capability does not equal permission. Only explicitly authorized applications can be launched or controlled. Dangerous system maintenance utilities are permanently blocked.',
    };
  }
}
