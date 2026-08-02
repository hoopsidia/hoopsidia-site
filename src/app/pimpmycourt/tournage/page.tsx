import type { Metadata } from "next";
import Link from "next/link";
import { BASE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Protocole de tournage",
  description:
    "Comment filmer la pose de ton filet pour Pimp My Court : réglages du téléphone, lumière, liste de plans, livraison des rushes.",
  alternates: { canonical: `${BASE_URL}/pimpmycourt/tournage` },
  robots: { index: true, follow: true },
};

const SHOTS = [
  ["Plan large du terrain, avant", "10 s"],
  ["Détail de l'arceau nu", "5 s"],
  ["Montée / installation, plan large", "20 s"],
  ["Détail des mains sur les attaches", "10 s"],
  ["Le premier ballon qui traverse le filet", "10 s"],
  ["Plan large du terrain, après", "10 s"],
  ["Le contributeur face caméra, prénom et ville", "10 s"],
];

const SECTIONS = [
  ["reglages", "Réglages du téléphone"],
  ["lumiere", "Lumière"],
  ["plans", "Liste de plans"],
  ["son", "Son"],
  ["rushes", "Livraison des rushes"],
];

function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">{children}</div>;
}

export default function TournagePage() {
  return (
    // High contrast for outdoor / full-sun reading.
    <main className="min-h-[100dvh] bg-black text-white">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <Link
          href="/pimpmycourt"
          className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-orange transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          La carte des filets
        </Link>

        <h1 className="mt-6 font-heading text-3xl sm:text-4xl font-bold italic uppercase">
          Filmer la pose
        </h1>
        <p className="mt-3 text-white/70 leading-relaxed">
          Suis ce protocole pour que tes images soient exploitables. Les gens
          reproduisent ce qu&apos;ils voient : commence par regarder la vidéo de
          référence, puis garde cette page ouverte pendant la pose.
        </p>

        {/* Anchored summary — one tap, no scrolling through paragraphs */}
        <nav className="mt-6 flex flex-wrap gap-2">
          {SECTIONS.map(([id, label]) => (
            <a
              key={id}
              href={`#${id}`}
              className="rounded-full glass-subtle px-3 py-1.5 text-xs font-heading font-bold hover:bg-white/10 transition-colors"
            >
              {label}
            </a>
          ))}
        </nav>

        {/* A. Reference video */}
        <div className="mt-8 aspect-video w-full rounded-xl border border-white/10 bg-white/[0.03] flex items-center justify-center">
          <span className="text-white/30 text-sm font-heading uppercase tracking-widest">
            Vidéo de référence — à venir
          </span>
        </div>

        {/* B. Phone settings */}
        <section id="reglages" className="mt-12 scroll-mt-6">
          <h2 className="font-heading text-2xl font-bold italic uppercase">Réglages</h2>
          <div className="mt-4 rounded-xl border-2 border-orange bg-orange/10 p-5">
            <div className="font-heading font-bold uppercase text-orange">HDR désactivé</div>
            <p className="mt-1 text-sm text-white/80">
              Premier réglage, avant tout le reste. Les iPhone filment en Dolby
              Vision HDR par défaut : les rushes deviennent inexploitables et
              incohérents au montage. Coupe-le.
            </p>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Card>
              <div className="font-heading font-bold mb-2">iPhone</div>
              <ul className="space-y-1.5 text-sm text-white/70 list-disc pl-4">
                <li>Réglages → Appareil photo → Enregistrement vidéo</li>
                <li>Désactiver « HDR vidéo (Dolby Vision) »</li>
                <li>4K, 30 fps</li>
                <li>Verrouiller expo + mise au point : appui long avant chaque prise</li>
              </ul>
            </Card>
            <Card>
              <div className="font-heading font-bold mb-2">Android</div>
              <ul className="space-y-1.5 text-sm text-white/70 list-disc pl-4">
                <li>Appareil photo → Vidéo → paramètres</li>
                <li>Désactiver HDR / HDR10+</li>
                <li>4K (UHD), 30 fps</li>
                <li>Verrouiller AE/AF : appui long avant chaque prise</li>
              </ul>
            </Card>
          </div>
          <p className="mt-4 text-sm text-white/60">
            Vertical 9:16 · pas de 60 fps · aucun filtre, aucun mode cinéma,
            aucun zoom numérique · objectif nettoyé.
          </p>
        </section>

        {/* C. Lighting */}
        <section id="lumiere" className="mt-12 scroll-mt-6">
          <h2 className="font-heading text-2xl font-bold italic uppercase">Lumière</h2>
          <p className="mt-3 text-white/70 leading-relaxed">
            Tôt le matin, en fin de journée, ou par ciel couvert. Jamais en plein
            soleil de midi, jamais à contre-jour. La cohérence de lumière fait
            plus pour le raccord entre contributeurs que n&apos;importe quel
            étalonnage.
          </p>
        </section>

        {/* D. Shot list */}
        <section id="plans" className="mt-12 scroll-mt-6">
          <h2 className="font-heading text-2xl font-bold italic uppercase">Liste de plans</h2>
          <ol className="mt-4 space-y-2">
            {SHOTS.map(([shot, dur], i) => (
              <li
                key={i}
                className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-3"
              >
                <span className="shrink-0 h-7 w-7 rounded-full bg-orange text-black font-heading font-bold text-sm flex items-center justify-center">
                  {i + 1}
                </span>
                <span className="flex-1 text-sm text-white/80">{shot}</span>
                <span className="shrink-0 text-xs font-heading font-bold text-white/40">{dur}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* Sound */}
        <section id="son" className="mt-12 scroll-mt-6">
          <h2 className="font-heading text-2xl font-bold italic uppercase">Son</h2>
          <p className="mt-3 text-white/70 leading-relaxed">
            Pas de musique, pas de commentaire par-dessus l&apos;action. Le son du
            filet et du ballon doit rester audible.
          </p>
        </section>

        {/* E. Rushes delivery */}
        <section id="rushes" className="mt-12 scroll-mt-6">
          <h2 className="font-heading text-2xl font-bold italic uppercase">Livraison des rushes</h2>
          <div className="mt-4 rounded-xl border-2 border-red-500/60 bg-red-500/10 p-5">
            <div className="font-heading font-bold uppercase text-red-400">
              Jamais par WhatsApp ni iMessage
            </div>
            <p className="mt-1 text-sm text-white/80">
              La compression détruit tout. Fichiers originaux uniquement, aucun
              montage, aucun recadrage, aucun filtre appliqué avant envoi.
            </p>
          </div>
          <p className="mt-4 text-sm text-white/60">
            Envoi via Google Drive, WeTransfer ou autre — dans les 15 jours
            suivant la réception du kit.
          </p>
        </section>

        <div className="mt-12 flex flex-col sm:flex-row gap-3">
          <Link
            href="/pimpmycourt/kit"
            className="rounded-full bg-orange px-7 py-3 text-center font-heading font-bold uppercase text-sm tracking-wide text-black hover:bg-orange-light transition-colors"
          >
            Demander un kit
          </Link>
          <Link
            href="/pimpmycourt"
            className="rounded-full glass-subtle px-7 py-3 text-center font-heading font-bold uppercase text-sm tracking-wide hover:bg-white/10 transition-colors"
          >
            Retour à la carte
          </Link>
        </div>
      </div>
    </main>
  );
}
