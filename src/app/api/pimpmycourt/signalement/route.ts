import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/pmc/supabaseAdmin";
import { isInFrance, reverseGeocode } from "@/lib/pmc/geo";
import { sendSignalementRecu } from "@/lib/pmc/email";
import { rateLimitOk, clientIp, ipHash } from "@/lib/pmc/rateLimit";

const MAX_PHOTO_BYTES = 8 * 1024 * 1024;

// Creates a terrain signalement (status `signale`, not yet publicly visible).
// Photo is uploaded to Storage; ville/departement are filled by reverse
// geocoding. Basic anti-abuse: honeypot + French-territory bounds + photo
// validation (IP rate limiting comes with §10).
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
  const photo = form.get("photo");

  if (!Number.isFinite(lat) || !Number.isFinite(lng) || !isInFrance(lat, lng)) {
    return NextResponse.json({ error: "position hors de France" }, { status: 400 });
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: "email invalide" }, { status: 400 });
  }
  if (!consent) {
    return NextResponse.json({ error: "consentement requis" }, { status: 400 });
  }
  if (!(photo instanceof File) || photo.size === 0) {
    return NextResponse.json({ error: "photo obligatoire" }, { status: 400 });
  }
  if (!photo.type.startsWith("image/") || photo.size > MAX_PHOTO_BYTES) {
    return NextResponse.json({ error: "photo invalide (image, 8 Mo max)" }, { status: 400 });
  }

  const commentaire = String(form.get("commentaire") ?? "").trim().slice(0, 300) || null;
  const prenom = String(form.get("prenom") ?? "").trim() || null;
  const instagram = String(form.get("contact_instagram") ?? "").trim() || null;

  const supabase = getSupabaseAdmin();

  // Upload photo
  const ext = photo.type.split("/")[1]?.replace("jpeg", "jpg") ?? "jpg";
  const path = `avant/${crypto.randomUUID()}.${ext}`;
  const bytes = new Uint8Array(await photo.arrayBuffer());
  const up = await supabase.storage.from("terrains").upload(path, bytes, {
    contentType: photo.type,
    upsert: false,
  });
  if (up.error) {
    return NextResponse.json({ error: "échec de l'upload photo" }, { status: 500 });
  }
  const photo_avant_url = supabase.storage.from("terrains").getPublicUrl(path).data.publicUrl;

  const geo = await reverseGeocode(lat, lng);

  const { data, error } = await supabase
    .from("terrains")
    .insert({
      latitude: lat,
      longitude: lng,
      ville: geo.ville,
      code_postal: geo.code_postal,
      departement: geo.departement,
      photo_avant_url,
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
