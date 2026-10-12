/**
 * JARVIS Phase 7 - Calculus Solver
 * Handles differential calculus (power rule, product, polynomial derivatives, slopes),
 * integral calculus (indefinite and definite integrals with FTC), and first-order ODEs.
 */

import { MathStep } from '../math.interface.js';

export interface PolynomialTerm {
  coefficient: number;
  exponent: number;
}

export interface DerivativeResult {
  derivativeExpression: string;
  steps: MathStep[];
  derivativeAtPoint?: { x: number; slope: number };
}

export interface IntegralResult {
  antiderivativeExpression: string;
  steps: MathStep[];
  definiteIntegral?: {
    lowerBound: number;
    upperBound: number;
    value: number;
  };
}

export interface OdeSolution {
  equation: string;
  generalSolution: string;
  particularSolution?: string;
  steps: MathStep[];
}

export class CalculusSolver {
  /**
   * Differentiates a polynomial represented by an array of terms.
   * f(x) = sum( c_i * x^(p_i) )
   */
  public differentiatePolynomial(
    terms: PolynomialTerm[],
    evaluateAt?: number
  ): DerivativeResult {
    const steps: MathStep[] = [];
    const originalExpr = this.formatPolynomial(terms);

    steps.push({
      stepNumber: 1,
      title: 'Polynomial Setup',
      expression: `f(x) = ${originalExpr}`,
      explanation: 'Analyze individual terms of the polynomial function.',
      ruleApplied: 'Sum Rule: d/dx [u + v] = du/dx + dv/dx',
    });

    const derivedTerms: PolynomialTerm[] = [];
    let stepNum = 2;

    for (const term of terms) {
      if (term.exponent === 0) {
        steps.push({
          stepNumber: stepNum++,
          title: `Differentiate Constant Term (${term.coefficient})`,
          expression: `d/dx [${term.coefficient}] = 0`,
          explanation: 'The derivative of any constant is zero.',
          ruleApplied: 'Constant Rule',
        });
      } else {
        const newCoeff = term.coefficient * term.exponent;
        const newExp = term.exponent - 1;
        derivedTerms.push({ coefficient: newCoeff, exponent: newExp });

        steps.push({
          stepNumber: stepNum++,
          title: `Apply Power Rule to Term (${term.coefficient}x^${term.exponent})`,
          expression: `d/dx [${term.coefficient}x^${term.exponent}] = ${term.coefficient} * ${term.exponent} * x^(${term.exponent}-1) = ${newCoeff}x^${newExp}`,
          explanation: `Multiply coefficient by exponent and decrement power by 1.`,
          ruleApplied: 'Power Rule: d/dx [x^n] = n * x^(n-1)',
        });
      }
    }

    const derivExpr = this.formatPolynomial(derivedTerms) || '0';
    steps.push({
      stepNumber: stepNum++,
      title: 'Synthesize Derivative Function',
      expression: `f'(x) = ${derivExpr}`,
      explanation: 'Combine differentiated terms.',
      ruleApplied: 'Final Derivative Form',
    });

    let derivativeAtPoint: { x: number; slope: number } | undefined;
    if (evaluateAt !== undefined) {
      const slope = this.evaluatePolynomial(derivedTerms, evaluateAt);
      steps.push({
        stepNumber: stepNum,
        title: `Evaluate Slope at x = ${evaluateAt}`,
        expression: `f'(${evaluateAt}) = ${slope}`,
        explanation: `Substitute x = ${evaluateAt} into f'(x) to obtain instantaneous rate of change / tangent slope.`,
        ruleApplied: 'Tangent Slope Evaluation',
      });
      derivativeAtPoint = { x: evaluateAt, slope };
    }

    return {
      derivativeExpression: derivExpr,
      steps,
      derivativeAtPoint,
    };
  }

  /**
   * Integrates a polynomial term-by-term.
   * Can evaluate definite integral between lower and upper bounds using FTC.
   */
  public integratePolynomial(
    terms: PolynomialTerm[],
    definiteBounds?: { lower: number; upper: number }
  ): IntegralResult {
    const steps: MathStep[] = [];
    const originalExpr = this.formatPolynomial(terms);

    steps.push({
      stepNumber: 1,
      title: 'Indefinite Integral Setup',
      expression: `∫ (${originalExpr}) dx`,
      explanation: 'Apply term-by-term integration using the reverse power rule.',
      ruleApplied: 'Linearity of Integration: ∫ [u + v] dx = ∫ u dx + ∫ v dx',
    });

    const antiderivativeTerms: PolynomialTerm[] = [];
    let stepNum = 2;

    for (const term of terms) {
      if (term.exponent === -1) {
        throw new Error('Integral of 1/x yields ln|x|, which is not a polynomial.');
      }
      const newExp = term.exponent + 1;
      const newCoeff = term.coefficient / newExp;
      antiderivativeTerms.push({ coefficient: newCoeff, exponent: newExp });

      steps.push({
        stepNumber: stepNum++,
        title: `Reverse Power Rule on ${term.coefficient}x^${term.exponent}`,
        expression: `∫ ${term.coefficient}x^${term.exponent} dx = (${term.coefficient} / (${term.exponent} + 1)) * x^(${term.exponent} + 1) = ${newCoeff}x^${newExp}`,
        explanation: 'Increment exponent by 1 and divide coefficient by the new exponent.',
        ruleApplied: 'Power Rule for Integration: ∫ x^n dx = (x^(n+1))/(n+1)',
      });
    }

    const antiderivExpr = `${this.formatPolynomial(antiderivativeTerms)} + C`;
    steps.push({
      stepNumber: stepNum++,
      title: 'Indefinite Antiderivative',
      expression: `F(x) = ${antiderivExpr}`,
      explanation: 'Include constant of integration C for general antiderivative.',
      ruleApplied: 'Constant of Integration (C)',
    });

    let definiteIntegral: { lowerBound: number; upperBound: number; value: number } | undefined;

    if (definiteBounds) {
      const F_b = this.evaluatePolynomial(antiderivativeTerms, definiteBounds.upper);
      const F_a = this.evaluatePolynomial(antiderivativeTerms, definiteBounds.lower);
      const netVal = F_b - F_a;

      steps.push({
        stepNumber: stepNum++,
        title: 'Apply Fundamental Theorem of Calculus (FTC)',
        expression: `∫_${definiteBounds.lower}^${definiteBounds.upper} (${originalExpr}) dx = F(${definiteBounds.upper}) - F(${definiteBounds.lower})`,
        explanation: 'Evaluate antiderivative at upper bound minus antiderivative at lower bound.',
        ruleApplied: 'Fundamental Theorem of Calculus: ∫_a^b f(x) dx = F(b) - F(a)',
      });

      steps.push({
        stepNumber: stepNum,
        title: 'Compute Net Value',
        expression: `F(${definiteBounds.upper}) = ${F_b}\nF(${definiteBounds.lower}) = ${F_a}\nResult = ${F_b} - (${F_a}) = ${netVal}`,
        explanation: `The net signed area under the curve is ${netVal}.`,
        ruleApplied: 'Definite Integral Value',
      });

      definiteIntegral = {
        lowerBound: definiteBounds.lower,
        upperBound: definiteBounds.upper,
        value: netVal,
      };
    }

    return {
      antiderivativeExpression: antiderivExpr,
      steps,
      definiteIntegral,
    };
  }

  /**
   * Solves standard separable first-order differential equations:
   * dy/dt = k*y (Exponential growth/decay) with optional initial value y(0) = y0.
   */
  public solveExponentialOde(
    k: number,
    initialCondition?: { t0: number; y0: number }
  ): OdeSolution {
    const steps: MathStep[] = [];
    const eq = `dy/dt = ${k}y`;

    steps.push({
      stepNumber: 1,
      title: 'Differential Equation Identification',
      expression: eq,
      explanation: `First-order linear ordinary differential equation (autonomous separable model with growth/decay constant k = ${k}).`,
      ruleApplied: 'Separation of Variables',
    });

    steps.push({
      stepNumber: 2,
      title: 'Separate Variables',
      expression: `(1/y) dy = ${k} dt`,
      explanation: 'Isolate terms involving y on LHS and terms involving t on RHS.',
      ruleApplied: 'Algebraic Separation',
    });

    steps.push({
      stepNumber: 3,
      title: 'Integrate Both Sides',
      expression: `∫ (1/y) dy = ∫ ${k} dt  =>  ln|y| = ${k}t + C₁`,
      explanation: 'Apply natural logarithm integral on LHS and linear integral on RHS.',
      ruleApplied: 'Integration',
    });

    const generalSol = `y(t) = C * e^(${k}t)`;
    steps.push({
      stepNumber: 4,
      title: 'Exponentiate to Solve for y',
      expression: `y(t) = e^(${k}t + C₁) = e^(C₁) * e^(${k}t) = ${generalSol}`,
      explanation: 'Let arbitrary constant C = ±e^(C₁).',
      ruleApplied: 'General Solution Derivation',
    });

    let particularSol: string | undefined;
    if (initialCondition) {
      // y(t0) = y0 => y0 = C * e^(k * t0) => C = y0 / e^(k * t0)
      const C = initialCondition.y0 / Math.exp(k * initialCondition.t0);
      particularSol = `y(t) = ${C.toFixed(4)} * e^(${k}t)`;

      steps.push({
        stepNumber: 5,
        title: 'Apply Initial Condition',
        expression: `y(${initialCondition.t0}) = ${initialCondition.y0}  =>  C = ${initialCondition.y0} / e^(${k} * ${initialCondition.t0}) = ${C.toFixed(4)}`,
        explanation: 'Determine unique constant C satisfying initial boundary condition.',
        ruleApplied: 'Initial Value Problem (IVP)',
      });

      steps.push({
        stepNumber: 6,
        title: 'Particular Solution',
        expression: particularSol,
        explanation: 'Unique solution satisfying the specific initial condition.',
        ruleApplied: 'IVP Solution',
      });
    }

    return {
      equation: eq,
      generalSolution: generalSol,
      particularSolution: particularSol,
      steps,
    };
  }

  // --- Helpers ---
  private formatPolynomial(terms: PolynomialTerm[]): string {
    const nonZero = terms.filter((t) => Math.abs(t.coefficient) > 1e-9);
    if (nonZero.length === 0) return '0';

    return nonZero
      .map((term, idx) => {
        const sign = term.coefficient < 0 ? '-' : idx === 0 ? '' : '+';
        const absCoeff = Math.abs(term.coefficient);
        const coeffStr = absCoeff === 1 && term.exponent !== 0 ? '' : `${absCoeff}`;

        let varStr = '';
        if (term.exponent === 1) varStr = 'x';
        else if (term.exponent > 1) varStr = `x^${term.exponent}`;

        return `${sign ? sign + ' ' : ''}${coeffStr}${varStr}`.trim();
      })
      .join(' ')
      .trim();
  }

  private evaluatePolynomial(terms: PolynomialTerm[], x: number): number {
    return terms.reduce((acc, t) => acc + t.coefficient * Math.pow(x, t.exponent), 0);
  }
}
