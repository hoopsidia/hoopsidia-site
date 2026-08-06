"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Map as MlMap } from "maplibre-gl";
import { ETAT_COLOR, type Etat, type TerrainMarker } from "@/lib/pmc/types";
import PmcMap from "./PmcMap";
import SignalementSheet from "./SignalementSheet";
import AddressSearch from "./AddressSearch";
import TerrainCard from "./TerrainCard";

// Google-Maps-style interface, brand-styled and adapted to court reporting:
// a search pill, bottom-right map controls, a place card on marker tap, and an
// "add a marker" flow (place → confirm → details sheet).
type Pos = { lat: number; lng: number };

function LegendDot({ etat }: { etat: Etat }) {
  return (
    <span className="relative inline-flex h-4 w-4 items-center justify-center rounded-full border border-white/80" style={{ background: ETAT_COLOR[etat] }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/logo-head.png" alt="" className="h-2.5 w-2.5" style={{ filter: "brightness(0) invert(1)" }} />
    </span>
  );
}

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
  const [placing, setPlacing] = useState(false);
  const [placedPos, setPlacedPos] = useState<Pos | null>(null);
  const [reporting, setReporting] = useState(false);
  const [selected, setSelected] = useState<TerrainMarker | null>(null); // pinned (clicked)
  const [hovered, setHovered] = useState<TerrainMarker | null>(null); // transient (hover)
  const [stats, setStats] = useState<{ total: number; remplaces: number; filetsRemplaces: number } | null>(null);
  const [mapObj, setMapObj] = useState<MlMap | null>(null); // for render-time projection
  const [, setMoveTick] = useState(0); // force re-render so the card tracks the pin
  const mapRef = useRef<MlMap | null>(null);

  // The place card shows the pinned terrain, or the hovered one as a preview.
  const card = selected ?? hovered;

  // Keep the place card anchored to its pin: re-render on every map move while
  // a card is open, then project the terrain's coordinates to screen pixels.
  useEffect(() => {
    if (!mapObj || !card) return;
    const onMove = () => setMoveTick((t) => t + 1);
    mapObj.on("move", onMove);
    return () => { mapObj.off("move", onMove); };
  }, [mapObj, card]);
  const cardPos = card && mapObj ? mapObj.project([card.longitude, card.latitude]) : null;

  // Count the visit once per page load (fire-and-forget).
  useEffect(() => {
    fetch("/api/pimpmycourt/visit", { method: "POST" }).catch(() => {});
  }, []);

  const handleMapReady = useCallback((map: MlMap) => {
    mapRef.current = map;
    setMapObj(map);

    // Clicking anywhere on the map (not a marker) dismisses the place card.
    map.on("click", () => { setSelected(null); setHovered(null); });

    // Long-press (touch) / right-click (desktop) anywhere on the map: enter
    // placement mode centred exactly on that point, so the user can fine-tune
    // and then confirm with the button.
    const openAt = (lat: number, lng: number) => {
      setSelected(null);
      setReporting(false);
      setPlacing(true);
      map.easeTo({ center: [lng, lat] });
    };
    let lastLongPress = 0;
    map.on("contextmenu", (e) => {
      if (Date.now() - lastLongPress < 800) return; // avoid double-fire on touch
      openAt(e.lngLat.lat, e.lngLat.lng);
    });

    // Manual long-press detector — reliable across mobile browsers.
    const canvas = map.getCanvasContainer();
    let timer: ReturnType<typeof setTimeout> | null = null;
    let start: { x: number; y: number } | null = null;
    const clear = () => { if (timer) { clearTimeout(timer); timer = null; } };
    canvas.addEventListener("touchstart", (ev: TouchEvent) => {
      if (ev.touches.length !== 1) { clear(); return; }
      const t = ev.touches[0];
      start = { x: t.clientX, y: t.clientY };
      clear();
      timer = setTimeout(() => {
        if (!start) return;
        const rect = canvas.getBoundingClientRect();
        const p = map.unproject([start.x - rect.left, start.y - rect.top]);
        lastLongPress = Date.now();
        openAt(p.lat, p.lng);
      }, 500);
    }, { passive: true });
    canvas.addEventListener("touchmove", (ev: TouchEvent) => {
      if (!start || !timer) return;
      const t = ev.touches[0];
      if (Math.hypot(t.clientX - start.x, t.clientY - start.y) > 12) clear();
    }, { passive: true });
    canvas.addEventListener("touchend", clear, { passive: true });
    canvas.addEventListener("touchcancel", clear, { passive: true });
  }, []);
  const flyTo = useCallback((lng: number, lat: number) => {
    mapRef.current?.flyTo({ center: [lng, lat], zoom: 17 });
  }, []);
  const onSelectTerrain = useCallback((t: TerrainMarker) => {
    setPlacing(false);
    setSelected(t);
  }, []);
  const closeCard = useCallback(() => { setSelected(null); setHovered(null); }, []);

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
      <PmcMap onStats={setStats} onMapReady={handleMapReady} onSelectTerrain={onSelectTerrain} onHoverTerrain={setHovered} />

      {/* Search pill + PIMP MY COURT logo (top) — above the placement banner so
          mobile search results are never hidden */}
      <div className="absolute top-3 left-3 right-3 sm:right-auto z-40 flex items-center gap-2">
        <div className="flex-1 sm:w-96 sm:flex-none min-w-0">
          <AddressSearch onSelect={flyTo} />
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/logo-pmc.png"
          alt="Pimp My Court"
          className="pointer-events-none h-11 w-auto shrink-0 drop-shadow-[0_2px_6px_rgba(0,0,0,0.7)]"
        />
      </div>

      {/* Legend (bottom-left map key) — head-in-dot to match the markers */}
      <div className="pointer-events-none absolute left-3 bottom-3 z-10 flex flex-col gap-1.5 text-[11px] bg-black/60 backdrop-blur rounded-lg p-2">
        <span className="inline-flex items-center gap-1.5">
          <LegendDot etat="a_remplacer" />
          Signalés
        </span>
        <span className="inline-flex items-center gap-1.5">
          <LegendDot etat="remplace" />
          Remplacés
          {stats && <b className="text-white">· {stats.filetsRemplaces} filet{stats.filetsRemplaces > 1 ? "s" : ""}</b>}
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

      {/* Centre marker — only while placing a new terrain: black circle with
          the white Hoopsidia head inside, centred on the drop point */}
      {placing && (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center" aria-hidden>
          <div
            className="flex items-center justify-center rounded-full border-2 border-white bg-[#0d0d0d] drop-shadow-[0_2px_5px_rgba(0,0,0,0.6)]"
            style={{ width: 24, height: 24 }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/logo-head.png"
              alt=""
              style={{ width: 14, height: 14, filter: "brightness(0) invert(1)" }}
            />
          </div>
        </div>
      )}

      {/* Placing banner + confirm bar */}
      {placing && (
        <>
          <div className="absolute inset-x-0 top-20 z-30 flex justify-center px-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-heading font-bold text-black text-center shadow-lg">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" className="shrink-0"><circle cx="12" cy="12" r="6" /><path d="M12 1v22M1 12h22" /></svg>
              Déplace la carte pour poser le repère sur le terrain
            </div>
          </div>
          <div className="absolute inset-x-0 bottom-0 z-30 flex items-center justify-center gap-3 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <button onClick={() => setPlacing(false)} className="rounded-full bg-white px-6 py-3.5 font-heading font-bold uppercase text-sm text-black shadow-lg hover:bg-white/90">
              Annuler
            </button>
            <button onClick={confirmPlacement} className="flex-1 max-w-xs rounded-full bg-orange px-6 py-3.5 text-center font-heading font-bold uppercase text-sm tracking-wide text-white shadow-lg hover:bg-orange-light">
              Confirmer la position
            </button>
          </div>
        </>
      )}

      {/* Primary action (browse mode) */}
      {!placing && !reporting && !card && (
        <div className="absolute inset-x-0 bottom-0 z-20 flex items-center justify-center p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <button
            onClick={startPlacing}
            className="flex items-center gap-2 rounded-full bg-orange px-7 py-3.5 font-heading font-bold uppercase text-sm tracking-wide text-white shadow-lg hover:bg-orange-light transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
            Signaler un terrain
          </button>
        </div>
      )}

      {/* Place card — anchored above the selected/hovered pin */}
      {card && !reporting && !placing && cardPos && (
        <div
          className="absolute z-40"
          style={{ left: cardPos.x, top: cardPos.y, transform: "translate(-50%, calc(-100% - 20px))" }}
          onMouseEnter={() => setHovered(card)}
          onMouseLeave={() => { if (!selected) setHovered(null); }}
        >
          <TerrainCard terrain={card} onClose={closeCard} />
        </div>
      )}

      {/* Reporting sheet (after confirming placement) */}
      {reporting && placedPos && (
        <SignalementSheet position={placedPos} onClose={() => { setReporting(false); setPlacedPos(null); }} />
      )}
    </main>
  );
}
