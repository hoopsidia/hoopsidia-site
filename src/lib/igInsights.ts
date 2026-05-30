const INSIGHTS_BASE = "https://graph.instagram.com/v21.0";

export type ReelInsights = {
  views: number | null;
  shares: number | null;
  saved: number | null;
};

type InsightsResponse = {
  data?: Array<{ name: string; values?: Array<{ value?: number }> }>;
};

function metricValue(data: InsightsResponse, name: string): number {
  return data.data?.find((m) => m.name === name)?.values?.[0]?.value ?? 0;
}

// Fetches view/share/save insights for a reel. `facebook_views` is requested in
// a separate call because Instagram fails the entire request (subcode 2207086)
// when that metric is queried on a reel not crossposted to Facebook — which
// would otherwise wipe out views/shares/saved as well.
export async function fetchReelInsights(
  mediaId: string,
  accessToken: string,
  viewOverride?: number,
): Promise<ReelInsights> {
  let igViews = 0;
  let shares: number | null = null;
  let saved: number | null = null;

  try {
    const res = await fetch(
      `${INSIGHTS_BASE}/${mediaId}/insights?metric=views,shares,saved&access_token=${accessToken}`,
    );
    const data: InsightsResponse = await res.json();
    igViews = metricValue(data, "views");
    shares = metricValue(data, "shares") || null;
    saved = metricValue(data, "saved") || null;
  } catch {
    // leave defaults
  }

  let fbViews = 0;
  try {
    const res = await fetch(
      `${INSIGHTS_BASE}/${mediaId}/insights?metric=facebook_views&access_token=${accessToken}`,
    );
    const data: InsightsResponse = await res.json();
    fbViews = metricValue(data, "facebook_views");
  } catch {
    // facebook_views is unavailable for non-crossposted reels
  }

  const apiViews = igViews + fbViews;
  const views = viewOverride && viewOverride > apiViews ? viewOverride : apiViews;

  return { views: views || null, shares, saved };
}
