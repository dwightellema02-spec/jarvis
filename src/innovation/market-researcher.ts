/**
 * JARVIS Phase 15 - Market Researcher
 * Analyzes market opportunity, TAM/SAM/SOM, competitor moats, and customer pain points.
 */

import { MarketResearchResult } from './innovation.interface.js';

interface MarketDomainProfile {
  tam: string;
  sam: string;
  som: string;
  incumbents: Array<{ name: string; strengths: string; weaknesses: string; differentiation: string }>;
  timingDrivers: string[];
}

export class MarketResearcher {
  private static readonly DOMAIN_PROFILES: Record<string, MarketDomainProfile> = {
    ai_devtools: {
      tam: '$180 Billion (Global Developer Tools & AI Infrastructure)',
      sam: '$34 Billion (Enterprise & SMB AI-assisted Development)',
      som: '$1.8 Billion (High-growth Autonomous Agent Developer Workflows)',
      incumbents: [
        {
          name: 'GitHub Copilot',
          strengths: 'Massive distribution, Microsoft/OpenAI backing, deep IDE integration',
          weaknesses: 'Single-turn autocomplete focus, lacking multi-agent pipeline orchestration',
          differentiation: 'End-to-end autonomous execution with Guardian security and deterministic pipelines',
        },
        {
          name: 'Cursor',
          strengths: 'High developer love, fork of VS Code, fast multi-file edits',
          weaknesses: 'Proprietary desktop app dependency, limited API automation capabilities',
          differentiation: 'Headless agent server architecture with web UI and cross-platform terminal control',
        },
        {
          name: 'Devin (Cognition)',
          strengths: 'First mover in autonomous software engineering hype, sandbox tooling',
          weaknesses: 'High cost per task, closed ecosystem, unpredictable hallucination risks',
          differentiation: 'Transparent RICE-prioritized pipelines with strict permission gating and offline safety',
        },
      ],
      timingDrivers: [
        'Massive explosion of small, agile engineering teams requiring 10x leverage',
        'Breakthroughs in multi-modal LLM reasoning and real-time structured output schemas',
        'Enterprise requirement for default-deny local security and verifiable tool calls',
      ],
    },
    productivity_saas: {
      tam: '$120 Billion (Global Enterprise Productivity & Collaboration)',
      sam: '$28 Billion (AI Knowledge Management & Task Automation)',
      som: '$950 Million (Solo Founder & High-Output Knowledge Worker Market)',
      incumbents: [
        {
          name: 'Notion AI',
          strengths: 'All-in-one workspace, flexible block document model, large community',
          weaknesses: 'Cluttered UI, slow performance at scale, passive text generation only',
          differentiation: 'Active autonomous agent execution with deep file system and second brain indexing',
        },
        {
          name: 'Linear',
          strengths: 'Lightning-fast issue tracking, beautiful opinionated UX',
          weaknesses: 'Manual project management without autonomous venture planning or asset generation',
          differentiation: 'Integrated venture architecture synthesis with automated sprint breakdowns',
        },
      ],
      timingDrivers: [
        'Shift towards lean teams producing venture-scale software',
        'Knowledge fragmentation across Slack, docs, and git requiring unified agent brains',
      ],
    },
    fintech: {
      tam: '$310 Billion (Global Financial Technology & Wealth Management)',
      sam: '$65 Billion (Automated Financial Analytics & Risk Systems)',
      som: '$3.2 Billion (Independent Financial Analysts & Quantitative Research)',
      incumbents: [
        {
          name: 'Bloomberg Terminal',
          strengths: 'Industry standard, immense proprietary data feeds, prestige',
          weaknesses: 'Prohibitive pricing ($27k/yr), archaic 1980s UX, closed ecosystem',
          differentiation: 'Modern AI-driven financial research agent with transparent open-data sources',
        },
      ],
      timingDrivers: [
        'Democratization of financial data APIs and algorithmic research',
        'Demand for real-time risk assessment without institutional pricing lock-in',
      ],
    },
    default_tech: {
      tam: '$85 Billion (Global Digital Transformation & Specialized Software)',
      sam: '$18 Billion (Target Vertical Market Software)',
      som: '$620 Million (Early Adopter Customer Base within 24 Months)',
      incumbents: [
        {
          name: 'Legacy Enterprise Suites',
          strengths: 'Entrenched procurement, deep legacy system compatibility',
          weaknesses: 'Bloated multi-year implementation cycles, lack of intelligent automation',
          differentiation: 'Instant setup, modular micro-architecture, and automated AI co-pilot',
        },
        {
          name: 'Point Solutions / Ad-Hoc Scripts',
          strengths: 'Zero software cost, tailored to hyper-specific tasks',
          weaknesses: 'Fragile maintenance burden, unscalable across growing teams',
          differentiation: 'Production-grade enterprise reliability with built-in audit trails and security gating',
        },
      ],
      timingDrivers: [
        'Rapid acceleration of AI-augmented workflows replacing legacy manual processes',
        'Lower infrastructure costs enabling hyper-efficient vertical SaaS unit economics',
      ],
    },
  };

  /**
   * Performs structured market research for a product idea.
   */
  public analyzeMarket(idea: string, category?: string): MarketResearchResult {
    const detectedDomain = this.detectDomain(idea, category);
    const profile = MarketResearcher.DOMAIN_PROFILES[detectedDomain] || MarketResearcher.DOMAIN_PROFILES.default_tech;

    const ideaSummary = this.summarizeIdea(idea);
    const problemStatement = this.formulateProblemStatement(idea, detectedDomain);
    const customerPainPoints = this.generatePainPoints(idea, detectedDomain);
    const whyNow = profile.timingDrivers.join('; ');

    return {
      ideaSummary,
      problemStatement,
      tamSamSom: {
        tam: profile.tam,
        sam: profile.sam,
        som: profile.som,
      },
      competitors: profile.incumbents,
      customerPainPoints,
      whyNow,
    };
  }

  private detectDomain(idea: string, category?: string): string {
    const cat = (category || '').toLowerCase();
    if (cat.includes('finance') || cat.includes('fintech')) return 'fintech';
    if (cat.includes('dev') || cat.includes('code')) return 'ai_devtools';
    if (cat.includes('productivity') || cat.includes('saas') || cat.includes('note')) return 'productivity_saas';

    const text = idea.toLowerCase();
    if (text.includes('finance') || text.includes('invest') || text.includes('crypto') || text.includes('stock')) {
      return 'fintech';
    }
    if (text.includes('code') || text.includes('developer') || text.includes('devtool') || text.includes('compiler')) {
      return 'ai_devtools';
    }
    if (text.includes('note') || text.includes('productivity') || text.includes('task') || text.includes('knowledge') || text.includes('second brain')) {
      return 'productivity_saas';
    }
    if (text.includes('agent') || text.includes('api')) {
      return 'ai_devtools';
    }
    return 'default_tech';
  }

  private summarizeIdea(idea: string): string {
    const trimmed = idea.trim();
    if (trimmed.length < 100) {
      return trimmed;
    }
    return `${trimmed.substring(0, 97)}...`;
  }

  private formulateProblemStatement(idea: string, domain: string): string {
    switch (domain) {
      case 'ai_devtools':
        return `Developers and technical teams lose 40%+ of their creative time wrangling boilerplate, fragmented tools, and manual testing, leading to slower releases and elevated risk of security misconfigurations.`;
      case 'fintech':
        return `Analysts and investors are inundated with fragmented market data and opaque reports, making high-confidence risk assessment slow, error-prone, and prohibitively expensive.`;
      case 'productivity_saas':
        return `Knowledge workers suffer from fragmented context across disconnected apps, resulting in repeated work, lost insights, and cognitive fatigue.`;
      default:
        return `Current market participants lack an integrated, modern solution for ${idea.substring(0, 40).toLowerCase()}, forcing users into inefficient manual workarounds and disjointed tools.`;
    }
  }

  private generatePainPoints(idea: string, domain: string): string[] {
    switch (domain) {
      case 'ai_devtools':
        return [
          'High context-switching penalty across disconnected CLI, web, and code editors',
          'Lack of rigorous security gating and default-deny protection in autonomous tools',
          'Fragile execution pipelines that fail without honest verification or rollback mechanisms',
          'Difficulties in quantifying sprint velocity and architectural debt in AI-generated code',
        ];
      case 'fintech':
        return [
          'Prohibitive costs of legacy terminals and market data subscriptions',
          'Slow synthesis of multi-source financial signals during volatile conditions',
          'Lack of verifiable audit trails for automated trading or algorithmic triggers',
          'Manual spreadsheet reconciliation prone to human calculation error',
        ];
      case 'productivity_saas':
        return [
          'Critical notes, ideas, and documents scattered across disparate silos',
          'Inability to transform high-level concepts into executable sprint deliverables quickly',
          'Cognitive overload from constant notifications without intelligent prioritization',
          'Loss of institutional memory when key contributors switch tasks or leave teams',
        ];
      default:
        return [
          'Manual repetitive workflows draining valuable operational time',
          'Lack of standardized best practices and automated quality control',
          'Disjointed data silos preventing end-to-end visibility and decision confidence',
          'High initial setup costs and steep learning curves with incumbent legacy software',
        ];
    }
  }
}
