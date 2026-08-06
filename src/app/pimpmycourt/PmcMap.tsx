"use client";

import { useEffect, useRef } from "react";
import * as maplibregl from "maplibre-gl";
import type { Map as MlMap, Marker } from "maplibre-gl";
import Supercluster from "supercluster";
import { supabaseBrowser } from "@/lib/pmc/supabase";
import { ETAT_COLOR, type Etat, type TerrainMarker, type TerrainPublic } from "@/lib/pmc/types";

type Stats = { total: number; remplaces: number; filetsRemplaces: number };
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
  // Round marker (orange = à remplacer, green = remplacé) with the white
  // Hoopsidia head centred inside. Anchored by its centre (see marker creation).
  // IMPORTANT: MapLibre applies its own positioning transform (translate) to the
  // element passed to `new Marker({ element })`. So the hover scale must live on
  // an INNER wrapper — mutating the root's transform would wipe MapLibre's
  // translate and snap the marker to the map's top-left corner.
  const el = document.createElement("div");
  el.style.cssText = "width:24px;height:24px;cursor:pointer;";
  const inner = document.createElement("div");
  inner.style.cssText = `width:100%;height:100%;border-radius:50%;background:${color};
    border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.5);
    display:flex;align-items:center;justify-content:center;
    transform-origin:center center;transition:transform .12s;`;
  const head = document.createElement("img");
  head.src = "/images/logo-head.png";
  head.alt = "";
  head.style.cssText = "width:14px;height:14px;filter:brightness(0) invert(1);";
  inner.appendChild(head);
  el.appendChild(inner);
  // Grow on hover (scale the inner wrapper, never the MapLibre-positioned root).
  el.addEventListener("mouseenter", () => { inner.style.transform = "scale(1.35)"; });
  el.addEventListener("mouseleave", () => { inner.style.transform = "scale(1)"; });
  return el;
}

export default function PmcMap({
  onStats,
  onMapReady,
  onSelectTerrain,
  onHoverTerrain,
}: {
  onStats?: (s: Stats) => void;
  onMapReady?: (map: MlMap) => void;
  onSelectTerrain?: (t: TerrainMarker) => void;
  onHoverTerrain?: (t: TerrainMarker | null) => void;
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
          const payload: TerrainMarker = {
            id: p.id,
            latitude: lat,
            longitude: lng,
            ville: p.ville,
            departement: p.departement,
            photo_avant_url: p.photo_avant_url,
            photo_apres_url: p.photo_apres_url,
            etat: p.etat,
            date_remplacement: p.date_remplacement,
            nb_confirmations: p.nb_confirmations,
            nb_paniers: p.nb_paniers,
            nb_filets_a_remplacer: p.nb_filets_a_remplacer,
            nom_terrain: p.nom_terrain,
          };
          // Hover → transient preview card; click → pin it (see MapShell).
          el.addEventListener("mouseenter", () => onHoverTerrain?.(payload));
          el.addEventListener("mouseleave", () => onHoverTerrain?.(null));
          el.addEventListener("click", (ev) => { ev.stopPropagation(); onSelectTerrain?.(payload); });
        }
        markers.push(new maplibregl.Marker({ element: el, anchor: "center" }).setLngLat([lng, lat]).addTo(map));
      }
    };

    map.on("load", async () => {
      const rows = await fetchTerrains();
      onStats?.({
        total: rows.length,
        remplaces: rows.filter((r) => r.etat === "remplace").length,
        filetsRemplaces: rows.reduce((s, r) => s + (r.etat === "remplace" ? (r.nb_filets_a_remplacer ?? 0) : 0), 0),
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
            photo_apres_url: r.photo_apres_url,
            etat: r.etat,
            date_remplacement: r.date_remplacement,
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
  }, [onStats, onMapReady, onSelectTerrain, onHoverTerrain]);

  // h-full (not absolute inset-0): MapLibre forces position:relative on its
  // container, which would void absolute positioning and collapse the height.
  return <div ref={containerRef} className="h-full w-full" />;
}

async function fetchTerrains(): Promise<TerrainPublic[]> {
  if (!supabaseBrowser) return [];
  const full = "id,latitude,longitude,ville,departement,photo_avant_url,photo_apres_url,etat,date_remplacement,nb_confirmations,nb_paniers,nb_filets_a_remplacer,nom_terrain";
  const base = "id,latitude,longitude,ville,departement,photo_avant_url,etat,nb_confirmations,nb_paniers";
  let res = await supabaseBrowser.from("terrains_public").select(full);
  if (res.error) {
    // Pre-migration fallback: the new columns don't exist yet.
    res = await supabaseBrowser.from("terrains_public").select(base);
    if (res.error) {
      console.error("terrains_public fetch error:", res.error.message);
      return [];
    }
    return (res.data ?? []).map((r) => ({ ...r, nb_filets_a_remplacer: null, nom_terrain: null, date_remplacement: null, photo_apres_url: null })) as TerrainPublic[];
  }
  return (res.data ?? []) as TerrainPublic[];
}
