import { createClient } from "@supabase/supabase-js";
import type { TerrainPublic } from "./types";

// Server-side read of the public view (anon key, RLS-safe). Used by the
// shareable terrain page and its Open Graph image.
export async function getTerrainPublic(id: string): Promise<TerrainPublic | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return null;
  const supabase = createClient(url, anon, { auth: { persistSession: false } });
  const full = "id,latitude,longitude,ville,code_postal,departement,photo_avant_url,photo_apres_url,categorie,etat,date_remplacement,nb_confirmations,nb_paniers,nb_filets_a_remplacer,nom_terrain,prenom,commentaire,created_at";
  const base = "id,latitude,longitude,ville,code_postal,departement,photo_avant_url,photo_apres_url,categorie,etat,nb_confirmations,nb_paniers,prenom,commentaire,created_at";
  const res = await supabase.from("terrains_public").select(full).eq("id", id).single();
  if (res.error) {
    // Pre-migration fallback.
    const b = await supabase.from("terrains_public").select(base).eq("id", id).single();
    if (!b.data) return null;
    return { ...b.data, nb_filets_a_remplacer: null, nom_terrain: null, date_remplacement: null } as TerrainPublic;
  }
  return (res.data as TerrainPublic | null) ?? null;
}
