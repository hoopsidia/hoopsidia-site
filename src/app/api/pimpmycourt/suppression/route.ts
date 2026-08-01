import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/pmc/supabaseAdmin";

// RGPD deletion request (§11). Anonymises the person's signalements (the map
// point stays, personal fields are cleared) and deletes their kit requests and
// confirmations. Always returns ok — never reveals whether the email exists.
export async function POST(request: Request) {
  const { email } = await request.json().catch(() => ({}));
  if (typeof email !== "string" || !email.includes("@")) {
    return NextResponse.json({ error: "email invalide" }, { status: 400 });
  }
  const e = email.trim();
  const supabase = getSupabaseAdmin();

  await supabase
    .from("terrains")
    .update({ contact_email: null, contact_instagram: null, prenom: null })
    .eq("contact_email", e);
  await supabase.from("demandes_kit").delete().eq("email", e);
  await supabase.from("confirmations").delete().eq("email", e);

  return NextResponse.json({ ok: true });
}
