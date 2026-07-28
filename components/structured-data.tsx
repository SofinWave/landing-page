import { getTranslations } from "next-intl/server";
import type { ContentPageData } from "@/components/content-page";
import { SiteId } from "@/enums";
import { findRoute } from "@/lib/routes";
import { DEFAULT_SITE, siteConfig } from "@/lib/sites";
import {
  breadcrumbSchema,
  faqSchema,
  organizationSchema,
  personSchema,
  serviceSchema,
  webPageSchema,
  websiteSchema,
} from "@/lib/structured-data";

function jsonLd(graph: unknown[]) {
  return (
    <script
      type="application/ld+json"
      // Content is derived from our own translation files, not user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}

/**
 * Injects JSON-LD (Organization, WebSite, FAQPage) into the page for search
 * engines and generative/answer engines. Server component — reads localized
 * content and serializes it into a single application/ld+json graph.
 */
export async function StructuredData({
  locale,
  site = DEFAULT_SITE.id,
}: {
  locale: string;
  site?: SiteId;
}) {
  const config = siteConfig(site);
  const tMeta = await getTranslations({ locale, namespace: config.metaNamespace });

  // The tech site's landing page carries a bespoke service catalog, expertise
  // list, FAQ, and team roster in its own namespaces. The other verticals have
  // none of that, and must not inherit it — a media or finance Organization
  // advertising software-consulting offers would misdescribe the entity.
  if (site !== SiteId.Tech) {
    return jsonLd([
      organizationSchema({ locale, description: tMeta("description"), site }),
      websiteSchema(locale, site),
    ]);
  }

  const [tServices, tTech, tFaq, tTeam] = await Promise.all([
    getTranslations({ locale, namespace: "services" }),
    getTranslations({ locale, namespace: "tech" }),
    getTranslations({ locale, namespace: "faq" }),
    getTranslations({ locale, namespace: "team" }),
  ]);

  const services = tServices.raw("items") as { title: string; description: string }[];
  const technologies = tTech.raw("technologies") as string[];
  const domains = tTech.raw("domains") as string[];
  const faqItems = tFaq.raw("items") as { question: string; answer: string }[];
  const members = tTeam.raw("members") as { name: string; role: string }[];

  return jsonLd([
    organizationSchema({
      locale,
      description: tMeta("description"),
      services,
      technologies,
      domains,
      site,
    }),
    websiteSchema(locale, site),
    faqSchema(faqItems),
    // Only real, named people get a Person node — placeholder roster entries are
    // skipped rather than published as if they were staff.
    ...members
      .filter((m) => !PLACEHOLDER_NAMES.has(m.name.trim().toLowerCase()))
      .map((m) => personSchema({ name: m.name, role: m.role, locale, site })),
  ]);
}

/** Roster placeholders that must never be emitted as schema.org `Person`. */
const PLACEHOLDER_NAMES = new Set(["team member", "tbd", "coming soon"]);

/**
 * JSON-LD for a content page: WebPage, BreadcrumbList, its FAQ, and — for
 * routes under `/services` — a Service node carrying the targeted query.
 */
export async function PageStructuredData({
  locale,
  path,
  data,
  site,
}: {
  locale: string;
  path: string;
  data: ContentPageData;
  site: SiteId;
}) {
  const t = await getTranslations({ locale, namespace: siteConfig(site).contentNamespace });

  const graph: unknown[] = [
    webPageSchema({ locale, path, title: data.metaTitle, description: data.metaDescription, site }),
    breadcrumbSchema(locale, path, (route) => t(`${route.key}.title`), site),
  ];

  if (data.faq.length > 0) graph.push(faqSchema(data.faq));

  if (path.startsWith("services/") && findRoute(site, path)) {
    graph.push(
      serviceSchema({
        locale,
        path,
        name: data.title,
        description: data.metaDescription,
        serviceType: data.metaTitle,
        site,
      }),
    );
  }

  return jsonLd(graph);
}
