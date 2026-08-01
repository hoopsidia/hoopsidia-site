import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/pmc/supabaseAdmin";
import { verifyAdmin } from "@/lib/pmc/adminAuth";

const ACTIONS: Record<string, string> = {
  valider: "verifie",
  doublon: "doublon",
  rejeter: "rejete",
};

export async function POST(request: Request) {
  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: "non autorisé" }, { status: 403 });
  }
  const { id, action } = await request.json().catch(() => ({}));
  const statut = ACTIONS[action];
  if (typeof id !== "string" || !statut) {
    return NextResponse.json({ error: "requête invalide" }, { status: 400 });
  }
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("terrains").update({ statut }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
