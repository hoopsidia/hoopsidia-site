// Public shape exposed by the `terrains_public` view (no contact data).
export type Etat = "a_remplacer" | "remplace";

export type TerrainPublic = {
  id: string;
  latitude: number;
  longitude: number;
  ville: string | null;
  code_postal: string | null;
  departement: string | null;
  photo_avant_url: string;
  photo_apres_url: string | null;
  categorie: string;
  etat: Etat;
  nb_confirmations: number;
  prenom: string | null;
  commentaire: string | null;
  created_at: string;
};

// Status color couple (§12) — distinct from brand orange, legible over an OSM
// light basemap. Distinction is not hue-only: markers also differ by shape.
export const ETAT_COLOR: Record<Etat, string> = {
  a_remplacer: "#E4572E", // warm, saturated
  remplace: "#2FA84F", // validating green
};
