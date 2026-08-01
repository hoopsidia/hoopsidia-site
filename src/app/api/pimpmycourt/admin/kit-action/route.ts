import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/pmc/supabaseAdmin";
import { verifyAdmin } from "@/lib/pmc/adminAuth";
import { sendKitApprouve, sendKitLivre } from "@/lib/pmc/email";

// Kit lifecycle from the back-office (§8). Enforces the minor lock: a request
// from someone under 18 cannot ship until the parental authorization is
// validated. The "delivered" action is the manual trigger for the most
// important email (§9), fired when Valentin sees the Amazon tracking.
export async function POST(request: Request) {
  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: "non autorisé" }, { status: 403 });
  }
  const body = await request.json().catch(() => ({}));
  const { id, action } = body as { id?: string; action?: string };
  if (typeof id !== "string" || !action) {
    return NextResponse.json({ error: "requête invalide" }, { status: 400 });
  }
  const supabase = getSupabaseAdmin();
  const { data: kit } = await supabase
    .from("demandes_kit")
    .select("id, email, age, autorisation_validee, terrain_id")
    .eq("id", id)
    .single();
  if (!kit) return NextResponse.json({ error: "demande introuvable" }, { status: 404 });

  const isMinor = typeof kit.age === "number" && kit.age > 0 && kit.age < 18;
  const patch: Record<string, unknown> = {};
  let terrainStatut: string | null = null;

  switch (action) {
    case "approve":
      patch.statut_demande = "approuvee";
      terrainStatut = "kit_demande";
      break;
    case "validate_parental":
      patch.autorisation_validee = true;
      break;
    case "ship":
      if (isMinor && !kit.autorisation_validee) {
        return NextResponse.json({ error: "autorisation parentale non validée" }, { status: 409 });
      }
      patch.statut_demande = "expediee";
      if (body.numero_commande_amazon) patch.numero_commande_amazon = String(body.numero_commande_amazon);
      if (body.date_expedition) patch.date_expedition = String(body.date_expedition);
      if (body.cout_kit != null) patch.cout_kit = Number(body.cout_kit);
      terrainStatut = "kit_envoye";
      break;
    case "delivered":
      patch.statut_demande = "livree";
      patch.livree_at = new Date().toISOString();
      break;
    case "rushes":
      patch.statut_demande = "rushes_recus";
      patch.rushes_recus_at = new Date().toISOString();
      terrainStatut = "rushes_recus";
      break;
    case "reject":
      patch.statut_demande = "rejetee";
      break;
    default:
      return NextResponse.json({ error: "action inconnue" }, { status: 400 });
  }

  const { error } = await supabase.from("demandes_kit").update(patch).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (terrainStatut && kit.terrain_id) {
    await supabase.from("terrains").update({ statut: terrainStatut }).eq("id", kit.terrain_id);
  }
  if (action === "approve" && kit.email) await sendKitApprouve(kit.email);
  if (action === "delivered" && kit.email) await sendKitLivre(kit.email);

  return NextResponse.json({ ok: true });
}
