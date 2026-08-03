"use client";

import { useEffect, useRef } from "react";
import * as maplibregl from "maplibre-gl";
import type { Map as MlMap, Marker } from "maplibre-gl";
import Supercluster from "supercluster";
import { supabaseBrowser } from "@/lib/pmc/supabase";
import { ETAT_COLOR, type Etat, type TerrainMarker, type TerrainPublic } from "@/lib/pmc/types";

type Stats = { total: number; remplaces: number };
// Coordinates come from the feature geometry, not the stored properties.
type PointProps = Omit<TerrainMarker, "latitude" | "longitude">;
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
    display:flex;align-items:center;justify-content:center;box-shadow:0 0 0 2px rgba(255,255,255,.6), 0 2px 8px rgba(0,0,0,.45);`;
  const inner = document.createElement("div");
  const inSize = size - 12;
  inner.style.cssText = `width:${inSize}px;height:${inSize}px;border-radius:50%;background:#0d0d0d;color:#fff;
    display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;`;
  inner.textContent = String(total);
  el.appendChild(inner);
  return el;
}

function pointMarkerEl(etat: Etat): HTMLElement {
  const color = ETAT_COLOR[etat];
  // Teardrop pin (red = à remplacer, green = remplacé) with the white Hoopsidia
  // head inside. Anchored by its tip (see marker creation).
  const pin = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 52'><path d='M20 0C9 0 0 9 0 20c0 14 20 32 20 32s20-18 20-32C40 9 31 0 20 0z' fill='${color}' stroke='white' stroke-width='2.5'/></svg>`;
  // IMPORTANT: MapLibre applies its own positioning transform (translate) to the
  // element passed to `new Marker({ element })`. So the hover scale must live on
  // an INNER wrapper — mutating the root's transform would wipe MapLibre's
  // translate and snap the marker to the map's top-left corner.
  const el = document.createElement("div");
  el.style.cssText = "width:26px;height:34px;cursor:pointer;";
  const inner = document.createElement("div");
  inner.style.cssText = `width:100%;height:100%;position:relative;transform-origin:center bottom;transition:transform .12s;
    background-image:url("data:image/svg+xml,${encodeURIComponent(pin)}");background-size:contain;
    background-repeat:no-repeat;background-position:center;filter:drop-shadow(0 2px 3px rgba(0,0,0,.5));`;
  const head = document.createElement("img");
  head.src = "/images/logo-head.png";
  head.alt = "";
  head.style.cssText = "position:absolute;top:5px;left:50%;transform:translateX(-50%);width:15px;height:15px;filter:brightness(0) invert(1);";
  inner.appendChild(head);
  el.appendChild(inner);
  el.addEventListener("mouseenter", () => { inner.style.transform = "scale(1.12)"; });
  el.addEventListener("mouseleave", () => { inner.style.transform = "scale(1)"; });
  return el;
}

export default function PmcMap({
  onStats,
  onMapReady,
  onSelectTerrain,
}: {
  onStats?: (s: Stats) => void;
  onMapReady?: (map: MlMap) => void;
  onSelectTerrain?: (t: TerrainMarker) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MlMap | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {
          // Satellite imagery + a transparent labels/boundaries overlay = hybrid.
          // maxzoom 19: Esri imagery is generally unavailable past this globally.
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
      maxZoom: 19, // stop where satellite imagery runs out
      attributionControl: { compact: true },
    });
    mapRef.current = map;
    onMapReady?.(map);
    // No default controls — MapShell renders custom Google-style controls.

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
            onSelectTerrain?.({
              id: p.id,
              latitude: lat,
              longitude: lng,
              ville: p.ville,
              departement: p.departement,
              photo_avant_url: p.photo_avant_url,
              etat: p.etat,
              nb_confirmations: p.nb_confirmations,
              nb_paniers: p.nb_paniers,
              nb_filets_a_remplacer: p.nb_filets_a_remplacer,
              nom_terrain: p.nom_terrain,
            });
          });
        }
        markers.push(new maplibregl.Marker({ element: el, anchor: p.cluster ? "center" : "bottom" }).setLngLat([lng, lat]).addTo(map));
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
          properties: {
            id: r.id,
            ville: r.ville,
            departement: r.departement,
            photo_avant_url: r.photo_avant_url,
            etat: r.etat,
            nb_confirmations: r.nb_confirmations,
            nb_paniers: r.nb_paniers,
            nb_filets_a_remplacer: r.nb_filets_a_remplacer,
            nom_terrain: r.nom_terrain,
          },
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
  }, [onStats, onMapReady, onSelectTerrain]);

  // h-full (not absolute inset-0): MapLibre forces position:relative on its
  // container, which would void absolute positioning and collapse the height.
  return <div ref={containerRef} className="h-full w-full" />;
}

async function fetchTerrains(): Promise<TerrainPublic[]> {
  if (!supabaseBrowser) return [];
  const full = "id,latitude,longitude,ville,departement,photo_avant_url,etat,nb_confirmations,nb_paniers,nb_filets_a_remplacer,nom_terrain";
  const base = "id,latitude,longitude,ville,departement,photo_avant_url,etat,nb_confirmations,nb_paniers";
  let res = await supabaseBrowser.from("terrains_public").select(full);
  if (res.error) {
    // Pre-migration fallback: the new columns don't exist yet.
    res = await supabaseBrowser.from("terrains_public").select(base);
    if (res.error) {
      console.error("terrains_public fetch error:", res.error.message);
      return [];
    }
    return (res.data ?? []).map((r) => ({ ...r, nb_filets_a_remplacer: null, nom_terrain: null })) as TerrainPublic[];
  }
  return (res.data ?? []) as TerrainPublic[];
}
