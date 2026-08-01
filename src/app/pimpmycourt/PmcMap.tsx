"use client";

import { useEffect, useRef } from "react";
import * as maplibregl from "maplibre-gl";
import type { Map as MlMap, Marker } from "maplibre-gl";
import Supercluster from "supercluster";
import { supabaseBrowser } from "@/lib/pmc/supabase";
import { ETAT_COLOR, type Etat, type TerrainPublic } from "@/lib/pmc/types";

type Stats = { total: number; remplaces: number };
type PointProps = { id: string; etat: Etat };
type ClusterProps = { remplace: number };

const FRANCE_CENTER: [number, number] = [2.4, 46.6];

// Clustering runs on the main thread (Supercluster) rather than via MapLibre's
// GeoJSON source, whose worker doesn't load under the Next.js bundler. This is
// robust and gives full control over the signature bicolor cluster ring.

function ringMarkerEl(remplace: number, total: number): HTMLElement {
  const pct = total > 0 ? remplace / total : 0;
  const deg = Math.round(pct * 360);
  const el = document.createElement("div");
  const size = 40 + Math.min(total, 200) / 200 * 26; // 40–66px by weight
  el.style.cssText = `width:${size}px;height:${size}px;border-radius:50%;cursor:pointer;
    background:conic-gradient(${ETAT_COLOR.remplace} 0 ${deg}deg, ${ETAT_COLOR.a_remplacer} ${deg}deg 360deg);
    display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,.4);`;
  const inner = document.createElement("div");
  const inSize = size - 12;
  inner.style.cssText = `width:${inSize}px;height:${inSize}px;border-radius:50%;background:#0d0d0d;color:#fff;
    display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;`;
  inner.textContent = String(total);
  el.appendChild(inner);
  return el;
}

function pointMarkerEl(etat: Etat): HTMLElement {
  const el = document.createElement("div");
  const color = ETAT_COLOR[etat];
  // Shape encodes state too (not hue-only): circle = à remplacer, diamond = remplacé.
  const radius = etat === "remplace" ? "3px" : "50%";
  const rotate = etat === "remplace" ? "rotate(45deg)" : "none";
  el.style.cssText = `width:16px;height:16px;background:${color};border:2px solid #fff;
    border-radius:${radius};transform:${rotate};cursor:pointer;box-shadow:0 1px 4px rgba(0,0,0,.5);`;
  return el;
}

export default function PmcMap({ onStats }: { onStats?: (s: Stats) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MlMap | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution: "© OpenStreetMap",
          },
        },
        layers: [{ id: "osm", type: "raster", source: "osm" }],
      },
      center: FRANCE_CENTER,
      zoom: 5,
      attributionControl: { compact: true },
    });
    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");

    const index = new Supercluster<PointProps, ClusterProps>({
      radius: 55,
      maxZoom: 15,
      map: (props) => ({ remplace: props.etat === "remplace" ? 1 : 0 }),
      reduce: (acc, props) => {
        acc.remplace += props.remplace;
      },
    });

    let markers: Marker[] = [];
    const render = () => {
      const b = map.getBounds();
      const bbox: [number, number, number, number] = [
        b.getWest(),
        b.getSouth(),
        b.getEast(),
        b.getNorth(),
      ];
      const zoom = Math.floor(map.getZoom());
      const clusters = index.getClusters(bbox, zoom);

      markers.forEach((m) => m.remove());
      markers = [];

      for (const c of clusters) {
        const [lng, lat] = c.geometry.coordinates as [number, number];
        const p = c.properties as Supercluster.ClusterProperties & ClusterProps & PointProps;
        let el: HTMLElement;
        if (p.cluster) {
          el = ringMarkerEl(p.remplace ?? 0, p.point_count);
          el.addEventListener("click", () => {
            const zoomTo = Math.min(index.getClusterExpansionZoom(p.cluster_id), 16);
            map.easeTo({ center: [lng, lat], zoom: zoomTo });
          });
        } else {
          el = pointMarkerEl(p.etat);
          el.addEventListener("click", () => {
            window.location.href = `/pimpmycourt/terrain/${p.id}`;
          });
        }
        markers.push(new maplibregl.Marker({ element: el }).setLngLat([lng, lat]).addTo(map));
      }
    };

    map.on("load", async () => {
      const rows = await fetchTerrains();
      onStats?.({
        total: rows.length,
        remplaces: rows.filter((r) => r.etat === "remplace").length,
      });
      index.load(
        rows.map((r) => ({
          type: "Feature" as const,
          geometry: { type: "Point" as const, coordinates: [r.longitude, r.latitude] },
          properties: { id: r.id, etat: r.etat },
        })),
      );
      render();
      map.on("moveend", render);
    });

    return () => {
      markers.forEach((m) => m.remove());
      map.remove();
      mapRef.current = null;
    };
  }, [onStats]);

  // h-full (not absolute inset-0): MapLibre forces position:relative on its
  // container, which would void absolute positioning and collapse the height.
  return <div ref={containerRef} className="h-full w-full" />;
}

async function fetchTerrains(): Promise<TerrainPublic[]> {
  if (!supabaseBrowser) return [];
  const { data, error } = await supabaseBrowser
    .from("terrains_public")
    .select("id,latitude,longitude,ville,departement,photo_avant_url,etat,nb_confirmations");
  if (error) {
    console.error("terrains_public fetch error:", error.message);
    return [];
  }
  return (data ?? []) as TerrainPublic[];
}
