import { NextResponse } from "next/server";

// The 4 Lyon court reel shortcodes (in order)
const LYON_SHORTCODES = [
  "DIW7YFDMZCj",
  "DJCwQ-_sIJQ",
  "DJPpxc1s88J",
  "DJH27XPs9Uq",
];

export async function GET() {
  const accessToken = process.env.META_ACCESS_TOKEN;

  if (!accessToken) {
    return NextResponse.json({ reels: [], isPlaceholder: true });
  }

  try {
    // Fetch each reel individually by its shortcode using oEmbed to get the media ID,
    // then fetch full details. Alternatively, we can search through the user's media.
    // Simplest approach: fetch all user media and filter by permalink containing the shortcodes.
    const res = await fetch(
      `https://graph.instagram.com/v21.0/me/media?fields=id,media_type,media_url,permalink,thumbnail_url,caption,video_views&limit=50&access_token=${accessToken}`,
      { next: { revalidate: 3600 } },
    );
    const data = await res.json();

    if (!data.data) {
      return NextResponse.json({ reels: [], isPlaceholder: true });
    }

    // Match reels by shortcode in permalink and preserve the desired order
    const allMedia = data.data as Array<{
      id: string;
      media_type: string;
      media_url?: string;
      permalink: string;
      thumbnail_url?: string;
      caption?: string;
      video_views?: number;
    }>;

    const reels = LYON_SHORTCODES.map((code) => {
      const found = allMedia.find((m) => m.permalink.includes(code));
      if (!found) return null;
      return {
        id: found.id,
        permalink: found.permalink,
        thumbnail_url: found.thumbnail_url,
        media_url: found.media_url,
        caption: found.caption,
        video_views: found.video_views ?? null,
      };
    }).filter(Boolean);

    if (reels.length === 0) {
      return NextResponse.json({ reels: [], isPlaceholder: true });
    }

    return NextResponse.json({ reels, isPlaceholder: false });
  } catch (error) {
    console.error("Instagram Lyon Reels API error:", error);
    return NextResponse.json({ reels: [], isPlaceholder: true });
  }
}
