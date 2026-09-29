import { RequestContext, UserInput, InputSource, SecurityContext } from './types.js';
import { PermissionGrant } from '../security/types.js';

export interface CreateRequestContextOptions {
  userId: string;
  sessionId?: string;
  input: UserInput;
  source?: InputSource;
  permissions?: PermissionGrant[];
  availableAgents?: string[];
  availableTools?: string[];
  securityContext?: Partial<SecurityContext>;
}

export function createRequestContext(options: CreateRequestContextOptions): RequestContext {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const sessionId = options.sessionId || `sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const timestamp = new Date().toISOString();

  return {
    requestId,
    userId: options.userId,
    sessionId,
    timestamp,
    input: options.input,
    source: options.source || 'api',
    permissions: options.permissions || [],
    availableAgents: options.availableAgents || [],
    availableTools: options.availableTools || [],
    securityContext: {
      authenticatedUserId: options.userId,
      userRole: options.securityContext?.userRole || 'user',
      ipAddress: options.securityContext?.ipAddress,
      userAgent: options.securityContext?.userAgent,
    },
  };
}
