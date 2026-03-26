"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { HERO_STATS } from "@/lib/constants";
import AnimatedCounter from "@/components/AnimatedCounter";

const YOUTUBE_VIDEO_ID = "_t8Iovh-avE";
const YOUTUBE_EMBED_URL = `https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}?autoplay=1&mute=1&loop=1&playlist=${YOUTUBE_VIDEO_ID}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1`;

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3,
    },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

export default function HeroShowreel() {
  const t = useTranslations("hero");

  const stats = [
    { target: HERO_STATS.youtube, label: t("stats.youtube"), suffix: "" },
    { target: HERO_STATS.instagram, label: t("stats.instagram"), suffix: "" },
    { target: HERO_STATS.views, label: t("stats.views"), suffix: "" },
    { target: HERO_STATS.courts, label: t("stats.courts"), suffix: "" },
  ];

  return (
    <section
      id="hero"
      className="relative h-[70vh] md:h-screen w-full overflow-hidden bg-black text-white"
    >
      {/* YouTube video background — hidden on mobile */}
      <div className="absolute inset-0 hidden md:block">
        <iframe
          src={YOUTUBE_EMBED_URL}
          title="HOOPSIDIA Showreel"
          allow="autoplay; encrypted-media"
          allowFullScreen
          className="absolute top-1/2 left-1/2 w-[120%] h-[120%] -translate-x-1/2 -translate-y-1/2 scale-[1.2] pointer-events-none"
          style={{ border: "none" }}
        />
      </div>

      {/* Mobile gradient background (replaces video) */}
      <div className="absolute inset-0 md:hidden bg-gradient-to-b from-black via-black/80 to-black" />

      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent z-[1]" />

      {/* Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 flex flex-col items-center justify-center h-full px-4 sm:px-6 lg:px-8 text-center"
      >
        {/* Title */}
        <motion.h1
          variants={fadeUp}
          className="font-heading text-6xl sm:text-8xl lg:text-9xl font-bold italic"
        >
          <span className="text-orange">HOOPS</span>
          <span className="text-white">IDIA</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={fadeUp}
          className="mt-4 text-lg sm:text-xl lg:text-2xl text-white/70"
        >
          {t("baseline")}
        </motion.p>

        {/* Stats row */}
        <motion.div
          variants={fadeUp}
          className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-10"
        >
          {stats.map((stat) => (
            <AnimatedCounter
              key={stat.label}
              target={stat.target}
              label={stat.label}
              suffix={stat.suffix}
            />
          ))}
        </motion.div>

        {/* CTA buttons */}
        <motion.div
          variants={fadeUp}
          className="mt-10 flex flex-col sm:flex-row items-center gap-4"
        >
          <a
            href="#contact"
            className="px-8 py-3 rounded-full bg-orange text-black font-heading font-bold text-lg hover:bg-orange/90 transition-colors"
          >
            {t("cta.collaborate")}
          </a>
          <a
            href="#services"
            className="px-8 py-3 rounded-full glass border border-white/20 font-heading font-bold text-lg text-white hover:border-orange/50 transition-colors"
          >
            {t("cta.discover")}
          </a>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-white/50"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </motion.div>
    </section>
  );
}
