"use client";

// Full-screen map shell for /pimpmycourt. The MapLibre canvas, live clustering
// (bicolor proportional rings) and the real counter get wired in once Supabase
// data and the OSM tile source are provisioned (steps 2–3 of the brief).
// For now this establishes the signature full-bleed layout, the editorial
// framing (§5), the status color couple (§12) and the thumb-zone CTAs.

// Status color couple — deliberately distinct from the brand orange so both
// read cleanly over a light OSM basemap. Distinction is not hue-only: markers
// also differ by shape (see legend).
const STATUS = {
  aRemplacer: "#E4572E", // warm, saturated — "à remplacer"
  remplace: "#2FA84F", // validating green — "remplacé"
};

export default function MapShell() {
  return (
    <main className="relative h-[100dvh] w-full overflow-hidden bg-[#0d0d0d] text-white">
      {/* Map canvas placeholder — replaced by MapLibre GL */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          backgroundImage:
            "radial-gradient(circle at 30% 30%, rgba(252,141,51,0.08), transparent 60%), radial-gradient(circle at 70% 70%, rgba(47,168,79,0.06), transparent 55%)",
        }}
        aria-hidden
      >
        <p className="font-heading text-white/15 text-sm uppercase tracking-widest">
          Carte MapLibre — en cours d&apos;intégration
        </p>
      </div>

      {/* Editorial framing (top overlay) */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 p-4 sm:p-6">
        <div className="max-w-md">
          <h1 className="font-heading text-2xl sm:text-3xl font-bold italic uppercase drop-shadow">
            La carte des filets
          </h1>
          <p className="mt-1 text-sm text-white/70 drop-shadow max-w-xs">
            Signale un terrain, on t&apos;envoie de quoi le remettre en état.
          </p>

          {/* Live counter — the story-screenshot element */}
          <div className="mt-3 inline-flex items-center gap-2 rounded-full glass-subtle px-3 py-1.5 text-xs font-heading font-bold">
            <span className="text-orange">— terrains signalés</span>
            <span className="text-white/30">·</span>
            <span style={{ color: STATUS.remplace }}>— filets remplacés</span>
          </div>
        </div>
      </div>

      {/* Legend — shape + color (accessibility: not hue-only) */}
      <div className="pointer-events-none absolute left-4 bottom-28 z-10 flex flex-col gap-1.5 text-xs">
        <span className="inline-flex items-center gap-2">
          <span
            className="inline-block h-3 w-3 rounded-full ring-2 ring-white/70"
            style={{ background: STATUS.aRemplacer }}
          />
          À remplacer
        </span>
        <span className="inline-flex items-center gap-2">
          <span
            className="inline-block h-3 w-3 rotate-45 ring-2 ring-white/70"
            style={{ background: STATUS.remplace }}
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
          className="shrink-0 h-12 w-12 rounded-full glass-strong flex items-center justify-center hover:bg-white/10 transition-colors"
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
