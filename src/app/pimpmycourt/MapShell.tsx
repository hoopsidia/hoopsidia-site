"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import type { Map as MlMap } from "maplibre-gl";
import { ETAT_COLOR } from "@/lib/pmc/types";
import PmcMap from "./PmcMap";
import SignalementSheet from "./SignalementSheet";
import AddressSearch from "./AddressSearch";

// Full-screen map shell for /pimpmycourt (§5). Reporting is a bottom sheet; the
// map stays pannable above it and a crosshair marks the chosen position.
export default function MapShell() {
  const [stats, setStats] = useState<{ total: number; remplaces: number } | null>(null);
  const [reporting, setReporting] = useState(false);
  const mapRef = useRef<MlMap | null>(null);

  const handleMapReady = useCallback((map: MlMap) => {
    mapRef.current = map;
  }, []);

  const getCenter = useCallback(() => {
    const c = mapRef.current?.getCenter();
    return { lat: c?.lat ?? 46.6, lng: c?.lng ?? 2.4 };
  }, []);

  const flyTo = useCallback((lng: number, lat: number) => {
    mapRef.current?.flyTo({ center: [lng, lat], zoom: 17 });
  }, []);

  const locateMe = useCallback(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      mapRef.current?.flyTo({ center: [pos.coords.longitude, pos.coords.latitude], zoom: 15 });
    });
  }, []);

  return (
    <main className="relative h-[100dvh] w-full overflow-hidden bg-[#0d0d0d] text-white">
      <PmcMap onStats={setStats} onMapReady={handleMapReady} />

      {/* Editorial framing (top overlay) */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 p-4 sm:p-6">
        <div className="max-w-md">
          <h1 className="font-heading text-2xl sm:text-3xl font-bold italic uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
            La carte des filets
          </h1>
          <p className="mt-1 text-sm text-white/90 max-w-xs drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
            Signale un terrain, on t&apos;envoie de quoi le remettre en état.
          </p>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-black/70 backdrop-blur px-3 py-1.5 text-xs font-heading font-bold">
            <span className="text-orange">{stats ? stats.total : "—"} terrains signalés</span>
            <span className="text-white/30">·</span>
            <span style={{ color: ETAT_COLOR.remplace }}>{stats ? stats.remplaces : "—"} filets remplacés</span>
          </div>
          <div className="mt-2">
            <Link href="/pimpmycourt/donnees" className="pointer-events-auto text-[11px] text-white/50 hover:text-white underline">
              Données personnelles
            </Link>
          </div>
          <div className="mt-3">
            <AddressSearch onSelect={flyTo} />
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="pointer-events-none absolute left-4 bottom-28 z-10 flex flex-col gap-1.5 text-xs bg-black/50 backdrop-blur rounded-lg p-2">
        <span className="inline-flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-full ring-2 ring-white/80" style={{ background: ETAT_COLOR.a_remplacer }} />
          À remplacer
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="inline-block h-3 w-3 rotate-45 ring-2 ring-white/80" style={{ background: ETAT_COLOR.remplace }} />
          Remplacé
        </span>
      </div>

      {/* Center crosshair while reporting (marks the position) */}
      {reporting && (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center" aria-hidden>
          <div className="-translate-y-3">
            <svg width="40" height="52" viewBox="0 0 40 52">
              <path
                d="M20 0C9 0 0 9 0 20c0 14 20 32 20 32s20-18 20-32C40 9 31 0 20 0z"
                fill={ETAT_COLOR.a_remplacer}
                stroke="#fff"
                strokeWidth="2"
              />
              <circle cx="20" cy="20" r="6" fill="#fff" />
            </svg>
          </div>
        </div>
      )}

      {/* Thumb-zone actions (hidden while the sheet is open) */}
      {!reporting && (
        <div className="absolute inset-x-0 bottom-0 z-20 flex items-center justify-center gap-3 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={() => setReporting(true)}
            className="flex-1 max-w-xs rounded-full bg-orange px-6 py-3.5 text-center font-heading font-bold uppercase text-sm tracking-wide text-black shadow-lg hover:bg-orange-light transition-colors"
          >
            Signaler un terrain
          </button>
          <button
            type="button"
            onClick={locateMe}
            aria-label="Ma position"
            className="shrink-0 h-12 w-12 rounded-full bg-black/70 backdrop-blur flex items-center justify-center hover:bg-black/80 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
            </svg>
          </button>
        </div>
      )}

      {reporting && <SignalementSheet getCenter={getCenter} onClose={() => setReporting(false)} />}
    </main>
  );
}
