import { Redis } from "@upstash/redis";

const TOKEN_KEY = "ig:access_token";

function getRedis(): Redis | null {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

// Reads the live token from the KV store, falling back to the build-time env
// var. The cron refresh writes the rotated token to KV, so KV is the source of
// truth once configured; env remains the bootstrap value.
export async function getAccessToken(): Promise<string | undefined> {
  const redis = getRedis();
  if (redis) {
    const stored = await redis.get<string>(TOKEN_KEY);
    if (stored) return stored;
  }
  return process.env.META_ACCESS_TOKEN;
}

export async function setAccessToken(token: string): Promise<boolean> {
  const redis = getRedis();
  if (!redis) return false;
  await redis.set(TOKEN_KEY, token);
  return true;
}

type RefreshResult =
  | { ok: true; expiresIn: number; persisted: boolean }
  | { ok: false; error: string };

// Extends a long-lived Instagram token by 60 days. Instagram requires the
// current token to be valid and at least 24h old; an expired token cannot be
// refreshed and must be regenerated manually.
export async function refreshAccessToken(): Promise<RefreshResult> {
  const current = await getAccessToken();
  if (!current) return { ok: false, error: "No current token available" };

  const res = await fetch(
    `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${current}`,
    { cache: "no-store" },
  );
  const data = await res.json();

  if (!res.ok || !data.access_token) {
    return { ok: false, error: data?.error?.message ?? `Refresh failed (${res.status})` };
  }

  const persisted = await setAccessToken(data.access_token);
  return { ok: true, expiresIn: data.expires_in ?? 0, persisted };
}
