import { Router, Request, Response } from 'express';
import { PermissionManager } from '../../security/permission-manager.js';
import { PermissionCheckRequest, PermissionLevel, ResourceType, PermissionAction } from '../../security/types.js';
import { ValidationError } from '../../utils/errors.js';

export function createPermissionsRouter(permissionManager: PermissionManager): Router {
  const router = Router();

  // List permission grants
  router.get('/', (req: Request, res: Response) => {
    const userId = req.query.userId ? String(req.query.userId) : undefined;
    const grants = permissionManager.listGrants(userId);
    res.status(200).json({ grants });
  });

  // Check if a permission is granted
  router.post('/check', (req: Request, res: Response) => {
    const { userId, resource, action, requiredLevel, targetIdentifier } = req.body;

    if (!userId || !resource || !action || !requiredLevel) {
      throw new ValidationError('userId, resource, action, and requiredLevel are required');
    }

    const checkRequest: PermissionCheckRequest = {
      userId: String(userId),
      resource: resource as ResourceType,
      action: action as PermissionAction,
      requiredLevel: requiredLevel as PermissionLevel,
      targetIdentifier: targetIdentifier ? String(targetIdentifier) : undefined,
    };

    const result = permissionManager.checkPermission(checkRequest);
    res.status(result.allowed ? 200 : 403).json(result);
  });

  // Grant a permission
  router.post('/grant', (req: Request, res: Response) => {
    const { userId, resource, level, allowedActions, grantedBy, scope, expiresAt } = req.body;

    if (!userId || !resource || !level) {
      throw new ValidationError('userId, resource, and level are required');
    }

    const newGrant = permissionManager.grantPermission({
      userId: String(userId),
      resource: resource as ResourceType,
      level: level as PermissionLevel,
      allowedActions: Array.isArray(allowedActions) ? allowedActions : [],
      grantedBy: grantedBy ? String(grantedBy) : 'system',
      scope: scope ? String(scope) : undefined,
      expiresAt: expiresAt ? String(expiresAt) : undefined,
    });

    res.status(201).json({ grant: newGrant });
  });

  // Revoke a permission
  router.delete('/:id', (req: Request, res: Response) => {
    const id = req.params.id;
    const success = permissionManager.revokePermission(id);
    if (!success) {
      res.status(404).json({ error: `Grant '${id}' not found` });
      return;
    }
    res.status(200).json({ message: `Grant '${id}' revoked successfully` });
  });

  return router;
}
