import { Router, Request, Response } from 'express';
import { SecurityHardeningManager } from '../../security/hardening/security-hardening-manager.js';
import { ResourceType, PermissionAction, PermissionLevel } from '../../security/types.js';

export function createSecurityHardeningRouter(manager: SecurityHardeningManager): Router {
  const router = Router();

  const getUser = (req: Request): string => {
    return (req.headers['x-user-id'] as string) || 'dwight';
  };

  // POST /api/jarvis/security/encrypt - Envelope encrypt plaintext
  router.post('/encrypt', (req: Request, res: Response) => {
    try {
      const user = getUser(req);
      const { plaintext } = req.body;
      if (plaintext === undefined || plaintext === null) {
        return res.status(400).json({ success: false, error: 'Field "plaintext" is required.' });
      }
      const envelope = manager.encryptData(String(plaintext), user);
      return res.json({ success: true, data: envelope });
    } catch (err: any) {
      return res.status(403).json({ success: false, error: err.message });
    }
  });

  // POST /api/jarvis/security/decrypt - Decrypt envelope ciphertext
  router.post('/decrypt', (req: Request, res: Response) => {
    try {
      const user = getUser(req);
      const { envelope } = req.body;
      if (!envelope || !envelope.ciphertext || !envelope.iv || !envelope.authTag) {
        return res.status(400).json({ success: false, error: 'Valid "envelope" object is required.' });
      }
      const decrypted = manager.decryptData(envelope, user);
      return res.json({ success: true, data: { decryptedText: decrypted } });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  });

  // POST /api/jarvis/security/rotate-key - Rotate master encryption key
  router.post('/rotate-key', (req: Request, res: Response) => {
    try {
      const user = getUser(req);
      const { reason } = req.body;
      const rec = manager.rotateKey(reason, user);
      return res.json({ success: true, data: rec });
    } catch (err: any) {
      return res.status(403).json({ success: false, error: err.message });
    }
  });

  // GET /api/jarvis/security/keys - List encryption keys and rotation history
  router.get('/keys', (req: Request, res: Response) => {
    try {
      const user = getUser(req);
      const keys = manager.listKeys(user);
      return res.json({ success: true, count: keys.length, data: keys });
    } catch (err: any) {
      return res.status(403).json({ success: false, error: err.message });
    }
  });

  // POST /api/jarvis/security/redact - Scan & redact PII (RA 10173 compliant)
  router.post('/redact', (req: Request, res: Response) => {
    try {
      const user = getUser(req);
      const { text } = req.body;
      if (text === undefined || text === null) {
        return res.status(400).json({ success: false, error: 'Field "text" is required.' });
      }
      const result = manager.redactPii(String(text), user);
      return res.json({ success: true, data: result });
    } catch (err: any) {
      return res.status(403).json({ success: false, error: err.message });
    }
  });

  // POST /api/jarvis/security/tokenize - Pseudonymize sensitive value into privacy token
  router.post('/tokenize', (req: Request, res: Response) => {
    try {
      const user = getUser(req);
      const { value, classification, durationMinutes } = req.body;
      if (!value || !classification) {
        return res.status(400).json({ success: false, error: 'Fields "value" and "classification" are required.' });
      }
      const tokenId = manager.tokenizeSensitive(String(value), classification, durationMinutes, user);
      return res.json({ success: true, data: { tokenId } });
    } catch (err: any) {
      return res.status(403).json({ success: false, error: err.message });
    }
  });

  // POST /api/jarvis/security/detokenize - Reversible de-tokenization for authorized admin
  router.post('/detokenize', (req: Request, res: Response) => {
    try {
      const user = getUser(req);
      const { tokenId } = req.body;
      if (!tokenId) {
        return res.status(400).json({ success: false, error: 'Field "tokenId" is required.' });
      }
      const originalValue = manager.detokenizeSensitive(String(tokenId), user);
      return res.json({ success: true, data: { originalValue } });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  });

  // POST /api/jarvis/security/delegations - Create time-bound granular delegation
  router.post('/delegations', (req: Request, res: Response) => {
    try {
      const user = getUser(req);
      const { delegateeId, resource, action, level, reason, durationMinutes } = req.body;
      if (!delegateeId || !resource || !action) {
        return res.status(400).json({ success: false, error: 'Fields "delegateeId", "resource", and "action" are required.' });
      }
      const delegation = manager.createDelegation(
        {
          delegateeId: String(delegateeId),
          resource: resource as ResourceType,
          action: action as PermissionAction,
          level: (level as PermissionLevel) || PermissionLevel.READ,
          reason: reason || 'Granular subagent delegation',
          durationMinutes: durationMinutes ? Number(durationMinutes) : 30,
        },
        user
      );
      return res.status(201).json({ success: true, data: delegation });
    } catch (err: any) {
      return res.status(403).json({ success: false, error: err.message });
    }
  });

  // GET /api/jarvis/security/delegations - List active delegations
  router.get('/delegations', (req: Request, res: Response) => {
    try {
      const user = getUser(req);
      const delegateeId = req.query.delegateeId as string | undefined;
      const activeOnly = req.query.activeOnly === 'true';
      const delegations = manager.listDelegations({ delegateeId, activeOnly }, user);
      return res.json({ success: true, count: delegations.length, data: delegations });
    } catch (err: any) {
      return res.status(403).json({ success: false, error: err.message });
    }
  });

  // DELETE /api/jarvis/security/delegations/:id - Revoke delegation
  router.delete('/delegations/:id', (req: Request, res: Response) => {
    try {
      const user = getUser(req);
      const id = req.params.id;
      const revoked = manager.revokeDelegation(id, user);
      return res.json({ success: true, data: { revoked } });
    } catch (err: any) {
      return res.status(403).json({ success: false, error: err.message });
    }
  });

  // POST /api/jarvis/security/audit-payload - Inspect payload for injections and traversal
  router.post('/audit-payload', (req: Request, res: Response) => {
    try {
      const user = getUser(req);
      const { payload } = req.body;
      if (payload === undefined || payload === null) {
        return res.status(400).json({ success: false, error: 'Field "payload" is required.' });
      }
      const audit = manager.auditPayload(payload, user);
      return res.json({ success: true, data: audit });
    } catch (err: any) {
      return res.status(403).json({ success: false, error: err.message });
    }
  });

  // GET /api/jarvis/security/posture - Real-time security posture overview
  router.get('/posture', (req: Request, res: Response) => {
    try {
      const user = getUser(req);
      const posture = manager.getSecurityPosture(user);
      return res.json({ success: true, data: posture });
    } catch (err: any) {
      return res.status(403).json({ success: false, error: err.message });
    }
  });

  return router;
}
