export type MathDomain =
  | 'arithmetic'
  | 'algebra'
  | 'advanced_algebra'
  | 'geometry'
  | 'solid_geometry'
  | 'trigonometry'
  | 'precalculus'
  | 'differential_calculus'
  | 'integral_calculus'
  | 'differential_equations'
  | 'statistics'
  | 'logic'
  | 'sets'
  | 'number_systems';

export type MathDifficulty = 'introductory' | 'intermediate' | 'advanced' | 'let_majorship';

export interface MathStep {
  stepNumber: number;
  title: string;
  expression: string;
  explanation: string;
  ruleApplied?: string;
}

export interface MathProblem {
  id: string;
  domain: MathDomain;
  topic: string;
  difficulty: MathDifficulty;
  question: string;
  options?: { key: 'A' | 'B' | 'C' | 'D'; text: string }[];
  correctOptionKey?: 'A' | 'B' | 'C' | 'D';
  correctAnswer: string | number;
  steps: MathStep[];
  explanation: string;
  distractorExplanations?: Record<string, string>;
  prerequisites: string[];
}

export interface MathEvaluationInput {
  problemId?: string;
  domain: MathDomain;
  topic: string;
  studentAnswer: string | number;
  expectedAnswer?: string | number;
}

export interface MathEvaluationResult {
  isCorrect: boolean;
  studentAnswer: string;
  expectedAnswer: string;
  score: number; // 0.0 to 1.0
  identifiedWeaknesses: string[];
  mistakeExplanation?: string;
  remedialConcept?: string;
  nextRecommendedStep: 'teach_prerequisite' | 'worked_example' | 'practice_more' | 'mastery_achieved';
  workedExample?: WorkedExample;
}

export interface WorkedExample {
  id: string;
  domain: MathDomain;
  topic: string;
  difficulty: MathDifficulty;
  problem: string;
  conceptSummary: string;
  steps: MathStep[];
  finalAnswer: string;
  keyTakeaways: string[];
}

export interface LearningAssessment {
  assessmentId: string;
  userId: string;
  domain: MathDomain;
  totalProblems: number;
  problems: MathProblem[];
  generatedAt: string;
}

export interface LearningDiagnosticResult {
  userId: string;
  domain: MathDomain;
  score: number; // e.g. 8/10
  masteryPercent: number; // 0 - 100
  passed: boolean;
  masteredTopics: string[];
  weaknessTopics: string[];
  remediationPlan: {
    prerequisiteTopic: string;
    description: string;
    recommendedActions: string[];
  }[];
}

export interface LetCompetency {
  code: string;
  domain: MathDomain;
  title: string;
  weightPercent: number;
  description: string;
}
