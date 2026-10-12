import { KnowledgeNode } from './knowledge.interface.js';

export function createInitialSecondBrainNodes(): KnowledgeNode[] {
  const now = new Date().toISOString();

  return [
    // --- STUDY / MATHEMATICS ---
    {
      id: 'node_math_calc',
      domain: 'study',
      category: 'mathematics',
      title: 'Differential & Integral Calculus and Real Analysis',
      content:
        'Foundational principles: limit definition of derivatives, continuity, epsilon-delta formulations, Mean Value Theorem, Riemann integration, and Fundamental Theorem of Calculus.',
      tags: ['mathematics', 'calculus', 'analysis', 'derivatives', 'integrals'],
      relationships: [
        { nodeId: 'node_math_diffeq', relation: 'prerequisite_of' },
        { nodeId: 'node_let_mathspec', relation: 'component_of' },
      ],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'node_math_linalg',
      domain: 'study',
      category: 'mathematics',
      title: 'Linear Algebra & Vector Spaces',
      content:
        'Vector spaces, subspaces, linear independence, basis, dimension, matrix transformations, determinants, eigenvalues, eigenvectors, and diagonalization.',
      tags: ['mathematics', 'linear_algebra', 'matrices', 'eigenvalues', 'vectors'],
      relationships: [
        { nodeId: 'node_math_diffeq', relation: 'prerequisite_of' },
        { nodeId: 'node_let_mathspec', relation: 'component_of' },
      ],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'node_math_diffeq',
      domain: 'study',
      category: 'mathematics',
      title: 'Ordinary Differential Equations (ODEs)',
      content:
        'First-order separable and linear ODEs, integrating factors, second-order linear homogeneous/non-homogeneous equations, characteristic polynomials, and systems of differential equations.',
      tags: ['mathematics', 'differential_equations', 'calculus', 'odes'],
      relationships: [
        { nodeId: 'node_math_calc', relation: 'depends_on' },
        { nodeId: 'node_math_linalg', relation: 'depends_on' },
      ],
      createdAt: now,
      updatedAt: now,
    },

    // --- STUDY / LET REVIEW ---
    {
      id: 'node_let_profed',
      domain: 'study',
      category: 'let',
      title: 'LET Professional Education & Assessment of Learning',
      content:
        'Core professional education components for Philippine LET: Child and Adolescent Development, Facilitating Learner-Centered Teaching, Assessment of Learning (Formative, Summative, Authentic), Curriculum Development, and Teaching Profession Ethics.',
      tags: ['let', 'education', 'professional_education', 'assessment', 'curriculum', 'exam'],
      relationships: [
        { nodeId: 'node_know_pedagogy', relation: 'references' },
        { nodeId: 'node_goal_let', relation: 'component_of' },
      ],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'node_let_mathspec',
      domain: 'study',
      category: 'let',
      title: 'LET Mathematics Specialization Curriculum',
      content:
        'Licensure Examination for Teachers (LET) Math Specialization: College Algebra, Trigonometry, Plane and Solid Geometry, Analytic Geometry, Number Theory, Probability & Statistics, Advanced Calculus, and History of Mathematics.',
      tags: ['let', 'mathematics', 'specialization', 'exam', 'teacher_licensure'],
      relationships: [
        { nodeId: 'node_math_calc', relation: 'references' },
        { nodeId: 'node_math_linalg', relation: 'references' },
        { nodeId: 'node_goal_let', relation: 'component_of' },
      ],
      createdAt: now,
      updatedAt: now,
    },

    // --- STUDY / THESIS ---
    {
      id: 'node_thesis_edtech',
      domain: 'study',
      category: 'thesis',
      title: 'Educational Technology & AI Systems in Mathematics Pedagogy',
      content:
        'Research thesis exploring automated formative feedback, step-by-step problem validation, student misconceptions diagnosis, and adaptive multi-agent learning assistants for high-school and tertiary mathematics.',
      tags: ['thesis', 'research', 'edtech', 'ai_education', 'mathematics'],
      relationships: [
        { nodeId: 'node_proj_tuklas', relation: 'applied_in' },
        { nodeId: 'node_know_pedagogy', relation: 'references' },
      ],
      createdAt: now,
      updatedAt: now,
    },

    // --- PROJECTS / TUKLAS ---
    {
      id: 'node_proj_tuklas',
      domain: 'projects',
      category: 'tuklas',
      title: 'Tuklas Interactive Mathematics Learning Platform',
      content:
        'Modular web application providing interactive mathematics lessons, curriculum-aligned exercise generators, step-by-step worked solutions, and teacher assessment dashboards.',
      tags: ['tuklas', 'project', 'education', 'web_app', 'interactive_math'],
      relationships: [
        { nodeId: 'node_thesis_edtech', relation: 'implements' },
        { nodeId: 'node_let_mathspec', relation: 'aligns_with' },
      ],
      createdAt: now,
      updatedAt: now,
    },

    // --- PROJECTS / JARVIS ---
    {
      id: 'node_proj_jarvis',
      domain: 'projects',
      category: 'jarvis',
      title: 'JARVIS Personal AI Assistant & Second Brain Architecture',
      content:
        'Production-grade personal AI architecture featuring Security Guardian (default-deny), Task Orchestrator (risk tiers LOW to CRITICAL), Verification Engine, Conversational Memory, and Second Brain Knowledge System.',
      tags: ['jarvis', 'project', 'ai', 'second_brain', 'orchestrator', 'guardian'],
      relationships: [
        { nodeId: 'node_know_security', relation: 'enforces' },
        { nodeId: 'node_goal_jarvis', relation: 'advances' },
      ],
      createdAt: now,
      updatedAt: now,
    },

    // --- GOALS ---
    {
      id: 'node_goal_let',
      domain: 'goals',
      category: 'let',
      title: 'Achieve Top-Tier Mastery in Philippine LET Licensure Examination',
      content:
        'Target goal: Comprehensive review across General Education, Professional Education, and Mathematics Specialization with high-confidence mock exam scores.',
      tags: ['goal', 'let', 'licensure', 'career', 'milestone'],
      relationships: [
        { nodeId: 'node_let_profed', relation: 'tracks' },
        { nodeId: 'node_let_mathspec', relation: 'tracks' },
      ],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'node_goal_jarvis',
      domain: 'goals',
      category: 'jarvis',
      title: 'Deploy Full 30-Phase JARVIS Production System',
      content:
        'Target goal: Implement, test, and verify all 30 phases of the JARVIS Master Plan with strict security gating, zero fake completions, and high-to-low risk protection.',
      tags: ['goal', 'jarvis', 'production', 'milestone'],
      relationships: [
        { nodeId: 'node_proj_jarvis', relation: 'tracks' },
      ],
      createdAt: now,
      updatedAt: now,
    },

    // --- SCHEDULE ---
    {
      id: 'node_sched_weekly',
      domain: 'schedule',
      category: 'routine',
      title: 'Weekly Research, Review & Engineering Schedule',
      content:
        'Structured schedule: Morning blocks dedicated to Mathematics analysis and LET professional education review; Afternoon blocks dedicated to JARVIS and Tuklas software engineering.',
      tags: ['schedule', 'routine', 'study_blocks', 'productivity'],
      relationships: [
        { nodeId: 'node_goal_let', relation: 'supports' },
        { nodeId: 'node_goal_jarvis', relation: 'supports' },
      ],
      createdAt: now,
      updatedAt: now,
    },

    // --- KNOWLEDGE ---
    {
      id: 'node_know_pedagogy',
      domain: 'knowledge',
      category: 'education',
      title: 'First-Principles & Socratic Mathematics Instruction',
      content:
        'Pedagogical framework: 1. Assess baseline understanding -> 2. Identify misconceptions -> 3. Build prerequisite intuition -> 4. Present worked example -> 5. Guided problem practice -> 6. Socratic error reflection -> 7. Verified mastery.',
      tags: ['pedagogy', 'socratic', 'mathematics_education', 'first_principles'],
      relationships: [
        { nodeId: 'node_proj_tuklas', relation: 'informs' },
        { nodeId: 'node_let_profed', relation: 'reinforces' },
      ],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'node_know_security',
      domain: 'knowledge',
      category: 'security',
      title: 'Capability Does Not Equal Permission Principle',
      content:
        'Core security axiom: The technical ability to perform an operation does not authorize execution. All sensitive resources (files, networks, devices, finances) require explicit authorization, risk tier evaluation (LOW, MEDIUM, HIGH, CRITICAL), and verification.',
      tags: ['security', 'authorization', 'default_deny', 'risk_tiers', 'guardian'],
      relationships: [
        { nodeId: 'node_proj_jarvis', relation: 'governs' },
      ],
      createdAt: now,
      updatedAt: now,
    },
  ];
}
