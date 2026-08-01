import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/pmc/supabaseAdmin";
import { verifyAdmin } from "@/lib/pmc/adminAuth";
import { distanceMeters } from "@/lib/pmc/geo";

// Moderation queue: pending `signale` terrains, newest/most-confirmed first,
// each with a nearby (<50 m) merge candidate if one exists.
export async function GET(request: Request) {
  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: "non autorisé" }, { status: 403 });
  }
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("terrains")
    .select("id, latitude, longitude, ville, departement, statut, photo_avant_url, nb_confirmations, contact_email, contact_instagram, prenom, commentaire, created_at")
    .order("nb_confirmations", { ascending: false })
    .order("created_at", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const all = data ?? [];
  const pending = all.filter((t) => t.statut === "signale");

  const queue = pending.map((t) => {
    let candidate: { id: string; ville: string | null; statut: string; distance: number } | null = null;
    for (const o of all) {
      if (o.id === t.id || o.statut === "rejete" || o.statut === "doublon") continue;
      const dist = distanceMeters(t.latitude, t.longitude, o.latitude, o.longitude);
      if (dist <= 50 && (!candidate || dist < candidate.distance)) {
        candidate = { id: o.id, ville: o.ville, statut: o.statut, distance: Math.round(dist) };
      }
    }
    return { ...t, merge_candidate: candidate };
  });

  return NextResponse.json({ queue, pendingCount: pending.length });
}
