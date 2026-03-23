"use client";

import { useTranslations } from "next-intl";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const LYON_REELS = [
  { id: "DIW7YFDMZCj", shortcode: "DIW7YFDMZCj" },
  { id: "DJCwQ-_sIJQ", shortcode: "DJCwQ-_sIJQ" },
  { id: "DJPpxc1s88J", shortcode: "DJPpxc1s88J" },
  { id: "DJH27XPs9Uq", shortcode: "DJH27XPs9Uq" },
];

export default function LyonCourt() {
  const t = useTranslations("lyon");
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <section className="bg-black py-24" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="font-heading text-3xl sm:text-4xl font-bold italic uppercase text-white">
            {t("title")}
          </h2>
          <p className="mt-3 text-white/50">{t("subtitle")}</p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {LYON_REELS.map((reel, i) => (
            <motion.div
              key={reel.id}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="relative aspect-[9/16] rounded-xl overflow-hidden glass-subtle"
            >
              <iframe
                src={`https://www.instagram.com/reel/${reel.shortcode}/embed/`}
                className="absolute inset-0 w-full h-full border-0"
                allowFullScreen
                loading="lazy"
                title={`Lyon court reel ${i + 1}`}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
