"use client";

import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { CLIENTS } from "@/lib/constants";

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function ClientsCarousel() {
  const t = useTranslations("clients");

  // Shuffle on mount, then double for seamless infinite scroll
  const shuffled = useMemo(() => shuffle(CLIENTS), []);
  const items = [...shuffled, ...shuffled];

  return (
    <section id="clients" className="bg-black py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <h2 className="font-heading text-3xl sm:text-4xl font-bold italic uppercase text-white text-center">
          {t("title")}
        </h2>
        <p className="mt-3 text-white/50 text-center">{t("subtitle")}</p>
      </div>

      {/* Carousel track */}
      <div className="relative">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-20 bg-gradient-to-r from-black to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-20 bg-gradient-to-l from-black to-transparent z-10" />

        <div className="flex animate-scroll items-center py-4">
          {items.map((client, i) => (
            <div
              key={`${client.name}-${i}`}
              className="flex-shrink-0 px-6 sm:px-8 flex items-center justify-center glass rounded-xl mx-2 py-3"
            >
              {client.hasLogo ? (
                <img
                  src={client.logo}
                  alt={client.name}
                  style={{ height: "36px", width: "auto", maxWidth: "140px" }}
                  className="opacity-80 hover:opacity-100 transition-opacity"
                />
              ) : (
                <span className="text-white/60 font-heading font-bold text-sm sm:text-base whitespace-nowrap px-2">
                  {client.name}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
