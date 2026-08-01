"use client";

import { useState } from "react";
import { ETAT_COLOR } from "@/lib/pmc/types";
import PmcMap from "./PmcMap";

// Full-screen map shell for /pimpmycourt (§5). Signalement flow (bottom sheet
// form) is wired in step 4 with the server route + service role.

export default function MapShell() {
  const [stats, setStats] = useState<{ total: number; remplaces: number } | null>(null);

  return (
    <main className="relative h-[100dvh] w-full overflow-hidden bg-[#0d0d0d] text-white">
      {/* MapLibre canvas (full-bleed) */}
      <PmcMap onStats={setStats} />

      {/* Editorial framing (top overlay) */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 p-4 sm:p-6">
        <div className="max-w-md">
          <h1 className="font-heading text-2xl sm:text-3xl font-bold italic uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
            La carte des filets
          </h1>
          <p className="mt-1 text-sm text-white/90 max-w-xs drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
            Signale un terrain, on t&apos;envoie de quoi le remettre en état.
          </p>

          {/* Live counter — the story-screenshot element */}
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-black/70 backdrop-blur px-3 py-1.5 text-xs font-heading font-bold">
            <span className="text-orange">
              {stats ? stats.total : "—"} terrains signalés
            </span>
            <span className="text-white/30">·</span>
            <span style={{ color: ETAT_COLOR.remplace }}>
              {stats ? stats.remplaces : "—"} filets remplacés
            </span>
          </div>
        </div>
      </div>

      {/* Legend — shape + color (accessibility: not hue-only) */}
      <div className="pointer-events-none absolute left-4 bottom-28 z-10 flex flex-col gap-1.5 text-xs bg-black/50 backdrop-blur rounded-lg p-2">
        <span className="inline-flex items-center gap-2">
          <span
            className="inline-block h-3 w-3 rounded-full ring-2 ring-white/80"
            style={{ background: ETAT_COLOR.a_remplacer }}
          />
          À remplacer
        </span>
        <span className="inline-flex items-center gap-2">
          <span
            className="inline-block h-3 w-3 rotate-45 ring-2 ring-white/80"
            style={{ background: ETAT_COLOR.remplace }}
          />
          Remplacé
        </span>
      </div>

      {/* Thumb-zone floating actions */}
      <div className="absolute inset-x-0 bottom-0 z-20 flex items-center justify-center gap-3 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <button
          type="button"
          className="flex-1 max-w-xs rounded-full bg-orange px-6 py-3.5 text-center font-heading font-bold uppercase text-sm tracking-wide text-black shadow-lg hover:bg-orange-light transition-colors"
        >
          Signaler un terrain
        </button>
        <button
          type="button"
          aria-label="Ma position"
          className="shrink-0 h-12 w-12 rounded-full bg-black/70 backdrop-blur flex items-center justify-center hover:bg-black/80 transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
          </svg>
        </button>
      </div>
    </main>
  );
}
