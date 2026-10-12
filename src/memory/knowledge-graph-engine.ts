import {
  KnowledgeNode,
  SecondBrainTree,
  SecondBrainTreeNode,
  SemanticSearchResult,
  SemanticSearchOptions,
} from './knowledge.interface.js';

export function computeSemanticSimilarity(
  query: string,
  node: KnowledgeNode
): { score: number; snippet: string } {
  const queryLower = query.toLowerCase();
  const queryWords = queryLower.split(/\W+/).filter((w) => w.length > 2);

  if (queryWords.length === 0) {
    return { score: 0.1, snippet: node.content.substring(0, 100) };
  }

  const titleLower = node.title.toLowerCase();
  const contentLower = node.content.toLowerCase();
  const categoryLower = node.category.toLowerCase();
  const tagsLower = node.tags.map((t) => t.toLowerCase());

  let score = 0;
  let matchSnippet = '';

  // 1. Direct title match
  if (titleLower.includes(queryLower) || queryLower.includes(titleLower)) {
    score += 4.0;
  }

  // 2. Category match
  if (queryLower.includes(categoryLower)) {
    score += 2.0;
  }

  // 3. Word token matches
  for (const word of queryWords) {
    if (titleLower.includes(word)) {
      score += 2.0;
    }
    if (tagsLower.includes(word)) {
      score += 1.5;
    }
    if (contentLower.includes(word)) {
      score += 1.0;
      if (!matchSnippet) {
        const idx = contentLower.indexOf(word);
        const start = Math.max(0, idx - 40);
        const end = Math.min(node.content.length, idx + 100);
        matchSnippet = (start > 0 ? '...' : '') + node.content.substring(start, end) + (end < node.content.length ? '...' : '');
      }
    }
  }

  if (!matchSnippet) {
    matchSnippet = node.content.substring(0, 120) + (node.content.length > 120 ? '...' : '');
  }

  // Boost for nodes with rich relationship connectivity
  score *= 1.0 + Math.min(0.5, node.relationships.length * 0.1);

  return { score, snippet: matchSnippet };
}

export function buildSecondBrainTree(nodes: KnowledgeNode[]): SecondBrainTree {
  const toTreeNode = (n: KnowledgeNode): SecondBrainTreeNode => ({
    id: n.id,
    title: n.title,
    domain: n.domain,
    category: n.category,
    tags: n.tags,
    relationshipCount: n.relationships.length,
  });

  const tree: SecondBrainTree = {
    root: 'YOU',
    study: {
      mathematics: [],
      let: [],
      thesis: [],
      other: [],
    },
    projects: {
      tuklas: [],
      jarvis: [],
      other: [],
    },
    goals: [],
    schedule: [],
    knowledge: [],
    totalNodes: nodes.length,
  };

  for (const node of nodes) {
    const item = toTreeNode(node);
    if (node.domain === 'study') {
      const cat = node.category.toLowerCase();
      if (cat.includes('math')) {
        tree.study.mathematics.push(item);
      } else if (cat.includes('let')) {
        tree.study.let.push(item);
      } else if (cat.includes('thesis')) {
        tree.study.thesis.push(item);
      } else {
        tree.study.other.push(item);
      }
    } else if (node.domain === 'projects') {
      const cat = node.category.toLowerCase();
      if (cat.includes('tuklas')) {
        tree.projects.tuklas.push(item);
      } else if (cat.includes('jarvis')) {
        tree.projects.jarvis.push(item);
      } else {
        tree.projects.other.push(item);
      }
    } else if (node.domain === 'goals') {
      tree.goals.push(item);
    } else if (node.domain === 'schedule') {
      tree.schedule.push(item);
    } else if (node.domain === 'knowledge') {
      tree.knowledge.push(item);
    }
  }

  return tree;
}

export function formatKnowledgeForPrompt(results: SemanticSearchResult[]): string {
  if (results.length === 0) {
    return '[SECOND BRAIN KNOWLEDGE: No matching knowledge documents or notes found.]';
  }

  const entries = results.map((r, i) => {
    let out = `${i + 1}. [${r.node.domain.toUpperCase()} / ${r.node.category}] "${r.node.title}": ${r.node.content}`;
    if (r.relatedNodes && r.relatedNodes.length > 0) {
      const relations = r.relatedNodes.map((rel) => `"${rel.title}" (${rel.domain})`).join(', ');
      out += ` [Connected: ${relations}]`;
    }
    return out;
  });

  return `
[SECOND BRAIN KNOWLEDGE RETRIEVED FROM LONG-TERM REPOSITORY]
${entries.join('\n\n')}
(Directive: Use these Second Brain knowledge nodes for factual, pedagogical, and project continuity.)
`.trim();
}
