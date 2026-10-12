/**
 * Tests for Phase 13 Creative Image Generator and Graphic Designer
 */

import { describe, it, expect } from 'vitest';
import { ImageGenerator } from '../../src/creative/image-generator.js';
import { GraphicDesigner } from '../../src/creative/graphic-designer.js';

describe('Phase 13: ImageGenerator', () => {
  it('generates high-fidelity SVG artwork across multiple styles', () => {
    const generator = new ImageGenerator();

    const result1 = generator.generateImage({
      prompt: 'Cyberpunk quantum mainframe humming in the void',
      style: 'cyberpunk',
      aspectRatio: '16:9',
    });

    expect(result1.id).toBeDefined();
    expect(result1.mimeType).toBe('image/svg+xml');
    expect(result1.isVector).toBe(true);
    expect(result1.width).toBe(1280);
    expect(result1.height).toBe(720);
    expect(result1.contentData).toContain('<svg');
    expect(result1.contentData).toContain('</svg>');
    expect(result1.contentData).toContain('Cyberpunk quantum mainframe');
    expect(result1.contentData).toContain('#00f0ff'); // cyberpunk accent

    const result2 = generator.generateImage({
      prompt: 'Minimalist geometric abstraction',
      style: 'minimalist',
      aspectRatio: '1:1',
    });

    expect(result2.width).toBe(800);
    expect(result2.height).toBe(800);
    expect(result2.contentData).toContain('STYLE: MINIMALIST');
  });

  it('edits SVG images with grayscale, watermark, scale, and cyberpunk filters', () => {
    const generator = new ImageGenerator();
    const original = generator.generateImage({
      prompt: 'Test Artwork',
      style: 'digital_art',
    });

    const grayscale = generator.editImage({
      svgContent: original.contentData,
      instruction: 'grayscale',
    });
    expect(grayscale.contentData).toContain('id="gray"');

    const watermarked = generator.editImage({
      svgContent: original.contentData,
      instruction: 'add_watermark',
      watermarkText: 'CONFIDENTIAL',
    });
    expect(watermarked.contentData).toContain('CONFIDENTIAL');

    const scaled = generator.editImage({
      svgContent: original.contentData,
      instruction: 'scale',
      scaleFactor: 2.0,
    });
    expect(scaled.contentData).toContain('transform="scale(2)"');
  });

  it('rejects image edit when svgContent is not valid SVG', () => {
    const generator = new ImageGenerator();
    expect(() => {
      generator.editImage({
        svgContent: 'not-an-svg',
        instruction: 'grayscale',
      });
    }).toThrow('Valid SVG markup is required');
  });
});

describe('Phase 13: GraphicDesigner', () => {
  it('composes banners, posters, and badges as SVG layouts', () => {
    const designer = new GraphicDesigner();

    const banner = designer.composeGraphic({
      title: 'JARVIS Supercharged AI Core',
      subtitle: 'Next-Generation Personal Operating System',
      layout: 'banner',
      theme: 'dark_neon',
    });

    expect(banner.width).toBe(1200);
    expect(banner.height).toBe(630);
    expect(banner.svgMarkup).toContain('BANNER SPEC');
    expect(banner.svgMarkup).toContain('JARVIS Supercharged AI Core');

    const badge = designer.composeGraphic({
      title: 'LEVEL 5',
      subtitle: 'VERIFIED SECURITY',
      layout: 'badge',
      theme: 'modern_gradient',
    });

    expect(badge.width).toBe(400);
    expect(badge.height).toBe(400);
    expect(badge.svgMarkup).toContain('LEVEL 5');
    expect(badge.svgMarkup).toContain('VERIFIED SECURITY');
  });

  it('supports custom graphic elements on canvas', () => {
    const designer = new GraphicDesigner();

    const result = designer.composeGraphic({
      title: 'Custom Canvas',
      layout: 'poster',
      theme: 'academic_clean',
      elements: [
        { type: 'rect', x: 50, y: 50, fill: '#1e3a8a' },
        { type: 'badge', x: 100, y: 200, content: 'CERTIFIED' },
      ],
    });

    expect(result.svgMarkup).toContain('CERTIFIED');
    expect(result.svgMarkup).toContain('<rect x="50" y="50"');
  });
});
