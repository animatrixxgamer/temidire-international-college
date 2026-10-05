/** Simple in-memory rate limiter (per process). Fine for Phase 1; swap for Upstash later. */
const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, limit = 10, windowMs = 60_000): boolean {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  b.count += 1;
  return b.count <= limit;
}

export function clientKey(req: Request, name: string): string {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  return `${name}:${ip}`;
}

export function tooManyRequests() {
  return Response.json(
    { error: "Too many requests. Please wait a minute and try again." },
    { status: 429 }
  );
}
