import { IAgent, AgentDefinition, AgentExecutionContext, AgentExecutionResult } from '../agents/agent.interface.js';
import { GoalsManager } from './goals-manager.js';
import { PermissionLevel, ResourceType } from '../security/types.js';

export class ProjectAgent implements IAgent {
  public readonly definition: AgentDefinition = {
    id: 'project-agent',
    name: 'Project Agent',
    description: 'Management of Tuklas, JARVIS, Thesis, and custom user projects',
    version: '0.22.0-phase22',
    capabilities: ['track_goals', 'manage_tasks', 'summarize_progress', 'manage_projects'],
    requiredPermissions: [{ resource: ResourceType.PROJECTS, action: 'modify', level: PermissionLevel.WRITE }],
    inputSchema: {
      type: 'object',
      properties: {
        action: { type: 'string', enum: ['list_projects', 'create_project', 'list_tasks', 'create_task', 'summarize_progress'] },
        projectData: { type: 'object' },
        taskData: { type: 'object' },
      },
    },
    outputSchema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        result: { type: 'object' },
      },
    },
    status: 'implemented',
  };

  constructor(private goalsManager: GoalsManager) {}

  public async execute(input: unknown, context: AgentExecutionContext): Promise<AgentExecutionResult> {
    const startTime = Date.now();
    const payload = (input || {}) as Record<string, any>;
    const action = payload.action || 'list_projects';

    try {
      let data: any;

      switch (action) {
        case 'list_projects':
          data = this.goalsManager.listProjects(context.userId);
          break;

        case 'create_project':
          if (!payload.projectData || !payload.projectData.name) {
            throw new Error('Action "create_project" requires projectData with a name');
          }
          data = this.goalsManager.createProject(payload.projectData, context.userId);
          break;

        case 'list_tasks':
          data = this.goalsManager.listTasks(payload.filters, context.userId);
          break;

        case 'create_task':
          if (!payload.taskData || !payload.taskData.title) {
            throw new Error('Action "create_task" requires taskData with a title');
          }
          data = this.goalsManager.createTask(payload.taskData, context.userId);
          break;

        case 'summarize_progress':
          data = this.goalsManager.getAnalytics(context.userId);
          break;

        default:
          throw new Error(`Unknown action "${action}" for ProjectAgent`);
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
