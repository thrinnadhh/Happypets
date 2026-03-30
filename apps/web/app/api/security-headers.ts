// apps/web/app/api/security-headers.ts
import { NextRequest, NextResponse } from 'next/server';
import { isAllowedOrigin } from '@/lib/security';

export type ApiHandler = (
  req: NextRequest,
  context?: { params: Record<string, string> }
) => Promise<NextResponse>;

/**
 * Security headers applied to every API response.
 */
const SECURITY_HEADERS: Record<string, string> = {
  // Prevent content sniffing
  'X-Content-Type-Options': 'nosniff',
  // Block clickjacking
  'X-Frame-Options': 'DENY',
  // Disable legacy XSS filter (modern CSP takes over)
  'X-XSS-Protection': '0',
  // HSTS — enforce HTTPS for 1 year, include subdomains
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  // Referrer information (minimal)
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  // Permissions policy — restrict sensitive browser features
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(self)',
  // Content Security Policy
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    `img-src 'self' data: https://res.cloudinary.com https://*.supabase.co`,
    "connect-src 'self' https://*.supabase.co https://api.razorpay.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; '),
};

/**
 * Apply security headers to an existing response.
 */
function applySecurityHeaders(response: NextResponse): NextResponse {
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

/**
 * Higher-order function: wraps an API route handler with:
 *  1. Security headers on every response
 *  2. Optional origin validation for state-mutating methods
 */
export function withSecurityHeaders(
  handler: ApiHandler,
  options: { validateOrigin?: boolean } = {}
): ApiHandler {
  return async (req, context) => {
    // Origin validation for mutations (POST, PUT, PATCH, DELETE)
    if (options.validateOrigin && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
      const origin = req.headers.get('origin');
      if (!isAllowedOrigin(origin)) {
        const err = NextResponse.json(
          { error: 'Forbidden: origin not allowed' },
          { status: 403 }
        );
        return applySecurityHeaders(err);
      }
    }

    // Call the actual handler
    let response: NextResponse;
    try {
      response = await handler(req, context);
    } catch (error) {
      console.error('[API Error]', error);
      response = NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }

    return applySecurityHeaders(response);
  };
}

/**
 * Convenience: add security headers to an arbitrary existing response.
 */
export { applySecurityHeaders };
