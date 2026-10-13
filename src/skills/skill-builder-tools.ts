import { ITool, ToolDefinition, ToolExecutionContext, ToolExecutionResult } from '../tools/tool.interface.js';
import { SkillBuilderManager } from './skill-builder-manager.js';
import { PermissionLevel, ResourceType } from '../security/types.js';

export class DraftSkillTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'skill_builder.draft_skill',
    name: 'Draft Custom Skill / Tool',
    description: 'Initializes a new custom tool or API adapter draft with schema, implementation scaffold, and test cases',
    requiredPermissions: [{ resource: ResourceType.SYSTEM, action: 'write', level: PermissionLevel.WRITE }],
    parametersSchema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        description: { type: 'string' },
        type: { type: 'string', enum: ['api_adapter', 'data_transformer', 'automation_script', 'custom_solver', 'workflow'] },
        promptOrSpec: { type: 'string' },
        parametersSchema: { type: 'object' },
      },
      required: ['name', 'description', 'type'],
    },
    status: 'implemented',
    version: '0.24.0',
  };

  constructor(private manager: SkillBuilderManager) {}

  public async execute(params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const start = Date.now();
    try {
      const p = (params || {}) as any;
      const draft = this.manager.draftSkill(p, context.userId);
      return {
        success: true,
        toolId: this.definition.id,
        data: draft,
        verified: true,
        executionTimeMs: Date.now() - start,
      };
    } catch (err: any) {
      return {
        success: false,
        toolId: this.definition.id,
        error: err.message,
        verified: false,
        executionTimeMs: Date.now() - start,
      };
    }
  }
}

export class GenerateImplementationTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'skill_builder.generate_implementation',
    name: 'Generate Skill Implementation Code',
    description: 'Scaffolds or refactors the sandboxed TypeScript/JavaScript execution handler for a skill draft',
    requiredPermissions: [{ resource: ResourceType.SYSTEM, action: 'write', level: PermissionLevel.WRITE }],
    parametersSchema: {
      type: 'object',
      properties: {
        skillId: { type: 'string' },
        prompt: { type: 'string' },
      },
      required: ['skillId'],
    },
    status: 'implemented',
    version: '0.24.0',
  };

  constructor(private manager: SkillBuilderManager) {}

  public async execute(params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const start = Date.now();
    try {
      const p = (params || {}) as any;
      const skill = this.manager.getSkill(p.skillId, context.userId);
      return {
        success: true,
        toolId: this.definition.id,
        data: {
          skillId: skill.id,
          implementationCode: skill.implementationCode,
          status: skill.status,
        },
        verified: true,
        executionTimeMs: Date.now() - start,
      };
    } catch (err: any) {
      return {
        success: false,
        toolId: this.definition.id,
        error: err.message,
        verified: false,
        executionTimeMs: Date.now() - start,
      };
    }
  }
}

export class TestSkillTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'skill_builder.test_skill',
    name: 'Test Skill in Sandbox',
    description: 'Executes static security screening and test cases inside an isolated sandbox runner',
    requiredPermissions: [{ resource: ResourceType.SYSTEM, action: 'write', level: PermissionLevel.WRITE }],
    parametersSchema: {
      type: 'object',
      properties: {
        skillId: { type: 'string' },
      },
      required: ['skillId'],
    },
    status: 'implemented',
    version: '0.24.0',
  };

  constructor(private manager: SkillBuilderManager) {}

  public async execute(params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const start = Date.now();
    try {
      const p = (params || {}) as any;
      const report = await this.manager.testSkill(p.skillId, context.userId);
      return {
        success: true,
        toolId: this.definition.id,
        data: report,
        verified: true,
        executionTimeMs: Date.now() - start,
      };
    } catch (err: any) {
      return {
        success: false,
        toolId: this.definition.id,
        error: err.message,
        verified: false,
        executionTimeMs: Date.now() - start,
      };
    }
  }
}

export class ReviewAndApproveTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'skill_builder.review_and_approve',
    name: 'Review & Approve Custom Skill',
    description: 'Enforces human-in-the-loop governance: approves or rejects a tested skill draft before installation',
    requiredPermissions: [{ resource: ResourceType.SYSTEM, action: 'admin', level: PermissionLevel.ADMIN }],
    parametersSchema: {
      type: 'object',
      properties: {
        skillId: { type: 'string' },
        approved: { type: 'boolean' },
        reason: { type: 'string' },
      },
      required: ['skillId', 'approved'],
    },
    status: 'implemented',
    version: '0.24.0',
  };

  constructor(private manager: SkillBuilderManager) {}

  public async execute(params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const start = Date.now();
    try {
      const p = (params || {}) as any;
      const skill = this.manager.reviewAndApprove(p.skillId, p.approved, p.reason, context.userId);
      return {
        success: true,
        toolId: this.definition.id,
        data: skill,
        verified: true,
        executionTimeMs: Date.now() - start,
      };
    } catch (err: any) {
      return {
        success: false,
        toolId: this.definition.id,
        error: err.message,
        verified: false,
        executionTimeMs: Date.now() - start,
      };
    }
  }
}

export class InstallSkillTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'skill_builder.install_skill',
    name: 'Install Skill to Tool Registry',
    description: 'Compiles and registers the verified tool into active ToolRegistry, making it immediately callable',
    requiredPermissions: [{ resource: ResourceType.SYSTEM, action: 'admin', level: PermissionLevel.ADMIN }],
    parametersSchema: {
      type: 'object',
      properties: {
        skillId: { type: 'string' },
      },
      required: ['skillId'],
    },
    status: 'implemented',
    version: '0.24.0',
  };

  constructor(private manager: SkillBuilderManager) {}

  public async execute(params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const start = Date.now();
    try {
      const p = (params || {}) as any;
      const skill = this.manager.installSkill(p.skillId, context.userId);
      return {
        success: true,
        toolId: this.definition.id,
        data: skill,
        verified: true,
        executionTimeMs: Date.now() - start,
      };
    } catch (err: any) {
      return {
        success: false,
        toolId: this.definition.id,
        error: err.message,
        verified: false,
        executionTimeMs: Date.now() - start,
      };
    }
  }
}

export class UninstallSkillTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'skill_builder.uninstall_skill',
    name: 'Uninstall Skill from Registry',
    description: 'Safely deregisters or disables a custom tool from active ToolRegistry',
    requiredPermissions: [{ resource: ResourceType.SYSTEM, action: 'admin', level: PermissionLevel.ADMIN }],
    parametersSchema: {
      type: 'object',
      properties: {
        skillId: { type: 'string' },
      },
      required: ['skillId'],
    },
    status: 'implemented',
    version: '0.24.0',
  };

  constructor(private manager: SkillBuilderManager) {}

  public async execute(params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const start = Date.now();
    try {
      const p = (params || {}) as any;
      const skill = this.manager.uninstallSkill(p.skillId, context.userId);
      return {
        success: true,
        toolId: this.definition.id,
        data: skill,
        verified: true,
        executionTimeMs: Date.now() - start,
      };
    } catch (err: any) {
      return {
        success: false,
        toolId: this.definition.id,
        error: err.message,
        verified: false,
        executionTimeMs: Date.now() - start,
      };
    }
  }
}

export class ListSkillsTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'skill_builder.list_skills',
    name: 'List Custom Skills',
    description: 'Retrieves all custom skills, tools, and API adapters along with their lifecycle statuses',
    requiredPermissions: [{ resource: ResourceType.SYSTEM, action: 'read', level: PermissionLevel.READ }],
    parametersSchema: {
      type: 'object',
      properties: {
        status: { type: 'string' },
      },
    },
    status: 'implemented',
    version: '0.24.0',
  };

  constructor(private manager: SkillBuilderManager) {}

  public async execute(params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const start = Date.now();
    try {
      const p = (params || {}) as any;
      const skills = this.manager.listSkills(p.status, context.userId);
      return {
        success: true,
        toolId: this.definition.id,
        data: skills,
        verified: true,
        executionTimeMs: Date.now() - start,
      };
    } catch (err: any) {
      return {
        success: false,
        toolId: this.definition.id,
        error: err.message,
        verified: false,
        executionTimeMs: Date.now() - start,
      };
    }
  }
}

export class GetSkillDetailsTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'skill_builder.get_skill_details',
    name: 'Get Skill Details',
    description: 'Returns full source code, parameters schema, test suite, and lifecycle audit for a custom tool',
    requiredPermissions: [{ resource: ResourceType.SYSTEM, action: 'read', level: PermissionLevel.READ }],
    parametersSchema: {
      type: 'object',
      properties: {
        skillId: { type: 'string' },
      },
      required: ['skillId'],
    },
    status: 'implemented',
    version: '0.24.0',
  };

  constructor(private manager: SkillBuilderManager) {}

  public async execute(params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const start = Date.now();
    try {
      const p = (params || {}) as any;
      const skill = this.manager.getSkill(p.skillId, context.userId);
      return {
        success: true,
        toolId: this.definition.id,
        data: skill,
        verified: true,
        executionTimeMs: Date.now() - start,
      };
    } catch (err: any) {
      return {
        success: false,
        toolId: this.definition.id,
        error: err.message,
        verified: false,
        executionTimeMs: Date.now() - start,
      };
    }
  }
}

export function createSkillBuilderTools(manager: SkillBuilderManager): ITool[] {
  return [
    new DraftSkillTool(manager),
    new GenerateImplementationTool(manager),
    new TestSkillTool(manager),
    new ReviewAndApproveTool(manager),
    new InstallSkillTool(manager),
    new UninstallSkillTool(manager),
    new ListSkillsTool(manager),
    new GetSkillDetailsTool(manager),
  ];
}
