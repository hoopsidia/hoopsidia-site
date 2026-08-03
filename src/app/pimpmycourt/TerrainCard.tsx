"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ETAT_COLOR, type TerrainMarker } from "@/lib/pmc/types";
import { satelliteImageUrl, googleDirectionsUrl } from "@/lib/pmc/satellite";

// Google-Maps-style place card: satellite preview of the exact spot, the exact
// address (reverse-geocoded), status, and actions (directions, share, confirm).
export default function TerrainCard({ terrain, onClose }: { terrain: TerrainMarker; onClose: () => void }) {
  const [confirming, setConfirming] = useState(false);
  const [email, setEmail] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const remplace = terrain.etat === "remplace";
  const color = remplace ? ETAT_COLOR.remplace : ETAT_COLOR.a_remplacer;

  useEffect(() => {
    let active = true;
    fetch(`https://api-adresse.data.gouv.fr/reverse/?lon=${terrain.longitude}&lat=${terrain.latitude}`)
      .then((r) => r.json())
      .then((d) => { if (active) setAddress(d?.features?.[0]?.properties?.label ?? null); })
      .catch(() => {});
    return () => { active = false; };
  }, [terrain.latitude, terrain.longitude]);

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
        {/* Satellite preview of the exact location */}
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={satelliteImageUrl(terrain.latitude, terrain.longitude, 640, 300)} alt="Vue satellite du terrain" className="w-full h-36 object-cover bg-white/5" />
          <span className="absolute top-2 left-2 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-heading font-bold" style={{ background: "rgba(0,0,0,.7)", color }}>
            <span className="inline-block h-2 w-2 rounded-full" style={{ background: color }} />
            {remplace ? "Filet remplacé" : "À remplacer"}
          </span>
          <button onClick={onClose} aria-label="Fermer" className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/70 text-white flex items-center justify-center text-lg leading-none">×</button>
        </div>

        <div className="p-3">
          <div className="font-heading font-bold text-white leading-tight">
            {terrain.nom_terrain ?? "Terrain de basket"} <span className="text-white/40 text-sm">{terrain.departement}</span>
          </div>
          <p className="text-xs text-white/50 mt-0.5">{address ?? `${terrain.ville ?? ""}`}</p>
          <div className="mt-1 text-xs text-white/40">
            {terrain.nb_filets_a_remplacer != null ? `${terrain.nb_filets_a_remplacer} filet${terrain.nb_filets_a_remplacer > 1 ? "s" : ""} à remplacer · ` : ""}
            {terrain.nb_confirmations} confirmation{terrain.nb_confirmations > 1 ? "s" : ""}
          </div>

          {confirmed ? (
            <p className="mt-3 text-sm text-white/70">Merci, confirmation enregistrée ✓</p>
          ) : confirming ? (
            <div className="mt-3 flex gap-2">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Ton email" className="flex-1 rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white outline-none focus:border-orange" />
              <button onClick={confirm} className="rounded-lg bg-orange text-black px-4 font-heading font-bold text-sm">OK</button>
            </div>
          ) : (
            <div className="mt-3 grid grid-cols-4 gap-1.5 text-[11px] font-heading font-bold">
              <a href={googleDirectionsUrl(terrain.latitude, terrain.longitude)} target="_blank" rel="noopener noreferrer" className="rounded-full bg-white/10 text-white text-center py-2 hover:bg-white/20">Itinéraire</a>
              <Link href={`/pimpmycourt/terrain/${terrain.id}`} className="rounded-full bg-white/10 text-white text-center py-2 hover:bg-white/20">Fiche</Link>
              <button onClick={share} className="rounded-full bg-white/10 text-white py-2 hover:bg-white/20">Partager</button>
              <button onClick={() => setConfirming(true)} className="rounded-full bg-orange text-black py-2 hover:bg-orange-light">Confirmer</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
