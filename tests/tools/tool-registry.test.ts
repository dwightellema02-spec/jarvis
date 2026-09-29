import { describe, it, expect, beforeEach } from 'vitest';
import { ToolRegistry } from '../../src/tools/tool-registry.js';
import { ToolDefinition, ITool } from '../../src/tools/tool.interface.js';
import { PermissionLevel, ResourceType } from '../../src/security/types.js';

describe('Tool Registry Tests', () => {
  let registry: ToolRegistry;

  beforeEach(() => {
    registry = new ToolRegistry();
  });

  it('pre-registers foundational tools with declared permissions', () => {
    const list = registry.list();
    expect(list.length).toBeGreaterThanOrEqual(15);

    for (const tool of list) {
      expect(tool.requiredPermissions.length).toBeGreaterThan(0);
      expect(tool.status).toBe('registered');
    }

    const browserTool = registry.get('browser.open');
    expect(browserTool?.requiredPermissions[0].level).toBe(PermissionLevel.READ);

    const terminalTool = registry.get('terminal.execute');
    expect(terminalTool?.requiredPermissions[0].level).toBe(PermissionLevel.EXECUTE);

    const fileDeleteTool = registry.get('files.delete');
    expect(fileDeleteTool?.requiredPermissions[0].level).toBe(PermissionLevel.ADMIN);
  });

  it('rejects registering a tool that does not declare required permissions', () => {
    const invalidTool: ToolDefinition = {
      id: 'unrestricted_tool',
      name: 'Unrestricted Tool',
      description: 'Bad tool without permissions',
      requiredPermissions: [], // VIOLATION
      parametersSchema: {},
      status: 'registered',
      version: '1.0.0',
    };

    expect(() => registry.register(invalidTool)).toThrow(/must declare at least one required permission/);
  });

  it('prevents setting a tool to enabled or implemented without a real implementation', () => {
    const success = registry.setStatus('terminal.execute', 'enabled');
    expect(success).toBe(false);
    expect(registry.get('terminal.execute')?.status).toBe('registered');
  });

  it('allows registering and enabling an implemented tool', () => {
    const mockDef: ToolDefinition = {
      id: 'calculator.safe',
      name: 'Safe Calculator',
      description: 'Performs safe arithmetic',
      requiredPermissions: [{ resource: ResourceType.APIS, action: 'read', level: PermissionLevel.READ }],
      parametersSchema: {},
      status: 'registered',
      version: '1.0.0',
    };

    const mockTool: ITool = {
      definition: mockDef,
      execute: async () => ({
        success: true,
        toolId: 'calculator.safe',
        verified: true,
        data: 42,
        executionTimeMs: 1,
      }),
    };

    registry.registerImplementation(mockTool);
    expect(registry.get('calculator.safe')?.status).toBe('implemented');

    const enabled = registry.setStatus('calculator.safe', 'enabled');
    expect(enabled).toBe(true);
    expect(registry.get('calculator.safe')?.status).toBe('enabled');
  });
});
