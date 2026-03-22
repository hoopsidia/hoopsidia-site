"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

type Reel = {
  id: string;
  permalink: string;
  thumbnail_url?: string;
  media_url?: string;
  caption?: string;
};

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
            <a
              key={reel.id}
              href={reel.permalink}
              target="_blank"
              rel="noopener noreferrer"
              className="relative aspect-[9/16] glass-subtle rounded-xl overflow-hidden group"
            >
              {!isPlaceholder && reel.media_url ? (
                <video
                  src={reel.media_url}
                  poster={reel.thumbnail_url}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-white/5 to-white/[0.02]">
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
                </div>
              )}
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="white"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
                </svg>
              </div>
            </a>
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
