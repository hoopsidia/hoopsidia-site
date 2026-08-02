import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/pmc/supabaseAdmin";
import { isInFrance, reverseGeocode } from "@/lib/pmc/geo";
import { sendSignalementRecu } from "@/lib/pmc/email";
import { rateLimitOk, clientIp, ipHash } from "@/lib/pmc/rateLimit";

// Creates a terrain signalement (status `signale`, not yet publicly visible).
// No photo: the visual preview is a satellite view generated from the
// coordinates. ville/departement are filled by reverse geocoding. Anti-abuse:
// honeypot + IP rate limit + French-territory bounds.
export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "requête invalide" }, { status: 400 });
  }

  // Honeypot — a real user never fills this hidden field.
  if (form.get("website")) {
    return NextResponse.json({ ok: true, id: null }); // silently drop
  }

  // IP rate limit: max 5 signalements / hour (§10).
  if (!(await rateLimitOk(`pmc:sig:${ipHash(clientIp(request))}`, 5, 3600))) {
    return NextResponse.json({ error: "trop de signalements, réessaie plus tard" }, { status: 429 });
  }

  const lat = Number(form.get("latitude"));
  const lng = Number(form.get("longitude"));
  const email = String(form.get("email") ?? "").trim();
  const consent = form.get("consent");

  if (!Number.isFinite(lat) || !Number.isFinite(lng) || !isInFrance(lat, lng)) {
    return NextResponse.json({ error: "position hors de France" }, { status: 400 });
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: "email invalide" }, { status: 400 });
  }
  if (!consent) {
    return NextResponse.json({ error: "consentement requis" }, { status: 400 });
  }
  const nbPaniers = Number(form.get("nb_paniers"));
  if (!Number.isInteger(nbPaniers) || nbPaniers < 1) {
    return NextResponse.json({ error: "nombre de paniers requis" }, { status: 400 });
  }

  const commentaire = String(form.get("commentaire") ?? "").trim().slice(0, 300) || null;
  const prenom = String(form.get("prenom") ?? "").trim() || null;
  const instagram = String(form.get("contact_instagram") ?? "").trim() || null;

  const supabase = getSupabaseAdmin();
  const geo = await reverseGeocode(lat, lng);

  const { data, error } = await supabase
    .from("terrains")
    .insert({
      latitude: lat,
      longitude: lng,
      ville: geo.ville,
      code_postal: geo.code_postal,
      departement: geo.departement,
      nb_paniers: nbPaniers,
      statut: "signale",
      source: "formulaire",
      contact_email: email,
      contact_instagram: instagram,
      prenom,
      commentaire,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await sendSignalementRecu(email);
  return NextResponse.json({ ok: true, id: data.id });
}
