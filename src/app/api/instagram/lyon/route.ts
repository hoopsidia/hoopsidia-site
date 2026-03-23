import { NextResponse } from "next/server";

// The 4 Lyon court reel shortcodes (in order)
const LYON_SHORTCODES = [
  "DIW7YFDMZCj",
  "DJH27XPs9Uq",
  "DJCwQ-_sIJQ",
  "DJPpxc1s88J",
];

async function fetchInsights(mediaId: string, accessToken: string) {
  try {
    const [viewsRes, fbViewsRes, sharesRes] = await Promise.all([
      fetch(`https://graph.instagram.com/v21.0/${mediaId}/insights?metric=views&access_token=${accessToken}`),
      fetch(`https://graph.instagram.com/v21.0/${mediaId}/insights?metric=facebook_views&access_token=${accessToken}`),
      fetch(`https://graph.instagram.com/v21.0/${mediaId}/insights?metric=shares,saved&access_token=${accessToken}`),
    ]);
    const viewsData = await viewsRes.json();
    const fbViewsData = await fbViewsRes.json();
    const sharesData = await sharesRes.json();

    const igViews = viewsData.data?.[0]?.values?.[0]?.value ?? 0;
    const fbViews = fbViewsData.data?.[0]?.values?.[0]?.value ?? 0;

    const shares = sharesData.data?.find((m: { name: string }) => m.name === "shares")?.values?.[0]?.value ?? null;
    const saved = sharesData.data?.find((m: { name: string }) => m.name === "saved")?.values?.[0]?.value ?? null;

    return { views: (igViews + fbViews) || null, shares, saved };
  } catch {
    return { views: null, shares: null, saved: null };
  }
}

export async function GET() {
  const accessToken = process.env.META_ACCESS_TOKEN;

  if (!accessToken) {
    return NextResponse.json({ reels: [], isPlaceholder: true });
  }

  try {
    const res = await fetch(
      `https://graph.instagram.com/v21.0/me/media?fields=id,media_type,media_url,permalink,thumbnail_url,caption,like_count,comments_count&limit=50&access_token=${accessToken}`,
      { next: { revalidate: 3600 } },
    );
    const data = await res.json();

    if (!data.data) {
      return NextResponse.json({ reels: [], isPlaceholder: true });
    }

    const allMedia = data.data as Array<{
      id: string;
      media_type: string;
      media_url?: string;
      permalink: string;
      thumbnail_url?: string;
      caption?: string;
      like_count?: number;
      comments_count?: number;
    }>;

    const baseReels = LYON_SHORTCODES.map((code) => {
      const found = allMedia.find((m) => m.permalink.includes(code));
      if (!found) return null;
      return {
        id: found.id,
        permalink: found.permalink,
        thumbnail_url: found.thumbnail_url,
        media_url: found.media_url,
        caption: found.caption,
        like_count: found.like_count ?? null,
        comments_count: found.comments_count ?? null,
      };
    }).filter(Boolean) as Array<{ id: string; permalink: string; thumbnail_url?: string; media_url?: string; caption?: string; like_count: number | null; comments_count: number | null }>;

    const reels = await Promise.all(
      baseReels.map(async (reel) => {
        const insights = await fetchInsights(reel.id, accessToken);
        return { ...reel, ...insights };
      })
    );

    if (reels.length === 0) {
      return NextResponse.json({ reels: [], isPlaceholder: true });
    }

    return NextResponse.json({ reels, isPlaceholder: false });
  } catch (error) {
    console.error("Instagram Lyon Reels API error:", error);
    return NextResponse.json({ reels: [], isPlaceholder: true });
  }
}
