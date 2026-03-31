"use client";

import { useTranslations } from "next-intl";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { PRESS_ARTICLES } from "@/lib/press";

export default function PressSection() {
  const t = useTranslations("press");
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <section id="press" className="bg-black py-24" ref={ref}>
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

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {PRESS_ARTICLES.map((article, i) => (
            <motion.a
              key={article.url}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="glass rounded-xl p-5 flex items-start gap-4 hover:bg-white/[0.08] transition-colors group"
            >
              {/* Logo carré liquid glass style app icon */}
              <div
                className="flex-shrink-0 w-14 h-14 rounded-[22%] relative overflow-hidden flex items-center justify-center"
                style={{
                  background: "linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 50%, rgba(0,0,0,0.1) 100%)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  boxShadow: "inset 0 1px 1px rgba(255,255,255,0.06), 0 4px 12px rgba(0,0,0,0.3)",
                }}
              >
                <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 40%)" }} />
                <img
                  src={article.icon}
                  alt={article.source}
                  className="w-full h-full object-cover relative z-10"
                />
              </div>

              {/* Contenu */}
              <div className="flex flex-col gap-2 flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-heading text-xs font-bold uppercase tracking-wider text-orange">
                    {article.source}
                  </span>
                  {article.date && (
                    <span className="text-[10px] text-white/30">
                      {article.date}
                    </span>
                  )}
                </div>
                <h3 className="font-heading text-sm font-bold text-white/80 group-hover:text-white transition-colors leading-snug uppercase">
                  {article.title}
                </h3>
                <div className="mt-auto flex items-center gap-1 text-orange/60 group-hover:text-orange transition-colors">
                  <span className="text-xs font-bold uppercase">{t("read")}</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="translate-x-0 group-hover:translate-x-1 transition-transform">
                    <path d="M7 17L17 7M17 7H7M17 7v10" />
                  </svg>
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
