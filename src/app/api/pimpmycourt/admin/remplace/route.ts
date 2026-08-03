import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/pmc/supabaseAdmin";
import { verifyAdmin } from "@/lib/pmc/adminAuth";

// Mark a terrain's net as replaced on a given date (or undo it). The date makes
// `etat` flip to "remplace" in the public view, so it shows up publicly (green).
export async function POST(request: Request) {
  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: "non autorisé" }, { status: 403 });
  }
  const { id, date } = await request.json().catch(() => ({}));
  if (typeof id !== "string") {
    return NextResponse.json({ error: "requête invalide" }, { status: 400 });
  }
  // `date` = 'YYYY-MM-DD' to mark replaced, null/empty to undo.
  const value = typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : null;
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("terrains").update({ date_remplacement: value }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, date_remplacement: value });
}
