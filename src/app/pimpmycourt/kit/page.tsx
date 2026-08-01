import type { Metadata } from "next";
import { BASE_URL } from "@/lib/constants";
import KitForm from "./KitForm";

export const metadata: Metadata = {
  title: "Demander un kit",
  description:
    "Demande un kit filet pour poser toi-même et filmer la pose selon le protocole Pimp My Court.",
  alternates: { canonical: `${BASE_URL}/pimpmycourt/kit` },
  robots: { index: true, follow: true },
};

export default async function KitPage({
  searchParams,
}: {
  searchParams: Promise<{ terrain?: string }>;
}) {
  const { terrain } = await searchParams;
  return <KitForm terrainId={terrain ?? null} />;
}
