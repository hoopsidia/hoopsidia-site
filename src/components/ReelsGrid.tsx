"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState, useRef, useCallback } from "react";

type Reel = {
  id: string;
  permalink: string;
  thumbnail_url?: string;
  media_url?: string;
  caption?: string;
  views?: number | null;
  like_count?: number | null;
  comments_count?: number | null;
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
              {/* Stats overlay on hover */}
              {(reel.views != null || reel.like_count != null || reel.comments_count != null) && (
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none flex items-center justify-center">
                  <div className="flex items-center gap-4">
                    {reel.views != null && (
                      <div className="flex flex-col items-center">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="white" className="opacity-90">
                          <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                        </svg>
                        <span className="font-heading text-xs font-bold italic text-white mt-0.5">{formatViews(reel.views)}</span>
                      </div>
                    )}
                    {reel.like_count != null && (
                      <div className="flex flex-col items-center">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="white" className="opacity-90">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>
                        <span className="font-heading text-xs font-bold italic text-white mt-0.5">{formatViews(reel.like_count)}</span>
                      </div>
                    )}
                    {reel.comments_count != null && (
                      <div className="flex flex-col items-center">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="white" className="opacity-90">
                          <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4V4c0-1.1-.9-2-2-2zm0 15.17L18.83 16H4V4h16v13.17z" />
                        </svg>
                        <span className="font-heading text-xs font-bold italic text-white mt-0.5">{formatViews(reel.comments_count)}</span>
                      </div>
                    )}
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
