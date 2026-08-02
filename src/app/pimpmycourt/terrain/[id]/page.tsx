import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BASE_URL } from "@/lib/constants";
import { getTerrainPublic } from "@/lib/pmc/supabasePublic";
import { reverseGeocode } from "@/lib/pmc/geo";
import { ETAT_COLOR } from "@/lib/pmc/types";
import { satelliteImageUrl, googleDirectionsUrl, googleMapsUrl } from "@/lib/pmc/satellite";
import ShareButton from "./ShareButton";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
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

export default async function TerrainPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const t = await getTerrainPublic(id);
  if (!t) notFound();

  const remplace = t.etat === "remplace";
  const color = remplace ? ETAT_COLOR.remplace : ETAT_COLOR.a_remplacer;
  const geo = await reverseGeocode(t.latitude, t.longitude);
  const address = geo.adresse ?? [t.ville, t.departement].filter(Boolean).join(", ");
  const date = new Date(t.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

  return (
    <main className="min-h-[100dvh] bg-black text-white">
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-10">
        <Link href="/pimpmycourt" className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-orange transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
          La carte des filets
        </Link>

        {/* Google-Maps-style location card */}
        <div className="mt-5 rounded-2xl border border-white/10 overflow-hidden bg-white/[0.03]">
          {/* Satellite hero from coordinates */}
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={satelliteImageUrl(t.latitude, t.longitude, 900, 500)} alt="Vue satellite du terrain" className="w-full aspect-[9/5] object-cover bg-white/5" />
            <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-heading font-bold" style={{ background: "rgba(0,0,0,.7)", color }}>
              <span className="inline-block h-2 w-2 rounded-full" style={{ background: color }} />
              {remplace ? "Filet remplacé" : "À remplacer"}
            </span>
          </div>

          <div className="p-5">
            <h1 className="font-heading text-2xl font-bold italic uppercase leading-tight">
              Terrain de basket
            </h1>
            <p className="mt-1 text-sm text-white/60">{address}</p>
            <p className="mt-1 text-xs text-white/30 font-mono">{t.latitude.toFixed(5)}, {t.longitude.toFixed(5)}</p>

            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-white/60">
              {t.nb_paniers != null && <span>{t.nb_paniers} panier{t.nb_paniers > 1 ? "s" : ""} à équiper</span>}
              <span>{t.nb_confirmations} confirmation{t.nb_confirmations > 1 ? "s" : ""}</span>
            </div>
            <p className="mt-1 text-xs text-white/40">Signalé le {date}{t.prenom ? ` · par ${t.prenom}` : ""}</p>
            {t.commentaire && <p className="mt-3 text-white/70 italic">“{t.commentaire}”</p>}

            {/* Actions */}
            <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm font-heading font-bold">
              <a href={googleDirectionsUrl(t.latitude, t.longitude)} target="_blank" rel="noopener noreferrer" className="rounded-full bg-white/10 text-white text-center py-2.5 hover:bg-white/20">Itinéraire</a>
              <a href={googleMapsUrl(t.latitude, t.longitude)} target="_blank" rel="noopener noreferrer" className="rounded-full bg-white/10 text-white text-center py-2.5 hover:bg-white/20">Google Maps</a>
              <ShareButton url={`${BASE_URL}/pimpmycourt/terrain/${t.id}`} />
              <Link href="/pimpmycourt/kit" className="rounded-full bg-orange text-black text-center py-2.5 hover:bg-orange-light">Demander un kit</Link>
            </div>
          </div>
        </div>

        {/* After photo, if a replacement has been filmed */}
        {t.photo_apres_url && (
          <figure className="mt-5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={t.photo_apres_url} alt="Terrain après" className="w-full rounded-xl object-cover bg-white/5" />
            <figcaption className="mt-1 text-xs text-white/40 uppercase font-heading font-bold">Après — filet posé</figcaption>
          </figure>
        )}
      </div>
    </main>
  );
}
