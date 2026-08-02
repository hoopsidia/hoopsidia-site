"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import type { Map as MlMap } from "maplibre-gl";
import { ETAT_COLOR } from "@/lib/pmc/types";
import PmcMap from "./PmcMap";
import SignalementSheet from "./SignalementSheet";
import AddressSearch from "./AddressSearch";

// Full-screen map with all navigation grouped into a single black card pinned
// top-left (§5). A centre crosshair is always shown so you place the point by
// panning; reporting opens a bottom sheet.
const NAV = [
  { href: "/pimpmycourt", label: "La carte", active: true },
  { href: "/pimpmycourt/tournage", label: "Protocole" },
  { href: "/pimpmycourt/kit", label: "Demander un kit" },
];

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

      {/* Nav card — all navigation, pinned top-left */}
      <div className="absolute top-3 left-3 z-30 w-[calc(100%-1.5rem)] max-w-xs rounded-2xl bg-black/95 border border-white/10 shadow-2xl p-4">
        {/* Brand → main site */}
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-heading text-lg font-bold italic">
            <span className="text-orange">HOOPS</span>
            <span className="text-white">IDIA</span>
          </span>
          <span className="text-[10px] font-heading font-bold uppercase tracking-wide text-orange/80">
            Pimp My Court
          </span>
        </Link>

        {/* Menu */}
        <nav className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm font-heading font-bold">
          {NAV.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={l.active ? "text-orange" : "text-white/70 hover:text-white transition-colors"}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="my-3 h-px bg-white/10" />

        {/* Title + intro */}
        <h1 className="font-heading text-xl font-bold italic uppercase leading-tight">
          La carte des filets
        </h1>
        <p className="mt-1 text-xs text-white/60">
          Signale un terrain, on t&apos;envoie de quoi le remettre en état.
        </p>

        {/* Live counter */}
        <div className="mt-3 flex items-center gap-2 text-xs font-heading font-bold">
          <span className="text-orange">{stats ? stats.total : "—"} signalés</span>
          <span className="text-white/30">·</span>
          <span style={{ color: ETAT_COLOR.remplace }}>{stats ? stats.remplaces : "—"} remplacés</span>
        </div>

        {/* Search */}
        <div className="mt-3">
          <AddressSearch onSelect={flyTo} />
        </div>

        {/* Legend + data link */}
        <div className="mt-3 flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-3 text-white/60">
            <span className="inline-flex items-center gap-1">
              <span className="inline-block h-2.5 w-2.5 rounded-full ring-1 ring-white/70" style={{ background: ETAT_COLOR.a_remplacer }} />
              À remplacer
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="inline-block h-2.5 w-2.5 rotate-45 ring-1 ring-white/70" style={{ background: ETAT_COLOR.remplace }} />
              Remplacé
            </span>
          </div>
        </div>
        <Link href="/pimpmycourt/donnees" className="mt-2 block text-[11px] text-white/40 hover:text-white underline">
          Données personnelles
        </Link>
      </div>

      {/* Centre crosshair — always visible, marks the point to report */}
      <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center" aria-hidden>
        <div className="-translate-y-3 drop-shadow-[0_2px_6px_rgba(0,0,0,0.7)]">
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
