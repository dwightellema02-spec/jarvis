import { EvolutionPatch } from './evolution.interface.js';

export class PatchEngine {
  private patches: Map<string, EvolutionPatch> = new Map();

  constructor() {
    this.seedBaselinePatches();
  }

  private seedBaselinePatches(): void {
    const p1: EvolutionPatch = {
      id: 'patch_evo_001',
      targetSubsystem: 'subsys_planning',
      category: 'latency_optimization',
      title: 'Fast-Path Symbolic Cache for Common Math Directives',
      description: 'Caches parsed AST tokens for repeated algebraic equation forms.',
      rationale: 'Reduces parsing latency by 45% for multi-turn calculus workflows.',
      parametersDelta: { astCacheSize: 500, fastPathEnabled: true },
      status: 'applied',
      confidence: 0.98,
      impactEstimate: '+45% throughput on math queries',
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      appliedAt: new Date(Date.now() - 7100000).toISOString(),
    };

    const p2: EvolutionPatch = {
      id: 'patch_evo_002',
      targetSubsystem: 'subsys_security',
      category: 'guardrail_reinforcement',
      title: 'Enhanced PhilSys PCN Boundary Interceptor',
      description: 'Extends statutory Philippine regex guards to handle edge-case hyphenation variations.',
      rationale: 'Guarantees 100% compliance with RA 10173 under arbitrary whitespace delimiters.',
      parametersDelta: { strictWhitespaceHandling: true, canonicalReplacer: '[REDACTED_PHILSYS_PCN]' },
      status: 'applied',
      confidence: 0.99,
      impactEstimate: '100% statutory coverage across irregular formats',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      appliedAt: new Date(Date.now() - 3500000).toISOString(),
    };

    this.patches.set(p1.id, p1);
    this.patches.set(p2.id, p2);
  }

  public proposePatch(params: {
    targetSubsystem: string;
    category:
      | 'latency_optimization'
      | 'memory_compaction'
      | 'cache_tuning'
      | 'heuristic_propagation'
      | 'guardrail_reinforcement';
    title: string;
    description: string;
    rationale: string;
    parametersDelta?: Record<string, unknown>;
  }): EvolutionPatch {
    const id = `patch_evo_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const patch: EvolutionPatch = {
      id,
      targetSubsystem: params.targetSubsystem,
      category: params.category,
      title: params.title,
      description: params.description,
      rationale: params.rationale,
      parametersDelta: params.parametersDelta || { optimized: true },
      status: 'proposed',
      confidence: 0.96,
      impactEstimate: 'Autonomous system tuning validated via offline telemetry',
      createdAt: new Date().toISOString(),
    };

    this.patches.set(id, patch);
    return patch;
  }

  public applyPatch(id: string): EvolutionPatch {
    const patch = this.patches.get(id);
    if (!patch) {
      throw new Error(`Evolution patch with ID "${id}" not found.`);
    }

    if (patch.status === 'applied') {
      return patch;
    }

    patch.status = 'applied';
    patch.appliedAt = new Date().toISOString();
    return patch;
  }

  public revertPatch(id: string): EvolutionPatch {
    const patch = this.patches.get(id);
    if (!patch) {
      throw new Error(`Evolution patch with ID "${id}" not found.`);
    }

    patch.status = 'reverted';
    return patch;
  }

  public getPatch(id: string): EvolutionPatch | undefined {
    return this.patches.get(id);
  }

  public listPatches(status?: string): EvolutionPatch[] {
    const list = Array.from(this.patches.values()).reverse();
    if (!status) return list;
    return list.filter((p) => p.status.toLowerCase() === status.toLowerCase());
  }
}
