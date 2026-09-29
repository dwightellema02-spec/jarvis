export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

export interface AIRequest {
  messages: ChatMessage[];
  systemInstruction?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  streaming?: boolean;
}

export interface ProviderOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  stopSequences?: string[];
  timeoutMs?: number;
}

export interface ProviderResponse {
  content: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason?: 'stop' | 'length' | 'content_filter' | 'error';
}

export interface AnalysisResponse {
  summary: string;
  structuredData?: Record<string, unknown>;
  confidence?: number;
}

export interface ProviderHealth {
  providerId: string;
  status: 'available' | 'degraded' | 'unavailable' | 'unconfigured';
  message?: string;
  latencyMs?: number;
}

export interface IAIProvider {
  readonly id: string;
  readonly name: string;
  readonly supportedModels: string[];

  generate(request: AIRequest): Promise<ProviderResponse>;
  stream?(request: AIRequest): AsyncIterable<string>;
  analyze(content: unknown, options?: ProviderOptions): Promise<AnalysisResponse>;
  healthCheck(): Promise<ProviderHealth>;
}
