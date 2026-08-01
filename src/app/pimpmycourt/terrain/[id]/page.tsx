import type { Metadata } from "next";
import { BASE_URL } from "@/lib/constants";
import Scaffold from "../../_components/Scaffold";

// Shareable court sheet. Once Supabase is wired, generateMetadata fetches the
// court and builds a dynamic Open Graph image from its photo (§5 — main organic
// diffusion lever).
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return {
    title: "Fiche terrain",
    alternates: { canonical: `${BASE_URL}/pimpmycourt/terrain/${id}` },
    robots: { index: true, follow: true },
  };
}

export default async function TerrainPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <Scaffold
      step="Étape 6"
      eyebrow="Fiche terrain"
      title="Terrain"
      intro="Photo avant / après, ville et département, date de signalement, nombre de confirmations et prénom du contributeur. Aucune donnée de contact n'est exposée."
    >
      <p className="text-sm text-white/40">Identifiant : {id}</p>
    </Scaffold>
  );
}
