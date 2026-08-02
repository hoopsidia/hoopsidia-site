// Static satellite image of a location, from its coordinates — used as the
// terrain "photo" preview (no user upload). Esri World Imagery export endpoint,
// free and keyless. Ground footprint is kept at the correct aspect ratio.
export function satelliteImageUrl(lat: number, lng: number, w = 600, h = 400): string {
  const groundW = 220; // metres across
  const groundH = groundW * (h / w);
  const mPerDegLat = 111320;
  const mPerDegLng = 111320 * Math.cos((lat * Math.PI) / 180) || 111320;
  const dLat = groundH / mPerDegLat / 2;
  const dLng = groundW / mPerDegLng / 2;
  const bbox = `${lng - dLng},${lat - dLat},${lng + dLng},${lat + dLat}`;
  return `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/export?bbox=${bbox}&bboxSR=4326&imageSR=102100&size=${w},${h}&format=jpg&f=image`;
}

// Google Maps links for a point (view + directions).
export function googleMapsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}
export function googleDirectionsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}
