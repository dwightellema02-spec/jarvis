/**
 * JARVIS Phase 12 - Tuklas EdTech Integration Interfaces
 * Aligned with DepEd Philippine K-12 and Higher Education Competency Standards
 */

export interface TuklasLesson {
  id: string;
  title: string;
  subject: string;
  gradeLevel: string; // e.g., 'Grade 7', 'Grade 10', 'College'
  competencyCode: string; // e.g., 'M7AL-IIa-1', 'LET-MATH-02'
  summary: string;
  objectives: string[];
  prerequisiteCompetencies: string[];
  contentMarkdown: string;
  estimatedMinutes: number;
  tags: string[];
  author: string;
  createdAt: string;
  updatedAt?: string;
}

export interface TuklasLessonFilter {
  query?: string;
  subject?: string;
  gradeLevel?: string;
  competencyCode?: string;
  limit?: number;
}

export interface StudentProgress {
  studentId: string;
  studentName: string;
  enrolledGrade: string;
  overallMasteryPercent: number;
  streakDays: number;
  completedLessonIds: string[];
  competencyScores: Record<string, number>; // competencyCode -> score 0-100
  recentActivity: Array<{
    activityId: string;
    type: 'lesson' | 'practice' | 'assessment';
    title: string;
    score?: number;
    timestamp: string;
  }>;
  lastActiveAt: string;
}

export interface PracticeItem {
  id: string;
  competencyCode: string;
  question: string;
  options?: string[];
  correctAnswer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  hint: string;
  explanation: string;
}

export interface PracticeGenerationRequest {
  competencyCode?: string;
  subject?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  count?: number;
}

export interface PracticeSet {
  id: string;
  competencyCode: string;
  difficulty: 'easy' | 'medium' | 'hard';
  generatedAt: string;
  items: PracticeItem[];
}

export interface AssessmentSubmission {
  assessmentId: string;
  studentId: string;
  answers: Record<string, string>; // itemId -> answer
}

export interface AssessmentItemEvaluation {
  itemId: string;
  question: string;
  studentAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation: string;
}

export interface AssessmentEvaluationResult {
  assessmentId: string;
  studentId: string;
  totalItems: number;
  score: number;
  percentage: number;
  passed: boolean;
  evaluatedAt: string;
  details: AssessmentItemEvaluation[];
}

export interface MistakeAnalysisRequest {
  studentId?: string;
  competencyCode: string;
  question: string;
  wrongAnswer: string;
  correctAnswer: string;
}

export interface MistakeAnalysisResult {
  competencyCode: string;
  errorType: 'conceptual' | 'procedural' | 'computational' | 'misreading';
  misconceptionDescription: string;
  remedialExplanation: string;
  recommendedLessonId?: string;
  recommendedLessonTitle?: string;
  practiceSuggestions: string[];
}

export interface AnonymizedStudentPerformance {
  anonymizedId: string; // Hash / pseudo ID compliant with Philippine Data Privacy Act
  gradeLevel: string;
  score: number;
  modulesCompleted: number;
  timeSpentMinutes: number;
  mastered: boolean;
}

export interface CompetencyCohortMetric {
  code: string;
  description: string;
  masteryRate: number; // 0.0 - 1.0
  difficultyIndex: number; // 0.0 - 1.0
  discriminationIndex: number; // -1.0 - 1.0
}

export interface TuklasCohortResearchData {
  cohortId: string;
  cohortName: string;
  subject: string;
  gradeLevel: string;
  studentCount: number;
  averageScore: number;
  passingRate: number;
  competencyMetrics: CompetencyCohortMetric[];
  records: AnonymizedStudentPerformance[];
  extractedAt: string;
}

export interface TeacherAssignmentRequest {
  classId: string;
  title: string;
  lessonId?: string;
  competencyCode: string;
  dueDate: string;
  targetStudentIds?: string[];
  instructions?: string;
}

export interface TeacherAssignment {
  id: string;
  classId: string;
  title: string;
  lessonId?: string;
  competencyCode: string;
  assignedBy: string;
  dueDate: string;
  status: 'active' | 'completed' | 'archived';
  instructions?: string;
  createdAt: string;
}

export interface TuklasClientConfig {
  apiUrl?: string;
  apiKey?: string;
  mode?: 'local' | 'remote';
  timeoutMs?: number;
}

export interface TuklasSystemStatus {
  mode: 'local' | 'remote';
  connected: boolean;
  endpoint: string;
  totalLessons: number;
  totalStudents: number;
  totalAssignments: number;
  version: string;
}
