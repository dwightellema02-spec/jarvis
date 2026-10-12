export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'AUTHENTICATION_ERROR'
  | 'AUTHORIZATION_ERROR'
  | 'PERMISSION_DENIED'
  | 'TOOL_ERROR'
  | 'AGENT_ERROR'
  | 'AI_PROVIDER_ERROR'
  | 'DATABASE_ERROR'
  | 'SECURITY_BLOCK'
  | 'NOT_FOUND'
  | 'TIMEOUT'
  | 'UNKNOWN_ERROR';

export interface JarvisErrorDetails {
  code: ErrorCode;
  message: string;
  statusCode: number;
  details?: Record<string, unknown>;
  timestamp: string;
}

export class JarvisError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly details?: Record<string, unknown>;
  public readonly timestamp: string;

  constructor(code: ErrorCode, message: string, statusCode = 500, details?: Record<string, unknown>) {
    super(message);
    this.name = 'JarvisError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.timestamp = new Date().toISOString();

    // Maintain proper prototype chain
    Object.setPrototypeOf(this, new.target.prototype);
  }

  public toJSON(): JarvisErrorDetails {
    return {
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      details: this.details,
      timestamp: this.timestamp,
    };
  }
}

export class ValidationError extends JarvisError {
  constructor(message: string, details?: Record<string, unknown>) {
    super('VALIDATION_ERROR', message, 400, details);
  }
}

export class AuthenticationError extends JarvisError {
  constructor(message = 'Authentication required or invalid credentials', details?: Record<string, unknown>) {
    super('AUTHENTICATION_ERROR', message, 401, details);
  }
}

export class AuthorizationError extends JarvisError {
  constructor(message = 'Access forbidden for current identity', details?: Record<string, unknown>) {
    super('AUTHORIZATION_ERROR', message, 403, details);
  }
}

export class PermissionDeniedError extends JarvisError {
  constructor(resource: string, action: string, requiredLevel: string, details?: Record<string, unknown>) {
    super(
      'PERMISSION_DENIED',
      `Permission denied: Action '${action}' on resource '${resource}' requires permission '${requiredLevel}'`,
      403,
      { resource, action, requiredLevel, ...details }
    );
  }
}

export class SecurityBlockError extends JarvisError {
  constructor(reason: string, details?: Record<string, unknown>) {
    super('SECURITY_BLOCK', `Security Guardian blocked action: ${reason}`, 403, details);
  }
}

export class ToolError extends JarvisError {
  constructor(toolId: string, message: string, details?: Record<string, unknown>) {
    super('TOOL_ERROR', `Tool '${toolId}' execution failure: ${message}`, 500, { toolId, ...details });
  }
}

export class AgentError extends JarvisError {
  constructor(agentId: string, message: string, details?: Record<string, unknown>) {
    super('AGENT_ERROR', `Agent '${agentId}' error: ${message}`, 500, { agentId, ...details });
  }
}

export class AIProviderError extends JarvisError {
  constructor(provider: string, message: string, details?: Record<string, unknown>) {
    super('AI_PROVIDER_ERROR', `AI Provider '${provider}' error: ${message}`, 502, { provider, ...details });
  }
}

export class DatabaseError extends JarvisError {
  constructor(message: string, details?: Record<string, unknown>) {
    super('DATABASE_ERROR', `Storage failure: ${message}`, 500, details);
  }
}

export class TimeoutError extends JarvisError {
  constructor(operation: string, details?: Record<string, unknown>) {
    super('TIMEOUT', `Operation '${operation}' timed out`, 504, { operation, ...details });
  }
}

export class NotFoundError extends JarvisError {
  constructor(message = 'Requested resource not found', details?: Record<string, unknown>) {
    super('NOT_FOUND', message, 404, details);
  }
}

