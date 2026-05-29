import { NextResponse } from "next/server";
import { PLACEHOLDER_IG_STATS } from "@/lib/constants";
import { getAccessToken } from "@/lib/igToken";

export async function GET() {
  const accessToken = await getAccessToken();

  // If no token configured, return placeholder data
  if (!accessToken) {
    return NextResponse.json({
      ...PLACEHOLDER_IG_STATS,
      isPlaceholder: true,
    });
  }

  try {
    const baseUrl = "https://graph.instagram.com/v21.0";

    const now = Math.floor(Date.now() / 1000);
    const since30d = now - 30 * 24 * 60 * 60;
    const sinceYear = now - 365 * 24 * 60 * 60;

    const [profileRes, mediaRes, insightsRes, followerHistoryRes] = await Promise.all([
      fetch(`${baseUrl}/me?fields=followers_count,media_count&access_token=${accessToken}`, { next: { revalidate: 3600 } }),
      fetch(`${baseUrl}/me/media?fields=like_count,comments_count,timestamp&limit=25&access_token=${accessToken}`, { next: { revalidate: 3600 } }),
      fetch(`${baseUrl}/me/insights?metric=reach,views&period=day&metric_type=total_value&since=${since30d}&until=${now}&access_token=${accessToken}`, { next: { revalidate: 3600 } }),
      fetch(`${baseUrl}/me/insights?metric=follower_count&period=day&since=${sinceYear}&until=${now}&access_token=${accessToken}`, { next: { revalidate: 3600 } }),
    ]);

    const [profile, media, insights, followerHistoryData] = await Promise.all([
      profileRes.json(),
      mediaRes.json(),
      insightsRes.json(),
      followerHistoryRes.json(),
    ]);

    const followers = profile.followers_count ?? PLACEHOLDER_IG_STATS.followers;

    // Calculate engagement rate from recent posts
    let engagementRate = PLACEHOLDER_IG_STATS.engagementRate;
    if (media.data && media.data.length > 0) {
      const totalEngagement = media.data.reduce(
        (sum: number, post: { like_count?: number; comments_count?: number }) =>
          sum + (post.like_count ?? 0) + (post.comments_count ?? 0),
        0
      );
      engagementRate =
        Math.round((totalEngagement / media.data.length / followers) * 10000) /
        100;
    }

    // Extract insights values
    let views30d = PLACEHOLDER_IG_STATS.views30d;
    let averageReach = PLACEHOLDER_IG_STATS.averageReach;
    if (insights.data) {
      for (const metric of insights.data) {
        if (metric.name === "views") {
          views30d = metric.total_value?.value ?? views30d;
        }
        if (metric.name === "reach") {
          averageReach = metric.total_value?.value ?? averageReach;
        }
      }
    }

    // Build cumulative follower history from daily changes (1 year)
    let followerHistory = PLACEHOLDER_IG_STATS.followerHistory;
    if (followerHistoryData.data?.[0]?.values) {
      const dailyChanges = followerHistoryData.data[0].values;
      // Work backwards from current count to reconstruct daily totals
      const allDays: { date: Date; followers: number }[] = [];
      let runningTotal = followers;
      for (let i = dailyChanges.length - 1; i >= 0; i--) {
        const day = dailyChanges[i];
        allDays.unshift({ date: new Date(day.end_time), followers: runningTotal });
        runningTotal -= day.value;
      }
      // Sample monthly (one point per month) + always include last point
      const months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];
      const history: { date: string; followers: number }[] = [];
      let lastMonth = -1;
      for (const d of allDays) {
        const m = d.date.getMonth();
        if (m !== lastMonth) {
          history.push({ date: `${months[m]} ${d.date.getFullYear()}`, followers: d.followers });
          lastMonth = m;
        }
      }
      // Always include the last data point
      const last = allDays[allDays.length - 1];
      const lastLabel = `${months[last.date.getMonth()]} ${last.date.getFullYear()}`;
      if (history[history.length - 1]?.date !== lastLabel) {
        history.push({ date: lastLabel, followers: last.followers });
      }
      followerHistory = history;
    }

    // Fetch follower demographics (gender, country, city)
    const [genderRes, ageRes, cityRes] = await Promise.all([
      fetch(`${baseUrl}/me/insights?metric=follower_demographics&period=lifetime&metric_type=total_value&breakdown=gender&access_token=${accessToken}`, { next: { revalidate: 3600 } }),
      fetch(`${baseUrl}/me/insights?metric=follower_demographics&period=lifetime&metric_type=total_value&breakdown=age&access_token=${accessToken}`, { next: { revalidate: 3600 } }),
      fetch(`${baseUrl}/me/insights?metric=follower_demographics&period=lifetime&metric_type=total_value&breakdown=city&access_token=${accessToken}`, { next: { revalidate: 3600 } }),
    ]);
    const [genderData, ageData, cityData] = await Promise.all([
      genderRes.json(),
      ageRes.json(),
      cityRes.json(),
    ]);

    // Parse demographics
    type DemoResult = { dimension_values: string[]; value: number };
    const parseDemographics = (data: { data?: Array<{ total_value?: { breakdowns?: Array<{ results?: DemoResult[] }> } }> }) => {
      const results = data?.data?.[0]?.total_value?.breakdowns?.[0]?.results;
      if (!results) return [];
      const total = results.reduce((s: number, r: DemoResult) => s + r.value, 0);
      return results
        .map((r: DemoResult) => ({ label: r.dimension_values[0], value: r.value, percent: Math.round((r.value / total) * 100) }))
        .sort((a: { value: number }, b: { value: number }) => b.value - a.value);
    };

    const gender = parseDemographics(genderData);
    const ages = parseDemographics(ageData);
    const cities = parseDemographics(cityData).slice(0, 5);

    return NextResponse.json({
      followers,
      engagementRate,
      views30d,
      averageReach,
      followerHistory,
      demographics: { gender, ages, cities },
      isPlaceholder: false,
    });
  } catch (error) {
    console.error("Instagram API error:", error);
    return NextResponse.json({
      ...PLACEHOLDER_IG_STATS,
      isPlaceholder: true,
    });
  }
}
