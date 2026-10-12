import { describe, it, expect, beforeAll, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import * as fs from 'fs';
import * as path from 'path';
import { createApp } from '../../src/server/app.js';
import { Express } from 'express';

describe('Phase 10 - Coding Intelligence REST API Endpoints', () => {
  let app: Express;
  const testDir = path.resolve(__dirname, '../../tests/fixtures/api_coding_test');
  const sampleFile = path.join(testDir, 'sample_api.ts');

  beforeAll(() => {
    const created = createApp();
    app = created.app;
  });

  beforeEach(() => {
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
    fs.writeFileSync(sampleFile, `export function add(a: number, b: number): number {\n  return a + b;\n}\n`, 'utf-8');
  });

  afterEach(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('GET /api/jarvis/code/inspect', () => {
    it('should return repository overview and language distribution', async () => {
      const res = await request(app).get('/api/jarvis/code/inspect');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.languages.TypeScript).toBeDefined();
    });
  });

  describe('POST /api/jarvis/code/search', () => {
    it('should search repository files with context lines', async () => {
      const res = await request(app)
        .post('/api/jarvis/code/search')
        .send({ query: 'export function add', rootPath: testDir });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.matchCount).toBeGreaterThan(0);
    });
  });

  describe('POST /api/jarvis/code/analyze', () => {
    it('should analyze source code file for symbols and maintainability', async () => {
      const res = await request(app)
        .post('/api/jarvis/code/analyze')
        .send({ filePath: sampleFile });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.symbols.some((s: any) => s.name === 'add')).toBe(true);
      expect(res.body.data.maintainabilityScore).toBeGreaterThan(80);
    });
  });

  describe('POST /api/jarvis/code/review', () => {
    it('should review code for security compliance and complexity', async () => {
      const res = await request(app)
        .post('/api/jarvis/code/review')
        .send({ filePath: sampleFile });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.securityChecksPassed).toBe(true);
      expect(res.body.data.rulesEvaluated.length).toBeGreaterThanOrEqual(4);
    });
  });

  describe('POST /api/jarvis/code/propose, /code/apply, and /code/rollback', () => {
    it('should propose, safely apply, and rollback code patch', async () => {
      // 1. Propose
      const propRes = await request(app)
        .post('/api/jarvis/code/propose')
        .send({
          filePath: sampleFile,
          targetContent: 'return a + b;',
          replacementContent: 'return (a + b) * 1;',
          reason: 'Explicit identity multiplication',
        });

      expect(propRes.status).toBe(200);
      expect(propRes.body.success).toBe(true);
      const proposal = propRes.body.data;
      expect(proposal.diffPreview).toContain('+ return (a + b) * 1;');

      // 2. Apply
      const applyRes = await request(app)
        .post('/api/jarvis/code/apply')
        .send({ proposal, confirmed: true });

      expect(applyRes.status).toBe(200);
      expect(applyRes.body.success).toBe(true);
      expect(applyRes.body.data.verified).toBe(true);

      const modifiedContent = fs.readFileSync(sampleFile, 'utf-8');
      expect(modifiedContent).toContain('* 1');

      // 3. Rollback
      const rollRes = await request(app)
        .post('/api/jarvis/code/rollback')
        .send({ filePath: sampleFile });

      expect(rollRes.status).toBe(200);
      expect(rollRes.body.success).toBe(true);

      const revertedContent = fs.readFileSync(sampleFile, 'utf-8');
      expect(revertedContent).toContain('return a + b;');
    });
  });

  describe('POST /api/jarvis/code/debug', () => {
    it('should diagnose error trace and suggest actionable fixes', async () => {
      const res = await request(app)
        .post('/api/jarvis/code/debug')
        .send({
          rawError: 'ReferenceError: myVariable is not defined\n    at eval (file.ts:10:5)',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.errorType).toBe('ReferenceError');
      expect(res.body.data.suggestedFixes.length).toBeGreaterThan(0);
    });
  });
});
