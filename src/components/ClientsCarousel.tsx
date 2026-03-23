"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState, useCallback } from "react";
import { CLIENTS } from "@/lib/constants";

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function ClientCard({ client }: { client: (typeof CLIENTS)[number] }) {
  const [transform, setTransform] = useState("");

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTransform(`perspective(400px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) scale(1.05)`);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTransform("");
  }, []);

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="glass rounded-xl p-6 flex items-center justify-center aspect-[3/2] transition-transform duration-200 ease-out"
      style={{ transform: transform || undefined }}
    >
      {client.hasLogo ? (
        <img
          src={client.logo}
          alt={client.name}
          className="max-h-10 w-auto object-contain opacity-70 hover:opacity-100 transition-opacity"
          style={(client as { scale?: number }).scale ? { transform: `scale(${(client as { scale?: number }).scale})` } : undefined}
        />
      ) : (
        <span className="text-white/60 font-heading font-bold text-sm text-center">
          {client.name}
        </span>
      )}
    </div>
  );
}

export default function ClientsCarousel() {
  const t = useTranslations("clients");
  const shuffled = useMemo(() => shuffle(CLIENTS), []);

  return (
    <section id="clients" className="bg-black py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-heading text-3xl sm:text-4xl font-bold italic uppercase text-white text-center mb-3">
          {t("title")}
        </h2>
        <p className="text-white/50 text-center mb-12">{t("subtitle")}</p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {shuffled.map((client) => (
            <ClientCard key={client.name} client={client} />
          ))}
        </div>
      </div>
    </section>
  );
}
