"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState, useRef, useCallback } from "react";

type Reel = {
  id: string;
  permalink: string;
  thumbnail_url?: string;
  media_url?: string;
  caption?: string;
  video_views?: number | null;
};

function formatViews(views: number): string {
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (views >= 1_000) return `${(views / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return views.toString();
}

function SoundIcon({ muted }: { muted: boolean }) {
  if (muted) {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
        <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.796 8.796 0 0 0 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06a8.99 8.99 0 0 0 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
      </svg>
    );
  }
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
    </svg>
  );
}

// Placeholder reels for when API is not configured
const PLACEHOLDER_REELS: Reel[] = Array.from({ length: 12 }, (_, i) => ({
  id: `placeholder-${i}`,
  permalink: "https://www.instagram.com/hoopsidia/",
  caption: `Reel ${i + 1}`,
}));

export default function ReelsGrid() {
  const t = useTranslations("reels");
  const [reels, setReels] = useState<Reel[]>(PLACEHOLDER_REELS);
  const [isPlaceholder, setIsPlaceholder] = useState(true);
  const [mutedMap, setMutedMap] = useState<Record<string, boolean>>({});
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});

  useEffect(() => {
    fetch("/api/instagram/reels")
      .then((res) => res.json())
      .then((data) => {
        if (data.reels && data.reels.length > 0) {
          setReels(data.reels.slice(0, 12));
          setIsPlaceholder(false);
        }
      })
      .catch(() => {
        // Keep placeholders
      });
  }, []);

  const toggleMute = useCallback((reelId: string) => {
    const video = videoRefs.current[reelId];
    if (!video) return;

    const newMuted = !video.muted;
    video.muted = newMuted;
    setMutedMap((prev) => ({ ...prev, [reelId]: newMuted }));
  }, []);

  return (
    <section className="bg-black py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold italic uppercase text-white">
            {t("title")}
          </h2>
          <p className="mt-3 text-white/50">{t("subtitle")}</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {reels.map((reel) => (
            <div
              key={reel.id}
              className="relative aspect-[9/16] glass-subtle rounded-xl overflow-hidden group"
            >
              {!isPlaceholder && reel.media_url ? (
                <>
                  <video
                    ref={(el) => { videoRefs.current[reel.id] = el; }}
                    src={reel.media_url}
                    poster={reel.thumbnail_url}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover cursor-pointer"
                    onClick={() => window.open(reel.permalink, "_blank")}
                  />
                  {/* Sound toggle button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleMute(reel.id);
                    }}
                    className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/70 transition-colors"
                    aria-label={mutedMap[reel.id] === false ? "Couper le son" : "Activer le son"}
                  >
                    <SoundIcon muted={mutedMap[reel.id] !== false} />
                  </button>
                </>
              ) : (
                <a
                  href={reel.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-white/5 to-white/[0.02]"
                >
                  {/* Placeholder reel icon */}
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="text-white/20 mb-2"
                  >
                    <rect x="2" y="2" width="20" height="20" rx="4" />
                    <path d="M10 8l6 4-6 4V8z" fill="currentColor" />
                  </svg>
                  <span className="text-white/20 text-xs">Reel</span>
                </a>
              )}
              {/* Views overlay */}
              {reel.video_views != null && (
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent pointer-events-none">
                  <div className="flex items-center gap-1">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="white" className="opacity-80">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    <span className="font-heading text-xs text-white/90">
                      {formatViews(reel.video_views)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {isPlaceholder && (
          <p className="text-center text-white/20 text-xs mt-6">
            {t("placeholder")}
          </p>
        )}
      </div>
    </section>
  );
}
