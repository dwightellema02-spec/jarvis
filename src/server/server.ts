import dotenv from 'dotenv';
import { createApp } from './app.js';
import { logger } from '../utils/logger.js';

dotenv.config();

const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || '127.0.0.1';

const { app } = createApp();

const server = app.listen(PORT, HOST, () => {
  logger.info(`JARVIS Core Service running at http://${HOST}:${PORT}`);
  logger.info(`Health check available at http://${HOST}:${PORT}/api/health`);
  logger.info(`Architecture: Phase 0 Foundation, Security & Master Architecture active`);
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully.');
  server.close(() => {
    logger.info('Server closed.');
    process.exit(0);
  });
});
