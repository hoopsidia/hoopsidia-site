import { NextResponse } from "next/server";

export async function GET() {
  const accessToken = process.env.META_ACCESS_TOKEN;
  const userId = process.env.META_IG_USER_ID;

  if (!accessToken || !userId) {
    return NextResponse.json({ reels: [], isPlaceholder: true });
  }

  try {
    const res = await fetch(
      `https://graph.instagram.com/v21.0/me/media?fields=id,media_type,media_url,permalink,thumbnail_url,caption,video_views,like_count,comments_count&limit=50&access_token=${accessToken}`,
      { next: { revalidate: 3600 } }
    );
    const data = await res.json();

    const reels = (data.data ?? [])
      .filter(
        (item: { media_type: string }) =>
          item.media_type === "VIDEO"
      )
      .slice(0, 12)
      .map((item: { id: string; permalink: string; thumbnail_url?: string; media_url?: string; caption?: string; video_views?: number; like_count?: number; comments_count?: number }) => ({
        id: item.id,
        permalink: item.permalink,
        thumbnail_url: item.thumbnail_url,
        media_url: item.media_url,
        caption: item.caption,
        video_views: item.video_views ?? null,
        like_count: item.like_count ?? null,
        comments_count: item.comments_count ?? null,
      }));

    return NextResponse.json({ reels, isPlaceholder: false });
  } catch (error) {
    console.error("Instagram Reels API error:", error);
    return NextResponse.json({ reels: [], isPlaceholder: true });
  }
}
