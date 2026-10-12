/**
 * JARVIS Phase 7 - LET (Licensure Examination for Teachers) Mathematics Majorship Engine
 * Aligned with the Philippine Professional Regulation Commission (PRC) Board Licensure
 * Examination for Professional Teachers (BLEPT) Mathematics Specialization Table of Specifications (TOS).
 */

import { LetCompetency, MathProblem } from '../math.interface.js';

export interface LetExamResult {
  score: number;
  total: number;
  percentage: number;
  passed: boolean; // >= 75.0%
  competencyBreakdown: Record<
    string,
    { title: string; score: number; total: number; percentage: number; passed: boolean }
  >;
  questionEvaluations: {
    questionId: string;
    question: string;
    selectedKey?: string;
    correctKey: string;
    isCorrect: boolean;
    explanation: string;
    selectedDistractorRationale?: string;
  }[];
}

export class LetReviewEngine {
  private readonly competencies: LetCompetency[] = [
    {
      code: 'LET-MATH-01',
      domain: 'number_systems',
      title: 'Arithmetic, Number Theory & Real Number Systems',
      weightPercent: 15,
      description:
        'Divisibility rules, primes, Euclidean algorithm, modular arithmetic, fundamental theorem of arithmetic, and rational/irrational properties.',
    },
    {
      code: 'LET-MATH-02',
      domain: 'algebra',
      title: 'College Algebra, Advanced Algebra & Linear Systems',
      weightPercent: 20,
      description:
        'Polynomial functions, roots and discriminant, systems of linear equations, matrices and determinants, inequalities, and progressions.',
    },
    {
      code: 'LET-MATH-03',
      domain: 'geometry',
      title: 'Plane & Solid Geometry and Trigonometry',
      weightPercent: 20,
      description:
        'Euclidean theorems, polygons, circles, solid volume and surface areas, trigonometric identities, and Law of Sines/Cosines.',
    },
    {
      code: 'LET-MATH-04',
      domain: 'differential_calculus',
      title: 'Calculus & Differential Equations',
      weightPercent: 20,
      description:
        'Limits, continuity, derivatives, applications of extrema, definite/indefinite integrals, FTC, and separable ODEs.',
    },
    {
      code: 'LET-MATH-05',
      domain: 'statistics',
      title: 'Probability and Statistics',
      weightPercent: 15,
      description:
        'Measures of central tendency, dispersion, normal distribution, combinatorics (P and C), and elementary probability models.',
    },
    {
      code: 'LET-MATH-06',
      domain: 'logic',
      title: 'Modern Mathematics, Logic, and Set Theory',
      weightPercent: 10,
      description:
        'Propositional calculus, truth tables, valid arguments, set theory operations, and algebraic structures.',
    },
  ];

  private readonly questionBank: (MathProblem & { competencyCode: string })[] = [
    // --- LET-MATH-01: Number Theory ---
    {
      id: 'LET-Q01',
      competencyCode: 'LET-MATH-01',
      domain: 'number_systems',
      topic: 'Modular Arithmetic & Divisibility',
      difficulty: 'let_majorship',
      question: 'What is the remainder when 3^202 is divided by 5?',
      options: [
        { key: 'A', text: '1' },
        { key: 'B', text: '2' },
        { key: 'C', text: '4' },
        { key: 'D', text: '3' },
      ],
      correctOptionKey: 'C',
      correctAnswer: '4',
      explanation:
        'By Fermat\'s Little Theorem, since 5 is prime and gcd(3, 5) = 1, 3^4 ≡ 1 (mod 5). 202 = 4 * 50 + 2. Thus 3^202 = (3^4)^50 * 3^2 ≡ 1^50 * 9 ≡ 4 (mod 5).',
      distractorExplanations: {
        A: 'Erroneously assumed 202 is divisible by 4, concluding 3^4k ≡ 1.',
        B: 'Confused remainder with exponent modulo (202 mod 4 = 2).',
        D: 'Incorrectly took the base 3 as the remainder.',
      },
      prerequisites: ['Modular arithmetic', "Fermat's Little Theorem", 'Divisibility rules'],
      steps: [
        {
          stepNumber: 1,
          title: "Apply Fermat's Little Theorem",
          expression: 'a^(p-1) ≡ 1 (mod p) => 3^4 ≡ 1 (mod 5)',
          explanation: 'Since 5 is prime, powers cycle modulo 4.',
        },
        {
          stepNumber: 2,
          title: 'Reduce Exponent Modulo 4',
          expression: '202 = 4(50) + 2 => 202 ≡ 2 (mod 4)',
          explanation: 'Divide power by cycle length.',
        },
        {
          stepNumber: 3,
          title: 'Compute Remainder',
          expression: '3^202 ≡ 3^2 = 9 ≡ 4 (mod 5)',
          explanation: '9 divided by 5 yields remainder 4.',
        },
      ],
    },
    {
      id: 'LET-Q02',
      competencyCode: 'LET-MATH-01',
      domain: 'arithmetic',
      topic: 'Greatest Common Divisor & LCM',
      difficulty: 'let_majorship',
      question: 'If the GCD of two positive integers is 12 and their LCM is 240, and one of the numbers is 48, what is the other number?',
      options: [
        { key: 'A', text: '60' },
        { key: 'B', text: '36' },
        { key: 'C', text: '72' },
        { key: 'D', text: '80' },
      ],
      correctOptionKey: 'A',
      correctAnswer: '60',
      explanation:
        'For any two positive integers a and b, a * b = gcd(a, b) * lcm(a, b). Here 48 * b = 12 * 240 => 48 * b = 2880 => b = 2880 / 48 = 60.',
      distractorExplanations: {
        B: 'Multiplied GCD by 3 without accounting for LCM.',
        C: 'Subtracted 48 from 120.',
        D: 'Divided 240 by 3.',
      },
      prerequisites: ['GCD and LCM relationship: a*b = gcd*lcm'],
      steps: [
        {
          stepNumber: 1,
          title: 'Identity Formula',
          expression: 'a * b = gcd(a, b) * lcm(a, b)',
          explanation: 'The product of two numbers equals the product of their GCD and LCM.',
        },
        {
          stepNumber: 2,
          title: 'Substitute Values',
          expression: '48 * b = 12 * 240 = 2880 => b = 60',
          explanation: 'Divide 2880 by 48 to find b = 60.',
        },
      ],
    },
    {
      id: 'LET-Q03',
      competencyCode: 'LET-MATH-01',
      domain: 'number_systems',
      topic: 'Base Conversion',
      difficulty: 'let_majorship',
      question: 'Convert the octal number 57_8 into hexadecimal.',
      options: [
        { key: 'A', text: '2F' },
        { key: 'B', text: '3B' },
        { key: 'C', text: '47' },
        { key: 'D', text: '2E' },
      ],
      correctOptionKey: 'A',
      correctAnswer: '2F',
      explanation:
        'Octal 57_8 in decimal is 5*8 + 7 = 47_10. In binary: 5_8 = 101_2, 7_8 = 111_2 => 101111_2. Regrouping in 4 bits: 0010 1111_2 = 2F_16.',
      distractorExplanations: {
        B: 'Converted with 1 bit shift error.',
        C: 'Kept decimal value 47 without radix conversion.',
        D: 'Miscalculated 15 as E instead of F.',
      },
      prerequisites: ['Positional number systems', 'Radix conversion'],
      steps: [
        {
          stepNumber: 1,
          title: 'Convert Octal to Binary',
          expression: '57_8 = (101)(111)_2 = 101111_2',
          explanation: 'Convert each octal digit to 3-bit binary equivalent.',
        },
        {
          stepNumber: 2,
          title: 'Group into 4 bits for Hexadecimal',
          expression: '0010 1111_2 = 2 F_16 = 2F',
          explanation: '0010_2 = 2, 1111_2 = 15 = F.',
        },
      ],
    },

    // --- LET-MATH-02: Algebra ---
    {
      id: 'LET-Q04',
      competencyCode: 'LET-MATH-02',
      domain: 'algebra',
      topic: 'Quadratic Equations & Roots Nature',
      difficulty: 'let_majorship',
      question: 'For what values of k does the quadratic equation x^2 - 6x + k = 0 have two distinct real roots?',
      options: [
        { key: 'A', text: 'k < 9' },
        { key: 'B', text: 'k > 9' },
        { key: 'C', text: 'k ≤ 9' },
        { key: 'D', text: 'k = 9' },
      ],
      correctOptionKey: 'A',
      correctAnswer: 'k < 9',
      explanation:
        'For two distinct real roots, the discriminant Δ = b^2 - 4ac > 0. Here (-6)^2 - 4(1)(k) > 0 => 36 - 4k > 0 => 36 > 4k => k < 9.',
      distractorExplanations: {
        B: 'Inverted the inequality sign when dividing by negative, or set Δ < 0.',
        C: 'Included equality which produces equal (repeated) roots rather than distinct roots.',
        D: 'Condition for a single repeated root (tangent to x-axis).',
      },
      prerequisites: ['Discriminant', 'Quadratic nature of roots'],
      steps: [
        {
          stepNumber: 1,
          title: 'Discriminant Condition',
          expression: 'Δ = b^2 - 4ac > 0',
          explanation: 'Strict inequality required for distinct roots.',
        },
        {
          stepNumber: 2,
          title: 'Solve Inequality',
          expression: '(-6)^2 - 4(1)(k) = 36 - 4k > 0 => 4k < 36 => k < 9',
          explanation: 'Isolate k to obtain k < 9.',
        },
      ],
    },
    {
      id: 'LET-Q05',
      competencyCode: 'LET-MATH-02',
      domain: 'advanced_algebra',
      topic: 'Arithmetic and Geometric Progressions',
      difficulty: 'let_majorship',
      question: 'The sum of an infinite geometric series with first term a = 12 and common ratio r (|r| < 1) is 36. What is r?',
      options: [
        { key: 'A', text: '1/3' },
        { key: 'B', text: '2/3' },
        { key: 'C', text: '1/2' },
        { key: 'D', text: '3/4' },
      ],
      correctOptionKey: 'B',
      correctAnswer: '2/3',
      explanation:
        'Formula for sum of infinite geometric series is S = a / (1 - r). 36 = 12 / (1 - r) => 1 - r = 12/36 = 1/3 => r = 1 - 1/3 = 2/3.',
      distractorExplanations: {
        A: 'Computed 1 - r = 1/3 and mistook 1 - r for r.',
        C: 'Guessed 1/2.',
        D: 'Subtracted 12/36 from 1 without reducing properly.',
      },
      prerequisites: ['Infinite geometric series', 'Common ratio convergence'],
      steps: [
        {
          stepNumber: 1,
          title: 'Infinite Geometric Series Formula',
          expression: 'S = a / (1 - r)',
          explanation: 'Valid when |r| < 1.',
        },
        {
          stepNumber: 2,
          title: 'Solve for r',
          expression: '36 = 12 / (1 - r) => 1 - r = 1/3 => r = 2/3',
          explanation: 'Subtract 1/3 from 1 to find r = 2/3.',
        },
      ],
    },
    {
      id: 'LET-Q06',
      competencyCode: 'LET-MATH-02',
      domain: 'algebra',
      topic: 'Systems of Linear Equations',
      difficulty: 'let_majorship',
      question: 'Solve for x in the system: 3x + 2y = 16 and 5x - 2y = 16.',
      options: [
        { key: 'A', text: 'x = 4' },
        { key: 'B', text: 'x = 2' },
        { key: 'C', text: 'x = 5' },
        { key: 'D', text: 'x = 8' },
      ],
      correctOptionKey: 'A',
      correctAnswer: 'x = 4',
      explanation:
        'Add the two equations: (3x + 2y) + (5x - 2y) = 16 + 16 => 8x = 32 => x = 4. (Then y = 2).',
      distractorExplanations: {
        B: 'Substituted x for y (y is 2).',
        C: 'Arithmetic error in addition.',
        D: 'Divided 32 by 4 instead of 8.',
      },
      prerequisites: ['Elimination method', 'Systems of linear equations'],
      steps: [
        {
          stepNumber: 1,
          title: 'Elimination by Addition',
          expression: '(3x + 2y) + (5x - 2y) = 8x = 16 + 16 = 32',
          explanation: 'The y terms cancel out since +2y + (-2y) = 0.',
        },
        {
          stepNumber: 2,
          title: 'Solve for x',
          expression: '8x = 32 => x = 4',
          explanation: 'Divide both sides by 8.',
        },
      ],
    },

    // --- LET-MATH-03: Geometry & Trigonometry ---
    {
      id: 'LET-Q07',
      competencyCode: 'LET-MATH-03',
      domain: 'geometry',
      topic: 'Polygon Angles',
      difficulty: 'let_majorship',
      question: 'What is the measure of each interior angle of a regular decagon (10-sided polygon)?',
      options: [
        { key: 'A', text: '144°' },
        { key: 'B', text: '135°' },
        { key: 'C', text: '150°' },
        { key: 'D', text: '120°' },
      ],
      correctOptionKey: 'A',
      correctAnswer: '144°',
      explanation:
        'Interior angle sum = (n - 2) * 180° = (10 - 2) * 180° = 8 * 180° = 1440°. Each interior angle = 1440° / 10 = 144°. Alternatively, exterior angle = 360° / 10 = 36°, interior = 180° - 36° = 144°.',
      distractorExplanations: {
        B: 'Interior angle of a regular octagon (n=8).',
        C: 'Interior angle of a regular dodecagon (n=12).',
        D: 'Interior angle of a regular hexagon (n=6).',
      },
      prerequisites: ['Regular polygon interior/exterior angle formulas'],
      steps: [
        {
          stepNumber: 1,
          title: 'Exterior Angle Shortcut',
          expression: 'Ext = 360° / n = 360° / 10 = 36°',
          explanation: 'Regular polygon exterior angles sum to 360°.',
        },
        {
          stepNumber: 2,
          title: 'Supplementary Interior Angle',
          expression: 'Int = 180° - 36° = 144°',
          explanation: 'Interior and exterior angles form a linear pair.',
        },
      ],
    },
    {
      id: 'LET-Q08',
      competencyCode: 'LET-MATH-03',
      domain: 'solid_geometry',
      topic: 'Cylinder and Sphere Volumes',
      difficulty: 'let_majorship',
      question: 'A sphere is inscribed inside a right circular cylinder of radius r and height 2r. What is the ratio of the volume of the sphere to the volume of the cylinder?',
      options: [
        { key: 'A', text: '2:3' },
        { key: 'B', text: '1:2' },
        { key: 'C', text: '3:4' },
        { key: 'D', text: '1:3' },
      ],
      correctOptionKey: 'A',
      correctAnswer: '2:3',
      explanation:
        'Volume of sphere = (4/3)πr^3. Volume of cylinder = πr^2h = πr^2(2r) = 2πr^3. Ratio = [(4/3)πr^3] / [2πr^3] = (4/3) / 2 = 2/3 (Archimedes\' celebrated theorem).',
      distractorExplanations: {
        B: 'Guessed 1:2.',
        C: 'Inverted 4/3 ratio.',
        D: 'Confused with cone to cylinder ratio (1:3).',
      },
      prerequisites: ['Solid geometry volume formulas', "Archimedes' sphere-in-cylinder theorem"],
      steps: [
        {
          stepNumber: 1,
          title: 'Sphere Volume',
          expression: 'V_sphere = (4/3)πr^3',
          explanation: 'Standard sphere volume.',
        },
        {
          stepNumber: 2,
          title: 'Cylinder Volume',
          expression: 'V_cyl = πr^2(2r) = 2πr^3',
          explanation: 'Cylinder height equals sphere diameter 2r.',
        },
        {
          stepNumber: 3,
          title: 'Ratio Comparison',
          expression: '(4/3)πr^3 / (2πr^3) = 4/6 = 2/3',
          explanation: 'Archimedes carved this 2:3 ratio onto his tombstone.',
        },
      ],
    },
    {
      id: 'LET-Q09',
      competencyCode: 'LET-MATH-03',
      domain: 'trigonometry',
      topic: 'Trigonometric Identities',
      difficulty: 'let_majorship',
      question: 'Simplify the trigonometric expression: (sin²θ + cos²θ) / (1 + tan²θ).',
      options: [
        { key: 'A', text: 'cos²θ' },
        { key: 'B', text: 'sin²θ' },
        { key: 'C', text: 'sec²θ' },
        { key: 'D', text: '1' },
      ],
      correctOptionKey: 'A',
      correctAnswer: 'cos²θ',
      explanation:
        'Numerator: sin²θ + cos²θ = 1. Denominator: 1 + tan²θ = sec²θ. Thus 1 / sec²θ = cos²θ.',
      distractorExplanations: {
        B: 'Confused cosine with sine.',
        C: 'Forgot that sec²θ is in the denominator.',
        D: 'Assumed numerator and denominator cancel out to 1.',
      },
      prerequisites: ['Pythagorean trigonometric identities'],
      steps: [
        {
          stepNumber: 1,
          title: 'Pythagorean Identities',
          expression: 'sin²θ + cos²θ = 1,  1 + tan²θ = sec²θ',
          explanation: 'Apply fundamental identities.',
        },
        {
          stepNumber: 2,
          title: 'Reciprocal Simplification',
          expression: '1 / sec²θ = cos²θ',
          explanation: 'Reciprocal of secant squared is cosine squared.',
        },
      ],
    },

    // --- LET-MATH-04: Calculus & Differential Equations ---
    {
      id: 'LET-Q10',
      competencyCode: 'LET-MATH-04',
      domain: 'differential_calculus',
      topic: 'Derivative and Tangent Slope',
      difficulty: 'let_majorship',
      question: 'Find the slope of the tangent line to the curve y = 2x^3 - 5x + 4 at x = 2.',
      options: [
        { key: 'A', text: '19' },
        { key: 'B', text: '15' },
        { key: 'C', text: '10' },
        { key: 'D', text: '24' },
      ],
      correctOptionKey: 'A',
      correctAnswer: '19',
      explanation:
        'dy/dx = d/dx [2x^3 - 5x + 4] = 6x^2 - 5. At x = 2: dy/dx = 6(2^2) - 5 = 6(4) - 5 = 24 - 5 = 19.',
      distractorExplanations: {
        B: 'Substituted x into the original function y(2) = 16 - 10 + 4 = 10, then added 5.',
        C: 'Evaluated y(2) instead of y\'(2).',
        D: 'Forgot to subtract 5 (6*4 = 24).',
      },
      prerequisites: ['Power rule', 'Tangent line slope definition'],
      steps: [
        {
          stepNumber: 1,
          title: 'Differentiate with Power Rule',
          expression: "y' = 6x^2 - 5",
          explanation: 'Derivative of 2x^3 is 6x^2, of -5x is -5.',
        },
        {
          stepNumber: 2,
          title: 'Evaluate at x = 2',
          expression: "y'(2) = 6(4) - 5 = 24 - 5 = 19",
          explanation: 'Instantaneous rate of change is 19.',
        },
      ],
    },
    {
      id: 'LET-Q11',
      competencyCode: 'LET-MATH-04',
      domain: 'integral_calculus',
      topic: 'Definite Integral & Area',
      difficulty: 'let_majorship',
      question: 'Evaluate the definite integral ∫_0^3 (3x^2 - 2x + 1) dx.',
      options: [
        { key: 'A', text: '21' },
        { key: 'B', text: '27' },
        { key: 'C', text: '18' },
        { key: 'D', text: '24' },
      ],
      correctOptionKey: 'A',
      correctAnswer: '21',
      explanation:
        'Antiderivative F(x) = x^3 - x^2 + x. Evaluating F(3) - F(0): F(3) = 3^3 - 3^2 + 3 = 27 - 9 + 3 = 21. F(0) = 0. Result = 21.',
      distractorExplanations: {
        B: 'Computed only 3^3 = 27 without subtracting and adding remaining terms.',
        C: 'Computed 27 - 9 = 18 and forgot the integral of 1.',
        D: 'Arithmetic addition error.',
      },
      prerequisites: ['Fundamental Theorem of Calculus', 'Polynomial integration'],
      steps: [
        {
          stepNumber: 1,
          title: 'Find Antiderivative F(x)',
          expression: '∫ (3x^2 - 2x + 1) dx = x^3 - x^2 + x',
          explanation: 'Reverse power rule applied term by term.',
        },
        {
          stepNumber: 2,
          title: 'Apply FTC Bounds [0, 3]',
          expression: 'F(3) - F(0) = (27 - 9 + 3) - 0 = 21',
          explanation: 'Subtract lower bound from upper bound.',
        },
      ],
    },
    {
      id: 'LET-Q12',
      competencyCode: 'LET-MATH-04',
      domain: 'differential_equations',
      topic: 'Separable Differential Equations',
      difficulty: 'let_majorship',
      question: 'Solve the initial value problem dy/dx = 3y with y(0) = 5.',
      options: [
        { key: 'A', text: 'y = 5e^(3x)' },
        { key: 'B', text: 'y = 3e^(5x)' },
        { key: 'C', text: 'y = 5 + e^(3x)' },
        { key: 'D', text: 'y = 15e^x' },
      ],
      correctOptionKey: 'A',
      correctAnswer: 'y = 5e^(3x)',
      explanation:
        'Separable ODE: (1/y) dy = 3 dx => ln|y| = 3x + C => y = Ae^(3x). Using y(0) = 5 gives A = 5 => y = 5e^(3x).',
      distractorExplanations: {
        B: 'Swapped initial condition 5 with growth coefficient 3.',
        C: 'Added initial constant additively instead of multiplicatively.',
        D: 'Multiplied initial constant by rate in the coefficient.',
      },
      prerequisites: ['Separation of variables', 'Exponential growth model'],
      steps: [
        {
          stepNumber: 1,
          title: 'General Solution Form',
          expression: 'y(x) = C * e^(kx) => y(x) = C * e^(3x)',
          explanation: 'Standard exponential growth model.',
        },
        {
          stepNumber: 2,
          title: 'Substitute Initial Condition',
          expression: 'y(0) = 5 = C * e^0 = C => C = 5',
          explanation: 'Since e^0 = 1, C = 5.',
        },
      ],
    },

    // --- LET-MATH-05: Probability & Statistics ---
    {
      id: 'LET-Q13',
      competencyCode: 'LET-MATH-05',
      domain: 'statistics',
      topic: 'Combinations & Permutations',
      difficulty: 'let_majorship',
      question: 'A committee of 4 teachers is to be chosen from a department of 10 teachers. How many different committees can be formed?',
      options: [
        { key: 'A', text: '210' },
        { key: 'B', text: '5040' },
        { key: 'C', text: '120' },
        { key: 'D', text: '24' },
      ],
      correctOptionKey: 'A',
      correctAnswer: '210',
      explanation:
        'Order does not matter in a committee, so this is a combination C(10, 4) = 10! / (4! * 6!) = (10 * 9 * 8 * 7) / (4 * 3 * 2 * 1) = 5040 / 24 = 210.',
      distractorExplanations: {
        B: 'Calculated permutation P(10, 4) = 5040 (mistakenly assuming order of roles matters).',
        C: 'Computed C(10, 3) = 120.',
        D: 'Computed only 4! = 24.',
      },
      prerequisites: ['Combination formula: C(n, r) = n! / (r!(n-r)!)'],
      steps: [
        {
          stepNumber: 1,
          title: 'Identify Combinatorial Model',
          expression: 'C(10, 4) = (10 * 9 * 8 * 7) / (4 * 3 * 2 * 1)',
          explanation: 'Committees do not possess ranked positions; order is irrelevant.',
        },
        {
          stepNumber: 2,
          title: 'Evaluate',
          expression: '5040 / 24 = 210',
          explanation: 'Total distinct committees = 210.',
        },
      ],
    },
    {
      id: 'LET-Q14',
      competencyCode: 'LET-MATH-05',
      domain: 'statistics',
      topic: 'Probability of Independent & Mutually Exclusive Events',
      difficulty: 'let_majorship',
      question: 'Two fair 6-sided dice are rolled simultaneously. What is the probability that the sum of the numbers showing is 7?',
      options: [
        { key: 'A', text: '1/6' },
        { key: 'B', text: '1/12' },
        { key: 'C', text: '7/36' },
        { key: 'D', text: '5/36' },
      ],
      correctOptionKey: 'A',
      correctAnswer: '1/6',
      explanation:
        'Sample space |S| = 6 * 6 = 36. Outcomes summing to 7: (1,6), (2,5), (3,4), (4,3), (5,2), (6,1) => 6 outcomes. P = 6/36 = 1/6.',
      distractorExplanations: {
        B: 'Assumed only 3 pairs exist, disregarding ordering.',
        C: 'Confused sum with numerator (7/36).',
        D: 'Probability of getting a sum of 6 or 8 (5/36).',
      },
      prerequisites: ['Classical probability: P = n(E) / n(S)'],
      steps: [
        {
          stepNumber: 1,
          title: 'Enumerate Favorable Outcomes',
          expression: 'E = {(1,6), (2,5), (3,4), (4,3), (5,2), (6,1)} => n(E) = 6',
          explanation: 'Six distinct ordered pairs produce sum 7.',
        },
        {
          stepNumber: 2,
          title: 'Compute Probability',
          expression: 'P = 6 / 36 = 1 / 6 ≈ 16.67%',
          explanation: 'Reduce fraction to lowest terms.',
        },
      ],
    },
    {
      id: 'LET-Q15',
      competencyCode: 'LET-MATH-05',
      domain: 'statistics',
      topic: 'Standard Deviation & Variance',
      difficulty: 'let_majorship',
      question: 'If every score in a mathematics test dataset is multiplied by 3, how does the standard deviation change?',
      options: [
        { key: 'A', text: 'It is multiplied by 3' },
        { key: 'B', text: 'It is multiplied by 9' },
        { key: 'C', text: 'It remains unchanged' },
        { key: 'D', text: 'It increases by 3' },
      ],
      correctOptionKey: 'A',
      correctAnswer: 'It is multiplied by 3',
      explanation:
        'Multiplying all observations by a constant c scales variance by c^2 and standard deviation by |c|. Thus SD becomes 3 * SD.',
      distractorExplanations: {
        B: 'Confused standard deviation with variance (variance is multiplied by 3^2 = 9).',
        C: 'Confused scaling with shifting (adding a constant leaves SD unchanged).',
        D: 'Additive shift confusion.',
      },
      prerequisites: ['Properties of linear transformations on mean and standard deviation'],
      steps: [
        {
          stepNumber: 1,
          title: 'Scaling Property of Variance',
          expression: 'Var(cX) = c^2 * Var(X)',
          explanation: 'Variance scales quadratically.',
        },
        {
          stepNumber: 2,
          title: 'Scaling Property of Standard Deviation',
          expression: 'SD(cX) = |c| * SD(X) = 3 * SD(X)',
          explanation: 'Square root of c^2 restores linear factor 3.',
        },
      ],
    },

    // --- LET-MATH-06: Logic & Sets ---
    {
      id: 'LET-Q16',
      competencyCode: 'LET-MATH-06',
      domain: 'logic',
      topic: 'Propositional Logic & Equivalence',
      difficulty: 'let_majorship',
      question: 'Which of the following is logically equivalent to the conditional statement "If p, then q" (p → q)?',
      options: [
        { key: 'A', text: '¬q → ¬p' },
        { key: 'B', text: 'q → p' },
        { key: 'C', text: '¬p → ¬q' },
        { key: 'D', text: 'p ∧ ¬q' },
      ],
      correctOptionKey: 'A',
      correctAnswer: '¬q → ¬p',
      explanation:
        'A conditional statement p → q is always logically equivalent to its contrapositive ¬q → ¬p. The converse (q → p) and inverse (¬p → ¬q) are not equivalent.',
      distractorExplanations: {
        B: 'Converse of the statement, which is not logically equivalent.',
        C: 'Inverse of the statement, which is not logically equivalent.',
        D: 'The negation of the statement, which has the opposite truth value.',
      },
      prerequisites: ['Contrapositive', 'Truth table equivalence'],
      steps: [
        {
          stepNumber: 1,
          title: 'Law of Contraposition',
          expression: '(p → q) ≡ (¬q → ¬p)',
          explanation: 'Reversing and negating hypothesis and conclusion preserves truth table values.',
        },
      ],
    },
    {
      id: 'LET-Q17',
      competencyCode: 'LET-MATH-06',
      domain: 'sets',
      topic: 'Inclusion-Exclusion Principle',
      difficulty: 'let_majorship',
      question: 'In a class of 50 students, 30 like Algebra, 25 like Geometry, and 12 like both. How many students like neither?',
      options: [
        { key: 'A', text: '7' },
        { key: 'B', text: '5' },
        { key: 'C', text: '10' },
        { key: 'D', text: '12' },
      ],
      correctOptionKey: 'A',
      correctAnswer: '7',
      explanation:
        '|A ∪ G| = |A| + |G| - |A ∩ G| = 30 + 25 - 12 = 43. Students who like neither = Total - |A ∪ G| = 50 - 43 = 7.',
      distractorExplanations: {
        B: 'Arithmetic subtraction slip.',
        C: 'Subtracted 40 from 50 without using intersection.',
        D: 'Selected the number of students who like both (12).',
      },
      prerequisites: ['Principle of Inclusion-Exclusion: |A ∪ B| = |A| + |B| - |A ∩ B|'],
      steps: [
        {
          stepNumber: 1,
          title: 'Inclusion-Exclusion Union',
          expression: '|A ∪ G| = 30 + 25 - 12 = 43',
          explanation: 'Sum of individual sets minus intersection.',
        },
        {
          stepNumber: 2,
          title: 'Complement of Union',
          expression: 'Neither = Total - |A ∪ G| = 50 - 43 = 7',
          explanation: '7 students like neither course.',
        },
      ],
    },
    {
      id: 'LET-Q18',
      competencyCode: 'LET-MATH-06',
      domain: 'sets',
      topic: 'Power Sets',
      difficulty: 'let_majorship',
      question: 'If set S has 5 elements, how many non-empty proper subsets does set S have?',
      options: [
        { key: 'A', text: '30' },
        { key: 'B', text: '32' },
        { key: 'C', text: '31' },
        { key: 'D', text: '25' },
      ],
      correctOptionKey: 'A',
      correctAnswer: '30',
      explanation:
        'Total subsets = 2^n = 2^5 = 32. Proper subsets exclude the set itself (-1), and non-empty subsets exclude the empty set (-1). Thus 32 - 2 = 30.',
      distractorExplanations: {
        B: 'Computed total subsets 2^5 = 32 without excluding empty set or set itself.',
        C: 'Excluded only the set itself (31 proper subsets) but forgot to exclude the empty set.',
        D: 'Computed 5^2 = 25.',
      },
      prerequisites: ['Power set cardinality: 2^n', 'Proper and non-empty subset definitions'],
      steps: [
        {
          stepNumber: 1,
          title: 'Total Subsets',
          expression: '|P(S)| = 2^n = 2^5 = 32',
          explanation: 'Number of elements in power set.',
        },
        {
          stepNumber: 2,
          title: 'Subtract Boundary Subsets',
          expression: '32 - 1 (empty set) - 1 (set S itself) = 30',
          explanation: 'Non-empty proper subsets count is 30.',
        },
      ],
    },
    {
      id: 'LET-Q19',
      competencyCode: 'LET-MATH-02',
      domain: 'algebra',
      topic: 'Remainder Theorem & Synthetic Division',
      difficulty: 'let_majorship',
      question: 'What is the remainder when P(x) = 2x^3 - 3x^2 + 4x - 5 is divided by (x - 2)?',
      options: [
        { key: 'A', text: '7' },
        { key: 'B', text: '3' },
        { key: 'C', text: '11' },
        { key: 'D', text: '-5' },
      ],
      correctOptionKey: 'A',
      correctAnswer: '7',
      explanation:
        'By the Remainder Theorem, the remainder when P(x) is divided by (x - c) is P(c). Here c = 2. P(2) = 2(2^3) - 3(2^2) + 4(2) - 5 = 2(8) - 3(4) + 8 - 5 = 16 - 12 + 8 - 5 = 7.',
      distractorExplanations: {
        B: 'Substituted x = -2 instead of x = 2.',
        C: 'Arithmetic slip in addition.',
        D: 'Selected constant term -5.',
      },
      prerequisites: ['Remainder Theorem: R = P(c)'],
      steps: [
        {
          stepNumber: 1,
          title: 'Apply Remainder Theorem',
          expression: 'R = P(2)',
          explanation: 'Remainder equals polynomial evaluated at root of linear divisor.',
        },
        {
          stepNumber: 2,
          title: 'Evaluate P(2)',
          expression: '2(8) - 3(4) + 4(2) - 5 = 16 - 12 + 8 - 5 = 7',
          explanation: 'Remainder is 7.',
        },
      ],
    },
    {
      id: 'LET-Q20',
      competencyCode: 'LET-MATH-03',
      domain: 'trigonometry',
      topic: 'Trigonometric Exact Values',
      difficulty: 'let_majorship',
      question: 'What is the exact value of sin(75°)?',
      options: [
        { key: 'A', text: '(√6 + √2) / 4' },
        { key: 'B', text: '(√6 - √2) / 4' },
        { key: 'C', text: '(√3 + 1) / 2' },
        { key: 'D', text: '√3 / 2' },
      ],
      correctOptionKey: 'A',
      correctAnswer: '(√6 + √2) / 4',
      explanation:
        'sin(75°) = sin(45° + 30°) = sin(45°)cos(30°) + cos(45°)sin(30°) = (√2/2)(√3/2) + (√2/2)(1/2) = √6/4 + √2/4 = (√6 + √2)/4.',
      distractorExplanations: {
        B: 'This is sin(15°) = (√6 - √2)/4.',
        C: 'Forgot denominator 4.',
        D: 'Value of sin(60°).',
      },
      prerequisites: ['Angle sum identities: sin(A + B) = sinA cosB + cosA sinB'],
      steps: [
        {
          stepNumber: 1,
          title: 'Angle Addition Formula',
          expression: 'sin(45° + 30°) = sin(45°)cos(30°) + cos(45°)sin(30°)',
          explanation: 'Decompose 75° into special angles 45° and 30°.',
        },
        {
          stepNumber: 2,
          title: 'Substitute Special Angle Values',
          expression: '(√2/2)(√3/2) + (√2/2)(1/2) = (√6 + √2)/4',
          explanation: 'Combine numerators over common denominator 4.',
        },
      ],
    },
  ];

  public getCompetencies(): LetCompetency[] {
    return this.competencies;
  }

  public getAllQuestions(): (MathProblem & { competencyCode: string })[] {
    return this.questionBank;
  }

  /**
   * Generates a LET Mock Examination.
   */
  public generateMockExam(options?: {
    competencyCode?: string;
    count?: number;
  }): {
    examId: string;
    totalQuestions: number;
    competenciesCovered: string[];
    questions: (MathProblem & { competencyCode: string })[];
  } {
    let pool = [...this.questionBank];
    if (options?.competencyCode) {
      pool = pool.filter((q) => q.competencyCode === options.competencyCode);
    }

    const count = options?.count ?? pool.length;
    const selected = pool.slice(0, count);

    const competenciesCovered = Array.from(new Set(selected.map((q) => q.competencyCode)));

    return {
      examId: `let-mock-${Date.now()}`,
      totalQuestions: selected.length,
      competenciesCovered,
      questions: selected,
    };
  }

  /**
   * Evaluates a completed LET Exam submission.
   * Compares student answers against correct options, generates distractor rationales,
   * breaks down competency scores, and computes pass/fail against 75.0% threshold.
   */
  public evaluateExam(answers: Record<string, string>): LetExamResult {
    let correctCount = 0;
    const total = this.questionBank.length;
    const competencyStats: Record<string, { title: string; score: number; total: number }> = {};

    for (const comp of this.competencies) {
      competencyStats[comp.code] = { title: comp.title, score: 0, total: 0 };
    }

    const questionEvaluations: LetExamResult['questionEvaluations'] = [];

    for (const q of this.questionBank) {
      const compStat = competencyStats[q.competencyCode];
      if (compStat) compStat.total++;

      const selected = (answers[q.id] || '').trim().toUpperCase();
      const isCorrect = selected === q.correctOptionKey;

      if (isCorrect) {
        correctCount++;
        if (compStat) compStat.score++;
      }

      let selectedDistractorRationale: string | undefined;
      if (!isCorrect && selected && q.distractorExplanations?.[selected]) {
        selectedDistractorRationale = q.distractorExplanations[selected];
      }

      questionEvaluations.push({
        questionId: q.id,
        question: q.question,
        selectedKey: selected || undefined,
        correctKey: q.correctOptionKey ?? '',
        isCorrect,
        explanation: q.explanation,
        selectedDistractorRationale,
      });
    }

    const percentage = total > 0 ? (correctCount / total) * 100 : 0;
    const passed = percentage >= 75.0;

    const competencyBreakdown: LetExamResult['competencyBreakdown'] = {};
    for (const [code, stat] of Object.entries(competencyStats)) {
      const pct = stat.total > 0 ? (stat.score / stat.total) * 100 : 0;
      competencyBreakdown[code] = {
        title: stat.title,
        score: stat.score,
        total: stat.total,
        percentage: Number(pct.toFixed(2)),
        passed: pct >= 75.0,
      };
    }

    return {
      score: correctCount,
      total,
      percentage: Number(percentage.toFixed(2)),
      passed,
      competencyBreakdown,
      questionEvaluations,
    };
  }
}
