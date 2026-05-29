import { NextResponse } from "next/server";
import { refreshAccessToken } from "@/lib/igToken";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await refreshAccessToken();

  if (!result.ok) {
    console.error("IG token refresh failed:", result.error);
    return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
  }

  if (!result.persisted) {
    return NextResponse.json(
      { ok: false, error: "Token refreshed but no KV store configured to persist it" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, expiresInDays: Math.round(result.expiresIn / 86400) });
}
