import type { Metadata } from "next";
import { BASE_URL } from "@/lib/constants";
import Scaffold from "../_components/Scaffold";

export const metadata: Metadata = {
  title: "Demander un kit",
  description:
    "Demande un kit filet pour poser toi-même et filmer la pose selon le protocole Pimp My Court.",
  alternates: { canonical: `${BASE_URL}/pimpmycourt/kit` },
  robots: { index: true, follow: true },
};

export default function KitPage() {
  return (
    <Scaffold
      step="Étape 7"
      eyebrow="Demande de kit"
      title="Demander un kit"
      intro="Envois limités, sélectionnés selon les priorités du projet et l'ordre des demandes. Aucun engagement de livraison. En échange du matériel, tu filmes la pose selon le protocole."
    />
  );
}
