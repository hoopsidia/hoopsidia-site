import "server-only";

export type ReverseGeo = {
  ville: string | null;
  code_postal: string | null;
  departement: string | null;
  adresse: string | null;
};

// Reverse geocode worldwide via Nominatim (OpenStreetMap).
export async function reverseGeocode(lat: number, lng: number): Promise<ReverseGeo> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=16&addressdetails=1&lat=${lat}&lon=${lng}`,
      {
        signal: AbortSignal.timeout(5000),
        headers: { "User-Agent": "PimpMyCourt/1.0 (+https://hoopsidia.com)", "Accept-Language": "fr" },
      },
    );
    const data = await res.json();
    const a = data?.address;
    if (!a) return { ville: null, code_postal: null, departement: null, adresse: data?.display_name ?? null };
    return {
      ville: a.city ?? a.town ?? a.village ?? a.municipality ?? a.suburb ?? null,
      code_postal: a.postcode ?? null,
      departement: a.state ?? a.county ?? a.region ?? a.country ?? null,
      adresse: data.display_name ?? null,
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
