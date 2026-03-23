"use client";

import { useTranslations } from "next-intl";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

type TimelineItem = {
  year: string;
  title: string;
  subtitle: string;
  description: string;
  icon: "school" | "work" | "rocket" | "film" | "basketball";
  color?: string;
};

function getTimeline(t: (key: string) => string): TimelineItem[] {
  return [
    {
      year: "2010",
      title: t("cv.items.school.title"),
      subtitle: t("cv.items.school.subtitle"),
      description: t("cv.items.school.description"),
      icon: "school",
    },
    {
      year: "2014",
      title: t("cv.items.havas.title"),
      subtitle: t("cv.items.havas.subtitle"),
      description: t("cv.items.havas.description"),
      icon: "work",
    },
    {
      year: "2017",
      title: t("cv.items.hoopsidia.title"),
      subtitle: t("cv.items.hoopsidia.subtitle"),
      description: t("cv.items.hoopsidia.description"),
      icon: "basketball",
      color: "#FC8D33",
    },
    {
      year: "2019",
      title: t("cv.items.fulltime.title"),
      subtitle: t("cv.items.fulltime.subtitle"),
      description: t("cv.items.fulltime.description"),
      icon: "rocket",
    },
    {
      year: "2020",
      title: t("cv.items.hoopsmakers.title"),
      subtitle: t("cv.items.hoopsmakers.subtitle"),
      description: t("cv.items.hoopsmakers.description"),
      icon: "film",
    },
  ];
}

function IconForType({ icon }: { icon: TimelineItem["icon"] }) {
  const svgProps = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "currentColor" };
  switch (icon) {
    case "school":
      return (
        <svg {...svgProps}>
          <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z" />
        </svg>
      );
    case "work":
      return (
        <svg {...svgProps}>
          <path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z" />
        </svg>
      );
    case "rocket":
      return (
        <svg {...svgProps}>
          <path d="M9.19 6.35c-2.04 2.29-3.44 5.58-3.57 5.89L2 10.69l4.05-4.05c.47-.47 1.15-.68 1.81-.55l1.33.26zM11.17 17s3.74-1.55 5.89-3.7c5.4-5.4 4.5-9.62 4.21-10.57-.95-.3-5.17-1.19-10.57 4.21C8.55 9.09 7 12.83 7 12.83l4.17 4.17zm6.48-3.7c-.47.47-1.15.68-1.81.55l-1.33-.26 3.56-3.56 1.46 1.46c-.55.38-1.13.81-1.88 1.81zM5.04 18.5c.67-.67.34-1.77-.55-2.67-.91-.91-2.02-1.23-2.69-.56-.67.67-.33 3.43-.33 3.43s2.9.34 3.57-.2zM7.5 16s-2 2.5-2 3.5c0 .83.67 1.5 1.5 1.5s3.5-2 3.5-2H7.5z" />
        </svg>
      );
    case "film":
      return (
        <svg {...svgProps}>
          <path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z" />
        </svg>
      );
    case "basketball":
      return (
        <svg {...svgProps}>
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-.52.07-1.06.07-1.59.04-.18-1.08-.55-2.08-1.08-2.97h2.67v2.93zm-4.45-4.93c-.8-1.43-1.27-3.06-1.35-4.8h3.8v4.8h-2.45zm6.9 0H13V10.2h3.8c-.08 1.74-.55 3.37-1.35 4.8zm-6.9-6.8c.08-1.74.55-3.37 1.35-4.8h2.45v4.8h-3.8zm8.7 0h-2.93c-.52-.07-1.06-.07-1.59-.04.18 1.08.55 2.08 1.08 2.97h3.44c.08-1.74-.55-3.37-1.35-4.8l1.35 1.87z" />
        </svg>
      );
  }
}

export default function CvTimeline() {
  const t = useTranslations("hero");
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const timeline = getTimeline(t);

  return (
    <section ref={ref} className="bg-black py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-heading text-3xl sm:text-4xl font-bold italic uppercase text-white text-center mb-4">
          {t("cv.title")}
        </h2>
        <p className="text-white/50 text-center mb-16">{t("cv.subtitle")}</p>

        {/* Desktop horizontal timeline */}
        <div className="hidden md:block relative">
          {/* Timeline line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={isInView ? { scaleX: 1 } : {}}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="absolute top-[28px] left-0 right-0 h-[2px] bg-gradient-to-r from-white/10 via-orange/40 to-white/10 origin-left"
          />

          <div className="flex justify-between relative">
            {timeline.map((item, i) => (
              <motion.div
                key={item.year}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.2 + i * 0.15 }}
                className="flex flex-col items-center text-center w-1/5 px-2"
              >
                {/* Dot */}
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center mb-4 border-2 relative z-10"
                  style={{
                    borderColor: item.color || "rgba(255,255,255,0.2)",
                    background: item.color ? `${item.color}20` : "rgba(255,255,255,0.05)",
                    color: item.color || "rgba(255,255,255,0.7)",
                  }}
                >
                  <IconForType icon={item.icon} />
                </div>

                {/* Year */}
                <span
                  className="font-heading text-lg font-bold italic mb-1"
                  style={{ color: item.color || "#FC8D33" }}
                >
                  {item.year}
                </span>

                {/* Title */}
                <h3 className="font-heading text-sm font-bold text-white mb-0.5 leading-tight">
                  {item.title}
                </h3>

                {/* Subtitle */}
                <p className="text-white/50 text-xs mb-2">{item.subtitle}</p>

                {/* Description */}
                <p className="text-white/30 text-xs leading-relaxed max-w-[180px]">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Mobile vertical timeline */}
        <div className="md:hidden relative pl-8">
          {/* Vertical line */}
          <motion.div
            initial={{ scaleY: 0 }}
            animate={isInView ? { scaleY: 1 } : {}}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="absolute top-0 bottom-0 left-[18px] w-[2px] bg-gradient-to-b from-white/10 via-orange/40 to-white/10 origin-top"
          />

          <div className="flex flex-col gap-10">
            {timeline.map((item, i) => (
              <motion.div
                key={item.year}
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.12 }}
                className="relative flex gap-4"
              >
                {/* Dot */}
                <div
                  className="absolute -left-8 w-10 h-10 rounded-full flex items-center justify-center border-2 shrink-0 z-10 [&_svg]:w-4 [&_svg]:h-4"
                  style={{
                    borderColor: item.color || "rgba(255,255,255,0.2)",
                    background: item.color ? `${item.color}20` : "rgba(0,0,0,1)",
                    color: item.color || "rgba(255,255,255,0.7)",
                  }}
                >
                  <IconForType icon={item.icon} />
                </div>

                <div className="ml-4">
                  <span
                    className="font-heading text-base font-bold italic"
                    style={{ color: item.color || "#FC8D33" }}
                  >
                    {item.year}
                  </span>
                  <h3 className="font-heading text-sm font-bold text-white leading-tight">
                    {item.title}
                  </h3>
                  <p className="text-white/50 text-xs">{item.subtitle}</p>
                  <p className="text-white/30 text-xs leading-relaxed mt-1">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
