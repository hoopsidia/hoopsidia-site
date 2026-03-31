export default function JsonLd({ locale }: { locale: string }) {
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Valentin Turgot",
    alternateName: "Hoopsidia",
    jobTitle:
      locale === "fr"
        ? "Créateur de contenu basketball"
        : "Basketball Content Creator",
    description:
      locale === "fr"
        ? "Créateur de contenu basketball français. Rénovation DIY de terrains de basket, vlogs NBA courtside, fondateur de Pimp My Court et co-fondateur de Hoopsmakers."
        : "French basketball content creator. DIY court renovation, NBA courtside vlogs, founder of Pimp My Court and co-founder of Hoopsmakers.",
    url: "https://hoopsidia.com",
    image: "https://hoopsidia.com/images/valentin.jpg",
    knowsAbout: [
      "Basketball",
      "DIY",
      locale === "fr" ? "Rénovation de terrains de basket" : "Basketball court renovation",
      "NBA",
      locale === "fr" ? "Création de contenu" : "Content creation",
      "Pimp My Court",
    ],
    sameAs: [
      "https://www.youtube.com/@hoopsidia",
      "https://www.instagram.com/hoopsidia",
      "https://www.tiktok.com/@hoopsidia",
      "https://www.linkedin.com/in/valentinturgot/",
      "https://x.com/HoopsidiaFR",
    ],
    nationality: {
      "@type": "Country",
      name: "France",
    },
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Hoopsidia",
    url: "https://hoopsidia.com",
    logo: "https://hoopsidia.com/images/logo-dark-bg.png",
    founder: {
      "@type": "Person",
      name: "Valentin Turgot",
    },
    foundingDate: "2016-09",
    description:
      locale === "fr"
        ? "Création de contenu basketball, rénovation DIY de terrains de basket et production vidéo sportive."
        : "Basketball content creation, DIY court renovation and sports video production.",
    sameAs: [
      "https://www.youtube.com/@hoopsidia",
      "https://www.instagram.com/hoopsidia",
      "https://www.tiktok.com/@hoopsidia",
    ],
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Hoopsidia",
    url: "https://hoopsidia.com",
    inLanguage: [locale === "fr" ? "fr-FR" : "en-US"],
  };

  // All schema data is hardcoded — no user input, safe to serialize
  const schemas = [personSchema, organizationSchema, websiteSchema];

  return (
    <>
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          // Content is statically defined above — no XSS risk
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}
