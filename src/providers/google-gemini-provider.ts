import {
  IAIProvider,
  AIRequest,
  ProviderResponse,
  AnalysisResponse,
  ProviderHealth,
  ProviderOptions,
  ChatMessage,
} from './ai-provider.interface.js';
import { AIProviderError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

export interface GeminiProviderConfig {
  apiKey?: string;
  model?: string;
  baseUrl?: string;
}

export class GoogleGeminiProvider implements IAIProvider {
  public readonly id = 'google';
  public readonly name = 'Google Gemini API';
  public readonly supportedModels = [
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemini-1.5-pro',
  ];

  private apiKey?: string;
  private defaultModel: string;
  private baseUrl: string;

  constructor(config: GeminiProviderConfig = {}) {
    this.apiKey =
      config.apiKey ||
      process.env.GOOGLE_API_KEY ||
      process.env.GEMINI_API_KEY ||
      process.env.AI_API_KEY;
    this.defaultModel = config.model || process.env.AI_MODEL || 'gemini-2.5-flash';
    this.baseUrl = config.baseUrl || 'https://generativelanguage.googleapis.com/v1beta';
  }

  public async generate(request: AIRequest): Promise<ProviderResponse> {
    if (!this.apiKey) {
      throw new AIProviderError(
        'google',
        'Google Gemini API key is missing. Please set GOOGLE_API_KEY or AI_API_KEY in your .env file.'
      );
    }

    const model = request.model || this.defaultModel;
    const url = `${this.baseUrl}/models/${model}:generateContent?key=${encodeURIComponent(this.apiKey)}`;

    const { contents, systemInstruction } = this.formatMessages(request.messages, request.systemInstruction);

    const body: Record<string, unknown> = {
      contents,
      generationConfig: {
        temperature: request.temperature ?? 0.7,
        maxOutputTokens: request.maxTokens ?? 2048,
      },
    };

    if (systemInstruction) {
      body.systemInstruction = {
        parts: [{ text: systemInstruction }],
      };
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        await this.handleHttpError(response);
      }

      const json = (await response.json()) as any;
      const candidate = json.candidates?.[0];

      if (!candidate || !candidate.content?.parts?.[0]?.text) {
        throw new AIProviderError('google', 'Invalid or empty response structure from Gemini API');
      }

      const text = candidate.content.parts.map((p: any) => p.text || '').join('');
      const usageMetadata = json.usageMetadata;

      return {
        content: text,
        model,
        usage: usageMetadata
          ? {
              promptTokens: usageMetadata.promptTokenCount || 0,
              completionTokens: usageMetadata.candidatesTokenCount || 0,
              totalTokens: usageMetadata.totalTokenCount || 0,
            }
          : undefined,
        finishReason: candidate.finishReason ? String(candidate.finishReason).toLowerCase() as any : 'stop',
      };
    } catch (err: any) {
      if (err instanceof AIProviderError) {
        throw err;
      }
      logger.error('Gemini API network or unexpected failure', { error: err.message });
      throw new AIProviderError('google', `Failed to communicate with Google Gemini API: ${err.message}`);
    }
  }

  public async *stream(request: AIRequest): AsyncIterable<string> {
    if (!this.apiKey) {
      throw new AIProviderError('google', 'Google Gemini API key is missing. Please set GOOGLE_API_KEY in .env.');
    }

    const model = request.model || this.defaultModel;
    const url = `${this.baseUrl}/models/${model}:streamGenerateContent?alt=sse&key=${encodeURIComponent(this.apiKey)}`;

    const { contents, systemInstruction } = this.formatMessages(request.messages, request.systemInstruction);

    const body: Record<string, unknown> = {
      contents,
      generationConfig: {
        temperature: request.temperature ?? 0.7,
        maxOutputTokens: request.maxTokens ?? 2048,
      },
    };

    if (systemInstruction) {
      body.systemInstruction = { parts: [{ text: systemInstruction }] };
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      await this.handleHttpError(response);
    }

    if (!response.body) {
      throw new AIProviderError('google', 'No stream body returned by Gemini API');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('data: ')) {
          const jsonStr = trimmed.substring(6);
          try {
            const parsed = JSON.parse(jsonStr);
            const partText = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
            if (partText) {
              yield partText;
            }
          } catch {
            // Ignore parse errors on SSE delimiters
          }
        }
      }
    }
  }

  public async analyze(content: unknown, options?: ProviderOptions): Promise<AnalysisResponse> {
    const textContent = typeof content === 'string' ? content : JSON.stringify(content);
    const res = await this.generate({
      messages: [{ role: 'user', content: `Analyze the following content:\n\n${textContent}` }],
      systemInstruction: options?.systemPrompt || 'You are an analytical assistant. Provide a structured summary.',
      model: options?.model,
      temperature: options?.temperature ?? 0.2,
    });

    return {
      summary: res.content,
      confidence: 0.95,
    };
  }

  public async healthCheck(): Promise<ProviderHealth> {
    if (!this.apiKey) {
      return {
        providerId: this.id,
        status: 'unconfigured',
        message: 'No API key configured for Google Gemini API',
      };
    }

    const start = Date.now();
    try {
      // Light check querying models endpoint
      const res = await fetch(`${this.baseUrl}/models/${this.defaultModel}?key=${encodeURIComponent(this.apiKey)}`);
      if (res.ok) {
        return {
          providerId: this.id,
          status: 'available',
          latencyMs: Date.now() - start,
        };
      }
      return {
        providerId: this.id,
        status: 'degraded',
        message: `HTTP ${res.status} returned by Gemini health check`,
        latencyMs: Date.now() - start,
      };
    } catch (err: any) {
      return {
        providerId: this.id,
        status: 'unavailable',
        message: err.message,
        latencyMs: Date.now() - start,
      };
    }
  }

  private formatMessages(messages: ChatMessage[], systemInstruction?: string) {
    const contents: any[] = [];
    let system = systemInstruction;

    for (const msg of messages) {
      if (msg.role === 'system') {
        system = system ? `${system}\n\n${msg.content}` : msg.content;
      } else {
        contents.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }],
        });
      }
    }

    // Gemini API requires that the first content message be from role: 'user'
    if (contents.length > 0 && contents[0].role !== 'user') {
      contents.unshift({
        role: 'user',
        parts: [{ text: 'Hello.' }],
      });
    }

    return { contents, systemInstruction: system };
  }

  private async handleHttpError(response: Response): Promise<never> {
    let errorDetail = '';
    try {
      const errJson = (await response.json()) as any;
      errorDetail = errJson.error?.message || response.statusText;
    } catch {
      errorDetail = response.statusText;
    }

    if (response.status === 401 || response.status === 403) {
      throw new AIProviderError('google', 'Invalid or unauthorized API key for Google Gemini');
    }

    if (response.status === 429) {
      throw new AIProviderError(
        'google',
        'Google Gemini API rate limit or quota exceeded. Please wait a moment and try again.'
      );
    }

    if (response.status === 500 || response.status === 503) {
      throw new AIProviderError('google', 'Google Gemini service is temporarily unavailable');
    }

    throw new AIProviderError('google', `Gemini API error (${response.status}): ${errorDetail}`);
  }
}
