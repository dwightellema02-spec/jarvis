/**
 * JARVIS Phase 12 - Tuklas EdTech Store
 * In-memory repository with Philippine DepEd K-12 & BLEPT Curricula
 */

import {
  TuklasLesson,
  TuklasLessonFilter,
  StudentProgress,
  PracticeItem,
  PracticeSet,
  PracticeGenerationRequest,
  AssessmentSubmission,
  AssessmentEvaluationResult,
  MistakeAnalysisRequest,
  MistakeAnalysisResult,
  TuklasCohortResearchData,
  TeacherAssignment,
  TeacherAssignmentRequest,
} from './tuklas.interface.js';

export class TuklasStore {
  private lessons: Map<string, TuklasLesson> = new Map();
  private students: Map<string, StudentProgress> = new Map();
  private practiceBank: PracticeItem[] = [];
  private assessments: Map<string, { id: string; title: string; items: PracticeItem[]; passingScore: number }> = new Map();
  private assignments: Map<string, TeacherAssignment> = new Map();

  constructor() {
    this.seedDefaultCurriculum();
    this.seedDefaultStudents();
    this.seedPracticeBank();
    this.seedAssessments();
    this.seedTeacherAssignments();
  }

  // ==================== LESSONS ====================

  public searchLessons(filter: TuklasLessonFilter = {}): TuklasLesson[] {
    let results = Array.from(this.lessons.values());

    if (filter.subject) {
      const sub = filter.subject.toLowerCase();
      results = results.filter((l) => l.subject.toLowerCase().includes(sub));
    }

    if (filter.gradeLevel) {
      const gl = filter.gradeLevel.toLowerCase();
      results = results.filter((l) => l.gradeLevel.toLowerCase().includes(gl));
    }

    if (filter.competencyCode) {
      const code = filter.competencyCode.toUpperCase();
      results = results.filter((l) => l.competencyCode.toUpperCase() === code);
    }

    if (filter.query) {
      const q = filter.query.toLowerCase();
      results = results.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.summary.toLowerCase().includes(q) ||
          l.competencyCode.toLowerCase().includes(q) ||
          l.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (filter.limit && filter.limit > 0) {
      results = results.slice(0, filter.limit);
    }

    return results;
  }

  public getLessonById(id: string): TuklasLesson | undefined {
    return this.lessons.get(id);
  }

  public getLessonByCompetency(competencyCode: string): TuklasLesson | undefined {
    return Array.from(this.lessons.values()).find(
      (l) => l.competencyCode.toUpperCase() === competencyCode.toUpperCase()
    );
  }

  public createLesson(lesson: Omit<TuklasLesson, 'id' | 'createdAt'>): TuklasLesson {
    const id = `lesson_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newLesson: TuklasLesson = {
      ...lesson,
      id,
      createdAt: new Date().toISOString(),
    };
    this.lessons.set(id, newLesson);
    return newLesson;
  }

  public countLessons(): number {
    return this.lessons.size;
  }

  // ==================== STUDENTS ====================

  public getStudentProgress(studentId: string): StudentProgress | undefined {
    return this.students.get(studentId);
  }

  public updateStudentProgress(progress: StudentProgress): void {
    this.students.set(progress.studentId, progress);
  }

  public countStudents(): number {
    return this.students.size;
  }

  // ==================== PRACTICE GENERATOR ====================

  public generatePractice(req: PracticeGenerationRequest = {}): PracticeSet {
    let pool = [...this.practiceBank];

    if (req.competencyCode) {
      const code = req.competencyCode.toUpperCase();
      pool = pool.filter((item) => item.competencyCode.toUpperCase() === code);
    }

    if (req.difficulty) {
      pool = pool.filter((item) => item.difficulty === req.difficulty);
    }

    // If pool empty after filters, fallback to all pool items or default items
    if (pool.length === 0) {
      pool = [...this.practiceBank];
    }

    const count = Math.min(req.count || 3, pool.length);
    // Shuffle and pick
    const shuffled = pool.sort(() => 0.5 - Math.random());
    const items = shuffled.slice(0, count);

    return {
      id: `practice_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      competencyCode: req.competencyCode || 'GENERAL-PRACTICE',
      difficulty: req.difficulty || 'medium',
      generatedAt: new Date().toISOString(),
      items,
    };
  }

  // ==================== ASSESSMENT EVALUATION ====================

  public evaluateAssessment(submission: AssessmentSubmission): AssessmentEvaluationResult {
    const assessment = this.assessments.get(submission.assessmentId);
    if (!assessment) {
      throw new Error(`Assessment "${submission.assessmentId}" not found in Tuklas database.`);
    }

    let correctCount = 0;
    const details = assessment.items.map((item) => {
      const studentAns = (submission.answers[item.id] || '').trim().toUpperCase();
      const correctAns = item.correctAnswer.trim().toUpperCase();
      const isCorrect = studentAns === correctAns;

      if (isCorrect) correctCount++;

      return {
        itemId: item.id,
        question: item.question,
        studentAnswer: submission.answers[item.id] || '(none)',
        correctAnswer: item.correctAnswer,
        isCorrect,
        explanation: item.explanation,
      };
    });

    const totalItems = assessment.items.length;
    const percentage = Math.round((correctCount / totalItems) * 100);
    const passed = percentage >= assessment.passingScore;

    // Update student progress if student exists
    const student = this.students.get(submission.studentId);
    if (student) {
      student.recentActivity.unshift({
        activityId: submission.assessmentId,
        type: 'assessment',
        title: assessment.title,
        score: percentage,
        timestamp: new Date().toISOString(),
      });
      student.lastActiveAt = new Date().toISOString();
      this.students.set(submission.studentId, student);
    }

    return {
      assessmentId: submission.assessmentId,
      studentId: submission.studentId,
      totalItems,
      score: correctCount,
      percentage,
      passed,
      evaluatedAt: new Date().toISOString(),
      details,
    };
  }

  // ==================== MISTAKE & DIAGNOSTICS ====================

  public analyzeMistake(req: MistakeAnalysisRequest): MistakeAnalysisResult {
    const code = req.competencyCode.toUpperCase();
    const wrong = req.wrongAnswer.trim().toLowerCase();
    const correct = req.correctAnswer.trim().toLowerCase();

    let errorType: 'conceptual' | 'procedural' | 'computational' | 'misreading' = 'conceptual';
    let misconceptionDescription = '';
    let remedialExplanation = '';
    const practiceSuggestions: string[] = [];

    // Analyze specific mathematical / scientific misconceptions
    if (code.includes('M8AL') || code.includes('FACTOR')) {
      if (wrong.includes('+') && correct.includes('-')) {
        errorType = 'conceptual';
        misconceptionDescription = 'Sign error in polynomial factoring. Confused Difference of Two Squares (a² - b² = (a - b)(a + b)) with perfect square trinomial.';
        remedialExplanation = 'Recall that a difference of two squares always factors into conjugate binomials with opposite signs: (x - y)(x + y). When expanding, the middle cross-terms cancel out.';
      } else {
        errorType = 'procedural';
        misconceptionDescription = 'Incomplete factoring. Omitted the greatest common monomial factor (GCMF) before factoring inner terms.';
        remedialExplanation = 'Always check and factor out the greatest common factor across all terms first before applying quadratic or binomial factoring methods.';
      }
    } else if (code.includes('M7AL') || code.includes('PEMDAS') || code.includes('EXPRESSION')) {
      errorType = 'procedural';
      misconceptionDescription = 'Order of Operations violation (PEMDAS/BODMAS). Performed addition/subtraction prior to multiplication/division.';
      remedialExplanation = 'Operations inside parentheses take first priority, followed by exponents, then multiplication and division from left to right, and finally addition and subtraction.';
    } else if (code.includes('M9AL') || code.includes('QUAD')) {
      errorType = 'computational';
      misconceptionDescription = 'Discriminant or arithmetic calculation error under the radical (b² - 4ac).';
      remedialExplanation = 'Carefully compute (-b)² as positive. When subtracting 4ac, double check the product signs: subtracting a negative becomes positive addition.';
    } else if (code.includes('M10SP') || code.includes('STAT')) {
      errorType = 'conceptual';
      misconceptionDescription = 'Confused percentile score rank with actual percentage test score.';
      remedialExplanation = 'Percentile indicates the proportion of scores in a distribution that a specific value is greater than or equal to. Scoring in the 80th percentile means outperforming 80% of test-takers.';
    } else {
      errorType = 'misreading';
      misconceptionDescription = `Answer "${wrong}" does not align with target standard "${correct}". Potential misreading of the problem condition or units.`;
      remedialExplanation = 'Re-read the question carefully, identifying the unknown variable sought and ensuring unit consistency.';
    }

    practiceSuggestions.push(`Practice 3 targeted items on competency ${req.competencyCode}`);
    practiceSuggestions.push(`Review worked step-by-step example on ${code}`);

    // Match recommended lesson
    const recLesson = this.getLessonByCompetency(req.competencyCode);

    return {
      competencyCode: req.competencyCode,
      errorType,
      misconceptionDescription,
      remedialExplanation,
      recommendedLessonId: recLesson?.id,
      recommendedLessonTitle: recLesson?.title,
      practiceSuggestions,
    };
  }

  // ==================== RESEARCH & COHORT DATA ====================

  public getCohortResearchData(cohortId: string = 'cohort_let_math_2025'): TuklasCohortResearchData {
    return {
      cohortId,
      cohortName: 'Philippine DepEd Region IV-A Mathematics Licensure Review Cohort',
      subject: 'Mathematics',
      gradeLevel: 'College / Pre-Service Teachers',
      studentCount: 45,
      averageScore: 78.4,
      passingRate: 82.2,
      competencyMetrics: [
        {
          code: 'M7AL-IIa-1',
          description: 'Evaluating Algebraic Expressions & Linear Equations',
          masteryRate: 0.88,
          difficultyIndex: 0.32,
          discriminationIndex: 0.45,
        },
        {
          code: 'M8AL-Ia-b-1',
          description: 'Factoring Polynomials by Special Products',
          masteryRate: 0.73,
          difficultyIndex: 0.48,
          discriminationIndex: 0.52,
        },
        {
          code: 'M9AL-Ia-b-1',
          description: 'Quadratic Equations & Discriminant Analysis',
          masteryRate: 0.69,
          difficultyIndex: 0.55,
          discriminationIndex: 0.58,
        },
        {
          code: 'M10SP-IVa-1',
          description: 'Measures of Position & Quartile Deviation',
          masteryRate: 0.81,
          difficultyIndex: 0.38,
          discriminationIndex: 0.41,
        },
        {
          code: 'LET-MATH-02',
          description: 'College & Advanced Algebra Competency',
          masteryRate: 0.76,
          difficultyIndex: 0.46,
          discriminationIndex: 0.61,
        },
      ],
      records: [
        { anonymizedId: 'anon_st_8a1f', gradeLevel: 'College', score: 92, modulesCompleted: 12, timeSpentMinutes: 340, mastered: true },
        { anonymizedId: 'anon_st_9b2e', gradeLevel: 'College', score: 86, modulesCompleted: 11, timeSpentMinutes: 290, mastered: true },
        { anonymizedId: 'anon_st_3c4d', gradeLevel: 'College', score: 79, modulesCompleted: 9, timeSpentMinutes: 240, mastered: true },
        { anonymizedId: 'anon_st_5d6c', gradeLevel: 'College', score: 74, modulesCompleted: 8, timeSpentMinutes: 210, mastered: false },
        { anonymizedId: 'anon_st_7e8b', gradeLevel: 'College', score: 68, modulesCompleted: 6, timeSpentMinutes: 160, mastered: false },
        { anonymizedId: 'anon_st_1f0a', gradeLevel: 'College', score: 95, modulesCompleted: 14, timeSpentMinutes: 380, mastered: true },
      ],
      extractedAt: new Date().toISOString(),
    };
  }

  // ==================== TEACHER ASSIGNMENTS ====================

  public createAssignment(req: TeacherAssignmentRequest, teacherId: string): TeacherAssignment {
    const id = `asgn_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const assignment: TeacherAssignment = {
      id,
      classId: req.classId,
      title: req.title,
      lessonId: req.lessonId,
      competencyCode: req.competencyCode,
      assignedBy: teacherId,
      dueDate: req.dueDate,
      status: 'active',
      instructions: req.instructions,
      createdAt: new Date().toISOString(),
    };

    this.assignments.set(id, assignment);
    return assignment;
  }

  public listAssignments(classId?: string): TeacherAssignment[] {
    const list = Array.from(this.assignments.values());
    if (classId) {
      return list.filter((a) => a.classId === classId);
    }
    return list;
  }

  public countAssignments(): number {
    return this.assignments.size;
  }

  // ==================== SEED DATA ====================

  private seedDefaultCurriculum(): void {
    const defaultLessons: TuklasLesson[] = [
      {
        id: 'lesson_alg_01',
        title: 'Evaluating Algebraic Expressions & Order of Operations',
        subject: 'Mathematics',
        gradeLevel: 'Grade 7',
        competencyCode: 'M7AL-IIa-1',
        summary: 'Learn how to substitute numerical values into algebraic expressions and evaluate them systematically using PEMDAS/BODMAS.',
        objectives: [
          'Identify terms, variables, coefficients, and constants in an algebraic expression.',
          'Evaluate algebraic expressions for given numerical values of variables.',
          'Apply order of operations accurately.',
        ],
        prerequisiteCompetencies: ['Fundamental Operations on Integers'],
        contentMarkdown: `# Evaluating Algebraic Expressions\n\nTo evaluate an algebraic expression:\n1. Replace every occurrence of the variable with its assigned numeric value inside parentheses.\n2. Simplify following PEMDAS:\n   - **P**: Parentheses\n   - **E**: Exponents\n   - **M/D**: Multiplication and Division (left-to-right)\n   - **A/S**: Addition and Subtraction (left-to-right)\n\n### Example:\nEvaluate $3x^2 - 4x + 5$ when $x = -2$.\n- Substitute: $3(-2)^2 - 4(-2) + 5$\n- Exponent: $3(4) - 4(-2) + 5$\n- Multiply: $12 - (-8) + 5 = 12 + 8 + 5 = 25$.`,
        estimatedMinutes: 30,
        tags: ['algebra', 'expressions', 'pemdas', 'deped-g7'],
        author: 'Tuklas Mathematics Content Team',
        createdAt: '2025-01-15T08:00:00.000Z',
      },
      {
        id: 'lesson_poly_02',
        title: 'Factoring Polynomials: Special Products & Difference of Two Squares',
        subject: 'Mathematics',
        gradeLevel: 'Grade 8',
        competencyCode: 'M8AL-Ia-b-1',
        summary: 'Master techniques for factoring polynomials completely, with emphasis on common monomial factors and the difference of two squares.',
        objectives: [
          'Factor completely polynomials with common monomial factors.',
          'Recognize and factor the difference of two squares: $a^2 - b^2 = (a-b)(a+b)$.',
          'Avoid common sign pitfalls in factoring trinomials.',
        ],
        prerequisiteCompetencies: ['M7AL-IIa-1', 'Multiplying Polynomials'],
        contentMarkdown: `# Factoring Polynomials\n\n### 1. Greatest Common Monomial Factor (GCMF)\nFind the GCD of numerical coefficients and the lowest power of shared variables.\n- $6x^3 + 9x^2 = 3x^2(2x + 3)$\n\n### 2. Difference of Two Squares\nFormula: $a^2 - b^2 = (a - b)(a + b)$\n- $49x^2 - 16 = (7x - 4)(7x + 4)$\n- Note: The sum of two squares $a^2 + b^2$ is prime over the real numbers!`,
        estimatedMinutes: 40,
        tags: ['algebra', 'factoring', 'polynomials', 'deped-g8'],
        author: 'Tuklas Mathematics Content Team',
        createdAt: '2025-01-20T08:00:00.000Z',
      },
      {
        id: 'lesson_quad_03',
        title: 'Quadratic Equations: Factoring, Discriminant & Nature of Roots',
        subject: 'Mathematics',
        gradeLevel: 'Grade 9',
        competencyCode: 'M9AL-Ia-b-1',
        summary: 'Comprehensive guide to solving quadratic equations, computing the discriminant, and analyzing root characteristics.',
        objectives: [
          'Express quadratic equations in standard form $ax^2 + bx + c = 0$.',
          'Solve quadratic equations by factoring, completing the square, and quadratic formula.',
          'Determine the nature of roots using the discriminant $\\Delta = b^2 - 4ac$.',
        ],
        prerequisiteCompetencies: ['M8AL-Ia-b-1', 'Radicals and Square Roots'],
        contentMarkdown: `# Quadratic Equations & Discriminant Analysis\n\nStandard Form: $ax^2 + bx + c = 0$ ($a \\neq 0$)\nQuadratic Formula: $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$\n\n### Nature of Roots by Discriminant $\\Delta = b^2 - 4ac$:\n- $\\Delta > 0$ and perfect square: Real, rational, and unequal\n- $\\Delta > 0$ not perfect square: Real, irrational, and unequal\n- $\\Delta = 0$: Real, rational, and equal (one repeated root)\n- $\\Delta < 0$: No real roots (two complex conjugate roots)`,
        estimatedMinutes: 45,
        tags: ['quadratic', 'roots', 'discriminant', 'deped-g9'],
        author: 'Tuklas Mathematics Content Team',
        createdAt: '2025-02-01T08:00:00.000Z',
      },
      {
        id: 'lesson_stats_04',
        title: 'Measures of Position: Quartiles, Deciles & Percentiles',
        subject: 'Mathematics',
        gradeLevel: 'Grade 10',
        competencyCode: 'M10SP-IVa-1',
        summary: 'Learn to compute and interpret quartiles ($Q_k$), deciles ($D_k$), and percentiles ($P_k$) for grouped and ungrouped datasets.',
        objectives: [
          'Distinguish between measures of central tendency and measures of position.',
          'Calculate $Q_1$, $Q_2$, and $Q_3$ for ungrouped datasets using linear interpolation.',
          'Interpret percentile rank in academic testing contexts.',
        ],
        prerequisiteCompetencies: ['Descriptive Statistics: Mean, Median, Mode'],
        contentMarkdown: `# Measures of Position\n\nMeasures of position divide a ranked dataset into equal parts:\n- **Quartiles ($Q_1, Q_2, Q_3$)**: Divide data into 4 equal quarters (25% each).\n- **Deciles ($D_1, \\dots, D_9$)**: Divide data into 10 equal parts (10% each).\n- **Percentiles ($P_1, \\dots, P_{99}$)**: Divide data into 100 equal parts (1% each).\n\n### Equivalence:\n$$Q_1 = P_{25}, \\quad Q_2 = \\text{Median} = D_5 = P_{50}, \\quad Q_3 = P_{75}$$`,
        estimatedMinutes: 35,
        tags: ['statistics', 'quartiles', 'percentiles', 'deped-g10'],
        author: 'Tuklas Mathematics Content Team',
        createdAt: '2025-02-10T08:00:00.000Z',
      },
      {
        id: 'lesson_sci_05',
        title: "Newton's Three Laws of Motion & Force Vectors",
        subject: 'Science',
        gradeLevel: 'Grade 8',
        competencyCode: 'S8FE-Ia-15',
        summary: "Investigate the relationship between force and motion through Newton's First (Inertia), Second (Acceleration), and Third (Action-Reaction) Laws.",
        objectives: [
          'State Newton\'s three laws of motion with physical examples.',
          'Calculate force, mass, and acceleration using $F_{\\text{net}} = ma$.',
          'Analyze free-body diagrams and action-reaction pairs.',
        ],
        prerequisiteCompetencies: ['Scalar and Vector Quantities', 'Speed and Velocity'],
        contentMarkdown: `# Newton's Three Laws of Motion\n\n1. **Law of Inertia**: A body remains at rest or in uniform velocity unless acted on by an external net force.\n2. **Law of Acceleration**: Acceleration is directly proportional to net force and inversely proportional to mass: $\\vec{F}_{\\text{net}} = m \\vec{a}$.\n3. **Law of Interaction**: For every action force, there is an equal in magnitude and opposite in direction reaction force: $\\vec{F}_{A \\to B} = -\\vec{F}_{B \\to A}$.`,
        estimatedMinutes: 40,
        tags: ['physics', 'forces', 'newton', 'science-g8'],
        author: 'Tuklas Science Content Team',
        createdAt: '2025-02-15T08:00:00.000Z',
      },
      {
        id: 'lesson_blept_06',
        title: 'College Algebra & Modern Mathematics BLEPT Board Licensure Review',
        subject: 'Mathematics',
        gradeLevel: 'College',
        competencyCode: 'LET-MATH-02',
        summary: 'Targeted licensure examination review covering polynomial systems, logarithmic equations, matrix determinants, and inequalities.',
        objectives: [
          'Solve systems of non-linear equations.',
          'Evaluate logarithmic and exponential functions without calculators.',
          'Master distractor elimination for BLEPT Board Licensure Examination items.',
        ],
        prerequisiteCompetencies: ['College Algebra', 'Pre-Calculus'],
        contentMarkdown: `# BLEPT College Algebra Licensure Competencies\n\nAligned with PRC Board of Professional Teachers TOS (20% Weight):\n- Logarithm product rule: $\\log_b(xy) = \\log_b(x) + \\log_b(y)$\n- Change of base formula: $\\log_b(a) = \\frac{\\ln(a)}{\\ln(b)}$\n- $2 \\times 2$ determinant: $\\det \\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix} = ad - bc$\n- Matrix inverse exists if and only if $\\det(A) \\neq 0$.`,
        estimatedMinutes: 50,
        tags: ['blept', 'let', 'licensure', 'college-math'],
        author: 'Dwight (JARVIS & Tuklas Lead)',
        createdAt: '2025-03-01T08:00:00.000Z',
      },
    ];

    for (const l of defaultLessons) {
      this.lessons.set(l.id, l);
    }
  }

  private seedDefaultStudents(): void {
    const students: StudentProgress[] = [
      {
        studentId: 'student_dwight',
        studentName: 'Dwight (Lead Learner)',
        enrolledGrade: 'College / Pre-Service Teacher',
        overallMasteryPercent: 94,
        streakDays: 14,
        completedLessonIds: ['lesson_alg_01', 'lesson_poly_02', 'lesson_quad_03', 'lesson_stats_04', 'lesson_blept_06'],
        competencyScores: {
          'M7AL-IIa-1': 98,
          'M8AL-Ia-b-1': 95,
          'M9AL-Ia-b-1': 92,
          'M10SP-IVa-1': 96,
          'LET-MATH-02': 94,
        },
        recentActivity: [
          {
            activityId: 'assess_blept_alg',
            type: 'assessment',
            title: 'BLEPT College Algebra Diagnostic',
            score: 100,
            timestamp: '2025-03-10T14:30:00.000Z',
          },
        ],
        lastActiveAt: '2025-03-10T14:30:00.000Z',
      },
      {
        studentId: 'student_maria',
        studentName: 'Maria Santos',
        enrolledGrade: 'Grade 9',
        overallMasteryPercent: 82,
        streakDays: 5,
        completedLessonIds: ['lesson_alg_01', 'lesson_poly_02'],
        competencyScores: {
          'M7AL-IIa-1': 90,
          'M8AL-Ia-b-1': 85,
          'M9AL-Ia-b-1': 72,
        },
        recentActivity: [
          {
            activityId: 'practice_g9_01',
            type: 'practice',
            title: 'Quadratic Equations Practice Set',
            score: 80,
            timestamp: '2025-03-09T10:15:00.000Z',
          },
        ],
        lastActiveAt: '2025-03-09T10:15:00.000Z',
      },
      {
        studentId: 'student_juan',
        studentName: 'Juan Dela Cruz',
        enrolledGrade: 'Grade 8',
        overallMasteryPercent: 68,
        streakDays: 2,
        completedLessonIds: ['lesson_alg_01'],
        competencyScores: {
          'M7AL-IIa-1': 75,
          'M8AL-Ia-b-1': 60,
        },
        recentActivity: [
          {
            activityId: 'lesson_poly_02',
            type: 'lesson',
            title: 'Factoring Polynomials Lesson Module',
            timestamp: '2025-03-08T16:00:00.000Z',
          },
        ],
        lastActiveAt: '2025-03-08T16:00:00.000Z',
      },
    ];

    for (const s of students) {
      this.students.set(s.studentId, s);
    }
  }

  private seedPracticeBank(): void {
    this.practiceBank = [
      {
        id: 'item_alg_01',
        competencyCode: 'M7AL-IIa-1',
        question: 'Evaluate the algebraic expression 4a² - 2b + 7 when a = 3 and b = -5.',
        options: ['A) 33', 'B) 43', 'C) 53', 'D) 23'],
        correctAnswer: 'C',
        difficulty: 'easy',
        hint: 'First compute a² = 3² = 9. Then multiply 4(9) = 36. Be careful with -2(-5) which equals +10.',
        explanation: 'Substitute: 4(3)² - 2(-5) + 7 = 4(9) + 10 + 7 = 36 + 10 + 7 = 53.',
      },
      {
        id: 'item_poly_02',
        competencyCode: 'M8AL-Ia-b-1',
        question: 'Factor completely: 25x² - 64y².',
        options: [
          'A) (5x - 8y)²',
          'B) (5x - 8y)(5x + 8y)',
          'C) (25x - 64y)(x + y)',
          'D) 5(x - 8y)(x + 8y)',
        ],
        correctAnswer: 'B',
        difficulty: 'medium',
        hint: 'This is a difference of two squares: a² - b² = (a - b)(a + b), where a = 5x and b = 8y.',
        explanation: 'Since 25x² = (5x)² and 64y² = (8y)², the factors are (5x - 8y)(5x + 8y).',
      },
      {
        id: 'item_poly_03',
        competencyCode: 'M8AL-Ia-b-1',
        question: 'What is the greatest common monomial factor of 18a³b² and 24a²b⁴?',
        options: ['A) 6ab', 'B) 6a²b²', 'C) 12a²b²', 'D) 72a³b⁴'],
        correctAnswer: 'B',
        difficulty: 'easy',
        hint: 'Find the GCD of 18 and 24 (which is 6), and take the lowest exponent for each variable.',
        explanation: 'GCD(18, 24) = 6. For a: min(3, 2) = 2. For b: min(2, 4) = 2. Thus GCMF = 6a²b².',
      },
      {
        id: 'item_quad_04',
        competencyCode: 'M9AL-Ia-b-1',
        question: 'What is the discriminant of the quadratic equation 2x² - 5x + 3 = 0, and what is the nature of its roots?',
        options: [
          'A) Δ = -1; No real roots',
          'B) Δ = 0; Real and equal',
          'C) Δ = 1; Real, rational, and unequal',
          'D) Δ = 49; Real, irrational, and unequal',
        ],
        correctAnswer: 'C',
        difficulty: 'medium',
        hint: 'Use the discriminant formula Δ = b² - 4ac with a = 2, b = -5, c = 3.',
        explanation: 'Δ = (-5)² - 4(2)(3) = 25 - 24 = 1. Since Δ > 0 and 1 is a perfect square, roots are real, rational, and unequal.',
      },
      {
        id: 'item_stats_05',
        competencyCode: 'M10SP-IVa-1',
        question: 'In a class of 40 students, Juan scored at the 85th percentile. What does this indicate?',
        options: [
          'A) Juan answered 85% of test items correctly.',
          'B) Juan scored higher than or equal to 85% of his classmates.',
          'C) Juan needs 15 more points to achieve a perfect score.',
          'D) 85 students scored lower than Juan.',
        ],
        correctAnswer: 'B',
        difficulty: 'easy',
        hint: 'Percentile rank reflects relative standing within a group, not raw percentage accuracy.',
        explanation: 'The 85th percentile (P85) means that 85% of the examinees scored at or below Juan\'s score.',
      },
      {
        id: 'item_blept_06',
        competencyCode: 'LET-MATH-02',
        question: 'Solve for x: log₂(x) + log₂(x - 2) = 3.',
        options: ['A) x = 4', 'B) x = -2', 'C) x = 4 or x = -2', 'D) x = 8'],
        correctAnswer: 'A',
        difficulty: 'hard',
        hint: 'Use the log product rule: log₂(x(x - 2)) = 3. Convert to exponential form: x(x - 2) = 2³ = 8. Discard extraneous roots where log is undefined.',
        explanation: 'x² - 2x = 8 => x² - 2x - 8 = 0 => (x - 4)(x + 2) = 0. Since log must have positive arguments, x = -2 is extraneous. Thus x = 4 is the unique solution.',
      },
    ];
  }

  private seedAssessments(): void {
    this.assessments.set('assess_math_g8', {
      id: 'assess_math_g8',
      title: 'Grade 8 Mathematics Unit Diagnostic on Factoring',
      passingScore: 75,
      items: [
        this.practiceBank[0],
        this.practiceBank[1],
        this.practiceBank[2],
      ],
    });

    this.assessments.set('assess_blept_alg', {
      id: 'assess_blept_alg',
      title: 'BLEPT College Algebra Diagnostic Exam',
      passingScore: 75,
      items: [
        this.practiceBank[1],
        this.practiceBank[3],
        this.practiceBank[4],
        this.practiceBank[5],
      ],
    });
  }

  private seedTeacherAssignments(): void {
    const defaultAssignment: TeacherAssignment = {
      id: 'asgn_quad_g9_01',
      classId: 'class_section_euler',
      title: 'Quadratic Discriminant & Problem Set 1',
      lessonId: 'lesson_quad_03',
      competencyCode: 'M9AL-Ia-b-1',
      assignedBy: 'teacher_dwight',
      dueDate: '2025-03-25T23:59:59.000Z',
      status: 'active',
      instructions: 'Complete lesson module reading and practice all 5 quadratic root discriminant items.',
      createdAt: '2025-03-10T08:00:00.000Z',
    };

    this.assignments.set(defaultAssignment.id, defaultAssignment);
  }
}
