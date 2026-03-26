"use client";

import { useTranslations } from "next-intl";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const SERVICES = [
  {
    key: "content",
    icon: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
        <circle cx="12" cy="13" r="4" />
      </svg>
    ),
  },
  {
    key: "consulting",
    icon: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
        <path d="M9 18h6" />
        <path d="M10 22h4" />
        <path d="M12 2a7 7 0 0 1 4 12.7V17H8v-2.3A7 7 0 0 1 12 2z" />
      </svg>
    ),
  },
  {
    key: "events",
    icon: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4" />
        <path d="M8 2v4" />
        <path d="M3 10h18" />
      </svg>
    ),
  },
  {
    key: "pmc",
    icon: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
        <path d="M18.37 2.63a1 1 0 0 1 1.41 0l1.59 1.59a1 1 0 0 1 0 1.41L9.41 17.59a1 1 0 0 1-.52.28l-3.66.73a.5.5 0 0 1-.59-.59l.73-3.66a1 1 0 0 1 .28-.52z" />
        <path d="M14 7l3 3" />
      </svg>
    ),
  },
];

export default function Services() {
  const t = useTranslations("services");
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <section id="services" className="bg-black text-white py-24" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="font-heading text-3xl sm:text-4xl font-bold italic lowercase text-orange">
            {t("title")}
          </h2>
          <p className="mt-3 text-white/50">{t("subtitle")}</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {SERVICES.map((service, i) => (
            <motion.div
              key={service.key}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              whileHover={{ y: -8 }}
              className="glass rounded-2xl p-8 border border-transparent hover:border-orange/30 transition"
            >
              <div className="mb-5">{service.icon}</div>
              <h3 className="font-heading font-bold text-lg text-white mb-2">
                {t(`${service.key}.title`)}
              </h3>
              <p className="text-sm text-white/60">
                {t(`${service.key}.description`)}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
