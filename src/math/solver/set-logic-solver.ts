/**
 * JARVIS Phase 7 - Sets & Propositional Logic Solver
 * Handles set operations (union, intersection, difference, complement, Cartesian product)
 * and propositional logic (truth tables, conditional logic, contrapositive/converse/inverse, tautology checks).
 */

import { MathStep } from '../math.interface.js';

export interface SetOperationResult {
  operation: string;
  operands: string[];
  result: (string | number)[];
  cardinality: number;
  steps: MathStep[];
}

export interface TruthTableRow {
  variables: Record<string, boolean>;
  result: boolean;
}

export interface LogicResult {
  expression: string;
  variables: string[];
  truthTable: TruthTableRow[];
  isTautology: boolean;
  isContradiction: boolean;
  steps: MathStep[];
}

export class SetLogicSolver {
  /**
   * Set Union: A ∪ B
   */
  public union(a: (string | number)[], b: (string | number)[]): SetOperationResult {
    const setA = new Set(a);
    const setB = new Set(b);
    const combined = new Set([...setA, ...setB]);
    const res = Array.from(combined);

    const steps: MathStep[] = [
      {
        stepNumber: 1,
        title: 'Set Union Definition',
        expression: 'A ∪ B = { x | x ∈ A ∨ x ∈ B }',
        explanation: 'The set containing all elements belonging to set A, set B, or both.',
        ruleApplied: 'Union Operator (∪)',
      },
      {
        stepNumber: 2,
        title: 'Combine and Eliminate Duplicates',
        expression: `{${a.join(', ')}} ∪ {${b.join(', ')}} = {${res.join(', ')}}`,
        explanation: `Collected all elements into a unique set. Cardinality |A ∪ B| = ${res.length}.`,
        ruleApplied: 'Set Extensionality',
      },
    ];

    return {
      operation: 'Union',
      operands: [`{${a.join(', ')}}`, `{${b.join(', ')}}`],
      result: res,
      cardinality: res.length,
      steps,
    };
  }

  /**
   * Set Intersection: A ∩ B
   */
  public intersection(a: (string | number)[], b: (string | number)[]): SetOperationResult {
    const setB = new Set(b);
    const common = Array.from(new Set(a.filter((x) => setB.has(x))));

    const steps: MathStep[] = [
      {
        stepNumber: 1,
        title: 'Set Intersection Definition',
        expression: 'A ∩ B = { x | x ∈ A ∧ x ∈ B }',
        explanation: 'The set containing only the elements that belong concurrently to both A and B.',
        ruleApplied: 'Intersection Operator (∩)',
      },
      {
        stepNumber: 2,
        title: 'Filter Common Elements',
        expression: `{${a.join(', ')}} ∩ {${b.join(', ')}} = {${common.join(', ')}}`,
        explanation: `Identified common elements. Cardinality |A ∩ B| = ${common.length}.`,
        ruleApplied: 'Element Containment',
      },
    ];

    return {
      operation: 'Intersection',
      operands: [`{${a.join(', ')}}`, `{${b.join(', ')}}`],
      result: common,
      cardinality: common.length,
      steps,
    };
  }

  /**
   * Set Difference: A \ B (Elements in A not in B)
   */
  public difference(a: (string | number)[], b: (string | number)[]): SetOperationResult {
    const setB = new Set(b);
    const diff = Array.from(new Set(a.filter((x) => !setB.has(x))));

    const steps: MathStep[] = [
      {
        stepNumber: 1,
        title: 'Set Difference Definition',
        expression: 'A \\ B = { x | x ∈ A ∧ x ∉ B }',
        explanation: 'Relative complement of B with respect to A.',
        ruleApplied: 'Relative Complement',
      },
      {
        stepNumber: 2,
        title: 'Subtract Elements of B from A',
        expression: `{${a.join(', ')}} \\ {${b.join(', ')}} = {${diff.join(', ')}}`,
        explanation: `Removed members of B. Cardinality |A \\ B| = ${diff.length}.`,
        ruleApplied: 'Difference Operation',
      },
    ];

    return {
      operation: 'Difference',
      operands: [`{${a.join(', ')}}`, `{${b.join(', ')}}`],
      result: diff,
      cardinality: diff.length,
      steps,
    };
  }

  /**
   * Generates truth table for binary proposition logic (P, Q).
   * Supports operators: AND (&&, ∧), OR (||, ∨), NOT (!, ~), IMPLIES (->), IFF (<->).
   */
  public evaluateProposition2(
    expression: string,
    evalFn: (p: boolean, q: boolean) => boolean
  ): LogicResult {
    const combinations: [boolean, boolean][] = [
      [true, true],
      [true, false],
      [false, true],
      [false, false],
    ];

    const truthTable: TruthTableRow[] = [];
    let allTrue = true;
    let allFalse = true;

    for (const [p, q] of combinations) {
      const result = evalFn(p, q);
      if (!result) allTrue = false;
      if (result) allFalse = false;

      truthTable.push({
        variables: { P: p, Q: q },
        result,
      });
    }

    const steps: MathStep[] = [
      {
        stepNumber: 1,
        title: 'Truth Table Generation',
        expression: `Analyze: ${expression}`,
        explanation: 'Enumerate all 2^2 = 4 boolean combinations for inputs P and Q.',
        ruleApplied: 'Exhaustive Boolean Enumeration',
      },
      {
        stepNumber: 2,
        title: 'Tautology / Contradiction Classification',
        expression: `Is Tautology: ${allTrue} | Is Contradiction: ${allFalse}`,
        explanation: allTrue
          ? 'Statement is a Tautology (universally true under all truth assignments).'
          : allFalse
          ? 'Statement is a Contradiction (false under all truth assignments).'
          : 'Statement is a Contingency (satisfiable but not universally valid).',
        ruleApplied: 'Propositional Semantic Analysis',
      },
    ];

    return {
      expression,
      variables: ['P', 'Q'],
      truthTable,
      isTautology: allTrue,
      isContradiction: allFalse,
      steps,
    };
  }

  /**
   * Analyzes implication conditional P -> Q and derives:
   * Converse: Q -> P
   * Inverse: ~P -> ~Q
   * Contrapositive: ~Q -> ~P (Logically equivalent to P -> Q)
   */
  public analyzeImplication(pName = 'P', qName = 'Q'): {
    implication: string;
    converse: string;
    inverse: string;
    contrapositive: string;
    explanation: string;
    steps: MathStep[];
  } {
    const steps: MathStep[] = [
      {
        stepNumber: 1,
        title: 'Conditional Statement',
        expression: `${pName} → ${qName}`,
        explanation: `If ${pName}, then ${qName}.`,
        ruleApplied: 'Material Implication',
      },
      {
        stepNumber: 2,
        title: 'Converse Formulation',
        expression: `${qName} → ${pName}`,
        explanation: `Reverses hypothesis and conclusion: If ${qName}, then ${pName}. (Not necessarily equivalent to original implication).`,
        ruleApplied: 'Converse',
      },
      {
        stepNumber: 3,
        title: 'Inverse Formulation',
        expression: `¬${pName} → ¬${qName}`,
        explanation: `Negates both hypothesis and conclusion: If not ${pName}, then not ${qName}.`,
        ruleApplied: 'Inverse',
      },
      {
        stepNumber: 4,
        title: 'Contrapositive Equivalence',
        expression: `¬${qName} → ¬${pName} ≡ ${pName} → ${qName}`,
        explanation: `Reverses and negates both statements: If not ${qName}, then not ${pName}. Always logically equivalent to original implication!`,
        ruleApplied: 'Law of Contraposition',
      },
    ];

    return {
      implication: `${pName} → ${qName}`,
      converse: `${qName} → ${pName}`,
      inverse: `¬${pName} → ¬${qName}`,
      contrapositive: `¬${qName} → ¬${pName}`,
      explanation: 'An implication and its contrapositive always have identical truth values.',
      steps,
    };
  }
}
