import "server-only";

// Rough bounding boxes: metropolitan France + the five DOM. Used to reject
// signalements outside French territory (§10 anti-spam).
const BOXES: Array<[number, number, number, number]> = [
  // [minLat, minLng, maxLat, maxLng]
  [41.2, -5.6, 51.6, 9.8], // métropole (+ Corse)
  [15.8, -61.9, 16.6, -60.8], // Guadeloupe
  [14.3, -61.3, 14.9, -60.7], // Martinique
  [2.0, -54.7, 6.0, -51.5], // Guyane
  [-21.5, 55.1, -20.8, 55.9], // La Réunion
  [-13.1, 44.9, -12.5, 45.4], // Mayotte
];

export function isInFrance(lat: number, lng: number): boolean {
  return BOXES.some(([a, b, c, d]) => lat >= a && lat <= c && lng >= b && lng <= d);
}

export type ReverseGeo = {
  ville: string | null;
  code_postal: string | null;
  departement: string | null;
  adresse: string | null;
};

// Reverse geocode via the free French government API (api-adresse.data.gouv.fr).
// The `context` property looks like "75, Paris, Île-de-France" — first token is
// the department code.
export async function reverseGeocode(lat: number, lng: number): Promise<ReverseGeo> {
  try {
    const res = await fetch(
      `https://api-adresse.data.gouv.fr/reverse/?lon=${lng}&lat=${lat}`,
      { signal: AbortSignal.timeout(5000) },
    );
    const data = await res.json();
    const p = data?.features?.[0]?.properties;
    if (!p) return { ville: null, code_postal: null, departement: null, adresse: null };
    return {
      ville: p.city ?? null,
      code_postal: p.postcode ?? null,
      departement: typeof p.context === "string" ? p.context.split(",")[0].trim() : null,
      adresse: p.label ?? null,
    };
  } catch {
    return { ville: null, code_postal: null, departement: null, adresse: null };
  }
}

// Haversine distance in metres between two lat/lng points.
export function distanceMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}
