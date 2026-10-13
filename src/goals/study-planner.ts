import { StudyPlan, StudyTopic } from './goal.interface.js';

export class StudyPlanner {
  private plans: Map<string, StudyPlan> = new Map();

  constructor() {
    this.seedDefaultStudyPlans();
  }

  public listPlans(): StudyPlan[] {
    return Array.from(this.plans.values());
  }

  public getPlan(id: string): StudyPlan | undefined {
    return this.plans.get(id);
  }

  public createPlan(title: string, targetExamOrGoal: string, topics: Array<Omit<StudyTopic, 'id' | 'repetitionIntervalDays' | 'nextReviewDate' | 'reviewCount'>>, dailyHoursTarget: number = 2): StudyPlan {
    const id = `study_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const today = new Date().toISOString().split('T')[0];

    const formattedTopics: StudyTopic[] = topics.map((t, idx) => ({
      id: `topic_${id}_${idx + 1}`,
      subject: t.subject,
      topic: t.topic,
      masteryLevel: Math.max(0, Math.min(100, t.masteryLevel || 0)),
      repetitionIntervalDays: 1,
      nextReviewDate: today,
      reviewCount: 0,
      notes: t.notes || '',
    }));

    const totalMastery = formattedTopics.reduce((acc, t) => acc + t.masteryLevel, 0);
    const overallMasteryPct = formattedTopics.length > 0 ? Math.round(totalMastery / formattedTopics.length) : 0;

    const plan: StudyPlan = {
      id,
      title,
      targetExamOrGoal,
      topics: formattedTopics,
      dailyHoursTarget,
      totalStudyHours: 0,
      overallMasteryPct,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.plans.set(id, plan);
    return plan;
  }

  /**
   * Retrieves all study topics due for spaced repetition review today or earlier.
   */
  public getDueReviewQueue(planId?: string): StudyTopic[] {
    const today = new Date().toISOString().split('T')[0];
    const results: StudyTopic[] = [];

    const targetPlans = planId ? [this.plans.get(planId)].filter(Boolean) as StudyPlan[] : Array.from(this.plans.values());

    for (const plan of targetPlans) {
      for (const topic of plan.topics) {
        if (topic.nextReviewDate <= today) {
          results.push(topic);
        }
      }
    }

    return results.sort((a, b) => a.masteryLevel - b.masteryLevel);
  }

  /**
   * Records a study session on a topic, advancing the Ebbinghaus spaced repetition interval (1d -> 3d -> 7d -> 14d -> 30d).
   */
  public recordStudySession(planId: string, topicId: string, minutesSpent: number, scoreOrSelfRating: number): { topic: StudyTopic; plan: StudyPlan } {
    const plan = this.plans.get(planId);
    if (!plan) {
      throw new Error(`Study plan "${planId}" not found`);
    }

    const topic = plan.topics.find((t) => t.id === topicId);
    if (!topic) {
      throw new Error(`Topic "${topicId}" not found in study plan "${planId}"`);
    }

    topic.reviewCount += 1;
    topic.lastReviewedAt = new Date().toISOString();

    // Spaced repetition interval progression (Ebbinghaus curve)
    if (scoreOrSelfRating >= 75) {
      // Successful recall: advance interval
      const intervals = [1, 3, 7, 14, 30, 60];
      const currentIndex = intervals.indexOf(topic.repetitionIntervalDays);
      const nextInterval = currentIndex >= 0 && currentIndex < intervals.length - 1
        ? intervals[currentIndex + 1]
        : 30;
      topic.repetitionIntervalDays = nextInterval;
      topic.masteryLevel = Math.min(100, Math.round(topic.masteryLevel + (100 - topic.masteryLevel) * 0.3));
    } else {
      // Failed recall or weak: reset to 1 day interval for immediate review
      topic.repetitionIntervalDays = 1;
      topic.masteryLevel = Math.max(20, Math.round(topic.masteryLevel * 0.8));
    }

    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + topic.repetitionIntervalDays);
    topic.nextReviewDate = nextDate.toISOString().split('T')[0];

    // Update plan totals
    plan.totalStudyHours += Math.round((minutesSpent / 60) * 10) / 10;
    const totalMastery = plan.topics.reduce((acc, t) => acc + t.masteryLevel, 0);
    plan.overallMasteryPct = Math.round(totalMastery / plan.topics.length);
    plan.updatedAt = new Date().toISOString();

    return { topic, plan };
  }

  private seedDefaultStudyPlans(): void {
    const today = new Date().toISOString().split('T')[0];
    const letPlan: StudyPlan = {
      id: 'plan_let_math_2026',
      title: 'PRC LET Licensure Examination - Mathematics Specialization',
      targetExamOrGoal: 'PRC Board Licensure Examination for Professional Teachers (BLEPT)',
      dailyHoursTarget: 2.5,
      totalStudyHours: 42.0,
      overallMasteryPct: 84,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      topics: [
        {
          id: 'topic_let_1',
          subject: 'College Algebra',
          topic: 'Quadratic Equations, Discriminants & Polynomial Factoring',
          masteryLevel: 92,
          repetitionIntervalDays: 7,
          nextReviewDate: today,
          reviewCount: 4,
          notes: 'Mastered standard form ax^2 + bx + c = 0, discriminant D = b^2 - 4ac rules for real/imaginary roots.',
        },
        {
          id: 'topic_let_2',
          subject: 'Calculus & Analysis',
          topic: 'Differential Calculus & Maxima/Minima Optimization',
          masteryLevel: 78,
          repetitionIntervalDays: 3,
          nextReviewDate: today,
          reviewCount: 3,
          notes: 'Focus on setting first derivative dy/dx = 0 and applying second derivative concavity test.',
        },
        {
          id: 'topic_let_3',
          subject: 'Statistics & Probability',
          topic: 'Measures of Central Tendency & Quartile Deviations',
          masteryLevel: 88,
          repetitionIntervalDays: 14,
          nextReviewDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          reviewCount: 5,
          notes: 'Aligned with DepEd M10SP-IVa-1 and LET General Education math competencies.',
        },
        {
          id: 'topic_let_4',
          subject: 'Number Theory',
          topic: 'Euclidean Algorithm, Modular Arithmetic & Diophantine Equations',
          masteryLevel: 76,
          repetitionIntervalDays: 1,
          nextReviewDate: today,
          reviewCount: 2,
          notes: 'Key focus on linear congruences and modular inverses.',
        },
      ],
    };

    this.plans.set(letPlan.id, letPlan);
  }
}
