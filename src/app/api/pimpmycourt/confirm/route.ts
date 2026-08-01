import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/pmc/supabaseAdmin";

// Confirms an existing terrain ("déjà signalé, tu confirmes ?"). One
// confirmation per email per terrain; a trigger bumps nb_confirmations. A
// repeat confirmation is a no-op, not an error.
export async function POST(request: Request) {
  const { terrain_id, email } = await request.json().catch(() => ({}));
  if (typeof terrain_id !== "string" || typeof email !== "string" || !email.includes("@")) {
    return NextResponse.json({ error: "requête invalide" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("confirmations")
    .insert({ terrain_id, email: email.trim() });

  // 23505 = unique_violation → already confirmed by this email, treat as success.
  if (error && error.code !== "23505") {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
