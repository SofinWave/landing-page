import {
  SITE_EMAIL,
  SITE_NAME,
  SITE_SAME_AS,
  SITE_URL,
  localeUrl,
} from "@/lib/site";

interface ServiceItem {
  title: string;
  description: string;
}

interface FaqItem {
  question: string;
  answer: string;
}

interface OrgArgs {
  locale: string;
  description: string;
  services: ServiceItem[];
  technologies: string[];
  domains: string[];
}

/**
 * ProfessionalService/Organization node — the primary entity for search and
 * generative engines. Includes a service catalog and areas of expertise so
 * LLMs can answer "what does kingnnt.org do" accurately.
 */
export function organizationSchema({
  locale,
  description,
  services,
  technologies,
  domains,
}: OrgArgs) {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: localeUrl(locale),
    logo: `${SITE_URL}/icon.png`,
    image: `${SITE_URL}/icon.png`,
    email: SITE_EMAIL,
    description,
    inLanguage: locale,
    sameAs: SITE_SAME_AS,
    areaServed: [
      { "@type": "Country", name: "Vietnam" },
      { "@type": "Place", name: "Worldwide" },
    ],
    knowsAbout: [...technologies, ...domains],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Software consulting & implementation",
      itemListElement: services.map((s) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: s.title,
          description: s.description,
        },
      })),
    },
  };
}

/** WebSite node linking pages to the publisher entity. */
export function websiteSchema(locale: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: localeUrl(locale),
    name: SITE_NAME,
    inLanguage: locale,
    publisher: { "@id": `${SITE_URL}/#organization` },
  };
}

/** FAQPage node — high-value for both rich results and answer engines. */
export function faqSchema(items: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}
