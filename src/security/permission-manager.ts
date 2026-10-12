import {
  PermissionLevel,
  PERMISSION_HIERARCHY,
  ResourceType,
  PermissionGrant,
  PermissionCheckRequest,
  PermissionCheckResult,
  SecurityDecisionType,
} from './types.js';
import { SecurityEventType, SecurityEventSink } from './security-event.js';
import { logger } from '../utils/logger.js';
import { sanitizeData } from './sanitizer.js';

export {
  PermissionLevel,
  PERMISSION_HIERARCHY,
  ResourceType,
  PermissionGrant,
  PermissionCheckRequest,
  PermissionCheckResult,
  SecurityDecisionType,
};

export class PermissionManager {
  private grants: Map<string, PermissionGrant> = new Map();
  private eventSink?: SecurityEventSink;

  constructor(eventSink?: SecurityEventSink) {
    this.eventSink = eventSink;
  }

  /**
   * Evaluates if an action on a resource is permitted.
   * STRICT DEFAULT-DENY ARCHITECTURE:
   * If there is no explicit valid grant, or the grant is expired, or the grant level
   * is insufficient, access is categorically DENIED.
   */
  public checkPermission(request: PermissionCheckRequest): PermissionCheckResult {
    const { userId, resource, action, requiredLevel, targetIdentifier } = request;

    // Validate valid permission level
    if (!requiredLevel || !PERMISSION_HIERARCHY[requiredLevel]) {
      this.recordSecurityEvent(SecurityEventType.AUTHORIZATION_FAILURE, 'high', {
        reason: 'Unknown or invalid permission level requested',
        request,
      });

      return {
        allowed: false,
        decision: SecurityDecisionType.DENY,
        reason: `Deny: Invalid or unknown permission level '${String(requiredLevel)}'`,
        requiredLevel: requiredLevel || PermissionLevel.READ,
      };
    }

    // Validate resource type exists in known resources
    if (!resource || !Object.values(ResourceType).includes(resource)) {
      this.recordSecurityEvent(SecurityEventType.AUTHORIZATION_FAILURE, 'high', {
        reason: 'Unknown resource requested',
        request,
      });

      return {
        allowed: false,
        decision: SecurityDecisionType.DENY,
        reason: `Deny: Unknown or unregistered resource '${String(resource)}'`,
        requiredLevel,
      };
    }

    // Find applicable grants for this user & resource
    const applicableGrants = Array.from(this.grants.values()).filter((g) => {
      if (g.userId !== userId || g.resource !== resource) {
        return false;
      }
      // Check expiration
      if (g.expiresAt && new Date(g.expiresAt).getTime() <= Date.now()) {
        return false;
      }
      // Check scope / target identifier restriction if specified
      if (g.scope && targetIdentifier && !targetIdentifier.startsWith(g.scope)) {
        return false;
      }
      return true;
    });

    if (applicableGrants.length === 0) {
      this.recordSecurityEvent(SecurityEventType.PERMISSION_DENIED, 'medium', {
        reason: 'No explicit grant found for user and resource (Default Deny)',
        userId,
        resource,
        action,
        requiredLevel,
      });

      return {
        allowed: false,
        decision: SecurityDecisionType.DENY,
        reason: `Deny: No explicit permission granted for resource '${resource}' (Default Deny)`,
        requiredLevel,
      };
    }

    // Check if any grant has sufficient hierarchy level and includes the action
    const requiredRank = PERMISSION_HIERARCHY[requiredLevel];

    for (const grant of applicableGrants) {
      const grantRank = PERMISSION_HIERARCHY[grant.level];

      if (grantRank >= requiredRank) {
        // If specific actions are listed, ensure the requested action is permitted
        if (grant.allowedActions.length === 0 || grant.allowedActions.includes(action)) {
          this.recordSecurityEvent(SecurityEventType.PERMISSION_GRANTED, 'low', {
            grantId: grant.id,
            userId,
            resource,
            action,
            grantedLevel: grant.level,
            requiredLevel,
          });

          return {
            allowed: true,
            decision: SecurityDecisionType.ALLOW,
            reason: `Allowed by grant '${grant.id}' (${grant.level} >= ${requiredLevel})`,
            grantId: grant.id,
            grantedLevel: grant.level,
            requiredLevel,
          };
        }
      }
    }

    // Grant found but level is insufficient -> Escalation / Unauthorized attempt
    const highestGrant = applicableGrants.reduce((prev, curr) =>
      PERMISSION_HIERARCHY[curr.level] > PERMISSION_HIERARCHY[prev.level] ? curr : prev
    );

    this.recordSecurityEvent(SecurityEventType.PERMISSION_DENIED, 'medium', {
      reason: 'Insufficient permission level',
      userId,
      resource,
      action,
      grantedLevel: highestGrant.level,
      requiredLevel,
    });

    return {
      allowed: false,
      decision: SecurityDecisionType.DENY,
      reason: `Deny: Required level '${requiredLevel}', but highest granted level is '${highestGrant.level}'`,
      grantId: highestGrant.id,
      grantedLevel: highestGrant.level,
      requiredLevel,
    };
  }

  /**
   * Registers an explicit permission grant for a user and resource.
   */
  public grantPermission(grant: Omit<PermissionGrant, 'id' | 'grantedAt'>): PermissionGrant {
    // Validate permission level
    if (!PERMISSION_HIERARCHY[grant.level]) {
      throw new Error(`Cannot grant unknown permission level '${String(grant.level)}'`);
    }

    const id = `grant_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const newGrant: PermissionGrant = {
      ...grant,
      id,
      grantedAt: new Date().toISOString(),
    };

    this.grants.set(id, newGrant);

    this.recordSecurityEvent(SecurityEventType.PERMISSION_GRANTED, 'low', {
      grantId: id,
      userId: grant.userId,
      resource: grant.resource,
      level: grant.level,
      grantedBy: grant.grantedBy,
    });

    logger.info(`Granted ${grant.level} on ${grant.resource} to ${grant.userId}`);
    return newGrant;
  }

  /**
   * Revokes an existing permission grant.
   */
  public revokePermission(grantId: string): boolean {
    const existing = this.grants.get(grantId);
    if (!existing) {
      return false;
    }

    this.grants.delete(grantId);

    this.recordSecurityEvent(SecurityEventType.ACTION_BLOCKED, 'low', {
      reason: 'Grant revoked',
      grantId,
      resource: existing.resource,
      userId: existing.userId,
    });

    return true;
  }

  public listGrants(userId?: string): PermissionGrant[] {
    const all = Array.from(this.grants.values());
    if (userId) {
      return all.filter((g) => g.userId === userId);
    }
    return all;
  }

  public clear(): void {
    this.grants.clear();
  }

  private recordSecurityEvent(
    type: SecurityEventType,
    severity: 'low' | 'medium' | 'high' | 'critical',
    details: Record<string, unknown>
  ): void {
    if (this.eventSink) {
      this.eventSink.record({
        id: `sec_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        type,
        timestamp: new Date().toISOString(),
        severity,
        details: sanitizeData(details) as Record<string, unknown>,
      });
    }
  }
}
