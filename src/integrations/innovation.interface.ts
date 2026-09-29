export interface ProductIdea {
  id: string;
  name: string;
  problemStatement: string;
  targetAudience: string[];
  valueProposition: string;
  keyFeatures: string[];
  competitiveAdvantage?: string;
  stage: 'idea' | 'research' | 'problem_validated' | 'features_defined' | 'mvp_build' | 'launch';
}

export interface IProductInnovationWorkflow {
  evaluateIdea(idea: Omit<ProductIdea, 'id' | 'stage'>): Promise<ProductIdea>;
  advanceStage(ideaId: string, targetStage: ProductIdea['stage']): Promise<ProductIdea>;
}
