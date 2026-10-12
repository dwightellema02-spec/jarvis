import { describe, it, expect, beforeEach } from 'vitest';
import * as path from 'path';
import { DependencyManager } from '../../src/devenv/dependency-manager.js';
import { DevEnvManager } from '../../src/devenv/devenv-manager.js';
import { DevEnvAgent } from '../../src/devenv/devenv-agent.js';
import { PermissionManager } from '../../src/security/permission-manager.js';
import { PermissionLevel, ResourceType } from '../../src/security/types.js';
import { SecurityGuardian } from '../../src/security/guardian.js';
import { TerminalExecutor } from '../../src/devenv/terminal-executor.js';

describe('Phase 11 - Dependencies, Build Runner & Agent Tests', () => {
  let terminalExecutor: TerminalExecutor;
  let dependencyManager: DependencyManager;
  let permissionManager: PermissionManager;
  let guardian: SecurityGuardian;
  let devEnvManager: DevEnvManager;
  let devEnvAgent: DevEnvAgent;
  const projectRoot = path.resolve(__dirname, '../../');

  beforeEach(() => {
    terminalExecutor = new TerminalExecutor(projectRoot);
    dependencyManager = new DependencyManager(terminalExecutor, projectRoot);
    permissionManager = new PermissionManager();
    guardian = new SecurityGuardian();
    devEnvManager = new DevEnvManager(permissionManager, guardian, projectRoot);
    devEnvAgent = new DevEnvAgent(devEnvManager);

    // Baseline grant for default_user
    permissionManager.grantPermission({
      userId: 'default_user',
      resource: ResourceType.SYSTEM,
      level: PermissionLevel.EXECUTE,
      allowedActions: ['read', 'execute', 'write'],
      grantedBy: 'system',
    });
  });

  describe('Dependency Manager', () => {
    it('parses project package.json dependencies and scripts', () => {
      const overview = dependencyManager.getPackageJson(projectRoot);
      expect(overview.name).toBe('jarvis-core');
      expect(overview.scripts.build).toBeDefined();
      expect(overview.scripts.test).toBeDefined();
      expect(overview.totalDependencies).toBeGreaterThan(0);
      expect(overview.totalDevDependencies).toBeGreaterThan(0);
    });

    it('runs dependency audit and reports vulnerability metrics', async () => {
      const report = await dependencyManager.auditDependencies(projectRoot);
      expect(report.severityCounts).toBeDefined();
      expect(typeof report.severityCounts.critical).toBe('number');
      expect(typeof report.severityCounts.high).toBe('number');
      expect(report.advisorySummary).toBeDefined();
    }, 30000);
  });

  describe('DevEnvManager Permission Enforcement', () => {
    it('enforces permission controls and denies unauthorized users without EXECUTE on SYSTEM', async () => {
      const res = await devEnvManager.executeCommand(
        { command: 'node -v' },
        'unauthorized_attacker'
      );

      expect(res.blocked).toBe(true);
      expect(res.blockedReason).toContain('Permission Denied');
    });

    it('blocks dangerous commands evaluated by SecurityGuardian', async () => {
      const res = await devEnvManager.executeCommand(
        { command: 'format c:' },
        'default_user'
      );

      expect(res.blocked).toBe(true);
      expect(res.risk).toBe('CRITICAL');
    });
  });

  describe('DevEnvAgent Execution', () => {
    it('executes action "package_overview" through IAgent interface', async () => {
      const res = await devEnvAgent.execute(
        { action: 'package_overview' },
        { userId: 'default_user', sessionId: 'test_sess', requestId: 'req_1', grantedPermissions: [] }
      );

      expect(res.success).toBe(true);
      expect(res.agentId).toBe('devenv-agent');
      expect((res.data as any).name).toBe('jarvis-core');
    });

    it('executes action "git_status" through IAgent interface', async () => {
      const res = await devEnvAgent.execute(
        { action: 'git_status' },
        { userId: 'default_user', sessionId: 'test_sess', requestId: 'req_2', grantedPermissions: [] }
      );

      expect(res.success).toBe(true);
      expect((res.data as any).isGitRepo).toBe(true);
    });

    it('executes action "analyze_command" through IAgent interface', async () => {
      const res = await devEnvAgent.execute(
        { action: 'analyze_command', command: 'npm install express' },
        { userId: 'default_user', sessionId: 'test_sess', requestId: 'req_3', grantedPermissions: [] }
      );

      expect(res.success).toBe(true);
      expect((res.data as any).risk).toBe('HIGH');
      expect((res.data as any).requiresConfirmation).toBe(true);
    });
  });
});
