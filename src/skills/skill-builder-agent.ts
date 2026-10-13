import {
  IAgent,
  AgentDefinition,
  AgentExecutionContext,
  AgentExecutionResult,
} from '../agents/agent.interface.js';
import { SkillBuilderManager } from './skill-builder-manager.js';
import { PermissionLevel, ResourceType } from '../security/types.js';

export class SkillBuilderAgent implements IAgent {
  public readonly definition: AgentDefinition = {
    id: 'skill-builder-agent',
    name: 'Skill & Tool Builder Agent',
    description: 'Synthesizes, tests in sandbox, and hot-registers custom tools and API adapters under strict operator governance',
    version: '0.24.0-phase24',
    capabilities: [
      'draft_skill',
      'generate_implementation',
      'test_sandbox',
      'review_and_approve',
      'install_skill',
      'uninstall_skill',
      'list_custom_skills',
    ],
    requiredPermissions: [{ resource: ResourceType.SYSTEM, action: 'read', level: PermissionLevel.READ }],
    inputSchema: {
      type: 'object',
      properties: {
        action: {
          type: 'string',
          enum: [
            'draft',
            'test',
            'approve',
            'install',
            'uninstall',
            'list',
            'get',
          ],
        },
        skillId: { type: 'string' },
        request: { type: 'object' },
        approved: { type: 'boolean' },
        reason: { type: 'string' },
      },
    },
    outputSchema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'object' },
      },
    },
    status: 'implemented',
  };

  constructor(private manager: SkillBuilderManager) {}

  public async execute(input: unknown, context: AgentExecutionContext): Promise<AgentExecutionResult> {
    const startTime = Date.now();
    const payload = (input || {}) as Record<string, any>;
    const action = payload.action || 'list';

    try {
      let data: any;

      switch (action) {
        case 'draft':
          if (!payload.request) {
            throw new Error('Action "draft" requires a "request" object');
          }
          data = this.manager.draftSkill(payload.request, context.userId);
          break;

        case 'test':
          if (!payload.skillId) {
            throw new Error('Action "test" requires "skillId"');
          }
          data = await this.manager.testSkill(payload.skillId, context.userId);
          break;

        case 'approve':
          if (!payload.skillId) {
            throw new Error('Action "approve" requires "skillId"');
          }
          data = this.manager.reviewAndApprove(
            payload.skillId,
            payload.approved ?? true,
            payload.reason,
            context.userId
          );
          break;

        case 'install':
          if (!payload.skillId) {
            throw new Error('Action "install" requires "skillId"');
          }
          data = this.manager.installSkill(payload.skillId, context.userId);
          break;

        case 'uninstall':
          if (!payload.skillId) {
            throw new Error('Action "uninstall" requires "skillId"');
          }
          data = this.manager.uninstallSkill(payload.skillId, context.userId);
          break;

        case 'get':
          if (!payload.skillId) {
            throw new Error('Action "get" requires "skillId"');
          }
          data = this.manager.getSkill(payload.skillId, context.userId);
          break;

        case 'list':
        default:
          data = this.manager.listSkills(payload.statusFilter, context.userId);
          break;
      }

      return {
        success: true,
        agentId: this.definition.id,
        data,
        executionTimeMs: Date.now() - startTime,
      };
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
