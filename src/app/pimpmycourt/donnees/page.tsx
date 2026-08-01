import type { Metadata } from "next";
import { BASE_URL } from "@/lib/constants";
import Scaffold from "../_components/Scaffold";

export const metadata: Metadata = {
  title: "Données personnelles",
  description:
    "Politique de confidentialité et procédure de suppression des données — Pimp My Court, La carte des filets.",
  alternates: { canonical: `${BASE_URL}/pimpmycourt/donnees` },
  robots: { index: true, follow: true },
};

export default function DonneesPage() {
  return (
    <Scaffold
      step="Étape 10"
      eyebrow="Confidentialité"
      title="Tes données"
      intro="Nature des données collectées, finalité, durée de conservation, procédure de suppression et contact du responsable de traitement (HOOPSIDIA SAS). Formulaire de suppression accessible ici et depuis chaque email."
    />
  );
}
