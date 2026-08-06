import { NextResponse } from "next/server";
import { getRedis, clientIp, ipHash } from "@/lib/pmc/rateLimit";

// Lightweight visit counter: total page views + approximate unique visitors
// (HyperLogLog keyed on a hashed IP, so no raw IP is stored — RGPD-safe).
export async function POST(request: Request) {
  const r = getRedis();
  if (!r) return NextResponse.json({ ok: true });
  try {
    await Promise.all([
      r.incr("pmc:pageviews"),
      r.pfadd("pmc:visitors", ipHash(clientIp(request))),
    ]);
  } catch {
    /* non-blocking */
  }
  return NextResponse.json({ ok: true });
}
