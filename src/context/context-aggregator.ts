import crypto from 'crypto';
import {
  ActivityItem,
  CognitiveState,
  ContextQuery,
  ContextQueryResult,
  EnvironmentalConstraints,
  FocusSession,
  PersonalContextSnapshot,
} from './context.interface.js';
import { UserProfileManager } from '../profile/profile-manager.js';
import { GoalsManager } from '../goals/goals-manager.js';
import { SecondBrainManager } from '../memory/second-brain-manager.js';
import { ConversationMemoryManager } from '../memory/conversation-memory-manager.js';
import { DeviceManager } from '../devices/device-manager.js';
import { VerificationSuiteManager } from '../verification/verification-suite-manager.js';
import { SelfCorrectionManager } from '../learning/self-correction-manager.js';

export interface ContextAggregatorDependencies {
  profileManager?: UserProfileManager;
  goalsManager?: GoalsManager;
  secondBrain?: SecondBrainManager;
  memoryManager?: ConversationMemoryManager;
  deviceManager?: DeviceManager;
  verificationSuite?: VerificationSuiteManager;
  selfCorrectionManager?: SelfCorrectionManager;
}

export class ContextAggregator {
  constructor(private deps: ContextAggregatorDependencies = {}) {}

  /**
   * Evaluates cognitive load, deadline proximity, and task fatigue.
   */
  public computeCognitiveState(
    _userId: string,
    activeGoalsCount: number,
    focusSession?: FocusSession,
    recentActivitiesCount: number = 0
  ): CognitiveState {
    let score = 0.2; // Base baseline
    const factors: string[] = ['Standard baseline cognitive readiness'];

    if (focusSession && focusSession.active) {
      if (focusSession.mode === 'deep_work' || focusSession.mode === 'coding') {
        score += 0.3;
        factors.push(`Engaged in intense ${focusSession.mode} focus mode`);
      } else if (focusSession.mode === 'study_review' || focusSession.mode === 'research') {
        score += 0.2;
        factors.push(`Engaged in ${focusSession.mode} learning cycle`);
      }
    }

    if (activeGoalsCount > 5) {
      score += 0.25;
      factors.push(`High active goal backlog (${activeGoalsCount} concurrent objectives)`);
    } else if (activeGoalsCount > 2) {
      score += 0.1;
      factors.push(`Moderate goal backlog (${activeGoalsCount} objectives)`);
    }

    if (recentActivitiesCount > 15) {
      score += 0.2;
      factors.push(`High event frequency (${recentActivitiesCount} activities recently)`);
    }

    // Clamp score between 0.0 and 1.0
    score = Math.min(1.0, Math.max(0.0, Math.round(score * 100) / 100));

    let level: CognitiveState['level'] = 'optimal';
    let recommendation = 'Cognitive capacity is balanced and receptive for productive workflows.';

    if (score < 0.35) {
      level = 'low';
      recommendation = 'Cognitive load is low. Excellent window for exploratory learning or starting new milestones.';
    } else if (score <= 0.65) {
      level = 'optimal';
      recommendation = 'Cognitive capacity is in peak flow state. Maintain steady pace without context switching.';
    } else if (score <= 0.85) {
      level = 'high';
      recommendation = 'High cognitive exertion detected. Recommend single-task focus and preparing for a brief break.';
    } else {
      level = 'overload';
      recommendation = 'Cognitive saturation threshold reached. Pause non-essential notifications and schedule a rest interval.';
    }

    return {
      level,
      score,
      factors,
      recommendation,
    };
  }

  /**
   * Retrieves environmental constraints from connected host telemetry.
   */
  public getEnvironmentalConstraints(userId: string): EnvironmentalConstraints {
    const hour = new Date().getHours();
    const quietHours = hour >= 22 || hour < 7;

    let deviceType = 'Host Workstation (Windows)';
    let batteryLevel: number | undefined = undefined;
    let isCharging: boolean | undefined = undefined;

    if (this.deps.deviceManager) {
      try {
        const devices = this.deps.deviceManager.getAllDevices(userId);
        if (devices.length > 0) {
          deviceType = `${devices[0].type.toUpperCase()}: ${devices[0].name}`;
        }
      } catch {
        // Fallback default
      }
    }

    return {
      deviceType,
      batteryLevelPercent: batteryLevel,
      isCharging,
      networkStatus: 'online',
      audioOutputState: quietHours ? 'headphones' : 'speakers',
      quietHoursActive: quietHours,
    };
  }

  /**
   * Synthesizes a unified personal context snapshot.
   */
  public async aggregateSnapshot(
    userId: string,
    focusSession?: FocusSession,
    recentActivities: ActivityItem[] = []
  ): Promise<PersonalContextSnapshot> {
    const timestamp = new Date().toISOString();
    let userName = 'Dwight (Operator)';

    if (this.deps.profileManager) {
      try {
        const profile = await this.deps.profileManager.getProfile(userId);
        if (profile?.identity) {
          userName = profile.identity.preferredName || profile.identity.name || userName;
        }
      } catch {
        // Fallback
      }
    }

    // Active Goals
    let activeGoalsCount = 0;
    const topActiveGoals: string[] = [];

    if (this.deps.goalsManager) {
      try {
        const goals = this.deps.goalsManager.listGoals(userId);
        const inProgress = goals.filter((g) => g.status === 'in_progress' || g.status === 'active');
        activeGoalsCount = inProgress.length;
        for (const g of inProgress.slice(0, 3)) {
          topActiveGoals.push(g.title);
        }
      } catch {
        // Fallback
      }
    }

    // Relevant Knowledge Nodes
    const relevantKnowledgeNodes: string[] = [];
    if (this.deps.secondBrain) {
      try {
        const nodes = await this.deps.secondBrain.search('', undefined, userId);
        for (const n of nodes.slice(0, 5)) {
          relevantKnowledgeNodes.push(n.title);
        }
      } catch {
        // Fallback
      }
    }

    // Environmental Constraints
    const environment = this.getEnvironmentalConstraints(userId);

    // Cognitive State
    const cognitiveState = this.computeCognitiveState(
      userId,
      activeGoalsCount,
      focusSession,
      recentActivities.length
    );

    // Compute Cryptographic State Fingerprint
    const statePayload = JSON.stringify({
      userId,
      userName,
      focusMode: focusSession?.mode,
      cognitiveScore: cognitiveState.score,
      goalsCount: activeGoalsCount,
      timestampMinute: timestamp.substring(0, 16),
    });
    const contextFingerprint = crypto.createHash('sha256').update(statePayload).digest('hex');

    return {
      timestamp,
      userId,
      userName,
      focusSession,
      cognitiveState,
      environment,
      activeGoalsCount,
      topActiveGoals,
      recentActivityCount: recentActivities.length,
      recentActivities: recentActivities.slice(0, 10),
      relevantKnowledgeNodes,
      contextFingerprint,
    };
  }

  /**
   * Queries relevance-ranked context blend across identity, goals, memory, and second brain.
   */
  public async queryRelevantContext(query: ContextQuery, userId: string): Promise<ContextQueryResult> {
    const matchedProfileDirectives: string[] = [];
    const matchedGoals: Array<{ id: string; title: string; priority: string }> = [];
    const matchedMemories: Array<{ id: string; content: string; relevance: number }> = [];
    const matchedKnowledge: Array<{ id: string; title: string; tags: string[] }> = [];

    // Profile directives
    if (query.includeProfile !== false && this.deps.profileManager) {
      try {
        const profile = await this.deps.profileManager.getProfile(userId);
        if (profile) {
          if (profile.communication?.tone) {
            matchedProfileDirectives.push(`Preferred Tone: ${profile.communication.tone}`);
          }
          if (profile.learning?.preferredStyle) {
            matchedProfileDirectives.push(`Learning Pedagogy: ${profile.learning.preferredStyle}`);
          }
        }
      } catch {
        // Ignore
      }
    }

    // Goals
    if (query.includeGoals !== false && this.deps.goalsManager) {
      try {
        const goals = this.deps.goalsManager.listGoals(userId);
        const lowerQ = query.actionOrGoal.toLowerCase();
        for (const g of goals) {
          if (g.title.toLowerCase().includes(lowerQ) || lowerQ.includes(g.title.toLowerCase()) || g.status === 'in_progress') {
            matchedGoals.push({ id: g.id, title: g.title, priority: g.priority });
            if (matchedGoals.length >= (query.maxItemsPerCategory || 3)) break;
          }
        }
      } catch {
        // Ignore
      }
    }

    // Memories
    if (query.includeMemories !== false && this.deps.memoryManager) {
      try {
        const memories = await this.deps.memoryManager.query({ userId });
        const lowerQ = query.actionOrGoal.toLowerCase();
        for (const m of memories) {
          const valStr = typeof m.value === 'string' ? m.value : JSON.stringify(m.value);
          if (m.key.toLowerCase().includes(lowerQ) || valStr.toLowerCase().includes(lowerQ)) {
            matchedMemories.push({ id: m.id, content: `${m.key}: ${valStr}`, relevance: m.confidence });
            if (matchedMemories.length >= (query.maxItemsPerCategory || 3)) break;
          }
        }
      } catch {
        // Ignore
      }
    }

    // Second Brain
    if (query.includeKnowledgeNodes !== false && this.deps.secondBrain) {
      try {
        const nodes = await this.deps.secondBrain.search(query.actionOrGoal, undefined, userId);
        for (const n of nodes) {
          matchedKnowledge.push({ id: n.id, title: n.title, tags: n.tags });
          if (matchedKnowledge.length >= (query.maxItemsPerCategory || 3)) break;
        }
      } catch {
        // Ignore
      }
    }

    // Assemble composite context string for LLM or Orchestrator prompt injection
    const parts: string[] = [];
    if (matchedProfileDirectives.length > 0) {
      parts.push(`[USER DIRECTIVES] ${matchedProfileDirectives.join('; ')}`);
    }
    if (matchedGoals.length > 0) {
      parts.push(`[ACTIVE GOALS] ${matchedGoals.map((g) => `${g.title} (${g.priority})`).join(', ')}`);
    }
    if (matchedKnowledge.length > 0) {
      parts.push(`[GROUNDED KNOWLEDGE] ${matchedKnowledge.map((k) => k.title).join(', ')}`);
    }
    if (matchedMemories.length > 0) {
      parts.push(`[RECENT MEMORY] ${matchedMemories.map((m) => m.content).join('; ')}`);
    }

    const compositeContextString = parts.length > 0
      ? parts.join('\n')
      : `Standard operating context for action "${query.actionOrGoal}".`;

    return {
      query: query.actionOrGoal,
      matchedProfileDirectives,
      matchedGoals,
      matchedMemories,
      matchedKnowledge,
      compositeContextString,
    };
  }
}
