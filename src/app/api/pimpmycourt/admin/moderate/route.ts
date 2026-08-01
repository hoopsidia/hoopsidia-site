import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/pmc/supabaseAdmin";
import { verifyAdmin } from "@/lib/pmc/adminAuth";
import { sendTerrainValide } from "@/lib/pmc/email";

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

  // Notify the reporter when their terrain goes live.
  if (statut === "verifie") {
    const { data } = await supabase.from("terrains").select("contact_email").eq("id", id).single();
    if (data?.contact_email) await sendTerrainValide(data.contact_email, id);
  }
  return NextResponse.json({ ok: true });
}
