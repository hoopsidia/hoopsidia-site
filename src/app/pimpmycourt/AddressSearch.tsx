"use client";

import { useRef, useState } from "react";

type Suggestion = { label: string; lng: number; lat: number };

// Address / place search via the French government geocoder
// (api-adresse.data.gouv.fr). Picking a result flies the map there so the
// centre crosshair lands on the terrain.
export default function AddressSearch({ onSelect }: { onSelect: (lng: number, lat: number) => void }) {
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
      try {
        const res = await fetch(
          `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(value)}&limit=5`,
        );
        const data = await res.json();
        setItems(
          (data.features ?? []).map((f: { properties: { label: string }; geometry: { coordinates: [number, number] } }) => ({
            label: f.properties.label,
            lng: f.geometry.coordinates[0],
            lat: f.geometry.coordinates[1],
          })),
        );
      } catch {
        setItems([]);
      }
    }, 300);
  }

  function pick(s: Suggestion) {
    onSelect(s.lng, s.lat);
    setQ(s.label);
    setItems([]);
  }

  return (
    <div className="pointer-events-auto relative">
      <div className="flex items-center gap-2 rounded-full bg-black/70 backdrop-blur px-3 py-2">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/50 shrink-0">
          <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
        </svg>
        <input
          value={q}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Chercher une adresse, une ville…"
          className="w-full bg-transparent text-sm text-white placeholder:text-white/40 outline-none"
        />
      </div>
      {items.length > 0 && (
        <ul className="absolute left-0 right-0 mt-1 rounded-xl bg-[#0d0d0d] border border-white/10 overflow-hidden shadow-lg">
          {items.map((s, i) => (
            <li key={i}>
              <button
                onClick={() => pick(s)}
                className="w-full text-left px-3 py-2 text-sm text-white/80 hover:bg-white/10"
              >
                {s.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
