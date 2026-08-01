import type { ReactNode } from "react";
import Link from "next/link";

// Shared skeleton for the /pimpmycourt sub-pages while their backend-dependent
// features are built out. On-brand (black / orange / Diamante), so these are
// real page skeletons rather than throwaway shells. The `_components` folder is
// private (underscore prefix) and never becomes a route.

export default function Scaffold({
  step,
  eyebrow,
  title,
  intro,
  children,
}: {
  step: string;
  eyebrow: string;
  title: string;
  intro: string;
  children?: ReactNode;
}) {
  return (
    <main className="min-h-[100dvh] bg-black text-white">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <Link
          href="/pimpmycourt"
          className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-orange transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          La carte des filets
        </Link>

        <div className="mt-8">
          <div className="text-xs text-orange font-bold uppercase tracking-wider">
            {eyebrow}
          </div>
          <h1 className="mt-2 font-heading text-3xl sm:text-4xl font-bold italic uppercase">
            {title}
          </h1>
          <p className="mt-4 text-white/60 leading-relaxed">{intro}</p>
        </div>

        {children && <div className="mt-10">{children}</div>}

        <div className="mt-12 rounded-xl glass-subtle p-4 text-sm text-white/40">
          <span className="font-heading font-bold text-white/60">{step}</span>{" "}
          — structure en place, fonctionnalités en cours d&apos;implémentation.
        </div>
      </div>
    </main>
  );
}
