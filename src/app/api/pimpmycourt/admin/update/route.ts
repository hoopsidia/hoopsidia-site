import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/pmc/supabaseAdmin";
import { verifyAdmin } from "@/lib/pmc/adminAuth";

// Edit a terrain's fields from the back-office (whitelisted columns only).
const FIELDS = [
  "nom_terrain",
  "ville",
  "departement",
  "code_postal",
  "nb_paniers",
  "nb_filets_a_remplacer",
  "latitude",
  "longitude",
  "statut",
  "commentaire",
] as const;
const STATUTS = ["signale", "verifie", "doublon", "rejete"];

export async function POST(request: Request) {
  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: "non autorisé" }, { status: 403 });
  }
  const body = await request.json().catch(() => ({}));
  const id = body.id;
  if (typeof id !== "string") {
    return NextResponse.json({ error: "requête invalide" }, { status: 400 });
  }
  const patch: Record<string, unknown> = {};
  for (const f of FIELDS) {
    if (f in body) patch[f] = body[f] === "" ? null : body[f];
  }
  if (patch.statut != null && !STATUTS.includes(String(patch.statut))) {
    return NextResponse.json({ error: "statut invalide" }, { status: 400 });
  }
  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "rien à mettre à jour" }, { status: 400 });
  }
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("terrains").update(patch).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
