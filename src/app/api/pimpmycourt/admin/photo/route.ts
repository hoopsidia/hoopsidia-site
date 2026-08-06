import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/pmc/supabaseAdmin";
import { verifyAdmin } from "@/lib/pmc/adminAuth";

const MAX_PHOTO_BYTES = 8 * 1024 * 1024;

// Update a terrain's photo (before/after) from the back-office.
export async function POST(request: Request) {
  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: "non autorisé" }, { status: 403 });
  }
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "requête invalide" }, { status: 400 });
  }
  const id = String(form.get("id") ?? "");
  const which = String(form.get("which") ?? "avant") === "apres" ? "apres" : "avant";
  const photo = form.get("photo");
  if (!id || !(photo instanceof File) || photo.size === 0) {
    return NextResponse.json({ error: "photo manquante" }, { status: 400 });
  }
  if (!photo.type.startsWith("image/") || photo.size > MAX_PHOTO_BYTES) {
    return NextResponse.json({ error: "photo invalide (image, 8 Mo max)" }, { status: 400 });
  }
  const supabase = getSupabaseAdmin();
  const ext = photo.type.split("/")[1]?.replace("jpeg", "jpg") ?? "jpg";
  const path = `${which}/${crypto.randomUUID()}.${ext}`;
  const up = await supabase.storage.from("terrains").upload(path, new Uint8Array(await photo.arrayBuffer()), { contentType: photo.type });
  if (up.error) return NextResponse.json({ error: up.error.message }, { status: 500 });
  const url = supabase.storage.from("terrains").getPublicUrl(path).data.publicUrl;
  const col = which === "apres" ? "photo_apres_url" : "photo_avant_url";
  const { error } = await supabase.from("terrains").update({ [col]: url }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, url });
}
