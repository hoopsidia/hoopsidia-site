// Public shape exposed by the `terrains_public` view (no contact data).
export type Etat = "a_remplacer" | "remplace";

export type TerrainPublic = {
  id: string;
  latitude: number;
  longitude: number;
  ville: string | null;
  code_postal: string | null;
  departement: string | null;
  photo_avant_url: string | null;
  photo_apres_url: string | null;
  categorie: string;
  etat: Etat;
  nb_confirmations: number;
  nb_paniers: number | null;
  nb_filets_a_remplacer: number | null;
  nom_terrain: string | null;
  prenom: string | null;
  commentaire: string | null;
  created_at: string;
};

// Minimal marker payload carried in the map, enough to render the info card
// without an extra fetch when a marker is tapped.
export type TerrainMarker = {
  id: string;
  latitude: number;
  longitude: number;
  ville: string | null;
  departement: string | null;
  photo_avant_url: string | null;
  etat: Etat;
  nb_confirmations: number;
  nb_paniers: number | null;
  nb_filets_a_remplacer: number | null;
  nom_terrain: string | null;
};

// Status color couple (§12) — distinct from brand orange, legible over an OSM
// light basemap. Distinction is not hue-only: markers also differ by shape.
export const ETAT_COLOR: Record<Etat, string> = {
  a_remplacer: "#E4572E", // warm, saturated
  remplace: "#2FA84F", // validating green
};
