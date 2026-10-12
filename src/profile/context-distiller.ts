import { UserProfile, ContextDistinction } from './types.js';

/**
 * Distills persistent user profile into a compact, high-signal prompt injection
 * so that JARVIS always understands who it is assisting, their goals, study tracks,
 * projects, and preferred communication & teaching style.
 */
export function distillUserProfileForPrompt(profile: UserProfile): string {
  const activeGoals = profile.goals
    .filter((g) => g.status === 'in_progress' || g.status === 'not_started')
    .slice(0, 5)
    .map((g) => `- [${g.priority.toUpperCase()}] ${g.title}: ${g.description}`)
    .join('\n');

  const activeProjects = profile.projects
    .filter((p) => p.status === 'active')
    .slice(0, 4)
    .map((p) => `- ${p.name}: ${p.description}`)
    .join('\n');

  const studyAreas = profile.studyAreas
    .slice(0, 4)
    .map((s) => `- ${s.title} (${s.domain}): Current topic "${s.currentTopic}", Mastery level [${s.masteryLevel}]`)
    .join('\n');

  return `
[USER IDENTITY & PROFILE CONTEXT]
Assisting: ${profile.identity.name} (Preferred Name: "${profile.identity.preferredName}", Role: ${profile.identity.role})
Timezone: ${profile.identity.timezone} | Locale: ${profile.identity.locale}

[COMMUNICATION & PEDAGOGY PREFERENCES]
- Tone: ${profile.communication.tone} | Address Style: ${profile.communication.addressStyle} | Proactivity: ${profile.communication.proactivity}
- Learning Style: ${profile.learning.preferredStyle} | Math Pedagogy: ${profile.learning.mathPedagogy} | Depth: ${profile.learning.explanationDepth}
- Preferred Programming Languages: ${profile.learning.preferredLanguages.join(', ')}

[ACTIVE USER GOALS]
${activeGoals || 'None registered'}

[ACTIVE USER PROJECTS]
${activeProjects || 'None registered'}

[CURRENT STUDY & REVIEW TRACKS]
${studyAreas || 'None registered'}

[PERMISSION & RISK BOUNDARIES]
- Risk Policy Preset: ${profile.permissionPreferences.defaultRiskPolicy}
- Require Explicit Confirmation for High Risk: ${profile.permissionPreferences.requireExplicitConfirmationForHighRisk}
- Auto-approve Low Risk: ${profile.permissionPreferences.autoApproveLowRisk}
`.trim();
}

/**
 * Distinguishes temporary session conversation data from persistent user data.
 */
export function distillContextDistinction(
  profile: UserProfile,
  temporarySession: {
    sessionId: string;
    messageCount: number;
    ephemeralTopics?: string[];
    scratchpadNotes?: string[];
  }
): ContextDistinction {
  return {
    temporaryConversation: {
      sessionId: temporarySession.sessionId,
      recentMessageCount: temporarySession.messageCount,
      ephemeralTopics: temporarySession.ephemeralTopics || [],
      scratchpadNotes: temporarySession.scratchpadNotes || [],
    },
    persistentUserInformation: {
      userId: profile.identity.userId,
      userName: profile.identity.name,
      preferredName: profile.identity.preferredName,
      activeGoals: profile.goals.filter((g) => g.status === 'in_progress').map((g) => g.title),
      activeProjects: profile.projects.filter((p) => p.status === 'active').map((p) => p.name),
      activeStudyTracks: profile.studyAreas.map((s) => s.title),
      communicationStyle: `${profile.communication.tone} (${profile.communication.addressStyle})`,
      learningStyle: `${profile.learning.preferredStyle} (${profile.learning.mathPedagogy})`,
    },
  };
}
