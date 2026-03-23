import type { ReactNode } from "react";
import type { Metadata } from "next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import "../globals.css";

export const metadata: Metadata = {
  title: {
    default: "Hoopsidia — Créateur de contenu basketball",
    template: "%s | Hoopsidia",
  },
  description:
    "Hoopsidia — Valentin Turgot, créateur de contenu basketball. YouTube 113K, Instagram 71K. Pimp My Court, collaborations marques.",
  metadataBase: new URL("https://hoopsidia.com"),
  openGraph: {
    type: "website",
    locale: "fr_FR",
    alternateLocale: "en_US",
    siteName: "Hoopsidia",
    images: [{ url: "/images/logo-dark-bg.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
  },
  icons: {
    icon: "/favicon.png",
  },
};

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
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
