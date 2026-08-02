import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BASE_URL } from "@/lib/constants";
import { getTerrainPublic } from "@/lib/pmc/supabasePublic";
import { ETAT_COLOR } from "@/lib/pmc/types";
import ShareButton from "./ShareButton";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const t = await getTerrainPublic(id);
  const title = t ? `Terrain de basket — ${t.ville ?? "France"}` : "Fiche terrain";
  const description = t
    ? `${t.etat === "remplace" ? "Filet remplacé" : "Filet à remplacer"} · ${t.nb_confirmations} confirmation(s) — La carte des filets, Pimp My Court.`
    : "La carte des filets — Pimp My Court.";
  return {
    title,
    description,
    alternates: { canonical: `${BASE_URL}/pimpmycourt/terrain/${id}` },
    robots: { index: true, follow: true },
    openGraph: { title, description, url: `${BASE_URL}/pimpmycourt/terrain/${id}` },
  };
}

export default async function TerrainPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await getTerrainPublic(id);
  if (!t) notFound();

  const remplace = t.etat === "remplace";
  const date = new Date(t.created_at).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <main className="min-h-[100dvh] bg-black text-white">
      <div className="max-w-xl mx-auto px-4 sm:px-6 pt-20 pb-10">
        <Link href="/pimpmycourt" className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-orange transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
          La carte des filets
        </Link>

        <div className="mt-6 flex items-center gap-3">
          <span
            className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-heading font-bold uppercase"
            style={{ background: `${remplace ? ETAT_COLOR.remplace : ETAT_COLOR.a_remplacer}22`, color: remplace ? ETAT_COLOR.remplace : ETAT_COLOR.a_remplacer }}
          >
            {remplace ? "Filet remplacé" : "Filet à remplacer"}
          </span>
        </div>

        <h1 className="mt-3 font-heading text-3xl font-bold italic uppercase">
          {t.ville ?? "Terrain"} <span className="text-white/40 text-lg">{t.departement}</span>
        </h1>
        <p className="mt-1 text-sm text-white/50">
          Signalé le {date} · {t.nb_paniers != null ? `${t.nb_paniers} panier${t.nb_paniers > 1 ? "s" : ""} · ` : ""}
          {t.nb_confirmations} confirmation{t.nb_confirmations > 1 ? "s" : ""}
          {t.prenom ? ` · par ${t.prenom}` : ""}
        </p>

        {/* Photos avant / après */}
        {(t.photo_avant_url || t.photo_apres_url) && (
        <div className={`mt-6 grid gap-3 ${t.photo_avant_url && t.photo_apres_url ? "sm:grid-cols-2" : ""}`}>
          {t.photo_avant_url && (
          <figure>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={t.photo_avant_url} alt={`Terrain avant — ${t.ville ?? ""}`} className="w-full aspect-[4/3] object-cover rounded-xl bg-white/5" />
            <figcaption className="mt-1 text-xs text-white/40 uppercase font-heading font-bold">Avant</figcaption>
          </figure>
          )}
          {t.photo_apres_url && (
            <figure>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={t.photo_apres_url} alt={`Terrain après — ${t.ville ?? ""}`} className="w-full aspect-[4/3] object-cover rounded-xl bg-white/5" />
              <figcaption className="mt-1 text-xs text-white/40 uppercase font-heading font-bold">Après</figcaption>
            </figure>
          )}
        </div>
        )}

        {t.commentaire && <p className="mt-4 text-white/70 italic">“{t.commentaire}”</p>}

        <div className="mt-8 flex gap-3">
          <ShareButton url={`${BASE_URL}/pimpmycourt/terrain/${t.id}`} />
          <Link href="/pimpmycourt/kit" className="rounded-full bg-orange text-black px-6 py-3 font-heading font-bold uppercase text-sm hover:bg-orange-light">
            Demander un kit
          </Link>
        </div>
      </div>
    </main>
  );
}
