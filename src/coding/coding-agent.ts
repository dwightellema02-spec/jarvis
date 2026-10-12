/**
 * JARVIS Phase 10 - Coding Agent
 * Implements IAgent for repository inspection, code search, analysis,
 * safe patch application, rollbacks, and runtime debugging.
 */

import {
  IAgent,
  AgentDefinition,
  AgentExecutionContext,
  AgentExecutionResult,
} from '../agents/agent.interface.js';
import { PermissionLevel, ResourceType } from '../security/types.js';
import { CodingManager } from './coding-manager.js';
import { CodeDiffProposal } from './coding.interface.js';

export interface CodingAgentInput {
  action:
    | 'inspect_repo'
    | 'search_code'
    | 'analyze_file'
    | 'review_file'
    | 'propose_patch'
    | 'apply_patch'
    | 'rollback'
    | 'debug_error';
  rootPath?: string;
  filePath?: string;
  query?: string;
  isRegex?: boolean;
  targetContent?: string;
  replacementContent?: string;
  reason?: string;
  proposal?: CodeDiffProposal;
  confirmed?: boolean;
  rawError?: string;
}

export class CodingAgent implements IAgent {
  public readonly definition: AgentDefinition = {
    id: 'coding-agent',
    name: 'Coding Agent',
    description:
      'Inspects repositories, analyzes symbol complexity, searches code, safely modifies files with backups and rollbacks, reviews code against security standards, and debugs runtime errors',
    version: '1.0.0',
    capabilities: [
      'inspect_repo',
      'search_code',
      'analyze_file',
      'review_file',
      'propose_patch',
      'apply_patch',
      'rollback',
      'debug_error',
    ],
    requiredPermissions: [
      { resource: ResourceType.FILES, action: 'read', level: PermissionLevel.READ },
      { resource: ResourceType.FILES, action: 'write', level: PermissionLevel.WRITE },
    ],
    inputSchema: { type: 'object' },
    outputSchema: { type: 'object' },
    status: 'implemented',
  };

  constructor(private readonly manager: CodingManager) {}

  public async execute(rawInput: unknown, context: AgentExecutionContext): Promise<AgentExecutionResult> {
    const startTime = Date.now();
    try {
      const input = (rawInput || {}) as CodingAgentInput;
      let resultData: any;

      switch (input.action) {
        case 'inspect_repo': {
          const root = input.rootPath || process.cwd();
          resultData = this.manager.inspectRepository(root, context.userId);
          break;
        }

        case 'search_code': {
          if (!input.query) throw new Error('Action "search_code" requires "query".');
          const root = input.rootPath || process.cwd();
          resultData = this.manager.searchCode(root, input.query, { isRegex: input.isRegex }, context.userId);
          break;
        }

        case 'analyze_file': {
          if (!input.filePath) throw new Error('Action "analyze_file" requires "filePath".');
          resultData = this.manager.analyzeFile(input.filePath, context.userId);
          break;
        }

        case 'review_file': {
          if (!input.filePath) throw new Error('Action "review_file" requires "filePath".');
          resultData = this.manager.reviewFile(input.filePath, context.userId);
          break;
        }

        case 'propose_patch': {
          if (!input.filePath || !input.targetContent || input.replacementContent === undefined) {
            throw new Error('Action "propose_patch" requires "filePath", "targetContent", and "replacementContent".');
          }
          resultData = this.manager.proposeModification(
            input.filePath,
            input.targetContent,
            input.replacementContent,
            input.reason,
            context.userId
          );
          break;
        }

        case 'apply_patch': {
          if (!input.proposal) throw new Error('Action "apply_patch" requires "proposal".');
          resultData = await this.manager.applyModification(input.proposal, input.confirmed, context.userId);
          break;
        }

        case 'rollback': {
          if (!input.filePath) throw new Error('Action "rollback" requires "filePath".');
          resultData = {
            filePath: input.filePath,
            rolledBack: this.manager.rollbackModification(input.filePath, context.userId),
          };
          break;
        }

        case 'debug_error': {
          if (!input.rawError) throw new Error('Action "debug_error" requires "rawError".');
          resultData = this.manager.debugError(input.rawError, input.rootPath || process.cwd());
          break;
        }

        default:
          throw new Error(`Unsupported coding action: ${input.action}`);
      }

      return {
        success: true,
        agentId: this.definition.id,
        data: resultData,
        executionTimeMs: Date.now() - startTime,
      };
    } catch (err: any) {
      return {
        success: false,
        agentId: this.definition.id,
        error: err.message || 'Coding agent execution failed',
        executionTimeMs: Date.now() - startTime,
      };
    }
  }
}
