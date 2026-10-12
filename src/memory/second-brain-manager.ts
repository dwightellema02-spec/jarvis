import {
  IKnowledgeStore,
  KnowledgeNode,
  KnowledgeDomain,
  SecondBrainTree,
  SemanticSearchResult,
  SemanticSearchOptions,
} from './knowledge.interface.js';
import {
  computeSemanticSimilarity,
  buildSecondBrainTree,
  formatKnowledgeForPrompt,
} from './knowledge-graph-engine.js';
import { createInitialSecondBrainNodes } from './second-brain-seeds.js';
import { PermissionManager } from '../security/permission-manager.js';
import { AuditLogger } from '../audit/audit-logger.js';
import { ResourceType, PermissionLevel, SecurityDecisionType } from '../security/types.js';
import { ValidationError, NotFoundError, PermissionDeniedError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

export interface SecondBrainManagerConfig {
  permissionManager?: PermissionManager;
  auditLogger?: AuditLogger;
  seedWithDefaults?: boolean;
}

export class SecondBrainManager implements IKnowledgeStore {
  private nodes: Map<string, KnowledgeNode> = new Map();
  private permissionManager?: PermissionManager;
  private auditLogger?: AuditLogger;

  constructor(config: SecondBrainManagerConfig = {}) {
    this.permissionManager = config.permissionManager;
    this.auditLogger = config.auditLogger;

    if (config.seedWithDefaults !== false) {
      const initial = createInitialSecondBrainNodes();
      for (const node of initial) {
        this.nodes.set(node.id, JSON.parse(JSON.stringify(node)));
      }
    }

    logger.info(`Second Brain Knowledge Manager initialized with ${this.nodes.size} nodes.`);
  }

  private checkPermission(userId: string, level: PermissionLevel, action: 'read' | 'write' | 'delete'): void {
    if (!this.permissionManager) return;

    const res = this.permissionManager.checkPermission({
      userId,
      resource: ResourceType.DATABASES,
      action,
      requiredLevel: level,
      targetIdentifier: 'second_brain_knowledge',
    });

    if (!res.allowed) {
      throw new PermissionDeniedError(ResourceType.DATABASES, action, level, {
        userId,
        reason: res.reason,
      });
    }
  }

  public async index(
    node: Omit<KnowledgeNode, 'id' | 'createdAt' | 'updatedAt'>,
    userId = 'default_user'
  ): Promise<KnowledgeNode> {
    if (!node.title || node.title.trim().length === 0) {
      throw new ValidationError('Knowledge node title is required');
    }
    if (!node.domain) {
      throw new ValidationError('Knowledge node domain is required');
    }

    this.checkPermission(userId, PermissionLevel.WRITE, 'write');

    const now = new Date().toISOString();
    const id = `node_${node.domain}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const fullNode: KnowledgeNode = {
      ...node,
      id,
      category: node.category || 'general',
      tags: node.tags || [],
      relationships: node.relationships || [],
      createdAt: now,
      updatedAt: now,
    };

    this.nodes.set(id, fullNode);
    logger.info(`Indexed knowledge node [${id}] "${fullNode.title}" in domain [${fullNode.domain}]`);

    return JSON.parse(JSON.stringify(fullNode));
  }

  public async get(id: string, userId = 'default_user'): Promise<KnowledgeNode | null> {
    this.checkPermission(userId, PermissionLevel.READ, 'read');
    const node = this.nodes.get(id);
    if (!node) return null;
    return JSON.parse(JSON.stringify(node));
  }

  public async search(query: string, domain?: KnowledgeDomain, userId = 'default_user'): Promise<KnowledgeNode[]> {
    this.checkPermission(userId, PermissionLevel.READ, 'read');

    const queryLower = query.toLowerCase();
    let candidates = Array.from(this.nodes.values());

    if (domain) {
      candidates = candidates.filter((n) => n.domain === domain);
    }

    const matches = candidates.filter((n) => {
      return (
        n.title.toLowerCase().includes(queryLower) ||
        n.content.toLowerCase().includes(queryLower) ||
        n.tags.some((t) => t.toLowerCase().includes(queryLower)) ||
        n.category.toLowerCase().includes(queryLower)
      );
    });

    return matches.map((m) => JSON.parse(JSON.stringify(m)));
  }

  public async getByCategory(
    domain: KnowledgeDomain,
    category: string,
    userId = 'default_user'
  ): Promise<KnowledgeNode[]> {
    this.checkPermission(userId, PermissionLevel.READ, 'read');

    const categoryLower = category.toLowerCase();
    const matches = Array.from(this.nodes.values()).filter(
      (n) => n.domain === domain && n.category.toLowerCase() === categoryLower
    );

    return matches.map((m) => JSON.parse(JSON.stringify(m)));
  }

  public async update(
    id: string,
    updates: Partial<KnowledgeNode>,
    userId = 'default_user'
  ): Promise<KnowledgeNode | null> {
    this.checkPermission(userId, PermissionLevel.WRITE, 'write');

    const existing = this.nodes.get(id);
    if (!existing) return null;

    const updated: KnowledgeNode = {
      ...existing,
      ...updates,
      id: existing.id,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    };

    this.nodes.set(id, updated);
    logger.info(`Updated knowledge node [${id}] "${updated.title}"`);
    return JSON.parse(JSON.stringify(updated));
  }

  public async delete(id: string, userId = 'default_user'): Promise<boolean> {
    this.checkPermission(userId, PermissionLevel.WRITE, 'delete');

    const node = this.nodes.get(id);
    if (!node) return false;

    this.nodes.delete(id);

    // Remove relationships referencing this node across other nodes
    for (const other of this.nodes.values()) {
      const filtered = other.relationships.filter((r) => r.nodeId !== id);
      if (filtered.length !== other.relationships.length) {
        other.relationships = filtered;
      }
    }

    if (this.auditLogger) {
      await this.auditLogger.log({
        user: userId,
        requestId: `req_kb_del_${Date.now()}`,
        resource: ResourceType.DATABASES,
        action: 'delete',
        permissionRequired: PermissionLevel.WRITE,
        permissionGranted: PermissionLevel.WRITE,
        decision: SecurityDecisionType.ALLOW,
        reason: `Deleted Second Brain knowledge node ${id} ("${node.title}")`,
        result: 'SUCCESS',
        durationMs: 1,
      });
    }

    logger.info(`Deleted knowledge node [${id}] "${node.title}"`);
    return true;
  }

  public async addRelationship(
    fromNodeId: string,
    toNodeId: string,
    relation: string,
    userId = 'default_user'
  ): Promise<boolean> {
    this.checkPermission(userId, PermissionLevel.WRITE, 'write');

    const fromNode = this.nodes.get(fromNodeId);
    const toNode = this.nodes.get(toNodeId);

    if (!fromNode) {
      throw new NotFoundError(`Source node '${fromNodeId}' not found`);
    }
    if (!toNode) {
      throw new NotFoundError(`Target node '${toNodeId}' not found`);
    }

    const exists = fromNode.relationships.some((r) => r.nodeId === toNodeId && r.relation === relation);
    if (!exists) {
      fromNode.relationships.push({ nodeId: toNodeId, relation });
      fromNode.updatedAt = new Date().toISOString();
      logger.info(`Connected [${fromNodeId}] -> [${toNodeId}] via '${relation}'`);
    }

    return true;
  }

  public async getTree(userId = 'default_user'): Promise<SecondBrainTree> {
    this.checkPermission(userId, PermissionLevel.READ, 'read');
    const all = Array.from(this.nodes.values());
    return buildSecondBrainTree(all);
  }

  public async semanticSearch(
    query: string,
    options: SemanticSearchOptions = {},
    userId = 'default_user'
  ): Promise<SemanticSearchResult[]> {
    this.checkPermission(userId, PermissionLevel.READ, 'read');

    let candidates = Array.from(this.nodes.values());

    if (options.domain) {
      candidates = candidates.filter((n) => n.domain === options.domain);
    }
    if (options.category) {
      candidates = candidates.filter((n) => n.category.toLowerCase() === options.category!.toLowerCase());
    }

    const minScore = options.minScore ?? 0.8;
    const limit = options.limit ?? 5;

    const scored = candidates
      .map((node) => {
        const { score, snippet } = computeSemanticSimilarity(query, node);
        let relatedNodes: KnowledgeNode[] | undefined;

        if (options.includeRelated !== false && node.relationships.length > 0) {
          relatedNodes = node.relationships
            .map((r) => this.nodes.get(r.nodeId))
            .filter((n): n is KnowledgeNode => Boolean(n))
            .slice(0, 3);
        }

        return {
          node,
          score,
          matchSnippet: snippet,
          relatedNodes,
        };
      })
      .filter((r) => r.score >= minScore)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return scored;
  }

  public async getPromptKnowledgeContext(
    query: string,
    limit = 4,
    userId = 'default_user'
  ): Promise<string> {
    try {
      const results = await this.semanticSearch(query, { limit, includeRelated: true }, userId);
      return formatKnowledgeForPrompt(results);
    } catch (err) {
      if (err instanceof PermissionDeniedError) {
        return `[SECOND BRAIN KNOWLEDGE: Knowledge base access restricted for user ${userId}.]`;
      }
      throw err;
    }
  }

  public getNodeCount(): number {
    return this.nodes.size;
  }
}
