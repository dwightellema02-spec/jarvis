export type KnowledgeDomain = 'study' | 'projects' | 'goals' | 'schedule' | 'knowledge';

export interface KnowledgeRelationship {
  nodeId: string;
  relation: string; // e.g. 'prerequisite_of', 'references', 'component_of', 'depends_on', 'subtopic_of'
}

export interface KnowledgeNode {
  id: string;
  domain: KnowledgeDomain;
  category: string; // e.g., 'mathematics', 'let', 'thesis', 'tuklas', 'jarvis'
  title: string;
  content: string;
  sourceUri?: string;
  tags: string[];
  relationships: KnowledgeRelationship[];
  createdAt: string;
  updatedAt: string;
}

export interface SecondBrainTreeNode {
  id: string;
  title: string;
  domain: KnowledgeDomain;
  category: string;
  tags: string[];
  children?: SecondBrainTreeNode[];
  relationshipCount: number;
}

export interface SecondBrainTree {
  root: string; // "YOU"
  study: {
    mathematics: SecondBrainTreeNode[];
    let: SecondBrainTreeNode[];
    thesis: SecondBrainTreeNode[];
    other: SecondBrainTreeNode[];
  };
  projects: {
    tuklas: SecondBrainTreeNode[];
    jarvis: SecondBrainTreeNode[];
    other: SecondBrainTreeNode[];
  };
  goals: SecondBrainTreeNode[];
  schedule: SecondBrainTreeNode[];
  knowledge: SecondBrainTreeNode[];
  totalNodes: number;
}

export interface SemanticSearchResult {
  node: KnowledgeNode;
  score: number;
  matchSnippet: string;
  relatedNodes?: KnowledgeNode[];
}

export interface SemanticSearchOptions {
  domain?: KnowledgeDomain;
  category?: string;
  limit?: number;
  minScore?: number;
  includeRelated?: boolean;
}

export interface IKnowledgeStore {
  index(node: Omit<KnowledgeNode, 'id' | 'createdAt' | 'updatedAt'>): Promise<KnowledgeNode>;
  get(id: string): Promise<KnowledgeNode | null>;
  search(query: string, domain?: KnowledgeDomain): Promise<KnowledgeNode[]>;
  getByCategory(domain: KnowledgeDomain, category: string): Promise<KnowledgeNode[]>;
  update(id: string, updates: Partial<KnowledgeNode>): Promise<KnowledgeNode | null>;
  delete(id: string): Promise<boolean>;
  addRelationship(fromNodeId: string, toNodeId: string, relation: string): Promise<boolean>;
  getTree(): Promise<SecondBrainTree>;
  semanticSearch(query: string, options?: SemanticSearchOptions): Promise<SemanticSearchResult[]>;
}
