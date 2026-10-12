/**
 * JARVIS Phase 7 - Central Mathematics Engine
 * Unifies all specialized mathematical solvers, the Socratic Learning Cycle,
 * and the Philippine BLEPT LET Mathematics Majorship review system.
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
  LetCompetency,
} from './math.interface.js';
import { SymbolicEvaluator } from './solver/symbolic-evaluator.js';
import { AlgebraSolver, QuadraticSolution, LinearSolution, System2x2Solution } from './solver/algebra-solver.js';
import { CalculusSolver, DerivativeResult, IntegralResult, PolynomialTerm } from './solver/calculus-solver.js';
import { GeometrySolver, GeometricResult } from './solver/geometry-solver.js';
import { StatisticsSolver, DescriptiveStatsResult, CombinatoricsResult, ProbabilityResult } from './solver/statistics-solver.js';
import { SetLogicSolver, SetOperationResult, LogicResult } from './solver/set-logic-solver.js';
import { LearningCycleEngine } from './learning/learning-cycle-engine.js';
import { LetReviewEngine, LetExamResult } from './learning/let-review-engine.js';

export class MathematicsEngine {
  public readonly symbolic: SymbolicEvaluator;
  public readonly algebra: AlgebraSolver;
  public readonly calculus: CalculusSolver;
  public readonly geometry: GeometrySolver;
  public readonly statistics: StatisticsSolver;
  public readonly setLogic: SetLogicSolver;
  public readonly learningCycle: LearningCycleEngine;
  public readonly letReview: LetReviewEngine;

  constructor() {
    this.symbolic = new SymbolicEvaluator();
    this.algebra = new AlgebraSolver();
    this.calculus = new CalculusSolver();
    this.geometry = new GeometrySolver();
    this.statistics = new StatisticsSolver();
    this.setLogic = new SetLogicSolver();
    this.learningCycle = new LearningCycleEngine();
    this.letReview = new LetReviewEngine();
  }

  /**
   * General problem solver interface that parses and dispatches to appropriate solver.
   */
  public solve(params: {
    domain: MathDomain;
    expression?: string;
    linear?: { a: number; b: number; c: number; variable?: string };
    quadratic?: { a: number; b: number; c: number };
    system2x2?: { eq1: { a: number; b: number; c: number }; eq2: { a: number; b: number; c: number } };
    derivative?: { terms: PolynomialTerm[]; evaluateAt?: number };
    integral?: { terms: PolynomialTerm[]; bounds?: { lower: number; upper: number } };
    geometry?: {
      type: 'pythagorean' | 'heron' | 'circle' | 'sphere' | 'cylinder' | 'cone' | 'law_of_cosines';
      a?: number;
      b?: number;
      c?: number;
      radius?: number;
      height?: number;
      angle?: number;
    };
    statistics?: {
      data?: number[];
      combinatorics?: { op: 'factorial' | 'permutation' | 'combination'; n: number; r?: number };
      bayes?: { pB_given_A: number; pA: number; pB: number };
    };
    setLogic?: {
      operation: 'union' | 'intersection' | 'difference';
      setA: (string | number)[];
      setB: (string | number)[];
    };
  }): {
    domain: MathDomain;
    result: any;
    steps: MathStep[];
    formattedAnswer: string;
  } {
    const { domain } = params;

    switch (domain) {
      case 'arithmetic':
      case 'number_systems': {
        if (!params.expression) throw new Error('Expression is required for arithmetic evaluation.');
        const res = this.symbolic.evaluateArithmetic(params.expression);
        return {
          domain,
          result: res.result,
          steps: res.steps,
          formattedAnswer: `${params.expression} = ${res.result}`,
        };
      }

      case 'algebra': {
        if (params.linear) {
          const res = this.algebra.solveLinear(
            params.linear.a,
            params.linear.b,
            params.linear.c,
            params.linear.variable
          );
          return {
            domain,
            result: res,
            steps: res.steps,
            formattedAnswer: `${res.variable} = ${res.solution}`,
          };
        } else if (params.quadratic) {
          const res = this.algebra.solveQuadratic(
            params.quadratic.a,
            params.quadratic.b,
            params.quadratic.c
          );
          return {
            domain,
            result: res,
            steps: res.steps,
            formattedAnswer: res.formattedRoots,
          };
        } else if (params.system2x2) {
          const res = this.algebra.solveSystem2x2(params.system2x2.eq1, params.system2x2.eq2);
          return {
            domain,
            result: res,
            steps: res.steps,
            formattedAnswer: `(x, y) = (${res.x}, ${res.y})`,
          };
        }
        throw new Error('Unsupported algebra request: provide linear, quadratic, or system2x2 parameters.');
      }

      case 'differential_calculus': {
        if (!params.derivative?.terms) throw new Error('Polynomial terms required for differentiation.');
        const res = this.calculus.differentiatePolynomial(
          params.derivative.terms,
          params.derivative.evaluateAt
        );
        return {
          domain,
          result: res,
          steps: res.steps,
          formattedAnswer: res.derivativeAtPoint
            ? `f'(${res.derivativeAtPoint.x}) = ${res.derivativeAtPoint.slope}`
            : `f'(x) = ${res.derivativeExpression}`,
        };
      }

      case 'integral_calculus': {
        if (!params.integral?.terms) throw new Error('Polynomial terms required for integration.');
        const res = this.calculus.integratePolynomial(
          params.integral.terms,
          params.integral.bounds
        );
        return {
          domain,
          result: res,
          steps: res.steps,
          formattedAnswer: res.definiteIntegral
            ? `Value = ${res.definiteIntegral.value}`
            : `F(x) = ${res.antiderivativeExpression}`,
        };
      }

      case 'geometry':
      case 'solid_geometry':
      case 'trigonometry': {
        const geom = params.geometry;
        if (!geom) throw new Error('Geometry parameters required.');

        let geoRes: GeometricResult;
        if (geom.type === 'pythagorean') {
          geoRes = this.geometry.solvePythagorean({ a: geom.a, b: geom.b, c: geom.c });
        } else if (geom.type === 'heron' && geom.a && geom.b && geom.c) {
          geoRes = this.geometry.solveTriangleHeron(geom.a, geom.b, geom.c);
        } else if (geom.type === 'circle' && geom.radius) {
          geoRes = this.geometry.solveCircle(geom.radius, geom.angle);
        } else if (geom.type === 'sphere' && geom.radius) {
          geoRes = this.geometry.solveSphere(geom.radius);
        } else if (geom.type === 'cylinder' && geom.radius && geom.height) {
          geoRes = this.geometry.solveCylinder(geom.radius, geom.height);
        } else if (geom.type === 'cone' && geom.radius && geom.height) {
          geoRes = this.geometry.solveCone(geom.radius, geom.height);
        } else if (geom.type === 'law_of_cosines' && geom.a && geom.b && geom.angle) {
          geoRes = this.geometry.solveLawOfCosines(geom.a, geom.b, geom.angle);
        } else {
          throw new Error(`Unsupported or incomplete geometry request for type: ${geom.type}`);
        }

        return {
          domain,
          result: geoRes,
          steps: geoRes.steps,
          formattedAnswer: `${geoRes.shape} solved. Properties: ${JSON.stringify(geoRes.properties)}`,
        };
      }

      case 'statistics': {
        const stats = params.statistics;
        if (!stats) throw new Error('Statistics parameters required.');

        if (stats.data) {
          const res = this.statistics.analyzeData(stats.data);
          return {
            domain,
            result: res,
            steps: res.steps,
            formattedAnswer: `Mean = ${res.mean.toFixed(2)}, Median = ${res.median}, Sample SD = ${res.sampleStdDev.toFixed(4)}`,
          };
        } else if (stats.combinatorics) {
          const c = stats.combinatorics;
          let res: CombinatoricsResult;
          if (c.op === 'factorial') res = this.statistics.factorial(c.n);
          else if (c.op === 'permutation') res = this.statistics.permutation(c.n, c.r ?? 0);
          else res = this.statistics.combination(c.n, c.r ?? 0);

          return {
            domain,
            result: res,
            steps: res.steps,
            formattedAnswer: `${c.op.toUpperCase()}(${c.n}${c.r !== undefined ? ', ' + c.r : ''}) = ${res.value}`,
          };
        } else if (stats.bayes) {
          const res = this.statistics.solveBayesTheorem(
            stats.bayes.pB_given_A,
            stats.bayes.pA,
            stats.bayes.pB
          );
          return {
            domain,
            result: res,
            steps: res.steps,
            formattedAnswer: `P(A|B) = ${res.percentage} (${res.probability.toFixed(4)})`,
          };
        }
        throw new Error('Unsupported statistics parameters.');
      }

      case 'sets': {
        const sl = params.setLogic;
        if (!sl) throw new Error('Set operation parameters required.');
        let res: SetOperationResult;
        if (sl.operation === 'union') res = this.setLogic.union(sl.setA, sl.setB);
        else if (sl.operation === 'intersection') res = this.setLogic.intersection(sl.setA, sl.setB);
        else res = this.setLogic.difference(sl.setA, sl.setB);

        return {
          domain,
          result: res,
          steps: res.steps,
          formattedAnswer: `${sl.operation.toUpperCase()} = {${res.result.join(', ')}}`,
        };
      }

      default:
        throw new Error(`Domain ${domain} is not currently supported by direct solver dispatch.`);
    }
  }

  // --- Pedagogical Socratic Cycle Methods ---
  public generateAssessment(userId: string, domain: MathDomain): LearningAssessment {
    return this.learningCycle.generateAssessment(userId, domain);
  }

  public diagnoseAssessment(
    userId: string,
    domain: MathDomain,
    submissions: { problemId: string; studentAnswer: string }[]
  ): LearningDiagnosticResult {
    return this.learningCycle.diagnoseAssessment(userId, domain, submissions);
  }

  public teachPrerequisite(prerequisiteTopic: string) {
    return this.learningCycle.teachPrerequisite(prerequisiteTopic);
  }

  public getWorkedExample(domain: MathDomain, topic?: string): WorkedExample {
    return this.learningCycle.getWorkedExample(domain, topic);
  }

  public checkPracticeAnswer(
    userId: string,
    domain: MathDomain,
    studentAnswer: string | number,
    expectedAnswer: string | number,
    topic?: string
  ): MathEvaluationResult {
    return this.learningCycle.checkAnswer(userId, domain, studentAnswer, expectedAnswer, topic);
  }

  public getUserMastery(userId: string, domain: MathDomain) {
    return this.learningCycle.getUserMastery(userId, domain);
  }

  // --- LET Review Methods ---
  public getLetCompetencies(): LetCompetency[] {
    return this.letReview.getCompetencies();
  }

  public generateLetMockExam(options?: { competencyCode?: string; count?: number }) {
    return this.letReview.generateMockExam(options);
  }

  public evaluateLetExam(answers: Record<string, string>): LetExamResult {
    return this.letReview.evaluateExam(answers);
  }
}
