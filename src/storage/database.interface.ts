export interface IDatabaseConnection {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
  healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; latencyMs: number }>;
}

export interface IRepository<T, ID = string> {
  create(item: Omit<T, 'id'>): Promise<T>;
  findById(id: ID): Promise<T | null>;
  findAll(filter?: Partial<T>): Promise<T[]>;
  update(id: ID, updates: Partial<T>): Promise<T | null>;
  delete(id: ID): Promise<boolean>;
}
