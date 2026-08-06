import type { Metadata, Viewport } from "next";
import { BASE_URL } from "@/lib/constants";
import MapShell from "./MapShell";

export const metadata: Metadata = {
  title: { absolute: "Carte des filets" },
  description:
    "Signale un terrain de basket dont le filet est manquant ou hors d'usage. On t'envoie de quoi le remettre en état.",
  alternates: { canonical: `${BASE_URL}/pimpmycourt` },
  robots: { index: true, follow: true },
};

// App-like map page: prevent the browser from auto-zooming on input focus
// (the map keeps its own pinch-zoom, handled by MapLibre).
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function PimpMyCourtPage() {
  return <MapShell />;
}
