"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { SOCIAL_LINKS } from "@/lib/constants";
import Image from "next/image";

function SocialIcon({ platform }: { platform: "youtube" | "instagram" | "tiktok" }) {
  const icons = {
    youtube: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
    instagram: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
      </svg>
    ),
    tiktok: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
      </svg>
    ),
  };
  return icons[platform];
}

const fields = [
  { label: "Nom", value: "Turgot" },
  { label: "Prénom", value: "Valentin" },
  { label: "Âge", value: "33 ans" },
  { label: "Taille", value: "1m73" },
  { label: "Terrains construits", value: "4" },
  { label: "Débuts", value: "Septembre 2016" },
];

export default function Hero() {
  const t = useTranslations("hero");

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center bg-black text-white overflow-hidden pt-16"
    >
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-orange/5 via-transparent to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex items-center justify-center">
        {/* Identity Card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="glass rounded-2xl p-6 sm:p-8 max-w-2xl w-full border border-white/10"
        >
          <div className="flex flex-col sm:flex-row gap-6 sm:gap-8">
            {/* Left side — Photo + Logo + Subtitle */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="shrink-0 flex flex-col items-center justify-between gap-3"
            >
              {/* Round photo */}
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-2 border-orange">
                <Image
                  src="/images/valentin.jpg"
                  alt="Valentin Turgot - Hoopsidia"
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                  priority
                />
              </div>

              {/* Logo */}
              <h1 className="font-heading text-2xl sm:text-3xl font-bold italic">
                <span className="text-orange">HOOPS</span>
                <span className="text-white">IDIA</span>
              </h1>

              {/* Citation */}
              <p className="font-heading text-[10px] sm:text-xs text-white/50 italic text-center">
                &ldquo;Je retape des terrains<br />avec ma caméra&rdquo;
              </p>

            </motion.div>

            {/* Right side — Fields */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex-1 space-y-2.5 sm:pt-2"
            >
              {fields.map((field) => (
                <div key={field.label} className="flex gap-2">
                  <span className="text-white/40 text-sm shrink-0">{field.label}:</span>
                  <span className="font-heading text-sm font-bold text-white">
                    {field.value}
                  </span>
                </div>
              ))}

              {/* Platforms */}
              <div className="flex items-center gap-2 pt-0.5">
                <span className="text-white/40 text-sm shrink-0">Plateformes:</span>
                <div className="flex items-center gap-2.5">
                  {(Object.entries(SOCIAL_LINKS) as [keyof typeof SOCIAL_LINKS, string][]).map(
                    ([platform, url]) => (
                      <a
                        key={platform}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white hover:text-orange transition-colors [&_svg]:w-3.5 [&_svg]:h-3.5"
                        aria-label={platform}
                      >
                        <SocialIcon platform={platform} />
                      </a>
                    )
                  )}
                </div>
              </div>
            </motion.div>
          </div>

        </motion.div>
      </div>
    </section>
  );
}
