import { sanitizeData } from '../security/sanitizer.js';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: string;
  requestId?: string;
  data?: Record<string, unknown>;
}

export class Logger {
  private context?: string;
  private minLevel: LogLevel;

  private static levels: Record<LogLevel, number> = {
    debug: 10,
    info: 20,
    warn: 30,
    error: 40,
  };

  constructor(context?: string) {
    this.context = context;
    const envLevel = (process.env.LOG_LEVEL?.toLowerCase() as LogLevel) || 'info';
    this.minLevel = Logger.levels[envLevel] !== undefined ? envLevel : 'info';
  }

  private shouldLog(level: LogLevel): boolean {
    return Logger.levels[level] >= Logger.levels[this.minLevel];
  }

  private formatEntry(level: LogLevel, message: string, data?: Record<string, unknown>, requestId?: string): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: this.context,
      requestId,
      data: data ? (sanitizeData(data) as Record<string, unknown>) : undefined,
    };
  }

  public debug(message: string, data?: Record<string, unknown>, requestId?: string): void {
    if (this.shouldLog('debug')) {
      const entry = this.formatEntry('debug', message, data, requestId);
      console.debug(JSON.stringify(entry));
    }
  }

  public info(message: string, data?: Record<string, unknown>, requestId?: string): void {
    if (this.shouldLog('info')) {
      const entry = this.formatEntry('info', message, data, requestId);
      console.log(JSON.stringify(entry));
    }
  }

  public warn(message: string, data?: Record<string, unknown>, requestId?: string): void {
    if (this.shouldLog('warn')) {
      const entry = this.formatEntry('warn', message, data, requestId);
      console.warn(JSON.stringify(entry));
    }
  }

  public error(message: string, data?: Record<string, unknown>, requestId?: string): void {
    if (this.shouldLog('error')) {
      const entry = this.formatEntry('error', message, data, requestId);
      console.error(JSON.stringify(entry));
    }
  }

  public child(childContext: string): Logger {
    const combined = this.context ? `${this.context}:${childContext}` : childContext;
    return new Logger(combined);
  }
}

export const logger = new Logger('jarvis');
