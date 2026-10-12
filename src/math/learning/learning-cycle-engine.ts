/**
 * JARVIS Phase 7 - Socratic Learning Cycle Engine
 * Orchestrates the full pedagogical cycle:
 * Assess -> Identify Weaknesses -> Teach Prerequisite -> Worked Example -> Practice -> Check -> Explain Mistake -> Repeat -> Mastery
 */

import {
  MathDomain,
  MathDifficulty,
  MathProblem,
  MathStep,
  WorkedExample,
  LearningAssessment,
  LearningDiagnosticResult,
  MathEvaluationResult,
} from '../math.interface.js';

export interface UserTopicMastery {
  userId: string;
  domain: MathDomain;
  masteredTopics: string[];
  weaknessTopics: string[];
  currentPhase:
    | 'assessment'
    | 'teach_prerequisite'
    | 'worked_example'
    | 'practice'
    | 'mastery_achieved';
  currentTopic?: string;
  consecutiveCorrect: number;
  lastUpdated: string;
}

export class LearningCycleEngine {
  private userMasteryStore: Map<string, UserTopicMastery> = new Map();

  // Curated worked examples per domain/topic
  private workedExamplesDatabase: WorkedExample[] = [
    {
      id: 'WE-ALG-01',
      domain: 'algebra',
      topic: 'Quadratic Equations by Factoring',
      difficulty: 'intermediate',
      problem: 'Solve for x: x^2 - 5x + 6 = 0',
      conceptSummary:
        'When a quadratic equation has leading coefficient 1, find two numbers that multiply to c (6) and sum to b (-5).',
      steps: [
        {
          stepNumber: 1,
          title: 'Find Factors of 6 that Add to -5',
          expression: '(-2) * (-3) = 6  and  (-2) + (-3) = -5',
          explanation: 'The factors -2 and -3 satisfy both product and sum conditions.',
          ruleApplied: 'Factor Pairs',
        },
        {
          stepNumber: 2,
          title: 'Rewrite in Factored Form',
          expression: '(x - 2)(x - 3) = 0',
          explanation: 'Express quadratic polynomial as product of two linear factors.',
          ruleApplied: 'Factoring: x^2 + (p+q)x + pq = (x+p)(x+q)',
        },
        {
          stepNumber: 3,
          title: 'Apply Zero Product Property',
          expression: 'x - 2 = 0  or  x - 3 = 0',
          explanation: 'If a * b = 0, then a = 0 or b = 0.',
          ruleApplied: 'Zero Product Property',
        },
        {
          stepNumber: 4,
          title: 'Solve Each Linear Branch',
          expression: 'x = 2  or  x = 3',
          explanation: 'Isolate x in each simple equation.',
          ruleApplied: 'Addition Property of Equality',
        },
      ],
      finalAnswer: 'x = 2, x = 3',
      keyTakeaways: [
        'Always set the quadratic equal to 0 first.',
        'Watch signs carefully: positive product with negative sum means both factors are negative.',
        'Verify solutions by substituting back into original equation.',
      ],
    },
    {
      id: 'WE-CALC-01',
      domain: 'differential_calculus',
      topic: 'Power Rule and Tangent Line Slope',
      difficulty: 'intermediate',
      problem: 'Find the derivative of f(x) = 4x^3 - 7x + 2 and evaluate f\'(1).',
      conceptSummary:
        'The power rule states that the derivative of x^n is n * x^(n-1). Constants differentiate to 0.',
      steps: [
        {
          stepNumber: 1,
          title: 'Apply Sum and Constant Multiple Rule',
          expression: "f'(x) = 4 * d/dx[x^3] - 7 * d/dx[x] + d/dx[2]",
          explanation: 'Differentiate each term independently.',
          ruleApplied: 'Linearity of Differentiation',
        },
        {
          stepNumber: 2,
          title: 'Apply Power Rule',
          expression: "f'(x) = 4(3x^2) - 7(1) + 0 = 12x^2 - 7",
          explanation: 'Multiply each coefficient by power and decrement exponent by 1.',
          ruleApplied: 'Power Rule: d/dx[x^n] = n*x^(n-1)',
        },
        {
          stepNumber: 3,
          title: 'Substitute x = 1',
          expression: "f'(1) = 12(1)^2 - 7 = 12(1) - 7 = 5",
          explanation: 'Evaluate slope of tangent line at x = 1.',
          ruleApplied: 'Point Evaluation',
        },
      ],
      finalAnswer: "f'(x) = 12x^2 - 7;  f'(1) = 5",
      keyTakeaways: [
        'Derivative gives the instantaneous rate of change or tangent slope.',
        'Constant terms always drop out to zero.',
      ],
    },
    {
      id: 'WE-STAT-01',
      domain: 'statistics',
      topic: 'Sample Variance and Standard Deviation',
      difficulty: 'introductory',
      problem: 'Calculate the sample mean and standard deviation for dataset: [4, 8, 6, 5, 7].',
      conceptSummary:
        'Standard deviation measures data dispersion around the mean using Bessel\'s correction (n - 1).',
      steps: [
        {
          stepNumber: 1,
          title: 'Calculate Sample Mean',
          expression: 'x̄ = (4 + 8 + 6 + 5 + 7) / 5 = 30 / 5 = 6',
          explanation: 'Sum elements and divide by sample size n = 5.',
          ruleApplied: 'Sample Mean',
        },
        {
          stepNumber: 2,
          title: 'Calculate Deviations from Mean and Squared Deviations',
          expression: '(4-6)^2 + (8-6)^2 + (6-6)^2 + (5-6)^2 + (7-6)^2 = 4 + 4 + 0 + 1 + 1 = 10',
          explanation: 'Compute sum of squared deviations Σ(x - x̄)^2.',
          ruleApplied: 'Sum of Squared Errors (SSE)',
        },
        {
          stepNumber: 3,
          title: 'Calculate Sample Variance (s^2)',
          expression: 's^2 = SSE / (n - 1) = 10 / (5 - 1) = 10 / 4 = 2.5',
          explanation: 'Divide by degrees of freedom n - 1 = 4.',
          ruleApplied: "Bessel's Correction",
        },
        {
          stepNumber: 4,
          title: 'Compute Sample Standard Deviation (s)',
          expression: 's = √2.5 ≈ 1.5811',
          explanation: 'Take square root of sample variance.',
          ruleApplied: 'Standard Deviation Definition',
        },
      ],
      finalAnswer: 'Mean = 6, Sample Variance = 2.5, Standard Deviation ≈ 1.5811',
      keyTakeaways: [
        'Always divide by (n - 1) for sample data, and N for population data.',
        'Standard deviation has the same units as original observations.',
      ],
    },
  ];

  // Diagnostic questions per domain
  private diagnosticQuestionPool: Record<MathDomain, MathProblem[]> = {
    arithmetic: [
      {
        id: 'DIAG-ARITH-01',
        domain: 'arithmetic',
        topic: 'Order of Operations',
        difficulty: 'introductory',
        question: 'Evaluate: 18 - 3 * (4 + 2) / 2',
        correctAnswer: '9',
        explanation: 'Parentheses first: 4+2=6. Multiplication/division: 3*6=18, 18/2=9. Subtraction: 18-9=9.',
        prerequisites: ['PEMDAS', 'Basic arithmetic'],
        steps: [],
      },
      {
        id: 'DIAG-ARITH-02',
        domain: 'arithmetic',
        topic: 'Fractions and Reciprocals',
        difficulty: 'introductory',
        question: 'Simplify: (3/4) / (2/5)',
        correctAnswer: '15/8',
        explanation: 'Multiply by reciprocal: (3/4) * (5/2) = 15/8.',
        prerequisites: ['Fraction division', 'Reciprocals'],
        steps: [],
      },
    ],
    algebra: [
      {
        id: 'DIAG-ALG-01',
        domain: 'algebra',
        topic: 'Linear Equations',
        difficulty: 'introductory',
        question: 'Solve for x: 3x - 7 = 14',
        correctAnswer: '7',
        explanation: '3x = 14 + 7 = 21 => x = 21 / 3 = 7.',
        prerequisites: ['Isolating variables', 'Inverse operations'],
        steps: [],
      },
      {
        id: 'DIAG-ALG-02',
        domain: 'algebra',
        topic: 'Quadratic Discriminant',
        difficulty: 'intermediate',
        question: 'What is the discriminant of 2x^2 + 4x + 2 = 0?',
        correctAnswer: '0',
        explanation: 'b^2 - 4ac = 4^2 - 4(2)(2) = 16 - 16 = 0.',
        prerequisites: ['Quadratic formula', 'Discriminant definition'],
        steps: [],
      },
    ],
    advanced_algebra: [],
    geometry: [
      {
        id: 'DIAG-GEOM-01',
        domain: 'geometry',
        topic: 'Pythagorean Theorem',
        difficulty: 'introductory',
        question: 'In a right triangle with legs of length 6 and 8, what is the length of the hypotenuse?',
        correctAnswer: '10',
        explanation: 'c = √(6^2 + 8^2) = √(36 + 64) = √100 = 10.',
        prerequisites: ['Right triangle geometry', 'Square roots'],
        steps: [],
      },
    ],
    solid_geometry: [],
    trigonometry: [
      {
        id: 'DIAG-TRIG-01',
        domain: 'trigonometry',
        topic: 'Pythagorean Trigonometric Identity',
        difficulty: 'introductory',
        question: 'If sin(θ) = 3/5 and θ is acute, what is cos(θ)?',
        correctAnswer: '4/5',
        explanation: 'cos^2(θ) = 1 - sin^2(θ) = 1 - 9/25 = 16/25 => cos(θ) = 4/5.',
        prerequisites: ['Trigonometric identities', 'Right triangle ratios'],
        steps: [],
      },
    ],
    precalculus: [],
    differential_calculus: [
      {
        id: 'DIAG-DCALC-01',
        domain: 'differential_calculus',
        topic: 'Power Rule',
        difficulty: 'intermediate',
        question: 'What is the derivative of 5x^4 - 2x + 7?',
        correctAnswer: '20x^3 - 2',
        explanation: 'd/dx[5x^4] = 20x^3, d/dx[-2x] = -2, d/dx[7] = 0.',
        prerequisites: ['Power rule', 'Linearity of differentiation'],
        steps: [],
      },
    ],
    integral_calculus: [
      {
        id: 'DIAG-ICALC-01',
        domain: 'integral_calculus',
        topic: 'Definite Integral',
        difficulty: 'intermediate',
        question: 'Evaluate ∫_0^2 (3x^2) dx',
        correctAnswer: '8',
        explanation: 'F(x) = x^3. F(2) - F(0) = 2^3 - 0 = 8.',
        prerequisites: ['Antiderivatives', 'Fundamental Theorem of Calculus'],
        steps: [],
      },
    ],
    differential_equations: [],
    statistics: [
      {
        id: 'DIAG-STAT-01',
        domain: 'statistics',
        topic: 'Arithmetic Mean',
        difficulty: 'introductory',
        question: 'What is the mean of 10, 20, 30, 40, and 50?',
        correctAnswer: '30',
        explanation: 'Sum = 150. Count = 5. Mean = 150 / 5 = 30.',
        prerequisites: ['Addition and division', 'Mean definition'],
        steps: [],
      },
    ],
    logic: [],
    sets: [],
    number_systems: [],
  };

  /**
   * Phase 1: ASSESS
   * Generates a diagnostic test for the user in a specified math domain.
   */
  public generateAssessment(userId: string, domain: MathDomain): LearningAssessment {
    const problems = this.diagnosticQuestionPool[domain] || [];
    const assessment: LearningAssessment = {
      assessmentId: `diag-${domain}-${Date.now()}`,
      userId,
      domain,
      totalProblems: problems.length,
      problems,
      generatedAt: new Date().toISOString(),
    };

    // Initialize or update user mastery state
    const current = this.userMasteryStore.get(`${userId}:${domain}`) || {
      userId,
      domain,
      masteredTopics: [],
      weaknessTopics: [],
      currentPhase: 'assessment',
      consecutiveCorrect: 0,
      lastUpdated: new Date().toISOString(),
    };
    current.currentPhase = 'assessment';
    this.userMasteryStore.set(`${userId}:${domain}`, current);

    return assessment;
  }

  /**
   * Phase 2: IDENTIFY WEAKNESSES & DIAGNOSE
   * Evaluates student's assessment answers, extracts weakness topics and remediation plan.
   */
  public diagnoseAssessment(
    userId: string,
    domain: MathDomain,
    submissions: { problemId: string; studentAnswer: string }[]
  ): LearningDiagnosticResult {
    const problems = this.diagnosticQuestionPool[domain] || [];
    let correctCount = 0;
    const weaknessTopics: string[] = [];
    const masteredTopics: string[] = [];
    const remediationPlan: LearningDiagnosticResult['remediationPlan'] = [];

    for (const p of problems) {
      const sub = submissions.find((s) => s.problemId === p.id);
      const studentClean = (sub?.studentAnswer || '').replace(/\s+/g, '').toLowerCase();
      const expectedClean = String(p.correctAnswer).replace(/\s+/g, '').toLowerCase();

      if (studentClean === expectedClean) {
        correctCount++;
        masteredTopics.push(p.topic);
      } else {
        weaknessTopics.push(p.topic);
        for (const prereq of p.prerequisites) {
          remediationPlan.push({
            prerequisiteTopic: prereq,
            description: `Review fundamental prerequisite: ${prereq} required for ${p.topic}.`,
            recommendedActions: [
              `Review theory for ${prereq}`,
              `Study step-by-step worked example in ${p.topic}`,
              `Solve 3 targeted practice problems`,
            ],
          });
        }
      }
    }

    const total = problems.length || 1;
    const masteryPercent = Math.round((correctCount / total) * 100);
    const passed = masteryPercent >= 80;

    // Update mastery record
    const record: UserTopicMastery = {
      userId,
      domain,
      masteredTopics,
      weaknessTopics,
      currentPhase: passed ? 'mastery_achieved' : 'teach_prerequisite',
      currentTopic: weaknessTopics[0] || masteredTopics[0],
      consecutiveCorrect: passed ? 3 : 0,
      lastUpdated: new Date().toISOString(),
    };
    this.userMasteryStore.set(`${userId}:${domain}`, record);

    return {
      userId,
      domain,
      score: correctCount,
      masteryPercent,
      passed,
      masteredTopics,
      weaknessTopics,
      remediationPlan,
    };
  }

  /**
   * Phase 3: TEACH PREREQUISITE
   * Provides foundational theoretical explanation for a weak prerequisite topic.
   */
  public teachPrerequisite(prerequisiteTopic: string): {
    topic: string;
    conceptExplanation: string;
    rulesAndFormulas: string[];
    tips: string[];
  } {
    return {
      topic: prerequisiteTopic,
      conceptExplanation: `Foundational study for ${prerequisiteTopic}: Understanding this concept is essential before tackling advanced problem solving in this domain.`,
      rulesAndFormulas: [
        'Always check the domain of validity and boundary values.',
        'Apply operations systematically according to standard mathematical axioms.',
        'Verify step-by-step consistency using inverse operations.',
      ],
      tips: [
        'Write out each intermediate algebraic step explicitly.',
        'Never skip parentheses when substituting negative numbers.',
        'Check units and signs before declaring the final answer.',
      ],
    };
  }

  /**
   * Phase 4: WORKED EXAMPLE
   * Generates or retrieves a step-by-step worked example.
   */
  public getWorkedExample(domain: MathDomain, topic?: string): WorkedExample {
    const match = this.workedExamplesDatabase.find(
      (we) => we.domain === domain && (!topic || we.topic.toLowerCase().includes(topic.toLowerCase()))
    );

    if (match) return match;

    // Generate dynamic fallback worked example
    return {
      id: `WE-GEN-${domain}-${Date.now()}`,
      domain,
      topic: topic || 'Standard Problem Solving',
      difficulty: 'intermediate',
      problem: `Solve a representative problem in ${domain} (${topic || 'Core Concept'}).`,
      conceptSummary: `Systematic resolution using standard ${domain} methods.`,
      steps: [
        {
          stepNumber: 1,
          title: 'Problem Formulation',
          expression: 'Identify given variables and target unknown',
          explanation: 'State all known values and the target goal clearly.',
        },
        {
          stepNumber: 2,
          title: 'Apply Relevant Theorem / Formula',
          expression: 'Substitute knowns into equation',
          explanation: 'Carry out mathematical transformations with care.',
        },
        {
          stepNumber: 3,
          title: 'Verify Solution',
          expression: 'Confirm result consistency',
          explanation: 'Substitute back into initial conditions to ensure truth.',
        },
      ],
      finalAnswer: 'Solution Verified',
      keyTakeaways: [
        'Identify knowns vs unknowns before computing.',
        'Maintain equality through balanced algebraic steps.',
      ],
    };
  }

  /**
   * Phase 5 & 6: PRACTICE & CHECK ANSWER
   * Checks the student's solution, analyzes mistakes, and indicates the next pedagogical step.
   */
  public checkAnswer(
    userId: string,
    domain: MathDomain,
    studentAnswer: string | number,
    expectedAnswer: string | number,
    topic = 'General'
  ): MathEvaluationResult {
    const studentClean = String(studentAnswer).trim().toLowerCase().replace(/\s+/g, '');
    const expectedClean = String(expectedAnswer).trim().toLowerCase().replace(/\s+/g, '');

    const isCorrect = studentClean === expectedClean;
    const storeKey = `${userId}:${domain}`;
    const userState = this.userMasteryStore.get(storeKey) || {
      userId,
      domain,
      masteredTopics: [],
      weaknessTopics: [],
      currentPhase: 'practice',
      consecutiveCorrect: 0,
      lastUpdated: new Date().toISOString(),
    };

    if (isCorrect) {
      userState.consecutiveCorrect += 1;
      if (!userState.masteredTopics.includes(topic)) {
        userState.masteredTopics.push(topic);
      }
      userState.weaknessTopics = userState.weaknessTopics.filter((t) => t !== topic);

      const achievedMastery = userState.consecutiveCorrect >= 3;
      userState.currentPhase = achievedMastery ? 'mastery_achieved' : 'practice';
      userState.lastUpdated = new Date().toISOString();
      this.userMasteryStore.set(storeKey, userState);

      return {
        isCorrect: true,
        studentAnswer: String(studentAnswer),
        expectedAnswer: String(expectedAnswer),
        score: 1.0,
        identifiedWeaknesses: [],
        nextRecommendedStep: achievedMastery ? 'mastery_achieved' : 'practice_more',
      };
    } else {
      // Incorrect answer: Socratic remediation
      userState.consecutiveCorrect = 0;
      if (!userState.weaknessTopics.includes(topic)) {
        userState.weaknessTopics.push(topic);
      }
      userState.currentPhase = 'teach_prerequisite';
      userState.lastUpdated = new Date().toISOString();
      this.userMasteryStore.set(storeKey, userState);

      const workedEx = this.getWorkedExample(domain, topic);

      return {
        isCorrect: false,
        studentAnswer: String(studentAnswer),
        expectedAnswer: String(expectedAnswer),
        score: 0.0,
        identifiedWeaknesses: [topic],
        mistakeExplanation: `Your answer was "${studentAnswer}", but the expected answer is "${expectedAnswer}". Review the step-by-step worked example below to correct the underlying misconception.`,
        remedialConcept: `Review fundamentals of ${topic}`,
        nextRecommendedStep: 'worked_example',
        workedExample: workedEx,
      };
    }
  }

  /**
   * Retrieves the current mastery status of a user in a domain.
   */
  public getUserMastery(userId: string, domain: MathDomain): UserTopicMastery {
    return (
      this.userMasteryStore.get(`${userId}:${domain}`) || {
        userId,
        domain,
        masteredTopics: [],
        weaknessTopics: [],
        currentPhase: 'assessment',
        consecutiveCorrect: 0,
        lastUpdated: new Date().toISOString(),
      }
    );
  }
}
