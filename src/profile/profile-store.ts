import { UserProfile } from './types.js';
import { createDefaultUserProfile } from './default-profile.js';

export interface IUserProfileStore {
  get(userId: string): Promise<UserProfile | null>;
  save(profile: UserProfile): Promise<void>;
  delete(userId: string): Promise<boolean>;
  list(): Promise<UserProfile[]>;
}

export class InMemoryUserProfileStore implements IUserProfileStore {
  private profiles: Map<string, UserProfile> = new Map();

  constructor(seedWithDefault = true) {
    if (seedWithDefault) {
      const defaultProf = createDefaultUserProfile('default_user');
      this.profiles.set(defaultProf.id, defaultProf);
    }
  }

  public async get(userId: string): Promise<UserProfile | null> {
    const prof = this.profiles.get(userId);
    if (!prof) return null;
    // Deep clone to prevent direct state corruption
    return JSON.parse(JSON.stringify(prof));
  }

  public async save(profile: UserProfile): Promise<void> {
    this.profiles.set(profile.id, JSON.parse(JSON.stringify(profile)));
  }

  public async delete(userId: string): Promise<boolean> {
    return this.profiles.delete(userId);
  }

  public async list(): Promise<UserProfile[]> {
    return Array.from(this.profiles.values()).map((p) => JSON.parse(JSON.stringify(p)));
  }
}
