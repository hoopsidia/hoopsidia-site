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
    const res = await fetch(
      `https://graph.instagram.com/v21.0/${mediaId}/insights?metric=views,facebook_views,shares,saved&access_token=${accessToken}`
    );
    const data = await res.json();

    const find = (name: string) => data.data?.find((m: { name: string }) => m.name === name)?.values?.[0]?.value ?? 0;
    const views = (find("views") + find("facebook_views")) || null;
    const shares = find("shares") || null;
    const saved = find("saved") || null;

    return { views, shares, saved };
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
