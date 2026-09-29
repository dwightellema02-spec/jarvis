import { AgentDefinition, AgentStatus, IAgent } from './agent.interface.js';
import { PermissionLevel, ResourceType } from '../security/types.js';
import { logger } from '../utils/logger.js';

export class AgentRegistry {
  private agents: Map<string, AgentDefinition> = new Map();
  private implementations: Map<string, IAgent> = new Map();

  constructor() {
    this.registerFoundationalModularAgents();
  }

  public register(definition: AgentDefinition): void {
    this.agents.set(definition.id, { ...definition });
    logger.debug(`Registered agent: ${definition.id} (${definition.status})`);
  }

  public registerImplementation(agent: IAgent): void {
    const id = agent.definition.id;
    this.agents.set(id, { ...agent.definition, status: 'implemented' });
    this.implementations.set(id, agent);
    logger.info(`Implemented agent registered: ${id}`);
  }

  public get(id: string): AgentDefinition | undefined {
    return this.agents.get(id);
  }

  public getImplementation(id: string): IAgent | undefined {
    return this.implementations.get(id);
  }

  public list(): AgentDefinition[] {
    return Array.from(this.agents.values());
  }

  public listByStatus(status: AgentStatus): AgentDefinition[] {
    return Array.from(this.agents.values()).filter((a) => a.status === status);
  }

  public setStatus(id: string, status: AgentStatus): boolean {
    const existing = this.agents.get(id);
    if (!existing) {
      return false;
    }

    if (status === 'implemented' || status === 'enabled') {
      if (!this.implementations.has(id)) {
        logger.warn(`Cannot set agent ${id} to ${status}: no real implementation is registered.`);
        return false;
      }
    }

    this.agents.set(id, { ...existing, status });
    logger.info(`Agent ${id} status updated to ${status}`);
    return true;
  }

  /**
   * Pre-registers the conceptual modular agents defined in the JARVIS Master Plan.
   * All are set to status: 'registered' (Phase 0 Foundation), NOT 'implemented' and NOT 'enabled'.
   * This guarantees honest representation without fake functionality.
   */
  private registerFoundationalModularAgents(): void {
    const foundationalAgents: AgentDefinition[] = [
      {
        id: 'personal-assistant-agent',
        name: 'Personal Assistant Agent',
        description: 'Core coordination and conversational assistance for the user',
        version: '0.1.0-alpha',
        capabilities: ['assist_user', 'manage_requests', 'contextual_guidance'],
        requiredPermissions: [{ resource: ResourceType.PROJECTS, action: 'read', level: PermissionLevel.READ }],
        inputSchema: { type: 'object', properties: { text: { type: 'string' } } },
        outputSchema: { type: 'object', properties: { reply: { type: 'string' } } },
        status: 'registered',
      },
      {
        id: 'mathematics-agent',
        name: 'Mathematics Agent',
        description: 'Mathematics instruction, problem solving, worked examples, and LET review',
        version: '0.1.0-alpha',
        capabilities: ['teach_math', 'solve_math', 'assess_math', 'let_review'],
        requiredPermissions: [{ resource: ResourceType.FILES, action: 'read', level: PermissionLevel.READ }],
        inputSchema: { type: 'object', properties: { problem: { type: 'string' }, topic: { type: 'string' } } },
        outputSchema: { type: 'object', properties: { solution: { type: 'string' }, steps: { type: 'array' } } },
        status: 'registered',
      },
      {
        id: 'study-agent',
        name: 'Study Agent',
        description: 'Learning paths, mastery tracking, and curriculum alignment',
        version: '0.1.0-alpha',
        capabilities: ['assess_weakness', 'plan_study', 'generate_practice'],
        requiredPermissions: [{ resource: ResourceType.PROJECTS, action: 'read', level: PermissionLevel.READ }],
        inputSchema: { type: 'object' },
        outputSchema: { type: 'object' },
        status: 'registered',
      },
      {
        id: 'research-agent',
        name: 'Research Agent',
        description: 'Web research, source verification, citation support, and thesis exploration',
        version: '0.1.0-alpha',
        capabilities: ['web_research', 'extract_facts', 'compare_sources', 'format_citations'],
        requiredPermissions: [{ resource: ResourceType.WEBSITES, action: 'read', level: PermissionLevel.READ }],
        inputSchema: { type: 'object' },
        outputSchema: { type: 'object' },
        status: 'registered',
      },
      {
        id: 'coding-agent',
        name: 'Coding Agent',
        description: 'Software development, repository inspection, refactoring, and test verification',
        version: '0.1.0-alpha',
        capabilities: ['read_code', 'plan_changes', 'modify_code', 'verify_tests'],
        requiredPermissions: [
          { resource: ResourceType.FILES, action: 'read', level: PermissionLevel.READ },
          { resource: ResourceType.FILES, action: 'write', level: PermissionLevel.WRITE },
          { resource: ResourceType.APPLICATIONS, action: 'execute', level: PermissionLevel.EXECUTE },
        ],
        inputSchema: { type: 'object' },
        outputSchema: { type: 'object' },
        status: 'registered',
      },
      {
        id: 'project-agent',
        name: 'Project Agent',
        description: 'Management of Tuklas, JARVIS, Thesis, and custom user projects',
        version: '0.1.0-alpha',
        capabilities: ['track_goals', 'manage_tasks', 'summarize_progress'],
        requiredPermissions: [{ resource: ResourceType.PROJECTS, action: 'modify', level: PermissionLevel.WRITE }],
        inputSchema: { type: 'object' },
        outputSchema: { type: 'object' },
        status: 'registered',
      },
      {
        id: 'memory-agent',
        name: 'Memory Agent',
        description: 'Episodic, semantic, preference, and document memory coordinator',
        version: '0.1.0-alpha',
        capabilities: ['retrieve_memory', 'index_memory', 'correct_memory'],
        requiredPermissions: [{ resource: ResourceType.DATABASES, action: 'read', level: PermissionLevel.READ }],
        inputSchema: { type: 'object' },
        outputSchema: { type: 'object' },
        status: 'registered',
      },
      {
        id: 'goal-agent',
        name: 'Goal Agent',
        description: 'Goal decomposition, milestone tracking, and priority scheduling',
        version: '0.1.0-alpha',
        capabilities: ['decompose_goal', 'track_milestone'],
        requiredPermissions: [{ resource: ResourceType.PROJECTS, action: 'read', level: PermissionLevel.READ }],
        inputSchema: { type: 'object' },
        outputSchema: { type: 'object' },
        status: 'registered',
      },
      {
        id: 'document-agent',
        name: 'Document Agent',
        description: 'Ingestion, search, extraction, and synthesis of PDF, DOCX, XLSX, and CSV documents',
        version: '0.1.0-alpha',
        capabilities: ['read_document', 'summarize_document', 'extract_tables'],
        requiredPermissions: [{ resource: ResourceType.FILES, action: 'read', level: PermissionLevel.READ }],
        inputSchema: { type: 'object' },
        outputSchema: { type: 'object' },
        status: 'registered',
      },
      {
        id: 'calendar-agent',
        name: 'Calendar Agent',
        description: 'Schedule management, reminder coordination, and time-block planning',
        version: '0.1.0-alpha',
        capabilities: ['schedule_event', 'list_schedule'],
        requiredPermissions: [{ resource: ResourceType.APIS, action: 'read', level: PermissionLevel.READ }],
        inputSchema: { type: 'object' },
        outputSchema: { type: 'object' },
        status: 'registered',
      },
      {
        id: 'communication-agent',
        name: 'Communication Agent',
        description: 'Message drafting, notification management, and communication formatting',
        version: '0.1.0-alpha',
        capabilities: ['draft_message', 'format_notice'],
        requiredPermissions: [{ resource: ResourceType.APIS, action: 'suggest', level: PermissionLevel.SUGGEST }],
        inputSchema: { type: 'object' },
        outputSchema: { type: 'object' },
        status: 'registered',
      },
      {
        id: 'data-statistics-agent',
        name: 'Data & Statistics Agent',
        description: 'Descriptive statistics, data cleaning, correlation, regression, and visualization',
        version: '0.1.0-alpha',
        capabilities: ['compute_descriptive_stats', 'clean_dataset', 'generate_charts'],
        requiredPermissions: [{ resource: ResourceType.FILES, action: 'read', level: PermissionLevel.READ }],
        inputSchema: { type: 'object' },
        outputSchema: { type: 'object' },
        status: 'registered',
      },
      {
        id: 'creative-agent',
        name: 'Creative Agent',
        description: 'Image generation, presentation building, audio, and video orchestration',
        version: '0.1.0-alpha',
        capabilities: ['generate_presentation', 'coordinate_creative_tools'],
        requiredPermissions: [{ resource: ResourceType.APIS, action: 'execute', level: PermissionLevel.EXECUTE }],
        inputSchema: { type: 'object' },
        outputSchema: { type: 'object' },
        status: 'registered',
      },
      {
        id: 'application-agent',
        name: 'Application Agent',
        description: 'Controlled interface with authorized desktop/development software',
        version: '0.1.0-alpha',
        capabilities: ['query_app_state', 'execute_app_action'],
        requiredPermissions: [{ resource: ResourceType.APPLICATIONS, action: 'execute', level: PermissionLevel.EXECUTE }],
        inputSchema: { type: 'object' },
        outputSchema: { type: 'object' },
        status: 'registered',
      },
      {
        id: 'device-agent',
        name: 'Device Agent',
        description: 'Authorized phone, laptop, and peripheral bridge communication',
        version: '0.1.0-alpha',
        capabilities: ['get_device_status', 'send_device_notification'],
        requiredPermissions: [{ resource: ResourceType.DEVICES, action: 'read', level: PermissionLevel.READ }],
        inputSchema: { type: 'object' },
        outputSchema: { type: 'object' },
        status: 'registered',
      },
      {
        id: 'security-agent',
        name: 'Security Agent',
        description: 'Guardian enforcement, policy verification, and permission administration',
        version: '0.1.0-alpha',
        capabilities: ['audit_security', 'inspect_permissions'],
        requiredPermissions: [{ resource: ResourceType.APIS, action: 'admin', level: PermissionLevel.ADMIN }],
        inputSchema: { type: 'object' },
        outputSchema: { type: 'object' },
        status: 'registered',
      },
      {
        id: 'threat-detection-agent',
        name: 'Threat Detection Agent',
        description: 'Detection of harmful files, malicious links, and system threats',
        version: '0.1.0-alpha',
        capabilities: ['scan_target', 'evaluate_threat'],
        requiredPermissions: [{ resource: ResourceType.FILES, action: 'read', level: PermissionLevel.READ }],
        inputSchema: { type: 'object' },
        outputSchema: { type: 'object' },
        status: 'registered',
      },
      {
        id: 'scam-phishing-agent',
        name: 'Scam & Phishing Detection Agent',
        description: 'Web content and link reputation analysis to protect the user from fraudulent sites',
        version: '0.1.0-alpha',
        capabilities: ['check_url_reputation', 'analyze_phishing'],
        requiredPermissions: [{ resource: ResourceType.WEBSITES, action: 'read', level: PermissionLevel.READ }],
        inputSchema: { type: 'object' },
        outputSchema: { type: 'object' },
        status: 'registered',
      },
      {
        id: 'content-filtering-agent',
        name: 'Content Filtering Agent',
        description: 'Evaluation and filtering of unsafe web and media content according to policy',
        version: '0.1.0-alpha',
        capabilities: ['filter_content', 'classify_safety'],
        requiredPermissions: [{ resource: ResourceType.WEBSITES, action: 'read', level: PermissionLevel.READ }],
        inputSchema: { type: 'object' },
        outputSchema: { type: 'object' },
        status: 'registered',
      },
      {
        id: 'financial-research-agent',
        name: 'Financial Research Agent',
        description: 'Bitcoin education, blockchain research, market analysis, and portfolio math',
        version: '0.1.0-alpha',
        capabilities: ['bitcoin_education', 'market_research', 'portfolio_analysis'],
        requiredPermissions: [{ resource: ResourceType.FINANCIAL_SERVICES, action: 'read', level: PermissionLevel.READ }],
        inputSchema: { type: 'object' },
        outputSchema: { type: 'object' },
        status: 'registered',
      },
      {
        id: 'product-innovation-agent',
        name: 'Product Innovation Agent',
        description: 'Idea to product lifecycle: problem identification, user needs, features, and UX architecture',
        version: '0.1.0-alpha',
        capabilities: ['ideate_product', 'define_user_stories', 'design_feature_roadmap'],
        requiredPermissions: [{ resource: ResourceType.PROJECTS, action: 'read', level: PermissionLevel.READ }],
        inputSchema: { type: 'object' },
        outputSchema: { type: 'object' },
        status: 'registered',
      },
    ];

    for (const agent of foundationalAgents) {
      this.register(agent);
    }
  }
}
