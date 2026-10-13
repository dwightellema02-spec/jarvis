import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  MultiAgentManager,
  SharedBlackboard,
  CollaborationAgent,
  createCollaborationTools,
} from '../../src/collaboration/index.js';
import { AgentRegistry } from '../../src/agents/agent-registry.js';
import { ToolRegistry } from '../../src/tools/tool-registry.js';
import { SecurityGuardian } from '../../src/security/guardian.js';
import { PermissionManager } from '../../src/security/permission-manager.js';
import { AuditLogger } from '../../src/audit/audit-logger.js';
import { PermissionLevel, ResourceType, SecurityDecisionType } from '../../src/security/types.js';

describe('Phase 25 — Multi-Agent Collaboration Unit Tests', () => {
  let agentRegistry: AgentRegistry;
  let toolRegistry: ToolRegistry;
  let permissionManager: PermissionManager;
  let guardian: SecurityGuardian;
  let auditLogger: AuditLogger;
  let manager: MultiAgentManager;

  beforeEach(() => {
    agentRegistry = new AgentRegistry();
    toolRegistry = new ToolRegistry();
    permissionManager = new PermissionManager();
    guardian = new SecurityGuardian();
    auditLogger = new AuditLogger();

    permissionManager.grantPermission({
      userId: 'dwight',
      resource: ResourceType.SYSTEM,
      level: PermissionLevel.ADMIN,
      allowedActions: ['read', 'write', 'execute', 'admin'],
      grantedBy: 'system',
    });

    manager = new MultiAgentManager(agentRegistry, {
      permissionManager,
      guardian,
      auditLogger,
    });
  });

  describe('SharedBlackboard', () => {
    it('initializes with seed data and increments version on update', () => {
      const bb = new SharedBlackboard({ 'seed.alpha': 42 }, 'system');
      expect(bb.get('seed.alpha')).toBe(42);
      expect(bb.getEntry('seed.alpha')?.version).toBe(1);

      bb.set('seed.alpha', 43, 'research-agent');
      expect(bb.get('seed.alpha')).toBe(43);
      expect(bb.getEntry('seed.alpha')?.version).toBe(2);
      expect(bb.getEntry('seed.alpha')?.writtenBy).toBe('research-agent');
    });

    it('manages key presence, deletion, and records conversion', () => {
      const bb = new SharedBlackboard();
      bb.set('math.euler', 2.718, 'mathematics-agent');
      bb.set('math.pi', 3.1415, 'mathematics-agent');

      expect(bb.has('math.euler')).toBe(true);
      expect(bb.keys()).toContain('math.euler');
      expect(bb.keys()).toContain('math.pi');

      const rec = bb.toRecord();
      expect(rec['math.euler']).toBe(2.718);
      expect(rec['math.pi']).toBe(3.1415);

      bb.delete('math.euler');
      expect(bb.has('math.euler')).toBe(false);
      expect(bb.get('math.euler')).toBeUndefined();
    });
  });

  describe('MultiAgentManager', () => {
    it('lists predefined collaboration templates', () => {
      const templates = manager.listTemplates();
      expect(templates.length).toBeGreaterThanOrEqual(4);
      const stem = manager.getTemplate('stem_research_pipeline');
      expect(stem).toBeDefined();
      expect(stem?.topology).toBe('pipeline');
      expect(stem?.participatingAgentIds).toContain('research-agent');
      expect(stem?.participatingAgentIds).toContain('coding-agent');
    });

    it('lists pre-seeded completed mission', () => {
      const missions = manager.listMissions(undefined, 'dwight');
      expect(missions.length).toBeGreaterThanOrEqual(1);
      const seedMission = manager.getMission('mission_seed_stem_01', 'dwight');
      expect(seedMission.id).toBe('mission_seed_stem_01');
      expect(seedMission.status).toBe('completed');
      expect(seedMission.steps.length).toBe(3);
    });

    it('creates and executes a pipeline multi-agent mission end-to-end', async () => {
      const mission = manager.createMission(
        {
          title: 'Autonomous Math Solver Pipeline',
          objective: 'Synthesize a quadratic solver with symbolic derivation and coding',
          topology: 'pipeline',
          participatingAgentIds: ['research-agent', 'mathematics-agent', 'coding-agent'],
          steps: [
            {
              name: 'Literature Formula Search',
              agentId: 'research-agent',
              description: 'Find quadratic formula coefficients',
            },
            {
              name: 'Symbolic Derivation',
              agentId: 'mathematics-agent',
              description: 'Derive discriminant conditions',
            },
            {
              name: 'Code Module',
              agentId: 'coding-agent',
              description: 'Implement solveQuadratic function',
            },
          ],
        },
        'dwight'
      );

      expect(mission.status).toBe('pending');
      expect(mission.steps.length).toBe(3);

      const executed = await manager.runMission(mission.id, 'dwight');
      expect(executed.status).toBe('completed');
      expect(executed.completedAt).toBeDefined();
      expect(executed.steps.every((s) => s.status === 'completed')).toBe(true);

      // Verify blackboard has outputs
      const bbRecord = manager.readBlackboard(mission.id, undefined, 'dwight') as Record<string, unknown>;
      expect(Object.keys(bbRecord).length).toBeGreaterThan(0);
      expect(executed.messages.length).toBe(3);
    });

    it('creates and executes a parallel multi-agent mission', async () => {
      const mission = manager.createMission(
        {
          title: 'Cross-Domain Parallel Evaluation',
          objective: 'Analyze an AI venture from Math, Finance, and Research perspectives simultaneously',
          topology: 'parallel',
          participatingAgentIds: ['mathematics-agent', 'research-agent'],
          steps: [
            { name: 'Algorithmic Complexity', agentId: 'mathematics-agent', description: 'Analyze asymptotic bounds' },
            { name: 'State of Art Comparison', agentId: 'research-agent', description: 'Survey latest benchmark papers' },
          ],
        },
        'dwight'
      );

      const executed = await manager.runMission(mission.id, 'dwight');
      expect(executed.status).toBe('completed');
      expect(executed.steps[0].status).toBe('completed');
      expect(executed.steps[1].status).toBe('completed');
    });

    it('executes a consensus mission with automated peer review', async () => {
      const mission = manager.createMission(
        {
          title: 'Security Consensus Ensemble',
          objective: 'Verify module security with cross-agent review',
          topology: 'consensus',
          participatingAgentIds: ['coding-agent', 'proactive-agent'],
          steps: [
            { name: 'Module Generation', agentId: 'coding-agent', description: 'Scaffold module' },
          ],
        },
        'dwight'
      );

      const executed = await manager.runMission(mission.id, 'dwight');
      expect(executed.status).toBe('completed');
      expect(executed.reviews.length).toBeGreaterThanOrEqual(1);
      expect(executed.reviews[0].approved).toBe(true);
    });

    it('sends direct inter-agent communication messages', () => {
      const mission = manager.createMission(
        {
          title: 'Inter-Agent Comm Test',
          objective: 'Test messaging',
        },
        'dwight'
      );

      const msg = manager.sendAgentMessage(
        mission.id,
        'research-agent',
        'mathematics-agent',
        'query',
        'Can you verify the boundary condition x >= 0?',
        { param: 'x' },
        'dwight'
      );

      expect(msg.id).toBeDefined();
      expect(msg.fromAgentId).toBe('research-agent');
      expect(msg.toAgentId).toBe('mathematics-agent');
      expect(msg.type).toBe('query');

      const updated = manager.getMission(mission.id, 'dwight');
      expect(updated.messages.length).toBe(1);
    });

    it('writes and reads to shared blackboard directly', () => {
      const mission = manager.createMission(
        { title: 'Blackboard Test', objective: 'Test data passing' },
        'dwight'
      );

      manager.writeBlackboard(mission.id, 'test.tensor', [1, 2, 3], 'math-agent', 'dwight');
      const val = manager.readBlackboard(mission.id, 'test.tensor', 'dwight');
      expect(val).toEqual([1, 2, 3]);
    });

    it('blocks mission creation if Security Guardian raises a threat', () => {
      const mockGuardian = new SecurityGuardian();
      vi.spyOn(mockGuardian, 'evaluate').mockReturnValue({
        decision: SecurityDecisionType.DENY,
        reason: 'Hostile mission goal detected',
        ruleViolations: [],
      });

      const restrictedManager = new MultiAgentManager(agentRegistry, {
        guardian: mockGuardian,
        permissionManager,
        auditLogger,
      });

      expect(() => {
        restrictedManager.createMission(
          { title: 'Exploit Mission', objective: 'DDoS' },
          'dwight'
        );
      }).toThrow(/Security Guardian blocked mission creation/);
    });
  });

  describe('CollaborationAgent', () => {
    let agent: CollaborationAgent;

    beforeEach(() => {
      agent = new CollaborationAgent(manager);
    });

    it('has valid agent definition contract and capabilities', () => {
      expect(agent.definition.id).toBe('collaboration-agent');
      expect(agent.definition.status).toBe('implemented');
      expect(agent.definition.version).toBe('0.25.0-phase25');
      expect(agent.definition.capabilities).toContain('orchestrate_teams');
      expect(agent.definition.capabilities).toContain('peer_review');
    });

    it('executes create_mission and run_mission through IAgent contract', async () => {
      const ctx = {
        requestId: 'req_agent_test',
        userId: 'dwight',
        sessionId: 'session_collab',
        grantedPermissions: [],
      };

      const createRes = await agent.execute(
        {
          action: 'create_mission',
          title: 'Agent Triggered Mission',
          objective: 'Verify agent delegation',
        },
        ctx
      );

      expect(createRes.success).toBe(true);
      const mission = createRes.data as any;
      expect(mission.id).toBeDefined();

      const runRes = await agent.execute(
        {
          action: 'run_mission',
          missionId: mission.id,
        },
        ctx
      );

      expect(runRes.success).toBe(true);
      expect((runRes.data as any).status).toBe('completed');
    });

    it('executes list_missions through IAgent contract', async () => {
      const ctx = {
        requestId: 'req_agent_list',
        userId: 'dwight',
        sessionId: 'session_collab',
        grantedPermissions: [],
      };

      const listRes = await agent.execute({ action: 'list_missions' }, ctx);
      expect(listRes.success).toBe(true);
      expect((listRes.data as any).total).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Collaboration Tools', () => {
    let tools: ReturnType<typeof createCollaborationTools>;

    beforeEach(() => {
      tools = createCollaborationTools(manager);
    });

    it('registers exactly 8 collaboration tools with valid definitions', () => {
      expect(tools.length).toBe(8);
      const ids = tools.map((t) => t.definition.id);
      expect(ids).toContain('collaboration.create_mission');
      expect(ids).toContain('collaboration.run_mission');
      expect(ids).toContain('collaboration.get_mission_status');
      expect(ids).toContain('collaboration.list_missions');
      expect(ids).toContain('collaboration.send_agent_message');
      expect(ids).toContain('collaboration.read_blackboard');
      expect(ids).toContain('collaboration.write_blackboard');
      expect(ids).toContain('collaboration.peer_review');
    });

    it('executes CreateMissionTool, RunMissionTool, and GetMissionStatusTool successfully', async () => {
      const createTool = tools.find((t) => t.definition.id === 'collaboration.create_mission')!;
      const runTool = tools.find((t) => t.definition.id === 'collaboration.run_mission')!;
      const statusTool = tools.find((t) => t.definition.id === 'collaboration.get_mission_status')!;

      const toolCtx = { requestId: 'r1', userId: 'dwight', sessionId: 's1', permissionVerified: true };

      const cRes = await createTool.execute(
        { title: 'Tool Mission', objective: 'Verify tools end-to-end' },
        toolCtx
      );
      expect(cRes.success).toBe(true);
      const mId = (cRes.data as any).id;

      const rRes = await runTool.execute({ missionId: mId }, toolCtx);
      expect(rRes.success).toBe(true);
      expect((rRes.data as any).status).toBe('completed');

      const sRes = await statusTool.execute({ missionId: mId }, toolCtx);
      expect(sRes.success).toBe(true);
      expect((sRes.data as any).id).toBe(mId);
    });

    it('executes WriteBlackboardTool and ReadBlackboardTool successfully', async () => {
      const writeTool = tools.find((t) => t.definition.id === 'collaboration.write_blackboard')!;
      const readTool = tools.find((t) => t.definition.id === 'collaboration.read_blackboard')!;
      const toolCtx = { requestId: 'r1', userId: 'dwight', sessionId: 's1', permissionVerified: true };

      const m = manager.createMission({ title: 'BB Tool Test', objective: 'Test BB' }, 'dwight');

      const wRes = await writeTool.execute(
        { missionId: m.id, key: 'metric.precision', value: 0.99 },
        toolCtx
      );
      expect(wRes.success).toBe(true);

      const rRes = await readTool.execute({ missionId: m.id, key: 'metric.precision' }, toolCtx);
      expect(rRes.success).toBe(true);
      expect(rRes.data).toBe(0.99);
    });
  });
});
