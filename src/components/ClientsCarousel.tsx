"use client";

import { useTranslations } from "next-intl";
import { useState, useCallback } from "react";
import { CLIENTS } from "@/lib/constants";

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
      className="aspect-square rounded-[22%] relative overflow-hidden flex items-center justify-center p-6 transition-transform duration-200 ease-out cursor-default"
      style={{
        transform: transform || undefined,
        background: "linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 50%, rgba(0,0,0,0.1) 100%)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "inset 0 1px 1px rgba(255,255,255,0.06), 0 4px 16px rgba(0,0,0,0.4)",
      }}
    >
      {/* Subtle shine overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 40%)",
        }}
      />
      {client.hasLogo ? (
        <img
          src={client.logo}
          alt={client.name}
          className="max-h-12 w-auto object-contain relative z-10"
        />
      ) : (
        <span className="text-white/60 font-heading font-bold text-sm text-center relative z-10">
          {client.name}
        </span>
      )}
    </div>
  );
}

export default function ClientsCarousel() {
  const t = useTranslations("clients");

  return (
    <section id="clients" className="bg-black py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-heading text-3xl sm:text-4xl font-bold italic uppercase text-white text-center mb-3">
          {t("title")}
        </h2>
        <p className="text-white/50 text-center mb-12">{t("subtitle")}</p>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4 max-w-4xl mx-auto">
          {CLIENTS.map((client) => (
            <ClientCard key={client.name} client={client} />
          ))}
        </div>
      </div>
    </section>
  );
}
