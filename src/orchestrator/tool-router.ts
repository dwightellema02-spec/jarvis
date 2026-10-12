import { ToolRegistry } from '../tools/tool-registry.js';
import { ITool, ToolDefinition } from '../tools/tool.interface.js';
import { ResourcePermission } from '../security/types.js';
import { SystemLimitation } from './types.js';
import { logger } from '../utils/logger.js';

export interface ToolRoutingDecision {
  toolId: string;
  definition?: ToolDefinition;
  implementation?: ITool;
  requiredPermissions: ResourcePermission[];
  canExecute: boolean;
  limitation?: SystemLimitation;
}

export class ToolRouter {
  private registry: ToolRegistry;

  constructor(registry: ToolRegistry) {
    this.registry = registry;
  }

  public route(toolId: string): ToolRoutingDecision {
    const definition = this.registry.get(toolId);

    if (!definition) {
      return {
        toolId,
        requiredPermissions: [],
        canExecute: false,
        limitation: {
          subsystem: 'ToolRouter',
          capability: toolId,
          reason: `Tool '${toolId}' is not found in ToolRegistry`,
          targetPhase: 0,
        },
      };
    }

    if (definition.status === 'registered') {
      logger.debug(`Tool ${toolId} routed but is in 'registered' status`);
      return {
        toolId,
        definition,
        requiredPermissions: definition.requiredPermissions,
        canExecute: false,
        limitation: {
          subsystem: 'ToolRouter',
          capability: toolId,
          reason: `Tool '${toolId}' is declared in registry but not yet connected to external host runtime`,
          targetPhase: 6,
        },
      };
    }

    if (definition.status === 'disabled') {
      return {
        toolId,
        definition,
        requiredPermissions: definition.requiredPermissions,
        canExecute: false,
        limitation: {
          subsystem: 'ToolRouter',
          capability: toolId,
          reason: `Tool '${toolId}' is currently disabled by administrative policy`,
          targetPhase: 0,
        },
      };
    }

    const implementation = this.registry.getImplementation(toolId);
    return {
      toolId,
      definition,
      implementation,
      requiredPermissions: definition.requiredPermissions,
      canExecute: !!implementation,
    };
  }
}
