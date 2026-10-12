/**
 * JARVIS Phase 7 - Algebra Solver
 * Solves linear equations, quadratic equations with discriminant and complex roots,
 * and 2x2 linear systems with Cramer's Rule / elimination.
 */

import { MathStep } from '../math.interface.js';

export interface LinearSolution {
  variable: string;
  solution: number;
  steps: MathStep[];
}

export interface QuadraticSolution {
  a: number;
  b: number;
  c: number;
  discriminant: number;
  rootType: 'two_real' | 'one_real' | 'complex_conjugate';
  roots: { real: number; imag: number }[];
  vertex: { x: number; y: number };
  steps: MathStep[];
  formattedRoots: string;
}

export interface System2x2Solution {
  x: number;
  y: number;
  determinant: number;
  steps: MathStep[];
}

export class AlgebraSolver {
  /**
   * Solves linear equation: ax + b = c  =>  ax = c - b  =>  x = (c - b) / a
   */
  public solveLinear(a: number, b: number, c: number, variable = 'x'): LinearSolution {
    if (a === 0) {
      if (b === c) {
        throw new Error('Identity equation: infinitely many solutions (0 = 0).');
      } else {
        throw new Error('Inconsistent equation: no solution.');
      }
    }

    const steps: MathStep[] = [];
    steps.push({
      stepNumber: 1,
      title: 'Initial Linear Equation',
      expression: `${a !== 1 ? a : ''}${variable} + ${b} = ${c}`,
      explanation: `Given linear equation in standard form for variable ${variable}.`,
      ruleApplied: 'Standard Form',
    });

    const rhsAfterSubtraction = c - b;
    steps.push({
      stepNumber: 2,
      title: `Subtract Constant Term (${b}) from Both Sides`,
      expression: `${a !== 1 ? a : ''}${variable} = ${c} - (${b}) = ${rhsAfterSubtraction}`,
      explanation: `Isolate variable term by subtracting ${b} from both sides.`,
      ruleApplied: 'Subtraction Property of Equality',
    });

    const solution = rhsAfterSubtraction / a;
    steps.push({
      stepNumber: 3,
      title: `Divide by Coefficient (${a})`,
      expression: `${variable} = ${rhsAfterSubtraction} / ${a} = ${solution}`,
      explanation: `Solve for ${variable} by dividing both sides by ${a}.`,
      ruleApplied: 'Division Property of Equality',
    });

    return {
      variable,
      solution,
      steps,
    };
  }

  /**
   * Solves quadratic equation: a*x^2 + b*x + c = 0
   * Calculates discriminant, identifies root nature, and derives roots step-by-step.
   */
  public solveQuadratic(a: number, b: number, c: number): QuadraticSolution {
    if (a === 0) {
      throw new Error('Coefficient "a" must not be zero for a quadratic equation.');
    }

    const steps: MathStep[] = [];
    steps.push({
      stepNumber: 1,
      title: 'Standard Quadratic Equation Form',
      expression: `${a}x^2 + (${b})x + (${c}) = 0`,
      explanation: `Identify coefficients: a = ${a}, b = ${b}, c = ${c}.`,
      ruleApplied: 'Standard Quadratic Form: ax^2 + bx + c = 0',
    });

    // Discriminant Delta = b^2 - 4ac
    const discriminant = b * b - 4 * a * c;
    steps.push({
      stepNumber: 2,
      title: 'Calculate Discriminant (Δ)',
      expression: `Δ = b^2 - 4ac = (${b})^2 - 4(${a})(${c}) = ${b * b} - ${4 * a * c} = ${discriminant}`,
      explanation: 'The discriminant reveals the number and type of roots.',
      ruleApplied: 'Discriminant Formula: Δ = b^2 - 4ac',
    });

    let rootType: 'two_real' | 'one_real' | 'complex_conjugate';
    const roots: { real: number; imag: number }[] = [];
    let formattedRoots = '';

    if (discriminant > 0) {
      rootType = 'two_real';
      const sqrtD = Math.sqrt(discriminant);
      const r1 = (-b + sqrtD) / (2 * a);
      const r2 = (-b - sqrtD) / (2 * a);
      roots.push({ real: r1, imag: 0 }, { real: r2, imag: 0 });
      formattedRoots = `x₁ = ${r1}, x₂ = ${r2}`;

      steps.push({
        stepNumber: 3,
        title: 'Apply Quadratic Formula (Two Distinct Real Roots)',
        expression: `x = (-b ± √Δ) / 2a = (-(${b}) ± √${discriminant}) / (2 * ${a})`,
        explanation: `Since Δ > 0, the equation has two distinct real roots. √${discriminant} ≈ ${sqrtD}.`,
        ruleApplied: 'Quadratic Formula',
      });

      steps.push({
        stepNumber: 4,
        title: 'Evaluate Both Branches',
        expression: `x₁ = (${-b} + ${sqrtD}) / ${2 * a} = ${r1}\nx₂ = (${-b} - ${sqrtD}) / ${2 * a} = ${r2}`,
        explanation: `Solutions obtained by adding and subtracting the square root of the discriminant.`,
        ruleApplied: 'Simplification',
      });
    } else if (discriminant === 0) {
      rootType = 'one_real';
      const r = -b / (2 * a);
      roots.push({ real: r, imag: 0 }, { real: r, imag: 0 });
      formattedRoots = `x = ${r} (multiplicity 2)`;

      steps.push({
        stepNumber: 3,
        title: 'Repeated Real Root',
        expression: `x = -b / 2a = -(${b}) / (2 * ${a}) = ${r}`,
        explanation: 'Since Δ = 0, the parabola touches the x-axis at a single point (repeated root).',
        ruleApplied: 'Double Root Condition',
      });
    } else {
      rootType = 'complex_conjugate';
      const realPart = -b / (2 * a);
      const imagPart = Math.sqrt(-discriminant) / (2 * Math.abs(a));
      roots.push({ real: realPart, imag: imagPart }, { real: realPart, imag: -imagPart });
      formattedRoots = `x = ${realPart} ± ${imagPart.toFixed(4)}i`;

      steps.push({
        stepNumber: 3,
        title: 'Complex Conjugate Roots',
        expression: `x = (-b ± i√|Δ|) / 2a = (${-b} ± i√${-discriminant}) / ${2 * a}`,
        explanation: `Since Δ < 0, roots are complex numbers forming a conjugate pair.`,
        ruleApplied: 'Euler/Complex Roots Formula',
      });

      steps.push({
        stepNumber: 4,
        title: 'Express in Standard Complex Form (a + bi)',
        expression: formattedRoots,
        explanation: `Real part is ${realPart}, imaginary component is ±${imagPart.toFixed(4)}.`,
        ruleApplied: 'Complex Number Decomposition',
      });
    }

    // Vertex: (-b/(2a), c - b^2/(4a))
    const vx = -b / (2 * a);
    const vy = c - (b * b) / (4 * a);
    steps.push({
      stepNumber: steps.length + 1,
      title: 'Parabola Vertex',
      expression: `Vertex (h, k) = (-b / 2a, -Δ / 4a) = (${vx}, ${vy})`,
      explanation: `The vertex represents the ${a > 0 ? 'minimum' : 'maximum'} point of the quadratic function.`,
      ruleApplied: 'Vertex Formula',
    });

    return {
      a,
      b,
      c,
      discriminant,
      rootType,
      roots,
      vertex: { x: vx, y: vy },
      steps,
      formattedRoots,
    };
  }

  /**
   * Solves 2x2 system of linear equations using Cramer's Rule:
   * a1*x + b1*y = c1
   * a2*x + b2*y = c2
   */
  public solveSystem2x2(
    eq1: { a: number; b: number; c: number },
    eq2: { a: number; b: number; c: number }
  ): System2x2Solution {
    const steps: MathStep[] = [];

    steps.push({
      stepNumber: 1,
      title: 'System Formulation',
      expression: `(1) ${eq1.a}x + ${eq1.b}y = ${eq1.c}\n(2) ${eq2.a}x + ${eq2.b}y = ${eq2.c}`,
      explanation: 'Formulate system of 2 linear equations in standard form.',
      ruleApplied: 'System Setup',
    });

    // Determinant D = a1*b2 - a2*b1
    const det = eq1.a * eq2.b - eq2.a * eq1.b;
    steps.push({
      stepNumber: 2,
      title: 'Calculate Main Determinant (D)',
      expression: `D = |${eq1.a}  ${eq1.b}|\n    |${eq2.a}  ${eq2.b}| = (${eq1.a} * ${eq2.b}) - (${eq1.b} * ${eq2.a}) = ${det}`,
      explanation: 'Compute determinant of coefficient matrix.',
      ruleApplied: "Cramer's Rule: D = a1*b2 - b1*a2",
    });

    if (det === 0) {
      throw new Error("Determinant is 0: System has no unique solution (either parallel lines or coincident).");
    }

    // Determinant Dx = c1*b2 - c2*b1
    const detX = eq1.c * eq2.b - eq2.c * eq1.b;
    steps.push({
      stepNumber: 3,
      title: 'Calculate x-Determinant (Dx)',
      expression: `Dx = |${eq1.c}  ${eq1.b}|\n     |${eq2.c}  ${eq2.b}| = (${eq1.c} * ${eq2.b}) - (${eq1.b} * ${eq2.c}) = ${detX}`,
      explanation: 'Replace x-column with constant terms and evaluate determinant.',
      ruleApplied: "Cramer's Rule for x",
    });

    // Determinant Dy = a1*c2 - a2*c1
    const detY = eq1.a * eq2.c - eq2.a * eq1.c;
    steps.push({
      stepNumber: 4,
      title: 'Calculate y-Determinant (Dy)',
      expression: `Dy = |${eq1.a}  ${eq1.c}|\n     |${eq2.a}  ${eq2.c}| = (${eq1.a} * ${eq2.c}) - (${eq1.c} * ${eq2.a}) = ${detY}`,
      explanation: 'Replace y-column with constant terms and evaluate determinant.',
      ruleApplied: "Cramer's Rule for y",
    });

    const x = detX / det;
    const y = detY / det;
    steps.push({
      stepNumber: 5,
      title: 'Compute Solutions',
      expression: `x = Dx / D = ${detX} / ${det} = ${x}\ny = Dy / D = ${detY} / ${det} = ${y}`,
      explanation: `Unique intersection point found at (${x}, ${y}).`,
      ruleApplied: 'Final Resolution',
    });

    return {
      x,
      y,
      determinant: det,
      steps,
    };
  }
}
