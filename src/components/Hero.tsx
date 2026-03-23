"use client";

import { useTranslations } from "next-intl";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import { SOCIAL_LINKS } from "@/lib/constants";
import Image from "next/image";
import { useRef, useState, useEffect, useCallback } from "react";

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

function getFields(t: (key: string) => string) {
  return [
    { label: t("card.lastName"), value: "Turgot" },
    { label: t("card.firstName"), value: "Valentin" },
    { label: t("card.age"), value: t("card.ageValue") },
    { label: t("card.height"), value: t("card.heightValue") },
    { label: t("card.courts"), value: "4" },
    { label: t("card.since"), value: t("card.sinceValue") },
  ];
}

type Ball = {
  id: string;
  x: number;
  speed: number;
  scored: boolean;
};

type ScoreFlash = {
  id: string;
  x: number;
  y: number;
};

let globalBallId = 0;
function nextBallId() {
  globalBallId += 1;
  return `ball-${globalBallId}-${Date.now()}`;
}

function FallingBall({
  ball,
  onCollision,
}: {
  ball: Ball;
  onCollision: (id: string, el: HTMLDivElement) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ball.scored) return;
    let active = true;
    const check = () => {
      if (!active || !ref.current) return;
      onCollision(ball.id, ref.current);
      if (active) requestAnimationFrame(check);
    };
    requestAnimationFrame(check);
    return () => {
      active = false;
    };
  }, [ball.id, ball.scored, onCollision]);

  return (
    <motion.div
      ref={ref}
      initial={{ top: -60, left: ball.x, opacity: 1, scale: 1 }}
      animate={
        ball.scored
          ? { top: "+=80", opacity: 0, scale: 0.5 }
          : { top: "100%" }
      }
      transition={
        ball.scored
          ? { duration: 1, ease: "easeIn" }
          : { duration: 8 / ball.speed, ease: "linear" }
      }
      className="z-[15] pointer-events-none absolute"
      style={{}}
    >
      <Image
        src="/images/logo-head.png"
        alt=""
        width={45}
        height={45}
        className="rounded-full"
      />
    </motion.div>
  );
}

function BasketNet() {
  return (
    <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center z-[25]">
      {/* Rim */}
      <div className="w-24 h-3 rounded-full border-2 border-orange bg-orange/20 shadow-[0_0_12px_rgba(252,141,51,0.3)]" />
      {/* Net with swing animation */}
      <svg
        width="96"
        height="72"
        viewBox="0 0 96 72"
        className="mt-[-2px] animate-net-swing"
        style={{ transformOrigin: "top center" }}
      >
        {/* Vertical threads */}
        <path d="M8 0 Q16 36, 28 68" stroke="rgba(255,255,255,0.13)" fill="none" strokeWidth="1.2" />
        <path d="M20 0 Q26 36, 33 68" stroke="rgba(255,255,255,0.13)" fill="none" strokeWidth="1.2" />
        <path d="M32 0 Q36 36, 38 68" stroke="rgba(255,255,255,0.13)" fill="none" strokeWidth="1.2" />
        <path d="M44 0 Q44 36, 43 68" stroke="rgba(255,255,255,0.13)" fill="none" strokeWidth="1.2" />
        <path d="M52 0 Q52 36, 53 68" stroke="rgba(255,255,255,0.13)" fill="none" strokeWidth="1.2" />
        <path d="M64 0 Q60 36, 58 68" stroke="rgba(255,255,255,0.13)" fill="none" strokeWidth="1.2" />
        <path d="M76 0 Q70 36, 63 68" stroke="rgba(255,255,255,0.13)" fill="none" strokeWidth="1.2" />
        <path d="M88 0 Q80 36, 68 68" stroke="rgba(255,255,255,0.13)" fill="none" strokeWidth="1.2" />
        {/* Cross threads */}
        <path d="M12 10 Q48 16, 84 10" stroke="rgba(255,255,255,0.08)" fill="none" strokeWidth="0.8" />
        <path d="M16 20 Q48 26, 80 20" stroke="rgba(255,255,255,0.08)" fill="none" strokeWidth="0.8" />
        <path d="M20 30 Q48 36, 76 30" stroke="rgba(255,255,255,0.08)" fill="none" strokeWidth="0.8" />
        <path d="M24 40 Q48 46, 72 40" stroke="rgba(255,255,255,0.08)" fill="none" strokeWidth="0.8" />
        <path d="M28 50 Q48 56, 68 50" stroke="rgba(255,255,255,0.08)" fill="none" strokeWidth="0.8" />
        <path d="M32 60 Q48 64, 64 60" stroke="rgba(255,255,255,0.08)" fill="none" strokeWidth="0.8" />
      </svg>
    </div>
  );
}

export default function Hero() {
  const t = useTranslations("hero");
  const cardRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const translateX = useMotionValue(0);
  const translateY = useMotionValue(0);

  const springConfig = { damping: 20, stiffness: 120 };
  const xSpring = useSpring(translateX, springConfig);
  const ySpring = useSpring(translateY, springConfig);

  const [balls, setBalls] = useState<Ball[]>([]);
  const [score, setScore] = useState(0);
  const [flashes, setFlashes] = useState<ScoreFlash[]>([]);
  const cardPosRef = useRef({ x: 0, y: 0, width: 0, height: 0 });
  const scoredSetRef = useRef(new Set<string>());

  // Track card position relative to section (desktop only)
  useEffect(() => {
    if (isMobile) return;
    const interval = setInterval(() => {
      const card = cardRef.current;
      const section = sectionRef.current;
      if (!card || !section) return;
      const cardRect = card.getBoundingClientRect();
      const sectionRect = section.getBoundingClientRect();
      cardPosRef.current = {
        x: cardRect.left - sectionRect.left,
        y: cardRect.bottom - sectionRect.top,
        width: cardRect.width,
        height: cardRect.height,
      };
    }, 50);
    return () => clearInterval(interval);
  }, [isMobile]);

  // Spawn balls (desktop only)
  useEffect(() => {
    if (isMobile) return;
    const spawnBall = () => {
      const section = sectionRef.current;
      if (!section) return;
      const sectionRect = section.getBoundingClientRect();
      // Balls fall in the middle third
      const thirdWidth = sectionRect.width / 3;
      const ballX = thirdWidth + Math.random() * (thirdWidth - 60);
      const speed = 1.5 + Math.random() * 2;
      setBalls((prev) => [
        ...prev.slice(-15),
        { id: nextBallId(), x: ballX, speed, scored: false },
      ]);
    };
    const interval = setInterval(spawnBall, 2200);
    return () => clearInterval(interval);
  }, [isMobile]);

  // Cleanup old balls (remove after 10 seconds)
  useEffect(() => {
    const cleanup = setInterval(() => {
      setBalls((prev) => {
        if (prev.length > 20) return prev.slice(-15);
        return prev;
      });
    }, 5000);
    return () => clearInterval(cleanup);
  }, []);

  // Remove scored balls after animation
  useEffect(() => {
    const cleanup = setInterval(() => {
      setBalls((prev) => prev.filter((b) => !b.scored));
    }, 2000);
    return () => clearInterval(cleanup);
  }, []);

  const handleBallCollision = useCallback(
    (ballId: string, el: HTMLDivElement) => {
      if (scoredSetRef.current.has(ballId)) return;

      const section = sectionRef.current;
      if (!section) return;
      const sectionRect = section.getBoundingClientRect();
      const ballRect = el.getBoundingClientRect();
      const card = cardPosRef.current;
      const ballCenterX = ballRect.left - sectionRect.left + ballRect.width / 2;
      const ballBottom = ballRect.top - sectionRect.top + ballRect.height;

      // Rim zone
      const rimLeft = card.x + card.width * 0.2;
      const rimRight = card.x + card.width * 0.8;
      const rimY = card.y;

      if (
        ballCenterX > rimLeft &&
        ballCenterX < rimRight &&
        ballBottom > rimY - 10 &&
        ballBottom < rimY + 30
      ) {
        scoredSetRef.current.add(ballId);
        setBalls((prev) =>
          prev.map((b) => (b.id === ballId ? { ...b, scored: true } : b))
        );
        setScore((s) => s + 3);
        const flashId = `flash-${Date.now()}-${Math.random()}`;
        setFlashes((prev) => [
          ...prev,
          { id: flashId, x: ballCenterX, y: rimY },
        ]);
        setTimeout(() => {
          setFlashes((prev) => prev.filter((f) => f.id !== flashId));
        }, 1000);
      }
    },
    []
  );

  const handleMouseMove = (e: React.MouseEvent) => {
    const section = sectionRef.current;
    const card = cardRef.current;
    if (!section || !card) return;

    const sectionRect = section.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();

    const targetX = e.clientX - sectionRect.left - sectionRect.width / 2;

    const maxX = (sectionRect.width - cardRect.width) / 2 - 16;
    const clampedX = Math.max(-maxX, Math.min(maxX, targetX));

    translateX.set(clampedX);
  };

  const handleMouseLeave = () => {
    translateX.set(0);
    translateY.set(0);
  };

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative min-h-[45vh] flex items-center justify-center bg-black text-white overflow-hidden pt-16"
      onMouseMove={isMobile ? undefined : handleMouseMove}
      onMouseLeave={isMobile ? undefined : handleMouseLeave}
    >
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-orange/5 via-transparent to-transparent" />

      {/* Score counter (desktop only) */}
      {!isMobile && (
        <div className="absolute top-20 right-6 z-20 font-heading text-lg font-bold">
          <span className="text-orange">{score}</span>
          <span className="text-white/40 ml-1">pts</span>
        </div>
      )}

      {/* Falling balls */}
      {balls.map((ball) => (
        <FallingBall key={ball.id} ball={ball} onCollision={handleBallCollision} />
      ))}

      {/* Score flashes */}
      <AnimatePresence>
        {flashes.map((flash) => (
          <motion.div
            key={flash.id}
            initial={{ opacity: 1, y: 0, scale: 0.8 }}
            animate={{ opacity: 0, y: -80, scale: 2 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute z-30 pointer-events-none font-heading text-3xl font-bold text-orange"
            style={{ left: flash.x - 20, top: flash.y - 50 }}
          >
            +3
          </motion.div>
        ))}
      </AnimatePresence>

      <div
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex items-center justify-center"
      >
        {/* Identity Card with hoop */}
        <motion.div
          ref={cardRef}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={isMobile ? undefined : { x: xSpring, y: ySpring }}
          className="glass rounded-2xl p-6 sm:p-8 max-w-2xl w-full border border-white/10 will-change-transform relative"
        >
          <div className="flex flex-row gap-4 sm:gap-8">
            {/* Left side — Photo + Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="shrink-0 flex flex-col items-center justify-between gap-3"
            >
              <div className="w-20 h-20 sm:w-32 sm:h-32 rounded-full overflow-hidden border-2 border-orange">
                <Image
                  src="/images/valentin.jpg"
                  alt="Valentin Turgot - Hoopsidia"
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                  priority
                />
              </div>
              <h1 className="font-heading text-lg sm:text-3xl font-bold italic">
                <span className="text-orange">HOOPS</span>
                <span className="text-white">IDIA</span>
              </h1>
              <p className="font-heading text-[10px] sm:text-xs text-white/50 italic text-center hidden sm:block">
                &ldquo;{t("card.quote")}&rdquo;
              </p>
            </motion.div>

            {/* Right side — Fields */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex-1 space-y-2.5 sm:pt-2"
            >
              {getFields(t).map((field) => (
                <div key={field.label} className="flex gap-2">
                  <span className="text-white/40 text-sm shrink-0">
                    {field.label}:
                  </span>
                  <span className="font-heading text-sm font-bold text-white">
                    {field.value}
                  </span>
                </div>
              ))}
              <div className="flex items-center gap-2 pt-0.5">
                <span className="text-white/40 text-sm shrink-0">
                  {t("card.platforms")}:
                </span>
                <div className="flex items-center gap-2.5">
                  {(
                    Object.entries(SOCIAL_LINKS) as [
                      keyof typeof SOCIAL_LINKS,
                      string,
                    ][]
                  ).map(([platform, url]) => (
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
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Basketball net (desktop only) */}
          {!isMobile && <BasketNet />}
        </motion.div>
      </div>
    </section>
  );
}
