/**
 * JARVIS Phase 9 - Data & Statistics REST Routes
 */

import { Router, Request, Response } from 'express';
import { DataStatisticsManager } from '../../data/data-manager.js';
import { logger } from '../../utils/logger.js';

export function createDataRoutes(dataManager: DataStatisticsManager): Router {
  const router = Router();

  // 1. Clean dataset
  router.post('/data/clean', (req: Request, res: Response) => {
    try {
      const { csvContent, jsonData, cleaningOptions } = req.body;
      const userId = (req.headers['x-user-id'] as string) || req.body.userId || 'default_user';

      const cleaned = dataManager.cleanData({ csvContent, jsonData }, cleaningOptions, userId);
      res.json({ success: true, data: cleaned });
    } catch (err: any) {
      logger.warn('Data cleaning error', { error: err.message });
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // 2. Descriptive statistics on a column
  router.post('/data/descriptive', (req: Request, res: Response) => {
    try {
      const { csvContent, jsonData, column, cleaningOptions } = req.body;
      const userId = (req.headers['x-user-id'] as string) || req.body.userId || 'default_user';

      if (!column) {
        res.status(400).json({ success: false, error: 'Field "column" is required.' });
        return;
      }

      const dataset = dataManager.cleanData({ csvContent, jsonData }, cleaningOptions, userId);
      const stats = dataManager.computeDescriptiveStats(column, dataset, userId);
      res.json({ success: true, data: stats });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // 3. Correlation between two columns
  router.post('/data/correlation', (req: Request, res: Response) => {
    try {
      const { csvContent, jsonData, xColumn, yColumn, cleaningOptions } = req.body;
      const userId = (req.headers['x-user-id'] as string) || req.body.userId || 'default_user';

      if (!xColumn || !yColumn) {
        res.status(400).json({ success: false, error: 'Fields "xColumn" and "yColumn" are required.' });
        return;
      }

      const dataset = dataManager.cleanData({ csvContent, jsonData }, cleaningOptions, userId);
      const corr = dataManager.computeCorrelation(xColumn, yColumn, dataset, userId);
      res.json({ success: true, data: corr });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // 4. Linear regression
  router.post('/data/regression', (req: Request, res: Response) => {
    try {
      const { csvContent, jsonData, xColumn, yColumn, cleaningOptions } = req.body;
      const userId = (req.headers['x-user-id'] as string) || req.body.userId || 'default_user';

      if (!xColumn || !yColumn) {
        res.status(400).json({ success: false, error: 'Fields "xColumn" and "yColumn" are required.' });
        return;
      }

      const dataset = dataManager.cleanData({ csvContent, jsonData }, cleaningOptions, userId);
      const reg = dataManager.computeLinearRegression(xColumn, yColumn, dataset, userId);
      res.json({ success: true, data: reg });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // 5. Hypothesis test (t-test)
  router.post('/data/t-test', (req: Request, res: Response) => {
    try {
      const { csvContent, jsonData, type, column1, column2, hypothesizedMean, alpha, cleaningOptions } = req.body;
      const userId = (req.headers['x-user-id'] as string) || req.body.userId || 'default_user';

      if (!type || !column1) {
        res.status(400).json({ success: false, error: 'Fields "type" and "column1" are required.' });
        return;
      }

      const dataset = dataManager.cleanData({ csvContent, jsonData }, cleaningOptions, userId);
      const test = dataManager.computeHypothesisTest(
        { type, column1, column2, hypothesizedMean, alpha },
        dataset,
        userId
      );
      res.json({ success: true, data: test });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // 6. Generate Chart (SVG & ASCII)
  router.post('/data/visualize', (req: Request, res: Response) => {
    try {
      const { csvContent, jsonData, chartConfig, cleaningOptions } = req.body;
      const userId = (req.headers['x-user-id'] as string) || req.body.userId || 'default_user';

      if (!chartConfig || !chartConfig.type) {
        res.status(400).json({ success: false, error: 'Field "chartConfig" with "type" is required.' });
        return;
      }

      const dataset = dataManager.cleanData({ csvContent, jsonData }, cleaningOptions, userId);
      const chart = dataManager.generateChart(chartConfig, dataset, userId);
      res.json({ success: true, data: chart });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // 7. Full Analytics Pipeline
  router.post('/data/pipeline', async (req: Request, res: Response) => {
    try {
      const userId = (req.headers['x-user-id'] as string) || req.body.userId || 'default_user';
      const result = await dataManager.runPipeline({ ...req.body, userId });
      res.json({ success: true, data: result });
    } catch (err: any) {
      logger.warn('Data pipeline error', { error: err.message });
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // 8. Ingest findings to Second Brain
  router.post('/data/to-knowledge', async (req: Request, res: Response) => {
    try {
      const { title, pipelineResult } = req.body;
      const userId = (req.headers['x-user-id'] as string) || req.body.userId || 'default_user';

      if (!title || !pipelineResult) {
        res.status(400).json({ success: false, error: 'Fields "title" and "pipelineResult" are required.' });
        return;
      }

      const ingested = await dataManager.ingestAnalysisToSecondBrain(title, pipelineResult, userId);
      res.json({ success: true, data: ingested });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  return router;
}
