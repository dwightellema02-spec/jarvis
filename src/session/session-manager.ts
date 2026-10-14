import { Session, ISessionStore } from './types.js';
import { ChatMessage } from '../providers/ai-provider.interface.js';
import { logger } from '../utils/logger.js';

export class InMemorySessionStore implements ISessionStore {
  private sessions: Map<string, Session> = new Map();

  public get(sessionId: string): Session | null {
    const s = this.sessions.get(sessionId);
    return s ? JSON.parse(JSON.stringify(s)) : null;
  }

  public save(session: Session): void {
    this.sessions.set(session.id, JSON.parse(JSON.stringify(session)));
  }

  public delete(sessionId: string): boolean {
    return this.sessions.delete(sessionId);
  }

  public list(userId?: string): Session[] {
    const all = Array.from(this.sessions.values());
    if (userId) {
      return all.filter((s) => s.userId === userId);
    }
    return all;
  }

  public clear(): void {
    this.sessions.clear();
  }
}

export class SessionManager {
  private store: ISessionStore;

  constructor(store?: ISessionStore) {
    this.store = store || new InMemorySessionStore();
  }

  public createSession(userId = 'default_user', metadata?: Record<string, unknown>, customId?: string): Session {
    const id = customId || `sess_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const now = new Date().toISOString();
    const session: Session = {
      id,
      userId,
      messages: [],
      createdAt: now,
      updatedAt: now,
      metadata,
    };

    this.store.save(session);
    logger.debug(`Session created: ${id} for user ${userId}`);
    return session;
  }

  public getSession(sessionId: string): Session | null {
    return this.store.get(sessionId);
  }

  public getOrCreateSession(sessionId?: string, userId = 'default_user'): Session {
    if (sessionId) {
      const existing = this.store.get(sessionId);
      if (existing) {
        return existing;
      }
      return this.createSession(userId, undefined, sessionId);
    }
    return this.createSession(userId);
  }

  public addMessage(sessionId: string, message: ChatMessage): Session {
    const session = this.getSession(sessionId);
    if (!session) {
      throw new Error(`Session '${sessionId}' not found`);
    }

    const stampedMessage: ChatMessage = {
      ...message,
      timestamp: message.timestamp || new Date().toISOString(),
    };

    session.messages.push(stampedMessage);
    session.updatedAt = new Date().toISOString();

    this.store.save(session);
    logger.debug(`Added message [${message.role}] to session ${sessionId}`);
    return session;
  }

  public getMessages(sessionId: string): ChatMessage[] {
    const session = this.getSession(sessionId);
    return session ? [...session.messages] : [];
  }

  public deleteSession(sessionId: string): boolean {
    return this.store.delete(sessionId);
  }
}
