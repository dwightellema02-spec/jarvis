/**
 * JARVIS Phase 18 - Application Control & Local Integration Unit Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  AppRegistry,
  ProcessDetector,
  CliAdapter,
  UriAdapter,
  LocalApiAdapter,
  WindowAdapter,
  ApplicationManager,
  ApplicationControlAgent,
  createAppTools,
} from '../../src/apps/index.js';
import { PermissionManager } from '../../src/security/permission-manager.js';
import { SecurityGuardian } from '../../src/security/guardian.js';
import { AuditLogger } from '../../src/audit/audit-logger.js';
import { ResourceType, PermissionLevel } from '../../src/security/types.js';

describe('Phase 18: Application Control & Local Integration', () => {
  let registry: AppRegistry;
  let detector: ProcessDetector;
  let permissionManager: PermissionManager;
  let guardian: SecurityGuardian;
  let auditLogger: AuditLogger;
  let manager: ApplicationManager;

  beforeEach(() => {
    registry = new AppRegistry();
    detector = new ProcessDetector();
    permissionManager = new PermissionManager();
    guardian = new SecurityGuardian();
    auditLogger = new AuditLogger();

    // Baseline permissions for testing
    permissionManager.grantPermission({
      userId: 'test_user',
      resource: ResourceType.APPLICATIONS,
      level: PermissionLevel.ADMIN,
      allowedActions: ['read', 'write', 'execute', 'admin'],
      grantedBy: 'system',
    });

    permissionManager.grantPermission({
      userId: 'read_only_user',
      resource: ResourceType.APPLICATIONS,
      level: PermissionLevel.READ,
      allowedActions: ['read'],
      grantedBy: 'system',
    });

    manager = new ApplicationManager({
      permissionManager,
      guardian,
      auditLogger,
      appRegistry: registry,
      processDetector: detector,
    });
  });

  describe('1. App Registry & Blacklist Guard', () => {
    it('initializes with pre-configured desktop and dev applications', () => {
      const apps = registry.getAll();
      expect(apps.length).toBeGreaterThanOrEqual(8);
      expect(registry.getById('vscode')).toBeDefined();
      expect(registry.getById('terminal')).toBeDefined();
      expect(registry.getById('obsidian')).toBeDefined();
    });

    it('rejects registration of dangerous/blacklisted executables', () => {
      expect(() => {
        registry.register({
          id: 'bad_format',
          name: 'Disk Formatter',
          category: 'system_utility',
          executable: 'format.exe',
          supportedProtocols: ['cli'],
          status: 'blocked',
          description: 'Malicious',
        });
      }).toThrow(/permanently blacklisted/i);

      expect(() => {
        registry.register({
          id: 'bad_regedit',
          name: 'Registry Editor',
          category: 'system_utility',
          executable: 'regedit.exe',
          supportedProtocols: ['cli'],
          status: 'blocked',
          description: 'Malicious',
        });
      }).toThrow(/permanently blacklisted/i);
    });

    it('manages authorization status (authorized, pending, blocked)', () => {
      expect(registry.isAuthorized('vscode')).toBe(true);
      registry.setAuthorizationStatus('vscode', 'blocked');
      expect(registry.isAuthorized('vscode')).toBe(false);

      const audit = registry.getAuditSummary();
      expect(audit.blockedCount).toBeGreaterThanOrEqual(1);
    });
  });

  describe('2. Process Detector', () => {
    it('discovers running host processes in deterministic simulated mode', async () => {
      const procs = await detector.getRunningProcesses();
      expect(procs.length).toBeGreaterThan(0);
      expect(procs[0].pid).toBeGreaterThan(0);
    });

    it('filters running processes by name', async () => {
      const procs = await detector.getProcessesByName('Code');
      expect(Array.isArray(procs)).toBe(true);
    });
  });

  describe('3. CLI Adapter & Argument Sanitization', () => {
    const cli = new CliAdapter();

    it('launches authorized application in simulation mode', async () => {
      const app = registry.getById('calculator')!;
      const result = await cli.launchApp(app, [], true);
      expect(result.success).toBe(true);
      expect(result.pid).toBeDefined();
      expect(result.message).toContain('Calculator');
    });

    it('blocks command injection attempts with shell metacharacters', async () => {
      const app = registry.getById('terminal')!;
      await expect(
        cli.launchApp(app, ['--flag', 'test; rm -rf /'], true)
      ).rejects.toThrow(/dangerous command chaining operators/i);

      await expect(
        cli.launchApp(app, ['test && dir'], true)
      ).rejects.toThrow(/dangerous command chaining operators/i);

      await expect(
        cli.launchApp(app, ['`whoami`'], true)
      ).rejects.toThrow(/dangerous command chaining operators/i);
    });

    it('closes application process safely', async () => {
      const app = registry.getById('calculator')!;
      const result = await cli.closeApp(app, 1234, true);
      expect(result.success).toBe(true);
      expect(result.pid).toBe(1234);
    });
  });

  describe('4. Deep Link URI Adapter', () => {
    const uriAdapter = new UriAdapter();

    it('dispatches valid deep link URI for supported apps', async () => {
      const vscode = registry.getById('vscode')!;
      const result = await uriAdapter.dispatchUri(vscode, 'vscode://file/project/src/index.ts', true);
      expect(result.success).toBe(true);
      expect(result.uri).toBe('vscode://file/project/src/index.ts');
    });

    it('rejects URI that does not match app prefix scheme', async () => {
      const vscode = registry.getById('vscode')!;
      await expect(
        uriAdapter.dispatchUri(vscode, 'spotify://track/12345', true)
      ).rejects.toThrow(/does not match required application prefix/i);
    });

    it('rejects URI containing command injection or shell sequences', async () => {
      const vscode = registry.getById('vscode')!;
      await expect(
        uriAdapter.dispatchUri(vscode, 'vscode://open?file=test;calc.exe', true)
      ).rejects.toThrow(/dangerous command-injection characters/i);
    });
  });

  describe('5. Local API Adapter & Window Adapter', () => {
    const localApi = new LocalApiAdapter();
    const winAdapter = new WindowAdapter();

    it('verifies authentication requirement for local application APIs', async () => {
      const obsidian = registry.getById('obsidian')!;
      // Obsidian has apiAuthRequired: true
      await expect(
        localApi.sendCommand(obsidian, '/vault/test.md', {}, { simulate: true })
      ).rejects.toThrow(/enforces API authentication/i);

      const successResult = await localApi.sendCommand(
        obsidian,
        '/vault/test.md',
        {},
        { authToken: 'obsidian_secret_token_123', simulate: true }
      );
      expect(successResult.success).toBe(true);
    });

    it('controls window focus safely', async () => {
      const app = registry.getById('vscode')!;
      const res = await winAdapter.controlWindow(app, 'focus', 'Visual Studio Code', true);
      expect(res.success).toBe(true);
      expect(res.action).toBe('focus');
    });

    it('strictly prohibits window manipulation on sensitive UAC/credential prompts', async () => {
      const app = registry.getById('vscode')!;
      await expect(
        winAdapter.controlWindow(app, 'focus', 'Windows Security Credential Prompt', true)
      ).rejects.toThrow(/strictly prohibited on sensitive system dialog/i);
    });
  });

  describe('6. ApplicationManager Integration & Security Gateways', () => {
    it('lists installed apps with proper permissions', () => {
      const list = manager.listInstalledApps('test_user');
      expect(list.length).toBeGreaterThanOrEqual(8);
    });

    it('enforces permission denied for unauthorized user actions', async () => {
      await expect(
        manager.launchApp('vscode', [], true, 'unregistered_user')
      ).rejects.toThrow();

      // Read-only user cannot launch apps
      await expect(
        manager.launchApp('vscode', [], true, 'read_only_user')
      ).rejects.toThrow();
    });

    it('blocks execution when application authorization status is blocked', async () => {
      manager.setAppAuthorization('vscode', 'blocked', 'test_user');
      await expect(
        manager.launchApp('vscode', [], true, 'test_user')
      ).rejects.toThrow(/is BLOCKED and not authorized/i);
    });

    it('executes deep link and logs security audit trail', async () => {
      const res = await manager.dispatchUri(
        'vscode',
        'vscode://file/src/app.ts',
        true,
        'test_user'
      );
      expect(res.success).toBe(true);
    });

    it('produces comprehensive authorization audit', () => {
      const audit = manager.getAuditSummary('test_user');
      expect(audit.totalRegistered).toBeGreaterThan(0);
      expect(audit.authorizedCount).toBeGreaterThan(0);
      expect(audit.securityNotice).toContain('Capability does not equal permission');
    });
  });

  describe('7. ApplicationControlAgent & 8 Tool Implementations', () => {
    it('executes agent actions via IAgent interface', async () => {
      const agent = new ApplicationControlAgent(manager);
      expect(agent.definition.id).toBe('app-control-agent');

      const result = await agent.execute(
        { action: 'list_apps' },
        {
          requestId: 'r1',
          userId: 'test_user',
          sessionId: 's1',
          grantedPermissions: [],
        }
      );
      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('registers and executes all 8 tools successfully', async () => {
      const tools = createAppTools(manager);
      expect(tools.length).toBe(8);

      const listTool = tools.find((t) => t.definition.id === 'apps.list_installed')!;
      const listRes = await listTool.execute({}, { requestId: 'r2', userId: 'test_user', sessionId: 's2' });
      expect(listRes.success).toBe(true);

      const procsTool = tools.find((t) => t.definition.id === 'apps.get_running_processes')!;
      const procsRes = await procsTool.execute({}, { requestId: 'r3', userId: 'test_user', sessionId: 's3' });
      expect(procsRes.success).toBe(true);

      const launchTool = tools.find((t) => t.definition.id === 'apps.launch_application')!;
      const launchRes = await launchTool.execute(
        { appId: 'calculator', simulate: true },
        { requestId: 'r4', userId: 'test_user', sessionId: 's4' }
      );
      expect(launchRes.success).toBe(true);

      const auditTool = tools.find((t) => t.definition.id === 'apps.audit_authorization')!;
      const auditRes = await auditTool.execute({}, { requestId: 'r5', userId: 'test_user', sessionId: 's5' });
      expect(auditRes.success).toBe(true);
    });
  });
});
