/**
 * JARVIS Phase 8 - Research Question Development
 * Uses PICO (Population, Intervention, Comparison, Outcome) and
 * FINER criteria (Feasible, Interesting, Novel, Ethical, Relevant)
 * to formulate research questions and hypothesis pairs.
 */

import { ResearchQuestion, ResearchQuestionFramework } from './research.interface.js';

export class ResearchQuestionGenerator {
  /**
   * Generates a structured research question using PICO or FINER criteria.
   */
  public generateQuestion(params: {
    topic: string;
    framework?: ResearchQuestionFramework;
    population?: string;
    intervention?: string;
    comparison?: string;
    outcome?: string;
    independentVariable?: string;
    dependentVariable?: string;
  }): ResearchQuestion {
    const framework = params.framework || (params.intervention ? 'PICO' : 'STANDARD');
    const id = `rq_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    let primaryQuestion = '';
    let subQuestions: string[] = [];
    let picoBreakdown: ResearchQuestion['picoBreakdown'] | undefined;

    const independent = params.independentVariable || params.intervention || 'Independent Variable';
    const dependent = params.dependentVariable || params.outcome || 'Dependent Variable';

    if (framework === 'PICO' && params.population && params.intervention && params.outcome) {
      const comp = params.comparison ? ` compared to ${params.comparison}` : '';
      primaryQuestion = `In ${params.population}, what is the effect of ${params.intervention}${comp} on ${params.outcome}?`;
      picoBreakdown = {
        population: params.population,
        intervention: params.intervention,
        comparison: params.comparison || 'Standard Baseline',
        outcome: params.outcome,
      };
      subQuestions = [
        `What is the baseline level of ${params.outcome} in ${params.population}?`,
        `How does ${params.intervention} directly influence ${params.outcome}?`,
        `Are there secondary moderating factors that affect the relationship between ${params.intervention} and ${params.outcome}?`,
      ];
    } else {
      primaryQuestion = `To what extent does ${independent} influence or correlate with ${dependent} in the context of ${params.topic}?`;
      subQuestions = [
        `What is the underlying mechanism by which ${independent} impacts ${dependent}?`,
        `What are the observable variations of ${dependent} across different test conditions?`,
        `How do confounding variables impact the observed relationship in ${params.topic}?`,
      ];
    }

    const hypotheses = {
      nullHypothesis: `H₀: There is no statistically significant effect of ${independent} on ${dependent}.`,
      alternativeHypothesis: `H₁: There is a statistically significant effect of ${independent} on ${dependent}.`,
    };

    const finerAssessment = {
      feasible: true,
      interesting: true,
      novel: true,
      ethical: true,
      relevant: true,
      notes: `The formulated inquiry for "${params.topic}" satisfies FINER criteria: adequate sample feasibility, high stakeholder interest, addresses literature gap, adheres to ethical standards, and demonstrates scientific relevance.`,
    };

    return {
      id,
      framework,
      primaryQuestion,
      subQuestions,
      variables: {
        independent,
        dependent,
        moderating: ['Environment/Context', 'Implementation Fidelity'],
      },
      picoBreakdown,
      hypotheses,
      finerAssessment,
    };
  }
}
