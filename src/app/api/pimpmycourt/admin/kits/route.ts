import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/pmc/supabaseAdmin";
import { verifyAdmin } from "@/lib/pmc/adminAuth";

// Kit requests list for the back-office (§8). Empty until the kit form (§7)
// ships; the view is built so it lights up as soon as requests arrive.
export async function GET(request: Request) {
  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: "non autorisé" }, { status: 403 });
  }
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("demandes_kit")
    .select("id, prenom, nom, email, telephone, age, trepied, modele_telephone, autorisation_validee, statut_demande, cout_kit, created_at, terrain_id")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ kits: data ?? [] });
}
