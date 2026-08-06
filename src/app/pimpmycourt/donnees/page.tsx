import type { Metadata } from "next";
import Link from "next/link";
import { BASE_URL } from "@/lib/constants";
import DeletionForm from "./DeletionForm";

export const metadata: Metadata = {
  title: "Données personnelles",
  description:
    "Politique de confidentialité et suppression des données — Pimp My Court, La carte des filets.",
  alternates: { canonical: `${BASE_URL}/pimpmycourt/donnees` },
  robots: { index: true, follow: true },
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="font-heading text-xl font-bold italic uppercase text-orange">{title}</h2>
      <div className="mt-2 text-sm text-white/70 leading-relaxed space-y-2">{children}</div>
    </section>
  );
}

export default function DonneesPage() {
  return (
    <main className="min-h-[100dvh] bg-black text-white">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <Link href="/pimpmycourt" className="text-sm text-white/50 hover:text-orange">← La carte des filets</Link>
        <h1 className="mt-4 font-heading text-3xl font-bold italic uppercase">Tes données</h1>
        <p className="mt-2 text-white/60 text-sm">
          Responsable de traitement : <b>HOOPSIDIA</b> (SAS au capital de 100&nbsp;€), 65 rue de la Croix, 92000 Nanterre — SIREN&nbsp;833&nbsp;951&nbsp;155.
          Contact : <a href="mailto:hoopsidia@gmail.com" className="text-orange">hoopsidia@gmail.com</a>.
        </p>

        <Section title="Données collectées">
          <p><b>Signalement</b> : position du terrain, photo, email, éventuellement pseudo Instagram ou TikTok, prénom, nom, âge, commentaire.</p>
        </Section>

        <Section title="Finalités">
          <p>Cartographier les terrains dont les filets sont à remplacer, suivre les remplacements et animer le projet Pimp My Court.</p>
        </Section>

        <Section title="Durées de conservation">
          <p>Les données sont conservées le temps du projet, puis supprimées ou anonymisées. Tu peux demander leur suppression à tout moment (ci-dessous).</p>
        </Section>

        <Section title="Données publiques">
          <p>Sur la carte n&apos;apparaissent jamais tes coordonnées : uniquement la position du terrain, la ville, les photos, la date, le nombre de confirmations et, si tu l&apos;as renseigné, ton prénom.</p>
        </Section>

        <Section title="Tes droits">
          <p>Tu peux demander l&apos;accès, la rectification ou la suppression de tes données à tout moment, ci-dessous ou par email.</p>
        </Section>

        <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <h3 className="font-heading font-bold uppercase text-sm">Supprimer mes données</h3>
          <DeletionForm />
        </div>
      </div>
    </main>
  );
}
