import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  SandboxRunner,
  SkillGenerator,
  SkillBuilderManager,
  SkillBuilderAgent,
  createSkillBuilderTools,
  DraftSkillTool,
  GenerateImplementationTool,
  TestSkillTool,
  ReviewAndApproveTool,
  InstallSkillTool,
  UninstallSkillTool,
  ListSkillsTool,
  GetSkillDetailsTool,
} from '../../src/skills/index.js';
import { ToolRegistry } from '../../src/tools/tool-registry.js';
import { PermissionManager } from '../../src/security/permission-manager.js';
import { SecurityGuardian } from '../../src/security/guardian.js';
import { AuditLogger } from '../../src/audit/audit-logger.js';
import { PermissionLevel, ResourceType, SecurityDecisionType } from '../../src/security/types.js';

describe('Phase 24 — Skill & Tool Builder Unit Tests', () => {
  let toolRegistry: ToolRegistry;
  let permissionManager: PermissionManager;
  let guardian: SecurityGuardian;
  let auditLogger: AuditLogger;
  let manager: SkillBuilderManager;

  beforeEach(() => {
    toolRegistry = new ToolRegistry();
    permissionManager = new PermissionManager();
    guardian = new SecurityGuardian();
    auditLogger = new AuditLogger();

    // Grant dwight admin on SYSTEM
    permissionManager.grantPermission({
      userId: 'dwight',
      resource: ResourceType.SYSTEM,
      level: PermissionLevel.ADMIN,
      allowedActions: ['read', 'write', 'execute', 'admin'],
      grantedBy: 'system',
    });

    manager = new SkillBuilderManager(toolRegistry, {
      guardian,
      permissionManager,
      auditLogger,
    });
  });

  describe('SandboxRunner', () => {
    let runner: SandboxRunner;

    beforeEach(() => {
      runner = new SandboxRunner();
    });

    it('detects and blocks forbidden dangerous code patterns', () => {
      const dangerousCodes = [
        'function execute() { process.exit(1); }',
        'function execute() { const cp = require("child_process"); }',
        'function execute() { return eval("2 + 2"); }',
        'function execute() { const f = new Function("return 1;"); }',
        'function execute() { Object.prototype.__proto__ = {}; }',
        'function execute() { const apiKey = "sk-1234567890abcdef1234567890"; }',
      ];

      for (const code of dangerousCodes) {
        const sec = runner.analyzeSecurity(code);
        expect(sec.cleared).toBe(false);
        expect(sec.threats.length).toBeGreaterThan(0);
      }
    });

    it('clears safe pure JavaScript functions', () => {
      const safeCode = `
        function execute(params) {
          const a = Number(params.a) || 0;
          const b = Number(params.b) || 0;
          return { sum: a + b, product: a * b };
        }
      `;
      const sec = runner.analyzeSecurity(safeCode);
      expect(sec.cleared).toBe(true);
      expect(sec.threats.length).toBe(0);
    });

    it('executes safe test cases and matches expected output', async () => {
      const draft: any = {
        id: 'custom.adder',
        implementationCode: `
          function execute(params) {
            return { sum: (params.a || 0) + (params.b || 0) };
          }
        `,
        testCases: [],
      };

      const result = await runner.executeTestCase(
        draft,
        { a: 15, b: 25 },
        true,
        '"sum":40'
      );

      expect(result.passed).toBe(true);
      expect((result.actualOutput as any).sum).toBe(40);
    });

    it('reports failure when output does not match expected substring', async () => {
      const draft: any = {
        id: 'custom.adder',
        implementationCode: `
          function execute(params) {
            return { result: 100 };
          }
        `,
        testCases: [],
      };

      const result = await runner.executeTestCase(
        draft,
        {},
        true,
        'ExpectedMagicToken'
      );

      expect(result.passed).toBe(false);
      expect(result.error).toContain('did not contain expected substring');
    });
  });

  describe('SkillGenerator', () => {
    let generator: SkillGenerator;

    beforeEach(() => {
      generator = new SkillGenerator();
    });

    it('scaffolds api_adapter tool draft with test cases', () => {
      const draft = generator.generateSkillDraft({
        name: 'GitHub Repo Search',
        description: 'Queries repositories and formats statistics',
        type: 'api_adapter',
        promptOrSpec: 'Search GitHub repos by keyword',
      });

      expect(draft.id).toBe('custom.github_repo_search');
      expect(draft.type).toBe('api_adapter');
      expect(draft.implementationCode).toContain('function execute');
      expect(draft.testCases.length).toBeGreaterThan(0);
      expect(draft.status).toBe('generated');
    });

    it('scaffolds custom_solver tool draft with statistical math logic', () => {
      const draft = generator.generateSkillDraft({
        name: 'Normalizer Stats',
        description: 'Computes variance, mean, and stdDev',
        type: 'custom_solver',
        promptOrSpec: 'Statistical array computations',
      });

      expect(draft.id).toBe('custom.normalizer_stats');
      expect(draft.type).toBe('custom_solver');
      expect(draft.implementationCode).toContain('variance');
      expect(draft.testCases.length).toBe(2);
    });
  });

  describe('SkillBuilderManager', () => {
    it('initializes with seeded production skills installed in ToolRegistry', () => {
      const skills = manager.listSkills(undefined, 'dwight');
      expect(skills.length).toBeGreaterThanOrEqual(2);

      const weather = skills.find((s) => s.id === 'custom.weather_forecast');
      expect(weather).toBeDefined();
      expect(weather?.status).toBe('installed');

      // Verify installed in ToolRegistry
      const registeredTool = toolRegistry.get('custom.weather_forecast');
      expect(registeredTool).toBeDefined();
      expect(registeredTool?.status).toBe('implemented');
    });

    it('executes the full skill lifecycle: Draft -> Test -> Approve -> Install -> Execute -> Uninstall', async () => {
      // 1. Draft
      const draft = manager.draftSkill(
        {
          name: 'String Reverse Transformer',
          description: 'Reverses input strings and counts characters',
          type: 'data_transformer',
          promptOrSpec: 'Reverse string',
        },
        'dwight'
      );

      expect(draft.id).toBe('custom.string_reverse_transformer');
      expect(draft.status).toBe('generated');

      // 2. Test in Sandbox
      const report = await manager.testSkill(draft.id, 'dwight');
      expect(report.syntaxValid).toBe(true);
      expect(report.securityCleared).toBe(true);
      expect(report.overallStatus).toBe('passed');

      const testedSkill = manager.getSkill(draft.id, 'dwight');
      expect(testedSkill.status).toBe('tested');

      // 3. Review & Approve (Governance)
      const approvedSkill = manager.reviewAndApprove(draft.id, true, 'Verified logic', 'dwight');
      expect(approvedSkill.status).toBe('awaiting_approval');
      expect(approvedSkill.approvedBy).toBe('dwight');

      // 4. Install (Hot-register into ToolRegistry)
      const installedSkill = manager.installSkill(draft.id, 'dwight');
      expect(installedSkill.status).toBe('installed');
      expect(toolRegistry.get(draft.id)).toBeDefined();

      // 5. Execute via ToolRegistry
      const liveTool = toolRegistry.getImplementation(draft.id);
      expect(liveTool).toBeDefined();
      const toolRes = await liveTool!.execute(
        { items: [{ id: 1, name: 'Sample' }] },
        { requestId: 'r1', userId: 'dwight', sessionId: 's1', permissionVerified: true }
      );
      expect(toolRes.success).toBe(true);

      // 6. Uninstall
      const uninstalled = manager.uninstallSkill(draft.id, 'dwight');
      expect(uninstalled.status).toBe('disabled');
      expect(toolRegistry.get(draft.id)).toBeUndefined();
    });

    it('blocks skill creation when Security Guardian raises a threat', () => {
      // Mock guardian evaluate deny
      const mockGuardian = new SecurityGuardian();
      const spy = vi.spyOn(mockGuardian, 'evaluate').mockReturnValue({
        decision: SecurityDecisionType.DENY,
        reason: 'Malicious skill signature detected',
        ruleViolations: [],
      });

      const restrictedManager = new SkillBuilderManager(toolRegistry, {
        guardian: mockGuardian,
        permissionManager,
        auditLogger,
      });

      expect(() => {
        restrictedManager.draftSkill(
          {
            name: 'Exploit Generator',
            description: 'Unsafe',
            type: 'automation_script',
            promptOrSpec: 'Exploit',
          },
          'dwight'
        );
      }).toThrow(/Security Guardian blocked skill creation/);

      spy.mockRestore();
    });

    it('denies lifecycle actions to unauthorized users lacking SYSTEM permissions', () => {
      expect(() => {
        manager.listSkills(undefined, 'unauthorized_guest');
      }).toThrow(/Security Violation/);
    });
  });

  describe('SkillBuilderAgent', () => {
    let agent: SkillBuilderAgent;
    const agentCtx = {
      requestId: 'req_sb_agent_1',
      userId: 'dwight',
      sessionId: 'sess_1',
      grantedPermissions: [],
    };

    beforeEach(() => {
      agent = new SkillBuilderAgent(manager);
    });

    it('verifies agent contract and metadata', () => {
      expect(agent.definition.id).toBe('skill-builder-agent');
      expect(agent.definition.name).toBe('Skill & Tool Builder Agent');
      expect(agent.definition.version).toBe('0.24.0-phase24');
      expect(agent.definition.capabilities).toContain('draft_skill');
      expect(agent.definition.capabilities).toContain('install_skill');
    });

    it('executes list action via agent', async () => {
      const res = await agent.execute({ action: 'list' }, agentCtx);
      expect(res.success).toBe(true);
      expect(res.agentId).toBe('skill-builder-agent');
      expect(Array.isArray(res.data)).toBe(true);
      expect((res.data as any[]).length).toBeGreaterThanOrEqual(2);
    });

    it('executes draft, test, and install via agent', async () => {
      const draftRes = await agent.execute(
        {
          action: 'draft',
          request: {
            name: 'Agent Math Solver',
            description: 'Solves arrays',
            type: 'custom_solver',
            promptOrSpec: 'Compute stats',
          },
        },
        agentCtx
      );

      expect(draftRes.success).toBe(true);
      const skillId = (draftRes.data as any).id;

      const testRes = await agent.execute({ action: 'test', skillId }, agentCtx);
      expect(testRes.success).toBe(true);

      const installRes = await agent.execute({ action: 'install', skillId }, agentCtx);
      expect(installRes.success).toBe(true);
      expect((installRes.data as any).status).toBe('installed');
    });
  });

  describe('Skill Builder Tools', () => {
    const toolCtx = {
      requestId: 'req_tool_sb_1',
      userId: 'dwight',
      sessionId: 'sess_1',
      permissionVerified: true,
    };

    it('registers all 8 tools with createSkillBuilderTools', () => {
      const tools = createSkillBuilderTools(manager);
      expect(tools.length).toBe(8);
      const ids = tools.map((t) => t.definition.id);
      expect(ids).toContain('skill_builder.draft_skill');
      expect(ids).toContain('skill_builder.generate_implementation');
      expect(ids).toContain('skill_builder.test_skill');
      expect(ids).toContain('skill_builder.review_and_approve');
      expect(ids).toContain('skill_builder.install_skill');
      expect(ids).toContain('skill_builder.uninstall_skill');
      expect(ids).toContain('skill_builder.list_skills');
      expect(ids).toContain('skill_builder.get_skill_details');
    });

    it('executes DraftSkillTool and TestSkillTool', async () => {
      const draftTool = new DraftSkillTool(manager);
      const testTool = new TestSkillTool(manager);

      const draftRes = await draftTool.execute(
        {
          name: 'Tool Execution Test',
          description: 'Testing tool execution',
          type: 'automation_script',
        },
        toolCtx
      );

      expect(draftRes.success).toBe(true);
      const skillId = (draftRes.data as any).id;

      const testRes = await testTool.execute({ skillId }, toolCtx);
      expect(testRes.success).toBe(true);
      expect((testRes.data as any).overallStatus).toBe('passed');
    });

    it('executes ListSkillsTool and GetSkillDetailsTool', async () => {
      const listTool = new ListSkillsTool(manager);
      const getTool = new GetSkillDetailsTool(manager);

      const listRes = await listTool.execute({}, toolCtx);
      expect(listRes.success).toBe(true);
      expect(Array.isArray(listRes.data)).toBe(true);

      const getRes = await getTool.execute({ skillId: 'custom.weather_forecast' }, toolCtx);
      expect(getRes.success).toBe(true);
      expect((getRes.data as any).name).toBe('Dynamic Weather Forecast');
    });
  });
});
