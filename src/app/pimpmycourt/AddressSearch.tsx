"use client";

import { useRef, useState, type ReactNode } from "react";

type Suggestion = { name: string; detail: string; lng?: number; lat?: number; placeId?: string };

// Place / address search via Nominatim (OpenStreetMap) — like Google Maps, it
// finds named places and POIs (stades, gymnases, parcs…), not only postal
// addresses. Picking a result flies the map there so the centre crosshair lands
// on the terrain. France-biased.
export default function AddressSearch({
  onSelect,
  leading,
}: {
  onSelect: (lng: number, lat: number) => void;
  leading?: ReactNode;
}) {
  const [q, setQ] = useState("");
  const [items, setItems] = useState<Suggestion[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function onChange(value: string) {
    setQ(value);
    if (timer.current) clearTimeout(timer.current);
    if (value.trim().length < 3) {
      setItems([]);
      return;
    }
    timer.current = setTimeout(async () => {
      // Google Places suggestions first (richer POIs); fall back to Nominatim.
      try {
        const g = await fetch(`/api/pimpmycourt/places?q=${encodeURIComponent(value)}`).then((r) => r.json());
        if (Array.isArray(g?.suggestions) && g.suggestions.length > 0) {
          setItems(
            (g.suggestions as { placeId: string; main: string; secondary: string }[]).map((s) => ({
              name: s.main,
              detail: s.secondary,
              placeId: s.placeId,
            })),
          );
          return;
        }
      } catch {
        /* fall through to Nominatim */
      }
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=jsonv2&countrycodes=fr&limit=6&q=${encodeURIComponent(value)}`,
          { headers: { "Accept-Language": "fr" } },
        );
        const data = await res.json();
        setItems(
          (Array.isArray(data) ? data : []).map((d: { display_name: string; name?: string; lat: string; lon: string }) => {
            const parts = d.display_name.split(",");
            return {
              name: d.name || parts[0].trim(),
              detail: (d.name ? parts : parts.slice(1)).join(",").trim(),
              lng: parseFloat(d.lon),
              lat: parseFloat(d.lat),
            };
          }),
        );
      } catch {
        setItems([]);
      }
    }, 400);
  }

  async function pick(s: Suggestion) {
    if (s.placeId) {
      // Google prediction → resolve coordinates via Place Details.
      try {
        const d = await fetch(`/api/pimpmycourt/places?place_id=${encodeURIComponent(s.placeId)}`).then((r) => r.json());
        if (typeof d?.lat === "number" && typeof d?.lng === "number") onSelect(d.lng, d.lat);
      } catch {
        /* ignore */
      }
    } else if (typeof s.lng === "number" && typeof s.lat === "number") {
      onSelect(s.lng, s.lat);
    }
    setQ(s.name);
    setItems([]);
  }

  return (
    <div className="pointer-events-auto relative">
      <div className="flex items-center gap-2 rounded-full bg-black border border-white/10 shadow-lg pl-2 pr-3 py-2">
        {leading}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-orange shrink-0">
          <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
        </svg>
        <input
          value={q}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Chercher un lieu, une adresse, un terrain…"
          className="w-full bg-transparent text-sm text-white placeholder:text-white/40 outline-none"
        />
        {q && (
          <button
            onClick={() => { setQ(""); setItems([]); }}
            aria-label="Effacer"
            className="text-white/40 hover:text-white shrink-0"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        )}
      </div>
      {items.length > 0 && (
        <ul className="absolute left-0 right-0 mt-1 rounded-xl bg-[#0d0d0d] border border-white/10 overflow-hidden shadow-lg max-h-72 overflow-y-auto">
          {items.map((s, i) => (
            <li key={i}>
              <button
                onClick={() => pick(s)}
                className="w-full text-left px-3 py-2 hover:bg-white/10"
              >
                <div className="text-sm text-white font-medium truncate">{s.name}</div>
                {s.detail && <div className="text-xs text-white/40 truncate">{s.detail}</div>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
