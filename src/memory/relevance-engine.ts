import { MemoryRecord } from './memory.interface.js';
import { MemoryRelevanceResult } from './types.js';

/**
 * Evaluates semantic and keyword relevance of a memory record against a query.
 */
export function scoreMemoryRelevance(query: string, record: MemoryRecord): MemoryRelevanceResult {
  const queryLower = query.toLowerCase();
  const queryWords = queryLower.split(/\W+/).filter((w) => w.length > 2);

  if (queryWords.length === 0) {
    return { record, score: 0.1, matchReason: 'Low signal fallback' };
  }

  const keyLower = record.key.toLowerCase();
  const valStr = typeof record.value === 'string' ? record.value.toLowerCase() : JSON.stringify(record.value).toLowerCase();
  const tagsLower = record.tags.map((t) => t.toLowerCase());

  let matchPoints = 0;
  const matchedTerms: string[] = [];

  // 1. Direct key match (highest priority)
  if (keyLower.includes(queryLower) || queryLower.includes(keyLower)) {
    matchPoints += 3.0;
    matchedTerms.push(`Key match: "${record.key}"`);
  }

  // 2. Token overlap across key, value, and tags
  for (const word of queryWords) {
    if (keyLower.includes(word)) {
      matchPoints += 1.5;
      matchedTerms.push(`Key term: "${word}"`);
    } else if (tagsLower.includes(word)) {
      matchPoints += 1.2;
      matchedTerms.push(`Tag: "${word}"`);
    } else if (valStr.includes(word)) {
      matchPoints += 0.8;
      matchedTerms.push(`Content term: "${word}"`);
    }
  }

  // 3. Recency factor (slightly prefer fresher information, decay over 30 days)
  const ageMs = Date.now() - new Date(record.updatedAt).getTime();
  const daysOld = Math.max(0, ageMs / (1000 * 60 * 60 * 24));
  const recencyMultiplier = Math.max(0.7, 1.0 - daysOld * 0.01);

  // 4. Confidence factor
  const confidenceMultiplier = 0.5 + 0.5 * Math.min(1.0, Math.max(0.1, record.confidence));

  const totalScore = matchPoints * recencyMultiplier * confidenceMultiplier;

  return {
    record,
    score: totalScore,
    matchReason: matchedTerms.length > 0 ? matchedTerms.slice(0, 3).join(', ') : 'Low relevance match',
  };
}

/**
 * Formats retrieved memory records into a high-signal prompt block.
 */
export function formatMemoriesForPrompt(results: MemoryRelevanceResult[]): string {
  if (results.length === 0) {
    return `[CONVERSATION MEMORY: No relevant past memories found for this query. Do not invent past memories.]`;
  }

  const items = results.map((r, i) => {
    const val = typeof r.record.value === 'string' ? r.record.value : JSON.stringify(r.record.value);
    return `${i + 1}. [${r.record.type}] "${r.record.key}": ${val} (confidence: ${(r.record.confidence * 100).toFixed(0)}%, updated: ${r.record.updatedAt.split('T')[0]})`;
  });

  return `
[RELEVANT CONVERSATION MEMORIES RETRIEVED FROM PREVIOUS INTERACTIONS]
${items.join('\n')}
(Directive: Use these retrieved memories to maintain factual continuity. If asked about something not in these memories or current session, explicitly state you do not have that stored.)
`.trim();
}
