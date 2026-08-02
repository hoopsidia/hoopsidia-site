"use client";

import { useState } from "react";
import Link from "next/link";
import { ETAT_COLOR, type TerrainMarker } from "@/lib/pmc/types";

// Google-Maps-style place card that slides up when a marker is tapped: photo,
// location, status, and actions (see the sheet, share, confirm this court).
export default function TerrainCard({ terrain, onClose }: { terrain: TerrainMarker; onClose: () => void }) {
  const [confirming, setConfirming] = useState(false);
  const [email, setEmail] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const remplace = terrain.etat === "remplace";
  const color = remplace ? ETAT_COLOR.remplace : ETAT_COLOR.a_remplacer;

  async function share() {
    const url = `${window.location.origin}/pimpmycourt/terrain/${terrain.id}`;
    if (navigator.share) {
      try { await navigator.share({ url, title: "La carte des filets" }); return; } catch { /* copy */ }
    }
    try { await navigator.clipboard.writeText(url); } catch { /* ignore */ }
  }

  async function confirm() {
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return;
    await fetch("/api/pimpmycourt/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ terrain_id: terrain.id, email }),
    });
    setConfirmed(true);
  }

  return (
    <div className="absolute inset-x-0 bottom-0 z-40 p-3 sm:left-3 sm:right-auto sm:w-80 sm:bottom-3">
      <div className="rounded-2xl bg-black border border-white/10 shadow-2xl overflow-hidden">
        <div className="flex">
          {terrain.photo_avant_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={terrain.photo_avant_url} alt="" className="w-24 h-24 object-cover shrink-0" />
          ) : (
            <div className="w-24 h-24 bg-white/5 shrink-0 flex items-center justify-center text-white/30 text-xs">Sans photo</div>
          )}
          <div className="flex-1 min-w-0 p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="font-heading font-bold text-white leading-tight truncate">
                {terrain.ville ?? "Terrain"} <span className="text-white/40 text-sm">{terrain.departement}</span>
              </div>
              <button onClick={onClose} aria-label="Fermer" className="text-white/40 hover:text-white text-xl leading-none shrink-0">×</button>
            </div>
            <span className="mt-1 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-heading font-bold" style={{ background: `${color}22`, color }}>
              <span className="inline-block h-2 w-2 rounded-full" style={{ background: color }} />
              {remplace ? "Filet remplacé" : "À remplacer"}
            </span>
            <div className="mt-1 text-xs text-white/50">
              {terrain.nb_paniers != null ? `${terrain.nb_paniers} panier${terrain.nb_paniers > 1 ? "s" : ""} · ` : ""}
              {terrain.nb_confirmations} confirmation{terrain.nb_confirmations > 1 ? "s" : ""}
            </div>
          </div>
        </div>

        {confirmed ? (
          <p className="px-3 pb-3 text-sm text-white/70">Merci, confirmation enregistrée ✓</p>
        ) : confirming ? (
          <div className="p-3 pt-0 flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ton email"
              className="flex-1 rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white outline-none focus:border-orange"
            />
            <button onClick={confirm} className="rounded-lg bg-orange text-black px-4 font-heading font-bold text-sm">OK</button>
          </div>
        ) : (
          <div className="p-3 pt-0 grid grid-cols-3 gap-2 text-xs font-heading font-bold">
            <Link href={`/pimpmycourt/terrain/${terrain.id}`} className="rounded-full bg-white/10 text-white text-center py-2 hover:bg-white/20">Fiche</Link>
            <button onClick={share} className="rounded-full bg-white/10 text-white py-2 hover:bg-white/20">Partager</button>
            <button onClick={() => setConfirming(true)} className="rounded-full bg-orange text-black py-2 hover:bg-orange-light">Confirmer</button>
          </div>
        )}
      </div>
    </div>
  );
}
