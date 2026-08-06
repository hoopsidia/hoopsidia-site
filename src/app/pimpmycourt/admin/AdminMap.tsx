"use client";

import { useEffect, useRef } from "react";
import * as maplibregl from "maplibre-gl";
import type { Map as MlMap, Marker } from "maplibre-gl";
import { ETAT_COLOR } from "@/lib/pmc/types";

// Back-office map: plots every terrain over satellite imagery, using the same
// round head markers as the public map (orange = à remplacer, green = remplacé).
export type AdminMapTerrain = {
  id: string;
  latitude: number;
  longitude: number;
  ville: string | null;
  statut: string;
  etat: "a_remplacer" | "remplace";
  nom_terrain: string | null;
};

// Round marker with the white Hoopsidia head inside, coloured by etat — matches
// the public map's markers.
function headMarkerEl(etat: "a_remplacer" | "remplace"): HTMLElement {
  const el = document.createElement("div");
  el.style.cssText = `width:24px;height:24px;border-radius:50%;cursor:pointer;background:${ETAT_COLOR[etat]};
    border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;`;
  const head = document.createElement("img");
  head.src = "/images/logo-head.png";
  head.alt = "";
  head.style.cssText = "width:14px;height:14px;filter:brightness(0) invert(1);";
  el.appendChild(head);
  return el;
}

const FRANCE_CENTER: [number, number] = [2.4, 46.6];

export default function AdminMap({ terrains }: { terrains: AdminMapTerrain[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MlMap | null>(null);
  const markersRef = useRef<Marker[]>([]);

  // Init once.
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {
          sat: {
            type: "raster",
            tiles: ["https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"],
            tileSize: 256,
            maxzoom: 19,
            attribution: "© Esri, Maxar, Earthstar Geographics",
          },
          labels: {
            type: "raster",
            tiles: ["https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"],
            tileSize: 256,
            maxzoom: 19,
          },
        },
        layers: [
          { id: "sat", type: "raster", source: "sat" },
          { id: "labels", type: "raster", source: "labels" },
        ],
      },
      center: FRANCE_CENTER,
      zoom: 5,
      maxZoom: 19,
      attributionControl: { compact: true },
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-right");
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  // Re-plot markers whenever the data changes.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const plot = () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      const bounds = new maplibregl.LngLatBounds();
      let n = 0;
      for (const t of terrains) {
        if (typeof t.latitude !== "number" || typeof t.longitude !== "number") continue;
        const el = headMarkerEl(t.etat);
        const popup = new maplibregl.Popup({ offset: 12, closeButton: false, className: "pmc-popup" }).setText(
          `${t.nom_terrain ?? t.ville ?? "Terrain"} — ${t.statut}`,
        );
        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([t.longitude, t.latitude])
          .setPopup(popup)
          .addTo(map);
        el.addEventListener("mouseenter", () => marker.togglePopup());
        el.addEventListener("mouseleave", () => marker.togglePopup());
        markersRef.current.push(marker);
        bounds.extend([t.longitude, t.latitude]);
        n++;
      }
      if (n === 1) map.easeTo({ center: bounds.getCenter(), zoom: 15 });
      else if (n > 1) map.fitBounds(bounds, { padding: 60, maxZoom: 16, duration: 0 });
    };

    if (map.isStyleLoaded()) plot();
    else map.once("load", plot);
  }, [terrains]);

  return <div ref={containerRef} className="h-[60vh] min-h-[380px] w-full rounded-xl overflow-hidden border border-white/10" />;
}
