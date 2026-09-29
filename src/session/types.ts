import { ChatMessage } from '../providers/ai-provider.interface.js';

export interface Session {
  id: string;
  userId: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
}

export interface ISessionStore {
  get(sessionId: string): Session | null;
  save(session: Session): void;
  delete(sessionId: string): boolean;
  list(userId?: string): Session[];
}
