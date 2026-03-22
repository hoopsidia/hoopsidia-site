"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";

const navItems = [
  { key: "home", href: "#hero" },
  { key: "stats", href: "#stats" },
  { key: "clients", href: "#clients" },
  { key: "pimpMyCourt", href: "#pmc" },
  { key: "contact", href: "#contact" },
] as const;

export default function Header() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const switchLocale = () => {
    const next = locale === "fr" ? "en" : "fr";
    router.replace(pathname, { locale: next });
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-strong">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="#hero" className="font-heading text-xl font-bold italic">
            <span className="text-orange">HOOPS</span><span className="text-white">IDIA</span>
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <a
                key={item.key}
                href={item.href}
                className="text-sm text-white/70 hover:text-orange transition-colors"
              >
                {t(item.key)}
              </a>
            ))}
            <button
              onClick={switchLocale}
              className="text-sm font-medium text-orange border border-orange/30 px-3 py-1 rounded-full hover:bg-orange/10 transition-colors"
            >
              {locale === "fr" ? "EN" : "FR"}
            </button>
          </nav>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-white p-2"
            aria-label="Menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {menuOpen ? (
                <path d="M6 6l12 12M6 18L18 6" />
              ) : (
                <path d="M3 6h18M3 12h18M3 18h18" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <nav className="md:hidden glass-strong border-t border-white/10 px-4 py-4 space-y-3">
          {navItems.map((item) => (
            <a
              key={item.key}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="block text-white/70 hover:text-orange transition-colors py-2"
            >
              {t(item.key)}
            </a>
          ))}
          <button
            onClick={switchLocale}
            className="text-sm font-medium text-orange border border-orange/30 px-3 py-1 rounded-full"
          >
            {locale === "fr" ? "EN" : "FR"}
          </button>
        </nav>
      )}
    </header>
  );
}
