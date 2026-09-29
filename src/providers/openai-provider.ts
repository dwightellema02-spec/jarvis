import {
  IAIProvider,
  AIRequest,
  ProviderResponse,
  AnalysisResponse,
  ProviderHealth,
  ProviderOptions,
} from './ai-provider.interface.js';
import { AIProviderError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

export interface OpenAIProviderConfig {
  apiKey?: string;
  model?: string;
  baseUrl?: string;
}

export class OpenAIProvider implements IAIProvider {
  public readonly id = 'openai';
  public readonly name = 'OpenAI API';
  public readonly supportedModels = ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'];

  private apiKey?: string;
  private defaultModel: string;
  private baseUrl: string;

  constructor(config: OpenAIProviderConfig = {}) {
    this.apiKey = config.apiKey || process.env.OPENAI_API_KEY || process.env.AI_API_KEY;
    this.defaultModel = config.model || process.env.AI_MODEL || 'gpt-4o-mini';
    this.baseUrl = config.baseUrl || 'https://api.openai.com/v1';
  }

  public async generate(request: AIRequest): Promise<ProviderResponse> {
    if (!this.apiKey) {
      throw new AIProviderError('openai', 'OpenAI API key is missing. Please set OPENAI_API_KEY in .env.');
    }

    const model = request.model || this.defaultModel;
    const messages = [];

    if (request.systemInstruction) {
      messages.push({ role: 'system', content: request.systemInstruction });
    }

    for (const msg of request.messages) {
      messages.push({ role: msg.role, content: msg.content });
    }

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: request.temperature ?? 0.7,
          max_tokens: request.maxTokens ?? 2048,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new AIProviderError('openai', 'Invalid OpenAI API key provided');
        }
        if (response.status === 429) {
          throw new AIProviderError('openai', 'OpenAI API rate limit exceeded');
        }
        throw new AIProviderError('openai', `OpenAI API returned status ${response.status}`);
      }

      const json = (await response.json()) as any;
      const choice = json.choices?.[0];

      return {
        content: choice?.message?.content || '',
        model: json.model || model,
        usage: json.usage
          ? {
              promptTokens: json.usage.prompt_tokens,
              completionTokens: json.usage.completion_tokens,
              totalTokens: json.usage.total_tokens,
            }
          : undefined,
        finishReason: choice?.finish_reason || 'stop',
      };
    } catch (err: any) {
      if (err instanceof AIProviderError) throw err;
      logger.error('OpenAI API request failure', { error: err.message });
      throw new AIProviderError('openai', `Communication failure with OpenAI API: ${err.message}`);
    }
  }

  public async analyze(content: unknown, options?: ProviderOptions): Promise<AnalysisResponse> {
    const text = typeof content === 'string' ? content : JSON.stringify(content);
    const res = await this.generate({
      messages: [{ role: 'user', content: `Analyze the following:\n\n${text}` }],
      systemInstruction: options?.systemPrompt || 'Analyze and summarize concisely.',
      temperature: 0.2,
    });
    return { summary: res.content, confidence: 0.95 };
  }

  public async healthCheck(): Promise<ProviderHealth> {
    if (!this.apiKey) {
      return { providerId: this.id, status: 'unconfigured', message: 'No API key configured' };
    }
    return { providerId: this.id, status: 'available' };
  }
}
