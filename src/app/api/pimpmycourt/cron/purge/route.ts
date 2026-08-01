import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/pmc/supabaseAdmin";

// Daily purge (§11): clear the postal address of kit requests 60+ days after
// the kit was sent. Protected by CRON_SECRET (same secret as the site's other
// cron). Vercel Cron sends `Authorization: Bearer <CRON_SECRET>`.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "non autorisé" }, { status: 401 });
  }

  const cutoff = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("demandes_kit")
    .update({ adresse: null, code_postal: null, ville: null })
    .not("adresse", "is", null)
    .in("statut_demande", ["expediee", "livree", "rushes_recus"])
    .lt("updated_at", cutoff)
    .select("id");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, purged: data?.length ?? 0 });
}
