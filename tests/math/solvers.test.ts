import { describe, it, expect } from 'vitest';
import {
  SymbolicEvaluator,
  AlgebraSolver,
  CalculusSolver,
  GeometrySolver,
  StatisticsSolver,
  SetLogicSolver,
} from '../../src/math/index.js';

describe('Phase 7 - Mathematical Solvers', () => {
  describe('Symbolic & Arithmetic Evaluator', () => {
    const evaluator = new SymbolicEvaluator();

    it('should evaluate arithmetic expressions following PEMDAS', () => {
      const res = evaluator.evaluateArithmetic('10 + 2 * (6 - 1) - 4 / 2');
      // 6 - 1 = 5; 2 * 5 = 10; 4 / 2 = 2; 10 + 10 - 2 = 18
      expect(res.result).toBe(18);
      expect(res.steps.length).toBeGreaterThan(2);
    });

    it('should compute prime factorization step-by-step', () => {
      const res = evaluator.primeFactorization(60);
      expect(res.factors).toEqual([2, 2, 3, 5]);
      expect(res.formatted).toBe('2^2 * 3 * 5');
      expect(res.steps.length).toBeGreaterThan(1);
    });

    it('should calculate GCD and LCM using Euclidean algorithm', () => {
      const gcdRes = evaluator.gcd(48, 18);
      expect(gcdRes.gcd).toBe(6);

      const lcmRes = evaluator.lcm(12, 18);
      expect(lcmRes.lcm).toBe(36);
    });

    it('should convert number bases', () => {
      const hexRes = evaluator.convertBase('255', 10, 16);
      expect(hexRes.result).toBe('FF');

      const binRes = evaluator.convertBase('1010', 2, 10);
      expect(binRes.result).toBe('10');
    });
  });

  describe('Algebra Solver', () => {
    const algebra = new AlgebraSolver();

    it('should solve linear equations ax + b = c', () => {
      // 3x - 6 = 15 => 3x = 21 => x = 7
      const sol = algebra.solveLinear(3, -6, 15);
      expect(sol.solution).toBe(7);
      expect(sol.steps.length).toBe(3);
    });

    it('should solve quadratic equations with distinct real roots', () => {
      // x^2 - 5x + 6 = 0 => roots 3, 2
      const sol = algebra.solveQuadratic(1, -5, 6);
      expect(sol.rootType).toBe('two_real');
      expect(sol.roots[0].real).toBe(3);
      expect(sol.roots[1].real).toBe(2);
      expect(sol.discriminant).toBe(1);
    });

    it('should solve quadratic equations with repeated root', () => {
      // x^2 - 4x + 4 = 0 => root 2
      const sol = algebra.solveQuadratic(1, -4, 4);
      expect(sol.rootType).toBe('one_real');
      expect(sol.discriminant).toBe(0);
      expect(sol.roots[0].real).toBe(2);
    });

    it('should solve quadratic equations with complex conjugate roots', () => {
      // x^2 + 4 = 0 => roots ± 2i
      const sol = algebra.solveQuadratic(1, 0, 4);
      expect(sol.rootType).toBe('complex_conjugate');
      expect(sol.discriminant).toBe(-16);
      expect(sol.roots[0].imag).toBe(2);
      expect(sol.roots[1].imag).toBe(-2);
    });

    it('should solve 2x2 linear system with Cramer\'s rule', () => {
      // 2x + y = 7
      // x - y = 2
      // => D = -2 - 1 = -3. Dx = -7 - 2 = -9 => x = 3. Dy = 4 - 7 = -3 => y = 1.
      const sol = algebra.solveSystem2x2({ a: 2, b: 1, c: 7 }, { a: 1, b: -1, c: 2 });
      expect(sol.x).toBe(3);
      expect(sol.y).toBe(1);
    });
  });

  describe('Calculus Solver', () => {
    const calculus = new CalculusSolver();

    it('should differentiate polynomials and compute slope at a point', () => {
      // f(x) = 3x^3 - 4x^2 + 5x - 7
      // f'(x) = 9x^2 - 8x + 5
      // f'(2) = 9(4) - 16 + 5 = 25
      const res = calculus.differentiatePolynomial(
        [
          { coefficient: 3, exponent: 3 },
          { coefficient: -4, exponent: 2 },
          { coefficient: 5, exponent: 1 },
          { coefficient: -7, exponent: 0 },
        ],
        2
      );
      expect(res.derivativeExpression).toBe('9x^2 - 8x + 5');
      expect(res.derivativeAtPoint?.slope).toBe(25);
    });

    it('should compute indefinite and definite integrals with FTC', () => {
      // ∫_0^2 (3x^2) dx = [x^3]_0^2 = 8 - 0 = 8
      const res = calculus.integratePolynomial(
        [{ coefficient: 3, exponent: 2 }],
        { lower: 0, upper: 2 }
      );
      expect(res.antiderivativeExpression).toBe('x^3 + C');
      expect(res.definiteIntegral?.value).toBe(8);
    });

    it('should solve separable exponential ODE with initial value problem', () => {
      // dy/dt = 2y with y(0) = 3 => y(t) = 3e^(2t)
      const res = calculus.solveExponentialOde(2, { t0: 0, y0: 3 });
      expect(res.generalSolution).toBe('y(t) = C * e^(2t)');
      expect(res.particularSolution).toContain('3.0000 * e^(2t)');
    });
  });

  describe('Geometry Solver', () => {
    const geometry = new GeometrySolver();

    it('should solve right triangles with Pythagorean theorem', () => {
      const hypotenuse = geometry.solvePythagorean({ a: 3, b: 4 });
      expect(hypotenuse.properties.c).toBe(5);

      const leg = geometry.solvePythagorean({ c: 13, a: 5 });
      expect(leg.properties.b).toBe(12);
    });

    it('should compute triangle area using Heron\'s formula', () => {
      // 3, 4, 5 right triangle area = 6
      const res = geometry.solveTriangleHeron(3, 4, 5);
      expect(res.properties.area).toBe(6);
    });

    it('should calculate circle properties and sector area', () => {
      const res = geometry.solveCircle(7, 90);
      expect(res.properties.diameter).toBe(14);
      expect(res.properties.circumference).toBeCloseTo(2 * Math.PI * 7, 2);
      expect(res.properties.sectorArea).toBeCloseTo((Math.PI * 49) / 4, 2);
    });

    it('should solve 3D solid geometry (sphere, cylinder, cone)', () => {
      const sphere = geometry.solveSphere(3);
      expect(sphere.properties.volume).toBeCloseTo((4 / 3) * Math.PI * 27, 2);

      const cyl = geometry.solveCylinder(3, 5);
      expect(cyl.properties.volume).toBeCloseTo(Math.PI * 9 * 5, 2);

      const cone = geometry.solveCone(3, 4);
      expect(cone.properties.slantHeight).toBe(5);
    });
  });

  describe('Statistics Solver', () => {
    const stats = new StatisticsSolver();

    it('should compute descriptive statistics', () => {
      const data = [2, 4, 4, 4, 5, 5, 7, 9];
      const res = stats.analyzeData(data);
      expect(res.count).toBe(8);
      expect(res.mean).toBe(5);
      expect(res.median).toBe(4.5);
      expect(res.modes).toEqual([4]);
      expect(res.range).toBe(7);
      expect(res.sampleVariance).toBeGreaterThan(0);
    });

    it('should calculate permutations and combinations', () => {
      const p = stats.permutation(5, 2); // 5 * 4 = 20
      expect(p.value).toBe(20);

      const c = stats.combination(5, 2); // 10
      expect(c.value).toBe(10);
    });

    it('should calculate Bayes\' theorem probability', () => {
      // P(B|A) = 0.8, P(A) = 0.1, P(B) = 0.2 => P(A|B) = 0.08 / 0.2 = 0.4
      const res = stats.solveBayesTheorem(0.8, 0.1, 0.2);
      expect(res.probability).toBeCloseTo(0.4, 4);
    });
  });

  describe('Sets & Propositional Logic Solver', () => {
    const setLogic = new SetLogicSolver();

    it('should compute set union, intersection, and difference', () => {
      const a = [1, 2, 3, 4];
      const b = [3, 4, 5, 6];

      expect(setLogic.union(a, b).result).toEqual([1, 2, 3, 4, 5, 6]);
      expect(setLogic.intersection(a, b).result).toEqual([3, 4]);
      expect(setLogic.difference(a, b).result).toEqual([1, 2]);
    });

    it('should evaluate truth table and contrapositive equivalence', () => {
      const impl = setLogic.analyzeImplication('P', 'Q');
      expect(impl.contrapositive).toBe('¬Q → ¬P');

      // P OR NOT P is a tautology
      const tautology = setLogic.evaluateProposition2('P ∨ ¬P', (p, _) => p || !p);
      expect(tautology.isTautology).toBe(true);
    });
  });
});
