import dotenv from 'dotenv';
import { createApp } from './app.js';
import { logger } from '../utils/logger.js';

dotenv.config();

let port = parseInt(process.env.PORT || '3001', 10);
const host = process.env.HOST || '127.0.0.1';

const { app } = createApp();

function startServer(p: number) {
  const s = app.listen(p, host, () => {
    logger.info(`JARVIS Core Service running at http://${host}:${p}`);
    logger.info(`Health check available at http://${host}:${p}/api/health`);
    logger.info(`Web Cockpit active at http://${host}:${p}`);
  });

  s.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      logger.warn(`Port ${p} is already in use by another process. Trying port ${p + 1}...`);
      startServer(p + 1);
    } else {
      logger.error(`Server failed to start: ${err.message}`);
      process.exit(1);
    }
  });

  process.on('SIGTERM', () => {
    logger.info('SIGTERM received. Shutting down gracefully.');
    s.close(() => {
      logger.info('Server closed.');
      process.exit(0);
    });
  });
}

startServer(port);
