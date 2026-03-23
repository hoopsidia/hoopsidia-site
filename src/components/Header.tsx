"use client";

import { useRef } from "react";
import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";

const navItems = [
  { key: "home", href: "#hero" },
  { key: "mediaKit", href: "#stats" },
  { key: "clients", href: "#clients" },
  { key: "contact", href: "#contact" },
] as const;

export default function Header() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [hoverStyle, setHoverStyle] = useState<{ left: number; width: number } | null>(null);
  const navRef = useRef<HTMLElement>(null);

  const switchLocale = () => {
    const next = locale === "fr" ? "en" : "fr";
    router.replace(pathname, { locale: next });
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const target = e.currentTarget;
    const nav = navRef.current;
    if (!nav) return;
    const navRect = nav.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    setHoverStyle({
      left: targetRect.left - navRect.left,
      width: targetRect.width,
    });
  };

  const handleMouseLeave = () => {
    setHoverStyle(null);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-strong">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center h-14 sm:h-16">
          <nav
            ref={navRef}
            className="flex items-center gap-0.5 sm:gap-1 relative overflow-x-auto scrollbar-hide"
            onMouseLeave={handleMouseLeave}
          >
            {/* Glass pill that follows hover */}
            <div
              className="absolute top-1/2 -translate-y-1/2 h-8 rounded-full transition-all duration-300 ease-out pointer-events-none hidden sm:block"
              style={{
                left: hoverStyle ? hoverStyle.left : 0,
                width: hoverStyle ? hoverStyle.width : 0,
                opacity: hoverStyle ? 1 : 0,
                background: "rgba(255, 255, 255, 0.06)",
                backdropFilter: "blur(20px) saturate(1.4)",
                WebkitBackdropFilter: "blur(20px) saturate(1.4)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 2px 12px rgba(0, 0, 0, 0.15)",
              }}
            />
            {navItems.map((item) => (
              <a
                key={item.key}
                href={item.href}
                onMouseEnter={handleMouseEnter}
                className="relative z-10 text-xs sm:text-sm text-white/70 hover:text-white transition-colors px-2.5 sm:px-4 py-2 whitespace-nowrap"
              >
                {t(item.key)}
              </a>
            ))}
            <button
              onClick={switchLocale}
              className="relative z-10 text-xs sm:text-sm font-medium text-orange border border-orange/30 px-2.5 sm:px-3 py-1 rounded-full hover:bg-orange/10 transition-colors ml-2 sm:ml-4 whitespace-nowrap"
            >
              {locale === "fr" ? "EN" : "FR"}
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
