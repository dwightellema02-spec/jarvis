/**
 * Tests for Phase 15 Product Innovation - Market Researcher & Product Spec Engine
 */

import { describe, it, expect } from 'vitest';
import { MarketResearcher } from '../../src/innovation/market-researcher.js';
import { ProductSpecEngine } from '../../src/innovation/product-spec-engine.js';

describe('Phase 15: Market Researcher', () => {
  const researcher = new MarketResearcher();

  it('calculates deterministic TAM/SAM/SOM for AI Developer Tools domain', () => {
    const result = researcher.analyzeMarket('Autonomous AI coding assistant and agent compiler', 'developer_tools');

    expect(result.ideaSummary).toBeDefined();
    expect(result.problemStatement).toContain('Developers and technical teams lose');
    expect(result.tamSamSom.tam).toContain('$180 Billion');
    expect(result.tamSamSom.sam).toContain('$34 Billion');
    expect(result.tamSamSom.som).toContain('$1.8 Billion');
    expect(result.competitors.length).toBeGreaterThanOrEqual(2);
    expect(result.customerPainPoints.length).toBeGreaterThanOrEqual(3);
    expect(result.whyNow).toBeDefined();
  });

  it('calculates market sizing for FinTech domain', () => {
    const result = researcher.analyzeMarket('Algorithmic investment risk intelligence agent', 'finance');

    expect(result.tamSamSom.tam).toContain('$310 Billion');
    expect(result.competitors.some((c) => c.name.includes('Bloomberg'))).toBe(true);
    expect(result.customerPainPoints.length).toBeGreaterThanOrEqual(3);
  });

  it('provides sensible defaults for generic technology ventures', () => {
    const result = researcher.analyzeMarket('Novel smart IoT greenhouse watering sensor');

    expect(result.tamSamSom.tam).toContain('$85 Billion');
    expect(result.competitors.length).toBeGreaterThanOrEqual(1);
    expect(result.customerPainPoints.length).toBeGreaterThanOrEqual(2);
  });
});

describe('Phase 15: Product Spec Engine', () => {
  const engine = new ProductSpecEngine();

  it('generates rich target user personas with ICP and JTBD', () => {
    const personas = engine.generatePersonas('Autonomous AI Venture Architect', 3);

    expect(personas.length).toBe(3);

    const primary = personas[0];
    expect(primary.name).toBe('Alex Rivera');
    expect(primary.archetype).toBe('The Visionary Builder');
    expect(primary.goals.length).toBeGreaterThanOrEqual(2);
    expect(primary.jobsToBeDone.length).toBeGreaterThanOrEqual(2);
    expect(primary.painPoints.length).toBeGreaterThanOrEqual(2);
    expect(primary.willingnessToPay).toBe('high');
    expect(primary.quote).toContain('autonomous partner');

    const lead = personas[1];
    expect(lead.name).toBe('Sarah Chen');
    expect(lead.role).toContain('CTO');
  });

  it('prioritizes features with RICE score formula and MoSCoW buckets', () => {
    const rawFeatures = [
      { name: 'Feature A', description: 'Quick win', reach: 8, impact: 4, confidence: 0.9, effort: 2 },
      { name: 'Feature B', description: 'Huge slog', reach: 6, impact: 2, confidence: 0.6, effort: 8 },
      { name: 'Feature C', description: 'Medium impact', reach: 7, impact: 3, confidence: 0.8, effort: 4 },
    ];

    const prioritized = engine.prioritizeFeatures(rawFeatures);

    expect(prioritized.length).toBe(3);
    // Feature A score = (8 * 4 * 0.9) / 2 = 28.8 / 2 = 14.4
    // Feature B score = (6 * 2 * 0.6) / 8 = 7.2 / 8 = 0.9
    // Feature C score = (7 * 3 * 0.8) / 4 = 16.8 / 4 = 4.2
    expect(prioritized[0].name).toBe('Feature A');
    expect(prioritized[0].category).toBe('must');
    expect(prioritized[0].rice.score).toBe(14.4);
    expect(prioritized[0].complexity).toBe('low');

    expect(prioritized[2].name).toBe('Feature B');
    expect(prioritized[2].complexity).toBe('high');
  });

  it('synthesizes a 6-feature suite tailored to product prompt', () => {
    const features = engine.synthesizeFeatures('Autonomous AI Venture Architect');

    expect(features.length).toBe(6);
    expect(features.some((f) => f.name.includes('Core Automated Execution Engine'))).toBe(true);
    expect(features.some((f) => f.name.includes('Default-Deny Security Guardian'))).toBe(true);
    expect(features.some((f) => f.category === 'must')).toBe(true);
    expect(features.some((f) => f.category === 'should')).toBe(true);
  });
});
