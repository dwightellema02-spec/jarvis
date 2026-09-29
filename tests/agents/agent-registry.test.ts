import { describe, it, expect, beforeEach } from 'vitest';
import { AgentRegistry } from '../../src/agents/agent-registry.js';
import { IAgent, AgentDefinition } from '../../src/agents/agent.interface.js';
import { PermissionLevel, ResourceType } from '../../src/security/types.js';

describe('Agent Registry Tests', () => {
  let registry: AgentRegistry;

  beforeEach(() => {
    registry = new AgentRegistry();
  });

  it('pre-registers all 21 foundational modular agents defined in Master Plan', () => {
    const list = registry.list();
    expect(list.length).toBe(21);

    const ids = list.map((a) => a.id);
    expect(ids).toContain('personal-assistant-agent');
    expect(ids).toContain('mathematics-agent');
    expect(ids).toContain('study-agent');
    expect(ids).toContain('research-agent');
    expect(ids).toContain('coding-agent');
    expect(ids).toContain('project-agent');
    expect(ids).toContain('memory-agent');
    expect(ids).toContain('goal-agent');
    expect(ids).toContain('document-agent');
    expect(ids).toContain('calendar-agent');
    expect(ids).toContain('communication-agent');
    expect(ids).toContain('data-statistics-agent');
    expect(ids).toContain('creative-agent');
    expect(ids).toContain('application-agent');
    expect(ids).toContain('device-agent');
    expect(ids).toContain('security-agent');
    expect(ids).toContain('threat-detection-agent');
    expect(ids).toContain('scam-phishing-agent');
    expect(ids).toContain('content-filtering-agent');
    expect(ids).toContain('financial-research-agent');
    expect(ids).toContain('product-innovation-agent');
  });

  it('all foundational agents start with status registered (no fake implementations)', () => {
    const list = registry.list();
    for (const agent of list) {
      expect(agent.status).toBe('registered');
    }

    const implemented = registry.listByStatus('implemented');
    expect(implemented.length).toBe(0);

    const enabled = registry.listByStatus('enabled');
    expect(enabled.length).toBe(0);
  });

  it('prevents setting an agent to enabled or implemented without a real implementation', () => {
    const success = registry.setStatus('mathematics-agent', 'enabled');
    expect(success).toBe(false);

    const agent = registry.get('mathematics-agent');
    expect(agent?.status).toBe('registered');
  });

  it('registers an actual implementation and updates status honestly', async () => {
    const mockDefinition: AgentDefinition = {
      id: 'test-custom-agent',
      name: 'Test Custom Agent',
      description: 'Used for unit test verification',
      version: '1.0.0',
      capabilities: ['test'],
      requiredPermissions: [{ resource: ResourceType.APIS, action: 'read', level: PermissionLevel.READ }],
      inputSchema: {},
      outputSchema: {},
      status: 'registered',
    };

    const mockImplementation: IAgent = {
      definition: mockDefinition,
      execute: async () => ({
        success: true,
        agentId: 'test-custom-agent',
        data: 'executed',
        executionTimeMs: 1,
      }),
    };

    registry.registerImplementation(mockImplementation);

    const retrieved = registry.get('test-custom-agent');
    expect(retrieved?.status).toBe('implemented');

    const canEnable = registry.setStatus('test-custom-agent', 'enabled');
    expect(canEnable).toBe(true);
    expect(registry.get('test-custom-agent')?.status).toBe('enabled');
  });
});
