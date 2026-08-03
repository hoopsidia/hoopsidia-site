"use client";

import { useEffect, useRef } from "react";
import * as maplibregl from "maplibre-gl";
import { ETAT_COLOR, type Etat } from "@/lib/pmc/types";

// Small interactive satellite map for the terrain page (Google-Maps-embed feel):
// centred on the court with a status marker, pannable/zoomable, capped at the
// max zoom where imagery exists.
export default function TerrainMiniMap({ lat, lng, etat }: { lat: number; lng: number; etat: Etat }) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!ref.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: ref.current,
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
      center: [lng, lat],
      zoom: 17,
      maxZoom: 19,
      attributionControl: { compact: true },
    });
    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");

    const el = document.createElement("div");
    const color = ETAT_COLOR[etat];
    el.style.cssText = `width:20px;height:20px;background:${color};border:3px solid #fff;
      border-radius:${etat === "remplace" ? "3px" : "50%"};transform:${etat === "remplace" ? "rotate(45deg)" : "none"};
      box-shadow:0 1px 6px rgba(0,0,0,.6);`;
    new maplibregl.Marker({ element: el }).setLngLat([lng, lat]).addTo(map);

    return () => { map.remove(); mapRef.current = null; };
  }, [lat, lng, etat]);

  return <div ref={ref} className="h-full w-full" />;
}
