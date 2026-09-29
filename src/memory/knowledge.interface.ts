export type KnowledgeDomain = 'study' | 'projects' | 'goals' | 'schedule' | 'knowledge';

export interface KnowledgeNode {
  id: string;
  domain: KnowledgeDomain;
  category: string; // e.g., 'mathematics', 'let', 'thesis', 'tuklas', 'jarvis'
  title: string;
  content: string;
  sourceUri?: string;
  tags: string[];
  relationships: {
    nodeId: string;
    relation: string; // e.g. 'prerequisite_of', 'references', 'component_of'
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface IKnowledgeStore {
  index(node: Omit<KnowledgeNode, 'id' | 'createdAt' | 'updatedAt'>): Promise<KnowledgeNode>;
  get(id: string): Promise<KnowledgeNode | null>;
  search(query: string, domain?: KnowledgeDomain): Promise<KnowledgeNode[]>;
  getByCategory(domain: KnowledgeDomain, category: string): Promise<KnowledgeNode[]>;
}
