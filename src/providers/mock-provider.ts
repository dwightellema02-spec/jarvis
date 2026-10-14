import {
  IAIProvider,
  AIRequest,
  ProviderResponse,
  AnalysisResponse,
  ProviderHealth,
  ProviderOptions,
} from './ai-provider.interface.js';
import { AIProviderError } from '../utils/errors.js';

export interface MockProviderOptions {
  simulateMissingKey?: boolean;
  simulateRateLimit?: boolean;
  simulateFailure?: boolean;
  fixedResponse?: string;
}

export class MockAIProvider implements IAIProvider {
  public readonly id = 'mock';
  public readonly name = 'Mock Test AI Provider';
  public readonly supportedModels = ['mock-model-v1'];

  private options: MockProviderOptions;

  constructor(options: MockProviderOptions = {}) {
    this.options = options;
  }

  public setOptions(options: MockProviderOptions): void {
    this.options = { ...this.options, ...options };
  }

  public async generate(request: AIRequest): Promise<ProviderResponse> {
    if (this.options.simulateMissingKey) {
      throw new AIProviderError('mock', 'Mock API key is missing. Configuration error.');
    }

    if (this.options.simulateRateLimit) {
      throw new AIProviderError('mock', 'Mock AI rate limit exceeded (HTTP 429).');
    }

    if (this.options.simulateFailure) {
      throw new AIProviderError('mock', 'Mock provider simulated fatal network failure.');
    }

    if (this.options.fixedResponse) {
      return {
        content: this.options.fixedResponse,
        model: 'mock-model-v1',
        finishReason: 'stop',
      };
    }

    // Inspect conversation history for realistic conversational test verification
    const messages = request.messages;
    const lastMessage = messages[messages.length - 1]?.content.toLowerCase() || '';

    // Check capability honesty prompts
    if (lastMessage.includes('access my camera')) {
      return {
        content:
          'I cannot access your camera at this stage. Physical camera access is a Phase 19 capability and is currently not connected.',
        model: 'mock-model-v1',
      };
    }

    if (lastMessage.includes('control my laptop')) {
      return {
        content:
          'I cannot control your laptop directly. Device bridge and desktop control belong to Phase 21 and are not connected.',
        model: 'mock-model-v1',
      };
    }

    if (lastMessage.includes('protect my computer from viruses') || lastMessage.includes('antivirus')) {
      return {
        content:
          'I cannot provide active antivirus protection or malware scanning. While my internal Security Guardian architecture enforces policy and blocks unauthorized actions within JARVIS, real OS-level endpoint protection is not implemented.',
        model: 'mock-model-v1',
      };
    }

    // Check multi-turn context (e.g. Dwight's name or project)
    const allUserContent = messages
      .filter((m) => m.role === 'user')
      .map((m) => m.content)
      .join(' ');

    if (lastMessage.includes('what is my name')) {
      const match = allUserContent.match(/(?:my name is|i am|call me)\s+([a-zA-Z0-9_-]+)/i);
      if (match) {
        return {
          content: `Your name is ${match[1]}, as you mentioned earlier in this session.`,
          model: 'mock-model-v1',
        };
      }
      return {
        content: "I don't have your name recorded in this conversation yet. Could you tell me?",
        model: 'mock-model-v1',
      };
    }

    if (lastMessage.includes('what can you actually do') || lastMessage.includes('what can you do right now') || lastMessage.includes('what are your capabilities')) {
      return {
        content: `Here is an honest accounting of what I can actually execute right now:

1. Exact Mathematics Engine: Solve polynomial roots, quadratic equations, linear systems, and generate DepEd LET/BLEPT practice problems.
2. EdTech Tuklas Engine: Curriculum management and interactive practice for Philippine DepEd K-12 learning modules.
3. Security Hardening & PII Sanitizer: AES-256-GCM envelope encryption (NIST SP 800-38D), Philippine RA 10173 PII anonymization, AST prototype pollution defense, and ephemeral HMAC delegations.
4. Development Environment & Code Inspection: Real Git status, diff, commit inspection, project dependency audits, and TypeScript typechecking.
5. Second Brain & Personal Context: In-memory knowledge graph queries, focus session tracking, and cognitive load assessment.
6. Self-Correction & Verification: Automated incident ledger recording, safety parameter clamping, and real filesystem verification checks.

Current AI Status: Operating in Local Sovereign Deterministic Mode. No external LLM API key (e.g., GOOGLE_API_KEY) is configured in .env, so open-ended conversational generative completions are not active.`,
        model: 'mock-model-v1',
      };
    }

    if (lastMessage.includes('hello, jarvis') || lastMessage.includes('hello jarvis') || lastMessage === 'hello') {
      return {
        content: 'Hello, Dwight. I am JARVIS, running in Local Sovereign Mode on port 3001. All 21 local engines and 104 tools are initialized and ready to assist you. How may I direct the core today?',
        model: 'mock-model-v1',
      };
    }

    if (lastMessage.includes('what project am i working on')) {
      const match = allUserContent.match(/project is ([a-zA-Z0-9]+)/i);
      if (match) {
        return {
          content: `You are working on project ${match[1]}, based on our conversation in this session.`,
          model: 'mock-model-v1',
        };
      }
      return {
        content: "You haven't specified which project you are working on in this session yet.",
        model: 'mock-model-v1',
      };
    }

    // Mathematics problem solving
    if (lastMessage.includes('3x + 12 = 24')) {
      return {
        content:
          'To solve 3x + 12 = 24:\n\n1. Subtract 12 from both sides:\n   3x = 12\n\n2. Divide by 3:\n   x = 4',
        model: 'mock-model-v1',
      };
    }

    if (lastMessage.includes('2x + 5 = 15') || (lastMessage.includes('solve') && lastMessage.includes('='))) {
      return {
        content:
          'To solve 2x + 5 = 15:\n\n1. Subtract 5 from both sides:\n   2x = 10\n\n2. Divide by 2:\n   x = 5',
        model: 'mock-model-v1',
      };
    }

    return {
      content: `Hello! I am JARVIS. I received your message: "${messages[messages.length - 1]?.content}". How can I assist you today?`,
      model: 'mock-model-v1',
      usage: {
        promptTokens: 10,
        completionTokens: 25,
        totalTokens: 35,
      },
    };
  }

  public async *stream(request: AIRequest): AsyncIterable<string> {
    const res = await this.generate(request);
    const words = res.content.split(' ');
    for (const word of words) {
      yield word + ' ';
    }
  }

  public async analyze(content: unknown, _options?: ProviderOptions): Promise<AnalysisResponse> {
    return { summary: `Analyzed ${typeof content}`, confidence: 1 };
  }

  public async healthCheck(): Promise<ProviderHealth> {
    return { providerId: this.id, status: 'available' };
  }
}
