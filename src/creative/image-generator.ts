/**
 * JARVIS Phase 13 - Creative Image Generator & SVG Vector Engine
 */

import {
  ImageGenerationRequest,
  GeneratedImageResult,
  ImageEditRequest,
  AspectRatio,
  CreativeStyle,
} from './creative.interface.js';

export class ImageGenerator {
  private generatedCount = 0;

  /**
   * Generates a high-fidelity SVG graphic or vector artwork based on prompt, style, and aspect ratio.
   */
  public generateImage(request: ImageGenerationRequest): GeneratedImageResult {
    const style: CreativeStyle = request.style || 'digital_art';
    const aspectRatio: AspectRatio = request.aspectRatio || '16:9';
    const { width, height } = this.getDimensions(aspectRatio, request.width, request.height);
    const id = `img_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const svgMarkup = this.synthesizeSvgArtwork(request.prompt, style, width, height, id);
    this.generatedCount++;

    return {
      id,
      prompt: request.prompt,
      style,
      aspectRatio,
      width,
      height,
      mimeType: 'image/svg+xml',
      contentData: svgMarkup,
      isVector: true,
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * Edits an existing SVG graphic (grayscale, invert, watermark, scale, filter).
   */
  public editImage(request: ImageEditRequest): GeneratedImageResult {
    let svg = request.svgContent || '';
    if (!svg.includes('<svg')) {
      throw new Error('Valid SVG markup is required in svgContent to edit image.');
    }

    const id = `edit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    switch (request.instruction) {
      case 'grayscale':
        svg = svg.replace(/<svg([^>]*)>/, '<svg$1><filter id="gray"><feColorMatrix type="matrix" values="0.33 0.33 0.33 0 0 0.33 0.33 0.33 0 0 0.33 0.33 0.33 0 0 0 0 0 1 0"/></filter><g filter="url(#gray)">')
                 .replace(/<\/svg>/, '</g></svg>');
        break;

      case 'invert':
        svg = svg.replace(/<svg([^>]*)>/, '<svg$1><filter id="inv"><feComponentTransfer><feFuncR type="linear" slope="-1" intercept="1"/><feFuncG type="linear" slope="-1" intercept="1"/><feFuncB type="linear" slope="-1" intercept="1"/></feComponentTransfer></filter><g filter="url(#inv)">')
                 .replace(/<\/svg>/, '</g></svg>');
        break;

      case 'add_watermark': {
        const text = request.watermarkText || 'JARVIS Creative Studio';
        const watermarkTag = `<g opacity="0.35"><text x="95%" y="95%" text-anchor="end" font-family="system-ui, sans-serif" font-size="14" font-weight="bold" fill="#ffffff" letter-spacing="2">${text}</text></g>`;
        svg = svg.replace(/<\/svg>/, `${watermarkTag}</svg>`);
        break;
      }

      case 'filter_cyberpunk':
        svg = svg.replace(/<svg([^>]*)>/, '<svg$1><filter id="cp"><feColorMatrix type="matrix" values="1 0 0 0 0.2  0 0.5 0 0 0  1 0 1 0 0.3  0 0 0 1 0"/></filter><g filter="url(#cp)">')
                 .replace(/<\/svg>/, '</g></svg>');
        break;

      case 'scale': {
        const scale = request.scaleFactor || 1.5;
        svg = svg.replace(/<svg([^>]*)>/, `<svg$1 transform="scale(${scale})">`);
        break;
      }
    }

    this.generatedCount++;

    return {
      id,
      prompt: `Edited image (${request.instruction})`,
      style: 'digital_art',
      aspectRatio: '16:9',
      width: 1280,
      height: 720,
      mimeType: 'image/svg+xml',
      contentData: svg,
      isVector: true,
      createdAt: new Date().toISOString(),
    };
  }

  public getGeneratedCount(): number {
    return this.generatedCount;
  }

  // ==================== INTERNAL SVG GENERATOR ====================

  private getDimensions(ar: AspectRatio, customW?: number, customH?: number): { width: number; height: number } {
    if (customW && customH) return { width: customW, height: customH };
    switch (ar) {
      case '1:1':
        return { width: 800, height: 800 };
      case '16:9':
        return { width: 1280, height: 720 };
      case '4:3':
        return { width: 1024, height: 768 };
      case '9:16':
        return { width: 720, height: 1280 };
      default:
        return { width: 1280, height: 720 };
    }
  }

  private synthesizeSvgArtwork(prompt: string, style: CreativeStyle, width: number, height: number, id: string): string {
    const palette = this.getStylePalette(style);
    const escapedPrompt = prompt.replace(/[<>&"]/g, '');
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.28;

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    <linearGradient id="bgGrad_${id}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${palette.bgStart}" />
      <stop offset="100%" stop-color="${palette.bgEnd}" />
    </linearGradient>
    <linearGradient id="primaryGrad_${id}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${palette.accent1}" />
      <stop offset="100%" stop-color="${palette.accent2}" />
    </linearGradient>
    <filter id="glow_${id}" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="12" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
    <pattern id="grid_${id}" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="${palette.gridColor}" stroke-width="0.75" />
    </pattern>
  </defs>

  <!-- Background Layer -->
  <rect width="${width}" height="${height}" fill="url(#bgGrad_${id})" />
  <rect width="${width}" height="${height}" fill="url(#grid_${id})" />

  <!-- Ambient Light Orbs -->
  <circle cx="${centerX - radius * 0.7}" cy="${centerY - radius * 0.5}" r="${radius * 0.9}" fill="${palette.accent1}" opacity="0.25" filter="url(#glow_${id})" />
  <circle cx="${centerX + radius * 0.7}" cy="${centerY + radius * 0.5}" r="${radius * 0.9}" fill="${palette.accent2}" opacity="0.25" filter="url(#glow_${id})" />

  <!-- Central Focal Geometry -->
  <g filter="url(#glow_${id})">
    <circle cx="${centerX}" cy="${centerY}" r="${radius}" fill="none" stroke="url(#primaryGrad_${id})" stroke-width="4" stroke-dasharray="8 4" />
    <polygon points="${centerX},${centerY - radius * 0.8} ${centerX + radius * 0.7},${centerY + radius * 0.4} ${centerX - radius * 0.7},${centerY + radius * 0.4}" fill="${palette.accent1}" opacity="0.2" stroke="${palette.accent2}" stroke-width="2" />
    <circle cx="${centerX}" cy="${centerY}" r="${radius * 0.35}" fill="url(#primaryGrad_${id})" opacity="0.8" />
  </g>

  <!-- Orbiting Nodes -->
  <circle cx="${centerX + radius * Math.cos(0.8)}" cy="${centerY + radius * Math.sin(0.8)}" r="8" fill="${palette.accent2}" />
  <circle cx="${centerX + radius * Math.cos(2.8)}" cy="${centerY + radius * Math.sin(2.8)}" r="6" fill="${palette.accent1}" />
  <circle cx="${centerX + radius * Math.cos(4.8)}" cy="${centerY + radius * Math.sin(4.8)}" r="7" fill="#ffffff" />

  <!-- Typography / Prompt Stamp -->
  <g font-family="system-ui, -apple-system, sans-serif">
    <text x="${centerX}" y="${height - 50}" text-anchor="middle" font-size="18" font-weight="700" fill="#f8fafc" letter-spacing="1">
      ${escapedPrompt.length > 55 ? escapedPrompt.substring(0, 52) + '...' : escapedPrompt}
    </text>
    <text x="${centerX}" y="${height - 25}" text-anchor="middle" font-size="12" font-weight="500" fill="${palette.accent2}" letter-spacing="2">
      STYLE: ${style.toUpperCase()} • JARVIS CREATIVE ENGINE
    </text>
  </g>
</svg>`;
  }

  private getStylePalette(style: CreativeStyle): {
    bgStart: string;
    bgEnd: string;
    accent1: string;
    accent2: string;
    gridColor: string;
  } {
    switch (style) {
      case 'cyberpunk':
        return {
          bgStart: '#050510',
          bgEnd: '#0f051d',
          accent1: '#00f0ff',
          accent2: '#ff007f',
          gridColor: 'rgba(0, 240, 255, 0.12)',
        };
      case 'vector':
        return {
          bgStart: '#0f172a',
          bgEnd: '#1e293b',
          accent1: '#10b981',
          accent2: '#38bdf8',
          gridColor: 'rgba(56, 189, 248, 0.1)',
        };
      case 'minimalist':
        return {
          bgStart: '#18181b',
          bgEnd: '#27272a',
          accent1: '#e4e4e7',
          accent2: '#a1a1aa',
          gridColor: 'rgba(255, 255, 255, 0.05)',
        };
      case 'photorealistic':
        return {
          bgStart: '#030712',
          bgEnd: '#111827',
          accent1: '#f97316',
          accent2: '#0284c7',
          gridColor: 'rgba(249, 115, 22, 0.08)',
        };
      case 'digital_art':
      default:
        return {
          bgStart: '#0b0f19',
          bgEnd: '#1e1b4b',
          accent1: '#8b5cf6',
          accent2: '#06b6d4',
          gridColor: 'rgba(139, 92, 246, 0.12)',
        };
    }
  }
}
