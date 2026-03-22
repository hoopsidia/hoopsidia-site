"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";
import { PMC_SEASONS } from "@/lib/constants";

function YouTubeEmbed({ videoId }: { videoId: string }) {
  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden">
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${videoId}`}
        title="YouTube video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 w-full h-full"
        loading="lazy"
      />
    </div>
  );
}

function SeasonCard({
  season,
  index,
}: {
  season: (typeof PMC_SEASONS)[number];
  index: number;
}) {
  const t = useTranslations("pmc");
  const [showVideo, setShowVideo] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const seasonKey = season.id as "s1" | "s2" | "s3";

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.15 }}
      className="glass rounded-2xl overflow-hidden group"
    >
      {/* Thumbnail / Video */}
      <div className="relative aspect-video bg-black/50">
        {showVideo && season.youtubeId ? (
          <YouTubeEmbed videoId={season.youtubeId} />
        ) : (
          <button
            onClick={() => season.youtubeId && setShowVideo(true)}
            className="relative w-full h-full"
            disabled={season.comingSoon}
          >
            <Image
              src={season.thumbnail}
              alt={t(`seasons.${seasonKey}.title`)}
              fill
              className="object-contain p-4"
            />
            {season.comingSoon ? (
              <div className="absolute inset-0 flex items-center justify-center glass-strong">
                <span className="text-orange font-heading font-bold text-lg">
                  {t("comingSoon")}
                </span>
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-16 h-16 rounded-full bg-orange flex items-center justify-center">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="white"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            )}
          </button>
        )}
      </div>

      {/* Info */}
      <div className="p-6">
        <div className="text-xs text-orange font-bold uppercase tracking-wider mb-2">
          {t("season")} {season.season}
        </div>
        <h3 className="font-heading text-xl font-bold text-white mb-1">
          {t(`seasons.${seasonKey}.title`)}
        </h3>
        <p className="text-sm text-white/40 mb-3">
          {t(`seasons.${seasonKey}.location`)}
        </p>
        <p className="text-sm text-white/60 leading-relaxed">
          {t(`seasons.${seasonKey}.description`)}
        </p>
      </div>
    </motion.div>
  );
}

export default function PimpMyCourt() {
  const t = useTranslations("pmc");

  return (
    <section id="pmc" className="bg-black text-white py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold italic uppercase">
            {t("title")}
          </h2>
          <p className="mt-3 text-white/50">{t("subtitle")}</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PMC_SEASONS.map((season, i) => (
            <SeasonCard key={season.id} season={season} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
