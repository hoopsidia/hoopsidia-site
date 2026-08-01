import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/pmc/supabaseAdmin";
import { verifyAdmin } from "@/lib/pmc/adminAuth";

// Full export of validated terrains — the geolocated base is a project asset (§8).
export async function GET(request: Request) {
  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: "non autorisé" }, { status: 403 });
  }
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("terrains")
    .select("id, latitude, longitude, ville, code_postal, departement, statut, categorie, nb_confirmations, photo_avant_url, photo_apres_url, created_at")
    .not("statut", "in", "(signale,rejete,doublon)")
    .order("created_at", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const cols = [
    "id", "latitude", "longitude", "ville", "code_postal", "departement",
    "statut", "categorie", "nb_confirmations", "photo_avant_url", "photo_apres_url", "created_at",
  ];
  const esc = (v: unknown) => {
    const s = v == null ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [cols.join(",")];
  for (const r of data ?? []) {
    lines.push(cols.map((c) => esc((r as Record<string, unknown>)[c])).join(","));
  }

  return new NextResponse(lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="pimpmycourt-terrains.csv"',
    },
  });
}
