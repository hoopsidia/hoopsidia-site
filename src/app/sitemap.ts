import type { MetadataRoute } from "next";
import { BASE_URL } from "@/lib/constants";
import { routing } from "@/i18n/routing";

export default function sitemap(): MetadataRoute.Sitemap {
  const localeAlternates = Object.fromEntries(
    routing.locales.map((l) => [l, `${BASE_URL}/${l}`])
  );

  return routing.locales.map((locale, i) => ({
    url: `${BASE_URL}/${locale}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: i === 0 ? 1 : 0.9,
    alternates: { languages: localeAlternates },
  }));
}
