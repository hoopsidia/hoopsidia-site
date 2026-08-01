import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/pmc/supabaseAdmin";

const MAX_DOC_BYTES = 10 * 1024 * 1024;

// Kit request (§6). Everything enters the queue; arbitration happens in the
// back-office. Hard requirements: email, rights assignment, the three
// commitments, and — for minors — the signed parental authorization uploaded
// to the PRIVATE kit-docs bucket.
export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "requête invalide" }, { status: 400 });
  }

  if (form.get("website")) return NextResponse.json({ ok: true }); // honeypot

  const bool = (k: string) => form.get(k) === "1" || form.get(k) === "true";
  const str = (k: string) => {
    const v = String(form.get(k) ?? "").trim();
    return v || null;
  };

  const email = String(form.get("email") ?? "").trim();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: "email invalide" }, { status: 400 });
  }
  if (!bool("cession_droits")) {
    return NextResponse.json({ error: "la cession des droits est obligatoire" }, { status: 400 });
  }
  if (!bool("engage_protocole") || !bool("engage_film") || !bool("engage_rushes")) {
    return NextResponse.json({ error: "les trois engagements sont requis" }, { status: 400 });
  }

  const age = Number(form.get("age"));
  const isMinor = Number.isFinite(age) && age > 0 && age < 18;
  const supabase = getSupabaseAdmin();

  let autorisation_parentale_url: string | null = null;
  if (isMinor) {
    const doc = form.get("autorisation");
    if (!(doc instanceof File) || doc.size === 0) {
      return NextResponse.json({ error: "autorisation parentale requise pour un mineur" }, { status: 400 });
    }
    if (doc.size > MAX_DOC_BYTES) {
      return NextResponse.json({ error: "document trop lourd (10 Mo max)" }, { status: 400 });
    }
    const ext = (doc.name.split(".").pop() ?? "pdf").toLowerCase().replace(/[^a-z0-9]/g, "") || "pdf";
    const path = `parental/${crypto.randomUUID()}.${ext}`;
    const up = await supabase.storage
      .from("kit-docs")
      .upload(path, new Uint8Array(await doc.arrayBuffer()), { contentType: doc.type || "application/octet-stream" });
    if (up.error) return NextResponse.json({ error: "échec de l'upload du document" }, { status: 500 });
    autorisation_parentale_url = path; // private path; admin reads via signed URL
  }

  const { error } = await supabase.from("demandes_kit").insert({
    terrain_id: str("terrain_id"),
    prenom: str("prenom"),
    nom: str("nom"),
    email,
    telephone: str("telephone"),
    adresse: str("adresse"),
    code_postal: str("code_postal"),
    ville: str("ville"),
    age: Number.isFinite(age) ? age : null,
    trepied: str("trepied"),
    modele_telephone: str("modele_telephone"),
    methode_rushes: str("methode_rushes"),
    engage_protocole: true,
    engage_film: true,
    engage_rushes: true,
    cession_droits: true,
    representant_nom: isMinor ? str("representant_nom") : null,
    representant_email: isMinor ? str("representant_email") : null,
    representant_telephone: isMinor ? str("representant_telephone") : null,
    autorisation_parentale_url,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // TODO (§9): no automatic email here — the kit is only confirmed once approved.
  return NextResponse.json({ ok: true });
}
