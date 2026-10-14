export interface SubsystemStatus {
  id: string;
  name: string;
  phase: number;
  health: 'optimal' | 'nominal' | 'degraded';
  latencyMs: number;
  agentId?: string;
  toolsCount: number;
  offlineReady: boolean;
}

export interface SystemEquilibrium {
  timestamp: string;
  equilibriumScore: number; // 0.0 - 1.0 (e.g. 0.99)
  status: 'HARMONIC_EQUILIBRIUM' | 'BALANCED' | 'DRIFTING';
  activeEnginesCount: number; // 30
  totalAgentsRegistered: number;
  totalToolsRegistered: number;
  subsystems: SubsystemStatus[];
  averageLatencyMs: number;
  sovereignOfflineMode: boolean;
}

export interface CapabilityNode {
  id: string;
  name: string;
  category: string;
  phase: number;
  description: string;
  dependencies: string[];
  synergyWith: string[];
}

export interface CapabilityGraph {
  nodes: CapabilityNode[];
  edgesCount: number;
  synergyClustersCount: number;
  topWorkflows: string[];
}

export interface MacroMissionStep {
  stepIndex: number;
  subsystemId: string;
  action: string;
  description: string;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  result?: unknown;
}

export interface MacroMissionDirective {
  id: string;
  name: string;
  goal: string;
  targetPhases: number[];
  requiredSubsystems: string[];
  steps: MacroMissionStep[];
  status: 'draft' | 'running' | 'completed' | 'failed';
  initiatedAt: string;
  completedAt?: string;
  macroResult?: unknown;
}

export interface EvolutionPatch {
  id: string;
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
  parametersDelta: Record<string, unknown>;
  status: 'proposed' | 'validated' | 'applied' | 'reverted';
  confidence: number;
  impactEstimate: string;
  createdAt: string;
  appliedAt?: string;
}

export interface SystemInvariantCheck {
  name: string;
  status: 'PASSED' | 'FAILED';
  details: string;
}

export interface SystemSelfAuditReport {
  auditId: string;
  timestamp: string;
  totalEnginesChecked: number;
  passedEnginesCount: number;
  invariantsVerified: SystemInvariantCheck[];
  overallGrade: 'APEX_SOVEREIGN_CITADEL' | 'VERIFIED_STABLE' | 'DEGRADED';
  compliance: {
    offlineFirstVerified: boolean;
    zeroFakeCompletions: boolean;
    ra10173Protected: boolean;
    zeroRecurrenceTarget: boolean;
  };
  durationMs: number;
}

export interface MasterSynthesisReport {
  timestamp: string;
  systemVersion: string;
  apexPhase: 30;
  equilibrium: SystemEquilibrium;
  evolutionPatchesCount: number;
  macroMissionsCount: number;
  capabilityGraphSummary: {
    totalNodes: number;
    totalEdges: number;
  };
  sovereignManifesto: string;
}
