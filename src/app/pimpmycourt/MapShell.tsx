"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import type { Map as MlMap } from "maplibre-gl";
import { ETAT_COLOR, type TerrainMarker } from "@/lib/pmc/types";
import PmcMap from "./PmcMap";
import SignalementSheet from "./SignalementSheet";
import AddressSearch from "./AddressSearch";
import TerrainCard from "./TerrainCard";

// Google-Maps-style interface, brand-styled and adapted to court reporting:
// a search pill + menu drawer, bottom-right map controls, a place card on
// marker tap, and an "add a marker" flow (place → confirm → details sheet).
type Pos = { lat: number; lng: number };

const NAV = [
  { href: "/pimpmycourt", label: "La carte" },
  { href: "/pimpmycourt/tournage", label: "Protocole de tournage" },
  { href: "/pimpmycourt/kit", label: "Demander un kit" },
  { href: "/pimpmycourt/donnees", label: "Données personnelles" },
];

function CtrlBtn({ onClick, label, children }: { onClick: () => void; label: string; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="h-11 w-11 rounded-xl bg-black/80 backdrop-blur border border-white/10 flex items-center justify-center text-white hover:bg-black transition-colors"
    >
      {children}
    </button>
  );
}

export default function MapShell() {
  const [stats, setStats] = useState<{ total: number; remplaces: number } | null>(null);
  const [drawer, setDrawer] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [placedPos, setPlacedPos] = useState<Pos | null>(null);
  const [reporting, setReporting] = useState(false);
  const [selected, setSelected] = useState<TerrainMarker | null>(null);
  const mapRef = useRef<MlMap | null>(null);

  const handleMapReady = useCallback((map: MlMap) => { mapRef.current = map; }, []);
  const flyTo = useCallback((lng: number, lat: number) => {
    mapRef.current?.flyTo({ center: [lng, lat], zoom: 17 });
  }, []);
  const onSelectTerrain = useCallback((t: TerrainMarker) => {
    setPlacing(false);
    setSelected(t);
  }, []);

  const locateMe = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) =>
      mapRef.current?.flyTo({ center: [pos.coords.longitude, pos.coords.latitude], zoom: 15 }),
    );
  };

  const startPlacing = () => { setSelected(null); setPlacing(true); };
  const confirmPlacement = () => {
    const c = mapRef.current?.getCenter();
    setPlacedPos({ lat: c?.lat ?? 46.6, lng: c?.lng ?? 2.4 });
    setPlacing(false);
    setReporting(true);
  };

  return (
    <main className="relative h-[100dvh] w-full overflow-hidden bg-[#0d0d0d] text-white">
      <PmcMap onStats={setStats} onMapReady={handleMapReady} onSelectTerrain={onSelectTerrain} />

      {/* Search pill + hamburger (top) */}
      <div className="absolute top-3 left-3 right-3 sm:right-auto sm:w-96 z-30">
        <AddressSearch
          onSelect={flyTo}
          leading={
            <button onClick={() => setDrawer(true)} aria-label="Menu" className="text-white/80 hover:text-white p-1 shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18" /></svg>
            </button>
          }
        />
        {/* Counter chip (story-screenshot element) */}
        <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-black/80 backdrop-blur px-3 py-1.5 text-xs font-heading font-bold">
          <span className="text-orange">{stats ? stats.total : "—"} signalés</span>
          <span className="text-white/30">·</span>
          <span style={{ color: ETAT_COLOR.remplace }}>{stats ? stats.remplaces : "—"} remplacés</span>
        </div>
      </div>

      {/* Legend (bottom-left map key) */}
      <div className="pointer-events-none absolute left-3 bottom-3 z-10 flex flex-col gap-1 text-[11px] bg-black/60 backdrop-blur rounded-lg p-2">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-full ring-1 ring-white/80" style={{ background: ETAT_COLOR.a_remplacer }} />
          À remplacer
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-full ring-1 ring-white/80" style={{ background: ETAT_COLOR.remplace }} />
          Remplacé
        </span>
      </div>

      {/* Map controls (bottom-right, Google-style) */}
      <div className="absolute right-3 bottom-24 sm:bottom-28 z-20 flex flex-col gap-2">
        <CtrlBtn onClick={locateMe} label="Ma position">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" /></svg>
        </CtrlBtn>
        <CtrlBtn onClick={() => mapRef.current?.zoomIn()} label="Zoom avant">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
        </CtrlBtn>
        <CtrlBtn onClick={() => mapRef.current?.zoomOut()} label="Zoom arrière">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14" /></svg>
        </CtrlBtn>
      </div>

      {/* Centre pin — only while placing a new terrain: black pin, white
          Hoopsidia head inside */}
      {placing && (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center" aria-hidden>
          <div className="relative -translate-y-5 drop-shadow-[0_2px_5px_rgba(0,0,0,0.6)]" style={{ width: 30, height: 39 }}>
            <svg viewBox="0 0 40 52" width="30" height="39" className="absolute inset-0">
              <path d="M20 0C9 0 0 9 0 20c0 14 20 32 20 32s20-18 20-32C40 9 31 0 20 0z" fill="#0d0d0d" stroke="#fff" strokeWidth="2.5" />
            </svg>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/logo-head.png"
              alt=""
              style={{ position: "absolute", top: 5, left: "50%", transform: "translateX(-50%)", width: 18, height: 18, filter: "brightness(0) invert(1)" }}
            />
          </div>
        </div>
      )}

      {/* Placing banner + confirm bar */}
      {placing && (
        <>
          <div className="absolute inset-x-0 top-20 z-30 flex justify-center px-4">
            <div className="rounded-full bg-black/85 backdrop-blur px-4 py-2 text-sm font-heading font-bold text-center">
              Déplace la carte pour poser le repère sur le terrain
            </div>
          </div>
          <div className="absolute inset-x-0 bottom-0 z-30 flex items-center justify-center gap-3 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <button onClick={() => setPlacing(false)} className="rounded-full glass-subtle px-6 py-3.5 font-heading font-bold uppercase text-sm hover:bg-white/10">
              Annuler
            </button>
            <button onClick={confirmPlacement} className="flex-1 max-w-xs rounded-full bg-orange px-6 py-3.5 text-center font-heading font-bold uppercase text-sm tracking-wide text-black shadow-lg hover:bg-orange-light">
              Confirmer la position
            </button>
          </div>
        </>
      )}

      {/* Primary action (browse mode) */}
      {!placing && !reporting && !selected && (
        <div className="absolute inset-x-0 bottom-0 z-20 flex items-center justify-center p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <button
            onClick={startPlacing}
            className="flex items-center gap-2 rounded-full bg-orange px-7 py-3.5 font-heading font-bold uppercase text-sm tracking-wide text-black shadow-lg hover:bg-orange-light transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
            Signaler un terrain
          </button>
        </div>
      )}

      {/* Selected marker card */}
      {selected && !reporting && <TerrainCard terrain={selected} onClose={() => setSelected(null)} />}

      {/* Reporting sheet (after confirming placement) */}
      {reporting && placedPos && (
        <SignalementSheet position={placedPos} onClose={() => { setReporting(false); setPlacedPos(null); }} />
      )}

      {/* Menu drawer */}
      {drawer && (
        <div className="absolute inset-0 z-50" onClick={() => setDrawer(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <div
            className="absolute top-0 left-0 h-full w-72 max-w-[80%] bg-black border-r border-white/10 p-5 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <Link href="/" className="font-heading text-xl font-bold italic">
                <span className="text-orange">HOOPS</span><span className="text-white">IDIA</span>
              </Link>
              <button onClick={() => setDrawer(false)} aria-label="Fermer" className="text-white/50 hover:text-white text-2xl leading-none">×</button>
            </div>
            <span className="text-[11px] font-heading font-bold uppercase tracking-wide text-orange/80">Pimp My Court · La carte des filets</span>

            <nav className="mt-6 flex flex-col gap-1 font-heading font-bold">
              {NAV.map((l) => (
                <Link key={l.href} href={l.href} onClick={() => setDrawer(false)} className="rounded-lg px-3 py-2.5 text-white/80 hover:bg-white/10 hover:text-white">
                  {l.label}
                </Link>
              ))}
            </nav>

            <Link href="/" className="mt-auto text-sm text-white/40 hover:text-white">← Le site hoopsidia.com</Link>
          </div>
        </div>
      )}
    </main>
  );
}
