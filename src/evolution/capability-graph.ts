import { CapabilityGraph, CapabilityNode } from './evolution.interface.js';

export class CapabilityGraphEngine {
  private nodes: CapabilityNode[] = [];

  constructor() {
    this.seedGraph();
  }

  private seedGraph(): void {
    this.nodes = [
      {
        id: 'cap_math',
        name: 'Symbolic & Numerical Mathematics',
        category: 'reasoning',
        phase: 5,
        description: 'Exact symbolic solving, calculus, matrices, polynomial roots, and LET review problem sets.',
        dependencies: ['cap_core'],
        synergyWith: ['cap_data', 'cap_coding', 'cap_verification'],
      },
      {
        id: 'cap_research',
        name: 'Epistemic Research & Fact Grounding',
        category: 'knowledge',
        phase: 6,
        description: 'Multi-source citation synthesis, epistemological confidence scoring, and fact checking.',
        dependencies: ['cap_core', 'cap_memory'],
        synergyWith: ['cap_docs', 'cap_verification', 'cap_learning'],
      },
      {
        id: 'cap_data',
        name: 'Statistical Modeling & Data Analytics',
        category: 'analytics',
        phase: 7,
        description: 'Outlier detection, hypothesis testing, regressions, and dataset sanitization.',
        dependencies: ['cap_core', 'cap_math'],
        synergyWith: ['cap_math', 'cap_finance', 'cap_creative'],
      },
      {
        id: 'cap_coding',
        name: 'Autonomous Code Synthesis & AST Refactoring',
        category: 'execution',
        phase: 8,
        description: 'Full-stack generation, cyclomatic complexity auditing, syntax validation, and test harness authoring.',
        dependencies: ['cap_core', 'cap_devenv'],
        synergyWith: ['cap_verification', 'cap_devenv', 'cap_skill_builder'],
      },
      {
        id: 'cap_docs',
        name: 'Document Intelligence & Multimodal Parsing',
        category: 'perception',
        phase: 9,
        description: 'Multi-format PDF, DOCX, CSV parsing, structure extraction, and tabular schema inferencing.',
        dependencies: ['cap_core'],
        synergyWith: ['cap_research', 'cap_data', 'cap_tuklas'],
      },
      {
        id: 'cap_tuklas',
        name: 'Tuklas Adaptive Learning & DepEd Pedagogy',
        category: 'education',
        phase: 12,
        description: 'Curriculum mapping, mastery assessment, Socratic practice, and DepEd competency evaluation.',
        dependencies: ['cap_core', 'cap_math'],
        synergyWith: ['cap_math', 'cap_docs', 'cap_creative'],
      },
      {
        id: 'cap_collab',
        name: 'Multi-Agent Collective Intelligence',
        category: 'orchestration',
        phase: 25,
        description: 'Consensus voting, distributed blackboard missions, agent delegation, and peer review.',
        dependencies: ['cap_core', 'cap_planning'],
        synergyWith: ['cap_verification', 'cap_learning', 'cap_context'],
      },
      {
        id: 'cap_verification',
        name: 'Anti-Hallucination & Empirical Verification',
        category: 'governance',
        phase: 26,
        description: 'Cryptographic attestation, factual evidence checking, error diagnosis, and recovery loops.',
        dependencies: ['cap_core'],
        synergyWith: ['cap_learning', 'cap_security', 'cap_collab'],
      },
      {
        id: 'cap_learning',
        name: 'Self-Correction & Autonomous Rule Evolution',
        category: 'evolution',
        phase: 27,
        description: 'Incident ingestion, learned heuristics synthesis, parameter clamping guardrails, and zero recurrence telemetry.',
        dependencies: ['cap_verification'],
        synergyWith: ['cap_verification', 'cap_security', 'cap_evolution'],
      },
      {
        id: 'cap_security',
        name: 'Citadel Cryptography & Statutory Privacy Hardening',
        category: 'security',
        phase: 29,
        description: 'AES-256-GCM envelope encryption, RA 10173 Philippine PII vault, prototype pollution defense, and ephemeral delegation.',
        dependencies: ['cap_core'],
        synergyWith: ['cap_verification', 'cap_learning', 'cap_context', 'cap_evolution'],
      },
      {
        id: 'cap_evolution',
        name: 'Autonomous Self-Evolution & Master System Synthesis',
        category: 'apex',
        phase: 30,
        description: 'Holistic system equilibrium, autonomous patch synthesis, macro-mission orchestration, and sovereign synthesis.',
        dependencies: ['cap_security', 'cap_learning', 'cap_context', 'cap_collab'],
        synergyWith: ['cap_collab', 'cap_learning', 'cap_verification', 'cap_security'],
      },
    ];
  }

  public getCapabilityGraph(): CapabilityGraph {
    let edgeCount = 0;
    for (const node of this.nodes) {
      edgeCount += node.dependencies.length + node.synergyWith.length;
    }

    const topWorkflows = [
      'Empirical Autonomous Research: Research -> Docs -> Math -> Verification -> Citadel Seal',
      'Adaptive Pedagogy Pipeline: Tuklas -> Math -> Data Analytics -> Socratic Tutoring',
      'Zero-Recurrence Code Synthesis: Coding -> AST -> Verification -> Self-Correction Guardrails',
      'Sovereign Macro-Mission: Multi-Agent Consensus -> Ephemeral Delegation -> Macro-Execution -> Evolution Patch',
    ];

    return {
      nodes: [...this.nodes],
      edgesCount: edgeCount,
      synergyClustersCount: 5,
      topWorkflows,
    };
  }

  public discoverSynergies(category?: string): CapabilityNode[] {
    if (!category) return [...this.nodes];
    return this.nodes.filter((n) => n.category.toLowerCase() === category.toLowerCase());
  }
}
