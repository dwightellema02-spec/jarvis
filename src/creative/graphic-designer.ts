/**
 * JARVIS Phase 13 - Graphic Designer & Vector Composition Engine
 */

import {
  GraphicCompositionRequest,
  GraphicCompositionResult,
  GraphicElement,
} from './creative.interface.js';

export class GraphicDesigner {
  private compositionCount = 0;

  /**
   * Composes a graphic layout (banner, poster, badge, infographic) as high-res SVG.
   */
  public composeGraphic(request: GraphicCompositionRequest): GraphicCompositionResult {
    const id = `gfx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const { width, height } = this.resolveDimensions(request.layout, request.width, request.height);
    const themeStyles = this.resolveTheme(request.theme);

    const svgMarkup = this.buildGraphicSvg({
      id,
      title: request.title,
      subtitle: request.subtitle || '',
      layout: request.layout,
      themeStyles,
      width,
      height,
      elements: request.elements || [],
    });

    this.compositionCount++;

    return {
      id,
      title: request.title,
      layout: request.layout,
      theme: request.theme,
      svgMarkup,
      width,
      height,
      createdAt: new Date().toISOString(),
    };
  }

  public getCompositionCount(): number {
    return this.compositionCount;
  }

  private resolveDimensions(
    layout: 'banner' | 'poster' | 'badge' | 'infographic',
    customW?: number,
    customH?: number
  ): { width: number; height: number } {
    if (customW && customH) return { width: customW, height: customH };
    switch (layout) {
      case 'banner':
        return { width: 1200, height: 630 }; // Social open-graph banner
      case 'poster':
        return { width: 800, height: 1200 }; // A4 vertical poster ratio
      case 'badge':
        return { width: 400, height: 400 };  // Square emblem badge
      case 'infographic':
        return { width: 900, height: 1600 }; // Tall informative canvas
      default:
        return { width: 1200, height: 630 };
    }
  }

  private resolveTheme(theme: 'dark_neon' | 'academic_clean' | 'modern_gradient'): {
    bg1: string;
    bg2: string;
    primary: string;
    accent: string;
    textColor: string;
    subtextColor: string;
    cardBg: string;
  } {
    switch (theme) {
      case 'dark_neon':
        return {
          bg1: '#070b14',
          bg2: '#0b192c',
          primary: '#00f2fe',
          accent: '#4facfe',
          textColor: '#ffffff',
          subtextColor: '#94a3b8',
          cardBg: 'rgba(15, 23, 42, 0.75)',
        };
      case 'academic_clean':
        return {
          bg1: '#f8fafc',
          bg2: '#e2e8f0',
          primary: '#1e3a8a',
          accent: '#2563eb',
          textColor: '#0f172a',
          subtextColor: '#475569',
          cardBg: 'rgba(255, 255, 255, 0.9)',
        };
      case 'modern_gradient':
      default:
        return {
          bg1: '#180e29',
          bg2: '#2a124d',
          primary: '#f43f5e',
          accent: '#fb7185',
          textColor: '#ffffff',
          subtextColor: '#cbd5e1',
          cardBg: 'rgba(40, 20, 70, 0.75)',
        };
    }
  }

  private buildGraphicSvg(params: {
    id: string;
    title: string;
    subtitle: string;
    layout: string;
    themeStyles: ReturnType<GraphicDesigner['resolveTheme']>;
    width: number;
    height: number;
    elements: GraphicElement[];
  }): string {
    const { id, title, subtitle, layout, themeStyles, width, height, elements } = params;
    const cleanTitle = title.replace(/[<>&"]/g, '');
    const cleanSub = subtitle.replace(/[<>&"]/g, '');

    // Render custom user elements if provided
    const renderedElements = elements
      .map((el) => {
        if (el.type === 'rect') {
          return `<rect x="${el.x}" y="${el.y}" width="160" height="80" rx="8" fill="${el.fill || themeStyles.cardBg}" stroke="${el.stroke || themeStyles.primary}" stroke-width="2" />`;
        }
        if (el.type === 'circle') {
          return `<circle cx="${el.x}" cy="${el.y}" r="40" fill="${el.fill || themeStyles.accent}" />`;
        }
        if (el.type === 'badge') {
          return `<g transform="translate(${el.x}, ${el.y})">
            <rect width="120" height="32" rx="16" fill="${themeStyles.primary}" />
            <text x="60" y="21" font-size="12" font-weight="700" text-anchor="middle" fill="#000000">${(el.content || 'BADGE').replace(/[<>&"]/g, '')}</text>
          </g>`;
        }
        return `<text x="${el.x}" y="${el.y}" font-size="${el.fontSize || 16}" fill="${el.fill || themeStyles.textColor}">${(el.content || '').replace(/[<>&"]/g, '')}</text>`;
      })
      .join('\n    ');

    if (layout === 'badge') {
      const cx = width / 2;
      const cy = height / 2;
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    <linearGradient id="badgeGrad_${id}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${themeStyles.bg1}" />
      <stop offset="100%" stop-color="${themeStyles.bg2}" />
    </linearGradient>
  </defs>
  <circle cx="${cx}" cy="${cy}" r="${cx - 15}" fill="url(#badgeGrad_${id})" stroke="${themeStyles.primary}" stroke-width="8" />
  <circle cx="${cx}" cy="${cy}" r="${cx - 30}" fill="none" stroke="${themeStyles.accent}" stroke-width="2" stroke-dasharray="6 4" />
  <g font-family="system-ui, -apple-system, sans-serif" text-anchor="middle">
    <text x="${cx}" y="${cy - 10}" font-size="28" font-weight="800" fill="${themeStyles.textColor}">${cleanTitle}</text>
    <text x="${cx}" y="${cy + 25}" font-size="14" font-weight="600" fill="${themeStyles.subtextColor}">${cleanSub || 'CERTIFIED VERIFIED'}</text>
    <polygon points="${cx},${cy + 55} ${cx + 15},${cy + 85} ${cx - 15},${cy + 85}" fill="${themeStyles.primary}" />
  </g>
  ${renderedElements}
</svg>`;
    }

    // Default Banner / Poster / Infographic Canvas
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    <linearGradient id="bgGrad_${id}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${themeStyles.bg1}" />
      <stop offset="100%" stop-color="${themeStyles.bg2}" />
    </linearGradient>
    <filter id="shadow_${id}">
      <feDropShadow dx="0" dy="8" stdDeviation="16" flood-color="rgba(0,0,0,0.5)" />
    </filter>
  </defs>

  <!-- Background Canvas -->
  <rect width="${width}" height="${height}" fill="url(#bgGrad_${id})" />

  <!-- Geometric Accent Lines -->
  <path d="M 0,0 L ${width * 0.4},0 L 0,${height * 0.6} Z" fill="${themeStyles.primary}" opacity="0.15" />
  <circle cx="${width * 0.85}" cy="${height * 0.2}" r="${width * 0.15}" fill="${themeStyles.accent}" opacity="0.2" />

  <!-- Hero Card Frame -->
  <rect x="${width * 0.08}" y="${height * 0.12}" width="${width * 0.84}" height="${height * 0.76}" rx="24" fill="${themeStyles.cardBg}" stroke="${themeStyles.primary}" stroke-width="1.5" filter="url(#shadow_${id})" />

  <!-- Content Layer -->
  <g font-family="system-ui, -apple-system, sans-serif" transform="translate(${width * 0.14}, ${height * 0.3})">
    <rect x="0" y="-30" width="130" height="26" rx="13" fill="${themeStyles.primary}" opacity="0.2" />
    <text x="65" y="-13" font-size="12" font-weight="700" fill="${themeStyles.primary}" text-anchor="middle" letter-spacing="1.5">
      ${layout.toUpperCase()} SPEC
    </text>

    <text x="0" y="45" font-size="${layout === 'banner' ? 44 : 52}" font-weight="900" fill="${themeStyles.textColor}" letter-spacing="-0.5">
      ${cleanTitle}
    </text>

    ${cleanSub ? `<text x="0" y="95" font-size="20" font-weight="400" fill="${themeStyles.subtextColor}" max-width="${width * 0.7}">${cleanSub}</text>` : ''}

    <line x1="0" y1="130" x2="${width * 0.7}" y2="130" stroke="${themeStyles.primary}" stroke-width="2" opacity="0.4" />

    <text x="0" y="165" font-size="14" font-weight="500" fill="${themeStyles.subtextColor}">
      JARVIS CREATIVE STUDIO • HIGH DENSITY VECTOR COMPOSITION
    </text>
  </g>

  <!-- Custom User Elements -->
  ${renderedElements}
</svg>`;
  }
}
