import type { SiteId } from "@/enums";
import { SITE_EMAIL, SITE_SAME_AS, localeUrl, pageUrl, siteUrl } from "@/lib/site";
import { DEFAULT_SITE, siteConfig } from "@/lib/sites";
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
  /** Offer catalog. Omitted from the node when empty. */
  services?: ServiceItem[];
  /** Areas of expertise. Omitted from the node when empty. */
  technologies?: string[];
  domains?: string[];
  site?: SiteId;
}

/**
 * ProfessionalService/Organization node — the primary entity for search and
 * generative engines. Includes a service catalog and areas of expertise so
 * LLMs can answer "what does SofinWave do" accurately.
 */
export function organizationSchema({
  locale,
  description,
  services = [],
  technologies = [],
  domains = [],
  site = DEFAULT_SITE.id,
}: OrgArgs) {
  const config = siteConfig(site);
  const origin = siteUrl(site);
  const expertise = [...technologies, ...domains];

  return {
    "@context": "https://schema.org",
    "@type": config.schemaType,
    "@id": `${origin}/#organization`,
    name: config.name,
    url: localeUrl(locale, site),
    logo: `${origin}/icon.png`,
    image: `${origin}/icon.png`,
    email: SITE_EMAIL,
    description,
    inLanguage: locale,
    sameAs: SITE_SAME_AS,
    areaServed: [
      { "@type": "Country", name: "Vietnam" },
      { "@type": "Place", name: "Worldwide" },
    ],
    // Only emitted when the site actually has them. Borrowing another
    // vertical's catalog would misdescribe this entity to search and answer
    // engines, which is the whole reason the sites are separate.
    ...(expertise.length > 0 ? { knowsAbout: expertise } : {}),
    ...(services.length > 0
      ? {
          hasOfferCatalog: {
            "@type": "OfferCatalog",
            name: config.name,
            itemListElement: services.map((s) => ({
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: s.title,
                description: s.description,
              },
            })),
          },
        }
      : {}),
  };
}

/** WebSite node linking pages to the publisher entity. */
export function websiteSchema(locale: string, site: SiteId = DEFAULT_SITE.id) {
  const origin = siteUrl(site);

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${origin}/#website`,
    url: localeUrl(locale, site),
    name: siteConfig(site).name,
    inLanguage: locale,
    publisher: { "@id": `${origin}/#organization` },
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
  site: SiteId = DEFAULT_SITE.id,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbTrail(site, path).map((route, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: nameFor(route),
      item: pageUrl(locale, route.path, site),
    })),
  };
}

/** WebPage node binding a page to the site and publisher entities. */
export function webPageSchema({
  locale,
  path,
  title,
  description,
  site = DEFAULT_SITE.id,
}: {
  locale: string;
  path: string;
  title: string;
  description: string;
  site?: SiteId;
}) {
  const url = pageUrl(locale, path, site);
  const origin = siteUrl(site);

  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: title,
    description,
    inLanguage: locale,
    isPartOf: { "@id": `${origin}/#website` },
    about: { "@id": `${origin}/#organization` },
    publisher: { "@id": `${origin}/#organization` },
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
  site = DEFAULT_SITE.id,
}: {
  locale: string;
  path: string;
  name: string;
  description: string;
  serviceType: string;
  site?: SiteId;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${pageUrl(locale, path, site)}#service`,
    name,
    description,
    serviceType,
    url: pageUrl(locale, path, site),
    provider: { "@id": `${siteUrl(site)}/#organization` },
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
  site = DEFAULT_SITE.id,
}: {
  name: string;
  role: string;
  locale: string;
  site?: SiteId;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
    jobTitle: role,
    worksFor: { "@id": `${siteUrl(site)}/#organization` },
    url: localeUrl(locale, site),
  };
}
