import { NextRequest, NextResponse } from "next/server";

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  /** Time window in milliseconds */
  windowMs: number;
  /** Maximum requests allowed per window */
  maxRequests: number;
}

/**
 * Rate limit check result
 */
export interface RateLimitResult {
  /** Whether the request is allowed */
  allowed: boolean;
  /** Number of requests remaining in the window */
  remaining: number;
  /** Unix timestamp when the rate limit resets */
  resetTime: number;
}

// In-memory store for rate limiting
// Note: For production with multiple instances, use Redis or similar
const requestCounts = new Map<
  string,
  { count: number; resetTime: number }
>();

// Clean up old entries every minute to prevent memory leaks
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of requestCounts.entries()) {
      if (value.resetTime < now) {
        requestCounts.delete(key);
      }
    }
  }, 60000);
}

/**
 * Get a unique identifier for the client based on IP address
 */
export function getClientIdentifier(request: NextRequest): string {
  // Try to get the real IP from various headers (works with proxies/Vercel)
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  if (realIp) {
    return realIp;
  }

  return "unknown";
}

/**
 * Check if a request is within rate limits
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const entry = requestCounts.get(identifier);

  // If no entry or window has expired, create new window
  if (!entry || entry.resetTime < now) {
    requestCounts.set(identifier, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime: now + config.windowMs,
    };
  }

  // Check if limit exceeded
  if (entry.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
    };
  }

  // Increment count and allow
  entry.count++;
  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetTime: entry.resetTime,
  };
}

/**
 * Create a 429 Too Many Requests response with proper headers
 */
export function rateLimitResponse(resetTime: number): NextResponse {
  const retryAfter = Math.ceil((resetTime - Date.now()) / 1000);

  return NextResponse.json(
    { error: "Too many requests. Please try again later." },
    {
      status: 429,
      headers: {
        "Retry-After": String(Math.max(retryAfter, 1)),
        "X-RateLimit-Reset": String(Math.floor(resetTime / 1000)),
      },
    }
  );
}

/**
 * Pre-configured rate limit settings for different endpoint types
 */
export const RATE_LIMITS = {
  /** Public endpoints - stricter limits */
  waitlist: { windowMs: 60000, maxRequests: 5 }, // 5 per minute
  feedback: { windowMs: 60000, maxRequests: 10 }, // 10 per minute
  projects: { windowMs: 60000, maxRequests: 20 }, // 20 per minute

  /** Authenticated endpoints - more lenient */
  api: { windowMs: 60000, maxRequests: 60 }, // 60 per minute
  generate: { windowMs: 60000, maxRequests: 10 }, // 10 per minute (AI is expensive)
} as const;

/**
 * Helper to apply rate limiting to a route handler
 *
 * @example
 * export async function POST(request: NextRequest) {
 *   const rateLimitResult = applyRateLimit(request, "waitlist");
 *   if (rateLimitResult) return rateLimitResult;
 *
 *   // ... rest of handler
 * }
 */
export function applyRateLimit(
  request: NextRequest,
  limitType: keyof typeof RATE_LIMITS
): NextResponse | null {
  const clientId = getClientIdentifier(request);
  const config = RATE_LIMITS[limitType];
  const result = checkRateLimit(`${limitType}:${clientId}`, config);

  if (!result.allowed) {
    return rateLimitResponse(result.resetTime);
  }

  return null;
}
