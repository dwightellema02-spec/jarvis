/**
 * JARVIS Phase 11 - Development Environment Agent
 * Implements IAgent for terminal commands, git operations, dependency audits,
 * and build/test runner execution.
 */

import {
  IAgent,
  AgentDefinition,
  AgentExecutionContext,
  AgentExecutionResult,
} from '../agents/agent.interface.js';
import { PermissionLevel, ResourceType } from '../security/types.js';
import { DevEnvManager } from './devenv-manager.js';

export interface DevEnvAgentInput {
  action:
    | 'execute_command'
    | 'analyze_command'
    | 'git_status'
    | 'git_diff'
    | 'git_log'
    | 'git_branches'
    | 'git_commit'
    | 'package_overview'
    | 'audit_dependencies'
    | 'run_build'
    | 'run_typecheck'
    | 'run_tests';
  command?: string;
  cwd?: string;
  confirmed?: boolean;
  timeoutMs?: number;
  staged?: boolean;
  limit?: number;
  commitMessage?: string;
  filter?: string;
}

export class DevEnvAgent implements IAgent {
  public readonly definition: AgentDefinition = {
    id: 'devenv-agent',
    name: 'Development Environment Agent',
    description:
      'Coordinates shell terminal execution under risk guardrails, git repository operations, package dependencies, and build/test runners.',
    version: '1.0.0',
    capabilities: [
      'execute_command',
      'analyze_command',
      'git_status',
      'git_diff',
      'git_log',
      'git_branches',
      'git_commit',
      'package_overview',
      'audit_dependencies',
      'run_build',
      'run_typecheck',
      'run_tests',
    ],
    requiredPermissions: [
      { resource: ResourceType.SYSTEM, action: 'execute', level: PermissionLevel.EXECUTE },
      { resource: ResourceType.SYSTEM, action: 'read', level: PermissionLevel.READ },
    ],
    inputSchema: { type: 'object' },
    outputSchema: { type: 'object' },
    status: 'enabled',
  };

  private devEnvManager: DevEnvManager;

  constructor(devEnvManager: DevEnvManager) {
    this.devEnvManager = devEnvManager;
  }

  public async execute(rawInput: unknown, context: AgentExecutionContext): Promise<AgentExecutionResult> {
    const startTime = Date.now();
    const input = (rawInput || {}) as DevEnvAgentInput;
    const userId = context.userId || 'default_user';

    try {
      switch (input.action) {
        case 'execute_command': {
          if (!input.command) {
            return {
              success: false,
              agentId: this.definition.id,
              error: 'Field "command" is required for action "execute_command".',
              executionTimeMs: Date.now() - startTime,
            };
          }
          const result = await this.devEnvManager.executeCommand(
            {
              command: input.command,
              cwd: input.cwd,
              confirmed: input.confirmed,
              timeoutMs: input.timeoutMs,
            },
            userId
          );
          return {
            success: !result.blocked && result.exitCode === 0,
            agentId: this.definition.id,
            data: result,
            executionTimeMs: Date.now() - startTime,
          };
        }

        case 'analyze_command': {
          if (!input.command) {
            return {
              success: false,
              agentId: this.definition.id,
              error: 'Field "command" is required for action "analyze_command".',
              executionTimeMs: Date.now() - startTime,
            };
          }
          const analysis = this.devEnvManager.analyzeCommand(input.command);
          return {
            success: true,
            agentId: this.definition.id,
            data: analysis,
            executionTimeMs: Date.now() - startTime,
          };
        }

        case 'git_status': {
          const status = await this.devEnvManager.getGitStatus(input.cwd, userId);
          return {
            success: true,
            agentId: this.definition.id,
            data: status,
            executionTimeMs: Date.now() - startTime,
          };
        }

        case 'git_diff': {
          const diff = await this.devEnvManager.getGitDiff(Boolean(input.staged), input.cwd, userId);
          return {
            success: true,
            agentId: this.definition.id,
            data: { diff },
            executionTimeMs: Date.now() - startTime,
          };
        }

        case 'git_log': {
          const log = await this.devEnvManager.getGitLog(input.limit || 10, input.cwd, userId);
          return {
            success: true,
            agentId: this.definition.id,
            data: { entries: log, count: log.length },
            executionTimeMs: Date.now() - startTime,
          };
        }

        case 'git_branches': {
          const branches = await this.devEnvManager.getGitBranches(input.cwd, userId);
          return {
            success: true,
            agentId: this.definition.id,
            data: { branches },
            executionTimeMs: Date.now() - startTime,
          };
        }

        case 'git_commit': {
          if (!input.commitMessage) {
            return {
              success: false,
              agentId: this.definition.id,
              error: 'Field "commitMessage" is required for action "git_commit".',
              executionTimeMs: Date.now() - startTime,
            };
          }
          const res = await this.devEnvManager.commitGit(
            input.commitMessage,
            Boolean(input.confirmed),
            input.cwd,
            userId
          );
          return {
            success: res.success,
            agentId: this.definition.id,
            data: res,
            executionTimeMs: Date.now() - startTime,
          };
        }

        case 'package_overview': {
          const overview = this.devEnvManager.getPackageOverview(input.cwd, userId);
          return {
            success: true,
            agentId: this.definition.id,
            data: overview,
            executionTimeMs: Date.now() - startTime,
          };
        }

        case 'audit_dependencies': {
          const audit = await this.devEnvManager.auditDependencies(input.cwd, userId);
          return {
            success: true,
            agentId: this.definition.id,
            data: audit,
            executionTimeMs: Date.now() - startTime,
          };
        }

        case 'run_build': {
          const buildResult = await this.devEnvManager.runBuild(input.cwd, userId);
          return {
            success: buildResult.success,
            agentId: this.definition.id,
            data: buildResult,
            executionTimeMs: Date.now() - startTime,
          };
        }

        case 'run_typecheck': {
          const tcResult = await this.devEnvManager.runTypecheck(input.cwd, userId);
          return {
            success: tcResult.success,
            agentId: this.definition.id,
            data: tcResult,
            executionTimeMs: Date.now() - startTime,
          };
        }

        case 'run_tests': {
          const testResult = await this.devEnvManager.runTests(input.cwd, input.filter, userId);
          return {
            success: testResult.success,
            agentId: this.definition.id,
            data: testResult,
            executionTimeMs: Date.now() - startTime,
          };
        }

        default:
          return {
            success: false,
            agentId: this.definition.id,
            error: `Unsupported action: "${input.action}"`,
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
