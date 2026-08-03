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
  const { data, error } = await supabase
    .from("terrains")
    .select("id, latitude, longitude, ville, departement, statut, photo_apres_url, nb_confirmations, nb_paniers, nb_filets_a_remplacer, nom_terrain, created_at")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  // `etat` isn't a stored column — it's derived (an after-photo means the net
  // has been replaced), mirroring the terrains_public view.
  const terrains = (data ?? []).map(({ photo_apres_url, ...t }) => ({
    ...t,
    etat: photo_apres_url ? "remplace" : "a_remplacer",
  }));
  return NextResponse.json({ terrains });
}
