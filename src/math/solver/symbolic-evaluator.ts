/**
 * JARVIS Phase 7 - Symbolic & Arithmetic Evaluator
 * Handles arithmetic, order of operations, fractions, prime factorizations, GCD/LCM,
 * and number systems conversion (binary, octal, hex, decimal).
 */

import { MathStep } from '../math.interface.js';

export interface EvaluationStepResult {
  steps: MathStep[];
  result: number | string;
  expression: string;
}

export class SymbolicEvaluator {
  /**
   * Safely evaluates arithmetic expressions and breaks down operations into steps.
   */
  public evaluateArithmetic(expression: string): EvaluationStepResult {
    const cleaned = expression.replace(/\s+/g, '');
    const steps: MathStep[] = [];

    steps.push({
      stepNumber: 1,
      title: 'Analyze Expression',
      expression: cleaned,
      explanation: 'Parse input expression and check mathematical syntax according to PEMDAS/BODMAS.',
      ruleApplied: 'PEMDAS / Order of Operations',
    });

    // Handle basic arithmetic safely using recursive descent or tokenizer
    const tokens = this.tokenize(cleaned);
    let stepCount = 2;

    const result = this.evaluateTokens(tokens, steps, () => stepCount++);

    steps.push({
      stepNumber: stepCount,
      title: 'Final Calculation',
      expression: `${cleaned} = ${result}`,
      explanation: `Successfully evaluated the expression to ${result}.`,
      ruleApplied: 'Equality',
    });

    return {
      expression: cleaned,
      result,
      steps,
    };
  }

  /**
   * Calculates Prime Factorization with step-by-step breakdown.
   */
  public primeFactorization(n: number): { factors: number[]; steps: MathStep[]; formatted: string } {
    if (n <= 1) {
      return {
        factors: [n],
        steps: [
          {
            stepNumber: 1,
            title: 'Trivial Case',
            expression: `${n}`,
            explanation: `${n} is not composite or is less than 2.`,
          },
        ],
        formatted: `${n}`,
      };
    }

    const steps: MathStep[] = [];
    let current = Math.abs(Math.floor(n));
    const factors: number[] = [];
    let divisor = 2;
    let stepNum = 1;

    steps.push({
      stepNumber: stepNum++,
      title: 'Initial Factorization Setup',
      expression: `N = ${current}`,
      explanation: `Find prime factors of ${current} by trial division starting at 2.`,
      ruleApplied: 'Fundamental Theorem of Arithmetic',
    });

    while (divisor * divisor <= current) {
      if (current % divisor === 0) {
        factors.push(divisor);
        const next = current / divisor;
        steps.push({
          stepNumber: stepNum++,
          title: `Extract Prime Factor ${divisor}`,
          expression: `${current} / ${divisor} = ${next}`,
          explanation: `${divisor} divides ${current} evenly. Remainder is 0.`,
          ruleApplied: 'Trial Division',
        });
        current = next;
      } else {
        divisor = divisor === 2 ? 3 : divisor + 2;
      }
    }

    if (current > 1) {
      factors.push(current);
      steps.push({
        stepNumber: stepNum++,
        title: `Final Prime Factor`,
        expression: `${current} is prime`,
        explanation: `Remaining quotient ${current} is itself a prime number.`,
        ruleApplied: 'Prime Identification',
      });
    }

    // Format like 2^3 * 3^2
    const counts: Record<number, number> = {};
    for (const f of factors) counts[f] = (counts[f] || 0) + 1;
    const formatted = Object.entries(counts)
      .map(([base, exp]) => (exp > 1 ? `${base}^${exp}` : base))
      .join(' * ');

    return { factors, steps, formatted };
  }

  /**
   * Calculates Greatest Common Divisor (GCD) using Euclidean Algorithm with full steps.
   */
  public gcd(a: number, b: number): { gcd: number; steps: MathStep[] } {
    let x = Math.abs(Math.floor(a));
    let y = Math.abs(Math.floor(b));
    const steps: MathStep[] = [];
    let stepNum = 1;

    steps.push({
      stepNumber: stepNum++,
      title: 'Euclidean Algorithm Initialization',
      expression: `gcd(${x}, ${y})`,
      explanation: `Find greatest common divisor between ${x} and ${y} using successive division.`,
      ruleApplied: 'Euclidean Algorithm',
    });

    while (y !== 0) {
      const quotient = Math.floor(x / y);
      const remainder = x % y;
      steps.push({
        stepNumber: stepNum++,
        title: `Division Step`,
        expression: `${x} = ${y} * ${quotient} + ${remainder}`,
        explanation: `Divide ${x} by ${y}: quotient is ${quotient}, remainder is ${remainder}.`,
        ruleApplied: 'Division Theorem',
      });
      x = y;
      y = remainder;
    }

    steps.push({
      stepNumber: stepNum,
      title: 'Result Found',
      expression: `gcd(${a}, ${b}) = ${x}`,
      explanation: `When remainder becomes 0, the last non-zero divisor ${x} is the GCD.`,
      ruleApplied: 'GCD Termination',
    });

    return { gcd: x, steps };
  }

  /**
   * Calculates Least Common Multiple (LCM) with steps.
   */
  public lcm(a: number, b: number): { lcm: number; steps: MathStep[] } {
    const { gcd, steps } = this.gcd(a, b);
    const absA = Math.abs(a);
    const absB = Math.abs(b);
    const lcmValue = gcd === 0 ? 0 : (absA * absB) / gcd;

    steps.push({
      stepNumber: steps.length + 1,
      title: 'Apply LCM Formula',
      expression: `lcm(a, b) = (|a| * |b|) / gcd(a, b) = (${absA} * ${absB}) / ${gcd} = ${lcmValue}`,
      explanation: 'Use relation between GCD and LCM to compute the least common multiple.',
      ruleApplied: 'LCM Theorem: a*b = gcd(a,b)*lcm(a,b)',
    });

    return { lcm: lcmValue, steps };
  }

  /**
   * Converts between number bases (binary, octal, decimal, hexadecimal) with steps.
   */
  public convertBase(
    value: string,
    fromBase: number,
    toBase: number
  ): { result: string; steps: MathStep[] } {
    const steps: MathStep[] = [];
    const baseNames: Record<number, string> = {
      2: 'Binary (base 2)',
      8: 'Octal (base 8)',
      10: 'Decimal (base 10)',
      16: 'Hexadecimal (base 16)',
    };

    steps.push({
      stepNumber: 1,
      title: 'Base Conversion Setup',
      expression: `${value}_${fromBase} -> base ${toBase}`,
      explanation: `Convert ${value} from ${baseNames[fromBase] || 'base ' + fromBase} to ${
        baseNames[toBase] || 'base ' + toBase
      }.`,
      ruleApplied: 'Positional Number System',
    });

    // Step 1: to Decimal
    const decimalValue = parseInt(value, fromBase);
    if (isNaN(decimalValue)) {
      throw new Error(`Invalid number ${value} for base ${fromBase}`);
    }

    if (fromBase !== 10) {
      steps.push({
        stepNumber: 2,
        title: 'Convert to Decimal (Base 10)',
        expression: `${value}_${fromBase} = ${decimalValue}_10`,
        explanation: `Sum each digit multiplied by ${fromBase}^position to find the decimal equivalent.`,
        ruleApplied: 'Polynomial Expansion',
      });
    }

    // Step 2: to Target Base
    const targetResult = decimalValue.toString(toBase).toUpperCase();
    steps.push({
      stepNumber: steps.length + 1,
      title: `Convert Decimal to Base ${toBase}`,
      expression: `${decimalValue}_10 = ${targetResult}_${toBase}`,
      explanation: `Successively divide by ${toBase} and collect remainders in reverse order.`,
      ruleApplied: 'Repeated Division / Radix Conversion',
    });

    return { result: targetResult, steps };
  }

  // --- Private Tokenizer & Expression Parser ---
  private tokenize(expr: string): string[] {
    const tokens: string[] = [];
    let i = 0;
    while (i < expr.length) {
      const c = expr[i];
      if ('+-*/^()'.includes(c)) {
        tokens.push(c);
        i++;
      } else if (/[0-9.]/.test(c)) {
        let num = '';
        while (i < expr.length && /[0-9.]/.test(expr[i])) {
          num += expr[i];
          i++;
        }
        tokens.push(num);
      } else {
        i++;
      }
    }
    return tokens;
  }

  private evaluateTokens(
    tokens: string[],
    steps: MathStep[],
    nextStepNum: () => number
  ): number {
    // Shunting-yard algorithm to RPN
    const outputQueue: string[] = [];
    const operatorStack: string[] = [];
    const precedence: Record<string, number> = { '+': 1, '-': 1, '*': 2, '/': 2, '^': 3 };

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      if (!isNaN(Number(token))) {
        outputQueue.push(token);
      } else if ('+-*/^'.includes(token)) {
        // Handle unary minus
        if (token === '-' && (i === 0 || '(*+-/^'.includes(tokens[i - 1]))) {
          outputQueue.push('0'); // transform -x into 0 - x
        }
        while (
          operatorStack.length > 0 &&
          operatorStack[operatorStack.length - 1] !== '(' &&
          precedence[operatorStack[operatorStack.length - 1]] >= precedence[token]
        ) {
          outputQueue.push(operatorStack.pop()!);
        }
        operatorStack.push(token);
      } else if (token === '(') {
        operatorStack.push(token);
      } else if (token === ')') {
        while (operatorStack.length > 0 && operatorStack[operatorStack.length - 1] !== '(') {
          outputQueue.push(operatorStack.pop()!);
        }
        if (operatorStack.length > 0 && operatorStack[operatorStack.length - 1] === '(') {
          operatorStack.pop();
        }
      }
    }

    while (operatorStack.length > 0) {
      outputQueue.push(operatorStack.pop()!);
    }

    // Evaluate RPN
    const stack: number[] = [];
    for (const token of outputQueue) {
      if (!isNaN(Number(token))) {
        stack.push(Number(token));
      } else {
        const b = stack.pop() ?? 0;
        const a = stack.pop() ?? 0;
        let res = 0;
        if (token === '+') res = a + b;
        else if (token === '-') res = a - b;
        else if (token === '*') res = a * b;
        else if (token === '/') {
          if (b === 0) throw new Error('Division by zero encountered.');
          res = a / b;
        } else if (token === '^') res = Math.pow(a, b);

        steps.push({
          stepNumber: nextStepNum(),
          title: `Apply Operation '${token}'`,
          expression: `${a} ${token} ${b} = ${res}`,
          explanation: `Evaluated ${a} ${token} ${b} = ${res}.`,
          ruleApplied: `Arithmetic Operation (${token})`,
        });
        stack.push(res);
      }
    }

    return stack[0] ?? 0;
  }
}
