import "server-only";

/**
 * Lightweight in-memory rate limiter (fixed window). Good enough for a single
 * Vercel instance / dev. For multi-instance production, swap the Map for Upstash
 * Redis (@upstash/ratelimit) — the call sites won't change.
 *
 * Used to throttle auth endpoints and the inquiry form (anti-brute-force /
 * anti-spam), as required by the security spec.
 */

type Bucket = { count: number; resetAt: number };
const store = new Map<string, Bucket>();

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

export function rateLimit(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number },
): RateLimitResult {
  const now = Date.now();
  const existing = store.get(key);

  if (!existing || existing.resetAt < now) {
    const resetAt = now + windowMs;
    store.set(key, { count: 1, resetAt });
    return { success: true, remaining: limit - 1, resetAt };
  }

  existing.count += 1;
  const success = existing.count <= limit;
  return {
    success,
    remaining: Math.max(0, limit - existing.count),
    resetAt: existing.resetAt,
  };
}

/** Best-effort client IP from forwarded headers. */
export function clientIp(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "unknown"
  );
}

// Opportunistically evict expired buckets so the Map can't grow unbounded.
if (typeof setInterval !== "undefined") {
  const timer = setInterval(() => {
    const now = Date.now();
    for (const [k, v] of store) if (v.resetAt < now) store.delete(k);
  }, 60_000);
  // Don't keep the process alive just for cleanup.
  (timer as { unref?: () => void }).unref?.();
}
