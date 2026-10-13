import {
  AgentDefinition,
  AgentExecutionContext,
  AgentExecutionResult,
  IAgent,
} from '../../agents/agent.interface.js';
import { SecurityHardeningManager } from './security-hardening-manager.js';
import { PermissionLevel, ResourceType } from '../types.js';

export class SecurityHardeningAgent implements IAgent {
  public readonly definition: AgentDefinition = {
    id: 'security-agent',
    name: 'Security & Privacy Hardening Agent',
    description: 'Orchestrates AES-256-GCM envelope encryption, key rotation, RA 10173 PII redacting, granular permission delegations, and payload vulnerability auditing',
    version: '0.29.0-phase29',
    capabilities: [
      'envelope_encryption',
      'key_rotation',
      'pii_redaction',
      'privacy_tokenization',
      'permission_delegation',
      'vulnerability_scanning',
      'security_posture_evaluation',
    ],
    requiredPermissions: [
      { resource: ResourceType.SECURITY, action: 'read', level: PermissionLevel.READ },
      { resource: ResourceType.SECURITY, action: 'write', level: PermissionLevel.WRITE },
    ],
    inputSchema: {
      type: 'object',
      properties: {
        action: {
          type: 'string',
          enum: [
            'encrypt',
            'decrypt',
            'rotate_key',
            'redact_pii',
            'tokenize',
            'detokenize',
            'create_delegation',
            'revoke_delegation',
            'audit_payload',
            'get_posture',
          ],
        },
        plaintext: { type: 'string' },
        envelope: { type: 'object' },
        reason: { type: 'string' },
        classification: { type: 'string' },
        tokenId: { type: 'string' },
        delegateeId: { type: 'string' },
        targetResource: { type: 'string' },
        targetAction: { type: 'string' },
        durationMinutes: { type: 'number' },
        delegationId: { type: 'string' },
        payloadToScan: { type: 'string' },
      },
      required: ['action'],
    },
    outputSchema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'object' },
      },
      required: ['success'],
    },
    status: 'implemented',
  };

  private manager: SecurityHardeningManager;

  constructor(manager: SecurityHardeningManager) {
    this.manager = manager;
  }

  public async execute(input: unknown, context: AgentExecutionContext): Promise<AgentExecutionResult> {
    const startTime = Date.now();
    const params = (input as Record<string, unknown>) || {};
    const action = params.action as string;
    const user = context.userId || 'dwight';

    try {
      let resultData: unknown;

      switch (action) {
        case 'encrypt': {
          const text = (params.plaintext as string) || '';
          resultData = this.manager.encryptData(text, user);
          break;
        }

        case 'decrypt': {
          const envelope = params.envelope as any;
          if (!envelope) throw new Error('Missing envelope for decryption');
          resultData = { decryptedText: this.manager.decryptData(envelope, user) };
          break;
        }

        case 'rotate_key': {
          const reason = (params.reason as string) || 'Agent requested rotation';
          resultData = this.manager.rotateKey(reason, user);
          break;
        }

        case 'redact_pii': {
          const text = (params.plaintext as string) || '';
          resultData = this.manager.redactPii(text, user);
          break;
        }

        case 'tokenize': {
          const text = (params.plaintext as string) || '';
          const classification = (params.classification as any) || 'API_KEY';
          const duration = (params.durationMinutes as number) || 60;
          resultData = { tokenId: this.manager.tokenizeSensitive(text, classification, duration, user) };
          break;
        }

        case 'detokenize': {
          const tokenId = (params.tokenId as string) || '';
          resultData = { originalValue: this.manager.detokenizeSensitive(tokenId, user) };
          break;
        }

        case 'create_delegation': {
          const delegateeId = (params.delegateeId as string) || 'subagent_delegation';
          const resource = (params.targetResource as any) || ResourceType.SYSTEM;
          const act = (params.targetAction as any) || 'read';
          const reason = (params.reason as string) || 'Temporary subagent execution';
          const durationMinutes = (params.durationMinutes as number) || 30;

          resultData = this.manager.createDelegation(
            {
              delegateeId,
              resource,
              action: act,
              level: PermissionLevel.READ,
              reason,
              durationMinutes,
            },
            user
          );
          break;
        }

        case 'revoke_delegation': {
          const delegationId = (params.delegationId as string) || '';
          resultData = { revoked: this.manager.revokeDelegation(delegationId, user) };
          break;
        }

        case 'audit_payload': {
          const payload = (params.payloadToScan as string) || '';
          resultData = this.manager.auditPayload(payload, user);
          break;
        }

        case 'get_posture': {
          resultData = this.manager.getSecurityPosture(user);
          break;
        }

        default:
          throw new Error(`Unsupported security agent action: ${action}`);
      }

      return {
        success: true,
        agentId: this.definition.id,
        data: resultData,
        executionTimeMs: Date.now() - startTime,
      };
    } catch (err: any) {
      return {
        success: false,
        agentId: this.definition.id,
        error: err.message,
        executionTimeMs: Date.now() - startTime,
      };
    }
  }
}
