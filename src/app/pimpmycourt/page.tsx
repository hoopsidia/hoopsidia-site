import type { Metadata } from "next";
import { BASE_URL } from "@/lib/constants";
import MapShell from "./MapShell";

export const metadata: Metadata = {
  title: { absolute: "PIMP MY COURT by HOOPSIDIA" },
  description:
    "Signale un terrain de basket dont le filet est manquant ou hors d'usage. On t'envoie de quoi le remettre en état.",
  alternates: { canonical: `${BASE_URL}/pimpmycourt` },
  robots: { index: true, follow: true },
};

export default function PimpMyCourtPage() {
  return <MapShell />;
}
