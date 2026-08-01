import type { MetadataRoute } from "next";
import { BASE_URL } from "@/lib/constants";
import { routing } from "@/i18n/routing";

export default function sitemap(): MetadataRoute.Sitemap {
  const localeAlternates = Object.fromEntries(
    routing.locales.map((l) => [l, `${BASE_URL}/${l}`])
  );

  const localeEntries = routing.locales.map((locale, i) => ({
    url: `${BASE_URL}/${locale}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: i === 0 ? 1 : 0.9,
    alternates: { languages: localeAlternates },
  }));

  // Locale-less Pimp My Court product routes (indexed ones only).
  const pmcEntries = ["/pimpmycourt", "/pimpmycourt/kit", "/pimpmycourt/tournage", "/pimpmycourt/donnees"].map(
    (path) => ({
      url: `${BASE_URL}${path}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: path === "/pimpmycourt" ? 0.9 : 0.6,
    })
  );

  return [...localeEntries, ...pmcEntries];
}
