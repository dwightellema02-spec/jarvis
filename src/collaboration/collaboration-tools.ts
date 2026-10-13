import {
  ITool,
  ToolDefinition,
  ToolExecutionContext,
  ToolExecutionResult,
} from '../tools/tool.interface.js';
import { MultiAgentManager } from './multi-agent-manager.js';
import { PermissionLevel, ResourceType } from '../security/types.js';

export class CreateMissionTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'collaboration.create_mission',
    name: 'Create Multi-Agent Mission',
    description: 'Creates a coordinated multi-agent mission plan with defined topology (pipeline, parallel, hierarchical, consensus) and step dependencies',
    version: '0.25.0-phase25',
    requiredPermissions: [{ resource: ResourceType.SYSTEM, action: 'write', level: PermissionLevel.WRITE }],
    parametersSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Title of the team mission' },
        objective: { type: 'string', description: 'Overall goal to accomplish' },
        topology: { type: 'string', enum: ['pipeline', 'parallel', 'hierarchical', 'consensus'] },
        leadAgentId: { type: 'string' },
        participatingAgentIds: { type: 'array', items: { type: 'string' } },
        steps: { type: 'array' },
      },
      required: ['title', 'objective'],
    },
    status: 'implemented',
  };

  constructor(private manager: MultiAgentManager) {}

  public async execute(params: any, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const start = Date.now();
    try {
      const user = context.userId || 'dwight';
      const mission = this.manager.createMission(params, user);
      return {
        success: true,
        toolId: this.definition.id,
        data: mission,
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

export class RunMissionTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'collaboration.run_mission',
    name: 'Run Multi-Agent Mission',
    description: 'Executes a multi-agent mission end-to-end, orchestrating handoffs, intermediate artifact storage, and peer reviews',
    version: '0.25.0-phase25',
    requiredPermissions: [{ resource: ResourceType.SYSTEM, action: 'execute', level: PermissionLevel.WRITE }],
    parametersSchema: {
      type: 'object',
      properties: {
        missionId: { type: 'string', description: 'ID of the mission to execute' },
      },
      required: ['missionId'],
    },
    status: 'implemented',
  };

  constructor(private manager: MultiAgentManager) {}

  public async execute(params: any, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const start = Date.now();
    try {
      const user = context.userId || 'dwight';
      const mission = await this.manager.runMission(params.missionId, user);
      return {
        success: true,
        toolId: this.definition.id,
        data: mission,
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

export class GetMissionStatusTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'collaboration.get_mission_status',
    name: 'Get Mission Status',
    description: 'Retrieves live execution status, step outcomes, and blackboard state for a multi-agent mission',
    version: '0.25.0-phase25',
    requiredPermissions: [{ resource: ResourceType.SYSTEM, action: 'read', level: PermissionLevel.READ }],
    parametersSchema: {
      type: 'object',
      properties: {
        missionId: { type: 'string', description: 'Mission ID to inspect' },
      },
      required: ['missionId'],
    },
    status: 'implemented',
  };

  constructor(private manager: MultiAgentManager) {}

  public async execute(params: any, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const start = Date.now();
    try {
      const user = context.userId || 'dwight';
      const mission = this.manager.getMission(params.missionId, user);
      return {
        success: true,
        toolId: this.definition.id,
        data: mission,
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

export class ListMissionsTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'collaboration.list_missions',
    name: 'List Multi-Agent Missions',
    description: 'Enumerates multi-agent missions with optional status filter',
    version: '0.25.0-phase25',
    requiredPermissions: [{ resource: ResourceType.SYSTEM, action: 'read', level: PermissionLevel.READ }],
    parametersSchema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['pending', 'running', 'completed', 'failed', 'paused'] },
      },
    },
    status: 'implemented',
  };

  constructor(private manager: MultiAgentManager) {}

  public async execute(params: any, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const start = Date.now();
    try {
      const user = context.userId || 'dwight';
      const missions = this.manager.listMissions(params?.status, user);
      return {
        success: true,
        toolId: this.definition.id,
        data: { missions, total: missions.length },
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

export class SendAgentMessageTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'collaboration.send_agent_message',
    name: 'Send Inter-Agent Message',
    description: 'Transmits a direct communication, query, or handoff message between two cooperating agents on the mission bus',
    version: '0.25.0-phase25',
    requiredPermissions: [{ resource: ResourceType.SYSTEM, action: 'write', level: PermissionLevel.WRITE }],
    parametersSchema: {
      type: 'object',
      properties: {
        missionId: { type: 'string' },
        fromAgentId: { type: 'string' },
        toAgentId: { type: 'string' },
        type: { type: 'string', enum: ['task', 'result', 'critique', 'query', 'clarification', 'handoff'] },
        content: { type: 'string' },
        payload: { type: 'object' },
      },
      required: ['missionId', 'fromAgentId', 'toAgentId', 'content'],
    },
    status: 'implemented',
  };

  constructor(private manager: MultiAgentManager) {}

  public async execute(params: any, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const start = Date.now();
    try {
      const user = context.userId || 'dwight';
      const msg = this.manager.sendAgentMessage(
        params.missionId,
        params.fromAgentId,
        params.toAgentId,
        params.type || 'result',
        params.content,
        params.payload,
        user
      );
      return {
        success: true,
        toolId: this.definition.id,
        data: msg,
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

export class ReadBlackboardTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'collaboration.read_blackboard',
    name: 'Read Shared Mission Blackboard',
    description: 'Reads shared working memory, data, or intermediate artifacts from the mission blackboard',
    version: '0.25.0-phase25',
    requiredPermissions: [{ resource: ResourceType.SYSTEM, action: 'read', level: PermissionLevel.READ }],
    parametersSchema: {
      type: 'object',
      properties: {
        missionId: { type: 'string' },
        key: { type: 'string', description: 'Optional specific key to query' },
      },
      required: ['missionId'],
    },
    status: 'implemented',
  };

  constructor(private manager: MultiAgentManager) {}

  public async execute(params: any, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const start = Date.now();
    try {
      const user = context.userId || 'dwight';
      const data = this.manager.readBlackboard(params.missionId, params.key, user);
      return {
        success: true,
        toolId: this.definition.id,
        data,
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

export class WriteBlackboardTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'collaboration.write_blackboard',
    name: 'Write to Shared Blackboard',
    description: 'Writes or updates an artifact or finding on the mission shared blackboard',
    version: '0.25.0-phase25',
    requiredPermissions: [{ resource: ResourceType.SYSTEM, action: 'write', level: PermissionLevel.WRITE }],
    parametersSchema: {
      type: 'object',
      properties: {
        missionId: { type: 'string' },
        key: { type: 'string' },
        value: { description: 'Value to record' },
        author: { type: 'string' },
      },
      required: ['missionId', 'key', 'value'],
    },
    status: 'implemented',
  };

  constructor(private manager: MultiAgentManager) {}

  public async execute(params: any, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const start = Date.now();
    try {
      const user = context.userId || 'dwight';
      const entry = this.manager.writeBlackboard(
        params.missionId,
        params.key,
        params.value,
        params.author || 'agent',
        user
      );
      return {
        success: true,
        toolId: this.definition.id,
        data: entry,
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

export class PeerReviewTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'collaboration.peer_review',
    name: 'Perform Cross-Agent Peer Review',
    description: 'Conducts a peer review critique and verification across two specialized agents before consensus agreement',
    version: '0.25.0-phase25',
    requiredPermissions: [{ resource: ResourceType.SYSTEM, action: 'write', level: PermissionLevel.WRITE }],
    parametersSchema: {
      type: 'object',
      properties: {
        missionId: { type: 'string' },
        reviewerAgentId: { type: 'string' },
        targetStepId: { type: 'string' },
        critique: { type: 'string' },
      },
      required: ['missionId', 'reviewerAgentId', 'targetStepId'],
    },
    status: 'implemented',
  };

  constructor(private manager: MultiAgentManager) {}

  public async execute(params: any, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const start = Date.now();
    try {
      const user = context.userId || 'dwight';
      const review = await this.manager.performPeerReview(
        params.missionId,
        params.reviewerAgentId,
        params.targetStepId,
        params.critique,
        user
      );
      return {
        success: true,
        toolId: this.definition.id,
        data: review,
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

export function createCollaborationTools(manager: MultiAgentManager): ITool[] {
  return [
    new CreateMissionTool(manager),
    new RunMissionTool(manager),
    new GetMissionStatusTool(manager),
    new ListMissionsTool(manager),
    new SendAgentMessageTool(manager),
    new ReadBlackboardTool(manager),
    new WriteBlackboardTool(manager),
    new PeerReviewTool(manager),
  ];
}
