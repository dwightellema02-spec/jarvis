import crypto from 'crypto';
import { EncryptedEnvelope, KeyRotationRecord } from './security-hardening.interface.js';

interface ManagedKey {
  keyId: string;
  version: number;
  rawKey: Buffer;
  hmacKey: Buffer;
  createdAt: string;
  status: 'active' | 'retired' | 'revoked';
}

export class CryptoVault {
  private masterSalt: Buffer;
  private keys: Map<string, ManagedKey> = new Map();
  private currentActiveKeyId: string;
  private keyCounter: number = 1;

  constructor(masterSecret?: string) {
    // Deterministic or system-derived master salt
    this.masterSalt = crypto.createHash('sha256').update(masterSecret || 'JARVIS_AUTONOMOUS_ENTROPY_2026').digest();
    
    // Initialize primary master key version 1
    const initialKeyId = 'k_v1_primary';
    const rawKey = this.deriveKey('master_key_v1', this.masterSalt);
    const hmacKey = this.deriveKey('master_hmac_v1', this.masterSalt);

    const managed: ManagedKey = {
      keyId: initialKeyId,
      version: 1,
      rawKey,
      hmacKey,
      createdAt: new Date().toISOString(),
      status: 'active',
    };

    this.keys.set(initialKeyId, managed);
    this.currentActiveKeyId = initialKeyId;
  }

  private deriveKey(seed: string, salt: Buffer): Buffer {
    return crypto.pbkdf2Sync(seed, salt, 10000, 32, 'sha256');
  }

  /**
   * Encrypts plaintext payload using AES-256-GCM envelope encryption
   */
  public encryptEnvelope(plaintext: string): EncryptedEnvelope {
    const activeKey = this.keys.get(this.currentActiveKeyId);
    if (!activeKey || activeKey.status !== 'active') {
      throw new Error('No active encryption key available in CryptoVault');
    }

    // Generate random 12-byte IV for GCM
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', activeKey.rawKey, iv);

    const encrypted = Buffer.concat([
      cipher.update(Buffer.from(plaintext, 'utf-8')),
      cipher.final(),
    ]);

    const authTag = cipher.getAuthTag();

    // Dual-layer HMAC over (iv + ciphertext + authTag)
    const hmac = crypto.createHmac('sha256', activeKey.hmacKey)
      .update(iv)
      .update(encrypted)
      .update(authTag)
      .digest('hex');

    return {
      keyId: activeKey.keyId,
      algorithm: 'aes-256-gcm',
      ciphertext: encrypted.toString('base64'),
      iv: iv.toString('base64'),
      authTag: authTag.toString('base64'),
      hmac,
      encryptedAt: new Date().toISOString(),
      version: activeKey.version,
    };
  }

  /**
   * Decrypts ciphertext envelope with dual-layer integrity verification
   */
  public decryptEnvelope(envelope: EncryptedEnvelope): string {
    const key = this.keys.get(envelope.keyId);
    if (!key) {
      throw new Error(`Encryption key ${envelope.keyId} not found in CryptoVault`);
    }

    if (key.status === 'revoked') {
      throw new Error(`Encryption key ${envelope.keyId} has been revoked due to security violation`);
    }

    const iv = Buffer.from(envelope.iv, 'base64');
    const ciphertext = Buffer.from(envelope.ciphertext, 'base64');
    const authTag = Buffer.from(envelope.authTag, 'base64');

    // 1. Verify HMAC integrity with timing-safe comparison
    const computedHmac = crypto.createHmac('sha256', key.hmacKey)
      .update(iv)
      .update(ciphertext)
      .update(authTag)
      .digest('hex');

    const hmacA = Buffer.from(envelope.hmac, 'hex');
    const hmacB = Buffer.from(computedHmac, 'hex');

    if (hmacA.length !== hmacB.length || !crypto.timingSafeEqual(hmacA, hmacB)) {
      throw new Error('Cryptographic verification failed: HMAC digest mismatch or payload tampered');
    }

    // 2. Decrypt with AES-256-GCM and verify auth tag
    try {
      const decipher = crypto.createDecipheriv('aes-256-gcm', key.rawKey, iv);
      decipher.setAuthTag(authTag);

      const decrypted = Buffer.concat([
        decipher.update(ciphertext),
        decipher.final(),
      ]);

      return decrypted.toString('utf-8');
    } catch {
      throw new Error('Cryptographic verification failed: GCM authentication tag mismatch or payload corrupted');
    }
  }

  /**
   * Rotates active master encryption key, retiring previous keys while keeping decrypt capability
   */
  public rotateKey(reason: string = 'Routine scheduled rotation'): KeyRotationRecord {
    const currentKey = this.keys.get(this.currentActiveKeyId);
    if (currentKey) {
      currentKey.status = 'retired';
    }

    this.keyCounter++;
    const newVersion = this.keyCounter;
    const newKeyId = `k_v${newVersion}_${crypto.randomBytes(4).toString('hex')}`;

    const rawKey = this.deriveKey(`master_key_v${newVersion}_${Date.now()}`, this.masterSalt);
    const hmacKey = this.deriveKey(`master_hmac_v${newVersion}_${Date.now()}`, this.masterSalt);

    const newKey: ManagedKey = {
      keyId: newKeyId,
      version: newVersion,
      rawKey,
      hmacKey,
      createdAt: new Date().toISOString(),
      status: 'active',
    };

    this.keys.set(newKeyId, newKey);
    this.currentActiveKeyId = newKeyId;

    return {
      keyId: newKeyId,
      version: newVersion,
      createdAt: newKey.createdAt,
      status: 'active',
      algorithm: 'aes-256-gcm',
    };
  }

  public listKeys(): KeyRotationRecord[] {
    return Array.from(this.keys.values()).map((k) => ({
      keyId: k.keyId,
      version: k.version,
      createdAt: k.createdAt,
      status: k.status,
      algorithm: 'aes-256-gcm',
    }));
  }

  public getActiveKeyId(): string {
    return this.currentActiveKeyId;
  }
}
