"use client";

import { useTranslations } from "next-intl";
import { CLIENTS } from "@/lib/constants";

export default function ClientsCarousel() {
  const t = useTranslations("clients");

  return (
    <section id="clients" className="bg-black py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-heading text-3xl sm:text-4xl font-bold italic uppercase text-white text-center mb-3">
          {t("title")}
        </h2>
        <p className="text-white/50 text-center mb-12">{t("subtitle")}</p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {CLIENTS.map((client) => (
            <div
              key={client.name}
              className="glass rounded-xl p-6 flex items-center justify-center aspect-[3/2]"
            >
              {client.hasLogo ? (
                <img
                  src={client.logo}
                  alt={client.name}
                  className="max-h-10 w-auto object-contain opacity-70 hover:opacity-100 transition-opacity"
                />
              ) : (
                <span className="text-white/60 font-heading font-bold text-sm text-center">
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
