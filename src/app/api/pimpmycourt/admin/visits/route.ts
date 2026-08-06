import { NextResponse } from "next/server";
import { getRedis } from "@/lib/pmc/rateLimit";
import { verifyAdmin } from "@/lib/pmc/adminAuth";

// Visitor stats for the back-office: total page views + unique visitors.
export async function GET(request: Request) {
  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: "non autorisé" }, { status: 403 });
  }
  const r = getRedis();
  if (!r) return NextResponse.json({ pageviews: 0, visitors: 0 });
  const [pv, uv] = await Promise.all([
    r.get<number>("pmc:pageviews"),
    r.pfcount("pmc:visitors"),
  ]);
  return NextResponse.json({ pageviews: Number(pv) || 0, visitors: Number(uv) || 0 });
}
