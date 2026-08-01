import { createClient } from "@supabase/supabase-js";
import type { TerrainPublic } from "./types";

// Server-side read of the public view (anon key, RLS-safe). Used by the
// shareable terrain page and its Open Graph image.
export async function getTerrainPublic(id: string): Promise<TerrainPublic | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return null;
  const supabase = createClient(url, anon, { auth: { persistSession: false } });
  const { data } = await supabase
    .from("terrains_public")
    .select("id,latitude,longitude,ville,code_postal,departement,photo_avant_url,photo_apres_url,categorie,etat,nb_confirmations,prenom,commentaire,created_at")
    .eq("id", id)
    .single();
  return (data as TerrainPublic | null) ?? null;
}
