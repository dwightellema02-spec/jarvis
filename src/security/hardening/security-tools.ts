import {
  ITool,
  ToolDefinition,
  ToolExecutionContext,
  ToolExecutionResult,
} from '../../tools/tool.interface.js';
import { SecurityHardeningManager } from './security-hardening-manager.js';
import { PermissionLevel, ResourceType } from '../types.js';

// 1. security.encrypt_envelope
export class EncryptEnvelopeTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'security.encrypt_envelope',
    name: 'Encrypt Sensitive Data with AES-256-GCM Envelope',
    description: 'Encrypts plaintext sensitive data using AES-256-GCM envelope encryption and dual HMAC verification',
    version: '0.29.0-phase29',
    status: 'implemented',
    requiredPermissions: [
      { resource: ResourceType.SECURITY, action: 'write', level: PermissionLevel.WRITE },
    ],
    parametersSchema: {
      type: 'object',
      properties: {
        plaintext: { type: 'string', description: 'Plaintext data to encrypt' },
      },
      required: ['plaintext'],
    },
  };

  constructor(private manager: SecurityHardeningManager) {}

  public async execute(params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const p = (params as Record<string, unknown>) || {};
      const plaintext = (p.plaintext as string) || '';
      const envelope = this.manager.encryptData(plaintext, context.userId);
      return {
        success: true,
        toolId: this.definition.id,
        data: envelope,
        verified: true,
        executionTimeMs: Date.now() - startTime,
      };
    } catch (err: any) {
      return {
        success: false,
        toolId: this.definition.id,
        error: err.message,
        verified: false,
        executionTimeMs: Date.now() - startTime,
      };
    }
  }
}

// 2. security.decrypt_envelope
export class DecryptEnvelopeTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'security.decrypt_envelope',
    name: 'Decrypt AES-256-GCM Envelope Ciphertext',
    description: 'Decrypts ciphertext envelope with dual-layer integrity verification and tamper detection',
    version: '0.29.0-phase29',
    status: 'implemented',
    requiredPermissions: [
      { resource: ResourceType.SECURITY, action: 'read', level: PermissionLevel.READ },
    ],
    parametersSchema: {
      type: 'object',
      properties: {
        envelope: { type: 'object', description: 'Encrypted envelope payload' },
      },
      required: ['envelope'],
    },
  };

  constructor(private manager: SecurityHardeningManager) {}

  public async execute(params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const p = (params as Record<string, unknown>) || {};
      const envelope = p.envelope as any;
      const text = this.manager.decryptData(envelope, context.userId);
      return {
        success: true,
        toolId: this.definition.id,
        data: { decryptedText: text },
        verified: true,
        executionTimeMs: Date.now() - startTime,
      };
    } catch (err: any) {
      return {
        success: false,
        toolId: this.definition.id,
        error: err.message,
        verified: false,
        executionTimeMs: Date.now() - startTime,
      };
    }
  }
}

// 3. security.redact_pii
export class RedactPiiTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'security.redact_pii',
    name: 'Redact Credentials & PII (RA 10173 Compliant)',
    description: 'Scans text for API keys, passwords, credit cards, emails, and Philippine statutory IDs (PhilSys, SSS, TIN, UMID)',
    version: '0.29.0-phase29',
    status: 'implemented',
    requiredPermissions: [
      { resource: ResourceType.SECURITY, action: 'read', level: PermissionLevel.READ },
    ],
    parametersSchema: {
      type: 'object',
      properties: {
        text: { type: 'string', description: 'Raw text to inspect and redact' },
      },
      required: ['text'],
    },
  };

  constructor(private manager: SecurityHardeningManager) {}

  public async execute(params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const p = (params as Record<string, unknown>) || {};
      const text = (p.text as string) || '';
      const result = this.manager.redactPii(text, context.userId);
      return {
        success: true,
        toolId: this.definition.id,
        data: result,
        verified: true,
        executionTimeMs: Date.now() - startTime,
      };
    } catch (err: any) {
      return {
        success: false,
        toolId: this.definition.id,
        error: err.message,
        verified: false,
        executionTimeMs: Date.now() - startTime,
      };
    }
  }
}

// 4. security.tokenize_sensitive
export class TokenizeSensitiveTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'security.tokenize_sensitive',
    name: 'Pseudonymize Sensitive Value in Privacy Vault',
    description: 'Replaces sensitive value with a reversible ephemeral privacy token',
    version: '0.29.0-phase29',
    status: 'implemented',
    requiredPermissions: [
      { resource: ResourceType.SECURITY, action: 'write', level: PermissionLevel.WRITE },
    ],
    parametersSchema: {
      type: 'object',
      properties: {
        value: { type: 'string', description: 'Sensitive value to pseudonymize' },
        classification: { type: 'string', description: 'PiiClassification type' },
        durationMinutes: { type: 'number', description: 'Token TTL in minutes' },
      },
      required: ['value', 'classification'],
    },
  };

  constructor(private manager: SecurityHardeningManager) {}

  public async execute(params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const p = (params as Record<string, unknown>) || {};
      const val = (p.value as string) || '';
      const cls = (p.classification as any) || 'API_KEY';
      const dur = (p.durationMinutes as number) || 60;
      const tokenId = this.manager.tokenizeSensitive(val, cls, dur, context.userId);
      return {
        success: true,
        toolId: this.definition.id,
        data: { tokenId },
        verified: true,
        executionTimeMs: Date.now() - startTime,
      };
    } catch (err: any) {
      return {
        success: false,
        toolId: this.definition.id,
        error: err.message,
        verified: false,
        executionTimeMs: Date.now() - startTime,
      };
    }
  }
}

// 5. security.create_delegation
export class CreateDelegationTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'security.create_delegation',
    name: 'Create Time-Bound Granular Permission Delegation',
    description: 'Issues a scoped, signed delegation token granting limited privileges with automated expiration',
    version: '0.29.0-phase29',
    status: 'implemented',
    requiredPermissions: [
      { resource: ResourceType.SECURITY, action: 'admin', level: PermissionLevel.ADMIN },
    ],
    parametersSchema: {
      type: 'object',
      properties: {
        delegateeId: { type: 'string', description: 'Identifier of recipient agent or user' },
        resource: { type: 'string', description: 'Target ResourceType' },
        action: { type: 'string', description: 'Target PermissionAction' },
        durationMinutes: { type: 'number', description: 'Validity duration in minutes' },
        reason: { type: 'string', description: 'Justification for privilege delegation' },
      },
      required: ['delegateeId', 'resource', 'action'],
    },
  };

  constructor(private manager: SecurityHardeningManager) {}

  public async execute(params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const p = (params as Record<string, unknown>) || {};
      const delegateeId = (p.delegateeId as string) || 'subagent';
      const resource = (p.resource as any) || ResourceType.SYSTEM;
      const action = (p.action as any) || 'read';
      const durationMinutes = (p.durationMinutes as number) || 30;
      const reason = (p.reason as string) || 'Authorized task delegation';

      const delegation = this.manager.createDelegation(
        {
          delegateeId,
          resource,
          action,
          level: PermissionLevel.READ,
          reason,
          durationMinutes,
        },
        context.userId
      );

      return {
        success: true,
        toolId: this.definition.id,
        data: delegation,
        verified: true,
        executionTimeMs: Date.now() - startTime,
      };
    } catch (err: any) {
      return {
        success: false,
        toolId: this.definition.id,
        error: err.message,
        verified: false,
        executionTimeMs: Date.now() - startTime,
      };
    }
  }
}

// 6. security.revoke_delegation
export class RevokeDelegationTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'security.revoke_delegation',
    name: 'Revoke Active Permission Delegation Immediately',
    description: 'Terminates an active delegation token and revokes delegated rights',
    version: '0.29.0-phase29',
    status: 'implemented',
    requiredPermissions: [
      { resource: ResourceType.SECURITY, action: 'admin', level: PermissionLevel.ADMIN },
    ],
    parametersSchema: {
      type: 'object',
      properties: {
        delegationId: { type: 'string', description: 'ID of delegation to revoke' },
      },
      required: ['delegationId'],
    },
  };

  constructor(private manager: SecurityHardeningManager) {}

  public async execute(params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const p = (params as Record<string, unknown>) || {};
      const id = (p.delegationId as string) || '';
      const revoked = this.manager.revokeDelegation(id, context.userId);
      return {
        success: true,
        toolId: this.definition.id,
        data: { revoked },
        verified: true,
        executionTimeMs: Date.now() - startTime,
      };
    } catch (err: any) {
      return {
        success: false,
        toolId: this.definition.id,
        error: err.message,
        verified: false,
        executionTimeMs: Date.now() - startTime,
      };
    }
  }
}

// 7. security.audit_payload
export class AuditPayloadTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'security.audit_payload',
    name: 'Scan Payload for Injections, Traversal, and Prototype Pollution',
    description: 'Audits raw payloads against prompt injection, directory traversal, prototype pollution, and command injection attacks',
    version: '0.29.0-phase29',
    status: 'implemented',
    requiredPermissions: [
      { resource: ResourceType.SECURITY, action: 'read', level: PermissionLevel.READ },
    ],
    parametersSchema: {
      type: 'object',
      properties: {
        payload: { type: 'string', description: 'Payload string or JSON to inspect' },
      },
      required: ['payload'],
    },
  };

  constructor(private manager: SecurityHardeningManager) {}

  public async execute(params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const p = (params as Record<string, unknown>) || {};
      const payload = (p.payload as string) || '';
      const audit = this.manager.auditPayload(payload, context.userId);
      return {
        success: true,
        toolId: this.definition.id,
        data: audit,
        verified: true,
        executionTimeMs: Date.now() - startTime,
      };
    } catch (err: any) {
      return {
        success: false,
        toolId: this.definition.id,
        error: err.message,
        verified: false,
        executionTimeMs: Date.now() - startTime,
      };
    }
  }
}

// 8. security.get_security_posture
export class GetSecurityPostureTool implements ITool {
  public readonly definition: ToolDefinition = {
    id: 'security.get_security_posture',
    name: 'Get Executive System Security Posture and Compliance Report',
    description: 'Returns real-time security posture score, statutory compliance status (RA 10173), and defense matrix',
    version: '0.29.0-phase29',
    status: 'implemented',
    requiredPermissions: [
      { resource: ResourceType.SECURITY, action: 'read', level: PermissionLevel.READ },
    ],
    parametersSchema: {
      type: 'object',
      properties: {},
    },
  };

  constructor(private manager: SecurityHardeningManager) {}

  public async execute(_params: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const posture = this.manager.getSecurityPosture(context.userId);
      return {
        success: true,
        toolId: this.definition.id,
        data: posture,
        verified: true,
        executionTimeMs: Date.now() - startTime,
      };
    } catch (err: any) {
      return {
        success: false,
        toolId: this.definition.id,
        error: err.message,
        verified: false,
        executionTimeMs: Date.now() - startTime,
      };
    }
  }
}

export function createSecurityHardeningTools(manager: SecurityHardeningManager): ITool[] {
  return [
    new EncryptEnvelopeTool(manager),
    new DecryptEnvelopeTool(manager),
    new RedactPiiTool(manager),
    new TokenizeSensitiveTool(manager),
    new CreateDelegationTool(manager),
    new RevokeDelegationTool(manager),
    new AuditPayloadTool(manager),
    new GetSecurityPostureTool(manager),
  ];
}
