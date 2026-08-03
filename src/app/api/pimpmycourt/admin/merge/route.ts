import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/pmc/supabaseAdmin";
import { verifyAdmin } from "@/lib/pmc/adminAuth";

// Merge duplicates into one kept terrain: fold their confirmation counts into
// the kept terrain, then delete them (confirmation rows cascade away). Accepts
// a single `dropId` or a list `dropIds` (regroup several signalements). §8.
export async function POST(request: Request) {
  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: "non autorisé" }, { status: 403 });
  }
  const body = await request.json().catch(() => ({}));
  const keepId = body.keepId;
  const dropIds: string[] = Array.isArray(body.dropIds)
    ? body.dropIds
    : typeof body.dropId === "string"
      ? [body.dropId]
      : [];
  const drops = [...new Set(dropIds.filter((d) => typeof d === "string" && d !== keepId))];
  if (typeof keepId !== "string" || drops.length === 0) {
    return NextResponse.json({ error: "requête invalide" }, { status: 400 });
  }
  const supabase = getSupabaseAdmin();

  const { data: rows, error: selErr } = await supabase
    .from("terrains")
    .select("id, nb_confirmations")
    .in("id", [keepId, ...drops]);
  if (selErr) return NextResponse.json({ error: selErr.message }, { status: 500 });
  const keep = rows?.find((r) => r.id === keepId);
  if (!keep) {
    return NextResponse.json({ error: "terrain à conserver introuvable" }, { status: 404 });
  }
  const dropRows = (rows ?? []).filter((r) => r.id !== keepId);
  const foldedConfirmations = dropRows.reduce((sum, r) => sum + (r.nb_confirmations ?? 0), keep.nb_confirmations);

  const upd = await supabase
    .from("terrains")
    .update({ nb_confirmations: foldedConfirmations })
    .eq("id", keepId);
  if (upd.error) return NextResponse.json({ error: upd.error.message }, { status: 500 });

  const del = await supabase.from("terrains").delete().in("id", dropRows.map((r) => r.id));
  if (del.error) return NextResponse.json({ error: del.error.message }, { status: 500 });

  return NextResponse.json({ ok: true, merged: dropRows.length });
}
