"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";

const navItems = [
  { key: "home", href: "#hero" },
  { key: "mediaKit", href: "#stats" },
  { key: "clients", href: "#clients" },
  { key: "contact", href: "#contact" },
] as const;

const sectionIds = ["hero", "stats", "clients", "contact"];

export default function Header() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [pillStyle, setPillStyle] = useState<{ left: number; width: number } | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  const switchLocale = () => {
    const next = locale === "fr" ? "en" : "fr";
    router.replace(pathname, { locale: next });
  };

  // Get pill position for a given nav item index
  const getPillPosition = useCallback((index: number) => {
    const nav = navRef.current;
    const item = itemRefs.current[index];
    if (!nav || !item) return null;
    const navRect = nav.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();
    return {
      left: itemRect.left - navRect.left,
      width: itemRect.width,
    };
  }, []);

  // Update pill to active section when not hovering
  const updateActivePill = useCallback(() => {
    if (isHovering) return;
    const pos = getPillPosition(activeIndex);
    if (pos) setPillStyle(pos);
  }, [activeIndex, isHovering, getPillPosition]);

  // Scroll spy — detect which section is in view
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY + window.innerHeight / 3;
      let currentIndex = 0;

      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const el = document.getElementById(sectionIds[i]);
        if (el && el.offsetTop <= scrollY) {
          currentIndex = i;
          break;
        }
      }

      setActiveIndex(currentIndex);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // initial
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Update pill when active index changes or on resize
  useEffect(() => {
    updateActivePill();
  }, [updateActivePill]);

  useEffect(() => {
    const handleResize = () => updateActivePill();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [updateActivePill]);

  // Set initial pill position after mount
  useEffect(() => {
    const timeout = setTimeout(() => {
      const pos = getPillPosition(0);
      if (pos) setPillStyle(pos);
    }, 100);
    return () => clearTimeout(timeout);
  }, [getPillPosition]);

  const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>, index: number) => {
    setIsHovering(true);
    const nav = navRef.current;
    if (!nav) return;
    const navRect = nav.getBoundingClientRect();
    const targetRect = e.currentTarget.getBoundingClientRect();
    setPillStyle({
      left: targetRect.left - navRect.left,
      width: targetRect.width,
    });
  };

  const handleNavMouseLeave = () => {
    setIsHovering(false);
    // Return pill to active section
    const pos = getPillPosition(activeIndex);
    if (pos) setPillStyle(pos);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-strong">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center h-14 sm:h-16">
          <nav
            ref={navRef}
            className="flex items-center gap-0.5 sm:gap-1 relative overflow-x-auto scrollbar-hide"
            onMouseLeave={handleNavMouseLeave}
          >
            {/* Glass pill that follows hover/scroll */}
            <div
              className="absolute top-1/2 -translate-y-1/2 h-8 rounded-full transition-all duration-300 ease-out pointer-events-none hidden sm:block"
              style={{
                left: pillStyle ? pillStyle.left : 0,
                width: pillStyle ? pillStyle.width : 0,
                opacity: pillStyle ? 1 : 0,
                background: "rgba(255, 255, 255, 0.06)",
                backdropFilter: "blur(20px) saturate(1.4)",
                WebkitBackdropFilter: "blur(20px) saturate(1.4)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 2px 12px rgba(0, 0, 0, 0.15)",
              }}
            />
            {navItems.map((item, index) => (
              <a
                key={item.key}
                href={item.href}
                ref={(el) => { itemRefs.current[index] = el; }}
                onMouseEnter={(e) => handleMouseEnter(e, index)}
                className={`relative z-10 text-xs sm:text-sm transition-colors px-2.5 sm:px-4 py-2 whitespace-nowrap ${
                  activeIndex === index && !isHovering
                    ? "text-white"
                    : "text-white/70 hover:text-white"
                }`}
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
