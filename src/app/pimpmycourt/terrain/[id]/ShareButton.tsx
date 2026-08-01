"use client";

import { useState } from "react";

export default function ShareButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    if (navigator.share) {
      try {
        await navigator.share({ url, title: "La carte des filets" });
        return;
      } catch {
        /* fall through to copy */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  return (
    <button
      onClick={share}
      className="rounded-full glass-subtle px-6 py-3 font-heading font-bold uppercase text-sm hover:bg-white/10 transition-colors"
    >
      {copied ? "Lien copié ✓" : "Partager"}
    </button>
  );
}
