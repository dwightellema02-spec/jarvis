import {
  GeneratedToolDraft,
  SkillCreationRequest,
  SkillType,
} from './skill-builder.interface.js';
import { PermissionLevel, ResourceType } from '../security/types.js';

export class SkillGenerator {
  /**
   * Synthesizes a structured GeneratedToolDraft from a specification or prompt.
   */
  public generateSkillDraft(request: SkillCreationRequest): GeneratedToolDraft {
    const slug = this.slugify(request.name || 'custom_tool');
    const id = request.id || `custom.${slug}`;
    const now = new Date().toISOString();

    const { code, paramsSchema, testCases } = this.scaffoldImplementation(request);

    return {
      id,
      name: request.name,
      description: request.description,
      type: request.type,
      version: '1.0.0',
      requiredPermissions: request.requiredPermissions || [
        { resource: ResourceType.SYSTEM, action: 'execute', level: PermissionLevel.EXECUTE },
      ],
      parametersSchema: request.parametersSchema || paramsSchema,
      implementationCode: code,
      testCases: request.testCases && request.testCases.length > 0 ? request.testCases : testCases,
      status: 'generated',
      createdAt: now,
      updatedAt: now,
    };
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
  }

  private scaffoldImplementation(request: SkillCreationRequest): {
    code: string;
    paramsSchema: Record<string, unknown>;
    testCases: GeneratedToolDraft['testCases'];
  } {
    switch (request.type) {
      case 'api_adapter':
        return {
          code: `
function execute(params, context) {
  const p = params || {};
  const query = p.query || 'default';
  const format = p.format || 'json';
  
  // Real simulated API transformation
  return {
    status: 'success',
    source: 'simulated_upstream_api',
    queryProcessed: query,
    formatApplied: format,
    timestamp: new Date().toISOString(),
    payload: {
      resultCode: 200,
      summary: 'Data successfully retrieved and transformed for ' + query,
      recordsCount: 3,
      items: [
        { id: 1, name: query + ' Item Alpha', score: 98 },
        { id: 2, name: query + ' Item Beta', score: 85 },
        { id: 3, name: query + ' Item Gamma', score: 72 }
      ]
    }
  };
}
`,
          paramsSchema: {
            type: 'object',
            properties: {
              query: { type: 'string', description: 'Search term or endpoint parameter' },
              format: { type: 'string', enum: ['json', 'summary'], default: 'json' },
            },
            required: ['query'],
          },
          testCases: [
            {
              name: 'Valid API Query',
              input: { query: 'Robotics' },
              expectedSuccess: true,
              expectedOutputSubstring: 'Robotics Item Alpha',
            },
          ],
        };

      case 'data_transformer':
        return {
          code: `
function execute(params, context) {
  const p = params || {};
  const items = Array.isArray(p.items) ? p.items : [];
  const sortBy = p.sortBy || 'id';
  const filterKey = p.filterKey;
  
  let processed = [...items];
  if (filterKey && p.filterValue !== undefined) {
    processed = processed.filter(item => item[filterKey] === p.filterValue);
  }
  
  processed.sort((a, b) => {
    if (a[sortBy] < b[sortBy]) return -1;
    if (a[sortBy] > b[sortBy]) return 1;
    return 0;
  });
  
  return {
    originalCount: items.length,
    transformedCount: processed.length,
    sortedBy: sortBy,
    result: processed
  };
}
`,
          paramsSchema: {
            type: 'object',
            properties: {
              items: { type: 'array', description: 'Array of objects to transform' },
              sortBy: { type: 'string', default: 'id' },
              filterKey: { type: 'string' },
              filterValue: { type: 'string' },
            },
            required: ['items'],
          },
          testCases: [
            {
              name: 'Sort & Filter Records',
              input: {
                items: [{ id: 3, name: 'Zeta' }, { id: 1, name: 'Alpha' }, { id: 2, name: 'Beta' }],
                sortBy: 'id',
              },
              expectedSuccess: true,
              expectedOutputSubstring: 'Alpha',
            },
          ],
        };

      case 'custom_solver':
        return {
          code: `
function execute(params, context) {
  const p = params || {};
  const values = Array.isArray(p.values) ? p.values.map(Number) : [];
  if (values.length === 0) {
    throw new Error('Array of numeric values must not be empty');
  }
  
  const sum = values.reduce((a, b) => a + b, 0);
  const mean = sum / values.length;
  const min = Math.min(...values);
  const max = Math.max(...values);
  
  // Normalized variance
  const variance = values.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);
  
  return {
    count: values.length,
    sum,
    mean: Number(mean.toFixed(4)),
    min,
    max,
    stdDev: Number(stdDev.toFixed(4))
  };
}
`,
          paramsSchema: {
            type: 'object',
            properties: {
              values: { type: 'array', items: { type: 'number' }, description: 'Array of numbers' },
            },
            required: ['values'],
          },
          testCases: [
            {
              name: 'Calculate Statistical Vector',
              input: { values: [10, 20, 30, 40, 50] },
              expectedSuccess: true,
              expectedOutputSubstring: '"mean":30',
            },
            {
              name: 'Handle Empty Values Array Error',
              input: { values: [] },
              expectedSuccess: false,
            },
          ],
        };

      case 'automation_script':
      case 'workflow':
      default:
        return {
          code: `
function execute(params, context) {
  const p = params || {};
  const taskName = p.taskName || 'Unnamed Automation';
  const steps = Array.isArray(p.steps) ? p.steps : ['Initial Probe', 'Data Processing', 'Complete'];
  
  const stepResults = steps.map((s, idx) => ({
    stepIndex: idx + 1,
    stepName: s,
    status: 'completed',
    timestamp: new Date().toISOString()
  }));
  
  return {
    task: taskName,
    success: true,
    totalSteps: steps.length,
    steps: stepResults,
    completedAt: new Date().toISOString()
  };
}
`,
          paramsSchema: {
            type: 'object',
            properties: {
              taskName: { type: 'string' },
              steps: { type: 'array', items: { type: 'string' } },
            },
          },
          testCases: [
            {
              name: 'Run Multi-Step Pipeline',
              input: { taskName: 'Nightly Sync', steps: ['Step 1', 'Step 2'] },
              expectedSuccess: true,
              expectedOutputSubstring: 'Nightly Sync',
            },
          ],
        };
    }
  }
}
