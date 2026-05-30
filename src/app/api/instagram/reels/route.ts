import { NextResponse } from "next/server";
import { getAccessToken } from "@/lib/igToken";
import { fetchReelInsights } from "@/lib/igInsights";

// Manual view overrides for reels where API doesn't report sponsored views
const VIEW_OVERRIDES: Record<string, number> = {
  "18311093566267140": 500000, // Maillot reel with sponso
};

export async function GET() {
  const accessToken = await getAccessToken();
  const userId = process.env.META_IG_USER_ID;

  if (!accessToken || !userId) {
    return NextResponse.json({ reels: [], isPlaceholder: true });
  }

  try {
    const res = await fetch(
      `https://graph.instagram.com/v21.0/me/media?fields=id,media_type,media_url,permalink,thumbnail_url,caption,like_count,comments_count&limit=50&access_token=${accessToken}`,
      { next: { revalidate: 3600 } }
    );
    const data = await res.json();

    const baseReels = (data.data ?? [])
      .filter(
        (item: { media_type: string }) =>
          item.media_type === "VIDEO"
      )
      .slice(0, 12)
      .map((item: { id: string; permalink: string; thumbnail_url?: string; media_url?: string; caption?: string; like_count?: number; comments_count?: number }) => ({
        id: item.id,
        permalink: item.permalink,
        thumbnail_url: item.thumbnail_url,
        media_url: item.media_url,
        caption: item.caption,
        like_count: item.like_count ?? null,
        comments_count: item.comments_count ?? null,
      }));

    // Fetch insights for each reel in parallel
    const reels = await Promise.all(
      baseReels.map(async (reel: { id: string; permalink: string; thumbnail_url?: string; media_url?: string; caption?: string; like_count: number | null; comments_count: number | null }) => {
        const insights = await fetchReelInsights(reel.id, accessToken, VIEW_OVERRIDES[reel.id]);
        return { ...reel, ...insights };
      })
    );

    return NextResponse.json({ reels, isPlaceholder: false });
  } catch (error) {
    console.error("Instagram Reels API error:", error);
    return NextResponse.json({ reels: [], isPlaceholder: true });
  }
}
