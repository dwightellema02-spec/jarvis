import { AgentRegistry } from '../agents/agent-registry.js';
import { IAgent, AgentDefinition } from '../agents/agent.interface.js';
import { SystemLimitation } from './types.js';
import { logger } from '../utils/logger.js';

export interface AgentRoutingDecision {
  agentId: string;
  definition?: AgentDefinition;
  implementation?: IAgent;
  canExecute: boolean;
  limitation?: SystemLimitation;
}

export class AgentRouter {
  private registry: AgentRegistry;

  constructor(registry: AgentRegistry) {
    this.registry = registry;
  }

  public route(agentId: string): AgentRoutingDecision {
    const definition = this.registry.get(agentId);

    if (!definition) {
      return {
        agentId,
        canExecute: false,
        limitation: {
          subsystem: 'AgentRouter',
          capability: agentId,
          reason: `Agent '${agentId}' is not found in AgentRegistry`,
          targetPhase: 0,
        },
      };
    }

    if (definition.status === 'registered') {
      logger.debug(`Agent ${agentId} routed but is in 'registered' status`);
      return {
        agentId,
        definition,
        canExecute: false,
        limitation: {
          subsystem: 'AgentRouter',
          capability: agentId,
          reason: `Agent '${agentId}' is registered in architecture but not yet implemented (Phase requirement)`,
          targetPhase: 7,
          workaround: 'JARVIS Core conversational reasoning will handle this request directly.',
        },
      };
    }

    if (definition.status === 'disabled') {
      return {
        agentId,
        definition,
        canExecute: false,
        limitation: {
          subsystem: 'AgentRouter',
          capability: agentId,
          reason: `Agent '${agentId}' is currently disabled by administrative policy`,
          targetPhase: 0,
        },
      };
    }

    const implementation = this.registry.getImplementation(agentId);
    return {
      agentId,
      definition,
      implementation,
      canExecute: !!implementation,
    };
  }
}
