import { describe, it, expect, beforeEach } from 'vitest';
import { TaskPlanner } from '../../src/orchestrator/task-planner.js';
import { AgentRegistry } from '../../src/agents/agent-registry.js';
import { ToolRegistry } from '../../src/tools/tool-registry.js';
import { RiskLevel } from '../../src/orchestrator/types.js';
import { ResourceType, PermissionLevel } from '../../src/security/types.js';

describe('Phase 2 Task Planner Tests', () => {
  let planner: TaskPlanner;
  let agentRegistry: AgentRegistry;
  let toolRegistry: ToolRegistry;

  beforeEach(() => {
    agentRegistry = new AgentRegistry();
    toolRegistry = new ToolRegistry();
    planner = new TaskPlanner(agentRegistry, toolRegistry);
  });

  it('decomposes conversational math goals into verified math task steps', () => {
    const plan = planner.plan('req_1', 'Solve 3x + 12 = 24');

    expect(plan.steps.length).toBe(1);
    expect(plan.steps[0].agentId).toBe('mathematics-agent');
    expect(plan.steps[0].toolId).toBe('calculator');
    expect(plan.steps[0].riskLevel).toBe(RiskLevel.LOW);
    expect(plan.overallRisk).toBe(RiskLevel.LOW);
  });

  it('detects system limitations upfront when camera access is requested', () => {
    const plan = planner.plan('req_2', 'Access my webcam and take a photo');

    expect(plan.steps.length).toBe(1);
    expect(plan.steps[0].status).toBe('BLOCKED_BY_LIMITATION');
    expect(plan.limitationsDetected.length).toBeGreaterThan(0);
    expect(plan.limitationsDetected[0].subsystem).toBe('AgentRegistry');
    expect(plan.limitationsDetected[0].targetPhase).toBe(21); // device-agent
  });

  it('detects critical financial limitations and marks step blocked', () => {
    const plan = planner.plan('req_3', 'Transfer 1 Bitcoin to external wallet');

    expect(plan.steps.length).toBe(1);
    expect(plan.steps[0].riskLevel).toBe(RiskLevel.CRITICAL);
    expect(plan.steps[0].status).toBe('BLOCKED_BY_LIMITATION');
    expect(plan.overallRisk).toBe(RiskLevel.CRITICAL);
  });

  it('supports explicit multi-step workflows with dependencies and risk evaluation', () => {
    const plan = planner.plan('req_4', 'Build and verify project', {
      explicitSteps: [
        {
          id: 'step_1',
          name: 'Inspect Repository',
          resource: ResourceType.PROJECTS,
          action: 'read',
          riskLevel: RiskLevel.LOW,
          requiredPermissionLevel: PermissionLevel.READ,
        },
        {
          id: 'step_2',
          name: 'Run Unit Tests',
          resource: ResourceType.APPLICATIONS,
          action: 'execute',
          dependencies: ['step_1'],
          parameters: { command: 'npm test' },
        },
      ],
    });

    expect(plan.steps.length).toBe(2);
    expect(plan.steps[1].dependencies).toContain('step_1');
    expect(plan.steps[1].riskLevel).toBe(RiskLevel.HIGH);
    expect(plan.overallRisk).toBe(RiskLevel.HIGH);
    expect(plan.requiresHumanConfirmation).toBe(true);
  });
});
