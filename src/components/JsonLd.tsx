import { BASE_URL, SOCIAL_LINKS } from "@/lib/constants";

const loc = (fr: string, en: string, locale: string) => (locale === "fr" ? fr : en);

export default function JsonLd({ locale }: { locale: string }) {
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Valentin Turgot",
    alternateName: "Hoopsidia",
    jobTitle: loc("Créateur de contenu basketball", "Basketball Content Creator", locale),
    description: loc(
      "Créateur de contenu basketball français. Rénovation DIY de terrains de basket, vlogs NBA courtside, fondateur de Pimp My Court et co-fondateur de Hoopsmakers.",
      "French basketball content creator. DIY court renovation, NBA courtside vlogs, founder of Pimp My Court and co-founder of Hoopsmakers.",
      locale
    ),
    url: BASE_URL,
    image: `${BASE_URL}/images/valentin.jpg`,
    knowsAbout: [
      "Basketball",
      "DIY",
      loc("Rénovation de terrains de basket", "Basketball court renovation", locale),
      "NBA",
      loc("Création de contenu", "Content creation", locale),
      "Pimp My Court",
    ],
    sameAs: [
      SOCIAL_LINKS.youtube,
      SOCIAL_LINKS.instagram,
      SOCIAL_LINKS.tiktok,
      "https://www.linkedin.com/in/valentinturgot/",
      "https://x.com/HoopsidiaFR",
    ],
    nationality: { "@type": "Country", name: "France" },
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Hoopsidia",
    url: BASE_URL,
    logo: `${BASE_URL}/images/logo-dark-bg.png`,
    founder: { "@type": "Person", name: "Valentin Turgot" },
    foundingDate: "2016-09",
    description: loc(
      "Création de contenu basketball, rénovation DIY de terrains de basket et production vidéo sportive.",
      "Basketball content creation, DIY court renovation and sports video production.",
      locale
    ),
    sameAs: [SOCIAL_LINKS.youtube, SOCIAL_LINKS.instagram, SOCIAL_LINKS.tiktok],
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Hoopsidia",
    url: BASE_URL,
    inLanguage: [locale === "fr" ? "fr-FR" : "en-US"],
  };

  const schemas = [personSchema, organizationSchema, websiteSchema];

  return (
    <>
      {schemas.map((schema) => (
        <script
          key={schema["@type"]}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}
