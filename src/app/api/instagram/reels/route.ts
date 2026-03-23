import { NextResponse } from "next/server";

async function fetchViews(mediaId: string, accessToken: string): Promise<number | null> {
  try {
    // Try fetching both IG views and Facebook views
    const [igRes, fbRes] = await Promise.all([
      fetch(`https://graph.instagram.com/v21.0/${mediaId}/insights?metric=views&access_token=${accessToken}`),
      fetch(`https://graph.instagram.com/v21.0/${mediaId}/insights?metric=facebook_views&access_token=${accessToken}`),
    ]);
    const igData = await igRes.json();
    const fbData = await fbRes.json();

    const igViews = igData.data?.[0]?.values?.[0]?.value ?? 0;
    const fbViews = fbData.data?.[0]?.values?.[0]?.value ?? 0;

    return igViews + fbViews || null;
  } catch {
    return null;
  }
}

export async function GET() {
  const accessToken = process.env.META_ACCESS_TOKEN;
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

    // Fetch reach for each reel in parallel
    const reels = await Promise.all(
      baseReels.map(async (reel: { id: string; permalink: string; thumbnail_url?: string; media_url?: string; caption?: string; like_count: number | null; comments_count: number | null }) => ({
        ...reel,
        views: await fetchViews(reel.id, accessToken),
      }))
    );

    return NextResponse.json({ reels, isPlaceholder: false });
  } catch (error) {
    console.error("Instagram Reels API error:", error);
    return NextResponse.json({ reels: [], isPlaceholder: true });
  }
}
