import { ToolDefinition, ToolStatus, ITool } from './tool.interface.js';
import { PermissionLevel, ResourceType } from '../security/types.js';
import { logger } from '../utils/logger.js';

export class ToolRegistry {
  private tools: Map<string, ToolDefinition> = new Map();
  private implementations: Map<string, ITool> = new Map();

  constructor() {
    this.registerFoundationalTools();
  }

  public register(definition: ToolDefinition): void {
    // Enforce that every tool declares its required permissions
    if (!definition.requiredPermissions || definition.requiredPermissions.length === 0) {
      throw new Error(`Tool '${definition.id}' must declare at least one required permission.`);
    }

    this.tools.set(definition.id, { ...definition });
    logger.debug(`Registered tool: ${definition.id} (${definition.status})`);
  }

  public registerImplementation(tool: ITool): void {
    const id = tool.definition.id;
    this.tools.set(id, { ...tool.definition, status: 'implemented' });
    this.implementations.set(id, tool);
    logger.info(`Implemented tool registered: ${id}`);
  }

  public get(id: string): ToolDefinition | undefined {
    return this.tools.get(id);
  }

  public getImplementation(id: string): ITool | undefined {
    return this.implementations.get(id);
  }

  public list(): ToolDefinition[] {
    return Array.from(this.tools.values());
  }

  public listByStatus(status: ToolStatus): ToolDefinition[] {
    return Array.from(this.tools.values()).filter((t) => t.status === status);
  }

  public setStatus(id: string, status: ToolStatus): boolean {
    const existing = this.tools.get(id);
    if (!existing) {
      return false;
    }

    if ((status === 'implemented' || status === 'enabled') && !this.implementations.has(id)) {
      logger.warn(`Cannot set tool ${id} to ${status}: no real implementation is registered.`);
      return false;
    }

    this.tools.set(id, { ...existing, status });
    logger.info(`Tool ${id} status updated to ${status}`);
    return true;
  }

  public unregister(id: string): boolean {
    const existed = this.tools.delete(id);
    this.implementations.delete(id);
    if (existed) {
      logger.info(`Tool ${id} unregistered.`);
    }
    return existed;
  }

  /**
   * Pre-registers the foundational tools defined in the JARVIS Master Plan.
   * Every tool declares its required permissions and is set to 'registered' (Phase 0 Foundation).
   */
  private registerFoundationalTools(): void {
    const foundationalTools: ToolDefinition[] = [
      {
        id: 'web_search',
        name: 'Web Search',
        description: 'Performs informational search queries across search engine indexes',
        version: '0.1.0-alpha',
        requiredPermissions: [{ resource: ResourceType.WEBSITES, action: 'read', level: PermissionLevel.READ }],
        parametersSchema: { type: 'object', properties: { query: { type: 'string' } }, required: ['query'] },
        status: 'registered',
      },
      {
        id: 'browser.open',
        name: 'Browser Open',
        description: 'Opens a permitted web page in a controlled browser context',
        version: '0.1.0-alpha',
        requiredPermissions: [{ resource: ResourceType.WEBSITES, action: 'open', level: PermissionLevel.READ }],
        parametersSchema: { type: 'object', properties: { url: { type: 'string' } }, required: ['url'] },
        status: 'registered',
      },
      {
        id: 'browser.navigate',
        name: 'Browser Navigation & Form Interaction',
        description: 'Controlled browser page navigation and approved form interaction',
        version: '0.1.0-alpha',
        requiredPermissions: [{ resource: ResourceType.WEBSITES, action: 'execute', level: PermissionLevel.SUGGEST }],
        parametersSchema: { type: 'object', properties: { selector: { type: 'string' } } },
        status: 'registered',
      },
      {
        id: 'files.read',
        name: 'File Reader',
        description: 'Reads authorized file content from local or project directories',
        version: '0.1.0-alpha',
        requiredPermissions: [{ resource: ResourceType.FILES, action: 'read', level: PermissionLevel.READ }],
        parametersSchema: { type: 'object', properties: { path: { type: 'string' } }, required: ['path'] },
        status: 'registered',
      },
      {
        id: 'files.write',
        name: 'File Writer',
        description: 'Modifies or writes files in authorized project scopes',
        version: '0.1.0-alpha',
        requiredPermissions: [{ resource: ResourceType.FILES, action: 'write', level: PermissionLevel.WRITE }],
        parametersSchema: {
          type: 'object',
          properties: { path: { type: 'string' }, content: { type: 'string' } },
          required: ['path', 'content'],
        },
        status: 'registered',
      },
      {
        id: 'files.delete',
        name: 'File Deletion',
        description: 'Deletes files in authorized project scopes with administrative confirmation',
        version: '0.1.0-alpha',
        requiredPermissions: [{ resource: ResourceType.FILES, action: 'delete', level: PermissionLevel.ADMIN }],
        parametersSchema: { type: 'object', properties: { path: { type: 'string' } }, required: ['path'] },
        status: 'registered',
      },
      {
        id: 'database.query',
        name: 'Database Query',
        description: 'Executes read-only analytical queries against authorized databases',
        version: '0.1.0-alpha',
        requiredPermissions: [{ resource: ResourceType.DATABASES, action: 'read', level: PermissionLevel.READ }],
        parametersSchema: { type: 'object', properties: { query: { type: 'string' } }, required: ['query'] },
        status: 'registered',
      },
      {
        id: 'calculator',
        name: 'Symbolic & Numeric Calculator',
        description: 'Deterministic mathematical calculation and evaluation',
        version: '0.1.0-alpha',
        requiredPermissions: [{ resource: ResourceType.APIS, action: 'read', level: PermissionLevel.READ }],
        parametersSchema: { type: 'object', properties: { expression: { type: 'string' } }, required: ['expression'] },
        status: 'registered',
      },
      {
        id: 'terminal.execute',
        name: 'Terminal Command Execution',
        description: 'Executes approved command-line operations in sandboxed workspace',
        version: '0.1.0-alpha',
        requiredPermissions: [{ resource: ResourceType.APPLICATIONS, action: 'execute', level: PermissionLevel.EXECUTE }],
        parametersSchema: { type: 'object', properties: { command: { type: 'string' } }, required: ['command'] },
        status: 'registered',
      },
      {
        id: 'git.status',
        name: 'Git Status Inspector',
        description: 'Inspects repository status and file changes',
        version: '0.1.0-alpha',
        requiredPermissions: [{ resource: ResourceType.PROJECTS, action: 'read', level: PermissionLevel.READ }],
        parametersSchema: { type: 'object', properties: { repoPath: { type: 'string' } } },
        status: 'registered',
      },
      {
        id: 'git.commit',
        name: 'Git Committer',
        description: 'Creates verified Git commits in project repository',
        version: '0.1.0-alpha',
        requiredPermissions: [{ resource: ResourceType.PROJECTS, action: 'modify', level: PermissionLevel.WRITE }],
        parametersSchema: { type: 'object', properties: { message: { type: 'string' } }, required: ['message'] },
        status: 'registered',
      },
      {
        id: 'github.api',
        name: 'GitHub API Client',
        description: 'Queries remote pull requests, issues, and repository metadata',
        version: '0.1.0-alpha',
        requiredPermissions: [{ resource: ResourceType.EXTERNAL_ACCOUNTS, action: 'read', level: PermissionLevel.READ }],
        parametersSchema: { type: 'object', properties: { endpoint: { type: 'string' } } },
        status: 'registered',
      },
      {
        id: 'camera.capture',
        name: 'Camera Capture',
        description: 'Captures camera frame upon explicit user authorization',
        version: '0.1.0-alpha',
        requiredPermissions: [{ resource: ResourceType.CAMERA, action: 'read', level: PermissionLevel.ADMIN }],
        parametersSchema: { type: 'object', properties: { deviceId: { type: 'string' } } },
        status: 'registered',
      },
      {
        id: 'microphone.record',
        name: 'Microphone Audio Stream',
        description: 'Streams microphone audio for speech recognition upon authorization',
        version: '0.1.0-alpha',
        requiredPermissions: [{ resource: ResourceType.MICROPHONE, action: 'read', level: PermissionLevel.ADMIN }],
        parametersSchema: { type: 'object', properties: { sampleRate: { type: 'number' } } },
        status: 'registered',
      },
      {
        id: 'calendar.read',
        name: 'Calendar Reader',
        description: 'Queries user schedule and calendar appointments',
        version: '0.1.0-alpha',
        requiredPermissions: [{ resource: ResourceType.APIS, action: 'read', level: PermissionLevel.READ }],
        parametersSchema: { type: 'object', properties: { date: { type: 'string' } } },
        status: 'registered',
      },
      {
        id: 'email.send',
        name: 'Email Dispatcher',
        description: 'Dispatches approved emails with explicit administrator permission',
        version: '0.1.0-alpha',
        requiredPermissions: [{ resource: ResourceType.EXTERNAL_ACCOUNTS, action: 'write', level: PermissionLevel.ADMIN }],
        parametersSchema: {
          type: 'object',
          properties: { to: { type: 'string' }, subject: { type: 'string' }, body: { type: 'string' } },
          required: ['to', 'subject', 'body'],
        },
        status: 'registered',
      },
      {
        id: 'tuklas.api',
        name: 'Tuklas Educational API',
        description: 'Queries Tuklas lessons, student progress, and practice assessments',
        version: '0.1.0-alpha',
        requiredPermissions: [{ resource: ResourceType.APIS, action: 'read', level: PermissionLevel.READ }],
        parametersSchema: { type: 'object', properties: { lessonId: { type: 'string' } } },
        status: 'registered',
      },
      {
        id: 'device_bridge.status',
        name: 'Device Bridge Status',
        description: 'Queries authorized phone and laptop system telemetry',
        version: '0.1.0-alpha',
        requiredPermissions: [{ resource: ResourceType.DEVICES, action: 'read', level: PermissionLevel.READ }],
        parametersSchema: { type: 'object', properties: { deviceId: { type: 'string' } } },
        status: 'registered',
      },
      {
        id: 'device_bridge.command',
        name: 'Device Bridge Remote Command',
        description: 'Dispatches approved commands to authorized peripheral device',
        version: '0.1.0-alpha',
        requiredPermissions: [{ resource: ResourceType.DEVICES, action: 'execute', level: PermissionLevel.EXECUTE }],
        parametersSchema: { type: 'object', properties: { deviceId: { type: 'string' }, command: { type: 'string' } } },
        status: 'registered',
      },
      {
        id: 'data_analysis.run',
        name: 'Data Analysis Runner',
        description: 'Performs statistical computations and chart generation on datasets',
        version: '0.1.0-alpha',
        requiredPermissions: [{ resource: ResourceType.FILES, action: 'read', level: PermissionLevel.READ }],
        parametersSchema: { type: 'object', properties: { datasetPath: { type: 'string' } } },
        status: 'registered',
      },
      {
        id: 'creative.generate_image',
        name: 'Creative Image Synthesizer',
        description: 'Invokes authorized creative API for image generation',
        version: '0.1.0-alpha',
        requiredPermissions: [{ resource: ResourceType.APIS, action: 'execute', level: PermissionLevel.EXECUTE }],
        parametersSchema: { type: 'object', properties: { prompt: { type: 'string' } }, required: ['prompt'] },
        status: 'registered',
      },
    ];

    for (const tool of foundationalTools) {
      this.register(tool);
    }
  }
}
