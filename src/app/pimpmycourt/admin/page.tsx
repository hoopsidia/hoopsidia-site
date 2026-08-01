import type { Metadata } from "next";
import Scaffold from "../_components/Scaffold";

// Back-office — mobile-first moderation queue. Protected by Supabase Auth
// (added with the data layer). Never indexed.
export const metadata: Metadata = {
  title: "Back-office",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <Scaffold
      step="Étape 5"
      eyebrow="Back-office"
      title="Modération"
      intro="Conçu pour le téléphone : un signalement par écran, trois actions (Valider · Doublon · Rejeter), file de demandes de kit, import et export CSV. Accès protégé, non indexé."
    />
  );
}
