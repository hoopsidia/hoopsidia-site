"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  const [showAll, setShowAll] = useState(false);

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

      {/* Carousel track — clic sur un logo ouvre la grid */}
      {!showAll && (
        <div className="relative cursor-pointer" onClick={() => setShowAll(true)}>
          <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-20 bg-gradient-to-r from-black to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-20 bg-gradient-to-l from-black to-transparent z-10" />

          <div className="flex animate-scroll items-center py-4">
            {items.map((client, i) => (
              <div
                key={`${client.name}-${i}`}
                className="flex-shrink-0 mx-2 flex items-center justify-center glass rounded-xl px-6 sm:px-8 py-3"
              >
                {client.hasLogo ? (
                  <img
                    src={client.logo}
                    alt={client.name}
                    className="h-9 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity"
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
      )}

      {/* Grid view */}
      <AnimatePresence>
        {showAll && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {CLIENTS.map((client, i) => (
                  <motion.div
                    key={client.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.04 }}
                    className="glass rounded-xl p-6 flex items-center justify-center aspect-[3/2]"
                  >
                    {client.hasLogo ? (
                      <img
                        src={client.logo}
                        alt={client.name}
                        className="max-h-10 w-auto object-contain opacity-80"
                      />
                    ) : (
                      <span className="text-white/60 font-heading font-bold text-sm text-center">
                        {client.name}
                      </span>
                    )}
                  </motion.div>
                ))}
              </div>

              <div className="text-center mt-8">
                <button
                  onClick={() => setShowAll(false)}
                  className="font-heading text-sm font-bold uppercase tracking-wider text-orange hover:text-white transition-colors"
                >
                  Fermer
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
