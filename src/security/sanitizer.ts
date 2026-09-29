const SENSITIVE_KEY_PATTERNS = [
  /api[_-]?key/i,
  /auth(orization)?/i,
  /bearer/i,
  /secret/i,
  /password/i,
  /passwd/i,
  /token/i,
  /private[_-]?key/i,
  /credential/i,
  /cookie/i,
  /session[_-]?id/i,
];

const SENSITIVE_VALUE_PATTERNS = [
  /bearer\s+[a-zA-Z0-9_\-\.]+/gi,
  /sk-[a-zA-Z0-9]{20,}/gi,
  /ai[a-zA-Z0-9_\-]{20,}/gi,
  /-----BEGIN [A-Z ]+ PRIVATE KEY-----[a-zA-Z0-9\/\+=\r\n]+-----END [A-Z ]+ PRIVATE KEY-----/gi,
];

export const REDACTED_PLACEHOLDER = '[REDACTED]';

export function isSensitiveKey(key: string): boolean {
  return SENSITIVE_KEY_PATTERNS.some((pattern) => pattern.test(key));
}

export function sanitizeString(value: string): string {
  let sanitized = value;
  for (const pattern of SENSITIVE_VALUE_PATTERNS) {
    sanitized = sanitized.replace(pattern, REDACTED_PLACEHOLDER);
  }
  return sanitized;
}

export function sanitizeData<T>(data: T): T {
  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data === 'string') {
    return sanitizeString(data) as unknown as T;
  }

  if (typeof data === 'number' || typeof data === 'boolean') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeData(item)) as unknown as T;
  }

  if (typeof data === 'object') {
    const sanitizedObj: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
      if (isSensitiveKey(key)) {
        sanitizedObj[key] = REDACTED_PLACEHOLDER;
      } else {
        sanitizedObj[key] = sanitizeData(value);
      }
    }
    return sanitizedObj as T;
  }

  return data;
}
