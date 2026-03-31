import type { ReactNode } from "react";
import type { Metadata } from "next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import JsonLd from "@/components/JsonLd";
import "../globals.css";

const seoData: Record<string, { title: string; description: string; locale: string }> = {
  fr: {
    title: "Hoopsidia — Créateur de contenu basketball",
    description:
      "Hoopsidia — Valentin Turgot, créateur de contenu basketball. Rénovation DIY de terrains de basket, vlogs NBA courtside et fondateur de Pimp My Court.",
    locale: "fr_FR",
  },
  en: {
    title: "Hoopsidia — Basketball Content Creator",
    description:
      "Hoopsidia — Valentin Turgot, basketball content creator. DIY court renovation, NBA courtside vlogs and founder of Pimp My Court.",
    locale: "en_US",
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const seo = seoData[locale] || seoData.fr;
  const altLocale = locale === "fr" ? "en" : "fr";

  return {
    title: {
      default: seo.title,
      template: "%s | Hoopsidia",
    },
    description: seo.description,
    metadataBase: new URL("https://hoopsidia.com"),
    alternates: {
      canonical: `https://hoopsidia.com/${locale}`,
      languages: {
        fr: "https://hoopsidia.com/fr",
        en: "https://hoopsidia.com/en",
      },
    },
    openGraph: {
      type: "website",
      locale: seo.locale,
      alternateLocale: seoData[altLocale]?.locale,
      siteName: "Hoopsidia",
      title: seo.title,
      description: seo.description,
      url: `https://hoopsidia.com/${locale}`,
      images: [
        {
          url: "/images/og-image.png",
          width: 1200,
          height: 630,
          alt: "Hoopsidia — Basketball Content Creator",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
      images: ["/images/og-image.png"],
    },
    icons: {
      icon: [
        { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
        { url: "/favicon.png", sizes: "1024x1024", type: "image/png" },
      ],
      apple: "/apple-icon.png",
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = (await import(`@/messages/${locale}.json`)).default;

  return (
    <html lang={locale} className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <JsonLd locale={locale} />
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
