// apps/web/lib/security.ts
import crypto from 'crypto';

// ─── Timing-Safe Comparison ────────────────────────────────────────────────

/**
 * Timing-safe string comparison to prevent timing attacks on HMAC signatures.
 * Always compares using constant-time buffer equality.
 */
export function timingSafeCompare(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') return false;

  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');

  // Pad to same length to prevent short-circuit exit
  const maxLen = Math.max(bufA.length, bufB.length);
  const paddedA = Buffer.concat([bufA, Buffer.alloc(maxLen - bufA.length)]);
  const paddedB = Buffer.concat([bufB, Buffer.alloc(maxLen - bufB.length)]);

  // timingSafeEqual throws if buffers differ in size — use padded versions
  const isEqual = crypto.timingSafeEqual(paddedA, paddedB);
  // Still check lengths separately (timing-safe length mismatch)
  return isEqual && bufA.length === bufB.length;
}

/**
 * Verify Razorpay payment signature using timing-safe HMAC comparison.
 */
export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    secureLog('error', 'RAZORPAY_KEY_SECRET is not set');
    return false;
  }

  const message = `${orderId}|${paymentId}`;
  const expected = crypto
    .createHmac('sha256', secret)
    .update(message)
    .digest('hex');

  return timingSafeCompare(expected, signature);
}

// ─── Cloudinary / Image Validation ────────────────────────────────────────

/** Allowlist: only alphanumerics, underscores, hyphens, forward slashes */
const SAFE_PUBLIC_ID_RE = /^[a-zA-Z0-9_\-/]+$/;

/**
 * Validate a Cloudinary publicId to prevent directory traversal.
 * Returns true only if the ID contains safe characters and no path traversal sequences.
 */
export function validateCloudinaryPublicId(publicId: string): boolean {
  if (!publicId || typeof publicId !== 'string') return false;
  if (publicId.includes('..')) return false;
  if (publicId.startsWith('/')) return false;
  if (publicId.length > 255) return false;
  return SAFE_PUBLIC_ID_RE.test(publicId);
}

// ─── File Upload Validation ────────────────────────────────────────────────

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export function validateFileUpload(
  file: File | { type: string; size: number }
): FileValidationResult {
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return { valid: false, error: 'File type not allowed' };
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { valid: false, error: 'File too large (max 5 MB)' };
  }
  return { valid: true };
}

// ─── Error Sanitization ────────────────────────────────────────────────────

const SENSITIVE_KEYS = new Set([
  'password',
  'token',
  'secret',
  'key',
  'authorization',
  'cookie',
  'session',
  'credential',
  'apiKey',
  'api_key',
  'accessToken',
  'refreshToken',
]);

/**
 * Redact sensitive fields before logging or returning error details.
 */
export function sanitizeErrorContext(
  context: Record<string, unknown>
): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(context)) {
    const keyLower = k.toLowerCase();
    const isSensitive = [...SENSITIVE_KEYS].some((s) =>
      keyLower.includes(s.toLowerCase())
    );
    sanitized[k] = isSensitive ? '[REDACTED]' : v;
  }
  return sanitized;
}

/**
 * Return a safe, generic error message for client responses.
 * Never expose internal error details to the client.
 */
export function safeErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    // Only expose generic validation messages
    if (error.message.toLowerCase().includes('validation')) {
      return 'Validation failed';
    }
  }
  return 'An unexpected error occurred';
}

// ─── Secure Logging ────────────────────────────────────────────────────────

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export function secureLog(
  level: LogLevel,
  message: string,
  context?: Record<string, unknown>
): void {
  const sanitized = context ? sanitizeErrorContext(context) : undefined;
  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(sanitized ? { context: sanitized } : {}),
  };

  if (level === 'error') {
    console.error(JSON.stringify(logEntry));
  } else if (level === 'warn') {
    console.warn(JSON.stringify(logEntry));
  } else {
    console.log(JSON.stringify(logEntry));
  }
}

// ─── Origin & Protocol Validation ─────────────────────────────────────────

/**
 * Allowed origins for API requests. Can be extended via environment variable.
 */
function getAllowedOrigins(): Set<string> {
  const base = new Set<string>([
    process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
  ]);

  const extra = process.env.ALLOWED_ORIGINS;
  if (extra) {
    extra.split(',').forEach((o) => base.add(o.trim()));
  }

  return base;
}

export function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;
  return getAllowedOrigins().has(origin);
}

export function isHttps(url: string): boolean {
  try {
    return new URL(url).protocol === 'https:';
  } catch {
    return false;
  }
}

// ─── Rate Limiting helpers ─────────────────────────────────────────────────

/**
 * Generate a rate-limit key for Redis combining IP and endpoint.
 */
export function rateLimitKey(ip: string, endpoint: string): string {
  // Hash the IP to avoid storing it directly (privacy)
  const hashed = crypto
    .createHash('sha256')
    .update(ip + (process.env.RATE_LIMIT_SALT ?? 'default-salt'))
    .digest('hex')
    .slice(0, 16);
  return `rl:${endpoint}:${hashed}`;
}
