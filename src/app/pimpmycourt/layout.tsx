import type { ReactNode } from "react";
import type { Metadata } from "next";
import { BASE_URL } from "@/lib/constants";
import PmcHeader from "./PmcHeader";
import "../globals.css";
import "maplibre-gl/dist/maplibre-gl.css";

// "Pimp My Court — La carte des filets" product, served at /pimpmycourt with no
// locale prefix. It lives as a sibling of the [locale] segment and is excluded
// from the next-intl proxy (see src/proxy.ts), so it owns its own <html> here.
// Fixed French (the operation targets French courts / French legal entity).

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Pimp My Court — La carte des filets",
    template: "%s · Pimp My Court",
  },
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.png", sizes: "1024x1024", type: "image/png" },
    ],
    apple: "/apple-icon.png",
  },
};

export default function PimpMyCourtLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="fr" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <PmcHeader />
        {children}
      </body>
    </html>
  );
}
