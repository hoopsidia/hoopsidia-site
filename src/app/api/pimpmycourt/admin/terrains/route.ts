import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/pmc/supabaseAdmin";
import { verifyAdmin } from "@/lib/pmc/adminAuth";

// Full terrain list for the back-office: lets the admin browse validated
// terrains and hand-pick signalements to regroup (merge). Returns every status
// so the UI can filter client-side (validés / signalés / tous).
export async function GET(request: Request) {
  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: "non autorisé" }, { status: 403 });
  }
  const supabase = getSupabaseAdmin();
  const withDate = "id, latitude, longitude, ville, departement, statut, date_remplacement, nb_confirmations, nb_paniers, nb_filets_a_remplacer, nom_terrain, created_at";
  const noDate = "id, latitude, longitude, ville, departement, statut, nb_confirmations, nb_paniers, nb_filets_a_remplacer, nom_terrain, created_at";

  type Row = {
    id: string; latitude: number; longitude: number;
    ville: string | null; departement: string | null; statut: string;
    date_remplacement?: string | null;
    nb_confirmations: number; nb_paniers: number | null; nb_filets_a_remplacer: number | null;
    nom_terrain: string | null; created_at: string;
  };

  let rows: Row[];
  const primary = await supabase.from("terrains").select(withDate).order("created_at", { ascending: false });
  if (primary.error) {
    // Pre-migration fallback: date_remplacement column not created yet.
    const fb = await supabase.from("terrains").select(noDate).order("created_at", { ascending: false });
    if (fb.error) return NextResponse.json({ error: fb.error.message }, { status: 500 });
    rows = (fb.data ?? []) as unknown as Row[];
  } else {
    rows = (primary.data ?? []) as unknown as Row[];
  }

  // `etat` isn't a stored column — it's derived from the replacement date,
  // exactly like the public terrains_public view (so admin and map agree).
  const terrains = rows.map(({ date_remplacement, ...rest }) => {
    const dr = date_remplacement ?? null;
    return { ...rest, date_remplacement: dr, etat: dr ? "remplace" : "a_remplacer" };
  });
  return NextResponse.json({ terrains });
}
