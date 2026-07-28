import { SITE_EMAIL, SITE_NAME, SITE_SAME_AS, SITE_URL, localeUrl, pageUrl } from "@/lib/site";
import { type RouteDef, breadcrumbTrail } from "@/lib/routes";

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
 * LLMs can answer "what does SofinWave do" accurately.
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

/**
 * BreadcrumbList for a content page, derived from the route registry so the
 * markup and the rendered trail can never disagree.
 */
export function breadcrumbSchema(
  locale: string,
  path: string,
  nameFor: (route: RouteDef) => string,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbTrail(path).map((route, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: nameFor(route),
      item: pageUrl(locale, route.path),
    })),
  };
}

/** WebPage node binding a page to the site and publisher entities. */
export function webPageSchema({
  locale,
  path,
  title,
  description,
}: {
  locale: string;
  path: string;
  title: string;
  description: string;
}) {
  const url = pageUrl(locale, path);

  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: title,
    description,
    inLanguage: locale,
    isPartOf: { "@id": `${SITE_URL}/#website` },
    about: { "@id": `${SITE_URL}/#organization` },
    publisher: { "@id": `${SITE_URL}/#organization` },
  };
}

/**
 * Service node for a service page. `serviceType` carries the query the page
 * targets, which is what answer engines match against.
 */
export function serviceSchema({
  locale,
  path,
  name,
  description,
  serviceType,
}: {
  locale: string;
  path: string;
  name: string;
  description: string;
  serviceType: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${pageUrl(locale, path)}#service`,
    name,
    description,
    serviceType,
    url: pageUrl(locale, path),
    provider: { "@id": `${SITE_URL}/#organization` },
    areaServed: [
      { "@type": "Country", name: "Vietnam" },
      { "@type": "Place", name: "Worldwide" },
    ],
    availableLanguage: ["en", "vi"],
  };
}

/**
 * Person nodes for named team members.
 *
 * Only real, named people belong here — placeholder entries are filtered out by
 * the caller. Fabricated `Person` data is both misleading and a structured-data
 * policy violation.
 */
export function personSchema({
  name,
  role,
  locale,
}: {
  name: string;
  role: string;
  locale: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
    jobTitle: role,
    worksFor: { "@id": `${SITE_URL}/#organization` },
    url: localeUrl(locale),
  };
}
