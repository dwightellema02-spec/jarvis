/**
 * JARVIS Phase 13 - Presentation Slide Deck Builder & Exporter
 */

import {
  PresentationDeckRequest,
  PresentationDeck,
  PresentationSlide,
} from './creative.interface.js';

export class PresentationBuilder {
  private decksCount = 0;

  /**
   * Builds a structured multi-slide presentation deck with HTML export.
   */
  public createDeck(request: PresentationDeckRequest): PresentationDeck {
    const id = `deck_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const topic = request.topic.trim();
    const audience = request.targetAudience || 'General / Professional';
    const slideCount = Math.max(3, Math.min(request.slideCount || 5, 12));
    const theme = request.theme || 'jarvis_dark';

    const slides: PresentationSlide[] = this.synthesizeSlides(topic, audience, slideCount);
    const estimatedMinutes = Math.round(slides.length * 2.5);
    const htmlExport = this.renderDeckHtml(id, topic, theme, slides);

    this.decksCount++;

    return {
      id,
      topic,
      theme,
      slides,
      totalSlides: slides.length,
      estimatedMinutes,
      htmlExport,
      createdAt: new Date().toISOString(),
    };
  }

  public getDecksCount(): number {
    return this.decksCount;
  }

  private synthesizeSlides(topic: string, audience: string, count: number): PresentationSlide[] {
    const slides: PresentationSlide[] = [];

    // Slide 1: Title & Introduction
    slides.push({
      slideNumber: 1,
      title: topic,
      bulletPoints: [
        `Executive Overview for ${audience}`,
        'Core Objectives & Strategic Alignment',
        'Key Outcomes & Implementation Roadmap',
      ],
      visualCue: 'Hero banner with dark gradient and glowing emblem',
      speakerNotes: `Welcome everyone. Today we are exploring "${topic}". Our goal is to align on actionable milestones.`,
    });

    // Middle Slides: Core Dimensions
    const coreThemes = [
      {
        title: `The Landscape & Challenge`,
        bullets: [
          'Current state analysis and problem definition',
          'Key constraints, dependencies, and risks',
          'Opportunity cost of inaction',
        ],
        cue: 'Split comparative chart showing before and after states',
        notes: 'Walk through why this problem space matters now and highlight the urgency.',
      },
      {
        title: `Architecture & Methodological Approach`,
        bullets: [
          'High-level architectural blueprint',
          'Step-by-step methodology and governance',
          'Integration with existing infrastructure',
        ],
        cue: 'Flow diagram illustrating sequence and component interaction',
        notes: 'Emphasize architectural modularity, security, and verification gates.',
      },
      {
        title: `Operational Execution & Deliverables`,
        bullets: [
          'Phase-by-phase execution timeline',
          'Resource allocation and ownership',
          'Verification criteria and validation engines',
        ],
        cue: 'Milestone timeline grid with color-coded status badges',
        notes: 'Present the delivery cadence and highlight safety checkpoints.',
      },
      {
        title: `Impact Metrics & Business Value`,
        bullets: [
          'Quantitative KPIs and expected performance boosts',
          'Qualitative benefits: reliability, developer experience',
          'Scalability projections over 6-12 months',
        ],
        cue: 'Bar chart and KPI metric counters',
        notes: 'Translate technical capabilities into concrete strategic value.',
      },
      {
        title: `Future Directions & Continuous Evolution`,
        bullets: [
          'Next-horizon enhancements and research pathways',
          'Feedback loops and automated diagnostics',
          'Ecosystem integration roadmap',
        ],
        cue: 'Radar chart indicating multi-domain capability expansion',
        notes: 'Discuss what is on the horizon once foundational goals are met.',
      },
    ];

    for (let i = 2; i < count; i++) {
      const template = coreThemes[(i - 2) % coreThemes.length];
      slides.push({
        slideNumber: i,
        title: `${template.title}: ${topic}`,
        bulletPoints: template.bullets,
        visualCue: template.cue,
        speakerNotes: template.notes,
      });
    }

    // Final Slide: Conclusion & Action Items
    slides.push({
      slideNumber: count,
      title: 'Actionable Takeaways & Next Steps',
      bulletPoints: [
        'Immediate sprint priorities for Week 1',
        'Verification and audit verification sign-offs',
        'Open Q&A and next steering review',
      ],
      visualCue: 'Checklist grid with signed verification seal',
      speakerNotes: 'Conclude with clarity on immediate actions, assignees, and next checkpoints.',
    });

    return slides;
  }

  private renderDeckHtml(id: string, topic: string, theme: string, slides: PresentationSlide[]): string {
    const isDark = theme !== 'minimal_light';
    const bg = isDark ? '#0b0f19' : '#f8fafc';
    const text = isDark ? '#f8fafc' : '#0f172a';
    const cardBg = isDark ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.9)';
    const primary = theme === 'academic_blue' ? '#2563eb' : '#00f2fe';

    const slidesHtml = slides
      .map(
        (s) => `
    <section class="slide" id="slide-${s.slideNumber}">
      <div class="slide-header">
        <span class="slide-badge">Slide ${s.slideNumber} of ${slides.length}</span>
        <h2>${s.title}</h2>
      </div>
      <div class="slide-body">
        <ul>
          ${s.bulletPoints.map((bp) => `<li>${bp}</li>`).join('')}
        </ul>
        ${s.visualCue ? `<div class="visual-cue"><strong>Visual Cue:</strong> ${s.visualCue}</div>` : ''}
      </div>
      ${s.speakerNotes ? `<div class="speaker-notes"><strong>Speaker Notes:</strong> ${s.speakerNotes}</div>` : ''}
    </section>`
      )
      .join('\n');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${topic} - JARVIS Presentation</title>
  <style>
    body {
      margin: 0;
      padding: 2rem;
      background: ${bg};
      color: ${text};
      font-family: system-ui, -apple-system, sans-serif;
    }
    .deck-container {
      max-width: 960px;
      margin: 0 auto;
    }
    .deck-header {
      text-align: center;
      margin-bottom: 2rem;
      border-bottom: 2px solid ${primary};
      padding-bottom: 1rem;
    }
    .slide {
      background: ${cardBg};
      border-radius: 16px;
      padding: 2.5rem;
      margin-bottom: 2rem;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      border: 1px solid rgba(255,255,255,0.1);
    }
    .slide-badge {
      display: inline-block;
      font-size: 0.8rem;
      font-weight: 700;
      color: ${primary};
      letter-spacing: 1px;
      text-transform: uppercase;
      margin-bottom: 0.5rem;
    }
    .slide-header h2 {
      margin: 0 0 1.5rem 0;
      font-size: 1.8rem;
      color: ${text};
    }
    .slide-body ul {
      margin: 0 0 1.5rem 0;
      padding-left: 1.5rem;
      font-size: 1.15rem;
      line-height: 1.8;
    }
    .visual-cue {
      background: rgba(0, 242, 254, 0.1);
      border-left: 4px solid ${primary};
      padding: 0.75rem 1rem;
      font-size: 0.9rem;
      border-radius: 4px;
      margin-bottom: 1rem;
    }
    .speaker-notes {
      font-size: 0.85rem;
      color: #94a3b8;
      border-top: 1px dashed rgba(255,255,255,0.2);
      padding-top: 0.75rem;
      font-style: italic;
    }
  </style>
</head>
<body>
  <div class="deck-container">
    <div class="deck-header">
      <h1>${topic}</h1>
      <p>Theme: ${theme} • Total Slides: ${slides.length} • Generated by JARVIS Creative Studio</p>
    </div>
    ${slidesHtml}
  </div>
</body>
</html>`;
  }
}
