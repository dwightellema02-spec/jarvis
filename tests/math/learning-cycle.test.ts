import { describe, it, expect } from 'vitest';
import { LearningCycleEngine } from '../../src/math/index.js';

describe('Phase 7 - Socratic Learning Cycle Engine', () => {
  const engine = new LearningCycleEngine();
  const userId = 'student_test_1';

  it('Step 1 (Assess): should generate diagnostic assessment for algebra', () => {
    const assessment = engine.generateAssessment(userId, 'algebra');
    expect(assessment.domain).toBe('algebra');
    expect(assessment.totalProblems).toBeGreaterThan(0);
    expect(assessment.problems[0].question).toBeDefined();
    expect(assessment.problems[0].prerequisites.length).toBeGreaterThan(0);
  });

  it('Step 2 (Identify Weaknesses): should diagnose weaknesses and build remediation plan on incorrect answers', () => {
    const assessment = engine.generateAssessment(userId, 'algebra');
    const p1 = assessment.problems[0];
    const p2 = assessment.problems[1];

    // Submit wrong answer for p1, correct for p2
    const diagnosis = engine.diagnoseAssessment(userId, 'algebra', [
      { problemId: p1.id, studentAnswer: 'wrong_value' },
      { problemId: p2.id, studentAnswer: String(p2.correctAnswer) },
    ]);

    expect(diagnosis.passed).toBe(false);
    expect(diagnosis.weaknessTopics).toContain(p1.topic);
    expect(diagnosis.masteredTopics).toContain(p2.topic);
    expect(diagnosis.remediationPlan.length).toBeGreaterThan(0);
    expect(diagnosis.remediationPlan[0].recommendedActions.length).toBeGreaterThan(0);
  });

  it('Step 3 (Teach Prerequisite): should provide theoretical remediation for identified weakness', () => {
    const teaching = engine.teachPrerequisite('Isolating variables');
    expect(teaching.topic).toBe('Isolating variables');
    expect(teaching.conceptExplanation).toBeDefined();
    expect(teaching.rulesAndFormulas.length).toBeGreaterThan(0);
    expect(teaching.tips.length).toBeGreaterThan(0);
  });

  it('Step 4 (Worked Example): should provide step-by-step worked example with takeaways', () => {
    const worked = engine.getWorkedExample('algebra', 'Quadratic Equations');
    expect(worked.steps.length).toBeGreaterThan(2);
    expect(worked.conceptSummary).toBeDefined();
    expect(worked.keyTakeaways.length).toBeGreaterThan(0);
    expect(worked.finalAnswer).toBeDefined();
  });

  it('Step 5 & 6 (Practice & Check): should analyze incorrect answer and recommend worked example', () => {
    const evalRes = engine.checkAnswer(
      userId,
      'algebra',
      '12', // student submitted 12
      '7',  // expected answer was 7
      'Linear Equations'
    );

    expect(evalRes.isCorrect).toBe(false);
    expect(evalRes.score).toBe(0.0);
    expect(evalRes.identifiedWeaknesses).toContain('Linear Equations');
    expect(evalRes.mistakeExplanation).toContain('Your answer was "12"');
    expect(evalRes.nextRecommendedStep).toBe('worked_example');
    expect(evalRes.workedExample).toBeDefined();
  });

  it('Step 7 & 8 (Repeat & Mastery): should achieve mastery after consecutive correct solutions', () => {
    // Answer correctly three times consecutively
    engine.checkAnswer(userId, 'algebra', '7', '7', 'Linear Equations');
    engine.checkAnswer(userId, 'algebra', '7', '7', 'Linear Equations');
    const finalEval = engine.checkAnswer(userId, 'algebra', '7', '7', 'Linear Equations');

    expect(finalEval.isCorrect).toBe(true);
    expect(finalEval.score).toBe(1.0);
    expect(finalEval.nextRecommendedStep).toBe('mastery_achieved');

    const mastery = engine.getUserMastery(userId, 'algebra');
    expect(mastery.currentPhase).toBe('mastery_achieved');
    expect(mastery.masteredTopics).toContain('Linear Equations');
  });
});
