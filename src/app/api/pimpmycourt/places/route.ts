import { NextResponse } from "next/server";

// Google Places (New) proxy so the key stays server-side. Without a key, the
// client falls back to Nominatim. Two modes: `?q=` autocomplete, `?place_id=`
// details (coordinates).
const KEY = process.env.GOOGLE_PLACES_API_KEY;

type Prediction = {
  placePrediction?: {
    placeId?: string;
    text?: { text?: string };
    structuredFormat?: { mainText?: { text?: string }; secondaryText?: { text?: string } };
  };
};

export async function GET(request: Request) {
  if (!KEY) return NextResponse.json({ suggestions: [], noKey: true });
  const { searchParams } = new URL(request.url);
  const placeId = searchParams.get("place_id");
  const q = searchParams.get("q");

  if (placeId) {
    const r = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`, {
      headers: { "X-Goog-Api-Key": KEY, "X-Goog-FieldMask": "location,displayName,formattedAddress" },
    });
    const d = await r.json();
    if (!d?.location) return NextResponse.json({ error: "not_found" }, { status: 404 });
    return NextResponse.json({
      lat: d.location.latitude,
      lng: d.location.longitude,
      name: d.displayName?.text ?? "",
      address: d.formattedAddress ?? "",
    });
  }

  if (!q || q.trim().length < 3) return NextResponse.json({ suggestions: [] });
  const r = await fetch("https://places.googleapis.com/v1/places:autocomplete", {
    method: "POST",
    headers: { "X-Goog-Api-Key": KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ input: q, includedRegionCodes: ["fr"], languageCode: "fr" }),
  });
  const d = await r.json();
  const suggestions = ((d?.suggestions ?? []) as Prediction[])
    .map((s) => {
      const p = s.placePrediction;
      if (!p?.placeId) return null;
      return {
        placeId: p.placeId,
        main: p.structuredFormat?.mainText?.text ?? p.text?.text ?? "",
        secondary: p.structuredFormat?.secondaryText?.text ?? "",
      };
    })
    .filter((s): s is { placeId: string; main: string; secondary: string } => s !== null);
  return NextResponse.json({ suggestions });
}
