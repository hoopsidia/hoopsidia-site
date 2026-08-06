import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/pmc/supabaseAdmin";
import { reverseGeocode } from "@/lib/pmc/geo";
import { sendSignalementRecu } from "@/lib/pmc/email";
import { rateLimitOk, clientIp, ipHash } from "@/lib/pmc/rateLimit";

const MAX_PHOTO_BYTES = 8 * 1024 * 1024;

// Creates a terrain signalement (status `signale`, not yet publicly visible).
// ville/departement are filled by reverse geocoding; the map/card preview is a
// satellite view (an optional user photo can be attached too). Anti-abuse:
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

  // IP rate limit: generous anti-abuse cap of 500 signalements / hour.
  if (!(await rateLimitOk(`pmc:sig:${ipHash(clientIp(request))}`, 500, 3600))) {
    return NextResponse.json({ error: "trop de signalements, réessaie plus tard" }, { status: 429 });
  }

  const lat = Number(form.get("latitude"));
  const lng = Number(form.get("longitude"));
  const email = String(form.get("email") ?? "").trim();
  const consent = form.get("consent");

  if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return NextResponse.json({ error: "position invalide" }, { status: 400 });
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
  const nbFilets = Number(form.get("nb_filets"));
  if (!Number.isInteger(nbFilets) || nbFilets < 1) {
    return NextResponse.json({ error: "nombre de filets requis" }, { status: 400 });
  }

  const str = (k: string) => String(form.get(k) ?? "").trim() || null;
  const ageNum = Number(form.get("age"));
  const age = Number.isInteger(ageNum) && ageNum > 0 ? ageNum : null;

  const supabase = getSupabaseAdmin();

  // Optional photo → Storage.
  let photo_avant_url: string | null = null;
  const photo = form.get("photo");
  if (photo instanceof File && photo.size > 0) {
    if (!photo.type.startsWith("image/") || photo.size > MAX_PHOTO_BYTES) {
      return NextResponse.json({ error: "photo invalide (image, 8 Mo max)" }, { status: 400 });
    }
    const ext = photo.type.split("/")[1]?.replace("jpeg", "jpg") ?? "jpg";
    const path = `avant/${crypto.randomUUID()}.${ext}`;
    const up = await supabase.storage.from("terrains").upload(path, new Uint8Array(await photo.arrayBuffer()), { contentType: photo.type });
    if (!up.error) photo_avant_url = supabase.storage.from("terrains").getPublicUrl(path).data.publicUrl;
  }

  const geo = await reverseGeocode(lat, lng);

  const { data, error } = await supabase
    .from("terrains")
    .insert({
      latitude: lat,
      longitude: lng,
      ville: geo.ville,
      code_postal: geo.code_postal,
      departement: geo.departement,
      nom_terrain: str("nom_terrain"),
      nb_paniers: nbPaniers,
      nb_filets_a_remplacer: nbFilets,
      photo_avant_url,
      statut: "signale",
      source: "formulaire",
      contact_email: email,
      contact_instagram: str("contact_instagram"),
      contact_tiktok: str("contact_tiktok"),
      prenom: str("prenom"),
      nom: str("nom"),
      age,
      commentaire: str("commentaire"),
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await sendSignalementRecu(email);
  return NextResponse.json({ ok: true, id: data.id });
}
