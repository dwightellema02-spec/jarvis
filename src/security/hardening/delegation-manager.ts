import crypto from 'crypto';
import {
  ResourceType,
  PermissionAction,
  PermissionLevel,
} from '../types.js';
import { PermissionDelegation } from './security-hardening.interface.js';

export class DelegationManager {
  private delegations: Map<string, PermissionDelegation> = new Map();
  private tokenIndex: Map<string, string> = new Map(); // delegationToken -> id

  /**
   * Creates a time-bound granular permission delegation
   */
  public createDelegation(params: {
    delegatorId: string;
    delegateeId: string;
    resource: ResourceType;
    action: PermissionAction;
    level: PermissionLevel;
    reason: string;
    durationMinutes: number;
  }): PermissionDelegation {
    const id = `delg_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const tokenBytes = crypto.randomBytes(24).toString('hex');
    const delegationToken = `jarvis_del_${tokenBytes}`;
    const createdAt = new Date().toISOString();
    const expiresAt = new Date(Date.now() + params.durationMinutes * 60000).toISOString();

    const delegation: PermissionDelegation = {
      id,
      delegatorId: params.delegatorId,
      delegateeId: params.delegateeId,
      resource: params.resource,
      action: params.action,
      level: params.level,
      reason: params.reason,
      createdAt,
      expiresAt,
      active: true,
      delegationToken,
    };

    this.delegations.set(id, delegation);
    this.tokenIndex.set(delegationToken, id);

    return delegation;
  }

  /**
   * Verifies if a delegation token is valid, active, and matches requested resource and action
   */
  public verifyDelegation(
    token: string,
    requiredResource: ResourceType,
    requiredAction: PermissionAction
  ): { valid: boolean; delegation?: PermissionDelegation; reason?: string } {
    const id = this.tokenIndex.get(token);
    if (!id) {
      return { valid: false, reason: 'Invalid or unknown delegation token' };
    }

    const delegation = this.delegations.get(id);
    if (!delegation) {
      return { valid: false, reason: 'Delegation record not found' };
    }

    if (!delegation.active) {
      return { valid: false, delegation, reason: 'Delegation has been revoked' };
    }

    if (new Date(delegation.expiresAt).getTime() < Date.now()) {
      delegation.active = false;
      return { valid: false, delegation, reason: 'Delegation token has expired' };
    }

    if (delegation.resource !== requiredResource) {
      return {
        valid: false,
        delegation,
        reason: `Delegation resource mismatch: expected ${requiredResource}, granted ${delegation.resource}`,
      };
    }

    if (delegation.action !== requiredAction && delegation.action !== 'admin') {
      return {
        valid: false,
        delegation,
        reason: `Delegation action mismatch: expected ${requiredAction}, granted ${delegation.action}`,
      };
    }

    return { valid: true, delegation };
  }

  /**
   * Revokes an active delegation immediately
   */
  public revokeDelegation(id: string): boolean {
    const delegation = this.delegations.get(id);
    if (!delegation) return false;

    delegation.active = false;
    return true;
  }

  /**
   * Lists delegations filtered by delegator, delegatee, or active state
   */
  public listDelegations(filter?: {
    delegatorId?: string;
    delegateeId?: string;
    activeOnly?: boolean;
  }): PermissionDelegation[] {
    let list = Array.from(this.delegations.values());

    if (filter?.delegatorId) {
      list = list.filter((d) => d.delegatorId === filter.delegatorId);
    }
    if (filter?.delegateeId) {
      list = list.filter((d) => d.delegateeId === filter.delegateeId);
    }
    if (filter?.activeOnly) {
      list = list.filter((d) => d.active && new Date(d.expiresAt).getTime() > Date.now());
    }

    return list;
  }

  public getActiveCount(): number {
    return Array.from(this.delegations.values()).filter(
      (d) => d.active && new Date(d.expiresAt).getTime() > Date.now()
    ).length;
  }
}
