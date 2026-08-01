import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/pmc/supabaseAdmin";
import { verifyAdmin } from "@/lib/pmc/adminAuth";

// Merge a duplicate: fold its confirmations count into the kept terrain, then
// delete it (its confirmation rows cascade away). §8 back-office.
export async function POST(request: Request) {
  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: "non autorisé" }, { status: 403 });
  }
  const { keepId, dropId } = await request.json().catch(() => ({}));
  if (typeof keepId !== "string" || typeof dropId !== "string" || keepId === dropId) {
    return NextResponse.json({ error: "requête invalide" }, { status: 400 });
  }
  const supabase = getSupabaseAdmin();

  const [{ data: keep }, { data: drop }] = await Promise.all([
    supabase.from("terrains").select("nb_confirmations").eq("id", keepId).single(),
    supabase.from("terrains").select("nb_confirmations").eq("id", dropId).single(),
  ]);
  if (!keep || !drop) {
    return NextResponse.json({ error: "terrain introuvable" }, { status: 404 });
  }

  const upd = await supabase
    .from("terrains")
    .update({ nb_confirmations: keep.nb_confirmations + drop.nb_confirmations })
    .eq("id", keepId);
  if (upd.error) return NextResponse.json({ error: upd.error.message }, { status: 500 });

  const del = await supabase.from("terrains").delete().eq("id", dropId);
  if (del.error) return NextResponse.json({ error: del.error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
