"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

// Shared top nav for the Pimp My Court section, branded like hoopsidia.com
// (HOOPSIDIA wordmark, Diamante, brand orange, glass). Hidden on the back-office
// (which has its own header). Fixed/translucent so it overlays the full-screen
// map without stealing height.
const LINKS = [
  { href: "/pimpmycourt", label: "La carte" },
  { href: "/pimpmycourt/tournage", label: "Protocole" },
  { href: "/pimpmycourt/kit", label: "Demander un kit" },
];

export default function PmcHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  if (pathname?.startsWith("/pimpmycourt/admin")) return null;

  return (
    <header className="sticky top-0 inset-x-0 z-40 bg-black border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Brand — links back to hoopsidia.com */}
        <Link href="/" className="flex items-baseline gap-2 shrink-0">
          <span className="font-heading text-xl font-bold italic">
            <span className="text-orange">HOOPS</span>
            <span className="text-white">IDIA</span>
          </span>
          <span className="hidden sm:inline text-[11px] font-heading font-bold uppercase tracking-wide text-orange/80">
            Pimp My Court
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-6 text-sm font-heading font-bold">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={pathname === l.href ? "text-orange" : "text-white/70 hover:text-white transition-colors"}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen((o) => !o)}
          className="sm:hidden text-white p-1"
          aria-label="Menu"
          aria-expanded={open}
        >
          {open ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12" /></svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18" /></svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav className="sm:hidden border-t border-white/10 bg-black/90 backdrop-blur px-4 py-3 flex flex-col gap-3 text-sm font-heading font-bold">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={pathname === l.href ? "text-orange" : "text-white/80"}
            >
              {l.label}
            </Link>
          ))}
          <Link href="/" onClick={() => setOpen(false)} className="text-white/40">
            ← Le site hoopsidia.com
          </Link>
        </nav>
      )}
    </header>
  );
}
