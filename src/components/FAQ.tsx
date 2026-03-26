"use client";

import { useTranslations } from "next-intl";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { useRef, useState } from "react";

const FAQ_KEYS = ["q1", "q2", "q3", "q4", "q5", "q6"] as const;

export default function FAQ() {
  const t = useTranslations("faq");
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) => {
    setOpenIndex(openIndex === i ? null : i);
  };

  return (
    <section id="faq" className="bg-black text-white py-24" ref={ref}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
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

        <div className="flex flex-col gap-4">
          {FAQ_KEYS.map((key, i) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="glass rounded-xl overflow-hidden"
            >
              <button
                onClick={() => toggle(i)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <span className="font-heading font-medium text-white pr-4">
                  {t(`items.${key}.question`)}
                </span>
                <motion.svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-white/50 flex-shrink-0"
                  animate={{ rotate: openIndex === i ? 180 : 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <polyline points="6 9 12 15 18 9" />
                </motion.svg>
              </button>

              <AnimatePresence initial={false}>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <p className="text-white/60 text-sm px-5 pb-5">
                      {t(`items.${key}.answer`)}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
