import { IAIProvider } from './ai-provider.interface.js';
import { GoogleGeminiProvider } from './google-gemini-provider.js';
import { OpenAIProvider } from './openai-provider.js';
import { MockAIProvider } from './mock-provider.js';
import { logger } from '../utils/logger.js';

export function createAIProvider(providerName?: string): IAIProvider {
  const selected = (providerName || process.env.AI_PROVIDER || 'google').toLowerCase();

  switch (selected) {
    case 'mock':
      logger.info('Initializing Mock AI Provider for testing');
      return new MockAIProvider();

    case 'openai':
      logger.info('Initializing OpenAI Provider');
      return new OpenAIProvider();

    case 'google':
    case 'gemini':
    default:
      logger.info('Initializing Google Gemini Provider');
      return new GoogleGeminiProvider();
  }
}
