import "server-only";
import { createHash } from "crypto";
import { Redis } from "@upstash/redis";

// IP rate limiting via Upstash Redis (reuses the site's existing KV creds). If
// KV isn't configured (e.g. local dev), it no-ops and allows the request.
export function getRedis(): Redis | null {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

export function clientIp(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for") ?? "";
  return fwd.split(",")[0].trim() || "unknown";
}

// Never store the raw IP (RGPD) — key on a hash.
export function ipHash(ip: string): string {
  return createHash("sha256").update(ip).digest("hex").slice(0, 24);
}

export async function rateLimitOk(key: string, max: number, windowSec: number): Promise<boolean> {
  const r = getRedis();
  if (!r) return true;
  try {
    const n = await r.incr(key);
    if (n === 1) await r.expire(key, windowSec);
    return n <= max;
  } catch {
    return true; // fail open — never block a legit user on a Redis hiccup
  }
}
