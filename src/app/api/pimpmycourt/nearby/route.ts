import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/pmc/supabaseAdmin";
import { distanceMeters } from "@/lib/pmc/geo";

// Returns the nearest already-registered terrain within 50 m of a point, so the
// form can prompt "déjà signalé, tu confirmes ?" (§5 duplicate handling). Runs
// with the service role — it must match against terrains of ANY status, not
// just the publicly visible ones, but returns only non-sensitive fields.
export async function POST(request: Request) {
  const { lat, lng } = await request.json().catch(() => ({}));
  if (typeof lat !== "number" || typeof lng !== "number") {
    return NextResponse.json({ error: "coordonnées invalides" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  // Pre-filter with a ~120 m bounding box, then refine with haversine.
  const d = 0.0012;
  const { data, error } = await supabase
    .from("terrains")
    .select("id, latitude, longitude, ville, photo_avant_url, nb_confirmations, statut")
    .gte("latitude", lat - d)
    .lte("latitude", lat + d)
    .gte("longitude", lng - d)
    .lte("longitude", lng + d)
    .not("statut", "in", "(rejete,doublon)");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let nearest: { id: string; ville: string | null; photo_avant_url: string; nb_confirmations: number; distance: number } | null = null;
  for (const t of data ?? []) {
    const dist = distanceMeters(lat, lng, t.latitude, t.longitude);
    if (dist <= 50 && (!nearest || dist < nearest.distance)) {
      nearest = {
        id: t.id,
        ville: t.ville,
        photo_avant_url: t.photo_avant_url,
        nb_confirmations: t.nb_confirmations,
        distance: Math.round(dist),
      };
    }
  }

  return NextResponse.json({ duplicate: nearest });
}
