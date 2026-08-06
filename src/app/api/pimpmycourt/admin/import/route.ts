import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/pmc/supabaseAdmin";
import { verifyAdmin } from "@/lib/pmc/adminAuth";

const STATUTS = new Set([
  "signale", "verifie", "kit_demande", "kit_envoye", "pose_effectuee", "rushes_recus",
]);
const CATEGORIES = new Set(["filet", "panneau", "arceau", "sol", "tracage"]);

// Seed the map before launch (§8). Accepts CSV with a header row; columns:
// latitude, longitude, ville, statut, photo, categorie. Rows land as
// source = 'import'. Skips invalid rows and reports how many were dropped.
export async function POST(request: Request) {
  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: "non autorisé" }, { status: 403 });
  }
  const csv = await request.text();
  const lines = csv.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) {
    return NextResponse.json({ error: "CSV vide" }, { status: 400 });
  }
  const header = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const col = (name: string) => header.indexOf(name);
  const iLat = col("latitude"), iLng = col("longitude"), iVille = col("ville");
  const iStatut = col("statut"), iPhoto = col("photo"), iCat = col("categorie");
  if (iLat < 0 || iLng < 0 || iPhoto < 0) {
    return NextResponse.json({ error: "colonnes requises: latitude, longitude, photo" }, { status: 400 });
  }

  const rows: Record<string, unknown>[] = [];
  let skipped = 0;
  for (const line of lines.slice(1)) {
    const c = line.split(",");
    const lat = Number(c[iLat]), lng = Number(c[iLng]);
    const photo = (c[iPhoto] ?? "").trim();
    const statut = iStatut >= 0 ? (c[iStatut] ?? "").trim() : "verifie";
    const categorie = iCat >= 0 ? (c[iCat] ?? "").trim() || "filet" : "filet";
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180 || !photo) {
      skipped++; continue;
    }
    rows.push({
      latitude: lat, longitude: lng,
      ville: iVille >= 0 ? (c[iVille] ?? "").trim() || null : null,
      photo_avant_url: photo,
      statut: STATUTS.has(statut) ? statut : "verifie",
      categorie: CATEGORIES.has(categorie) ? categorie : "filet",
      source: "import",
    });
  }
  if (!rows.length) {
    return NextResponse.json({ error: "aucune ligne valide", skipped }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { error, count } = await supabase.from("terrains").insert(rows, { count: "exact" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, inserted: count ?? rows.length, skipped });
}
