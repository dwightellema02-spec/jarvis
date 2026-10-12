import { describe, it, expect } from 'vitest';
import { LetReviewEngine } from '../../src/math/index.js';

describe('Phase 7 - Philippine BLEPT LET Mathematics Majorship Review Engine', () => {
  const letEngine = new LetReviewEngine();

  it('should define Table of Specifications aligned with BLEPT competencies', () => {
    const competencies = letEngine.getCompetencies();
    expect(competencies.length).toBe(6);

    const codes = competencies.map((c) => c.code);
    expect(codes).toContain('LET-MATH-01'); // Number Theory & Arithmetic
    expect(codes).toContain('LET-MATH-02'); // Algebra
    expect(codes).toContain('LET-MATH-03'); // Geometry & Trigonometry
    expect(codes).toContain('LET-MATH-04'); // Calculus & DE
    expect(codes).toContain('LET-MATH-05'); // Probability & Stats
    expect(codes).toContain('LET-MATH-06'); // Logic & Modern Math

    const totalWeight = competencies.reduce((acc, c) => acc + c.weightPercent, 0);
    expect(totalWeight).toBe(100);
  });

  it('should have a question bank of at least 20 board-style problems with options and distractor rationales', () => {
    const questions = letEngine.getAllQuestions();
    expect(questions.length).toBeGreaterThanOrEqual(20);

    for (const q of questions) {
      expect(q.options?.length).toBe(4);
      expect(q.correctOptionKey).toBeDefined();
      expect(q.distractorExplanations).toBeDefined();
      expect(Object.keys(q.distractorExplanations!).length).toBeGreaterThanOrEqual(3);
      expect(q.prerequisites.length).toBeGreaterThan(0);
      expect(q.steps.length).toBeGreaterThan(0);
    }
  });

  it('should generate a 20-item Mock Examination', () => {
    const mockExam = letEngine.generateMockExam();
    expect(mockExam.totalQuestions).toBe(20);
    expect(mockExam.competenciesCovered.length).toBe(6);
    expect(mockExam.questions.length).toBe(20);
  });

  it('should evaluate an exam with passing score (>= 75%)', () => {
    const questions = letEngine.getAllQuestions();
    const answers: Record<string, string> = {};

    // Answer 16 correctly out of 20 = 80.0% => PASSED
    questions.forEach((q, idx) => {
      if (idx < 16) {
        answers[q.id] = q.correctOptionKey!;
      } else {
        answers[q.id] = 'D'; // wrong or dummy
      }
    });

    const evalResult = letEngine.evaluateExam(answers);
    expect(evalResult.score).toBeGreaterThanOrEqual(16);
    expect(evalResult.percentage).toBeGreaterThanOrEqual(75.0);
    expect(evalResult.passed).toBe(true);
    expect(evalResult.competencyBreakdown['LET-MATH-01']).toBeDefined();
  });

  it('should evaluate an exam with failing score and provide distractor rationales', () => {
    const questions = letEngine.getAllQuestions();
    const answers: Record<string, string> = {};

    // Submit 'A' for Q01 (wrong option: A is distractor for Q01)
    answers['LET-Q01'] = 'A';

    const evalResult = letEngine.evaluateExam(answers);
    expect(evalResult.passed).toBe(false);

    const q01Eval = evalResult.questionEvaluations.find((q) => q.questionId === 'LET-Q01');
    expect(q01Eval).toBeDefined();
    expect(q01Eval?.isCorrect).toBe(false);
    expect(q01Eval?.selectedDistractorRationale).toContain('Erroneously assumed 202 is divisible by 4');
  });
});
