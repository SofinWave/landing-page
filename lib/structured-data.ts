import type { SiteId } from "@/enums";
import { routing } from "@/i18n/routing";
import { SITE_EMAIL, SITE_SAME_AS, localeUrl, pageUrl, siteUrl } from "@/lib/site";
import { DEFAULT_SITE, type SiteConfig, siblingSites, siteConfig } from "@/lib/sites";
import {
  CONTENT_LAST_MODIFIED,
  type RouteDef,
  breadcrumbTrail,
  findRoute,
  routeLastModified,
} from "@/lib/routes";

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
 * Reference to another site's Organization node.
 *
 * Carries `name` and `url` alongside the `@id` rather than the bare `@id` a
 * same-document reference would use: the node it points at lives on a
 * different hostname, so a consumer that fetched only this page has nothing to
 * resolve the identifier against.
 */
function orgRef(config: SiteConfig, locale: string) {
  return {
    "@type": config.schemaType,
    "@id": `${siteUrl(config.id)}/#organization`,
    name: config.name,
    url: localeUrl(locale, config.id),
  };
}

/**
 * ProfessionalService/Organization node — the primary entity for search and
 * generative engines. Includes a service catalog and areas of expertise so
 * LLMs can answer "what does SofinWave do" accurately.
 *
 * The four sites are separate hostnames, so nothing in the markup would
 * otherwise say they belong to one organization. The apex declares the other
 * three as `subOrganization`; each of those points back with
 * `parentOrganization`. Only the relationship is shared — a site still emits
 * its own catalog and expertise and never borrows another vertical's.
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
    ...(site === DEFAULT_SITE.id
      ? { subOrganization: siblingSites(site).map((sibling) => orgRef(sibling, locale)) }
      : { parentOrganization: orgRef(DEFAULT_SITE, locale) }),
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

/**
 * WebPage node binding a page to the site and publisher entities.
 *
 * `dateModified` comes from the route registry, the same source the sitemap
 * reads. Answer engines weigh how current a page is when they decide what to
 * cite, and nothing else in the markup carried a date.
 */
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
  const route = findRoute(site, path);

  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: title,
    description,
    inLanguage: locale,
    dateModified: route ? routeLastModified(route) : CONTENT_LAST_MODIFIED,
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
    // Derived from the routing config so adding a locale cannot leave this
    // claiming the site is offered in fewer languages than it actually is.
    availableLanguage: [...routing.locales],
  };
}

/**
 * schema.org application categories, keyed by the product's untranslated `key`
 * in the message catalog. The category is a vocabulary term, not copy, so it
 * does not belong in the catalogs.
 */
const PRODUCT_CATEGORIES: Record<string, string> = {
  smartfintrack: "FinanceApplication",
  tuvidauso: "LifestyleApplication",
};

/**
 * SoftwareApplication node for one of our own products.
 *
 * Name, description, and URL come from the same catalog entry the page renders,
 * so the schema cannot drift from the visible copy. No rating and no review —
 * we have no real ones, and inventing them is a policy violation as well as a
 * lie.
 */
export function softwareApplicationSchema({
  key,
  name,
  description,
  url,
  site = DEFAULT_SITE.id,
}: {
  key: string;
  name: string;
  description: string;
  url: string;
  site?: SiteId;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${url}#software`,
    name,
    description,
    url,
    applicationCategory: PRODUCT_CATEGORIES[key] ?? "UtilitiesApplication",
    operatingSystem: "Web",
    // Hardcoded to the languages the products actually support (both catalog
    // entries specify "languages": "Vietnamese / English"). Not derived from
    // routing.locales — inLanguage describes this product's support, not the
    // site's locales. Adding a new site locale (e.g., Chinese) cannot change
    // what languages a product actually offers.
    inLanguage: ["vi", "en"],
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "VND",
    },
    publisher: { "@id": `${siteUrl(site)}/#organization` },
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
