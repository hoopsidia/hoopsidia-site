import { ImageResponse } from "next/og";
import { getTerrainPublic } from "@/lib/pmc/supabasePublic";
import { ETAT_COLOR } from "@/lib/pmc/types";
import { satelliteImageUrl } from "@/lib/pmc/satellite";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "La carte des filets — Pimp My Court";

// Dynamic OG image built from the terrain photo (§5 — the main organic
// diffusion lever). Shared links show the actual court.
export default async function Image({ params }: { params: { id: string } }) {
  const t = await getTerrainPublic(params.id);
  const remplace = t?.etat === "remplace";
  const label = remplace ? "FILET REMPLACÉ" : "FILET À REMPLACER";
  const color = remplace ? ETAT_COLOR.remplace : ETAT_COLOR.a_remplacer;

  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: "#0d0d0d", position: "relative" }}>
        {t && (
          <img src={satelliteImageUrl(t.latitude, t.longitude, 1200, 630)} alt="" width={1200} height={630} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.6 }} />
        )}
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 64, background: "linear-gradient(180deg, rgba(13,13,13,0.2), rgba(13,13,13,0.9))" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 28, height: 28, borderRadius: 999, background: color }} />
            <span style={{ color: "#fff", fontSize: 30, fontWeight: 700, letterSpacing: 2 }}>{label}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ color: "#fff", fontSize: 72, fontWeight: 800, fontStyle: "italic" }}>
              {t?.ville ?? "Terrain de basket"}
            </span>
            <span style={{ color: "#ff7200", fontSize: 34, fontWeight: 700 }}>
              La carte des filets · Pimp My Court
            </span>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
